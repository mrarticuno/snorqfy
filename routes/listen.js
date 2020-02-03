const express = require('express');
const router = express.Router();

// Require controller modules.
const listenerController = require('../controllers/listenerController');

/**
 * Listen to a key song
 */
router.get('/listen/:key', listenerController.listen);


module.exports = router;
