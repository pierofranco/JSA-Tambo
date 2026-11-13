import type { Router } from '../http';
import { sendJson, readBody, HttpError } from '../http';
import { query, withTransaction } from '../db';
import { requireAuth } from '../auth';
import { consultarRucReal } from '../decolecta';

function isUniqueViolation(err: any): boolean {
  return err?.code === '23505';
}

/**
 * Celular peruano: 9 dígitos exactos, siempre empieza en 9, y no todo el
 * mismo dígito repetido (ej. 999999999), para rechazar números inventados.
 */
function validarCelular(telefono: string | null): string | null {
  if (!telefono) return null;
  if (!/^9\d{8}$/.test(telefono) || /^(\d)\1{8}$/.test(telefono)) {
    throw new HttpError(400, 'El celular debe tener 9 dígitos y empezar con 9 (ej. 987654321).');
  }
  return telefono;
}

export function registerProveedoresRoutes(router: Router) {
  router.get('/api/proveedores', async ({ res, user }) => {
    await requireAuth(user, ['ADMIN']);
    const proveedores = await query(
      'SELECT id, ruc, razon_social AS "razonSocial", telefono, email FROM proveedores ORDER BY razon_social'
    );
    const productos = await query(`
      SELECT pp.proveedor_id AS "proveedorId", pp.producto_id AS "productoId", pp.precio_referencial AS "precioReferencial",
             p.nombre, p.id AS codigo
      FROM proveedor_productos pp
      JOIN productos p ON p.id = pp.producto_id
    `);
    const porProveedor = new Map<number, any[]>();
    for (const row of productos.rows) {
      const list = porProveedor.get(row.proveedorId) || [];
      list.push(row);
      porProveedor.set(row.proveedorId, list);
    }
    const data = proveedores.rows.map((p) => ({ ...p, productos: porProveedor.get(p.id) || [] }));
    sendJson(res, 200, data);
  });

  router.post('/api/proveedores', async ({ req, res, user }) => {
    await requireAuth(user, ['ADMIN']);
    const body = await readBody(req);
    const ruc = String(body.ruc || '').trim();
    const telefono = validarCelular(body.telefono ? String(body.telefono).trim() : null);
    const email = body.email ? String(body.email).trim() : null;

    const info = await consultarRucReal(ruc);

    try {
      const result = await query(
        `INSERT INTO proveedores (ruc, razon_social, telefono, email)
         VALUES ($1, $2, $3, $4)
         RETURNING id, ruc, razon_social AS "razonSocial", telefono, email`,
        [info.ruc, info.razonSocial, telefono, email]
      );
      sendJson(res, 201, { ...result.rows[0], productos: [] });
    } catch (err: any) {
      if (isUniqueViolation(err)) throw new HttpError(409, 'Ya existe un proveedor con ese RUC.');
      throw err;
    }
  });

  router.put('/api/proveedores/:id', async ({ req, res, params, user }) => {
    await requireAuth(user, ['ADMIN']);
    const id = Number(params.id);
    const body = await readBody(req);
    const telefono = validarCelular(body.telefono ? String(body.telefono).trim() : null);
    const email = body.email ? String(body.email).trim() : null;

    const result = await query(
      `UPDATE proveedores SET telefono = $1, email = $2 WHERE id = $3
       RETURNING id, ruc, razon_social AS "razonSocial", telefono, email`,
      [telefono, email, id]
    );
    if (!result.rows[0]) throw new HttpError(404, 'Proveedor no encontrado.');
    sendJson(res, 200, result.rows[0]);
  });

  router.put('/api/proveedores/:id/productos', async ({ req, res, params, user }) => {
    await requireAuth(user, ['ADMIN']);
    const proveedorId = Number(params.id);
    const body = await readBody(req);
    const items: Array<{ productoId: string; precioReferencial?: number }> = Array.isArray(body.productos)
      ? body.productos
      : [];

    await withTransaction(async (client) => {
      const proveedor = await client.query('SELECT id FROM proveedores WHERE id = $1 FOR UPDATE', [proveedorId]);
      if (!proveedor.rows[0]) throw new HttpError(404, 'Proveedor no encontrado.');

      await client.query('DELETE FROM proveedor_productos WHERE proveedor_id = $1', [proveedorId]);
      for (const item of items) {
        if (!item.productoId) continue;
        await client.query(
          'INSERT INTO proveedor_productos (proveedor_id, producto_id, precio_referencial) VALUES ($1, $2, $3)',
          [proveedorId, item.productoId, item.precioReferencial ?? null]
        );
      }
    });

    sendJson(res, 200, { success: true });
  });

  router.delete('/api/proveedores/:id', async ({ res, params, user }) => {
    await requireAuth(user, ['ADMIN']);
    const result = await query('DELETE FROM proveedores WHERE id = $1 RETURNING id', [Number(params.id)]);
    if (!result.rows[0]) throw new HttpError(404, 'Proveedor no encontrado.');
    sendJson(res, 200, { success: true });
  });
}
