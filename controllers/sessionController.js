const IntaSend = require('intasend-node');
const db = require('../firebase');
const { uploadFromMemory } = require("../controllers/gameController");
const baseUrl = "https://tikitiki-api--server-cbjzk2a2wq-uc.a.run.app";
const baseUrlFront = "https://tikitiki.me";
const jwt = require('jsonwebtoken');

const { publishMessage } = require("../utils/giveprizes");

const intasendPublishableTest = process.env.INTASEND_PUBLISHABLE_TOKEN_TEST;
const intasendSecretTest = process.env.INTASEND_SECRET_TOKEN_TEST;

const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;



let intasend = new IntaSend(
    intasendPublishable,
    intasendSecret,
    false
);

async function logout(req, res) {

    return res.status(200)
        .clearCookie('__session', { httpOnly: true, secure: true, sameSite: 'none' })
        .json({ message: "logged out" })

}

async function getMinProfile(req, res) {


    return res.status(200).json(req.user);

}

async function getWinnerProfile(req, res) {

    //TODO: migrate

    try {

        const game_id = req.query.game;
        const winner_ticket_id = req.query.won_ticket_id;

        console.log(`Game ${game_id} :: winning_ticket ${winner_ticket_id}`)

        const docPath = `games/${game_id}/tickets/${winner_ticket_id}`

        const ticketQuery = db.doc(docPath);

        const ticket = await ticketQuery.get();

        if (!ticket.exists) {
            throw new Error("You have no winning ticket");
        }

        const data = ticket.data();

        return res.status(200).json(
            {
                profile_image: data.avatar,
                user_name: data.ticket_owner_username
            });

    } catch (error) {

        console.log(error);

        return res.status(400).json({ message: "User not found" });

    }

}


async function verifyEmail(req, res) {

    try {

        const to = req.user.email;

        const code = jwt.sign(req.user, "myprivatekeytochange");

        const text = "To verify your email, click the link below. The link is only valid for 5 minutes"

        const link = `${baseUrl}/session/verifyemail/${code}`

        const data = JSON.stringify({
            type: "verify_email",
            recipient: to,
            email_text: text,
            verify_email_link: link,
            subject: "TikiTiki email verification"
        })

        console.log(data);

        publishMessage("email-to-send", data);

        return res.status(200).json({ message: "We sent you an email to verify your account" });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error verifying email" });

    }


}

async function verifyEmailCallBack(req, res) {

    try {

        console.log("I got called back for verification...............");

        const token = req.params.token

        jwt.verify(token, "myprivatekeytochange", async (err, decoded) => {
            if (err) {
                console.log(err);
                return res.json({ message: "Invalid Token" });
            }

            const { user_id } = decoded;

            const user_ref = db.collection('users').doc(user_id);

            await user_ref.update({
                verified: true
            });

            return res.redirect(200, `${baseUrlFront}/app/profile`);

        })

    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error verifying email" });
    }
}

async function getFullProfile(req, res) {

    try {

        const id = req.user.user_id;

        const usersCollection = db.collection('users');

        const userDocRef = usersCollection.doc(id);

        const user = await userDocRef.get();

        if (user.empty) {
            throw new Error("User not found")  // or throw an error
        }

        const userData = user.data();

        const full_profile = {
            user_id: req.user.user_id,
            user_name: userData.user_name,
            email: userData.email,
            phone_number: userData.phone,
            wallet_id: userData.wallet_id,
            full_name: `${userData.first_name} ${userData.last_name}`,
            avatar: userData.avatar,
            verified: userData.verified
        };

        return res.status(200).json(full_profile);

    } catch (error) {
        return res.status(400).json({ message: error.message });

    }

}

async function getUserWallet(req, res) {

    console.log(req.user)

    try {

        const id = req.user.user_id;

        const wallet_id = req.user.wallet_id;

        const usersCollection = db.collection('users');

        const userDocRef = usersCollection.doc(id);

        const user = await userDocRef.get();

        if (!user.exists) {
            return res.status(400).json({ message: `User not found` });
        }

        let wallets = intasend.wallets();

        console.log(wallet_id);

        wallets
            .get(wallet_id)
            .then((resp) => {
                return res.status(200).json(
                    resp
                );
            })
            .catch((error) => {
                console.log(`Error Get wallet inside catch1 ${error}`)
                return res.status(400).json({ message: `Wallet not found` });

            });


    } catch (error) {

        console.log(`Error Get wallet inside catch2 ${error}`)

        res.status(500).send("Internal server error");

    }

}

async function createUserWallet(req, res) {

    //TODO: migrate

    try {

        const id = req.user.user_id;

        const user_name = req.user.user_name;

        const usersCollection = db.collection('users');

        const userDocRef = usersCollection.doc(id);

        const user = await userDocRef.get();

        if (!user.exists) {
            return res.status(400).json({ message: `User not found` });
        }

        // let intasend;

        // if (intasendPublishable && intasendSecret) {

        //     intasend = new IntaSend(
        //         null,
        //         intasendSecret,
        //         false
        //     );
        // }

        // let wallets = intasend.wallets();

        // let user;

        //TODO : Uncomment in production...to avoid creating unnceccessary wallets

        //    const { wallet_id } = await wallets.create({
        //         label: `${user_name}`,
        //         wallet_type: 'WORKING',
        //         currency: 'KES',
        //         can_disburse: true
        //     })
        //     .then((res) => {
        //         return res
        //     })
        //     .catch((err) => {
        //         console.log(err)
        //         throw new Error("Intasend wallet create error");
        //     });

        // const wallet_id = "0XZZQEY"

        const updateData = { wallet_id: 'new_wallet_id_value' };
        await userDocRef.set(updateData, { merge: true });

        return res.status(200).json({

            message: `User wallet for ${user_name} created`
        });


    } catch (error) {

        console.log(`Error wallet inside catch2 ${error}`)

        res.status(500).send("Internal server error");

    }

}

async function loadUserWallet(req, res) {

    try {

        const phone_number = req.body.phone_number;

        const amount = req.body.amount;

        const wallet_id = req.user.wallet_id;

        const narrative = "Deposit";

        let intasend;

        if (intasendPublishable && intasendSecret) {

            intasend = new IntaSend(
                null,
                intasendSecret,
                false
            );

            let collection = intasend.collection();

            const response = await collection.mpesaStkPush({
                wallet_id: wallet_id,
                phone_number: phone_number,
                amount: amount,
                narrative: narrative
            })

            const data = JSON.stringify(response);

            if (!data.hasOwnProperty("invoice")) {
                return res.status(400).json({ message: data });
            }

            const invoiceId = data.invoice.invoice_id;

            const statusTransaction = await collection.status(invoiceId);

            const statusTransactionObj = JSON.stringify(statusTransaction);

            if (!statusTransactionObj.hasOwnProperty("invoice")) {
                return res.status(400).json({ message: statusTransaction });
            }

            return res.status(200).json({ message: "We have received your deposit request" });

        }

    } catch (error) {

        //console.log(`Error loading wallet catch2 ${error}`);

        res.status(500).send("Internal server error");

    }

}

async function withdraw(req, res) {

    //TODO : Implement withdraw or Payouts

    try {

        const phone_number = req.body.phone_number;

        const amount = req.body.amount;

        const wallet_id = req.user.wallet_id;

        const narrative = "Withdraw";

        let intasend;

        if (intasendPublishable && intasendSecret) {

            intasend = new IntaSend(
                null,
                intasendSecret,
                false
            );

            let collection = intasend.collection();

            collection.charge()

            const response = await collection.mpesaStkPush({
                wallet_id: wallet_id,
                phone_number: phone_number,
                amount: amount,
                narrative: narrative
            })

            const data = JSON.stringify(response);

            if (!data.hasOwnProperty("invoice")) {
                return res.status(400).json({ message: data });
            }

            const invoiceId = data.invoice.invoice_id;

            const statusTransaction = await collection.status(invoiceId);

            const statusTransactionObj = JSON.stringify(statusTransaction);

            if (!statusTransactionObj.hasOwnProperty("invoice")) {
                return res.status(400).json({ message: statusTransaction });
            }

            return res.status(200).json({ message: "We have received your deposit request" });

        }

    } catch (error) {

        //console.log(`Error loading wallet catch2 ${error}`);

        res.status(500).send("Internal server error");

    }

}

async function userWalletTransactions(req, res) {

    try {

        const wallet_id = req.user.wallet_id;

        let intasend;

        if (intasendPublishable && intasendSecret) {

            intasend = new IntaSend(
                null,
                intasendSecret,
                false
            );

            let wallets = intasend.wallets();

            await wallets.transactions(wallet_id)
                .then((response) => {
                    console.log(`Intasend wallet transactions response ${response}`);
                    return res.status(200).json(response);
                })
                .catch((error) => {
                    console.log(`Intasend wallet transactions error ${error}`)
                    return res.status(400).json({ message: `Wallet not found` });

                });

        }

    } catch (error) {

        console.log(`Error retrieving wallet transcations catch2 ${error}`);

        res.status(500).send("Internal server error");

    }

}

async function uploadAvatar(req, res) {

    try {

        const id = req.user.user_id;

        console.log(`ID ${id}`)

        const userDocRef = db.collection('users').doc(id);

        const imageUploadPromises = req.files.avatar.map((file) => {

            console.log(file)

            return uploadFromMemory(file);

        });

        const images = await Promise.all(imageUploadPromises);

        const updateData = { avatar: images[0] };

        await userDocRef.update(updateData);

        return res.status(200).json({ message: "Done uploading avatar" });

    } catch (error) {

        console.log(error);

        return res.status(400).send("Error uploading avatar");
    }

}

module.exports = {
    logout,
    getMinProfile,
    getUserWallet,
    loadUserWallet,
    userWalletTransactions,
    getFullProfile,
    verifyEmail,
    uploadAvatar,
    getWinnerProfile,
    createUserWallet,
    verifyEmailCallBack
}