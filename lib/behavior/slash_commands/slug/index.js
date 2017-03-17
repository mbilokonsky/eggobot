const setSlug = require('../../_common/setSlug');

module.exports = (controller, bot, message) => {
  let [{user}, slug] = message.$command.args;

  if (!user || !slug) {
    return bot.replyPrivate(message, "Please use the format `/slug [@user-that-exists] [valid-slug]`.");
  }

  setSlug(controller, bot, slug.text, user)
    .catch(e => bot.replyPrivate(message, "Something went wrong: " + e));
};