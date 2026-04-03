const db = require('../db');
const bcrypt = require('bcryptjs');

exports.listUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.username, u.email, u.role, u.agent_id, u.permissions, a.name as agent_name 
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
    
    // Determine default permissions based on role
    let permissions = {};
    if (role === 'superadmin') {
      permissions = { all: true, manage_users: true, control_panel: true, settings: true, notifications_enabled: true, pages: ['home', 'quotation', 'payment', 'itinerary', 'analytics', 'settings', 'cp_activities', 'cp_agents', 'cp_bookings', 'cp_excursions', 'cp_hotels', 'cp_markups', 'cp_other_charges', 'cp_suppliers', 'cp_tools', 'cp_tours', 'cp_transfers', 'cp_users'] };
    } else if (role === 'admin') {
      permissions = { control_panel: true, bookings: 'all', hotels: 'all', transfers: 'all', excursions: 'all', tours: 'all', notifications_enabled: true, pages: ['home', 'quotation', 'payment', 'itinerary', 'analytics', 'cp_activities', 'cp_agents', 'cp_bookings', 'cp_excursions', 'cp_hotels', 'cp_markups', 'cp_other_charges', 'cp_suppliers', 'cp_tools', 'cp_tours', 'cp_transfers'] };
    } else {
      permissions = { bookings: 'own', hotels: 'read', transfers: 'read', excursions: 'read', tours: 'read', notifications_enabled: true, pages: ['home', 'quotation', 'payment', 'itinerary'] };
    }

    const result = await db.query(
      'INSERT INTO users (username, email, password, role, agent_id, permissions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, role, agent_id, permissions',
      [username, email, hashedPassword, role, agent_id ? parseInt(agent_id) : null, JSON.stringify(permissions)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateUser = async (req, res) => {
  const { username, email, password, role, agent_id, permissions } = req.body;
  try {
    let query = 'UPDATE users SET username=$1, email=$2, role=$3, agent_id=$4, updated_at=CURRENT_TIMESTAMP';
    let params = [username, email, role, agent_id ? parseInt(agent_id) : null];
    
    let counter = 5;
    if (permissions) {
      query += `, permissions=$${counter}`;
      params.push(typeof permissions === 'string' ? permissions : JSON.stringify(permissions));
      counter++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password=$${counter} WHERE id=$${counter + 1}`;
      params.push(hashedPassword, req.params.id);
    } else {
      query += ` WHERE id=$${counter}`;
      params.push(req.params.id);
    }
    
    query += ' RETURNING id, username, email, role, agent_id, permissions';
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

exports.updateRole = async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  try {
    // Determine default permissions for the new role
    let permissions = {};
    if (role === 'superadmin') {
      permissions = { all: true, manage_users: true, control_panel: true, settings: true, notifications_enabled: true, pages: ['home', 'quotation', 'payment', 'itinerary', 'analytics', 'settings', 'cp_activities', 'cp_agents', 'cp_bookings', 'cp_excursions', 'cp_hotels', 'cp_markups', 'cp_other_charges', 'cp_suppliers', 'cp_tools', 'cp_tours', 'cp_transfers', 'cp_users'] };
    } else if (role === 'admin') {
      permissions = { control_panel: true, bookings: 'all', hotels: 'all', transfers: 'all', excursions: 'all', tours: 'all', notifications_enabled: true, pages: ['home', 'quotation', 'payment', 'itinerary', 'analytics', 'cp_activities', 'cp_agents', 'cp_bookings', 'cp_excursions', 'cp_hotels', 'cp_markups', 'cp_other_charges', 'cp_suppliers', 'cp_tools', 'cp_tours', 'cp_transfers'] };
    } else {
      permissions = { bookings: 'own', hotels: 'read', transfers: 'read', excursions: 'read', tours: 'read', notifications_enabled: true, pages: ['home', 'quotation', 'payment', 'itinerary'] };
    }

    const result = await db.query(
      'UPDATE users SET role = $1, permissions = $2::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, username, role, permissions',
      [role, JSON.stringify(permissions), userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updatePermissions = async (req, res) => {
  const { permissions } = req.body;
  const userId = req.params.id;

  try {
    const result = await db.query(
      'UPDATE users SET permissions = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, role, permissions',
      [JSON.stringify(permissions), userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.migratePermissions = async (req, res) => {
  try {
    const result = await db.query('SELECT id, permissions FROM users');
    let updatedCount = 0;

    for (const user of result.rows) {
      let perms = user.permissions;
      if (perms && perms.pages) {
        let pages = perms.pages;
        if (pages.includes('add-quotation')) {
          pages = pages.filter(p => p !== 'add-quotation');
          if (!pages.includes('quotation')) {
            pages.push('quotation');
          }
          perms.pages = Array.from(new Set(pages));
          await db.query('UPDATE users SET permissions = $1 WHERE id = $2', [JSON.stringify(perms), user.id]);
          updatedCount++;
        }
      }
    }
    res.json({ message: `Migration complete. Updated ${updatedCount} users.` });
  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ message: 'Migration failed.' });
  }
};
