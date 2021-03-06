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
  redirectUri: process.env.BOT_URL,
  scopes: ['bot', 'users:read', 'users:read.email','chat:write:bot', 'incoming-webhook', 'commands']
})

var _bots = {};

function _trackBot(bot) {
  if (_bots[bot.config.token]) {
    return;
  }
  _bots[bot.config.token] = bot;
  console.log('now setting up middleware and behavior');
  middleware.applyToBot(controller);
  behavior.applyToBot(controller);

  // when this bot starts up, iterate over all members on the team
  bot.api.users.list({}, (err, response) => {
    response.members.forEach(user => {
      console.log(`found user ${user.name}`)
      // check to see if I have a stored record of that member
      controller.storage.users.get(user.id, (err, savedUser) => {
        if (err) { return console.log('ERROR', err); }
        
        if (!savedUser) {
          // if not, add that member.
          console.log(`\t${user.name} not in storage, adding.`)            
          controller.storage.users.save(user);
         }

        // potentially other logic here e.g. to populate slugs or something.
      });      
    });
  });
}

function die(err) {
  console.log(err);
  process.exit(1);
}

controller.on('create_bot', function (bot, config) {
  bot.startRTM(function (err) {
    if (err) {
      die(err);
    }

    _trackBot(bot);
  });
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