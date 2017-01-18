import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import TaskBox from "../TaskBox/TaskBox"
import App from "../App/App"
import Sortable from "sortablejs"

const boxListTpl = require("html-loader!./boxlist.html")
const boxTpl = require("html-loader!./box.html")

export default class BoxList implements Component {
  static readonly componentName = "BoxList"
  readonly bkb: Bkb

  private $container: JQuery
  private $ul: JQuery

  constructor(private dash: Dash<App>, title: string, groupName: string) {
    this.$container = $(boxListTpl)
    this.$ul = this.$container.find("ul")
    this.$container.find(".js-title").text(title)

    Sortable.create(this.$ul[0], {
      "handle": ".js-handle",
      "group":  groupName
    })
    // FIXME Cannot work, because the TaskBox are not the children of the BoxList
    // dash.listenToChildren("grabFocus", { group: "items" }).call((evt) => {
    //   for (const child of dash.find<TaskBox>({ group: "items", componentName: "TaskBox" })) {
    //     if (child !== evt.source)
    //       child.setWithFocus(false)
    //   }
    // })
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public addBox(t: TaskBox) {
    let $li = $(boxTpl)
    t.attachTo($li[0])
    $li.appendTo(this.$ul)
  }
}