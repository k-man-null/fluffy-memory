const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('postgres://postgres:pgpassword@localhost:5432', {
//     pool: {
//         max: 1000,
//         min: 0,
//         acquire: 30000,
//         idle: 1000
//     },
// },
// );

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_INSTANCE = process.env.INSTANCE_CONNECTION_NAME;


const sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASS, {

    host: `/cloudsql/${DB_INSTANCE}`,
    dialect: 'postgres',
    dialectOptions: {
        socketPath: `/cloudsql/${DB_INSTANCE}`
    },
    logging: false

}

)

async function checkConnection(sequelize) {
    try {

        await sequelize.authenticate();

        console.error("Connection established successfully");

        await sequelize.sync({ alter: true });

    } catch (error) {
        console.error(error);
    }
}

checkConnection(sequelize);

module.exports = sequelize;