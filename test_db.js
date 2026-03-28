const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
  connectionTimeoutMillis: 5000,
});

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Host:', process.env.PG_HOST);
  console.log('Database:', process.env.PG_DATABASE);
  console.log('User:', process.env.PG_USER);
  
  try {
    const client = await pool.connect();
    console.log('✅ Success! Connected to the database.');
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0].now);
    client.release();
  } catch (err) {
    console.error('❌ Error connecting to the database:');
    console.error(err.message);
  } finally {
    process.exit();
  }
}

testConnection();
