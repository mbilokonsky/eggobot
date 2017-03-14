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
  token: process.env.SLACK_API_TOKEN
}).startRTM(() => {
  middleware.applyToBot(controller);
  behavior.applyToBot(controller);
});

bot.api.users.list({}, (err, response) => {
  response.members.forEach((user) => {
    controller.storage.users.save(user)
  })
});