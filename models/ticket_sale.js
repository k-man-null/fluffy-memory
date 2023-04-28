const { DataTypes, Model } = require('sequelize');

const sequelize = require('../connection');

class TicketSale extends Model {
    
}

TicketSale.init({
    ticket_sale_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    receipt: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    total_tickets: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
    

}, { sequelize, modelName: 'TicketSale' });




module.exports = TicketSale;