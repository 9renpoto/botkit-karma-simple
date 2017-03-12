/* @flow */
import KarmaStore from 'karma-store-redis'

type Controller = {
  hears: Function
}

/**
 * number formatter
 * @param  {String} data - number of string
 * @param  {Number} [length=2] - max digits, ex. 2 when 99
 * @return {string} 099 when length 3 data 99
 */
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

/**
 * This is KarmaBot
 */
export default class KarmaBot {
  _store: KarmaStore
  _ctrl: Controller
  constructor (ctrl: Controller, storeName: string = 'karmastore') {
    this._ctrl = ctrl
    this._store = new KarmaStore(storeName)
  }
  /**
   * karma wrapper
   * @param {String} thing default
   * @returns {String} return default, please override this method
   */
  thingWrapper (thing: string): string {
    return thing
  }
  /**
   * hears ++ things
   * @returns {void}
   */
  plus (): void {
    this._ctrl.hears(['([^+\\s])\\+\\+(\\s|$)'], ['ambient'], (bot, msg) => {
      const thing = this.thingWrapper(msg.text.match(/@?(\S+[^+\s])\+\+(\s|$)/)[1].toLowerCase())
      const n = 1
      this._store.up(thing, n, karma => {
        bot.reply(msg, `level up! ${thing}: +${n} (Karma: ${karma})`)
      })
    })
  }
  /**
   * hears -- things
   * @return {void}
   */
  minus (): void {
    this._ctrl.hears(['([^-\s])--(\s|$)'], ['ambient'], (bot, msg) => {  // eslint-disable-line no-useless-escape
      const thing = this.thingWrapper(msg.text.match(/@?(\S+[^-\s])--(\s|$)/)[1].toLowerCase())
      const n = 1
      this._store.down(thing, n, karma => {
        bot.reply(msg, `oops! ${thing}: -${n} (Karma: ${karma})`)
      })
    })
  }
  /**
   * show stored karma top best
   * @param {number} cnt show count
   * @return {void}
   */
  showTop (cnt: number = 10): void {
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
  /**
   * listen all hears
   * @return {void}
   */
  listen (): void {
    this.plus()
    this.minus()
    this.showTop()
  }
}
