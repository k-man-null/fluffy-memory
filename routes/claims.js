const express = require('express');
const router = express.Router();
const { 
    
    startMyClaim,
  

} = require('../controllers/claimController')

router.get('/', startMyClaim);

// router.get('/live', getMyLiveTickets);

// router.get('/lost', getMyLostTickets);

// router.get('/won', getMyWonTickets);

// router.get('/:id', errorResponse);

// router.post('/enterGame', enterGame);

// router.put('/*', errorResponse);

// router.patch('/*', errorResponse);

// router.delete('/*', errorResponse);

module.exports = router;