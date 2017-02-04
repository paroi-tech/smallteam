import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import BoxList from "../BoxList/BoxList"
import TaskBox from "../TaskBox/TaskBox"
import App from "../App/App"
import { ProjectModel } from "../Model/FragmentsModel"
import { StepFragment } from "../../isomorphic/fragments/Step"
import { TaskFragment } from "../../isomorphic/fragments/Task"
import { querySteps, queryTasks } from "../Model/fakeModel"

const template = require("html-loader!./stepspanel.html")

export default class StepsPanel {
  private $container: JQuery
  private $stepsContainer: JQuery

  private map: Map<string, BoxList>

  constructor(private dash: Dash<App>, private projectModel: ProjectModel) {
    this.map = new Map<string, BoxList>()

    this.$container = $(template)
    this.$stepsContainer = this.$container.find(".js-boxlist-container")
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public init(): StepsPanel {
    let steps = querySteps(this.projectModel)
    let tasks = queryTasks(this.projectModel)
    for (let step of steps) {
      let bl = this.dash.create(BoxList, { args: [ step.name, this.projectModel.code ] }).init()
      for (let task of tasks)
        if (task.curStepId === step.id) {
          let box = this.dash.create(TaskBox, {
            group: "items",
            args: [ task.label ]
          })
          bl.addBox(box)
        }
      this.map.set(step.id, bl)
      bl.attachTo(this.$stepsContainer[0])
    }

    this.$container.find(".js-add-task-button").click((ev) => {
      console.log(`Add Task button click from StepsPanel ${this.projectModel.code}`)
      let s: string = this.$container.find("input").val()
      if(s.length > 0) {
        let t = this.dash.create(TaskBox, {
          group: "items",
          args: [s]
        })
        this.map.get("todo")!.addBox(t)
        console.log(`Task Added in StepsPanel ${this.projectModel.code}`)
      }
    })

    return this;
  }



}