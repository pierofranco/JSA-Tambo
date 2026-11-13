import type { Router } from '../http';
import { sendJson, readBody, HttpError } from '../http';
import { query, withTransaction } from '../db';
import { requireAuth } from '../auth';
import { consultarRucReal, consultarDniReal } from '../decolecta';
import { calcularImpuestoDesdeTotal } from '../../shared/tax';

// Mismos cupones que existían en el mock original (src/data/initialProducts.ts).
// No es información sensible ni requiere tabla propia.
const CUPONES_VALIDOS: Record<string, number> = {
  '18892': 5.0,
  '18893': 10.0,
  '18894': 15.0,
  TAMBO20: 20.0,
  REACT2026: 25.0
};

interface VentaItemInput {
  id: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotalItem: number;
}

function formatFechaHora(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fecha = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  const hora = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return { fecha, hora };
}

export function registerVentasRoutes(router: Router) {
  router.get('/api/cupones/:codigo', async ({ res, params, user }) => {
    await requireAuth(user, ['ADMIN', 'CAJERO']);
    const codigo = params.codigo.trim().toUpperCase();
    if (!codigo || codigo.length > 30) {
      throw new HttpError(400, 'Código de cupón inválido.');
    }
    const descuento = CUPONES_VALIDOS[codigo];
    if (descuento) {
      sendJson(res, 200, { valido: true, descuento, mensaje: `Cupón válido: Descuento de S/ ${descuento.toFixed(2)}` });
    } else {
      sendJson(res, 200, { valido: false, descuento: 0, mensaje: 'El código de cupón no existe o ha expirado.' });
    }
  });

  router.get('/api/ventas', async ({ res, user }) => {
    await requireAuth(user, ['ADMIN', 'CAJERO']);
    const ventas = await query(`
      SELECT id, correlativo, fecha, hora, comprobante,
             cliente_tipo_doc AS "clienteTipoDoc", cliente_num_doc AS "clienteNumDoc",
             cliente_ruc AS "clienteRuc", cliente_razon_social AS "clienteRazonSocial",
             total_productos AS "totalProductos", descuento_total AS "descuentoTotal",
             descuento_cupon AS "descuentoCupon", cupon_codigo AS "cuponCodigo",
             subtotal_final AS "subtotalFinal", igv
      FROM ventas ORDER BY created_at DESC
    `);
    const items = await query(`
      SELECT venta_id AS "ventaId", producto_id AS id, nombre_producto AS producto,
             cantidad, precio_unitario AS "precioUnitario", subtotal AS "subtotalItem"
      FROM ventas_items
    `);
    const itemsPorVenta = new Map<string, any[]>();
    for (const item of items.rows) {
      const list = itemsPorVenta.get(item.ventaId) || [];
      list.push(item);
      itemsPorVenta.set(item.ventaId, list);
    }
    const data = ventas.rows.map((v) => ({
      ...v,
      cliente: {
        tipoDoc: v.clienteTipoDoc,
        numeroDoc: v.clienteNumDoc,
        ruc: v.clienteRuc,
        razonSocial: v.clienteRazonSocial
      },
      itemsComprados: itemsPorVenta.get(v.id) || []
    }));
    sendJson(res, 200, data);
  });

  router.post('/api/ventas', async ({ req, res, user }) => {
    await requireAuth(user, ['ADMIN', 'CAJERO']);
    const body = await readBody(req);
    const items: VentaItemInput[] = Array.isArray(body.itemsComprados) ? body.itemsComprados : [];
    if (items.length === 0) throw new HttpError(400, 'El carrito está vacío.');

    const comprobante = body.comprobante === 'FACTURA' ? 'FACTURA' : 'BOLETA';
    const cliente = body.cliente || {};

    // Re-validación del lado del servidor: la UI ya exige esto antes de
    // habilitar "Procesar Pago", pero un cliente no debe ser la única barrera
    // para datos que terminan en un comprobante fiscal. Se vuelve a consultar
    // RENIEC/SUNAT aquí para que esta regla no dependa solo del frontend.
    if (comprobante === 'FACTURA') {
      if (!cliente.ruc || !/^\d{11}$/.test(cliente.ruc)) {
        throw new HttpError(400, 'El RUC debe tener exactamente 11 dígitos.');
      }
      await consultarRucReal(cliente.ruc);
    } else if (cliente.tipoDoc === 'DNI') {
      if (!cliente.numeroDoc || !/^\d{8}$/.test(cliente.numeroDoc)) {
        throw new HttpError(400, 'El DNI debe tener 8 dígitos.');
      }
      await consultarDniReal(cliente.numeroDoc);
    } else if (cliente.tipoDoc === 'CE') {
      if (!cliente.numeroDoc || !/^\d{9}$/.test(cliente.numeroDoc)) {
        throw new HttpError(400, 'El Carné de Extranjería debe tener 9 dígitos.');
      }
    }

    const { fecha, hora } = formatFechaHora(new Date());

    // El IGV SIEMPRE se recalcula aquí a partir del total final — nunca se
    // confía en el `igv` que mande el cliente para un comprobante fiscal.
    const subtotalFinal = Number(body.subtotalFinal) || 0;
    const { igv } = calcularImpuestoDesdeTotal(subtotalFinal);

    const ventaId = await withTransaction(async (client) => {
      const countResult = await client.query(
        "SELECT COUNT(*)::int AS count FROM ventas WHERE comprobante = $1",
        [comprobante]
      );
      const numCorrelativo = Number(countResult.rows[0].count) + 1;
      const prefijo = comprobante === 'FACTURA' ? 'F001' : 'B001';
      const correlativo = `${prefijo}-${String(numCorrelativo).padStart(8, '0')}`;
      const id = `VNT-${Date.now()}`;

      await client.query(
        `INSERT INTO ventas (id, correlativo, fecha, hora, comprobante, cliente_tipo_doc, cliente_num_doc,
           cliente_ruc, cliente_razon_social, total_productos, descuento_total, descuento_cupon,
           cupon_codigo, subtotal_final, igv)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          id,
          correlativo,
          fecha,
          hora,
          comprobante,
          cliente.tipoDoc ?? null,
          cliente.numeroDoc ?? null,
          cliente.ruc ?? null,
          cliente.razonSocial ?? null,
          Number(body.totalProductos) || 0,
          Number(body.descuentoTotal) || 0,
          Number(body.descuentoCupon) || 0,
          body.cuponCodigo ?? null,
          subtotalFinal,
          igv
        ]
      );

      for (const item of items) {
        await client.query(
          `INSERT INTO ventas_items (venta_id, producto_id, nombre_producto, cantidad, precio_unitario, subtotal)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [id, item.id, item.producto, item.cantidad, item.precioUnitario, item.subtotalItem]
        );
        await client.query('UPDATE productos SET stock = GREATEST(0, stock - $1) WHERE id = $2', [
          item.cantidad,
          item.id
        ]);
      }

      return id;
    });

    const result = await query(
      `SELECT id, correlativo, fecha, hora, comprobante,
              cliente_tipo_doc AS "clienteTipoDoc", cliente_num_doc AS "clienteNumDoc",
              cliente_ruc AS "clienteRuc", cliente_razon_social AS "clienteRazonSocial",
              total_productos AS "totalProductos", descuento_total AS "descuentoTotal",
              descuento_cupon AS "descuentoCupon", cupon_codigo AS "cuponCodigo",
              subtotal_final AS "subtotalFinal", igv
       FROM ventas WHERE id = $1`,
      [ventaId]
    );
    const venta = result.rows[0];
    sendJson(res, 201, {
      ...venta,
      cliente: {
        tipoDoc: venta.clienteTipoDoc,
        numeroDoc: venta.clienteNumDoc,
        ruc: venta.clienteRuc,
        razonSocial: venta.clienteRazonSocial
      },
      itemsComprados: items
    });
  });
}
