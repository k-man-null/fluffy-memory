const express = require('express');
const router = express.Router();
const { 
    saveUser,
    loginUser,
    changePassword
} = require('../controllers/userController')


router.get('/:id', (req,res) => {
    const id =  req.params.id;
    res.send(`You hit the get id: ${id}`)
});

router.post('/register', saveUser);

router.post('/login', loginUser);

router.put('/password',changePassword);

router.patch('/:id');

router.delete('/:id');

module.exports = router;