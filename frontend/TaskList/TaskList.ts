import * as $ from 'jquery'
import { Component, Dash, Bkb } from 'bkb'
import Task from "../Task/Task"
import App from '../App/App'

const containerTpl = require("html-loader!./container.html")
const liTpl = require("html-loader!./li.html")

export default class TaskList implements Component {
  static readonly componentName = 'TaskList'
  readonly bkb: Bkb
  private $container: JQuery
  private $ul: JQuery
  private taskCount = 0

  constructor(private dash: Dash<App>, title: string) {
    this.$container = $(containerTpl)
    this.$container.find('.js-h1').text(title)
    this.$ul = this.$container.find('.js-ul')
    this.$container.find('.js-addBtn').click(() => this.add())
    dash.listenToChildren('grabFocus', { group: 'items' }).call((evt) => {
      for (const child of dash.find<Task>({ group: 'items', componentName: 'Task' })) {
        if (child !== evt.source)
          child.setWithFocus(false)
      }
    })
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public add() {
    this.dash.app.log.info('add from tasklist')
    const id = this.taskCount++
    const $li = $(liTpl)
    const task = this.dash.create(Task, {
      group: 'items',
      args: ["Task " + id]
    }).attachTo($li.find('.js-task')[0])
    $li.appendTo(this.$ul).find('.js-handle').click(() => {
      console.log(`Button of task ${id} clicked...`)
    })
  }
}