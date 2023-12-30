const express = require('express');
const router = express.Router();
const { 
    startMyClaim,
    getClaim,
    updateClaim
} = require('../controllers/claimController')

router.post('/', startMyClaim);

router.get('/:game_id', getClaim);

router.put('/:game_id', updateClaim);

module.exports = router;