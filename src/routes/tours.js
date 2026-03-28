const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/', tourController.listTours);
router.get('/:id', tourController.getTour);
router.post('/', authenticateToken, authorize('admin'), tourController.createTour);
router.put('/:id', authenticateToken, authorize('admin'), tourController.updateTour);
router.delete('/:id', authenticateToken, authorize('admin'), tourController.deleteTour);

module.exports = router;
