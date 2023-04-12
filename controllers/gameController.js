const Game = require('../models/games');
const User = require('../models/user');

const sequelize = require('../connection');

const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

async function createGame(req, res) {

    let t;

    try {

        const game = {
            title,
            description,
            PrizeDescription,
            TicketPrice,
            TotalTickets,
            Delivery,
            location,
            prizeCategory,
            EndDate,
        } = { ...req.body };

        // TODO: Get host id from request.user
        game.host_id = 1;
        game.EndDate = new Date(game.EndDate);

        t = await sequelize.transaction();

        const imageUploadPromises = req.files.images.map((file) => {
            const filename = uuidv4();
            const imageName = `${filename}.webp`;

            const options = {
                url: `http://localhost:5000/upload/${filename}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                data: file.buffer,
            };

            return axios(options).then((response) => {
                // console.log(`STATUS: ${response.status}`);
                // console.log(`BODY: ${response.data}: image ${1}`);
                return imageName;
            });
        });

        const images = await Promise.all(imageUploadPromises);

        // Create game in the database
        const new_game = await Game.create(
            {
                title: game.title,
                game_description: game.description,
                prize_description: game.PrizeDescription,
                ticket_price: game.TicketPrice,
                tickets_total: game.TotalTickets,
                delivery: game.Delivery,
                end_date: game.EndDate,
                host_id: game.host_id,
                prize_images: images,
            },
            { transaction: t }
        );

        console.log(new_game);

        await t.commit();

        return res.status(200).json({ done: new_game });

    } catch (error) {
        if (t && t.finished !== 'commit') {
            await t.rollback();
        }

        console.log(error);

        return res.status(400).send("Error creating the competition");
    }

}

async function getGame(req, res) {

    console.log("I got hit");

    try {

        const id = req.params.id;

        const game = await Game.findByPk(id);

        if (game === null) {
            return res.status(400).json({ message: "Game not found" });
        }
        return res.status(200).json(game);

    } catch (error) {

        return res.status(500).send("Internal server error");

    }

}

async function getGameCreator(req, res) {

    try {

        const id = req.params.id;

        const gameCreator = await User.findByPk(id);

        if (gameCreator === null) {
            return res.status(400).json({ message: "Creator not found" });
        }

        const creatorPartial = {
            name: gameCreator.user_name,
            avatar: gameCreator.profile_image,
            id: gameCreator.user_id
        }

        return res.status(200).json(creatorPartial);

    } catch (error) {

        return res.status(500).send("Internal server error");

    }

}

async function getMyLiveGames(req, res) {

    try {

        const id = req.params.id;

        const games = await Game.findAll({
            where: {
                host_id: id,
                status: 'live'
            }
        });

        if (games === null) {
            return res.status(400).json({ message: "You have no live games" });
        }

        return res.status(200).json(games);

    } catch (error) {

        return res.status(500).send("Internal server error");

    }

}

async function getMyEndedGames(req, res) {

    try {

        const id = req.params.id;

        const games = await Game.findAll({
            where: {
                host_id: id,
                status: 'ended'
            }
        });
        if (games === null) {
            return res.status(400).json({ message: "You have no ended games" });
        }
        return res.status(200).json(games);

    } catch (error) {

        return res.status(500).send("Internal server error");

    }

}

async function getAllGames(req, res) {

    //TODO: paginate due to the possible large response size


    try {

        const games = await Game.findAll();

        if (games === null) {
            return res.status(400).json({ message: "No games found" });
        }
        return res.status(200).json(games);

    } catch (error) {

        return res.status(500).send(error);

    }

}

async function getAllLiveGames(req, res) {

    try {

        const games = await Game.findAll({
            where: {
                status: "live"
            }
        });

        if (games === null) {
            return res.status(400).json({ message: "No live games found" });
        }
        return res.status(200).json(games);

    } catch (error) {

        return res.status(500).send(error);

    }

}

module.exports = {
    createGame,
    getGame,
    getAllGames,
    getAllLiveGames,
    getMyEndedGames,
    getMyLiveGames,
    getGameCreator
}