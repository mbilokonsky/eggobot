const api = require("../../../api");

const associateTrackingNumber = (bot, message, user, number) => {
  api
    .users
    .updateInstructor(user.slug, {instructor: {gear_tracking_number: number}})
    .then(result => {
      bot.replyPrivate(message, `Associated fedex tracking number ${number} with ${user.name}'s account.`);
    })
    .catch(result => {
      console.log(result);
      bot.replyPrivate(message, `Error! ${result.message}. See logs for details.`);
    })
}

module.exports = (controller, bot, message) => {
  let [userToken, tracking_number] = message.$command.args;
  const user = userToken.user;
  if (!user || !tracking_number) {
    return bot.replyPrivate(message, "Please use the format `/fedex [@user-that-exists] [tracking-number]`.");
  } 
  
  if (!user.slug) {
    return bot.replyPrivate(message, `It looks like ${user.name} has no egghead API slug associated with them. Try \`/slug @${user.name} [a-slug]\` to resolve this.`);
  }
  
  associateTrackingNumber(bot, message, user, tracking_number.text);  
};