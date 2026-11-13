import type { IncomingMessage, ServerResponse } from 'http';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Parser/serializador de cookies mínimo y propio: evitamos la dependencia
// `cookie` porque el bundler de configuración de Vite (esbuild, en el proceso
// de Node que carga vite.config.ts) falla al interoperar con su export
// CommonJS en este entorno ("exports is not defined in ES module scope").
// La lógica de un Cookie/Set-Cookie simple no amerita arrastrar ese riesgo.
function parseCookie(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const rawValue = pair.slice(idx + 1).trim();
    if (!key) return;
    try {
      out[key] = decodeURIComponent(rawValue);
    } catch {
      out[key] = rawValue;
    }
  });
  return out;
}

function serializeCookie(name: string, value: string, options: { httpOnly?: boolean; sameSite?: 'lax' | 'strict'; path?: string; maxAge?: number }): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite === 'lax' ? 'Lax' : 'Strict'}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join('; ');
}
import { HttpError } from './http';
import { query } from './db';

const COOKIE_NAME = 'tambopos_session';
const TOKEN_TTL_SECONDS = 2 * 60 * 60; // 2h: ventana máxima en la que un usuario
// desactivado/eliminado por el admin sigue teniendo un JWT formalmente válido.
// requireAuth() revalida activo/rol contra la BD en cada request sensible, así
// que esto solo acota el costo de un JWT robado, no la desactivación real.

export type Rol = 'ADMIN' | 'CAJERO';

export interface SessionUser {
  id: number;
  username: string;
  rol: Rol;
  nombreCompleto: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está configurado. Revisa el archivo .env.');
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSession(user: SessionUser): string {
  return jwt.sign(user, getSecret(), { expiresIn: TOKEN_TTL_SECONDS });
}

export function setSessionCookie(res: ServerResponse, token: string) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: TOKEN_TTL_SECONDS
    })
  );
}

export function clearSessionCookie(res: ServerResponse) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
  );
}

export function getSessionUser(req: IncomingMessage): SessionUser | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const cookies = parseCookie(header);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, getSecret()) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Revalida la sesión contra la base de datos (no solo el JWT) en cada llamada:
 * así una desactivación o eliminación de usuario por el administrador surte
 * efecto de inmediato, y no solo cuando expira el token.
 */
export async function requireAuth(user: SessionUser | null, roles?: Rol[]): Promise<SessionUser> {
  if (!user) throw new HttpError(401, 'No autenticado.');

  const result = await query<{ activo: boolean; rol: Rol; nombre_completo: string }>(
    'SELECT activo, rol, nombre_completo FROM usuarios WHERE id = $1',
    [user.id]
  );
  const row = result.rows[0];
  if (!row || !row.activo) {
    throw new HttpError(401, 'Sesión inválida o usuario desactivado.');
  }
  if (roles && !roles.includes(row.rol)) {
    throw new HttpError(403, 'No tienes permisos para realizar esta acción.');
  }
  return { ...user, rol: row.rol, nombreCompleto: row.nombre_completo };
}
