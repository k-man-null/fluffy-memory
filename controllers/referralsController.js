const IntaSend = require('intasend-node');
const db = require('../firebase');


const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;
const baseUrl = "https://tiki-dev-server-7tzn6tu5vq-uc.a.run.app";
const baseUrlFront = "https://tikitiki.me";
const jwt = require('jsonwebtoken');

const { publishMessage } = require("../utils/giveprizes");


async function createReferralCode(req, res) {

    try {

        const code = req.body.coupon_code;

        const refcodedocRef = db.collection('refcodes').doc(code);

        if (refcodedocRef.exists) {
            throw new Error("The code exists, pick another");
        }

        refcodedocRef.set({
            code: code,
            affiliate: req.user
        })

        return res.status(200).json(
            {
             message: "Your ref code has been set, you can share it and earn 10% with every sale",
                
            });

    } catch (error) {

        return res.status(400).json({ message: error.message });

    }

}

module.exports = {
    createReferralCode
}