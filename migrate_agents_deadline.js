const db = require('./src/db');

async function migrate() {
  try {
    console.log('Starting migration for agents table...');
    
    // Check if columns already exist
    const checkColumns = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'agents' AND column_name IN ('payment_deadline_type', 'payment_deadline_days')
    `);
    
    const existingColumns = checkColumns.rows.map(r => r.column_name);
    
    if (!existingColumns.includes('payment_deadline_type')) {
      console.log('Adding column payment_deadline_type...');
      await db.query('ALTER TABLE agents ADD COLUMN payment_deadline_type VARCHAR(20) DEFAULT \'eom\'');
    } else {
      console.log('Column payment_deadline_type already exists.');
    }
    
    if (!existingColumns.includes('payment_deadline_days')) {
      console.log('Adding column payment_deadline_days...');
      await db.query('ALTER TABLE agents ADD COLUMN payment_deadline_days INTEGER DEFAULT 0');
    } else {
      console.log('Column payment_deadline_days already exists.');
    }
    
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
