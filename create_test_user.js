const db = require('./src/db');
const bcrypt = require('bcryptjs');

async function main() {
  const username = 'testuser';
  const password = '123456';
  const email = 'testuser@example.com';
  const role = 'admin';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.query(
      'INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO UPDATE SET password = $2, email = $3',
      [username, hashedPassword, email, role]
    );
    console.log(`User ${username} created/updated successfully with password ${password}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
