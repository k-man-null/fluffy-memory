const { DataTypes, Model } = require('sequelize');

const sequelize = require('../connection');

class Inventory extends Model {
    checkIfEnoughFunds(bill) {
        if(bill > this.cash) {
            throw Error("Your balance is too low");
        }
    }
}

Inventory.init({
    inventory_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cash: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    

}, { sequelize, modelName: 'Inventory' });


module.exports = Inventory;