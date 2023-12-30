const { FieldValue } = require('firebase-admin/firestore');
const IntaSend = require('intasend-node');

const db = require('../firebase');
const { publishMessage } = require('../utils/giveprizes');

const MAX_TICKETS_PER_TRANSACTION = 300;
const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;

let intasend = new IntaSend(
    intasendPublishable,
    intasendSecret,
    false
);

async function startMyClaim(req, res) {

    try {

        const data = req.body

        const ticket = data.ticket;
        const contact = data.contact;

        const { game_id, creator_email } = ticket;

        //check if there is such a claim first for te game before

        const claim = {
            winner_contact: contact,
            creator_will_give_prize: false,
            transaction_id: "",
            timestamp: FieldValue.serverTimestamp(),
            host_email: creator_email,
            game_id: game_id,
            closed: false,
            closed_date: null,
            accepted: false,
        }

        const claimRef = db.collection('claims').doc(game_id);
        claimRef.get()
            .then((docSnapshot) => {
                if (docSnapshot.exists) {
                    return res.status(400).send("A claim already exists for this game");
                } else {
                    return claimRef.set(
                        claim
                    ).then(() => {

                        const text = `The user has claimed ticket and is asking you to contact them on \n\n ${contact} 
                                        make sure to indicate in 24 hours 
                                        whether you will give the prize or we will give the winner 75% of the ticket sales`;

                        const data = JSON.stringify({
                            type: "claims",
                            recipient: creator_email,
                            email_text: text,
                            subject: "TikiTiki Claim Process"
                        })

                        publishMessage("email-to-send", data);

                        return res.status(200).send('The claim has been created we will get back to you');
                    })
                        .catch(error => {
                            console.log(error);
                            return res.status(400)
                        })
                }
            })


    } catch (error) {
        return res.status(500);
    }

}

async function getClaim(req, res) {

    try {

        const game_id = req.params.game_id;

        const docref = db.collection('claims').doc(game_id);

        const claimDoc = await docref.get();


        if (!claimDoc.exists) {
            throw new Error("You have no claims");
        }

        const claim = {
            claim_id: claimDoc.id,
            ...claimDoc.data()
        }


        return res.status(200).json({
            claim
        })

    } catch (error) {
        return res.status(400).json(error.message)
    }
}

async function updateClaim(req, res) {

    try {

        const game_id = req.params.game_id;

        const data = req.body;

        const claimRef = db.collection('claims').doc(game_id);

        const { creator_has_made_choice, host_email, winner_has_made_choice } = (await claimRef.get()).data();

        const isUserCreator = req.user.email === host_email;

        if(creator_has_made_choice && isUserCreator) {
            return res.status(400).json("Your choice is final!!");
        }


        if(winner_has_made_choice) {
            return res.status(400).json("Your choice is final!!");
        }
    
        const claim = await claimRef.update(data);

        return res.status(200).json({
            claim
        })

    } catch (error) {
        return res.status(400).json(error.message)
    }
}



module.exports = {
    startMyClaim, getClaim, updateClaim
};