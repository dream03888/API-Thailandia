const fs = require('fs');
const path = require('path');
const db = require('./src/db');
const bcrypt = require('bcryptjs');

const initDb = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const statements = schema.split(';').filter(stmt => stmt.trim() !== '');

      console.log('Starting database initialization...');

      // Enable uuid-ossp extension
      try {
        await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        console.log('Enabled uuid-ossp extension');
      } catch (err) {
        console.log('Extension extension might already exist.');
      }

      for (let statement of statements) {
        if (statement.includes('\\c')) continue; 
        try {
          await db.query(statement);
        } catch (err) {
          // Ignore "already exists" errors during re-runs
          if (!err.message.includes('already exists')) {
            console.error(`Skipping statement due to error: ${err.message}`);
          }
        }
      }
      console.log('Schema processing completed.');
    }

    // Create default admin user
    const username = 'admin';
    const email = 'admin@verathailandia.com';
    const password = 'admin123';
    const role = 'admin';

    const userExists = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        'INSERT INTO users (username, email, role, password) VALUES ($1, $2, $3, $4)',
        [username, email, role, hashedPassword]
      );
      console.log(`Default admin user created: ${username} / ${password}`);
    } else {
      console.log('Admin user already exists.');
    }

    console.log('Database initialization finished.');
  } catch (err) {
    console.error('Core error during database init:', err);
  } finally {
    process.exit();
  }
};

initDb();
