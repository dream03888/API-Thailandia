const db = require('./src/db');

async function migrate() {
  try {
    console.log('Dropping unique constraint agents_email_key...');
    await db.query('ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_email_key');
    console.log('Successfully dropped the unique constraint on email.');
    process.exit(0);
  } catch (err) {
    console.error('Error dropping constraint:', err);
    process.exit(1);
  }
}

migrate();
