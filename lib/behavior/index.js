const onboard_new_user = require('./onboard_new_user');
const fedex_tracking = require('./fedex_tracking');
const greeting = require("./greeting");
const slug = require('./slug');

const enabledBehaviors = [
  onboard_new_user, 
  fedex_tracking, 
  greeting,
  slug
];

module.exports = {
  applyToBot: controller => {
    enabledBehaviors.forEach(behavior => behavior(controller));
  }
}