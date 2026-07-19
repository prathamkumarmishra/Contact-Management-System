const express = require('express');
const contactController = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { contactValidator } = require('../validators/contactValidator');

const router = express.Router();

// Apply protect middleware to all contact endpoints
router.use(protect);

// Undo operations (Stack pop)
router.post('/undo', contactController.undoDelete);

// Priority Queue operations (Heap statistics)
router.get('/recent', contactController.getRecentInteractions);

// Main collection routes
router.route('/')
  .get(contactController.getContacts)
  .post(upload.single('profilePhoto'), contactValidator, validate, contactController.createContact);

// Trash list query
router.get('/trash', contactController.getTrash);

// Bulk operations
router.delete('/bulk', contactController.bulkDelete);

// Clear all contacts
router.delete('/clear-all', contactController.clearAll);

// Clear trash (permanently delete all trashed)
router.delete('/clear-trash', contactController.clearTrash);

// Single contact routes
router.route('/:id')
  .get(contactController.getContactById)
  .put(upload.single('profilePhoto'), contactValidator, validate, contactController.updateContact)
  .delete(contactController.deleteContact);

// Individual status modifiers
router.post('/:id/restore', contactController.restoreContact);
router.put('/:id/favorite', contactController.toggleFavorite);
router.put('/:id/block', contactController.toggleBlock);

module.exports = router;
