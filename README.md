# This is the rest api for tikitiki.me, deployed as part of a microservices architecture

The api serves json requests for a multi-user raffling web app.
The web app allows users to host raffles, enter raffles by purchasing 
tickets.

To host a raffle, a user needs to register and verify their email address. Upload a few pictures of the prize and give details of the raffle,
including the number of tickets, their price, the total tickets 
to be sold and the end date of the raffle.
The System automatically picks a winner on the end date or when the last ticket is sold,
whichever comes first.
Users can also create referral codes and earn a commision when 
raffles are bought through their codes.

By design, the system retains a percentage of total sales and distributes the rest to the winner.

The winner has to acknowledge that the host has provided the prize
as pictured and described in a Claim process.

** For the purposes of demonstration, a user has endless money **

## Deployed to Google Cloud as a cloud run service

## ENDPOINTS

1. Users
2. Games
3. Tickets
4. Session
5. Claim
6. Referrals

## Google Infrastructure used

- [PubSub](https://cloud.google.com/pubsub/docs/overview) 
Pubsub is used a the Enterprise Event Bus

- [CloudStorage](https://cloud.google.com/storage?hl=en#section-1)
Stores and serves the static images of the raffles and user avatars

- [CloudRun](https://cloud.google.com/run?hl=en)
Allows automatic deploys from github through cloud build, build packs and artifact registry.

- [Firestore](https://cloud.google.com/firestore?hl=en)
Ease of scale as well and reduced administrative costs

- [CloudFunctions](https://cloud.google.com/functions?hl=en)

## AWS Infrastructure used

- [SES](https://aws.amazon.com/ses/)
For transactional email

- [LAMBDA](https://aws.amazon.com/lambda/)
Receives messages from GCLOUD cloud functions, and then triggers email send in AWS
SES.

## When deploying, pass in the following Environment variables to the build

- IMAGE_BUCKET
- PRIVATE_JWT_KEY
- INTASEND_PUBLISHABLE_TOKEN
- INTASEND_SECRET_TOKEN
- API_BASE_URL
- DEMO_MODE
- GAME_END_PUBSUB_TOPIC

## IMPORT STANDARDS

**The orded of imports in every file is as follows**

1. npm imports
2. local module imports
3. environment variables

## DEPLOYMENT

** For session cookies to work, remember to set session affinity **

# 1. Create a GCLOUD project
# 2. Create a Firebase Project associated with the GCLOUD project
# 3. Create a Firestore Database
# 4. Obtain Intasend keys
# 5. Create an Image Bucket(Cloud Storage)
# 5. Create a Cloud Run service connected to the github project
    You need to setup cloud build to deploy from repository
# 6. Create a pubsub topic for when a game ends and it needs to be drawn
