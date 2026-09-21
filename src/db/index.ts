import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    const isCloud = !!connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');

    if (connectionString) {
      global._postgresPool = new Pool({
        connectionString,
        ssl: isCloud ? { rejectUnauthorized: false } : undefined,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    } else {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST || process.env.PGHOST || 'localhost',
        port: Number(process.env.SQL_PORT || process.env.PGPORT) || 5432,
        user: process.env.SQL_USER || process.env.PGUSER,
        password: process.env.SQL_PASSWORD || process.env.PGPASSWORD,
        database: process.env.SQL_DB_NAME || process.env.PGDATABASE,
        ssl: process.env.NODE_ENV === 'production' && process.env.SQL_HOST && !process.env.SQL_HOST.includes('localhost')
          ? { rejectUnauthorized: false }
          : undefined,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    }

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err.message);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });
