// Using the matrix-sdk for nodejs, create a bot connects to github organizations webhooks
// It will need the following environment variables:
// - MATRIX_USER_ID: The user ID of the bot
// - MATRIX_ACCESS_TOKEN: The access token of the bot
// - MATRIX_SERVER_NAME: The server name of the bot
// - GITHUB_WEBHOOK_URL: The URL of the github webhook
// - GITHUB_WEBHOOK_SECRET: The secret of the github webhook
// - GITHUB_WEBHOOK_ROOM_ID: The room ID of the room to send the notifications to
/*
import express from 'express';
import { Hmac } from 'crypto'
// import { MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin } from 'matrix-bot-sdk';
import dotenv from 'dotenv'
import require from 'requirejs'
const {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin
} = require('matrix-bot-sdk');
*/
import require from 'requirejs'
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin,
  RichReply
} = require('matrix-bot-sdk');

const app = express();
const port = process.env.PORT || 3000;
const roomId = "!phxFsseDFtRienTcza:matrix.org"
const homeserverUrl = process.env.MATRIX_SERVER_NAME; // make sure to update this with your url
const accessToken = process.env.MATRIX_ACCESS_TOKEN;
const storage = new SimpleFsStorageProvider("github-matrix-bot.json");
const client = new MatrixClient(homeserverUrl, accessToken, storage);
AutojoinRoomsMixin.setupOnClient(client);

client.on("room.message", handleCommand);

async function handleCommand(roomId, event) {
    // Don't handle events that don't have contents (they were probably redacted)
    if (!event["content"]) return;

    // Don't handle non-text events
    if (event["content"]["msgtype"] !== "m.text") return;

    // We never send `m.text` messages so this isn't required, however this is
    // how you would filter out events sent by the bot itself.
    if (event["sender"] === await client.getUserId()) return;

    // Make sure that the event looks like a command we're expecting
    const body = event["content"]["body"];
    if (!body || !body.startsWith("!hello")) return;

    // If we've reached this point, we can safely execute the command. We'll
    // send a reply to the user's command saying "Hello World!".
    const replyBody = "Hello World!"; // we don't have any special styling to do.
    const reply = RichReply.createFor(roomId, event, replyBody, replyBody);
    reply["msgtype"] = "m.notice";
    client.sendMessage(roomId, reply);
}

client.start().then(() => { console.log('matrix bot is running')});