const express = require('express');
const router = express.Router();
const errorResponse  = require('../controllers/error');
const { createTicketLoadRequest, approveHostTicketLoadRequest } = require('../controllers/ticketBankController');

router.get('/*', errorResponse);

router.post('/gethostingtickets', createTicketLoadRequest);

router.put('/approvehostloadrequest', approveHostTicketLoadRequest);

router.patch('/*', errorResponse);

router.delete('/*', errorResponse);

module.exports = router;