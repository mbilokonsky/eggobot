const convertToCommandObject = (acc, val, index) => {
  if (index === 0) {
    acc.name = val;
    acc.args = [];
  } else {
    acc.args.push(val);
  }

  return acc;
}

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
    .reduce(convertToCommandObject, {message});
}