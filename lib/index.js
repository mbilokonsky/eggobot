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
  redirectUri: 'https://eggo.herokuapp.com/oauth',
  scopes: ['bot', 'users:read', 'chat:write:bot', 'incoming-webhook', 'commands']
})

var _bots = {};

function _trackBot(bot) {
  _bots[bot.config.token] = bot;
}

function die(err) {
  console.log(err);
  process.exit(1);
}

controller.on('create_bot', function (bot, config) {
  console.log('create_bot fired', bot, config);
  if (_bots[bot.config.token]) {
    // already online! do nothing.
  } else {

    bot.startRTM(function (err) {
      if (err) {
        die(err);
      }

      _trackBot(bot);

      middleware.applyToBot(controller);
      behavior.applyToBot(controller);

    });
  }
});

controller.setupWebserver(process.env.PORT || 3000, function (err, webserver) {
  controller
    .createWebhookEndpoints(webserver)
    .createHomepageEndpoint(webserver)
    .createOauthEndpoints(controller.webserver, (err, req, res) => {
      if (err) {
        res.status(500).send('ERROR: ' + err);
      } else {
        res.send('Success!');
      }
    });
});

controller.storage.teams.all(function (err, teams) {

  if (err) {
    throw new Error(err);
  }

  // connect all teams with bots up to slack!
  for (var t in teams) {
    if (teams[t].bot) {
      var bot = controller.spawn(teams[t]).startRTM(function (err) {
        if (err) {
          console.log('Error connecting bot to Slack:', err);
        } else {
          _trackBot(bot);
        }
      });
    }
  }

});