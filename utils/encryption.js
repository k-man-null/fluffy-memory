const privateKey = 'mysecretkey' || process.env.PRIVATE_JWT_KEY;
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {

    const token = req.cookies.__session;

    if (token) {
        
        jwt.verify(token, privateKey, (err, decoded) => {
            if (err) {
                return res.json({ message: "Invalid Token" });
            }
            req.user = decoded;

            next();
        })

    } else {

        return res.json("Not Authenticated");
    }
};

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.isAdmin) {
            //res.json("You are authorized to update this user");
            next();
        } else {
            res.json('Not authorized');
        }
    });
};

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            res.json('Not authorized');
        }
    });
};

module.exports = { verifyToken };