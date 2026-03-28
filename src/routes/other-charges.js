const express = require('express');
const router = express.Router();
const otherChargeController = require('../controllers/otherChargeController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/', otherChargeController.listOtherCharges);
router.get('/:id', otherChargeController.getOtherCharge);
router.post('/', authenticateToken, authorize('admin'), otherChargeController.createOtherCharge);
router.put('/:id', authenticateToken, authorize('admin'), otherChargeController.updateOtherCharge);
router.delete('/:id', authenticateToken, authorize('admin'), otherChargeController.deleteOtherCharge);

module.exports = router;
