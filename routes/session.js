const express = require('express');
const router = express.Router();

const { 
    logout,
    getMinProfile,
    getUserWallet,
    loadUserWallet
} = require('../controllers/sessionController');

router.get('/logout', logout);

router.get('/wallet', getUserWallet);

router.get('/minProfile', getMinProfile);

router.post('/deposit', loadUserWallet);

module.exports = router;