const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/', transferController.listTransfers);
router.get('/:id', transferController.getTransfer);
router.post('/', authenticateToken, authorize('admin'), transferController.createTransfer);
router.put('/:id', authenticateToken, authorize('admin'), transferController.updateTransfer);
router.delete('/:id', authenticateToken, authorize('admin'), transferController.deleteTransfer);

module.exports = router;
