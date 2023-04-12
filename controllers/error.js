async function errorResponse(req, res) {
    return res.status(405).json({ message: "Not allowed" });

}

module.exports = errorResponse;