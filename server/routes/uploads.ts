import type { Router } from '../http';
import { sendJson, HttpError } from '../http';
import { requireAuth } from '../auth';
import { productImageUpload } from '../uploads';

export function registerUploadsRoutes(router: Router) {
  router.post('/api/uploads/producto', async ({ req, res, user }) => {
    await requireAuth(user, ['ADMIN']);

    await new Promise<void>((resolve, reject) => {
      productImageUpload(req as any, res as any, (err: any) => {
        if (err) reject(new HttpError(400, err.message || 'No se pudo subir la imagen.'));
        else resolve();
      });
    });

    const file = (req as any).file;
    if (!file) throw new HttpError(400, 'Debes adjuntar una imagen.');

    sendJson(res, 201, { url: `/uploads/productos/${file.filename}` });
  });
}
