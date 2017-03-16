const store = {};
module.exports = {
  set: (id, handler) => store[id] = handler,
  get: id => store[id],
  clear: id => delete store[id]
};