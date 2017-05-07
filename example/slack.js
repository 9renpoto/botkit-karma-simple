const KarmaBot = require('../lib/index').default
const Botkit = require('botkit')
const controller = Botkit.slackbot()
controller
  .spawn({
    token: process.env.token
  })
  .startRTM((err, bot, payload) => {
    if (err) {
      throw new Error('Could not connect to Slack')
    }
  })

const instance = new KarmaBot(controller)
instance.listen()
