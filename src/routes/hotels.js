const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/', hotelController.listHotels);
router.get('/:id', hotelController.getHotel);
router.post('/', authenticateToken, authorize('admin'), hotelController.createHotel);
router.put('/:id', authenticateToken, authorize('admin'), hotelController.updateHotel);
router.delete('/:id', authenticateToken, authorize('admin'), hotelController.deleteHotel);

module.exports = router;
