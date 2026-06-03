const db = require('./src/db');

async function main() {
  const res = await db.query(
    `SELECT h.name as hotel, rt.name as room, 
            to_char(rt.start_date, 'DD/MM/YYYY') as start_date,
            to_char(rt.end_date, 'DD/MM/YYYY') as end_date,
            rt.single_price, rt.double_price
     FROM room_types rt 
     JOIN hotels h ON h.id = rt.hotel_id 
     WHERE rt.single_price = 25800`
  );
  console.table(res.rows);
  process.exit(0);
}

main().catch(console.error);
