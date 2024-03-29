const { FieldValue } = require('firebase-admin/firestore');
const IntaSend = require('intasend-node');

const db = require('../firebase');

const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;
const demoMode = process.env.DEMO_MODE;

const MAX_TICKETS_PER_TRANSACTION = 300;

let intasend = new IntaSend(
    null,
    intasendSecret,
    false
);

async function getMytickets(req, res) {

    try {

        const user_id = req.user.user_id;

        const ticketSnapshot = await db.collectionGroup('tickets')
            .where('ticketowner_id', '==', user_id).get();

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
        console.log(error)
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



async function enterGame(req, res) {

    try {

        //TODO: Get the user id fom request after implementing auth

        const { game_id, total_tickets, coupon_code } = req.body;


        const user_id = req.user.user_id;
        const user_name = req.user.user_name;
        const avatar = req.user.avatar;
        const wallet_id = req.user.wallet_id;

        const gameRef = db.collection('games').doc(game_id);

        const result = await db.runTransaction(async (transaction) => {
            const gameDoc = await transaction.get(gameRef);

            const creator_id = gameDoc.data().host_id;
            const ticketsTotal = gameDoc.data().tickets_total;
            const totalTicketsSold = gameDoc.data().tickets_sold;
            const ticketPrice = gameDoc.data().ticket_price;
            const creator_email = gameDoc.data().creator_email;


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

            let wallets = intasend.wallets();

            await wallets.get(wallet_id)
                .then((resp) => {

                    let customerAvailableBal = resp.available_balance;

                    if (!demoMode) {
                        if (customerAvailableBal < totalPrice) {
                            throw new Error("You are low on cash, please deposit more funds or reduce the number of tickets")
                        }
                    }

                })
                .catch((err) => {
                    console.log(`Intasend get wallet error`);
                    console.log(err);
                    throw new Error(err);
                });

            //charge wallet... transfer from user wallet to mainwallet (intra transfer)

            let chargeSuccessful = {}

            if (!demoMode) {
                let narrative = 'Purchase';

                chargeSuccessful = await wallets.intraTransfer(wallet_id, "WY7JRD0", totalPrice, narrative)
                    .then((resp) => {
                        console.log("Intra transfer response");
                        console.log(resp);

                        return resp

                    })
                    .catch((err) => {
                        console.log(`Intratransfer error`)
                        console.log(err);
                        return false

                    });

                if (!chargeSuccessful) {
                    throw new Error(`Charge failed for wallet ${wallet_id}`);
                }
            } 

            // //TODO: Get the invoice id of the transfer for tranasction reference

            const newTicketsSold = totalTicketsSold + parseInt(total_tickets);

            if (newTicketsSold == ticketsTotal) {
                transaction.update(gameRef, {
                    sold_out: true
                });
            }

            transaction.update(gameRef, {
                tickets_sold: newTicketsSold
            });

            for (let i = 0; i < parseInt(total_tickets); i++) {

                let ticketsCollectionRef = gameRef.collection('tickets').doc();

                transaction.set(ticketsCollectionRef, {
                    ticket_owner_username: user_name,
                    ticketowner_id: user_id,
                    avatar: avatar,
                    ticket_price: ticketPrice,
                    invoice_id: chargeSuccessful,
                    status: "live",
                    claimed: false,
                    won: false,
                    game_id: game_id,
                    creator_email: creator_email,
                })

            }

            const commission = parseInt(total_tickets) * 0.1 * ticketPrice;

            if (coupon_code) {

                let commissionsRef = db.collection('commissions').doc();

                transaction.set(commissionsRef, {
                    amount: commission,
                    customer: user_name,
                    game_id: game_id,
                    number_of_tickets: parseInt(total_tickets),
                    invoice_id: chargeSuccessful,
                    settled: false,
                    code: coupon_code,
                    timestamp: FieldValue.serverTimestamp()
                });

            }

            return { message: "Transaction completed successfully" };

        })

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
};