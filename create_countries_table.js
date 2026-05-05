const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTable() {
  try {
    const queryText = `
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        code VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(queryText);
    console.log('Table "countries" created or already exists.');
    
    // Insert some default countries
    const insertQuery = `
      INSERT INTO countries (name, code) 
      VALUES ('Thailand', 'TH'), ('Vietnam', 'VN'), ('Cambodia', 'KH'), ('Laos', 'LA')
      ON CONFLICT (name) DO NOTHING;
    `;
    await pool.query(insertQuery);
    console.log('Default countries inserted.');
    
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await pool.end();
  }
}

createTable();
