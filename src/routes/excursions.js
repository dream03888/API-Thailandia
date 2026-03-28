const express = require('express');
const router = express.Router();
const excursionController = require('../controllers/excursionController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/', excursionController.listExcursions);
router.get('/:id', excursionController.getExcursion);
router.post('/', authenticateToken, authorize('admin'), excursionController.createExcursion);
router.put('/:id', authenticateToken, authorize('admin'), excursionController.updateExcursion);
router.delete('/:id', authenticateToken, authorize('admin'), excursionController.deleteExcursion);

module.exports = router;
