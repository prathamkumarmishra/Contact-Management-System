const express = require('express');
const authRoutes = require('./authRoutes');
const contactRoutes = require('./contactRoutes');
const searchRoutes = require('./searchRoutes');
const importExportRoutes = require('./importExportRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

// Mount individual routers
router.use('/auth', authRoutes);
router.use('/contacts', contactRoutes);
router.use('/search', searchRoutes);
router.use('/io', importExportRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;

