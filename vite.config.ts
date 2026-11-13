import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { apiPlugin } from './server/apiPlugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga .env a process.env para que server/apiPlugin.ts (y todo lo que
  // importa) pueda leer DATABASE_URL / JWT_SECRET / DECOLECTA_TOKEN. Estas
  // variables nunca se exponen al bundle de cliente: solo se usan en el
  // código que corre en este proceso de Node (el middleware de Vite).
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['DATABASE_URL', 'JWT_SECRET', 'DECOLECTA_TOKEN']) {
    if (env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [react(), apiPlugin()],
    server: {
      port: 3000,
      open: false
    }
  };
});

