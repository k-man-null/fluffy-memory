const User = require('../models/user');
const Game = require('../models/games');
const Ticket = require('../models/ticket');
const db = require('../firebase');

const IntaSend = require('intasend-node');

const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;
const MAX_TICKETS_PER_TRANSACTION = 300;

async function getMytickets(req, res) {

    try {

        const user_id = req.user.user_id;

        const ticketQuery = db.collectionGroup('tickets')
            .where('ticketowner_id', '==', user_id)
            .where('status', '==', 'live');

        const ticketSnapshot = await ticketQuery.get();

        if (ticketSnapshot.empty) {
            throw new Error("You have no live tickets");
        }

        const tickets = ticketSnapshot.docs.map((doc) => {
            const data = doc.data();

            return {
                ticket_id: doc.id,
                ...data,

            };
        });

        return res.status(200).json({
            tickets
        })

    } catch (error) {
        return res.status(400).json(error.message)
    }
}

async function getMyLiveTickets(req, res) {

    try {

        const user_id = req.user.user_id;

        const ticketQuery = db.collectionGroup('tickets')
            .where('ticketowner_id', '==', user_id)
            .where('status', '==', 'live');

        const ticketSnapshot = await ticketQuery.get();

        if (ticketSnapshot.empty) {
            throw new Error("You have no live tickets");
        }

        const tickets = ticketSnapshot.docs.map((doc) => {
            const data = doc.data();

            return {
                ticket_id: doc.id,
                ...data,

            };
        });

        return res.status(200).json({
            tickets
        })

    } catch (error) {
        return res.status(400).json(error.message)
    }
}

async function getMyLostTickets(req, res) {

    try {

        const { user_id } = req.user;

        let tickets = await Ticket.findAll({
            where: {
                ticketowner_id: user_id,
                status: "lost"
            }
        })

        return res.status(200).json({
            tickets
        })

    } catch (error) {
        return res.status(400).json(error.message)
    }
}

async function getMyWonTickets(req, res) {

    try {

        const { user_id } = req.user;

        let tickets = await Ticket.findAll({
            where: {
                ticketowner_id: user_id,
                status: "won"
            }
        })

        return res.status(200).json({
            tickets
        })

    } catch (error) {
        return res.status(400).json(error.message)
    }
}

async function enterGame(req, res) {

    try {

        //TODO: Get the user id fom request after implementing auth

        const { game_id, total_tickets } = req.body;


        const user_id = req.user.user_id;
        const user_name = req.user.user_name;
        const avatar = req.user.avatar;
        const wallet_id = req.user.wallet_id;


        //get the user wallet

        //check the current balance
        //compute the  total amount.. game.ticketprice * total_tickets
        //if the total amount is greater than the current balance,
        //resspond with failed, need to topup
        //else 
        //check if there are enough remaining tickets to fulfil purchase
        //if there are not enough, respond with not enoug tickets remaining only X amount remaining
        //else ...proceed
        //charge the wallet the wallet the total amount
        //if charge was not successful, respond with reason
        //else create the tickets of the total number and respond with tickets

        //TODO: also include notify to firebase to communicate with game creatores that the user has purcahed tickets.


        const gameRef = db.collection('games').doc(game_id);
        const ticketsCollectionRef = gameRef.collection('tickets').doc();


        const result = await db.runTransaction(async (transaction) => {
            const gameDoc = await transaction.get(gameRef);

            const creator_id = gameDoc.data().host_id;
            const ticketsTotal = gameDoc.data().tickets_total;
            const totalTicketsSold = gameDoc.data().tickets_sold;
            const ticketPrice = gameDoc.data().ticket_price;


            if (creator_id === user_id) {
                throw new Error("You cannot enter the game you created");
            }

            if (parseInt(total_tickets) > MAX_TICKETS_PER_TRANSACTION) {
                throw new Error("You can only buy a maximum of 300 tickets per transaction")
            }

            if (totalTicketsSold + parseInt(total_tickets) > ticketsTotal) {
                throw new Error("All tickets are sold for this game, please join another")
            }

            let totalPrice = ticketPrice * parseInt(total_tickets);

            let intasend;

            intasend = new IntaSend(
                null,
                intasendSecret,
                false
            );

            // let collection = intasend.collection();
            let wallets = intasend.wallets();

            await wallets.get(wallet_id)
                .then((resp) => {
                    let customerAvailableBal = resp.available_balance;

                    //TODO: Convert back to customerAvailableBal < totalprice

                    if (0 > customerAvailableBal) {
                        throw new Error("You are low on cash, please deposit more funds or reduce the number of tickets")
                    }
                })
                .catch((err) => {
                    console.log(`Intasend get wallet error`);
                    console.log(err);
                    throw new Error(err);
                });

            //charge wallet... transfer from user wallet to mainwallet (intra transfer)'

            //TODO: In production, make sure the wallet is charged (Uncomment)

            // let narrative = 'Payment';

            //const chargeSuccessful =  await wallets.intraTransfer(wallet_id, "WY7JRD0", 40, narrative)
            //     .then((resp) => {
            //         console.log("Intra transfer response");
            //         console.log(resp);

            //          return true

            //     })
            //     .catch((err) => {
            //         console.log(`Intratransfer error`)
            //         console.log(err);
            //         return false
            //         throw new Error(err);

            //     });

            //TODO: Get the invice id of the transfer for tranasction reference

            // if (!chargeSuccessful) {
            //     throw new Error(`Charge failed for wallet ${wallet_id}`);
            // }

            const newTicketsSold = totalTicketsSold + parseInt(total_tickets);

            transaction.update(gameRef, {
                tickets_sold: newTicketsSold
            });

            let ticketsCollectionRef = gameRef.collection('tickets').doc();

            for (let i = 0; i < parseInt(total_tickets); i++) {


                transaction.set(ticketsCollectionRef, {
                    ticket_owner_username: user_name,
                    ticketowner_id: user_id,
                    avatar: avatar,
                    ticket_price: ticketPrice,
                    invoice_id: "invoice_id",
                    status: "live",
                    drawn: false,
                    won: false
                })

    
            }

            return { message: "Transaction completed successfully" };

        })

        // let game = await Game.findByPk(game_id, { lock: true, transaction: t });

        // // const wallet_id = req.user.wallet_id;

        // let ticketsTotal = game.tickets_total;

        // let creator_id = game.host_id;

        // if (creator_id === user_id) {
        //     throw new Error("You cannot enter the game you created");
        // }

        // let totalTicketsSold = game.tickets_sold;

        // if (totalTicketsSold + parseInt(total_tickets) > ticketsTotal) {

        //     throw new Error("All tickets are sold for this game, please join another")

        // }

        // let ticketPrice = await game.ticket_price;

        // let totalPrice = ticketPrice * total_tickets;

        // let intasend;

        // intasend = new IntaSend(
        //     null,
        //     intasendSecret,
        //     false
        // );

        // // let collection = intasend.collection();
        // let wallets = intasend.wallets();


        // await wallets.get(wallet_id)
        //     .then((resp) => {
        //         let customerAvailableBal = resp.available_balance;

        //         //TODO: Convert back to customerAvailableBal < totalprice

        //         if (0 > customerAvailableBal) {
        //             throw new Error("You are low on cash, please deposit more funds or reduce the number of tickets")
        //         }
        //     })
        //     .catch((err) => {
        //         console.log(`Intasend get wallet error`);
        //         console.log(err);
        //         throw new Error(err);
        //     });

        //charge wallet... transfer from user wallet to mainwallet (intra transfer)'

        //TODO: In production, make sure the wallet is charged (Uncomment)

        // let narrative = 'Payment';

        // await wallets.intraTransfer(wallet_id, "WY7JRD0", 40, narrative)
        //     .then((resp) => {
        //         console.log("Intra transfer response");
        //         console.log(resp);

        //     })
        //     .catch((err) => {
        //         console.log(`Intratransfer error`)
        //         console.log(err);
        //         throw new Error(err);

        //     });

        //TODO: Get the invice id of the transfer for tranasction reference

        return res.status(200).json({
            result
        });

    } catch (error) {

        console.log(error);

        return res.status(400).json(error.message);

    }

}

module.exports = {
    enterGame,
    getMytickets,
    getMyLiveTickets,
    getMyLostTickets,
    getMyWonTickets
};