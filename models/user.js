const { DataTypes, Model } = require('sequelize');
const Game = require('./games');
const Ticket = require('./ticket');
const Inventory = require('./inventory');
const AffiliateAccount = require('./affiliateaccount');

const bcrypt = require('bcrypt');

const sequelize = require('../connection');

class User extends Model {
    getUserWithoutPassword() {
        return {
            user_id: this.user_id,
            user_name: this.user_name,
            email: this.email,
            phone: this.phone,

        }
    }

}

User.init({
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
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
        allowNull: true
    },
    isAffiliate: {
        type: DataTypes.BOOLEAN,
        allowNull: true
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

User.hasOne(Inventory, {
    foreignKey: {
        name: 'owner_id',
        allowNull: false,
    }
});

User.hasOne(AffiliateAccount, {
    foreignKey: {
        name: 'affiliate_id',
        allowNull: false
    }
});

// (async () => {
//     await User.sync({ force: true });
//     // Code here
// })();

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