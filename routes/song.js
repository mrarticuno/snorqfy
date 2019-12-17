const express = require('express');
const router = express.Router();

// Require controller modules.
const songController = require('../controllers/songController');

/**
 * List all available songs
 */
router.get('/list/:search', songController.list);

/**
 * List filesystem songs
 */
router.get('/listfiles/', songController.listFiles);

/**
 * Search Song
 */
router.get('/search/:search', songController.search);

/**
 * Request Song
 */
router.post('/request', songController.request);

/**
 * Remove song
 */
router.delete('/remove', songController.delete);


module.exports = router;
