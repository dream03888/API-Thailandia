const pool = require('../db');

exports.listCountries = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM countries ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addCountry = async (req, res) => {
  const { name, code } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO countries (name, code) VALUES ($1, $2) RETURNING *',
      [name, code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCountry = async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  try {
    const result = await pool.query(
      'UPDATE countries SET name = $1, code = $2 WHERE id = $3 RETURNING *',
      [name, code, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCountry = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM countries WHERE id = $1', [id]);
    res.json({ message: 'Country deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
