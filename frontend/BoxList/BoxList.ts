import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import TaskBox from "../TaskBox/TaskBox"
import App from "../App/App"
import * as Sortable from "sortablejs"

const boxListTpl = require("html-loader!./boxlist.html")
const boxTpl = require("html-loader!./box.html")

export interface Box {
  attachTo(HTMLElement)
}

export class BoxList {
  private $container: JQuery
  private $ul: JQuery

  constructor(private dash: Dash<App>, title: string, group?: string) {
    this.$container = $(boxListTpl)
    this.$ul = this.$container.find("ul")
    this.$container.find(".js-title").text(title)

    Sortable.create(this.$ul[0], {
      "handle": ".js-handle",
      "group": group
    })

    // FIXME: Cannot work, because the TaskBox are not the children of the BoxList
    // dash.listenToChildren("grabFocus", { group: "items" }).call((evt) => {
    //   for (const child of dash.find<TaskBox>({ group: "items", componentName: "TaskBox" })) {
    //     if (child !== evt.source)
    //       child.setWithFocus(false)
    //   }
    // })
  }

  public addBox(b: Box) {
    let $li = $(boxTpl)
    b.attachTo($li[0])
    $li.appendTo(this.$ul)
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }
}