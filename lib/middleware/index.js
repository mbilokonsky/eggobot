const enabledMiddleware = [
  require('./commandParser')
]

module.exports = {
  applyToBot: controller => enabledMiddleware.forEach(mw => mw(controller))
}