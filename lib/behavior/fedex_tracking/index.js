const api = require("../../api");

const parse = message => {
  let [username, tracking_number] = message.split(' ');
  if (username.charAt(0) === '@') {
    username = username.split('@')[1];
  }

  return {username, tracking_number};
}

const handleCommand = (bot, message) => {
  let {username, tracking_number} = parse(message);
  
  bot.api.users.info({user_name: username}, (error, result) => {
    bot.replyPrivate(message, `Now associating the tracking number ${tracking_number} with user ${user.email}`);
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