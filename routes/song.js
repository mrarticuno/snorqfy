const express = require('express');
const router = express.Router();

// Require controller modules.
const songController = require('../controllers/songController');

/**
 * Index
 */
router.get('/', songController.index);

/**
 * List all available songs
 */
router.get('/list', songController.list);

/**
 * Search Song
 */
router.get('/search/:search', songController.search);

/**
 * Request Song
 */
router.post('/request', songController.request);

/**
 * Listen song
 */
// router.get('/listen/:song', songController.listen);

/**
 * Remove song
 */
// router.delete('/remove', songController.delete);


module.exports = router;
