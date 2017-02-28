/* @flow */
import KarmaStore from 'karma-store-redis'

type Controller = {
  hears: Function
}

export default class KarmaBot {
  _store: KarmaStore
  _ctrl: Controller
  constructor (ctrl: Controller, storeName: string = 'karmastore') {
    this._ctrl = ctrl
    this._store = new KarmaStore(storeName)
  }
  thingWrapper (thing: string) {
    return thing
  }
  listen () {
    this._ctrl.hears(['([^+\\s])\\+\\+(\\s|$)'], ['ambient'], (bot, msg) => {
      const thing = msg.text.match(/@?(\S+[^+\s])\+\+(\s|$)/)[1].toLowerCase()
      this._store.up(this.thingWrapper(thing), 1, karma => {
        bot.reply(msg, `level up! ${thing}: ${karma}`)
      })
    })

    this._ctrl.hears(['([^-\s])--(\s|$)'], ['ambient'], (bot, msg) => {  // eslint-disable-line no-useless-escape
      const thing = msg.text.match(/@?(\S+[^-\s])--(\s|$)/)[1].toLowerCase()
      this._store.down(this.thingWrapper(thing), 1, karma => {
        bot.reply(msg, `oops! ${thing}: ${karma}`)
      })
    })
  }
}
