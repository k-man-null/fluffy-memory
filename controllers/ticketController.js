const User = require('../models/user');
const Game = require('../models/games');
const Ticket = require('../models/ticket');
const sequelize = require('../connection');

const IntaSend = require('intasend-node');

const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;

async function getMytickets(req, res) {

    const tickets = [
        {
            ticket_id: 1,
            ticket_price: 50,
            status: 'won',
            createdAt: '2023-04-11T11:26:33.928Z',
            updatedAt: '2023-04-11T11:26:33.928Z',
            ticketgame_id: 1,
            ticketowner_id: 1
        },
        {
            ticket_id: 2,
            ticket_price: 50,
            status: 'lost',
            createdAt: '2023-04-11T11:26:33.928Z',
            updatedAt: '2023-04-11T11:26:33.928Z',
            ticketgame_id: 1,
            ticketowner_id: 1
        },
        {
            ticket_id: 3,
            ticket_price: 50,
            status: 'live',
            createdAt: '2023-04-11T11:26:33.928Z',
            updatedAt: '2023-04-11T11:26:33.928Z',
            ticketgame_id: 1,
            ticketowner_id: 1
        },
        {
            ticket_id: 4,
            ticket_price: 50,
            status: 'lost',
            createdAt: '2023-04-11T11:26:33.928Z',
            updatedAt: '2023-04-11T11:26:33.928Z',
            ticketgame_id: 1,
            ticketowner_id: 1
        },
        {
            ticket_id: 5,
            ticket_price: 50,
            status: 'live',
            createdAt: '2023-04-11T11:26:33.928Z',
            updatedAt: '2023-04-11T11:26:33.928Z',
            ticketgame_id: 1,
            ticketowner_id: 1
        },
        {
            ticket_id: 6,
            ticket_price: 200,
            status: 'won',
            createdAt: '2023-04-11T11:26:33.928Z',
            updatedAt: '2023-04-11T11:26:33.928Z',
            ticketgame_id: 1,
            ticketowner_id: 1
        },
        {
            ticket_id: 7,
            ticket_price: 100,
            status: 'live',
            createdAt: '2023-04-11T11:26:33.928Z',
            updatedAt: '2023-04-11T11:26:33.928Z',
            ticketgame_id: 1,
            ticketowner_id: 1
        },
        {
            ticket_id: 8,
            ticket_price: 300,
            status: 'lost',
            createdAt: '2023-04-11T11:26:33.928Z',
            updatedAt: '2023-04-11T11:26:33.928Z',
            ticketgame_id: 1,
            ticketowner_id: 1
        },
        {
            ticket_id: 9,
            ticket_price: 200,
            status: 'won',
            createdAt: '2023-04-11T11:26:33.928Z',
            updatedAt: '2023-04-11T11:26:33.928Z',
            ticketgame_id: 1,
            ticketowner_id: 1
        },
        {
            ticket_id: 10,
            ticket_price: 200,
            status: 'live',
            createdAt: '2023-04-11T11:26:33.928Z',
            updatedAt: '2023-04-11T11:26:33.928Z',
            ticketgame_id: 1,
            ticketowner_id: 10
        },
        {
            ticket_id: 11,
            ticket_price: 100,
            status: 'live',
            createdAt: '2023-04-11T11:26:33.928Z',
            updatedAt: '2023-04-11T11:26:33.928Z',
            ticketgame_id: 1,
            ticketowner_id: 11
        },

    ]

    try {

        const { user_id } = req.user.user_id;

        // let tickets = await Ticket.findAll({
        //     where: {
        //         ticketowner_id: user_id
        //     }
        // })

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

        const { game_id, total_tickets } = req.body;

        const user_id = req.user.id;

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

            console.log(req.user);


            const wallet_id = req.user.wallet_id;

            console.log(`Wallet id ${wallet_id}`)

            let intasend;

            let customerWallet;

            if (intasendPublishable && intasendSecret) {

                intasend = new IntaSend(
                    null,
                    intasendSecret,
                    false
                );

                let wallets = intasend.wallets();
                wallets
                    .get(wallet_id)
                    .then((resp) => {
                        console.log(`Get wallet response  ... ${resp}`);
                        customerWallet = resp;
                    })
                    .catch((error) => {
                        throw new Error(error);

                    });
            }

            let ticketsTotal = await game.getDataValue("tickets_total", { transaction: t });

            // if (total_tickets > maxPossibleTickets) {
            //     throw new Error("You cannot buy more than 5% of the tickets");
            // }

            let totalTicketsSold = await game.getDataValue("tickets_sold", { transaction: t });


            if (totalTicketsSold + total_tickets > ticketsTotal) {

                throw new Error("All tickets are sold for this game, please join another")

            }

            let ticketPrice = await game.getDataValue("ticket_price", { transaction: t });

            let totalPrice = ticketPrice * total_tickets;

            let cash = customerWallet.available_balance;

            if (totalPrice > cash) {
                throw new Error("You are low on cash, please deposit more funds or reduce the number of tickets")
            }

            //charge wallet... transfer from user wallet to mainwallet (intra transfer)

            let wallet = intasend.wallet();

            let amount = totalPrice;
            let narrative = 'Payment';

            wallet
                .intraTransfer(customerWallet.wallet_id, "WY7JRD0", amount, narrative)
                .then((resp) => {
                    console.log(`Intra Transfer response: ${resp}`);
                })
                .catch((err) => {
                    console.error(`Intra Transfer error: ${err}`);
                    throw new Error(err);
                });

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