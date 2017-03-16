const setSlug = require('../_common/setSlug');

module.exports = controller => {
  console.log('[setSlug]', 'applying');
  controller.on('slash_command', (bot, message) => {
    if (message.command === '/slug') {
      console.log(message.text);
      bot.reply(message, 'ok');
    }
  });
}