const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('[DB.js Debug] Available Env Keys:', Object.keys(process.env).filter(k => k.startsWith('PG') || k.includes('DATABASE') || k.includes('RAILWAY')));
console.log('[DB.js Debug] Checking DATABASE_URL:', !!process.env.DATABASE_URL);

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.PGHOST || process.env.PG_HOST || 'localhost',
      user: process.env.PGUSER || process.env.PG_USER,
      password: process.env.PGPASSWORD || process.env.PG_PASSWORD,
      database: process.env.PGDATABASE || process.env.PG_DATABASE,
      port: process.env.PGPORT || process.env.PG_PORT || 5432,
    });

// Auto-migration: Ensure status column exists in trips table
pool.query(`
  ALTER TABLE trips ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'InProgress';
  ALTER TABLE transfers ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
`).catch(err => console.error('[DB Migration Error] Failed to add columns:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
