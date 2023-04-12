const { DataTypes, Model } = require('sequelize');

const sequelize = require('../connection');

class DepositTransaction extends Model {

    checkIfCompleted() {

        if(this.status === "completed") {
            
            throw Error("The transaction cannot be repeated");
        }

    }
    
}

DepositTransaction.init({
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
        unique: false
    },
    user_message: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    admin_message_code: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: true
    },
    mpesa_cash_received: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    game_cash_given: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM("pending", "completed", "rejected", "cancelled"),
        allowNull: false,
        defaultValue: "pending"
    },

}, { sequelize, modelName: 'DepositTransaction' });

module.exports = DepositTransaction;