const onboardUser = require('./onboardUser');
const handleInteractiveCallback = require('./handleInteractiveCallback');

module.exports = function (controller) {
  console.log('[onboard_new_user]', 'applying');

  controller.on('user_channel_join', (bot, message) => {
    bot.api.users.info({user: message.user}, (err, {user:slack_user}) => {
      controller.storage.users.get(message.user, (err, {user:stored_user}) => {
        if (!stored_user || !stored_user.slug) { 
          onboardUser(controller, slack_user, bot)            
        }
      });
    });
  });

  controller.on('interactive_message_callback', handleInteractiveCallback);
};
