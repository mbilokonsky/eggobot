const api = require("../../api");

const handleCommand = (bot, message) => {
  let [username, tracking_number] = message.text.split(" ");
  console.dir(message);
  bot.api.users.info({user_name: username}, (bot, message) => {
    bot.replyPrivate(message, `Now associating the tracking number ${tracking_number} with user ${username}`);
  });
  
};

module.exports = controller => {
  console.log('[fedex_tracking]', 'applying');
  controller.on('slash_command', (bot, message) => {
    if (message.command === "/fedex") {
      handleCommand(bot, message);
    }
  });
};