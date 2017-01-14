import * as $ from 'jquery'
import {Application, ApplicationDash, ApplicationBkb, Log, LogItem} from 'bkb'
import TaskList from "../TaskList/TaskList"

export default class App implements Application {
  readonly bkb: ApplicationBkb
  readonly log: Log
  readonly nextTick: (cb: () => void) => void

  constructor(private dash: ApplicationDash<App>) {
    this.log = dash.bkb.log
    this.nextTick = dash.bkb.nextTick

    this.bkb.listen<LogItem>('log').call('dataFirst', data => {
      console.log(`[LOG] ${data.type} `, data.messages)
    })

    let $app = $('.js-app')

    const list = this.dash.create(TaskList, 'TODO List')
    list.attachTo($app[0])
  }
}