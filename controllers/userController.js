const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const privateKey = 'mysecretkey' || process.env.PRIVATE_JWT_KEY;
const db = require('../firebase');
const { Timestamp } = require('firebase-admin/firestore');

async function saveUser(req, res) {

    // TODO: verify user emails 

    /**
     * send them an email with a link to verify by clicking:
     * automatically set the verified column to true
     * to secure the email, somehow send a token to ensure it comes from us
     */

    try {

        const { first_name, last_name, user_name, email, phone, password } = req.body;

        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.where('user_name', '==', user_name).get();
        const existingEmail = await usersCollection.where('email', '==', email).get();
        const existingPhone = await usersCollection.where('phone', '==', phone).get();

        if (!existingUser.empty) {
            throw new Error('Username');
        }
        if (!existingEmail.empty) {
            throw new Error('Email');
        }
        if (!existingPhone.empty) {
            throw new Error('Phone');
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const newUserRef = await usersCollection.add({
            first_name,
            last_name,
            user_name,
            email,
            phone,
            password: hashedPassword,
            created_at: Timestamp.now(),
            verified: false,
            avatar: "",
            wallet_id: "0XZZQEY"
        });

        const newUser = await newUserRef.get();
        const newUserData = newUser.data();


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
        //         throw new Error("Intasend walet create error");
        //     });

        // const wallet_id = "0XZZQEY"


        return res.status(200).json({
            user: newUserData
        });


    } catch (error) {

        switch (error.message) {
            case "Username":
                res.status(416).json({
                    error: {
                        type: "UniqueConstraint",
                        field: "user_name",
                        message: "Username is already taken, try another one"
                    }
                });
                break;

            case "Email":
                res.status(416).json({
                    error: {
                        type: "UniqueConstraint",
                        field: "email",
                        message: "There is a user with the same email, please make sure the email is correct"
                    }
                });
                break;

            case "Phone":
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

    }

}

async function loginUser(req, res) {

    try {

        const { email, password } = req.body;

        // const user = await User.findOne({ where: { email: email } });

        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.where('email', '==', email).get();

        if (existingUser.empty) {
            return res.status(417).json({
                field: "email",
                message: `User with email ${email} not found`
            });
        }

        const userPassword = existingUser.docs[0].data().password;

        const correctUser = await bcrypt.compare(password, userPassword);

        const userData = existingUser.docs[0].data();
        
        const { password:userpass, ...userWithoutPassword } = userData;

        userWithoutPassword.user_id = existingUser.docs[0].id;

        if (correctUser) {

            jwt.sign(userWithoutPassword,
                privateKey,
                function (err, token) {

                    if (err) {
                        return res.status(400).json({ message: `Error loging in, please try again` });
                    }

                    req.user = userWithoutPassword;

                    return res.status(200)
                        .cookie("__session", token, { httpOnly: true, secure: true, sameSite: 'none' })
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

    //TODO: migrate

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