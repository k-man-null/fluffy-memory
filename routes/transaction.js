const express = require('express');
const errorResponse = require('../controllers/error');
const router = express.Router();
const { 
    createDepositRequest,
    approveDepositRequest,
    rejectDepositRequest,
    createWithdrawalRequest,
    approveWithdrawRequest
} = require('../controllers/transactionController')

router.get('/*', errorResponse);

router.get('/:id', errorResponse);

router.post('/deposit', createDepositRequest);

router.post('/withdraw', createWithdrawalRequest);

router.patch('/approveDeposit', approveDepositRequest);

router.patch('/approveWithdraw', approveWithdrawRequest);

router.patch('/reject', rejectDepositRequest);

router.patch('/:id', errorResponse);

router.delete('/:id', errorResponse);

module.exports = router;