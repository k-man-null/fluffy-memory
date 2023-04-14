const IntaSend = require('intasend-node');

const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;

let intasend = new IntaSend(
    intasendSecret,
    intasendPublishable,
    true, // Test ? Set true for test environment
);

function listWallets() {

    console.log("Listing wallets...........\n\n")
    let wallets = intasend.wallets();
    wallets
        .list()
        .then((resp) => {
            console.log(`Response: ${JSON.stringify(resp)}`);
        })
        .catch((err) => {
            console.error(`Error: ${err}`);
        });

    console.log("\n\n\nListing wallets...........")
}

module.exports = { listWallets };