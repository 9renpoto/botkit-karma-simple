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

function formatRank (firstMsg: string, data: string[]): string[] {
  const response = [firstMsg]
  for (let i = 0; i < data.length; i += 2) {
    response.push(
      `${format((i / 2 + 1).toString())}. ${data[i]}: ${data[i + 1]}`
    )
  }
  return response
}

export default class KarmaBot {
  _store: KarmaStore
  _ctrl: Controller
  constructor (ctrl: Controller, storeName: string = 'karmastore') {
    this._ctrl = ctrl
    this._store = new KarmaStore(storeName)
  }
  thingWrapper (thing: string): string {
    return thing
  }
  plus (): void {
    this._ctrl.hears(['([^+\\s])\\+\\+(\\s|$)'], ['ambient'], (bot, msg) => {
      const thing = this.thingWrapper(
        msg.text.match(/(\S+[^+\s])\+\+(\s|$)/)[1].toLowerCase()
      )
      const n = 1
      this._store.up(thing, n, karma => {
        bot.reply(msg, `level up! ${thing}: +${n} (Karma: ${karma})`)
      })
    })
  }
  minus (): void {
    this._ctrl.hears(['([^-s])--(s|$)'], ['ambient'], (bot, msg) => {
      const thing = this.thingWrapper(
        msg.text.match(/(\S+[^-\s])--(\s|$)/)[1].toLowerCase()
      )
      const n = 1
      this._store.down(thing, n, karma => {
        bot.reply(msg, `oops! ${thing}: -${n} (Karma: ${karma})`)
      })
    })
  }
  showTop (cnt: number = 5): void {
    this._ctrl.hears(
      'karma best',
      ['direct_mention', 'mention'],
      (bot, msg) => {
        this._store.top(cnt, (top: string[]) => {
          bot.reply(msg, formatRank(`The Best:`, top).join('\n'))
        })
      }
    )
  }
  showWorst (cnt: number = 5): void {
    this._ctrl.hears(
      'karma worst',
      ['direct_mention', 'mention'],
      (bot, msg) => {
        this._store.lowest(cnt, (worst: string[]) => {
          bot.reply(msg, formatRank(`The Worst:`, worst).join('\n'))
        })
      }
    )
  }
  listen (): void {
    this.plus()
    this.minus()
    this.showTop()
    this.showWorst()
  }
}
