const express = require('express');

const router = express.Router();

const { 
    saveUser,
    loginUser,
    changePassword,
    forgotPassword
} = require('../controllers/userController')


router.get('/:id', (req,res) => {
    const id =  req.params.id;
    res.send(`You hit the get id: ${id}`)
});

router.post('/recoverpassword', forgotPassword);

router.post('/forgotpassword', changePassword);

router.post('/register', saveUser);

router.post('/login', loginUser);

router.put('/password',changePassword);

router.patch('/:id');

router.delete('/:id');

module.exports = router;