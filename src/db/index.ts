import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    const isProd = process.env.NODE_ENV === 'production';
    const requireSsl =
      process.env.SQL_SSL === 'true' ||
      process.env.DATABASE_SSL === 'true' ||
      (connectionString &&
        (connectionString.includes('sslmode=require') ||
          connectionString.includes('.supabase.') ||
          connectionString.includes('.neon.tech') ||
          connectionString.includes('.render.com') ||
          connectionString.includes('railway') ||
          connectionString.includes('pooler.supabase.com')));

    const poolConfig: PoolConfig = connectionString
      ? {
          connectionString,
          ssl: requireSsl ? { rejectUnauthorized: false } : undefined,
          max: 10,
          connectionTimeoutMillis: 15000,
        }
      : {
          host: process.env.SQL_HOST || process.env.PGHOST || 'localhost',
          port: process.env.SQL_PORT
            ? parseInt(process.env.SQL_PORT, 10)
            : process.env.PGPORT
            ? parseInt(process.env.PGPORT, 10)
            : 5432,
          user: process.env.SQL_USER || process.env.PGUSER || 'postgres',
          password: process.env.SQL_PASSWORD || process.env.PGPASSWORD || '',
          database: process.env.SQL_DB_NAME || process.env.PGDATABASE || 'postgres',
          ssl:
            requireSsl ||
            (isProd && process.env.SQL_HOST && !process.env.SQL_HOST.includes('localhost'))
              ? { rejectUnauthorized: false }
              : undefined,
          max: 10,
          connectionTimeoutMillis: 15000,
        };

    global._postgresPool = new Pool(poolConfig);

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err.message);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });
