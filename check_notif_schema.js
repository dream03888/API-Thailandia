const db = require('./src/db');

async function main() {
  try {
    const res = await db.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications'");
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
main();
