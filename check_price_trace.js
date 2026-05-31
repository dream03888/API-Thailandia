const db = require('./src/db');

async function main() {
  // หาห้อง Deluxe Lagoon View และ Deluxe Sea View ตามชื่อที่แน่นอน
  const exact = await db.query(
    `SELECT h.id as hotel_id, h.name as hotel, rt.id, rt.name as room, 
            to_char(rt.start_date, 'YYYY-MM-DD') as date_from,
            to_char(rt.end_date, 'YYYY-MM-DD') as date_to,
            rt.single_price, rt.double_price
     FROM room_types rt 
     JOIN hotels h ON h.id = rt.hotel_id 
     WHERE rt.name ILIKE '%Deluxe Lagoon View%' OR rt.name ILIKE '%Deluxe Sea View%'
     ORDER BY h.name, rt.start_date`
  );

  console.log('\n=== ค้นหาด้วยชื่อแน่นอน ===');
  if (exact.rows.length === 0) {
    console.log('❌ ไม่พบ! ชื่อห้องในภาพไม่ตรงกับในฐานข้อมูล 100%');
  } else {
    console.table(exact.rows);
  }

  // แสดงทุกห้องที่ single_price = 10100 หรือ 10600 (ราคาก่อน/หลัง markup +500)
  const price10100 = await db.query(
    `SELECT h.name as hotel, rt.name as room,
            to_char(rt.start_date, 'YYYY-MM-DD') as date_from,
            to_char(rt.end_date, 'YYYY-MM-DD') as date_to,
            rt.single_price, rt.double_price
     FROM room_types rt JOIN hotels h ON h.id = rt.hotel_id 
     WHERE rt.single_price IN (10100, 10600) OR rt.double_price IN (10100, 10600)
     ORDER BY rt.single_price, h.name`
  );
  console.log('\n=== ห้องที่ราคา 10,100 หรือ 10,600 (ราคา raw ที่จะได้ 10,600 หลัง +500) ===');
  console.table(price10100.rows);

  const price10600 = await db.query(
    `SELECT h.name as hotel, rt.name as room,
            to_char(rt.start_date, 'YYYY-MM-DD') as date_from,
            to_char(rt.end_date, 'YYYY-MM-DD') as date_to,
            rt.single_price, rt.double_price
     FROM room_types rt JOIN hotels h ON h.id = rt.hotel_id 
     WHERE rt.single_price IN (11100, 10600) OR rt.double_price IN (11100, 10600)
     ORDER BY rt.single_price, h.name`
  );
  console.log('\n=== ห้องที่ราคา 10,600 หรือ 11,100 (ราคา raw ที่จะได้ 11,100 หลัง +500) ===');
  console.table(price10600.rows);

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
