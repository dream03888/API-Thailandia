const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST || process.env.PGHOST,
  user: process.env.PG_USER || process.env.PGUSER,
  password: process.env.PG_PASSWORD || process.env.PGPASSWORD,
  database: process.env.PG_DATABASE || process.env.PGDATABASE,
  port: process.env.PG_PORT || process.env.PGPORT || 5432,
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
