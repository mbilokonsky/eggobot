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

module.exports.toCommand = (bot, message) => {
  return message.text
    .split(' ')
    .reduce(concatString, [])
    .reduce(convertToCommandObject, {name: message.command.slice(1), args: [], message});
}