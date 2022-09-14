// Using the matrix-sdk for nodejs, create a bot connects to github organizations webhooks
// It will need the following environment variables:
// - MATRIX_USER_ID: The user ID of the bot
// - MATRIX_ACCESS_TOKEN: The access token of the bot
// - MATRIX_SERVER_NAME: The server name of the bot
// - GITHUB_WEBHOOK_URL: The URL of the github webhook
// - GITHUB_WEBHOOK_SECRET: The secret of the github webhook
// - GITHUB_WEBHOOK_ROOM_ID: The room ID of the room to send the notifications to
import require from require

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin
} = require('matrix-bot-sdk');

const app = express();
const port = process.env.PORT || 3000;

const homeserverUrl = process.env.MATRIX_SERVER_NAME; // make sure to update this with your url
const accessToken = process.env.MATRIX_ACCESS_TOKEN;
const storage = new SimpleFsStorageProvider("github-matrix-bot.json");
const client = new MatrixClient(homeserverUrl, accessToken, storage);
AutojoinRoomsMixin.setupOnClient(client);

app.post('/webhook', (req, res) => {
    const signature = req.headers['x-hub-signature'];
    const event = req.headers['x-github-event'];
    const id = req.headers['x-github-delivery'];
    const body = JSON.stringify(req.body);

    if (!signature) {
        console.error('No X-Hub-Signature found on request');
        res.status(400).send('No X-Hub-Signature found on request');
        return;
    }

    if (!event) {
        console.error('No X-Github-Event found on request');
        res.status(400).send('No X-Github-Event found on request');
        return;
    }

    if (!id) {
        console.error('No X-Github-Delivery found on request');
        res.status(400).send('No X-Github-Delivery found on request');
        return;
    }

    const hmac = crypto.createHmac('sha1', process.env.GITHUB_SECRET);
    const digest = Buffer.from('sha1=' + hmac.update(body).digest('hex'), 'utf8');
    const checksum = Buffer.from(signature, 'utf8');

    if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
        console.error(`Request body digest (${digest}) did not match X-Hub-Signature (${checksum})`);
        res.status(400).send(`Request body digest (${digest}) did not match X-Hub-Signature (${checksum})`);
        return;
    }

    console.log(`${event} event received`);
    res.status(200).send(`${event} event received`);
});

client.start().then(() => {
  app.listen(process.env.GITHUB_WEBHOOK_URL, () => console.log(`Github Matrix Bot listening on port ${port}!`));
  client.sendMessage(process.env.GITHUB_WEBHOOK_ROOM_ID, {
    msgtype: 'm.text',
    body: "hello dumbass"
  })
});