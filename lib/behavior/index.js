const email_confirmation = require('./email_confirmation');
const fedex_tracking = require('./fedex_tracking');
const greeting = require("./greeting");

const enabledBehaviors = [
  email_confirmation, 
  fedex_tracking, 
  greeting
];

module.exports = {
  applyToBot: controller => {
    enabledBehaviors.forEach(behavior => behavior(controller));
  }
}