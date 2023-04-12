const express = require('express');
const router = express.Router();
const errorResponse  = require('../controllers/error');
const { getMyInventory } = require('../controllers/inventoryController');

router.get('/myInventory', getMyInventory);

router.post('/*', errorResponse);

router.put('/*', errorResponse);

router.patch('/*', errorResponse);

router.delete('/*', errorResponse);

module.exports = router;