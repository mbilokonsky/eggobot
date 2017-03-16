const api = require("../../api");
const callbackRegistry = require('./callbackRegistry');

const getConfirmationOfName = (user, instructor, bot) => {
  const callback_id = "id_" + Date.now();
  bot.say({
    channel: process.env.ADMIN_CHANNEL,
    text: `Can someone here confirm that @${user.name} is \`/instructors/${instructor.slug}\`?`,
    attachments: [
      {
        title: `I couldn't find an email match so I'm doing a name match, which is less reliable.`,
        callback_id: callback_id,
        attachment_type: 'default',
        actions: [
          {
            "name": "yes",
            "text": "Yes, that looks right!",
            "value": "yes",
            "type": "button",
          },
          {
            "name": "no",
            "text": "No, you've failed me.",
            "value": "no",
            "type": "button",
          }
        ]
      }
    ]
  });

  return new Promise((resolve, reject) => {
    callbackRegistery.set(callback_id, {
      yes: resolve.bind(null, instructor),
      no: resolve.bind(null, null)
    });
  });
}

const check_name = (user, name_options, bot) => {
  const [name_to_check, ...remaining] = name_options;

  if (name_to_check) {
    return api.users
      .getInstructorByName(name_to_check)
      .then(response => response.data[0] ? response.data[0] : check_name(user, remaining, bot))
      .then(instructor => instructor ? getConfirmationOfName(user, instructor, bot) : null)
      .catch(e => { throw e });
  } else {
    return null;
  }
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

module.exports = (user, bot) => api
  .users
  .getInstructorByEmail(user.profile.email)
  .then(response => response.data[0] ? response.data[0] : searchByNames(user, bot))
  .catch(e => { throw e });