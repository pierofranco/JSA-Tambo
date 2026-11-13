import type { Router } from '../http';
import { sendJson, readBody, HttpError } from '../http';
import { query, withTransaction } from '../db';
import { requireAuth } from '../auth';

interface CompraItemInput {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

export function registerComprasRoutes(router: Router) {
  router.get('/api/compras', async ({ res, user }) => {
    await requireAuth(user, ['ADMIN']);
    const result = await query(`
      SELECT c.id, c.numero_documento AS "numeroDocumento", c.total, c.created_at AS "createdAt",
             p.razon_social AS "proveedorRazonSocial", u.nombre_completo AS "registradoPor"
      FROM compras c
      JOIN proveedores p ON p.id = c.proveedor_id
      JOIN usuarios u ON u.id = c.usuario_id
      ORDER BY c.created_at DESC
    `);
    sendJson(res, 200, result.rows);
  });

  router.post('/api/compras', async ({ req, res, user }) => {
    const current = await requireAuth(user, ['ADMIN']);
    const body = await readBody(req);
    const proveedorId = Number(body.proveedorId);
    const numeroDocumento = body.numeroDocumento ? String(body.numeroDocumento).trim() : null;
    const items: CompraItemInput[] = Array.isArray(body.items) ? body.items : [];

    if (!Number.isFinite(proveedorId)) throw new HttpError(400, 'Debes seleccionar un proveedor.');
    if (items.length === 0) throw new HttpError(400, 'Agrega al menos un producto a la compra.');
    for (const item of items) {
      if (!item.productoId) throw new HttpError(400, 'Cada ítem debe indicar un producto.');
      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        throw new HttpError(400, 'La cantidad de cada producto debe ser un entero mayor a 0.');
      }
      if (!Number.isFinite(item.precioUnitario) || item.precioUnitario <= 0) {
        throw new HttpError(400, 'El precio unitario de cada producto debe ser mayor a 0.');
      }
    }

    const total = items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);
    if (total <= 0) {
      throw new HttpError(400, 'El total de la compra debe ser mayor a 0.');
    }

    const compraId = await withTransaction(async (client) => {
      const proveedor = await client.query('SELECT id FROM proveedores WHERE id = $1', [proveedorId]);
      if (!proveedor.rows[0]) throw new HttpError(400, 'Proveedor no encontrado.');

      const compra = await client.query(
        `INSERT INTO compras (proveedor_id, numero_documento, usuario_id, total)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [proveedorId, numeroDocumento, current.id, total]
      );
      const id = compra.rows[0].id;

      for (const item of items) {
        const producto = await client.query('SELECT id FROM productos WHERE id = $1 FOR UPDATE', [item.productoId]);
        if (!producto.rows[0]) throw new HttpError(400, `Producto ${item.productoId} no encontrado.`);

        const subtotal = item.cantidad * item.precioUnitario;
        await client.query(
          `INSERT INTO compras_items (compra_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, item.productoId, item.cantidad, item.precioUnitario, subtotal]
        );
        await client.query('UPDATE productos SET stock = stock + $1 WHERE id = $2', [item.cantidad, item.productoId]);
      }

      return id;
    });

    sendJson(res, 201, { id: compraId, total });
  });
}
