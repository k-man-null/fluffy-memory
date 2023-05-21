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

async function getMyRefCodes(req, res) {

    try {

        const user_id = req.user.user_id;

        const refCodesRef = db.collection('refcodes');

        const snapshot = await refCodesRef.where('affiliate.user_id', '==', user_id).get();

        if (snapshot.empty) {
            throw new Error("You have no ref codes");
        }

        const codes = snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
                refcode_id: doc.id,
                ...data,

            };
        });

        return res.status(200).json({
            codes
        })

    } catch (error) {

        return res.status(400).json({
            message: error.message
        })

    }
}


async function getMyEarnings(req, res) {

    try {

        const user_id = req.user.user_id;

        //get the affiliate codes
        const refCodesRef = db.collection('refcodes');

        const snapshot = await refCodesRef.where('affiliate.user_id', '==', user_id).get();


        if (snapshot.empty) {
            throw new Error("You have no ref codes");
        }

        const codes = snapshot.docs.map((doc) => {

            return {
                refcode_id: doc.id,
            };

        });

        const commissionsRef = db.collection('commissions');

        const commissionsDocs = await commissionsRef.where('code', 'in', codes).get();

        let settledAmount = 0;
        let unsettledAmount = 0;

        commissionsDocs.forEach((doc) => {
            const data = doc.data();
            const commissionAmount = data.amount;
            const isSettled = data.settled;

            if (isSettled) {
                settledAmount += commissionAmount;
            } else {
                unsettledAmount += commissionAmount;
            }
        });

        return res.status(200).json({
            settledEarnings: settledAmount,
            pendingEarnings: unsettledAmount
        })


    } catch (error) {

        return res.status(400).json({ message: error.message });

    }
}

async function getMyCommissions(req, res) {

    try {

        const user_id = req.user.user_id;

        //get the affiliate codes
        const refCodesRef = db.collection('refcodes');

        const snapshot = await refCodesRef.where('affiliate.user_id', '==', user_id).get();


        if (snapshot.empty) {
            throw new Error("You have no ref codes");
        }

        const codes = snapshot.docs.map((doc) => doc.id);

        const commissionsRef = db.collection('commissions');

        const commissionsDocs = await commissionsRef.where('code', 'in', codes).get();

        if (commissionsDocs.empty) {
            return res.status(200).json({
                commissions: []
            })

        }

        const commissions = commissionsDocs.docs.map((doc) => {
            const data = doc.data();

            return {
                commission_id: doc.id,
                ...data,

            };
        });

        return res.status(200).json({
            commissions
        })


    } catch (error) {

        return res.status(400).json({
            message: error.message
        });

    }
}

module.exports = {
    createReferralCode,
    getMyRefCodes,
    getMyEarnings,
    getMyCommissions
}