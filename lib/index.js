if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const _ = require('lodash')
const api = require('./api');
const behavior = require('./behavior');
const middleware = require('./middleware');

const Botkit = require('botkit')

const redisConfig = { url: process.env.REDIS_URL }
const redisStorage = require('botkit-storage-redis')(redisConfig)

const controller = Botkit.slackbot({
  storage: redisStorage
});

controller.setupWebserver(process.env.PORT || 3000, function (err, webserver) {
  controller
    .createWebhookEndpoints(webserver)
    .createHomepageEndpoint(webserver);
});

const bot = controller.spawn({
  clientID: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000',
  scopes: ['bot', 'commands', 'incoming-webhook','team:read', 'team:write','users:read', 'users:write', 'channels:read','im:read','im:write','groups:read','emoji:read','chat:write:bot']
}).startRTM(() => {
  middleware.applyToBot(controller);
  behavior.applyToBot(controller);
});