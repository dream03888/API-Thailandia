const db = require('./src/db');
async function check() {
  const res = await db.query("SELECT username, role, permissions FROM users WHERE username = 'testuser'");
  console.log(JSON.stringify(res.rows[0], null, 2));
  process.exit();
}
check();
