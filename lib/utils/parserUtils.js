// breaks your entire thing down into {name: 'first argument', args: ['rest', 'of', 'them']}
const convertToCommandObject = (acc, val) => {
  acc.args.push(val);
  return acc;
}

// allows multi-word strings to be single values,
// if they're wrapped in double quotes.
// so `command arg1 "this whole string is arg2" arg3`
const concatString = (acc, val, index, array) => {
  if (val.charAt(0) === '"') {
    acc.openString = [val.slice(1)];
    return acc;
  }

  if (acc.openString) {
    acc.openString.push(val);
  } else {
    acc.push(val);
  }

  if (val.charAt(val.length - 1) === '"') {
    let finalText = acc.openString.join(' ');
    acc.push(finalText.slice(0, finalText.length - 1));
    delete acc.openString;
  } 

  if (index === array.length - 1) {
    if (acc.openString) {
      console.warn('Unclosed string caught in command.');
    }
  }

  return acc;
};

const resolveUser = (bot, token, lookup) => 
  new Promise((resolve, reject) => {
    let id = token
      .text
      .slice(2)
      .split('|')[0];
    
    lookup(id, (error, user) => {
      if (user) {
        token.user = user;
        resolve(token);
      } else {
        console.log("unable to resolve user");
        reject('unable to find user with id ' + id);
      }
    });
  });

const resolveChannel = (bot, token) => 
  new Promise((resolve, reject) => {
    let id = token
      .text
      .slice(2)
      .split('|')[0];

    bot.api.channels.info({channel:id}, (error, {channel}) => {
      if (channel) {
        token.channel = channel;
        resolve(token);
      } else {
        console.log("unable to resolve channel");
        reject('unable to find channel with id ' + id);
      }
    });
  })

const resolveReferences = (bot, token, lookup) => {
  let text = token.text;
  
  if (text.indexOf('<@') === 0) {
    return resolveUser(bot, token, lookup);
  }

  if (text.indexOf('<#') === 0) {
    return resolveChannel(bot, token);
  }

  return token;
}

const wrap = token => {
  let output = {text: token}
  
  if (token.split(' ').length > 0) {
    output.long_string = true;
  }

  return {text: token}
}

module.exports.toCommand = (bot, message, lookup) => {
  let tokens = message.text
    .split(' ')
    .reduce(concatString, [])
    .map(token => wrap(token))
    .map(token => resolveReferences(bot, token, lookup))

  return Promise.all(tokens)
    .then(tokens => tokens.reduce(convertToCommandObject, {name: message.command.slice(1), args: [], message}));
}