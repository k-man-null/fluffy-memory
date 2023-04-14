const IntaSend = require('intasend-node');

const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;

let intasend = new IntaSend(
    publishable_key = intasendPublishable,
    secret_key = intasendSecret,
    test_mode=false
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

function createWallet() {
    let wallets = intasend.wallets();
    wallets
        .create({
            label: 'NodeJS-SDK-TEST',
            wallet_type: 'WORKING',
            currency: 'KES',
            can_disburse: false
        })
        .then((resp) => {
            console.log(`Response: ${JSON.stringify(resp)}`);
        })
        .catch((err) => {
            console.error(`Error: ${err}`);
        });
}

createWallet();

listWallets();

module.exports = { listWallets, createWallet };