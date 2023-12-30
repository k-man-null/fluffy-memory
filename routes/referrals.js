const express = require('express');

const router = express.Router();

const { 

    createReferralCode,
    getMyRefCodes,
    getMyEarnings,
    getMyCommissions,
    getGameCommissions

} = require('../controllers/referralsController');

router.post('/', createReferralCode);
router.get('/mycodes', getMyRefCodes);
router.get('/earnings', getMyEarnings);
router.get('/commissions', getMyCommissions);
router.get('/gamecommissions', getGameCommissions);

module.exports = router;