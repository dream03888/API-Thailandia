const db = require('./src/db');
const sql = `ALTER TABLE hotel_trip_items ADD COLUMN IF NOT EXISTS promotion_id INTEGER REFERENCES hotel_promotions(id) ON DELETE SET NULL;`;
db.query(sql).then(() => {
  console.log('Altered table');
  process.exit();
}).catch(e => {
  console.error(e);
  process.exit(1);
});
