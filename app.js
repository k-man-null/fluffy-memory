const express = require('express');
const logger = require('morgan');
// const conn = require('./connection');
const User = require('./models/user');
// const { pickWinner } = require('./utils/giveprizes');
const { verifyToken } = require("./utils/encryption");
const cors = require('cors');
const cookieparser = require('cookie-parser');

// async function start() {
//     await conn.sync({ force: true });
// }

//start()



class UserSkel {
    constructor(number) {
        this.user_name = `test${number}`;
        this.phone = `0722000${number}`;
        this.password = `password${number}`;
        this.email = `${this.user_name}@mail.com`;
    }
}

async function createDummyUsers() {
    let users = []

    for (let i = 1; i < 1000; i++) {
        const user = new UserSkel(i);
        users.push(user);
    }

    try {

        await User.bulkCreate(users);
        
    } catch (error) {
        console.log(error);
    }

}

//createDummyUsers();

const userRouter = require('./routes/users');
const gamesRouter = require('./routes/games');
const inventoryRouter = require('./routes/inventory');
const ticketRouter = require('./routes/tickets');
const transactionRouter = require('./routes/transaction');
const ticketBankRouter = require('./routes/ticketBank');
const sessionRouter = require('./routes/session');

const app = express();

app.get("/loaderio-92a6e26cde027b115018383b18aeb08a/", (req,res) => {
    res.send("loaderio-92a6e26cde027b115018383b18aeb08a")

})

app.use(cookieparser())
app.use(express.json())

var corsOptions = {
    origin: "https://tiki-a7763.web.app",
    credentials: true
  }

app.use(cors(corsOptions))

app.use(logger('combined'));

app.use('/users', userRouter);

app.use(verifyToken);


app.use('/games', gamesRouter);
app.use('/inventory', inventoryRouter);
app.use('/tickets', ticketRouter);
app.use('/transactions', transactionRouter);
app.use('/ticketbank', ticketBankRouter);
app.use('/session', sessionRouter);



module.exports = app;