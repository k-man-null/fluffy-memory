const { Timestamp } = require('firebase-admin/firestore');
const { v4: uuidv4 } = require('uuid')
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const db = require("../firebase");

const bucketName = process.env.IMAGE_BUCKET;
const serveFolderName = "compressed";
const uploadFolderName = "uncompressed";

const storage = new Storage();

function uploadFromMemory(file) {

    const fileExtension = path.extname(file.originalname);

    const uniqueId = uuidv4();

    // Generate a unique filename with the extension
    const uploadfilename = `${uploadFolderName}/${uniqueId}${fileExtension}`;
    const servefilename = `${uniqueId}.webp`;

    const metadata = {
        metadata: {
            type: file.fieldname
        }
    }


    return storage.bucket(bucketName).file(uploadfilename).save(file.buffer, { metadata }).then(() => {

        const publicUrl = servefilename;

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
        game.creator_email = req.user.email;

        
        game.EndDate = Timestamp.fromMillis(game.EndDate);


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

        if(images.length < 1) {
            throw new Error("A competition must have an image of the prize");
        }

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
            creator_email: game.creator_email,
            prize_images: images,
            tickets_sold: 0,
            sold_out: false,
            status: "live",
            released: false,
            winningTicket_id: null,
            release_transaction_id: null,
            closed_date: null,
            drawn: false
        }

        await db.collection('games').add(new_game_data);

        return res.status(200).json({ done: "Success" });

    } catch (error) {

        return res.status(400).send(error.message);
    }

}

async function getGame(req, res) {

    try {

        const id = req.params.id;

        const gameSnapshot = await db.collection("games").doc(id).get();

        if (!gameSnapshot.exists) {
            return res.status(400).json({ message: "Game not found" });
        }

        const data = gameSnapshot.data();

        const endDate = new Date(data.end_date._seconds * 1000).toISOString();

        const gameFormatted = {
            game_id: data.id,
            ...data,
            end_date: endDate
        }

        return res.status(200).json(
            gameFormatted
        );

    } catch (error) {
        console.log(error)

        return res.status(500).send("Internal server error");

    }

}

async function getGameCreator(req, res) {

    try {

        const id = req.params.id;

        const userSnapshot = await db.collection("users").doc(id).get();


        if (!userSnapshot.exists) {
            return res.status(400).json({ message: "Creator not found" });
        }

        const gameCreator = userSnapshot.data();

        const creatorPartial = {
            name: gameCreator.user_name,
            avatar: gameCreator.avatar,
            id: gameCreator.id
        }

        return res.status(200).json(creatorPartial);

    } catch (error) {

        return res.status(500).send("Internal server error");

    }

}

async function getMyLiveGames(req, res) {

    try {

        const id = req.user.user_id;

        const gamesRef = db.collection('games');
        const query = gamesRef.where('host_id', '==', id).where('status', '==', 'live');
        const querySnapshot = await query.get();

        if (querySnapshot.empty) {
            return res.status(400).json({ message: "You have no live games" });
        }

        const games = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const endDate = new Date(data.end_date._seconds * 1000).toISOString();

            return {
                game_id: doc.id,
                ...data,
                end_date: endDate
            };
        });

        return res.status(200).json(games);

    } catch (error) {

        return res.status(500).send("Internal server error");

    }

}

async function getMyEndedGames(req, res) {

    try {

        const id = req.user.user_id;

        const gamesRef = db.collection('games');
        const query = gamesRef.where('host_id', '==', id).where('status', '==', 'ended');
        const querySnapshot = await query.get();


        if (querySnapshot.empty) {
            return res.status(400).json({ message: "You have no ended games" });
        }

        const games = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const endDate = new Date(data.end_date._seconds * 1000).toISOString();

            return {
                game_id: doc.id,
                ...data,
                end_date: endDate
            };
        });
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
                ...data,
                end_date: endDate
            };
        });


        return res.status(200).json(games);

    } catch (error) {

        return res.status(500).send(error);

    }

}


module.exports = {
    createGame,
    getGame,
    getAllGames,
    getMyEndedGames,
    getMyLiveGames,
    getGameCreator,
    uploadFromMemory
}