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

        console.log(`User id ${id}`);

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(400).json({ message: `User not found` });
        }


        console.log(`Useruser  ..... ${user}`)

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

                    console.log(`Error Get wallet inside catch1 ${error}`)
                    return res.status(400).json({ message: `Wallet not found` });

                });
    
        }


    } catch (error) {

        console.log(`Error Get wallet inside catch2 ${error}`)

        res.status(500).send("Internal server error");

    }

}

module.exports = {
    logout, getMinProfile,getUserWallet
}