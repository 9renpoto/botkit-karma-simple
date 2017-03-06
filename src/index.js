/* @flow */
import KarmaStore from 'karma-store-redis'

type Controller = {
  hears: Function
}

function format (data: string, length = 2): string {
  if (data.length === length) {
    return data
  }

  if (data.length < length) {
    length -= data.length
    for (let i = 0; i < length; i++) {
      data = '0' + data
    }
  }
  return data
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
  plus () {
    this._ctrl.hears(['([^+\\s])\\+\\+(\\s|$)'], ['ambient'], (bot, msg) => {
      const thing = this.thingWrapper(msg.text.match(/@?(\S+[^+\s])\+\+(\s|$)/)[1].toLowerCase())
      const n = 1
      this._store.up(thing, n, karma => {
        bot.reply(msg, `level up! ${thing}: +${n} (Karma: ${karma})`)
      })
    })
  }
  minus () {
    this._ctrl.hears(['([^-\s])--(\s|$)'], ['ambient'], (bot, msg) => {  // eslint-disable-line no-useless-escape
      const thing = this.thingWrapper(msg.text.match(/@?(\S+[^-\s])--(\s|$)/)[1].toLowerCase())
      const n = 1
      this._store.down(thing, n, karma => {
        bot.reply(msg, `oops! ${thing}: -${n} (Karma: ${karma})`)
      })
    })
  }
  showTop (cnt: number = 10) {
    this._ctrl.hears('karma best', ['direct_mention', 'mention'], (bot, msg) => {
      this._store.top(cnt, (top: string[]) => {
        const response = [`The Best:`]
        for (let i = 0; i < top.length; i += 2) {
          response.push(`${format(((i / 2) + 1).toString())}. ${top[i]}: ${top[i + 1]}`)
        }
        bot.reply(msg, response.join('\n'))
      })
    })
  }
  listen () {
    this.plus()
    this.minus()
    this.showTop()
  }
}
