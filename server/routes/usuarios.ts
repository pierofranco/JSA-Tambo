import type { Router } from '../http';
import { sendJson, readBody, HttpError } from '../http';
import { query } from '../db';
import { requireAuth, hashPassword, Rol } from '../auth';
import { nombrePersonaInvalido, normalizarEspacios } from '../../shared/validators';

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,30}$/;
const VALID_ROLES: Rol[] = ['ADMIN', 'CAJERO'];

function isUniqueViolation(err: any): boolean {
  return err?.code === '23505';
}

async function countActiveAdmins(excludingId?: number): Promise<number> {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM usuarios WHERE rol = 'ADMIN' AND activo = true" +
      (excludingId ? ' AND id <> $1' : ''),
    excludingId ? [excludingId] : []
  );
  return Number(result.rows[0].count);
}

export function registerUsuariosRoutes(router: Router) {
  router.get('/api/usuarios', async ({ res, user }) => {
    await requireAuth(user, ['ADMIN']);
    const result = await query(
      'SELECT id, username, rol, nombre_completo AS "nombreCompleto", activo, created_at AS "createdAt" FROM usuarios ORDER BY rol, username'
    );
    sendJson(res, 200, result.rows);
  });

  router.post('/api/usuarios', async ({ req, res, user }) => {
    await requireAuth(user, ['ADMIN']);
    const body = await readBody(req);
    // Normalizado a minúsculas: evita crear "ADMIN" como un usuario distinto
    // de "admin" (suplantación por mayúsculas/minúsculas).
    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '');
    const nombreCompleto = normalizarEspacios(String(body.nombreCompleto || ''));
    const rol = body.rol as Rol;

    if (!USERNAME_RE.test(username)) {
      throw new HttpError(400, 'El usuario debe tener 3-30 caracteres (letras, números, ._-).');
    }
    if (password.length < 6) {
      throw new HttpError(400, 'La contraseña debe tener al menos 6 caracteres.');
    }
    const errorNombre = nombrePersonaInvalido(nombreCompleto);
    if (errorNombre) {
      throw new HttpError(400, errorNombre);
    }
    if (!VALID_ROLES.includes(rol)) {
      throw new HttpError(400, 'Rol inválido. Debe ser ADMIN o CAJERO.');
    }

    const passwordHash = await hashPassword(password);
    try {
      const result = await query(
        `INSERT INTO usuarios (username, password_hash, rol, nombre_completo, activo)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, username, rol, nombre_completo AS "nombreCompleto", activo, created_at AS "createdAt"`,
        [username, passwordHash, rol, nombreCompleto]
      );
      sendJson(res, 201, result.rows[0]);
    } catch (err: any) {
      if (isUniqueViolation(err)) throw new HttpError(409, 'Ese nombre de usuario ya existe.');
      throw err;
    }
  });

  router.put('/api/usuarios/:id', async ({ req, res, params, user }) => {
    const current = await requireAuth(user, ['ADMIN']);
    const id = Number(params.id);
    const body = await readBody(req);

    if (typeof body.activo !== 'boolean') {
      throw new HttpError(400, 'Debes indicar el campo "activo" (true/false).');
    }
    if (!body.activo && id === current.id) {
      throw new HttpError(400, 'No puedes desactivar tu propia cuenta.');
    }
    if (!body.activo) {
      const target = await query<{ rol: Rol }>('SELECT rol FROM usuarios WHERE id = $1', [id]);
      if (target.rows[0]?.rol === 'ADMIN' && (await countActiveAdmins(id)) === 0) {
        throw new HttpError(400, 'No puedes desactivar al último administrador activo.');
      }
    }

    const result = await query(
      `UPDATE usuarios SET activo = $1 WHERE id = $2
       RETURNING id, username, rol, nombre_completo AS "nombreCompleto", activo, created_at AS "createdAt"`,
      [body.activo, id]
    );
    if (!result.rows[0]) throw new HttpError(404, 'Usuario no encontrado.');
    sendJson(res, 200, result.rows[0]);
  });

  router.put('/api/usuarios/:id/password', async ({ req, res, params, user }) => {
    await requireAuth(user, ['ADMIN']);
    const id = Number(params.id);
    const body = await readBody(req);
    const password = String(body.password || '');
    if (password.length < 6) {
      throw new HttpError(400, 'La contraseña debe tener al menos 6 caracteres.');
    }
    const passwordHash = await hashPassword(password);
    const result = await query('UPDATE usuarios SET password_hash = $1 WHERE id = $2 RETURNING id', [
      passwordHash,
      id
    ]);
    if (!result.rows[0]) throw new HttpError(404, 'Usuario no encontrado.');
    sendJson(res, 200, { success: true });
  });

  router.delete('/api/usuarios/:id', async ({ res, params, user }) => {
    const current = await requireAuth(user, ['ADMIN']);
    const id = Number(params.id);
    if (id === current.id) {
      throw new HttpError(400, 'No puedes eliminar tu propia cuenta.');
    }
    const target = await query<{ rol: Rol }>('SELECT rol FROM usuarios WHERE id = $1', [id]);
    if (target.rows[0]?.rol === 'ADMIN' && (await countActiveAdmins(id)) === 0) {
      throw new HttpError(400, 'No puedes eliminar al último administrador activo.');
    }
    const result = await query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
    if (!result.rows[0]) throw new HttpError(404, 'Usuario no encontrado.');
    sendJson(res, 200, { success: true });
  });
}
