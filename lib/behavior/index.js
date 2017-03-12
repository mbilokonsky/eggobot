const email_confirmation = require('./email_confirmation');
const fedex_tracking = require('./fedex_tracking');

module.exports = {
  applyToBot: controller => {
    email_confirmation(controller);
    fedex_tracking(controller);
  }
}