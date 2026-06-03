const db = require('./src/db');

async function main() {
  const res = await db.query(
    `SELECT h.name as hotel, rt.name as room, 
            to_char(rt.start_date, 'YYYY-MM-DD') as start_date,
            to_char(rt.end_date, 'YYYY-MM-DD') as end_date,
            rt.single_price, rt.double_price
     FROM room_types rt 
     JOIN hotels h ON h.id = rt.hotel_id 
     WHERE h.name = 'Dusit Thani Laguna Phuket' 
       AND rt.name = 'Deluxe Sea View Room incl. Abf'
     ORDER BY rt.start_date`
  );
  console.table(res.rows);
  process.exit(0);
}

main().catch(console.error);
