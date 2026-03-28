const db = require('../db');

exports.listHotels = async (req, res) => {
  const { city } = req.query;
  let query = 'SELECT * FROM hotels';
  let params = [];

  if (city) {
    query += ' WHERE city = $1';
    params.push(city);
  }

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getHotel = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM hotels WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Hotel not found' });
    
    const roomTypes = await db.query('SELECT * FROM room_types WHERE hotel_id = $1', [id]);
    const promotions = await db.query('SELECT * FROM hotel_promotions WHERE hotel_id = $1', [id]);
    
    const hotel = result.rows[0];
    hotel.roomTypes = roomTypes.rows;
    hotel.promotions = promotions.rows;

    res.json(hotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createHotel = async (req, res) => {
  const { name, city, notes, address } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO hotels (name, city, notes, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, city, notes, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateHotel = async (req, res) => {
  const { name, city, notes, address } = req.body;
  try {
    const result = await db.query(
      'UPDATE hotels SET name=$1, city=$2, notes=$3, address=$4, updated_at=CURRENT_TIMESTAMP WHERE id=$5 RETURNING *',
      [name, city, notes, address, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Hotel not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    await db.query('DELETE FROM hotels WHERE id = $1', [req.params.id]);
    res.json({ message: 'Hotel deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
