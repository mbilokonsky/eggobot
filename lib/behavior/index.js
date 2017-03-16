const onboard_new_user = require('./onboard_new_user');
const greeting = require("./greeting");

const enabledBehaviors = [
  onboard_new_user, 
  greeting  
];

const applyToBot = controler => enabledBehaviors.forEach(b => b(controller));

// we do this in one place, rather than having each slash command subscribing to the whole chain and 
//doing their own checks
const setSlashHandlers = controller => {
  
  const slash_handlers = {
    slug: require('./slash_commands/slug').bind(null, controller),
    fedex: require('./slash_commands/fedex').bind(null, controller)
  };  

  controller.on('slash_command', (bot, message) => {
    let name = message.$command.name;
    let handler = slash_handlers[name];
    if (handler) {
      handler(bot, message);
    }    
  }) 
}

module.exports = {
  applyToBot: controller => {
    enabledBehaviors.forEach(behavior => behavior(controller));
    setSlashHandlers(controller);
  }
}