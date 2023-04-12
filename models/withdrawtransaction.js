const { DataTypes, Model } = require('sequelize');

const sequelize = require('../connection');

class WithdrawTransaction extends Model {
    checkIfCompleted() {

        if(this.status === "completed") {
            
            throw Error("The transaction cannot be repeated");
        }

    }
    
}

WithdrawTransaction.init({
    transaction_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    mpesa_phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    withdraw_amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    mpesa_cash_tendered: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    game_cash_taken: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM("pending", "completed", "rejected", "cancelled"),
        allowNull: false,
        defaultValue: "pending"
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "cashwithdrawal"
    }

}, { sequelize, modelName: 'WithdrawTransaction' });



module.exports = WithdrawTransaction;