const express = require('express');
const logger = require('morgan');
const { verifyToken } = require("./utils/encryption");
const cors = require('cors');
const cookieparser = require('cookie-parser');


const cron = require('node-cron');
const { endGame } = require('./utils/giveprizes');

cron.schedule('* * * * *', () => {
    endGame();
});


const userRouter = require('./routes/users');
const gamesRouter = require('./routes/games');
const ticketRouter = require('./routes/tickets');
const sessionRouter = require('./routes/session');
const claimRouter = require('./routes/claims');
const referralsRouter = require('./routes/referrals');


const app = express();

app.get("/loaderio-92a6e26cde027b115018383b18aeb08a/", (req, res) => {
    res.send("loaderio-92a6e26cde027b115018383b18aeb08a")

})

app.use(cookieparser())
app.use(express.json())

var corsOptions = {
    origin: ["https://tiki-a7763.web.app", "http://localhost:3000", "https://tikitiki.me"],
    credentials: true
}

app.use(cors(corsOptions))

app.use(logger('combined'));

app.use('/users', userRouter);

app.use(verifyToken);

app.use('/games', gamesRouter);
app.use('/tickets', ticketRouter);
app.use('/session', sessionRouter);
app.use('/claim', claimRouter);
app.use('/referrals', referralsRouter);

module.exports = app;