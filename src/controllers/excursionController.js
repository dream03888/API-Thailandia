const db = require('../db');

exports.listExcursions = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM excursions');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getExcursion = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM excursions WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Excursion not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createExcursion = async (req, res) => {
  const { city, name, description, supplier_id, valid_days } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO excursions (city, name, description, supplier_id, valid_days) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [city, name, description, supplier_id, valid_days]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateExcursion = async (req, res) => {
  const { city, name, description, supplier_id, valid_days } = req.body;
  try {
    const result = await db.query(
      'UPDATE excursions SET city=$1, name=$2, description=$3, supplier_id=$4, valid_days=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *',
      [city, name, description, supplier_id, valid_days, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Excursion not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteExcursion = async (req, res) => {
  try {
    await db.query('DELETE FROM excursions WHERE id = $1', [req.params.id]);
    res.json({ message: 'Excursion deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
