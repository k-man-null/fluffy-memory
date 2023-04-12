const Inventory = require('../models/inventory');

async function getMyInventory(req, res) {

    try {

        const { user_id } = req.user;

        const inventory = await Inventory.findOne({
            where: { owner_id: user_id }
        });

        if (inventory !== null) {
            return res.status(200).json({
                inventory: inventory,
            });

        } else {
            return res.status(400).json({ message: `You have no inventory` })
        };

    } catch (error) {

        res.status(400).send("Error getting inventory");

    }

}

module.exports = { getMyInventory }