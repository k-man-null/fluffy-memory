const { DataTypes, Model } = require('sequelize');

const sequelize = require('../connection');

class AffiliateSale extends Model {

    checkIfCompleted() {

        if(this.status === "completed") {
            
            throw Error("The transaction cannot be repeated");
        }

    }
    
}

AffiliateSale.init({
    transaction_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    game_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    code_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ticket_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ticket_original_price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    affiliate_price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    percentage: {
        type: DataTypes.ENUM("5","10","15"),
        allowNull: false
    },
    affiliate_amount: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("paid", "ready", "waiting"),
        allowNull: false,
        defaultValue: "waiting"
    },

}, { sequelize, modelName: 'AffiliateSale' });

module.exports = AffiliateSale;