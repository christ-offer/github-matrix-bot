import require from 'requirejs'
require('dotenv').config();
const express = require('express');
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require('body-parser');
const crypto = require('crypto');
const {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin,
  RichReply
} = require('matrix-bot-sdk');

const app = express();
/* WIP Webhooks
app.use(bodyParser.json());

app.post('/', (request, response) => {
    const { body } = request;
    console.log(body);
});
*/
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const port = process.env.PORT || 8080;
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
    if (!body) return;
    if (body.startsWith("!insult")) {
      const insult = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: `Reply with a brutal insult in Shakespearean English.\n\nI am so great\n\nThou art naught but a sorry, slovenly wretch, fit only for wallowing in thy own filth! Mayhap thou shouldst go back to the gutter whence thou came!\n\nCapitalism is the best economic system ever!\n\nThou art a fool if thou thinkest capitalism is anything but a cruel, heartless system that benefits only the rich! The poor and downtrodden suffer under its yoke, while those in power grow ever more wealthy and corrupt!\n\nI'm going to go to the gym and work out\n\nAye, and thou shalt perspire and grunt and groan like the swine thou art, wallowing in thy own stench!\n\nHow can anyone ever be better than me?\n\nThou art the most arrogant, self-centered, pompous ass ever to darken my doorstep! Get thee gone, and take thy inflated sense of self-importance with thee!\n\nCSS Flexbox is clearly superior to CSS Grid\n\nThou knowest naught of which thou speakest! CSS Grid is the superior layout system, and Flexbox is but ancient history!\n\n ${body}`,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      // If we've reached this point, we can safely execute the command. 
      const replyBody = insult.data.choices[0].text; // we don't have any special styling to do.
      const reply = RichReply.createFor(roomId, event, replyBody, replyBody);
      reply["msgtype"] = "m.notice";
      client.sendMessage(roomId, reply);
      console.log(replyBody)
    } else if (body.startsWith("!comment")) {
      const comment = await openai.createCompletion({
        model: "code-davinci-002",
        prompt: "/* \nWrite a comment that perfectly describes this code.\nThe comment should be professional and descriptive\nThe comment should follow Typescript best practices for commenting.\n*/\n\n// Code:\n```\nfunction welcome(msg): string { return msg } \n```\n\n// Comment:\n/**  \n### * This is a hello world function.  \n###\n### * @param {string} value - A string param  \n### * @return {string} Return a string  \n### * @example  \n### * welcome('Welcome')  \n */  \n \n // Code:\n ```\n class Employee {\n  private empCode: number;\n  private empName: string;\n  private id: string;\n}\n```\n\n// Comment:\n/**\n### * Employee class\n###\n### * @class Employee\n### * @property {number} empCode - Employee code (private)\n### * @property {string} empName - Employee name (private)\n### * @property {string} id - Employee id (private)\n### * @example\n### * let emp = new Employee({empCode: 1, empName: 'John', id: '123'})\n### * console.log(emp)\n### * returns: {empCode: 1, empName: 'John', id: '123'}\n */\n\n// Code:\n```\nexports.up = async function (knex) {\n  return await base(knex, 'user', (table) => {\n    // table.enum('TFAType', ['TOTP', 'SMS']).nullable();\n    table.string('first_name').notNullable();\n    table.string('last_name').notNullable();\n    table.string('email').notNullable();\n    table.string('password').notNullable();\n  });\n};\n\n\nexports.down = async function (knex) {\n  return knex.schema.dropTable('user');\n};\n```\n\n// Comment:\n/**\n### * This is a knex migration function.\n### * @param {object} knex - Knex object\n### * @return {object} Return a knex object\n### * It creates a table called users, using the base table generator \n### * It adds the the columns:\n### * first_name, last_name, email, password\n*/\n\n// Code:\n```\nexports.up = async function (knex) {\n  return await base(knex, 'institution', (table) => {\n    table.string('name').notNullable();\n    table.enum('type', ['bank', 'company']).notNullable();\n    table.uuid('financial_entity_account').references('id').inTable('financial_entity_account').notNullable();\n  });\n};\n\nexports.down = async function (knex) {\n  return knex.schema.dropTable('institution');\n};\n```\n\n// Comment:\n/**\n### * This is a knex migration function.\n###\n### * @param {object} knex - Knex object\n### * @return {object} Return a knex object\n### * It creates a table called institution, using the base table generator \n### * It adds the the columns:\n### * name, type, financial_entity_account\n*/\n\n// Code:\n```\nfunction sortArrays(arr1: number[], arr2: string[]): object {\n  let obj : object = {};\n  for (let i : number = 0; i < arr1.length; i++) {\n    obj[arr1[i]] = arr2[i];\n  }\n  return obj;\n}\n```\n\n// Comment:\n/**\n### * This is a function that sorts two arrays into an object\n###\n### * @param {array} arr1 - Array 1\n### * @param {array} arr2 - Array 2\n### * @return {object} Return an object\n### * @example\n### * sortArrays([1,2,3], ['a', 'b', 'c'])\n### * returns: {1: 'a', 2: 'b', 3: 'c'}\n */\n\n// Code:\n" + body,
        temperature: 0,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: ["```"],
      });
      // If we've reached this point, we can safely execute the command. 
      const replyBody = comment.data.choices[0].text; // we don't have any special styling to do.
      const reply = RichReply.createFor(roomId, event, replyBody, replyBody);
      reply["msgtype"] = "m.notice";
      client.sendMessage(roomId, reply);
      console.log(replyBody)
    } else if (body.startsWith("!midjourney")) {
      const midjourney = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: `For the following topic: The Emperor of Mankind\n\n1. Add creative information about lighting, setting, composition and photographic perspective/angle.\n2. Add creative nuances in the description of facial features, pose and clothing.\n3. Use precise and visual language to describe the topic.\n\nIn the darkened throne room, only the faintest light glimmers from the imposing figure seated on the throne. The Emperor of Mankind is a statuesque figure, draped in rich robes and crowned with a laurel wreath. His face is stern and regal, his eyes piercing and knowing. He sits with one hand resting on the arm of the throne, the other clasping a sceptre. His gaze is fixed ahead, as though surveying his vast empire.\n\nFor the following topic: a beautiful viking warrior\n\nIn the light of the setting sun, the viking warrior stands atop a hill, her long blonde hair blowing in the wind. She is clad in a fur cape and leather armor, her sword and shield by her side. Her blue eyes are piercing and her face is set in a determined expression. She looks out over the landscape, her people's land, ready to defend it with her life.\n\nFor the following topic: A wonderful fairy princess\n\nIn a sunlit glade, the fairy princess stands among the flowers. She is a delicate creature, with gossamer wings and a flowered crown. Her dress is pale and delicate, like the petals of a flower. She looks up at the trees, her blue eyes shining with mischief. She seems to be waiting for something, or someone. The background is out of focus, as though she is the only thing that matters in this world.\n\nFor the following topic: An egyptian pharaoh\n\nIn a dark and dusty tomb, the egyptian pharaoh lies in state. He is a majestic figure, clad in gold and jewels. His face is set in a stern expression, his eyes closed in death. His hands are crossed over his chest, holding a scepter and a sword. He is surrounded by his treasures, the things he loved in life. Even in death, he is a powerful and imposing figure.\n\nFor the following topic: A living egyptian pharaoh in the 4th dynasty\n\nIn a sunlit courtyard, the egyptian pharaoh sits on his throne, surrounded by his court. He is a proud and regal figure, clad in fine linen and jewels. His face is set in a calm expression, his eyes surveying his kingdom. He wears the double crown of Upper and Lower Egypt, and he holds a crook and flail in his hands. He is the living embodiment of a god, and he rules his people with a firm hand.\n\nFor the following topic: A sprawling alien landscape\n\n\nIn the center of a vast and empty plain, a single tree stands. Its trunk is gnarled and twisted, its leaves a deep and vibrant green. Around it, the ground is black and charred, as though something has burned here. In the distance, jagged mountains rise up, their peaks lost in the clouds. The sky is a deep and inky blue, studded with stars. This is a hostile and alien landscape, one that is not meant for human eyes.\n\nFor the following topic: ${body}`,
        temperature: 0.88,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      // If we've reached this point, we can safely execute the command. 
      const replyBody = midjourney.data.choices[0].text; // we don't have any special styling to do.
      const reply = RichReply.createFor(roomId, event, replyBody, replyBody);
      reply["msgtype"] = "m.notice";
      client.sendMessage(roomId, reply);
      console.log(replyBody)
    } else {
      return
    }
}

client.start().then(() => { console.log('matrix bot is running')});