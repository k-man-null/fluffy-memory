const Game = require('../models/games');
const User = require('../models/user');

const db = require("../firebase");
const { Timestamp } = require('firebase-admin/firestore');

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

const bucketName = process.env.IMAGE_BUCKET;
const serveFolderName = "compressed";
const uploadFolderName = "uncompressed";
const path = require('path');


const { v4: uuidv4 } = require('uuid');
// const axios = require('axios');


function uploadFromMemory(file) {

    const fileExtension = path.extname(file.originalname);

    const uniqueId = uuidv4();

    // Generate a unique filename with the extension
    const uploadfilename = `${uploadFolderName}/${uniqueId}${fileExtension}`;
    const servefilename = `${serveFolderName}/${uniqueId}.webp`;


    return storage.bucket(bucketName).file(uploadfilename).save(file.buffer).then(() => {

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${servefilename}`;

        console.log(
            `${uploadfilename} uploaded to ${bucketName}.`
        );

        return publicUrl;

    })

}


async function createGame(req, res) {

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

        game.host_id = req.user.user_id;
        game.EndDate = Timestamp.fromDate(new Date(game.EndDate));

        /**
         * The sweet code here was before I picked google cloud storage 
         * for user generated images for cdn delivery.
         * 
         * it sends the imgage buffers to a nodejs server
         * thta compresses them and converts them to webp 
         * returs success or failure
         * 
         * I will have to use cloud invocations (2 million free per month)
         * to compress the images and convert them to webp
         * 
         * 
         * const imageUploadPromises = req.files.images.map((file) => {
            const filename = uuidv4();
            const imageName = `${filename}.webp`;

            const options = {
                url: `${imageUploadServer}/upload/${filename}`,
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
         * 
         * 
         */



        const imageUploadPromises = req.files.images.map((file) => {

            return uploadFromMemory(file);

        });


        const images = await Promise.all(imageUploadPromises);

        // Create game in the database
        const new_game_data =
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
            tickets_sold: 0,
            status: "live",
            released: false,
            winningTicket_id: null,
            release_transaction_id: null,
            closed_date: null
        }

        await db.collection('games').add(new_game_data);

        return res.status(200).json({ done: "Success" });

    } catch (error) {

        return res.status(400).send("Error creating the competition");
    }

}

async function getGame(req, res) {

    try {

        const id = req.params.id;

        const gameSnapshot = await db.collection("games").doc(id).get();


        if (!gameSnapshot.exists) {
            return res.status(400).json({ message: "Game not found" });
        }

        const data = gameSnapshot.doc();

        const endDate = new Date(data.end_date._seconds * 1000).toISOString();

        const gameFormatted = {
            game_id: data.id,
            end_data: endDate,
            ...data
        }

        return res.status(200).json(
                gameFormatted
            );

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

        const id = req.user.user_id;

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

        const id = req.user.user_id;

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

        const gamesSnapshot = await db.collection('games').get();

        if (gamesSnapshot.empty) {
            return res.status(400).json({ message: "No games found" });
        }

        const games = gamesSnapshot.docs.map((doc) => {
            const data = doc.data();
            const endDate = new Date(data.end_date._seconds * 1000).toISOString();

            return {
                game_id: doc.id,
                end_date: endDate,
                ...data,
            };
        });


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
    getGameCreator,
    uploadFromMemory
}