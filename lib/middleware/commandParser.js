const parserUtils = require('../utils/parserUtils');

module.exports = controller => {
  controller.middleware.receive.use((bot, message, next) => {
    if (message.command && message.text) {
      console.log('middleware is working!!!!');
      console.dir(message);
      message.$command = parserUtils.toCommand(bot, message);
    }
    
    next();
  });
}