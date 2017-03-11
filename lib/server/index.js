const Hapi = require('hapi');
const Joi = require('joi');

var internals = {};

internals.get = function (request, reply) {
  reply('Success!\n');
};

var server = new Hapi.Server();
server.connection({port: process.env.PORT || 3000})
server.route([
    { method: 'GET', path: '/', config: { handler: internals.get, validate: { query: { username: Joi.string() } } } },
]);

module.exports = {
  start: (cb) => {
    server.start(cb);
  }
}