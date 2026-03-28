const db = require('../db');

exports.listTransfers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM transfers');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTransfer = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM transfers WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Transfer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createTransfer = async (req, res) => {
  const { city, supplier_id, from_location, to_location, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO transfers (city, supplier_id, from_location, to_location, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [city, supplier_id, from_location, to_location, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTransfer = async (req, res) => {
  const { city, supplier_id, from_location, to_location, description } = req.body;
  try {
    const result = await db.query(
      'UPDATE transfers SET city=$1, supplier_id=$2, from_location=$3, to_location=$4, description=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *',
      [city, supplier_id, from_location, to_location, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Transfer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteTransfer = async (req, res) => {
  try {
    await db.query('DELETE FROM transfers WHERE id = $1', [req.params.id]);
    res.json({ message: 'Transfer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
