const topicName = 'game-ended-need-to-be-drawn';
// const data = JSON.stringify({foo: 'bar'});

const { PubSub } = require('@google-cloud/pubsub');
const currentDate = new Date();

const pubSubClient = new PubSub();
const db = require("../firebase");


async function publishMessage(topicNameOrId, data) {
    // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
    const dataBuffer = Buffer.from(data);

    try {
        const messageId = await pubSubClient
            .topic(topicNameOrId)
            .publishMessage({ data: dataBuffer });
        console.log(`Message ${messageId} published.`);
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);

        process.exitCode = 1;
    }
}

function getRandomInt(min, max) {

    /**
     * exclusive max
     * inclusive min
     */
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

// async function pickWinner(game_id) {
//     console.log("Picking Winner");
//     try {

//         const result = await sequelize.transaction(async (t) => {

//             let game = await Game.findByPk(game_id);

//             if (game.status === 'ended') {
//                 throw new Error("The game has already been drawn")
//             }

//             let totalTicketsSold = await game.getDataValue("tickets_sold");

//             //let ticketPrice = await game.getDataValue("ticket_price", { transaction: t });

//             //let hostId = await game.getDataValue("host_id", { transaction: t });

//             let tickets = await game.getTickets();

//             let randomIndex = getRandomInt(0, totalTicketsSold);

//             let winningTicket = tickets[randomIndex];

//             let winningTicketId = await winningTicket.getDataValue("ticket_id")

//             await winningTicket.update({ status: "won" }, { transaction: t });

//             //let winnerId = winningTicket.getDataValue("ticketowner_id", { transaction: t });

//             // let cashPrize = totalTicketsSold * ticketPrice;

//             // let winnerTakeWay = 0.7 * cashPrize;

//             // let hostTakeAway = 0.2 * cashPrize;

//             // await winnerWallet.increment({ cash: winnerTakeWay }, { transaction: t });

//             // await hostWallet.increment({ cash: hostTakeAway }, { transaction: t });

//             for (let ticket of tickets) {
//                 if (ticket.ticket_id != winningTicketId) {
//                     await ticket.update({ status: "lost" });
//                 }
//             }

//             await game.update({ status: "ended", winningTicket_id: winningTicketId }, { transaction: t });

//         });
//         console.log("Ended Game")

//         return result;

//     } catch (error) {

//         console.log(error)

//     }

// }

async function endGame() {

    console.log("Cron running");

    //TODO : Push into task cue for processing...if the game is not already on the queue.

    try {

        const gamesRef = db.collection('games');

        const isLiveAndPastDue = gamesRef
            .where('end_date', '<', currentDate)
            .where('status', '==', 'live')
            .get();

        const isLiveAndFullySold = gamesRef
            .where('sold_out', '==', true)
            .where('status', '==', 'live')


        const [isLiveAndPastDueSnp, isLiveAndFullySoldSnp] = await Promise.all(
            [isLiveAndPastDue, isLiveAndFullySold]
        );

        const pastdue = isLiveAndPastDueSnp.docs;
        const fullySold = isLiveAndFullySoldSnp.docs;

        const results = pastdue.concat(fullySold);


        // if(results.length > 0) {

        //     console.log("Found something ..................")

        //     results.forEach(async docSnapshot => {
                
    
        //         const docId = docSnapshot.id;
    
        //         const { tickets_sold } = docSnapshot.data();
    
        //         const random_int = getRandomInt(0, tickets_sold);
    
        //         await docSnapshot.ref.update(
        //             {
        //                 status: 'ended',
        //                 random_number: random_int
        //             }
        //         );
    
        //         console.log(`Document ${docId} updated successfully`);
    
        //         //publish message here...
    
        //         const message = JSON.stringify({ game_to_process: docId })
    
        //         publishMessage(topicName, message);
    
    
        //     });

        // } else {
        //     console.log("Try again later");
        // }


        console.log(results)
        



    } catch (error) {

        console.log(error)

    }

}

module.exports = { endGame };