const User = require('../models/user');
const IntaSend = require('intasend-node');
const { uploadFromMemory } = require("../controllers/gameController");

const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;

const sequelize = require('../connection');


async function logout(req, res) {

    return res.status(200)
        .clearCookie('__session', { httpOnly: true, secure: true, sameSite: 'none' })
        .json({ message: "logged out" })

}

async function getMinProfile(req, res) {

    return res.status(200).json(req.user);

}

async function getWinnerProfile(req, res) {

    const id = req.params.id

    try {

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

    let t;

    try {


        t = await sequelize.transaction();

        const user = await User.findByPk(req.user.user_id, { transaction: t });

        const imageUploadPromises = req.files.avatar.map((file) => {

            return uploadFromMemory(file);

        });

        const images = await Promise.all(imageUploadPromises);

        // get the current user profile

        await user.update({ profile_image: images[0] }, { transaction: t });

        await t.commit();

        return res.status(200).json({ message: "Done uploading avatar" });

    } catch (error) {
        if (t && t.finished !== 'commit') {
            await t.rollback();
        }

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
    getWinnerProfile
}