const User = require('../models/user');
const Game = require('../models/games');
const TicketBank = require('../models/affiliateaccount')
const Ticket = require('../models/ticket');
const sequelize = require('../connection');

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

        const { user_id } = req.user;

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

        const result = await sequelize.transaction(async (t) => {

            let game = await Game.findByPk(game_id, { lock: true, transaction: t });

            let host_id = game.getDataValue("host_id");

            let ticketsTotal = await game.getDataValue("tickets_total", { transaction: t });

            let maxPossibleTickets = Math.abs(0.05 * ticketsTotal);

            if (total_tickets > maxPossibleTickets) {
                throw new Error("You cannot buy more than 5% of the tickets");
            }

            let totalTicketsSold = await game.getDataValue("tickets_sold", { transaction: t });

            let user = await User.findByPk(user_id, { transaction: t });

            if (totalTicketsSold + total_tickets > ticketsTotal) {

                throw new Error("All tickets are sold for this game, please join another")

            }

            let ticketPrice = await game.getDataValue("ticket_price", { transaction: t });

            let totalPrice = ticketPrice * total_tickets;

            let inventory = await user.getInventory({ transaction: t });

            let cash = await inventory.getDataValue("cash", { transaction: t });

            if (totalPrice > cash) {
                throw new Error("You are low on cash, please deposit more funds or reduce the number of tickets")
            }

            let ticketBank = await TicketBank.findOne({
                where: {
                    host_id: host_id
                }
            }, { transaction: t });

            await ticketBank.decrement({ [ticketPrice]: total_tickets }, { transaction: t });

            let updatedInve = await inventory.decrement({ cash: totalPrice }, { transaction: t });

            let addedTickets = await game.increment({ tickets_sold: total_tickets }, { transaction: t });

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
                updatedInventory: updatedInve
            }

            return result;

        });

        return res.status(200).json({
            message: "Transaction was successful",
            purchaseResult: result
        });

    } catch (error) {

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