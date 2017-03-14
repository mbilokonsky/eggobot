const parserUtils = require('../utils/parserUtils');

module.exports = controller => {
  controller.middleware.receive.use((bot, message, next) => {
    if (!message.text) { return next(); }
    message.$command = parserUtils.toCommand(bot, message);    
    next();
  });
}