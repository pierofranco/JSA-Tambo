import type { Router } from '../http';
import { sendJson, readBody, HttpError } from '../http';
import { query } from '../db';
import { requireAuth } from '../auth';

function isUniqueViolation(err: any): boolean {
  return err?.code === '23505';
}

export function registerCategoriasRoutes(router: Router) {
  // Lectura pública: el catálogo de categorías no es información sensible y
  // alimenta la página pública /servicios-rest.
  router.get('/api/categorias', async ({ res }) => {
    const result = await query('SELECT id, nombre, prefijo FROM categorias ORDER BY nombre');
    sendJson(res, 200, result.rows);
  });

  router.post('/api/categorias', async ({ req, res, user }) => {
    await requireAuth(user, ['ADMIN']);
    const body = await readBody(req);
    const nombre = String(body.nombre || '').trim();
    const prefijo = String(body.prefijo || '')
      .trim()
      .toUpperCase();

    if (nombre.length < 2 || nombre.length > 40) {
      throw new HttpError(400, 'El nombre de la categoría debe tener entre 2 y 40 caracteres.');
    }
    if (!/^[A-Z]{2,5}$/.test(prefijo)) {
      throw new HttpError(400, 'El prefijo debe tener entre 2 y 5 letras (ej. BEB, SNK).');
    }

    try {
      const result = await query(
        'INSERT INTO categorias (nombre, prefijo) VALUES ($1, $2) RETURNING id, nombre, prefijo',
        [nombre, prefijo]
      );
      sendJson(res, 201, result.rows[0]);
    } catch (err: any) {
      if (isUniqueViolation(err)) throw new HttpError(409, 'Ya existe una categoría con ese nombre o prefijo.');
      throw err;
    }
  });
}
