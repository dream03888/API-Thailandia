const db = require('../db');

exports.listAgents = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM agents');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createAgent = async (req, res) => {
  const { name, markup_group, address, email, telephone, fax } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO agents (name, markup_group, address, email, telephone, fax) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, markup_group, address, email, telephone, fax]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateAgent = async (req, res) => {
  const { name, markup_group, address, email, telephone, fax } = req.body;
  try {
    const result = await db.query(
      'UPDATE agents SET name=$1, markup_group=$2, address=$3, email=$4, telephone=$5, fax=$6, updated_at=CURRENT_TIMESTAMP WHERE id=$7 RETURNING *',
      [name, markup_group, address, email, telephone, fax, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Agent not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    await db.query('DELETE FROM agents WHERE id = $1', [req.params.id]);
    res.json({ message: 'Agent deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
