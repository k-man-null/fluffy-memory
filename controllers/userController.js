const User = require('../models/user');
const Inventory = require('../models/inventory');
const bcrypt = require('bcrypt');
const sequelize = require('../connection');
const jwt = require('jsonwebtoken');
const AffiliateAccount = require('../models/affiliateaccount');
const privateKey = 'mysecretkey' || process.env.PRIVATE_JWT_KEY;

async function saveUser(req, res) {

    // TODO: verify user emails 

    /**
     * send them an email with a link to verify by clicking:
     * automatically set the verified column to true
     * to secure the email, somehow send a token to ensure it comes from us
     */

    let t;

    try {

    
        const { first_name, last_name, user_name, email, phone, password } = req.body;

        t = await sequelize.transaction();

        const user = await User.create({
            first_name,
            last_name,
            user_name,
            email,
            phone,
            password
        }, { transaction: t });

        //I wont be needing the inventory, will be using intasend wallets

        //await Inventory.create({ owner_id: user.user_id }, { transaction: t });

        //TODO : Create an intasend wallet for the user and store the id. 

        const userWithoutPassword = user.getUserWithoutPassword();

        await t.commit();

        return res.status(200).json({
            user: userWithoutPassword
        });


    } catch (error) {

        try {

            await t.rollback();
            
        } catch (error) {

            console.error("The database is not connected");
            
        }


        if (error.name === 'SequelizeUniqueConstraintError') {


            const field = Object.keys(error.fields)[0];


            switch (field) {
                case "user_name":
                    res.status(416).json({
                        error: {
                            type: "UniqueConstraint",
                            field: "user_name",
                            message: "Username is already taken, try another one"
                        }
                    });
                    break;

                case "email":
                    res.status(416).json({
                        error: {
                            type: "UniqueConstraint",
                            field: "email",
                            message: "There is a user with the same email, please make sure the email is correct"
                        }
                    });
                    break;

                case "phone":
                    res.status(416).json({
                        error: {
                            type: "UniqueConstraint",
                            field: "phone",
                            message: "Phone Number is already taken, try another one"
                        }
                    });
                    break;

                default:
                    break;
            }
        } else {
            return res.sendStatus(500);
        }


    }

}

async function loginUser(req, res) {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ where: { email: email } });

        if (!user) {
            return res.status(417).json({
                field: "email",
                message: `User with email ${email} not found`
            });
        }

        const userPassword = await user.password

        const correctUser = await bcrypt.compare(password, userPassword);

        const userWithoutPassword = user.getUserWithoutPassword();

        if (correctUser) {

            jwt.sign(userWithoutPassword,
                privateKey,
                function (err, token) {

                    if (err) {
                        return res.status(400).json({ message: `Error loging in, please try again` });
                    }

                    req.user = userWithoutPassword;

                    return res.status(200)
                        .cookie("token", token, { httpOnly: true,  })
                        .json({
                            user: userWithoutPassword,
                        });

                });

        } else {
            return res.status(417).json({
                field: "password",
                message: `Wrong password`
            });
        }

    } catch (error) {

        res.status(500).send("Internal server error");

    }

}

async function changePassword(req, res) {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ where: { email: email } });

        if (!user) {
            return res.status(400).json({ message: `User with email ${email} not found` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await user.update({ password: hashedPassword });

        return res.status(200).json({
            message: "Password changed successfully",
        });

    } catch (error) {

        res.status(500).send("Internal server error");

    }

}

async function verifyEmail(req, res) {

    // TODO: complete and test method
    try {

        const { email } = req.body;

    } catch (error) {

        res.status(500).send("Internal server error");

    }

}



module.exports = { saveUser, loginUser, changePassword }