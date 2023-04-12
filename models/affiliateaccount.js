const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection');

class AffiliateAccount extends Model {

    //TODO : what do you think about giveing an affiliate a location ...
    // something like a jurisdiction to operate in... ; ) .....
    
}

AffiliateAccount.init({
    affiliate_account_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    total_earned: {
        type: DataTypes.DOUBLE,
    }
    
},  { sequelize, modelName: 'AffiliateAccount' });

module.exports = AffiliateAccount;