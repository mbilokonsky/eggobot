const api = require("../../api");

const get_mock_user = id => {
  return {
    profile: {
      real_name_normalized: 'hannah davis',
      first_name: '',
      last_name: '',
      email: 'foo@bar.net'
    },
    id,
    name: 'hannah'
  };
}

const pendingCallbacks = {

}

const getConfirmationOfName = (user, instructor, bot) => {
  const callback_id = "id_" + Date.now();
  bot.say({
    channel: process.env.ADMIN_CHANNEL,
    text: `Can someone here confirm that @${user.name} is \`/instructors/${instructor.slug}\`?`,
    attachments:[
      {
          title: `I couldn't find an email match so I'm doing a name match, which is less reliable.`,
          callback_id: callback_id,
          attachment_type: 'default',
          actions: [
              {
                  "name":"yes",
                  "text": "Yes, that looks right!",
                  "value": "yes",
                  "type": "button",
              },
              {
                  "name":"no",
                  "text": "No, you've failed me.",
                  "value": "no",
                  "type": "button",
              }
          ]
      }
    ]
  });      
  
  const output = new Promise((resolve, reject) => {
    pendingCallbacks[callback_id] = {
      yes: resolve.bind(null, instructor), 
      no: resolve.bind(null, null)
    }
  });
  
  return output;
}

const check_name = (user, name_options, bot) => {
  const [name_to_check, ...remaining] = name_options;
  
  if (name_to_check) {
    return api.users
      .getInstructorByName(name_to_check)
      .then(response => response.data[0] ? response.data[0] : check_name(user, remaining, bot))
      .then(instructor => instructor ? getConfirmationOfName(user, instructor, bot) : null)
      .catch(e => {throw e});
  } else {
    return null;
  }
}

const no_instructor_found = (user, bot) => {
  console.log('No instructor found by email or name. Notify admin.');  
   bot.say({
    channel: process.env.ADMIN_CHANNEL,
    text: `Unable to automatically figure out @${user.name}'s instructor slug. Set it manually by typing:
    
\`/slug @${user.name} [correct-egghead-slug]\``
   });
}

const handle_instructor = (controller, instructor, user, bot) => {
  console.log('I have everything I need, writing instructor details to API.')
  api
    .users
    .updateInstructor(instructor.slug, { slack_id: user.id })
    .then(result => {
      user.slug = instructor.slug;
      controller.storage.users.save(user, function(err, result) {
        bot.say({
          channel: process.env.ADMIN_CHANNEL,
          text: `Successfully connected @${user.name} with their instructor account at \`/instructors/${user.slug}\`!`,
        });
        console.log(`${user.name} has the slack id ${user.id} and the egghead slug ${user.slug}`);
      });
    })
    .catch(e => {throw e});
    
}

const searchByNames = (user, bot) => {
  const name_options = [
    user.profile.real_name_normalized,
    user.profile.first_name,
    user.profile.last_name,
    user.name
  ];

  return check_name(user, name_options, bot);
}

const lookupInstructorAccount = (user, bot) => api
  .users
  .getInstructorByEmail(user.profile.email)
  .then(response => response.data[0] ? response.data[0] : searchByNames(user, bot))
  .catch(e => {throw e});

const onboard_user = (controller, user, bot) => {
    // TODO PULL THIS SHIT OUT
    // user = get_mock_user(user.id);

    if (!user.profile.email) {
      return console.log('Weird, got a user here with no email. Ignoring them?');
    }

    lookupInstructorAccount(user, bot)
      .then(instructor => instructor ? 
        handle_instructor(controller, instructor, user, bot) 
        : 
        no_instructor_found(user, bot))
      .catch(error => {
        console.log(error);
        bot.say({
                channel: process.env.ADMIN_CHANNEL,
                text: `Something went wrong trying to associate ${slack_user.name} with an egghead slug.

${e.message}`
              });
      });
}

module.exports = function (controller) {
  console.log('[onboard_new_user]', 'applying');

  controller.on('user_channel_join', (bot, message) => {
    bot.api.users.info({user: message.user}, (err, {user:slack_user}) => {
      controller.storage.users.get(message.user, (err, {user:stored_user}) => {
        if (!stored_user || !stored_user.slug) { 
          onboard_user(controller, slack_user, bot)            
        }
      })
    });
  });

  controller.on('interactive_message_callback', (bot, message) => {
    const callback_id = message.callback_id;
    const result = message.actions[0].value;
    
    if (pendingCallbacks[callback_id]) {
      pendingCallbacks[callback_id][result]();
      delete pendingCallbacks[callback_id];
      const originalText = message.original_message.text;
      bot.api.users.info({user: message.user}, (err, {user}) => {
        if (result === "yes") {
          bot.replyInteractive(message, `${originalText} 
            - @${user.name} says yes!`);
        } else {
          bot.replyInteractive(message, `${originalText} 
            - @${user.name} says no!`);
        }
      });
      
      
    } else {
      // someone clicked a button that was generated during some previous
      // running of this program. The callback handler was in memory, and is
      // now gone. Weep for its loss, and move on.
      bot.replyInteractive(message, "It's too late. It's all too late.");
    }
  });
};
