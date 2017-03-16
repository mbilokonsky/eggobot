const setSlug = require('../_common/setSlug');

module.exports = controller => {
  console.log('[slug]', 'applying');
  controller.on('slash_command', (bot, message) => {
    if (message.command === '/slug') {
      console.dir(message.command);
      console.dir(message.text);
      bot.reply(message, 'ok');
    }
  });
}