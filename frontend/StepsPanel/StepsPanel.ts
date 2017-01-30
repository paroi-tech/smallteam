import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import BoxList from "../BoxList/BoxList"
import TaskBox from "../TaskBox/TaskBox"
import App from "../App/App"

const template = require("html-loader!./stepspanel.html")

export default class StepsPanel implements Component {
  static readonly componentName = "StepsPanel"
  readonly bkb: Bkb

  private map: Map<string, BoxList>
  private id: string

  private $container: JQuery
  private $boxListContainer: JQuery

  constructor(private dash: Dash<App>, id: string, title: string) {
    this.id = id
    this.map = new Map<string, BoxList>()

    this.$container = $(template)
    this.$container.find(".js-title").text(title)
    this.$boxListContainer = this.$container.find(".js-boxlist-container")
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public init(): StepsPanel {
    // FIXME: We add elements to the panel only for test purpose
    this.map.set("todo", this.dash.create(BoxList, { args: [ "Todo", this.id ] }))
    this.map.set("running", this.dash.create(BoxList, { args: [ "Running", this.id ] }))
    this.map.set("done", this.dash.create(BoxList, { args: [ "Done", this.id ] }))
    for (let boxList of Array.from(this.map.values()))
      boxList.attachTo(this.$boxListContainer[0])

    this.$container.find(".js-add-task-button").click((ev) => {
      console.log(`Add Task button click from StepsPanel ${this.id}`)

      let s: string = this.$container.find("input").val()
      if(s.length > 0) {
        let t = this.dash.create(TaskBox, {
          group: "items",
          args: [s]
        })
        this.map.get("todo")!.addBox(t)
        console.log(`Task Added in StepsPanel ${this.id}`)
      }
    })

    return this;
  }



}