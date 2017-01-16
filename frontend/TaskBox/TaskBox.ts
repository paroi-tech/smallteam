import * as $ from 'jquery'
import {Component, Dash, Bkb} from 'bkb'
import App from '../App/App'

// const template = require("html-loader!./task.html")
import * as template from "html-loader!./taskbox.html"

export default class TaskBox implements Component {
  static readonly componentName = 'Task'
  readonly bkb: Bkb
  private $container: JQuery

  constructor(private dash: Dash<App>, title: string, description: string) {
    this.$container = $(template)
    this.$container.find('.js-span').text(title)
    this.$container.find('.js-p').text(description)
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