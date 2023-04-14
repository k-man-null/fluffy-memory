const IntaSend = require('intasend-node');
const axios = require('axios');

const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;

function listWallets() {
    

    let intasend;

    if (intasendPublishable && intasendSecret) {

        intasend = new IntaSend(
            null,
            intasendSecret,
            false
        );

        
        let wallets = intasend.wallets();
        wallets
            .list()
            .then((resp) => {
                console.log(resp);
            })
            .catch((err) => {
                console.error(`Error: ${err}`);
            });

    }


}

async function createWallet(label) {

    let intasend;

    if (intasendPublishable && intasendSecret) {

        intasend = new IntaSend(
            null,
            intasendSecret,
            false
        );

        let wallets = intasend.wallets();

        
        await wallets.create({
                label: `${label}`,
                wallet_type: 'WORKING',
                currency: 'KES',
                can_disburse: true
            });
     
    }

}

//createWallet();

//listWallets();

module.exports = { listWallets, createWallet };