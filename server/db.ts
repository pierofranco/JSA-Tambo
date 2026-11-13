import pg from 'pg';

const { Pool } = pg;

// node-pg devuelve las columnas NUMERIC como string por defecto (para no
// perder precisión), pero el frontend espera number en el JSON de la API.
// Se registra una sola vez, para toda la app, en vez de parsear a mano en
// cada ruta.
pg.types.setTypeParser(1700 /* NUMERIC */, (value: string) => parseFloat(value));

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL no está configurado. Revisa el archivo .env.');
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

/**
 * Único punto de acceso a Postgres. Siempre usar placeholders ($1, $2, ...) en
 * `text` y pasar los valores en `params` — nunca concatenar input del usuario
 * dentro de la consulta SQL, para prevenir inyección SQL.
 */
export function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]) {
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
