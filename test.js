const db = require('./src/db');
db.query("SELECT id, description, city FROM transfers WHERE description ILIKE '%Khao Kho%'")
  .then(res => {
     console.log(res.rows);
     return db.query("SELECT * FROM transfer_pricing WHERE transfer_id IN (" + res.rows.map(r=>r.id).join(',') + ")");
  })
  .then(res => {
     console.log("PRICING:", res.rows);
     process.exit();
  })
  .catch(e => console.error(e));
