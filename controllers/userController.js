const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const privateKey = 'mysecretkey' || process.env.PRIVATE_JWT_KEY;
const db = require('../firebase');
const { Timestamp } = require('firebase-admin/firestore');
const { publishMessage } = require('../utils/giveprizes');
const baseUrlFront = "https://tikitiki.me"

const IntaSend = require('intasend-node');
const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;


const intasendPublishableTest = process.env.INTASEND_PUBLISHABLE_TOKEN_TEST;
const intasendSecretTest = process.env.INTASEND_SECRET_TOKEN_TEST;

let intasend = new IntaSend(
    intasendPublishable,
    intasendSecret,
    false
  );

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

        let wallets = intasend.wallets();

        //TODO : Uncomment in production...to avoid creating unnceccessary wallets

        const { wallet_id } = await wallets.create({
            label: `${user_name}`,
            wallet_type: 'WORKING',
            currency: 'KES',
        })
            .then((resp) => {
                console.log(`Resp: ${JSON.stringify(resp)}`);
                return(resp);
            })
            .catch((err) => {
                console.log(`Error: ${err}`);
                throw new Error("Intasend walet create error");
            });

        // const wallet_id = "0XZZQEY"
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
            wallet_id: wallet_id
        });

        const newUser = await newUserRef.get();
        const newUserData = newUser.data();


        return res.status(200).json({
            user: newUserData
        });


    } catch (error) {

        console.log(error);

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

        const { password: userpass, ...userWithoutPassword } = userData;

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

        console.log(error);

        res.status(500).send("Internal server error");

    }

}

async function changePassword(req, res) {

    //Get user from the token

    try {

        const { password, token } = req.body;

        jwt.verify(token, "myprivatekeytochange", async (err, decoded) => {

            if (err) {
                return res.status(400).json({ message: "Invalid Token" });
            }

            const { user_id } = decoded;


            const user_ref = db.collection('users').doc(user_id);


            const hashedPassword = await bcrypt.hash(password, 10);

            await user_ref.update({
                password: hashedPassword
            });

            return res.redirect(200, `${baseUrlFront}/enter`);

        })



    } catch (error) {

        console.log(error);

        return res.status(400).send("An error occured");

    }

}

async function forgotPassword(req, res) {

    try {

        const { email } = req.body

        //check if the email exists among the users.
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.where('email', '==', email).get();

        if (existingUser.empty) {
            return res.status(400).json({
                message: `User with email ${email} not found`
            });
        }

        const user = {

            ...existingUser.docs[0].data(),
            user_id: existingUser.docs[0].id
        }

        //Tell the user you have sent them an email and send the email

        const code = jwt.sign(user, "myprivatekeytochange", {
            expiresIn: 300
        });

        const text = "To recover your password, click the link below. The link is only valid for 5 minutes"

        const link = `${baseUrlFront}/forgotpassword/${code}`

        const data = JSON.stringify({
            type: "forgot_password",
            recipient: email,
            email_text: text,
            verify_email_link: link,
            subject: "TikiTiki Password Recovery"
        })

        publishMessage("email-to-send", data)

        return res.status(200).json({ message: "We sent you an email to reset your password" });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error ocurred try again" });

    }

}


module.exports = { saveUser, loginUser, changePassword, forgotPassword }