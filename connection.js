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
const DB_PUB_IP = process.env.DB_PUB_IP;

console.log(`DB_NAME = ${DB_NAME} \n
    DB_USER = ${DB_USER} \n
    DB_PASS = ${DB_PASS} \n
    DB_INSTANCE = ${DB_INSTANCE} \n
    DB_PUB_IP = ${DB_PUB_IP}`)

const sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASS, {

    host: DB_PUB_IP,
    dialect: 'postgres',
    dialectOptions: {
        socketPath: `/cloudsql/${DB_INSTANCE}.s.PGSQL.5432`
    }

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