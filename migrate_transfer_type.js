const db = require('./src/db');

async function migrate() {
  try {
    await db.query(`
      ALTER TABLE transfer_trip_items
      ADD COLUMN IF NOT EXISTS type_of_transfer VARCHAR(50)
    `);
    console.log('✅ Added type_of_transfer column to transfer_trip_items');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
