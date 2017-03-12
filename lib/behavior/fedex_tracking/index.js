const api = require("../../api");

const handleCommand = (bot, message) => {
  let [username, tracking_number] = message.text.split(" ");
  console.log(`Now associating the tracking number ${tracking_number} with user ${username}`);
  bot.replyPrivate(message, `Now associating the tracking number ${tracking_number} with user ${username}`);
};

module.exports = controller => {
  console.log('[fedex_tracking]', 'applying');
  controller.on('slash_command', (bot, message) => {
    console.log('slash command received', message.command);
    if (message.command === "/fedex") {
      handleCommand(bot, message);
    }
  });
};