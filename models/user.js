const { DataTypes, Model } = require('sequelize');
const Game = require('./games');
const Ticket = require('./ticket');

const bcrypt = require('bcrypt');

const sequelize = require('../connection');

class User extends Model {
    getUserWithoutPassword() {
        return {
            user_id: this.user_id,
            user_name: this.user_name,
            email: this.email,
            phone: this.phone,
            wallet_id: this.wallet_id
        }
    }

    getFullUser() {
        return {

            user_id: this.user_id,
            user_name: this.user_name,
            email: this.email,
            phone_number: this.phone,
            wallet_id: this.wallet_id,
            full_name: `${this.first_name} ${this.last_name}`,
            avatar: this.profile_image,
            verifed: this.verifed

        }
    }

}

User.init({
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    user_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    wallet_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    profile_image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    verifed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }

}, { sequelize, modelName: 'User' });

User.hasMany(Game, {
    foreignKey: {
        name: 'host_id',
        allowNull: false
    }
});

User.hasMany(Ticket, {
    foreignKey: {
        name: 'ticketowner_id',
        allowNull: false
    }
});


User.beforeCreate(async (user) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
});

// User.afterBulkCreate(async (users) => {
//     for (let user of users) {
//         await user.createInventory();
//     }
// })



module.exports = User;