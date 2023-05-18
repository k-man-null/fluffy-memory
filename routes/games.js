const express = require('express');
const router = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ storage });

const { 
    createGame, 
    getGame,
    getAllGames,
    getMyEndedGames,
    getMyLiveGames,
    getGameCreator
} = require('../controllers/gameController');

const errorResponse = require('../controllers/error');

router.get('/', (req,res) => {
    res.send("You hit the get")
});

router.get('/all', getAllGames);

router.get('/my/live/', getMyLiveGames);

router.get('/my/ended/', getMyEndedGames);

router.get('/:id', getGame);

router.get('/gamecreator/:id', getGameCreator);

router.post('/', upload.fields([{ name: 'images', maxCount: 5 }]), createGame);

router.put('/*', errorResponse);

router.patch('/*', errorResponse);

router.delete('/*', errorResponse );

module.exports = router;