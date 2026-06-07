/**
 * Migration: Add flight_time column to transfer_trip_items
 * Run once: node migrate_transfer_flight.js
 */
const db = require('./src/db');

async function migrate() {
  try {
    await db.query(`
      ALTER TABLE transfer_trip_items
      ADD COLUMN IF NOT EXISTS flight_time VARCHAR(50)
    `);
    console.log('✅ Added flight_time column to transfer_trip_items');

    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
