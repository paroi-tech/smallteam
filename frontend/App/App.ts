import * as $ from 'jquery'
import {Application, ApplicationDash, ApplicationBkb, Log, LogItem} from 'bkb'
import BoxList from "../BoxList/BoxList"

export default class App implements Application {
  readonly bkb: ApplicationBkb
  readonly log: Log
  readonly nextTick: (cb: () => void) => void

  constructor(private dash: ApplicationDash<App>) {
    this.log = dash.bkb.log
    this.nextTick = dash.bkb.nextTick

    this.dash.on('log', 'dataFirst', (data: LogItem) => {
      console.log(`[LOG] ${data.type} `, data.messages)
    })
  }

  public start() {
    let $app = $('.js-app')
    let list = this.dash.create(BoxList, {args: ['Todo']})
    list.attachTo($app[0])
    list = this.dash.create(BoxList, {args: ['Working']})
    list.attachTo($app[0])
    list = this.dash.create(BoxList, {args: ['Done']})
    list.attachTo($app[0])
  }
}