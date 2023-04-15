const User = require('../models/user');

async function logout(req, res) {

        return res.status(200)
            .clearCookie('token', { httpOnly: true })
            .json({ message: "logged out"})

}

async function getMinProfile(req, res) {

    return res.status(200).json(req.user);

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
                    return res.status(200).json({
                        resp
                    });
                })
                .catch((err) => {

                    return res.status(400).json({ message: `Wallet not found` });

                });
    
        }


    } catch (error) {

        res.status(500).send("Internal server error");

    }

}

module.exports = {
    logout, getMinProfile,getUserWallet
}