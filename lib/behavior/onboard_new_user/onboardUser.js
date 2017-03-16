const lookup = require('./lookup');
const setSlug = require('../_common/setSlug');

const no_instructor_found = (user, bot) => {
  bot.say({
    channel: process.env.ADMIN_CHANNEL,
    text: `Unable to automatically figure out @${user.name}'s instructor slug. Set it manually by typing:
\t\`/slug @${user.name} [correct-egghead-slug]\``
  });
}

const instructor_found = (controller, instructor, user, bot) => {
  return setSlug(controller, bot, instructor.slug, user)
    .catch(e => { throw e });
}

module.exports = (controller, user, bot) => {
  if (!user.profile.email) {
    return console.log('Weird, got a user here with no email. Ignoring them?');
  }

  lookup(user, bot)
    .then(instructor => instructor ?
      instructor_found(controller, instructor, user, bot)
      :
      no_instructor_found(user, bot))
    .catch(error => {
      console.log(error.message);
      bot.say({
        channel: process.env.ADMIN_CHANNEL,
        text: `Error trying to associate ${user.name} with an egghead slug: \`${error.message}\``
      });
    });
}