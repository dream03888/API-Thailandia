const db = require('./src/db');

const migrate = async () => {
  try {
    console.log('Starting migration to add hotel metadata columns...');

    const queries = [
      'ALTER TABLE hotel_trip_items ADD COLUMN IF NOT EXISTS meals JSONB;',
      'ALTER TABLE hotel_trip_items ADD COLUMN IF NOT EXISTS room_types_json JSONB;',
      'ALTER TABLE hotel_trip_items ADD COLUMN IF NOT EXISTS early_check_in BOOLEAN DEFAULT FALSE;',
      'ALTER TABLE hotel_trip_items ADD COLUMN IF NOT EXISTS late_check_out BOOLEAN DEFAULT FALSE;',
      'ALTER TABLE hotel_trip_items ADD COLUMN IF NOT EXISTS flight_in VARCHAR(100);',
      'ALTER TABLE hotel_trip_items ADD COLUMN IF NOT EXISTS flight_out VARCHAR(100);',
      'ALTER TABLE hotel_trip_items ADD COLUMN IF NOT EXISTS flight_info TEXT;',
      'ALTER TABLE hotel_trip_items ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0;'
    ];

    for (const query of queries) {
      console.log(`Executing: ${query}`);
      await db.query(query);
    }

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit();
  }
};

migrate();
