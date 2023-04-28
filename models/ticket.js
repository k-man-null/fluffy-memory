const { DataTypes, Model } = require('sequelize');

const sequelize = require('../connection');

class Ticket extends Model {

}

Ticket.init({
    ticket_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    ticket_price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("won", "live", "lost"),
        allowNull: false,
        defaultValue: "live"
    },
    invoice_id: {
        type: DataTypes.STRING,
        allowNull: false,
    }

}, { sequelize, modelName: 'Ticket' });





module.exports = Ticket;