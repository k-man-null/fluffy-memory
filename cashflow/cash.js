const IntaSend = require('intasend-node');
const axios = require('axios');

const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;

function listWallets() {

    axios.get("https://payment.intasend.com/api/v1/wallets/", {
        headers: {
            Authorization: `Bearer ${intasendSecret}`
        }
    }
    )
        .then(function (response) {
            // handle success
            console.log(response);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            // always executed
        });


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

//createWallet();

listWallets();

module.exports = { listWallets, createWallet };