const express = require('express');
const errorResponse = require('../controllers/error');
const router = express.Router();

const { 
    logout,
    getMinProfile
} = require('../controllers/sessionController');

router.get('/logout', logout);

router.get('/minProfile', getMinProfile);

module.exports = router;