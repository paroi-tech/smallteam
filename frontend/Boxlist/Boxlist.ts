import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import TaskBox from "../TaskBox/TaskBox"
import App from "../App/App"
import * as Sortable from "sortablejs"

const listTemplate = require("html-loader!./boxlist.html")
const boxTemplate  = require("html-loader!./box.html")

export interface Box {
  id: string
  attachTo(HTMLElement)
}

export class Boxlist {
  private $container: JQuery
  private $ul: JQuery

  constructor(private dash: Dash<App>, private id: string | null, title: string, group?: string) {
    this.$container = $(listTemplate)
    this.$ul = this.$container.find("ul")
    this.$container.find(".js-title").text(title)

    Sortable.create(this.$ul[0], {
      "handle": ".js-handle",
      "group": group,
      /* Element is dropped into the list from another list. */
      onAdd: (ev) => {
          let boxId = ev.item.dataset.id;
          this.dash.emit("boxlistItemAdded", {
            boxlistId: this.id,
            boxId: boxId
          })
      },
      /* Element is removed from the list into another list. */
      onRemove: (ev) => {
          let boxId = ev.item.dataset.id;
          this.dash.emit("boxlistItemRemoved", {
            boxlistId: this.id,
            boxId: boxId
          })
      },
      /* Changed sorting within list. */
      onUpdate: (ev) => {
        console.log("boxlist updated")
        let boxId = ev.item.dataset.id;
        this.dash.emit("boxlistUpdated", {
          id: this.id
        })
      }
    })

    // FIXME: Cannot work, because the TaskBox are not the children of the BoxList
    // dash.listenToChildren("grabFocus", { group: "items" }).call((evt) => {
    //   for (const child of dash.find<TaskBox>({ group: "items", componentName: "TaskBox" })) {
    //     if (child !== evt.source)
    //       child.setWithFocus(false)
    //   }
    // })
  }

  public addBox(box: Box) {
    let $li = $(boxTemplate)
    $li[0].setAttribute("data-id", box.id)
    box.attachTo($li[0])
    $li.appendTo(this.$ul)
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }
}