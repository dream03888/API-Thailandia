/**
 * Migration: Add total_price column to hotel_trip_items
 * Run once: node migrate_hotel_price.js
 */
const db = require('./src/db');

async function migrate() {
  try {
    // Add total_price column if it doesn't already exist
    await db.query(`
      ALTER TABLE hotel_trip_items
      ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2) DEFAULT 0
    `);
    console.log('✅ Added total_price column to hotel_trip_items');

    // Also add display_order if missing (for order persistence)
    await db.query(`
      ALTER TABLE hotel_trip_items
      ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0
    `);
    console.log('✅ Added display_order column to hotel_trip_items');

    // Also add extra_adult_bed_count and extra_child_bed_count if missing
    await db.query(`
      ALTER TABLE hotel_trip_items
      ADD COLUMN IF NOT EXISTS extra_adult_bed_count INTEGER DEFAULT 0
    `);
    await db.query(`
      ALTER TABLE hotel_trip_items
      ADD COLUMN IF NOT EXISTS extra_child_bed_count INTEGER DEFAULT 0
    `);
    console.log('✅ Added extra bed count columns to hotel_trip_items');

    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
