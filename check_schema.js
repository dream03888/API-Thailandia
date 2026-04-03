const db = require('./src/db');

async function checkSchema() {
  try {
    console.log('--- transfers ---');
    const t = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'transfers'");
    console.log(t.rows.map(r => r.column_name));

    console.log('\n--- tours ---');
    const tours = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'tours'");
    console.log(tours.rows.map(r => r.column_name));

    console.log('\n--- hotels ---');
    const h = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'hotels'");
    console.log(h.rows.map(r => r.column_name));

    console.log('\n--- excursions ---');
    const e = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'excursions'");
    console.log(e.rows.map(r => r.column_name));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
