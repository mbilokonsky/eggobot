const api = require("../../api");
const parserUtils = require('../../utils/parserUtils');

const associateTrackingNumber = (bot, message, id, number) => {
  id = id.slice(2, id.length-1);
  
  bot.api.users.info({user:id}, (error, {user}) => {
    if (user) {
      api
        .users
        .updateInstructor('mykola-bilokonsky', {instructor: {gear_tracking_number: number}})
        .then(result => {
          bot.reply(message, `Associated fedex tracking number ${number} with ${user.name}'s account.`);
        })
        .catch(result => {
          console.log(result);
          bot.reply(message, result);
        })
      
    } else {
      bot.reply(message, "Please use the format `fedex [@user-that-exists] [tracking-number]`.");
    }
  });
}

const handleCommand = (bot, message) => {  
  let command = parserUtils.toCommand(bot, message);
  if (command.name === "fedex") {
    associateTrackingNumber.apply(null, [bot, message].concat(command.args));
  }
};

module.exports = controller => {
  console.log('[fedex_tracking]', 'applying');
  controller.on('direct_mention', handleCommand);
};