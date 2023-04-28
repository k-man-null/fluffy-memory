const { DataTypes, Model } = require('sequelize');
const Ticket = require('./ticket');

const sequelize = require('../connection');

class Game extends Model {


}

Game.init({
    game_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    game_description: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false
    },
    prize_description: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false
    },
    ticket_price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    delivery: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    tickets_total: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    tickets_sold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM("live", "ended"),
        allowNull: false,
        defaultValue: "live"
    },
    prize_images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    released: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    winningTicket_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    release_transaction_id: {
        type: DataTypes.JSON,
        allowNull: true
    },
    closed_date: {
        type: DataTypes.DATE,
        allowNull: true
    }


}, { sequelize, modelName: 'Game' });

Game.hasMany(Ticket, {
    foreignKey: {
        name: 'ticketgame_id',
        allowNull: false
    }
});

(async () => {
    await Game.sync({ alter : true });
    // Code here
})();

// (async () => {
//     await sequelize.sync({ force: true });
//     // Code here
//   })();


module.exports = Game;