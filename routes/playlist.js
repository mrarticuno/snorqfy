const express = require('express');
const router = express.Router();

// Require controller modules.
const playlistController = require('../controllers/playlistController');

/**
 * Request Song
 */
router.post('/request', playlistController.request);

/**
 * Index
 */
router.get('/', playlistController.index);

module.exports = router;
