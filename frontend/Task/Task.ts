import * as $ from 'jquery'
import {Component, Dash, Bkb} from 'bkb'
import App from '../App/App'

const template = require("html!./task.html")

export default class Task implements Component {
  static readonly componentName = 'Task'
  readonly bkb: Bkb
  private $container: JQuery

  constructor(private dash: Dash<App>, label: string) {
    this.$container = $(template)
    this.$container.find('.js-span').text(label)
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public setWithFocus(focus: boolean) {
    if(focus) {
      this.$container.addClass("focus")
    } else {
      this.$container.removeClass("focus")
    }
  }
} 