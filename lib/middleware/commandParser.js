const parserUtils = require('../utils/parserUtils');

module.exports = controller => {
  controller.middleware.receive.use((bot, message, next) => {
    if (message.command && message.text) {
      parserUtils
        .toCommand(bot, message)
        .then($command => {
          message.$command = $command;
          next();
        }, reason => {throw new Error(reason)})
        .catch(e => {
          bot.reply(message, 'I had a problem parsing your command: `' + e + '`');
          console.dir(e);
          // don't call next, we have an invalid command.          
        });
    }    
  });
}