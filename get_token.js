const db = require('./src/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function getToken() {
  const res = await db.query("SELECT * FROM users WHERE role = 'superadmin' LIMIT 1");
  const user = res.rows[0];
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, agent_id: user.agent_id },
    process.env.JWT_SECRET || 'your_jwt_secret'
  );
  console.log(token);
  process.exit();
}
getToken();
