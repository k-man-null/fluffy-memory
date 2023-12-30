const express = require('express');
const multer = require('multer');

const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({ storage });

const { 
    logout,
    getMinProfile,
    getUserWallet,
    loadUserWallet,
    userWalletTransactions,
    getFullProfile,
    verifyEmail,
    uploadAvatar,
    getWinnerProfile,
    verifyEmailCallBack
} = require('../controllers/sessionController');

router.get('/logout', logout);

router.get('/wallet', getUserWallet);

router.get('/minProfile', getMinProfile);

router.get('/winner/', getWinnerProfile);

router.post('/deposit', loadUserWallet);

router.get('/transactionhistory', userWalletTransactions);

router.get('/fullProfile', getFullProfile);

router.get('/verifyemail', verifyEmail);

router.get('/verifyemail/:token', verifyEmailCallBack);

router.post('/avatar', upload.fields([{ name: 'avatar', maxCount: 1 }]), uploadAvatar);


module.exports = router;