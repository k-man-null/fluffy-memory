const IntaSend = require('intasend-node');

const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;

function listWallets() {

    let intasend;

    if (intasendPublishable && intasendSecret) {

        console.log(`Intasend publishable ${intasendPublishable} \n
        Intasendsecret ${intasendSecret}`);

        intasend = new IntaSend(
            intasendPublishable,
            intasendSecret,
            false
        );

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


}

function createWallet() {

    let intasend;

    if (intasendPublishable && intasendSecret) {

        console.log(`Intasend publishable ${intasendPublishable} \n
        Intasendsecret ${intasendSecret}`);

        intasend = new IntaSend(
            intasendPublishable,
            intasendSecret,
            false
        );

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



}

createWallet();

listWallets();

module.exports = { listWallets, createWallet };