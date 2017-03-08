if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const Hapi = require('hapi');
const Joi = require('joi');
const SlackBot = require('slackbots')
const _ = require('lodash')
const axios = require('axios');

const headers = {
  'Authorization': `Bearer ${process.env.EGGHEAD_API_JWT}`
}

const Botkit = require('botkit')

const redisConfig = {url:process.env.REDIS_URL}
const redisStorage = require('botkit-storage-redis')(redisConfig)

const controller = Botkit.slackbot({
    // debug: true,
    storage: redisStorage
});



const bot = controller.spawn({
    token: process.env.SLACK_API_TOKEN
}).startRTM(() => {
  // bot.startPrivateConversation({user:'U030BJ3CK'}, (err, convo) => {
  //   convo.say('Hi There.')
  // })
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

function getInstructorByEmail(email) {
  return axios.get(`${process.env.EGGHEAD_API_URL}/instructors?user_email=${encodeURIComponent(email)} `, {
    headers
  })
}

function getInstructorByName(name) {
  return axios.get(`${process.env.EGGHEAD_API_URL}/instructors?name=${encodeURIComponent(name)} `, {
    headers
  })
}

bot.api.users.list({},(err, response) => {
  response.members.forEach((user) => {
    if(!user.is_restricted && !user.is_ultra_restricted) {

      // getInstructorByEmail(user.profile.email).then((result) => {
      //   if (result.data.length) {
      //     console.log(`${result.data[0].full_name} is an instructor`)
      //   } else {
      //     console.log(`${user.profile.real_name} (${user.name}) ${user.profile.email} is not an instructor`)
      //   }
      // })
      // request({
      //   url: ,
      //   headers
      // }, (err, res, body) => {
      //   if(err) {
      //     console.log(err)
      //   } else {
      //     body = JSON.parse(body || '[]')
      //     if (body.length) {
      //       // console.log(`${body[0].full_name} is an instructor`)
      //     } else {
      //       console.log(`${user.profile.real_name} (${user.name}) ${user.profile.email}`)
      //     }
      //   }
      //
      // })
    }

    controller.storage.users.save(user)
  })
})

controller.on('channel_joined', (bot, message) => {
  console.log(message)
})


controller.on('user_channel_join', (bot, message) => {
  console.log(message)
})

controller.on('bot_channel_join', (bot, message) => {
  console.log(message)
})


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
    getInstructorByEmail(mail).then((result) => {
      bot.reply(message, JSON.stringify(result.data));
    })
  } else {
    getInstructorByName(message.text.split('instructor')[1]).then((result) => {
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
 
// // create a bot 
// var bot = new SlackBot({
//     token: process.env.SLACK_API_TOKEN, // Add a bot https://my.slack.com/services/new/bot and put the token  
//     name: 'Comment Bot'
// })

// bot.on('start', function() {
//     // more information about additional params https://api.slack.com/methods/chat.postMessage 
//     var params = {
//         icon_emoji: ':eggo:'
//     }

//     bot.getUsers().then(function(result) {
//       users = _.map(result.members, (member) => {
//           return {
//           id: member.id,
//           name: member.name,
//           email: member.profile.email,
//           real_name: member.real_name
//         }
//         })
//     })
// })

// // all ingoing events https://api.slack.com/rtm 
// bot.on('message', function(data) {
//     switch(data.type) {
//       case 'message':
//         bot.getUsers(data.user).then((result) => {
//           user = _.find(result.members, (user) => user.id === data.user)
//           console.log(`${user.profile.real_name_normalized || user.name} says, "${unescape(data.text)}"`)
//         })
//       break
//       case 'presence_change':
//         bot.getUsers(data.user).then((result) => {
//           user = _.find(result.members, (user) => user.id === data.user)
//           if(data.presence === 'active') {
//             console.log(`${user.profile.real_name_normalized || user.name} IN DA HOUSE 🏠`)
//           }
          
//         })
//       break;
//       case 'user_typing': 
//         bot.getUsers(data.user).then((result) => {
//           user = _.find(result.members, (user) => user.id === data.user)
//           console.log(`${user.profile.real_name_normalized || user.name} IS TYPING 💻`)
//         })
//       break;
//       default: 
//         console.log(data)
//     }
// })

// heroku expects a web server, so we give it a web server...

var internals = {};

internals.get = function (request, reply) {

    reply('Success!\n');
};


var server = new Hapi.Server();

server.connection({port: process.env.PORT || 3000})

server.route([
    { method: 'GET', path: '/', config: { handler: internals.get, validate: { query: { username: Joi.string() } } } },
]);

server.start(function () {

    console.log('Server started at [' + server.info.uri + ']');
});