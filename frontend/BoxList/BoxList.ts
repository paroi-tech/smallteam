import * as $ from 'jquery'
import { Component, Dash, Bkb } from 'bkb'
import TaskBox from "../TaskBox/TaskBox"
import App from '../App/App'

const boxListTpl = require("html-loader!./boxlist.html")
const boxTpl = require("html-loader!./box.html")

export default class BoxList implements Component {
  static readonly componentName = 'BoxList'
  readonly bkb: Bkb
  private $container: JQuery
  private $ul: JQuery
  private boxCount = 0

  constructor(private dash: Dash<App>, title: string) {
    this.$container = $(boxListTpl)
    this.$container.find('.js-h1').text(title)
    this.$ul = this.$container.find('.js-ul')
    this.$container.find('.js-addBtn').click(() => this.add())
    dash.listenToChildren('grabFocus', { group: 'items' }).call((evt) => {
      for (const child of dash.find<TaskBox>({ group: 'items', componentName: 'Task' })) {
        if (child !== evt.source)
          child.setWithFocus(false)
      }
    })
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public add() {
    this.dash.app.log.info('Adding a box to boxlist...')
    const id = this.boxCount++
    const $li = $(boxTpl)
    const taskBox = this.dash.create(TaskBox, {
      group: 'items',
      args: ["Box " + id]
    }).attachTo($li.find('.js-box')[0])
    $li.appendTo(this.$ul).find('.js-handle').click(() => {
      console.log(`Button of task ${id} clicked...`)
    })
  }
}