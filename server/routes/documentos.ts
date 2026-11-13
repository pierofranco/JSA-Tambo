import type { Router } from '../http';
import { sendJson } from '../http';
import { consultarRucReal, consultarDniReal } from '../decolecta';
import { requireAuth } from '../auth';

/**
 * Consultas a Decolecta (SUNAT/RENIEC). Requieren sesión activa (cualquier
 * rol) para no exponer el cupo de la API externa a visitantes anónimos de la
 * página pública /servicios-rest.
 */
export function registerDocumentosRoutes(router: Router) {
  router.get('/api/consulta-ruc/:ruc', async ({ res, params, user }) => {
    await requireAuth(user, ['ADMIN', 'CAJERO']);
    const data = await consultarRucReal(params.ruc);
    sendJson(res, 200, data);
  });

  router.get('/api/consulta-dni/:dni', async ({ res, params, user }) => {
    await requireAuth(user, ['ADMIN', 'CAJERO']);
    const data = await consultarDniReal(params.dni);
    sendJson(res, 200, data);
  });
}
