import type { IncomingMessage, ServerResponse } from 'http';
import type { SessionUser } from './auth';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(new HttpError(400, 'JSON inválido en el cuerpo de la petición.'));
      }
    });
    req.on('error', reject);
  });
}

export interface RouteContext {
  req: IncomingMessage & { url: string; method: string };
  res: ServerResponse;
  params: Record<string, string>;
  query: URLSearchParams;
  user: SessionUser | null;
}

type Handler = (ctx: RouteContext) => Promise<void> | void;

interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  private add(method: string, path: string, handler: Handler) {
    const keys: string[] = [];
    const regexPath = path.replace(/:[A-Za-z0-9_]+/g, (match) => {
      keys.push(match.slice(1));
      return '([^/]+)';
    });
    this.routes.push({ method, pattern: new RegExp(`^${regexPath}$`), keys, handler });
  }

  get(path: string, handler: Handler) {
    this.add('GET', path, handler);
  }

  post(path: string, handler: Handler) {
    this.add('POST', path, handler);
  }

  put(path: string, handler: Handler) {
    this.add('PUT', path, handler);
  }

  delete(path: string, handler: Handler) {
    this.add('DELETE', path, handler);
  }

  async handle(req: IncomingMessage, res: ServerResponse, getUser: (req: IncomingMessage) => SessionUser | null): Promise<boolean> {
    const url = new URL(req.url || '', 'http://localhost');
    const method = (req.method || 'GET').toUpperCase();

    for (const route of this.routes) {
      if (route.method !== method) continue;
      const match = route.pattern.exec(url.pathname);
      if (!match) continue;

      try {
        // Decodificar los parámetros de ruta puede lanzar URIError (ej. un
        // "%" sin un escape hexadecimal válido). Se hace DENTRO del mismo
        // try/catch que el handler para que ese caso termine en un 400
        // controlado, nunca en un 500 genérico.
        const params: Record<string, string> = {};
        route.keys.forEach((key, index) => {
          try {
            params[key] = decodeURIComponent(match[index + 1]);
          } catch {
            throw new HttpError(400, 'La URL contiene un parámetro mal formado.');
          }
        });

        await route.handler({
          req: req as RouteContext['req'],
          res,
          params,
          query: url.searchParams,
          user: getUser(req)
        });
      } catch (err: any) {
        if (!res.headersSent) {
          const status = err instanceof HttpError ? err.status : 500;
          sendJson(res, status, { message: err?.message || 'Error interno del servidor' });
        }
      }
      return true;
    }
    return false;
  }
}
