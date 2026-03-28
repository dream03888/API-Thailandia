const express = require('express');
const router = express.Router();
const markupController = require('../controllers/markupController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/', markupController.listMarkups);
router.get('/groups', markupController.getMarkupGroups);
router.get('/:id', markupController.getMarkup);
router.post('/', authenticateToken, authorize('admin'), markupController.createMarkup);
router.put('/:id', authenticateToken, authorize('admin'), markupController.updateMarkup);
router.delete('/:id', authenticateToken, authorize('admin'), markupController.deleteMarkup);

module.exports = router;
