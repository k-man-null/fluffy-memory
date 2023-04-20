const User = require('../models/user');
const Game = require('../models/games');
const Ticket = require('../models/ticket');
const sequelize = require('../connection');

const IntaSend = require('intasend-node');

const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;

async function getMytickets(req, res) {

    try {

        const user_id = req.user.user_id;

        let tickets = await Ticket.findAll({
            where: {
                ticketowner_id: user_id
            }
        })

        return res.status(200).json({
            tickets
        })

    } catch (error) {
        return res.status(400).json(error.message)
    }
}

async function getMyLiveTickets(req, res) {

    try {

        const { user_id } = req.user;

        let tickets = await Ticket.findAll({
            where: {
                ticketowner_id: user_id,
                status: "live"
            }
        })

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

        const { game_id, total_tickets, phone_number } = req.body;

        const user_id = req.user.user_id;

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


        const result = await sequelize.transaction(async (t) => {

            let game = await Game.findByPk(game_id, { lock: true, transaction: t });

            const wallet_id = req.user.wallet_id;

            let ticketsTotal = game.tickets_total;

            // if (total_tickets > maxPossibleTickets) {
            //     throw new Error("You cannot buy more than 5% of the tickets");
            // }

            let totalTicketsSold = game.tickets_sold;

            if (totalTicketsSold + total_tickets > ticketsTotal) {

                throw new Error("All tickets are sold for this game, please join another")

            }

            let ticketPrice = await game.ticket_price;

            let totalPrice = ticketPrice * total_tickets;

            let intasend;

            intasend = new IntaSend(
                null,
                intasendSecret,
                false
            );

            let collection = intasend.collection();

            //TODO: Rework when support for customer wallet comes back, 
            //meanwhule charge the customer directly with stk push
            // await wallets.get(wallet_id)
            //     .then((resp) => {
            //         let customerAvailableBal = resp.available_balance;

            //         if (totalPrice > customerAvailableBal) {
            //             throw new Error("You are low on cash, please deposit more funds or reduce the number of tickets")
            //         }
            //     });

            // //charge wallet... transfer from user wallet to mainwallet (intra transfer)

            // console.log({
            //     amount: totalPrice,
            //     phone_number: phone_number,
            //     wallet_id: "WY7JRD0"
            // })

            await collection.mpesaStkPush({
                amount: totalPrice,
                phone_number: phone_number
                })
                .then((resp) => {
                    console.log(resp);
                })
                .catch((err) => {
                    console.log(`Stk push error: ${err}`);
                    throw new Error(err);

                })


            await game.increment({ tickets_sold: total_tickets }, { transaction: t });

            const tickets = []

            for (let i = 0; i < total_tickets; i++) {
                const ticket = await Ticket.create({
                    ticketgame_id: game_id,
                    ticketowner_id: user_id,
                    ticket_price: game.ticket_price
                }, { transaction: t })

                tickets.push(ticket.toJSON());
            }

            let result = {
                tickets: tickets,
            }

            return result;

        });

        return res.status(200).json({
            message: "Transaction was successful",
            purchaseResult: result
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