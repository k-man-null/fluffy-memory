const { PubSub } = require('@google-cloud/pubsub');

const db = require("../firebase");

const topicName = 'game-ended-need-to-be-drawn' || process.env.GAME_END_PUBSUB_TOPIC;

const pubSubClient = new PubSub();

async function publishMessage(topicNameOrId, data) {
    // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
    const dataBuffer = Buffer.from(data);

    try {
        const messageId = await pubSubClient
            .topic(topicNameOrId)
            .publishMessage({ data: dataBuffer });
        console.log(`Message ${messageId} published.`);
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);

        process.exitCode = 1;
    }
}

function getRandomInt(min, max) {

    /**
     * exclusive max
     * inclusive min
     */
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


async function endGame() {

    const currentDate = new Date();

    console.log("Cron running");

    try {

        const gamesRef = db.collection('games');

        const isLiveAndPastDue = gamesRef
            .where('end_date', '<', currentDate)
            .where('status', '==', 'live')
            .get();

        const isLiveAndFullySold = gamesRef
            .where('sold_out', '==', true)
            .where('status', '==', 'live')
            .get();


        const [isLiveAndPastDueSnp, isLiveAndFullySoldSnp] = await Promise.all(
            [isLiveAndPastDue, isLiveAndFullySold]
        );

        const pastdue = isLiveAndPastDueSnp.docs;
        const fullySold = isLiveAndFullySoldSnp.docs;

        const results = pastdue.concat(fullySold);

        if(results.length > 0) {

            console.log("Found something ..................")

            results.forEach(async docSnapshot => {
                
                const docId = docSnapshot.id;
    
                const { tickets_sold } = docSnapshot.data();

                if(tickets_sold == 0 || tickets_sold == 1) {
                    console.log(docId);
                    const gameRef = db.collection('games').doc(docId);
                    gameRef.update({
                        status: 'ended'
                    })
                }
    
                const random_int = getRandomInt(0, tickets_sold);
    
                console.log(`Document ${docId} updated successfully`);
    
                //publish message here...
    
                const message = JSON.stringify({ 
                    game_to_process: docId,
                    random_int: random_int
                 })
    
                publishMessage(topicName, message);
    
            });

        } else {
            console.log("Try again later...........");
        }

    } catch (error) {

        console.log(error)

    }

}

module.exports = { endGame, publishMessage };