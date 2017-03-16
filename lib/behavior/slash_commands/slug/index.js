const setSlug = require('../../_common/setSlug');

module.exports = (controller, bot, message) => {
  console.dir(message.$command);
  console.dir(message.text);
  bot.reply(message, 'ok');
};