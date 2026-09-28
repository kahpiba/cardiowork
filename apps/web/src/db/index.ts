import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema.js';

// Menggunakan connection pooler serverless yang kompatibel dengan Vercel edge/node functions
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy'
});

export const db = drizzle(pool, { schema });
