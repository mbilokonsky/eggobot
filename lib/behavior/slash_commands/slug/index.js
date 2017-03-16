const setSlug = require('../../_common/setSlug');

module.exports = (controller, bot, message) => {
  console.dir(message.$command);
  bot.reply(message, 'ok');
};