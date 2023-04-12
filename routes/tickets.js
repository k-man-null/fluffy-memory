const express = require('express');
const errorResponse = require('../controllers/error');
const router = express.Router();
const { 
    
    enterGame,
    getMytickets,
    getMyLiveTickets,
    getMyLostTickets,
    getMyWonTickets

} = require('../controllers/ticketController')

router.get('/', getMytickets);

router.get('/live', getMyLiveTickets);

router.get('/lost', getMyLostTickets);

router.get('/won', getMyWonTickets);

router.get('/:id', errorResponse);

router.post('/enterGame', enterGame);

router.put('/*', errorResponse);

router.patch('/*', errorResponse);

router.delete('/*', errorResponse);

module.exports = router;