const parserUtils = require('../utils/parserUtils');

module.exports = controller => {
  controller.middleware.receive.use((bot, message, next) => {
    if (message.command) {
      console.log('middleware is working!!!!');
      if (!message.text) { return next(); }
      if (message.text.indexOf(bot.identity.id) === 2) {
        message.$command = parserUtils.toCommand(bot, message);         
      }
    }
    
    next();
  });
}