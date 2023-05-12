const express = require('express');
const router = express.Router();
const { 
    
    startMyClaim,
    getClaim,
    updateClaims
  

} = require('../controllers/claimController')

router.post('/', startMyClaim);

router.get('/:game_id', getClaim);

router.put('/:game_id', updateClaim);

// router.get('/lost', getMyLostTickets);

// router.get('/won', getMyWonTickets);

// router.get('/:id', errorResponse);

// router.post('/enterGame', enterGame);

// router.put('/*', errorResponse);

// router.patch('/*', errorResponse);

// router.delete('/*', errorResponse);

module.exports = router;