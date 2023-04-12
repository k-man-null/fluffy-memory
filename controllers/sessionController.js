async function logout(req, res) {

        return res.status(200)
            .clearCookie('token', { httpOnly: true })
            .json({ message: "logged out"})

}

async function getMinProfile(req, res) {

    return res.status(200).json(req.user);

}

module.exports = {
    logout, getMinProfile,
}