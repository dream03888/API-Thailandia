const db = require('./src/db');

async function checkHotels() {
  try {
    const res = await db.query('SELECT DISTINCT city FROM hotels');
    console.log('Cities with hotels:', res.rows.map(r => r.city));
    
    const countRes = await db.query('SELECT COUNT(*) FROM hotels');
    console.log('Total hotels:', countRes.rows[0].count);
    
    const kohChang = await db.query('SELECT name, city FROM hotels WHERE city ILIKE $1', ['%Koh Chang%']);
    console.log('Hotels in Koh Chang:', kohChang.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkHotels();
