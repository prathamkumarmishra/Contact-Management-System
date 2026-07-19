const express = require('express');
const importExportController = require('../controllers/importExportController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Apply auth protections to all endpoints
router.use(protect);

router.post('/import', upload.single('file'), importExportController.importCSV);
router.get('/export', importExportController.exportCSV);

module.exports = router;
