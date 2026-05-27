const db = require('./src/db');
db.query("SELECT * FROM agents LIMIT 1").then(res => {
   console.log("AGENT:", res.rows[0]);
   return db.query("SELECT * FROM markup_groups WHERE id = " + (res.rows[0].markup_group_id || 1));
}).then(res => {
   console.log("MARKUP:", res.rows[0]);
   process.exit();
});
