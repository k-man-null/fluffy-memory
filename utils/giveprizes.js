const User = require('../models/user');
const Game = require('../models/games');
const Ticket = require('../models/ticket');
const sequelize = require('../connection');
const { Op } = require('sequelize');
const currentDate = new Date();


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

async function pickWinner(game_id) {

    try {

        const result = await sequelize.transaction(async (t) => {

            let game = await Game.findByPk(game_id, { transaction: t });

            if (game.released) {
                throw new Error("The game has already been drawn")
            }

            let totalTicketsSold = await game.getDataValue("tickets_sold", { transaction: t });

            let ticketPrice = await game.getDataValue("ticket_price", { transaction: t });

            let hostId = await game.getDataValue("host_id", { transaction: t });

            let tickets = await game.getTickets({ transaction: t });

            let randomIndex = getRandomInt(0, totalTicketsSold);

            let winningTicket = tickets[randomIndex];

            let winningTicketId = await winningTicket.getDataValue("ticket_id", { transaction: t })

            await winningTicket.update({ status: "won" }, { transaction: t });

            let winnerId = winningTicket.getDataValue("ticketowner_id", { transaction: t });

            let winner = await User.findByPk(winnerId, { transaction: t });

            let host = await User.findByPk(hostId, { transaction: t });

            let winnerWallet = await winner.getInventory({ transaction: t });

            let hostWallet = await host.getInventory({ transaction: t });

            let cashPrize = totalTicketsSold * ticketPrice;

            let winnerTakeWay = 0.7 * cashPrize;

            let hostTakeAway = 0.2 * cashPrize;

            await winnerWallet.increment({ cash: winnerTakeWay }, { transaction: t });

            await hostWallet.increment({ cash: hostTakeAway }, { transaction: t });

            for (let ticket of tickets) {
                if (ticket.ticket_id != winningTicketId) {
                    await ticket.update({ status: "lost" }, { transaction: t });
                }
            }

            await game.update({ status: "ended", released: true, winningTicket_id: winningTicketId }, { transaction: t });

        });

    } catch (error) {

        console.log(error.message)

    }

}

async function endGame() {

    try {

        const result = await sequelize.transaction(async (t) => {

            const gamesPendingCompletion = await Game.findAll({
                where: {
                  [Op.or]: [
                    { tickets_sold: { [Op.eq]: sequelize.col('tickets_total') } },
                    { end_date: { [Op.lt]: currentDate } }
                  ],
                  released: false
                }
              }, { transaction: t });

              return gamesPendingCompletion;
        });

        console.table(result);

        return result;

    } catch (error) {

        console.log(error.message)

    }

}

module.exports = { pickWinner, endGame };