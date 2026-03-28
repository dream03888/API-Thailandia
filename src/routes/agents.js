const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/', authenticateToken, authorize('admin'), agentController.listAgents);
router.post('/', authenticateToken, authorize('admin'), agentController.createAgent);
router.put('/:id', authenticateToken, authorize('admin'), agentController.updateAgent);
router.delete('/:id', authenticateToken, authorize('admin'), agentController.deleteAgent);

module.exports = router;
