import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import { Boxlist } from "../Boxlist/Boxlist"
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

  private map: Map<string, Boxlist>

  constructor(private dash: Dash<App>, private projectModel: ProjectModel) {
    this.map = new Map<string, Boxlist>()

    this.$container = $(template)
    this.$stepsContainer = this.$container.find(".js-boxlist-container")

    this.loadSteps()
    this.listenToEvents()
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  private listenToEvents() {
    this.$container.find(".js-add-task-button").click((ev) => {
      console.log(`Add Task button click from StepsPanel ${this.projectModel.code}`)
      let name: string = this.$container.find("input").val().trim()
      if(name.length > 0) {
        alert("Task adding is not yet implemented...")
        // let t = this.dash.create(TaskBox, {
        //   group: "items",
        //   args: [name]
        // })
        // let l = this.map.get("1")
        // if (l) {
        //   l.addBox(t)
        //   console.log(`Task Added in StepsPanel ${this.projectModel.code}`)
        // }
      } else
        alert("The task name should contain more characters...")
    })
  }

  private loadSteps() {
    let steps = querySteps(this.projectModel)
    let tasks = queryTasks(this.projectModel)
    for (let step of steps) {
      let bl = this.dash.create(Boxlist, { args: [ step.id, step.name, this.projectModel.code ] })
      for (let task of tasks) {
        if (task.curStepId === step.id) {
          let box = this.dash.create(TaskBox, {
            group: "items",
            args: [ task.id, task.label ]
          })
          bl.addBox(box)
        }
      }
      // TODO: Improve this. The key of the BoxList in the map should be its stepId.
      // But since we add new tasks in the BoxList which key is 1, we have to use
      // the typeId as key in the map.
      this.map.set(step.typeId, bl)
      bl.attachTo(this.$stepsContainer[0])
    }
  }

}