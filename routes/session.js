const express = require('express');
const router = express.Router();

const multer = require('multer');

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
    uploadAvatar
} = require('../controllers/sessionController');

router.get('/logout', logout);

router.get('/wallet', getUserWallet);

router.get('/minProfile', getMinProfile);

router.post('/deposit', loadUserWallet);

router.get('/transactionhistory', userWalletTransactions);

router.get('/fullProfile', getFullProfile)

router.get('/verifyemail', verifyEmail)

router.post('/avatar', upload.fields([{ name: 'avatar', maxCount: 1 }]), uploadAvatar);


module.exports = router;