const DepositTransaction = require('../models/deposittransaction');
const WithdrawTransaction = require('../models/withdrawtransaction');
const sequelize = require('../connection');
const User = require('../models/user');

async function createDepositRequest(req, res) {

    let t;

    try {

        const {
            user_id,
            mpesa_phone_number,
            user_message
        } = req.body;

        t = await sequelize.transaction();

        const user = await User.findByPk(user_id, { transaction: t });

        const depositTransaction = await DepositTransaction.create({
            user_id: user_id,
            mpesa_phone_number: mpesa_phone_number,
            user_message: user_message
        }, { transaction: t });

        await t.commit();

        return res.status(200).json({
            message: "We have receved your deposit request",
            depositTransaction: depositTransaction
        });

    } catch (error) {

        await t.rollback();

        return res.status(400).send(error);
    }

}

async function approveDepositRequest(req, res) {
    let t;
    
    try {

        const {
            user_id,
            transaction_id,
            amount,
            admin_message_code
        } = req.body;
    
        t = await sequelize.transaction();

        const depositTransaction = await DepositTransaction.findByPk(
            transaction_id,
            { transaction: t });   

        const isNotrepetition = await depositTransaction.checkIfCompleted(
            { transaction: t });

        const depositedResultTransaction = await depositTransaction.update(
            {
                mpesa_cash_received: amount,
                game_cash_given: amount,
                status: "completed",
                admin_message_code: admin_message_code
            },
            { transaction: t });

        const user = await User.findByPk(user_id, { transaction: t });

        const inventory = await user.getInventory({ transaction: t });

        const depositedResultInventory = await inventory.increment(
            { cash: amount },
            { transaction: t });

        await t.commit();

        return res.status(200).json({
            message: "Deposit accepted, best of luck ;)",
            transaction_result: depositedResultTransaction,
            deposited_result: depositedResultInventory
        });

    } catch (error) {

        await t.rollback();

        return res.status(400).send(error.message);
    }

}

async function rejectDepositRequest(req, res) {


    let t;

    try {

        const {
            transaction_id,
        } = req.body;
    
        t = await sequelize.transaction();

        const depositTransaction = await DepositTransaction.findByPk(
            transaction_id,
            { transaction: t });

        const cancelResult = await depositTransaction.update({
            status: "rejected"
        }, { transaction: t })

        return res.status(200).json({
            message: "The mpesa transaction is invalid",
            cancel_result: cancelResult
        });

    } catch (error) {

        await t.rollback();

        return res.status(400).send(error);
    }

}

async function createWithdrawalRequest(req, res) {

    let t;
    
    try {

        const {
            user_id,
            mpesa_phone_number,
            withdraw_amount
        } = req.body;
    
        t = await sequelize.transaction();

        const user = await User.findByPk(user_id, { transaction: t });

        const withdrawTransaction = await WithdrawTransaction.create({
            user_id: user_id,
            mpesa_phone_number: mpesa_phone_number,
            withdraw_amount: withdraw_amount
        }, { transaction: t });

        await t.commit();

        return res.status(200).json({
            message: "We have receved your withdraw request",
            withdrawTransaction: withdrawTransaction
        });

    } catch (error) {

        await t.rollback();

        return res.status(400).send(error);
    }

}

async function approveWithdrawRequest(req, res) {

    let t;

    try {

        const {
            user_id,
            transaction_id,
            withdraw_amount,
        } = req.body;
    
    
        t = await sequelize.transaction();

        let withdrawTransaction = await WithdrawTransaction.findOne(
            {
                where: {
                    transaction_id: transaction_id,
                    user_id: user_id
                }
            },

            { transaction: t });

        if (withdrawTransaction === null) {
            throw new Error("Transaction doesn't exist")
        }

        let user = await User.findByPk(user_id, { transaction: t });

        let isNotrepetition = await withdrawTransaction.checkIfCompleted(
            { transaction: t });

        let inventory = await user.getInventory({ transaction: t });

        let currentBalance = await inventory.getDataValue("cash", { transaction: t });

        if (currentBalance < withdraw_amount) {
            throw new Error("Your balance is below the withdrawal amount");
        }

        let withdrawResultInventory = await inventory.decrement(
            { cash: withdraw_amount },
            { transaction: t });

        let withdrawResultTransaction = await withdrawTransaction.update(
            {
                mpesa_cash_tendered: withdraw_amount,
                game_cash_taken: withdraw_amount,
                status: "completed",
            },
            { transaction: t });

        await t.commit();

        return res.status(200).json({
            message: "Withdrawal completed suceesfully",
            transaction_result: withdrawResultTransaction,
            withdrawal_result: withdrawResultInventory
        });

    } catch (error) {

        await t.rollback();

        return res.status(400).send(error.message);
    }

}

module.exports = {
    createDepositRequest,
    approveDepositRequest,
    rejectDepositRequest,
    createWithdrawalRequest,
    approveWithdrawRequest
};