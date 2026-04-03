const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

async function run() {
  try {
    await client.connect();
    
    // Add supplier_id column to transfers if it doesn't exist
    await client.query('ALTER TABLE transfers ADD COLUMN IF NOT EXISTS supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL');
    console.log('ALTER TABLE transfers ADD COLUMN supplier_id SUCCESSFUL');
    
  } catch (e) {
    console.error('Error during migration:', e);
  } finally {
    await client.end();
  }
}

run();
