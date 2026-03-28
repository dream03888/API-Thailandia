const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/', supplierController.listSuppliers);
router.get('/:id', supplierController.getSupplier);
router.post('/', authenticateToken, authorize('admin'), supplierController.createSupplier);
router.put('/:id', authenticateToken, authorize('admin'), supplierController.updateSupplier);
router.delete('/:id', authenticateToken, authorize('admin'), supplierController.deleteSupplier);

module.exports = router;
