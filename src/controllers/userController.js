const db = require('../db');
const bcrypt = require('bcryptjs');

exports.listUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.username, u.email, u.role, u.agent_id, a.name as agent_name 
      FROM users u 
      LEFT JOIN agents a ON u.agent_id = a.id 
      ORDER BY u.username ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, email, role, agent_id FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createUser = async (req, res) => {
  const { username, email, password, role, agent_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, email, password, role, agent_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, agent_id',
      [username, email, hashedPassword, role, agent_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateUser = async (req, res) => {
  const { username, email, password, role, agent_id } = req.body;
  try {
    let query = 'UPDATE users SET username=$1, email=$2, role=$3, agent_id=$4, updated_at=CURRENT_TIMESTAMP';
    let params = [username, email, role, agent_id];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password=$5 WHERE id=$6';
      params.push(hashedPassword, req.params.id);
    } else {
      query += ' WHERE id=$5';
      params.push(req.params.id);
    }
    
    query += ' RETURNING id, username, email, role, agent_id';
    const result = await db.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
