import type { Plugin } from 'vite';
import { Router, sendJson } from './http';
import { getSessionUser } from './auth';
import { serveUploadedFile } from './uploads';
import { registerAuthRoutes } from './routes/auth';
import { registerUsuariosRoutes } from './routes/usuarios';
import { registerCategoriasRoutes } from './routes/categorias';
import { registerProductosRoutes } from './routes/productos';
import { registerProveedoresRoutes } from './routes/proveedores';
import { registerComprasRoutes } from './routes/compras';
import { registerVentasRoutes } from './routes/ventas';
import { registerDocumentosRoutes } from './routes/documentos';
import { registerUploadsRoutes } from './routes/uploads';

/**
 * Backend real de TAMBOPOS montado como middleware del servidor de Vite (dev
 * y preview): autenticación por sesión (cookie httpOnly + JWT), todo el CRUD
 * sobre PostgreSQL con queries parametrizadas, y las consultas reales a
 * Decolecta (SUNAT/RENIEC). Reemplaza al antiguo mockApiPlugin.ts en memoria.
 */
export function apiPlugin(): Plugin {
  const router = new Router();
  registerAuthRoutes(router);
  registerUsuariosRoutes(router);
  registerCategoriasRoutes(router);
  registerProductosRoutes(router);
  registerProveedoresRoutes(router);
  registerComprasRoutes(router);
  registerVentasRoutes(router);
  registerDocumentosRoutes(router);
  registerUploadsRoutes(router);

  const middleware = async (req: any, res: any, next: any) => {
    const url: string = req.url || '';

    if (url.startsWith('/uploads/productos/')) {
      const filename = url.slice('/uploads/productos/'.length).split('?')[0];
      serveUploadedFile(filename, res);
      return;
    }

    if (!url.startsWith('/api/')) {
      return next();
    }

    try {
      const handled = await router.handle(req, res, getSessionUser);
      if (!handled) sendJson(res, 404, { message: `Endpoint no encontrado: ${req.method} ${url}` });
    } catch (err: any) {
      if (!res.headersSent) sendJson(res, 500, { message: err?.message || 'Error interno del servidor' });
    }
  };

  return {
    name: 'tambopos-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    }
  };
}
