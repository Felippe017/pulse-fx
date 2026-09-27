import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '../config/env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT id FROM _migrations WHERE name = $1',
        [file],
      );

      if (rows.length > 0) continue;

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      console.log(`📦 Running migration: ${file}`);

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  ✅ ${file} applied`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌ ${file} failed:`, err);
        throw err;
      }
    }

    console.log('✅ All migrations applied');
  } finally {
    client.release();
  }
}
