const express = require('express');
const router = express.Router();

const { 
    logout,
    getMinProfile,
    getUserWallet
} = require('../controllers/sessionController');

router.get('/logout', logout);

router.get('/wallet', getUserWallet);

router.get('/minProfile', getMinProfile);

module.exports = router;