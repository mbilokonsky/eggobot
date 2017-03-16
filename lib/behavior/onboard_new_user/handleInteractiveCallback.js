const callbackRegistry = require('./callbackRegistry');

module.exports = (bot, message) => {
  const callback_id = message.callback_id;
  const result = message.actions[0].value;

  if (callbackRegistry.get(callback_id)) {
    let handler = callbackRegistry.get(callback_id);
    callbackRegistry.clear(callback_id);

    const originalText = message.original_message.text;
    bot.api.users.info({ user: message.user }, (err, { user }) => {
      if (result === "yes") {
        handler.yes();
        bot.replyInteractive(message, `${originalText} 
          - @${user.name} says yes!`);
      } else {
        handler.no();
        bot.replyInteractive(message, `${originalText} 
          - @${user.name} says no!`);
      }
    });


  } else {
    // someone clicked a button that was generated during some previous
    // running of this program. The callback handler was in memory, and is
    // now gone. Weep for its loss, and move on.
    bot.replyInteractive(message, "It's too late. It's all too late.");
  }
}