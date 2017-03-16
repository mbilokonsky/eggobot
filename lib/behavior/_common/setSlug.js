const api = require("../../api");

module.exports = (controller, bot, slug, user) => api
  .users
  .updateInstructor(slug, { slack_id: user.id })
  .then(result => {
    user.slug = slug;
    controller.storage.users.save(user, function (err, result) {
      bot.say({
        channel: process.env.ADMIN_CHANNEL,
        text: `Successfully connected @${user.name} with their instructor account at \`/instructors/${user.slug}\`!`,
      });
      console.log(`${user.name} has the slack id ${user.id} and the egghead slug ${user.slug}`);
    });
  })