import type { Router } from '../http';
import { sendJson, readBody, HttpError } from '../http';
import { query, withTransaction } from '../db';
import { requireAuth } from '../auth';
import { nombreProductoInvalido, normalizarEspacios } from '../../shared/validators';

const PRODUCTO_SELECT = `
  SELECT p.id, p.nombre, c.nombre AS categoria, p.precio_regular AS "precioRegular",
         p.precio_oferta AS "precioOferta", p.stock, p.porcentaje_descuento AS "porcentajeDescuento",
         p.es_prime AS "esPrime", p.imagen_url AS "imagenUrl"
  FROM productos p
  JOIN categorias c ON c.id = p.categoria_id
`;

function computeDescuento(precioRegular: number, precioOferta: number): number {
  if (precioRegular > precioOferta && precioRegular > 0) {
    return Math.round(((precioRegular - precioOferta) / precioRegular) * 100);
  }
  return 0;
}

function validateProductoBody(body: any) {
  const nombre = normalizarEspacios(String(body.nombre || ''));
  const precioRegular = Number(body.precioRegular);
  const precioOferta = Number(body.precioOferta);
  const stock = Number(body.stock);
  const esPrime = Boolean(body.esPrime);
  const categoriaId = Number(body.categoriaId);

  const errorNombre = nombreProductoInvalido(nombre);
  if (errorNombre) throw new HttpError(400, errorNombre);
  if (!Number.isFinite(precioRegular) || precioRegular <= 0) {
    throw new HttpError(400, 'El precio regular debe ser mayor a 0.');
  }
  if (!Number.isFinite(precioOferta) || precioOferta <= 0) {
    throw new HttpError(400, 'El precio de oferta debe ser mayor a 0.');
  }
  if (precioOferta > precioRegular) {
    throw new HttpError(400, 'El precio de oferta no puede ser mayor al precio regular.');
  }
  if (!Number.isInteger(stock) || stock < 0) {
    throw new HttpError(400, 'El stock debe ser un número entero mayor o igual a 0.');
  }
  if (!Number.isFinite(categoriaId)) {
    throw new HttpError(400, 'Debes seleccionar una categoría válida.');
  }
  return { nombre, precioRegular, precioOferta, stock, esPrime, categoriaId };
}

export function registerProductosRoutes(router: Router) {
  // Lectura pública: catálogo de productos (nombres, precios, stock) no es
  // información sensible, y alimenta la página pública /servicios-rest.
  router.get('/api/productos', async ({ res, query: qs }) => {
    const categoria = qs.get('categoria') || undefined;
    const search = qs.get('search') || undefined;
    const clauses: string[] = [];
    const params: any[] = [];

    if (categoria && categoria !== 'Todas') {
      params.push(categoria);
      clauses.push(`c.nombre = $${params.length}`);
    }
    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      clauses.push(`(LOWER(p.nombre) LIKE $${params.length} OR LOWER(p.id) LIKE $${params.length})`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await query(`${PRODUCTO_SELECT} ${where} ORDER BY p.id`, params);
    sendJson(res, 200, result.rows);
  });

  router.get('/api/productos/:id', async ({ res, params }) => {
    const result = await query(`${PRODUCTO_SELECT} WHERE p.id = $1`, [params.id]);
    if (!result.rows[0]) throw new HttpError(404, `Producto con ID ${params.id} no encontrado (404)`);
    sendJson(res, 200, result.rows[0]);
  });

  router.post('/api/productos', async ({ req, res, user }) => {
    await requireAuth(user, ['ADMIN']);
    const body = await readBody(req);
    const data = validateProductoBody(body);
    const imagenUrl = String(body.imagenUrl || '/assets/img/default.jpg');
    const porcentajeDescuento = computeDescuento(data.precioRegular, data.precioOferta);

    const nuevo = await withTransaction(async (client) => {
      const categoriaResult = await client.query('SELECT prefijo FROM categorias WHERE id = $1 FOR UPDATE', [
        data.categoriaId
      ]);
      const categoria = categoriaResult.rows[0];
      if (!categoria) throw new HttpError(400, 'Categoría no encontrada.');

      const seqResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SPLIT_PART(id, '-', 2) AS INTEGER)), 0) AS max_seq
         FROM productos WHERE categoria_id = $1`,
        [data.categoriaId]
      );
      const nextSeq = Number(seqResult.rows[0].max_seq) + 1;
      const id = `${categoria.prefijo}-${String(nextSeq).padStart(3, '0')}`;

      await client.query(
        `INSERT INTO productos (id, nombre, categoria_id, precio_regular, precio_oferta, stock, porcentaje_descuento, es_prime, imagen_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, data.nombre, data.categoriaId, data.precioRegular, data.precioOferta, data.stock, porcentajeDescuento, data.esPrime, imagenUrl]
      );
      return id;
    });

    const created = await query(`${PRODUCTO_SELECT} WHERE p.id = $1`, [nuevo]);
    sendJson(res, 201, created.rows[0]);
  });

  router.put('/api/productos/:id', async ({ req, res, params, user }) => {
    await requireAuth(user, ['ADMIN']);
    const body = await readBody(req);
    const existing = await query('SELECT precio_regular, precio_oferta FROM productos WHERE id = $1', [params.id]);
    if (!existing.rows[0]) throw new HttpError(404, 'Producto no encontrado para actualizar (404)');

    const precioRegular = body.precioRegular !== undefined ? Number(body.precioRegular) : Number(existing.rows[0].precio_regular);
    const precioOferta = body.precioOferta !== undefined ? Number(body.precioOferta) : Number(existing.rows[0].precio_oferta);
    if (!Number.isFinite(precioRegular) || precioRegular <= 0 || !Number.isFinite(precioOferta) || precioOferta <= 0) {
      throw new HttpError(400, 'Los precios deben ser mayores a 0.');
    }
    if (precioOferta > precioRegular) {
      throw new HttpError(400, 'El precio de oferta no puede ser mayor al precio regular.');
    }
    const stock = body.stock !== undefined ? Number(body.stock) : undefined;
    if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
      throw new HttpError(400, 'El stock debe ser un número entero mayor o igual a 0.');
    }
    let nombre: string | null = null;
    if (body.nombre !== undefined) {
      nombre = normalizarEspacios(String(body.nombre));
      const errorNombre = nombreProductoInvalido(nombre);
      if (errorNombre) throw new HttpError(400, errorNombre);
    }
    const porcentajeDescuento = computeDescuento(precioRegular, precioOferta);

    const result = await query(
      `UPDATE productos SET
         nombre = COALESCE($1, nombre),
         categoria_id = COALESCE($2, categoria_id),
         precio_regular = $3,
         precio_oferta = $4,
         stock = COALESCE($5, stock),
         porcentaje_descuento = $6,
         es_prime = COALESCE($7, es_prime),
         imagen_url = COALESCE($8, imagen_url)
       WHERE id = $9
       RETURNING id`,
      [
        nombre,
        body.categoriaId ?? null,
        precioRegular,
        precioOferta,
        stock ?? null,
        porcentajeDescuento,
        typeof body.esPrime === 'boolean' ? body.esPrime : null,
        body.imagenUrl ?? null,
        params.id
      ]
    );
    if (!result.rows[0]) throw new HttpError(404, 'Producto no encontrado para actualizar (404)');

    const updated = await query(`${PRODUCTO_SELECT} WHERE p.id = $1`, [params.id]);
    sendJson(res, 200, updated.rows[0]);
  });

  router.delete('/api/productos/:id', async ({ res, params, user }) => {
    await requireAuth(user, ['ADMIN']);
    try {
      const result = await query('DELETE FROM productos WHERE id = $1 RETURNING id', [params.id]);
      if (!result.rows[0]) throw new HttpError(404, 'Producto no encontrado.');
      sendJson(res, 200, { success: true, id: params.id });
    } catch (err: any) {
      if (err?.code === '23503') {
        throw new HttpError(409, 'No se puede eliminar: el producto tiene compras o proveedores asociados.');
      }
      throw err;
    }
  });
}
