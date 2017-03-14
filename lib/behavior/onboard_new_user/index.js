const api = require("../../api");

const get_mock_user = id => {
  return {
    profile: {
      real_name_normalized: 'hannah davis',
      first_name: '',
      last_name: '',
      email: 'foo@bar.net'
    },
    slack_id: id,
    name: 'alwaysdefined'
  };
}

const getConfirmationOfName = (user, instructor, bot) => {
  return new Promise((resolve, reject) => {
    bot.say({
      channel: process.env.ADMIN_CHANNEL,
      attachments:[
        {
            title: `Can someone here confirm that slack user ${user.name} is ${instructor.full_name}?`,
            callback_id: '123',
            attachment_type: 'default',
            actions: [
                {
                    "name":"yes",
                    "text": "Yes",
                    "value": "yes",
                    "type": "button",
                },
                {
                    "name":"no",
                    "text": "No",
                    "value": "no",
                    "type": "button",
                }
            ]
        }
      ]
    });  

    resolve(instructor);
  });
  

  
}

const check_name = (user, name_options, bot) => {
  const [name_to_check, ...remaining] = name_options;
  
  if (name_to_check) {
    return api.users
      .getInstructorByName(name_to_check)
      .then(response => response.data[0] ? response.data[0] : check_name(user, remaining, bot))
      .then(instructor => instructor ? getConfirmationOfName(user, instructor, bot) : null);
  } else {
    return null;
  }
}

const no_instructor_found = (user, bot) => {
  console.log('No instructor found by email or name. Notify admin.');  
}

const handle_instructor = (controller, instructor, user) => {
  console.log('I have everything I need, writing instructor details to API.')
  api
    .users
    .updateInstructor(instructor.slug, { slack_id: user.id })
    .then(result => {
      user.slug = instructor.slug;
      controller.storage.users.save(user, function(err, result) {
        console.log(`${user.name} has the slack id ${user.slack_id} and the email address ${user.profile.email}`);
      });
    })
    .catch(error => console.log(error.message));
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
  .then(response => response.data[0] ? response.data[0] : searchByNames(user, bot));

const onboard_user = (controller, user, bot) => {
    // TODO PULL THIS SHIT OUT
    user = get_mock_user(user.id);

    if (!user.profile.email) {
      return console.log('Weird, got a user here with no email. Ignoring them?');
    }

    lookupInstructorAccount(user, bot)
      .then(instructor => instructor ? 
        handle_instructor(controller, instructor, user) 
        : 
        no_instructor_found(user, bot))
      .catch(error => {
        console.log(error);
        // no_instructor_found(user, bot);
      });  
}

module.exports = function (controller) {
  console.log('[onboard_new_user]', 'applying');

  controller.on('user_channel_join', (bot, message) => {
    bot.api.users.info({user: message.user}, (err, {user:slack_user}) => {
      controller.storage.users.get(message.user, (err, result) => {
        if (!result || !result.user || !result.user.slug) { 
          onboard_user(controller, slack_user, bot);
        }
      });
    });
  });

  controller.on('interactive_message_callback', (bot, message) => {
    console.log('callback invoked', message);
  });
};
