const express = require('express');
const router = express.Router();
const { 

    createReferralCode

} = require('../controllers/referralsController')

router.post('/', createReferralCode);

module.exports = router;