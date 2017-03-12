if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const _ = require('lodash')
const api = require('./api');
const behavior = require('./behavior');

const Botkit = require('botkit')

const redisConfig = {url:process.env.REDIS_URL}
const redisStorage = require('botkit-storage-redis')(redisConfig)

const controller = Botkit.slackbot({
    // debug: true,
    storage: redisStorage
});

controller.setupWebserver(80, function(err, webserver) {
    controller.createWebhookEndpoints(webserver);
});

const bot = controller.spawn({
    token: process.env.SLACK_API_TOKEN
}).startRTM(() => {
  
})

bot.api.team.info({}, function (err, res) {
  if (err) {
    return console.error(err)
  }

  controller.storage.teams.save({id: res.team.id}, (err) => {
    if (err) {
      console.error(err)
    }
  })
})



bot.api.users.list({},(err, response) => {
  response.members.forEach((user) => {
    if(!user.is_restricted && !user.is_ultra_restricted) {

     
    }

    controller.storage.users.save(user)
  })
})

behavior.applyToBot(controller);

controller.on('ambient', (bot, message) => {
  console.log(message)
})

controller.hears('instructor', 'direct_message,direct_mention,mention', function (bot, message) {
  var mail = ''
  var matches = message.text.match(/\|.*>/)
  if (matches) {
    mail = matches[0].substring(1, matches[0].length - 1)
    console.info("Mail : " + mail)
  }

  if(mail) {
    api.getInstructorByEmail(mail).then((result) => {
      bot.reply(message, JSON.stringify(result.data));
    })
  } else {
    api.getInstructorByName(message.text.split('instructor')[1]).then((result) => {
      const instructor = result.data[0];

      const reply_with_attachments = {
        'attachments': [
          {
            'fallback': 'To be useful, I need you to invite me in a channel.',
            'title': instructor.full_name,
            "title_link": instructor.http_url,
            'text': instructor.bio_short,
            'color': '#7CD197',
            'thumb_url': instructor.avatar_url,
            "mrkdwn_in": ["text"],
            "fields": [
              {
                "title": "In Review",
                "value": instructor.reviewing_lessons,
                "short": true
              },
              {
                "title": "Published",
                "value": instructor.published_lessons,
                "short": true
              }
            ]
          }
        ]
      }

      bot.reply(message, reply_with_attachments);
    })
  }

});



controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.profile.real_name_normalized + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});