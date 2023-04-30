const User = require('../models/user');
const IntaSend = require('intasend-node');
const { uploadFromMemory } = require("../controllers/gameController");

const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;

const sequelize = require('../connection');
const Ticket = require('../models/ticket');

async function logout(req, res) {

    return res.status(200)
        .clearCookie('__session', { httpOnly: true, secure: true, sameSite: 'none' })
        .json({ message: "logged out" })

}

async function getMinProfile(req, res) {

    return res.status(200).json(req.user);

}

async function getWinnerProfile(req, res) {

    const winning_ticket_id = req.params.id

    try {

        const ticket = await Ticket.findByPk(winning_ticket_id);

        const id = ticket.ticketowner_id;

        const data = await User.findByPk(id);

        const { user_name, profile_image, first_name, last_name } = data.toJSON();

        return res.status(200).json(
            {
                user_name,
                profile_image,
                first_name,
                last_name
            });

    } catch (error) {

        return res.status(400).json({ message: "User not found" });


    }



}

async function verifyEmail(req, res) {

    return res.status(200).json({ message: "Implement Verify email" });

}

async function getFullProfile(req, res) {

    try {

        const user = await User.findByPk(req.user.user_id);

        const full_profile = user.getFullUser();

        return res.status(200).json(full_profile);

    } catch (error) {
        return res.status(400).json({ message: "User not found" });

    }

}

async function getUserWallet(req, res) {

    try {

        const id = req.user.user_id;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(400).json({ message: `User not found` });
        }

        const wallet_id = user.getDataValue("wallet_id");

        let intasend;

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
                    return res.status(200).json(
                        resp
                    );
                })
                .catch((error) => {
                    console.log(`Error Get wallet inside catch1 ${error}`)
                    return res.status(400).json({ message: `Wallet not found` });

                });
        }

    } catch (error) {

        console.log(`Error Get wallet inside catch2 ${error}`)

        res.status(500).send("Internal server error");

    }

}

async function createUserWallet(req, res) {

    try {

        const id = req.user.user_id;

        const user_name = req.user.user_name;

        const usersCollection = db.collection('users');

        const userDocRef = await usersCollection.doc(id);

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

            await collection.mpesaStkPush({
                wallet_id: wallet_id,
                phone_number: phone_number,
                amount: amount,
                narrative: narrative
            })
                .then((response) => {
                    console.log(`Intasend loadwallet response ${response}`);
                    return res.status(200).json({ message: "We have received your deposit request" });
                })
                .catch((error) => {
                    console.log(`Intasend loadwallet error ${error}`)
                    return res.status(400).json({ message: `Wallet not found` });

                });

        }

    } catch (error) {

        console.log(`Error loading wallet catch2 ${error}`);

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

        const id = req.body.user_id;

        const usersCollection = db.collection('users');

        const userDocRef = await usersCollection.doc(id);

        const imageUploadPromises = req.files.avatar.map((file) => {

            return uploadFromMemory(file);

        });

        const images = await Promise.all(imageUploadPromises);

        const updateData = { profile_image: images[0] };

        await userDocRef.set(updateData, { merge: true });

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
    createUserWallet
}