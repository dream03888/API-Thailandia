const db = require('./src/db');

async function main() {
  // 1. Find all rooms with "Deluxe" in name
  const rooms = await db.query(`
    SELECT h.id as hotel_id, h.name as hotel, rt.name as room_name, 
           rt.start_date, rt.end_date, rt.single_price, rt.double_price
    FROM room_types rt 
    JOIN hotels h ON h.id = rt.hotel_id 
    WHERE rt.name ILIKE '%deluxe%' OR rt.name ILIKE '%sea view%' OR rt.name ILIKE '%lagoon%'
    ORDER BY h.name, rt.start_date
  `);
  console.log('=== ROOM TYPES (raw from DB) ===');
  console.table(rooms.rows.map(r => ({
    hotel: r.hotel,
    room: r.room_name,
    from: r.start_date ? r.start_date.toISOString().split('T')[0] : '-',
    to: r.end_date ? r.end_date.toISOString().split('T')[0] : '-',
    single: r.single_price,
    double: r.double_price
  })));

  // 2. Show all markups with hotel ranges
  const markups = await db.query(`
    SELECT m.markup_group, m.hotel_markup_unit, m.hotel_markup_value,
           hmp.price_from, hmp.price_to, hmp.markup_percentage
    FROM markups m
    LEFT JOIN hotel_markup_percentages hmp ON hmp.markup_id = m.id
    ORDER BY m.markup_group, hmp.price_from
  `);
  console.log('\n=== MARKUPS ===');
  console.table(markups.rows.map(r => ({
    group: r.markup_group,
    unit: r.hotel_markup_unit,
    fallback: r.hotel_markup_value,
    price_from: r.price_from,
    price_to: r.price_to,
    markup_pct: r.markup_percentage
  })));

  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
