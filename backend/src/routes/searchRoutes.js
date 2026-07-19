const express = require('express');
const searchController = require('../controllers/searchController');
const { protect } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply auth protections to all search operations
router.use(protect);

router.get('/', searchLimiter, searchController.autocomplete);
router.get('/history', searchController.getSearchHistory);

module.exports = router;
