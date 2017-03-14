const api = require("../../api");

const associateTrackingNumber = (bot, message, id, number) => {
  id = id.slice(2, id.length-1);
  const formatNotification = "Please use the format `fedex [@user-that-exists] [tracking-number]`.";

  if (!id || !number) {
    return bot.reply(message, formatNotification);
  }

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
          bot.reply(message, `Error! ${result.message}`);
        })
      
    } else {
      bot.reply(message, formatNotification);
    }
  });
}

const handleCommand = (bot, message) => {
  if (message.command && message.command.name === "fedex") {
    associateTrackingNumber.apply(null, [bot, message].concat(message.command.args));
  }
};

module.exports = controller => {
  console.log('[fedex_tracking]', 'applying');
  controller.on('direct_mention', handleCommand);
};