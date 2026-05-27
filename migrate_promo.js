const db = require('./src/db');
const sql = `
CREATE TABLE IF NOT EXISTS promotion_usage_logs (
  id SERIAL PRIMARY KEY,
  promotion_id INTEGER REFERENCES hotel_promotions(id) ON DELETE SET NULL,
  promotion_name VARCHAR(255),
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE SET NULL,
  hotel_name VARCHAR(255),
  agent_id INTEGER,
  discount_amount_applied NUMERIC(10,2),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
db.query(sql).then(() => {
  console.log('Table created');
  process.exit();
}).catch(e => {
  console.error(e);
  process.exit(1);
});
