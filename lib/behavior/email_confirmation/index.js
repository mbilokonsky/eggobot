const api = require("../../api");

module.exports = function(controller) {
  console.log('[email_confirmation]', 'applying');
  
  controller.on('user_channel_join', (bot, message) => {
    bot.api.users.info({user: message.user}, (error, {user}) => {
      const slack_id = user.id;
      const {real_name_normalized, email} = user.profile;

      console.log(`${real_name_normalized} has the slack id ${slack_id} and the email address ${email}`);
    });
  });
};