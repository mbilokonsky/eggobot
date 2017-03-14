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
}).configureSlackApp({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  redirectUri: 'https://eggo.herokuapp.com/slack/receive',
  scopes: ['bot', 'users:read', 'chat:write:bot', 'incoming-webhooks', 'commands']
})

controller.spawn({
  token: process.env.SLACK_TOKEN
}).startRTM((err, bot) => {
  middleware.applyToBot(controller);
  behavior.applyToBot(controller);

  bot.api.users.list({}, (err, response) => {
    response.members.forEach((user) => {
      controller.storage.users.save(user)
    });
  });
}); 

controller.setupWebserver(process.env.PORT || 3000, function (err, webserver) {
  controller
    .createWebhookEndpoints(webserver)
    .createHomepageEndpoint(webserver)
    .createOauthEndpoints(controller.webserver, (err,req,res) => {
      if (err) {
        res.status(500).send('ERROR: ' + err);
      } else {
        res.send('Success!');
      }
    });
});
