const db = require('../db');

exports.listTours = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tours');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTour = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM tours WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Tour not found' });
    
    const pricing = await db.query('SELECT * FROM tour_pricing WHERE tour_id = $1', [id]);
    const tour = result.rows[0];
    tour.pricing = pricing.rows;

    res.json(tour);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createTour = async (req, res) => {
  const { start_city, name, duration, category, description, valid_days } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO tours (start_city, name, duration, category, description, valid_days) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [start_city, name, duration, category, description, valid_days]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTour = async (req, res) => {
  const { start_city, name, duration, category, description, valid_days } = req.body;
  try {
    const result = await db.query(
      'UPDATE tours SET start_city=$1, name=$2, duration=$3, category=$4, description=$5, valid_days=$6, updated_at=CURRENT_TIMESTAMP WHERE id=$7 RETURNING *',
      [start_city, name, duration, category, description, valid_days, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Tour not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await db.query('DELETE FROM tours WHERE id = $1', [req.params.id]);
    res.json({ message: 'Tour deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
