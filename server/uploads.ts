import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'productos');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // El nombre final nunca depende del nombre original del archivo (evita
    // path traversal / colisiones): solo un UUID + extensión derivada del
    // mimetype ya validado por fileFilter.
    const ext = ALLOWED_MIME_TO_EXT[file.mimetype] || '.jpg';
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});

export const productImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TO_EXT[file.mimetype]) {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (png, jpg, webp, gif).'));
      return;
    }
    cb(null, true);
  }
}).single('imagen');

/**
 * Sirve un archivo subido por nombre exacto. El nombre viene de la ruta
 * `/uploads/productos/:filename`, validado contra un patrón estricto para
 * impedir cualquier intento de path traversal (`..`, `/`, etc.).
 */
export function serveUploadedFile(filename: string, res: import('http').ServerResponse): boolean {
  if (!/^[A-Za-z0-9-]+\.(png|jpe?g|webp|gif)$/i.test(filename)) {
    res.statusCode = 400;
    res.end('Nombre de archivo inválido.');
    return true;
  }
  const filePath = path.join(UPLOAD_DIR, filename);
  if (!filePath.startsWith(UPLOAD_DIR) || !fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.end('Archivo no encontrado.');
    return true;
  }
  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.gif' ? 'image/gif' : 'image/jpeg';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  // El Content-Type real depende de lo que el cliente declaró al subir el
  // archivo (no de un análisis de los bytes), así que se pide a los
  // navegadores no "adivinar" otro tipo (mitiga XSS por MIME-sniffing).
  res.setHeader('X-Content-Type-Options', 'nosniff');
  fs.createReadStream(filePath).pipe(res);
  return true;
}
