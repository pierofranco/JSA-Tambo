import type { Router } from '../http';
import { sendJson, readBody, HttpError } from '../http';
import { query } from '../db';
import { verifyPassword, signSession, setSessionCookie, clearSessionCookie, SessionUser, Rol } from '../auth';

const attempts = new Map<string, { count: number; firstAttemptAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 8;

function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now });
    return;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_ATTEMPTS) {
    throw new HttpError(429, 'Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos.');
  }
}

function resetRateLimit(key: string) {
  attempts.delete(key);
}

export function registerAuthRoutes(router: Router) {
  router.post('/api/auth/login', async ({ req, res }) => {
    const body = await readBody(req);
    // Normalizado a minúsculas para que "admin"/"Admin"/"ADMIN" siempre
    // resuelvan a la misma cuenta (coincide con el índice único de la BD
    // sobre LOWER(username)).
    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '');
    const ip = req.socket?.remoteAddress || 'unknown';
    const rateLimitKey = `${username.toLowerCase()}|${ip}`;

    checkRateLimit(rateLimitKey);

    if (!username || !password) {
      throw new HttpError(400, 'Usuario y contraseña son requeridos.');
    }

    const result = await query<{
      id: number;
      username: string;
      password_hash: string;
      rol: Rol;
      nombre_completo: string;
      activo: boolean;
    }>('SELECT id, username, password_hash, rol, nombre_completo, activo FROM usuarios WHERE LOWER(username) = $1', [
      username
    ]);
    const row = result.rows[0];

    // Mensaje genérico en ambos casos (usuario inexistente / contraseña
    // incorrecta) para no revelar qué usuarios existen (user enumeration).
    const genericError = new HttpError(401, 'Usuario o contraseña incorrectos.');
    if (!row) throw genericError;
    if (!row.activo) throw new HttpError(403, 'Este usuario está desactivado. Contacta al administrador.');

    const passwordOk = await verifyPassword(password, row.password_hash);
    if (!passwordOk) throw genericError;

    resetRateLimit(rateLimitKey);

    const sessionUser: SessionUser = {
      id: row.id,
      username: row.username,
      rol: row.rol,
      nombreCompleto: row.nombre_completo
    };
    const token = signSession(sessionUser);
    setSessionCookie(res, token);
    sendJson(res, 200, sessionUser);
  });

  router.post('/api/auth/logout', async ({ res }) => {
    clearSessionCookie(res);
    sendJson(res, 200, { success: true });
  });

  router.get('/api/auth/me', async ({ res, user }) => {
    if (!user) {
      sendJson(res, 401, { message: 'No autenticado.' });
      return;
    }
    // Revalida contra la BD (igual que requireAuth) para reflejar de
    // inmediato una desactivación hecha por el administrador.
    const result = await query<{ activo: boolean; rol: Rol; nombre_completo: string }>(
      'SELECT activo, rol, nombre_completo FROM usuarios WHERE id = $1',
      [user.id]
    );
    const row = result.rows[0];
    if (!row || !row.activo) {
      sendJson(res, 401, { message: 'Sesión inválida o usuario desactivado.' });
      return;
    }
    sendJson(res, 200, { id: user.id, username: user.username, rol: row.rol, nombreCompleto: row.nombre_completo });
  });
}
