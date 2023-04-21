const HostTicketLoadTxn = require('../models/affiliatesales');
const TicketBank = require('../models/affiliateaccount');
const User = require('../models/user');
const sequelize = require('../connection');

async function createTicketLoadRequest(req, res) {

    let t;

    try {

        const {
            user_id,
            user_message,
            ticket_price,
            total_tickets
        } = req.body;

        t = await sequelize.transaction();

        const user = await User.findByPk(user_id, { transaction: t });

        const hostTicketLoadTransaction = await HostTicketLoadTxn.create({
            user_id: user_id,
            ticket_price: ticket_price,
            total_tickets: total_tickets, 
            user_message: user_message,
        }, { transaction: t });

        await t.commit();

        return res.status(200).json({
            message: "We have receved your request, it will be processed shortly",
            hostTicketLoadTransaction: hostTicketLoadTransaction
        });

    } catch (error) {

        await t.rollback();

        return res.status(400).send(error.message);
    }

}

async function approveHostTicketLoadRequest(req, res) {

    let t;
    
    try {

        const {
            user_id,
            transaction_id,
            amount,
            admin_message_code,
            ticket_price,
            total_tickets 
        } = req.body;
    
        t = await sequelize.transaction();

        const hostTicketLoadTransaction = await HostTicketLoadTxn.findByPk(
            transaction_id,
            { transaction: t });

        const isNotrepetition = await hostTicketLoadTransaction.checkIfCompleted(
            { transaction: t });

        await hostTicketLoadTransaction.update(
            {
                mpesa_cash_received: amount,
                total_tickets_given: total_tickets,
                status: "completed",
                admin_message_code: admin_message_code
            },
            { transaction: t });

        const ticketBank = await TicketBank.findOne({
            where: {
                host_id: user_id
            }
        }, { transaction: t });

        const loadedTicketResult = await ticketBank.increment(
            { [ticket_price]: total_tickets },
            { transaction: t });

        await t.commit();

        return res.status(200).json({
            message: "We have loaded your account with tickets",
            transaction_result: loadedTicketResult
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

        let globalInventory = await GlobalInventory.findOne({
            where: { globalinventory_id: 30179056 }
        },
            { transaction: t });

        await globalInventory.increment({ cash: withdraw_amount }, { transaction: t });

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
            message: "Withdrawal completed succesfully",
            transaction_result: withdrawResultTransaction,
            withdrawal_result: withdrawResultInventory
        });

    } catch (error) {

        await t.rollback();

        return res.status(400).send(error.message);
    }

}

module.exports = {
    createTicketLoadRequest,
    approveHostTicketLoadRequest,
};