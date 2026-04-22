const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || '10.0.0.100',
  database: process.env.PG_DATABASE || 'agent_operator',
  password: process.env.PG_PASSWORD || 'password',
  port: process.env.PG_PORT || 5432,
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT 
        COUNT(*) as total_trips,
        COUNT(*) FILTER (WHERE is_booking = false) as total_quotations,
        COUNT(*) FILTER (WHERE is_booking = true) as total_bookings,
        COUNT(*) FILTER (WHERE is_booking = true AND approved = true) as total_bookings_approved,
        COUNT(*) FILTER (WHERE approved = true) as total_approved,
        COUNT(*) FILTER (WHERE approved = false AND declined = false) as total_pending
      FROM trips
    `);
    console.log('--- Trips Overview ---');
    console.table(res.rows);

    const detailed = await pool.query(`
      SELECT id, client_name, is_booking, approved, declined, final_amount, created_at
      FROM trips
      ORDER BY id DESC
    `);
    console.log('--- All Trips ---');
    console.table(detailed.rows);

  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
