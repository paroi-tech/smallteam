import * as $ from "jquery"
import App from "../App/App"
import { Component, Dash, Bkb } from "bkb"
import Boxlist, { BoxlistParams } from "../Boxlist/Boxlist"
import TaskBox from "../TaskBox/TaskBox"
import Model, { TaskModel } from "../Model/Model"

const template = require("html-loader!./stepspanel.html")

export default class StepsPanel {
  private model: Model

  private $container: JQuery
  private $stepsContainer: JQuery

  private boxlistMap: Map<string, Boxlist<TaskBox>>

  constructor(private dash: Dash<App>, private task: TaskModel) {
    this.model = dash.app.model
    this.boxlistMap = new Map()

    this.$container = $(template)
    this.$container.find(".js-title").text("Hello")
    this.$stepsContainer = this.$container.find(".js-boxlist-container")
    this.$container.find(".js-add-task-button").click(() => {
      let name = this.$container.find(".js-task-name").val().trim()
      if (name.length > 1)
        this.createTask(name)
    })

    this.createBoxlists()
    this.fillBoxlists()

    this.dash.listenToChildren<TaskModel>("taskBoxSelected").call("dataFirst", data => {
      console.log(`TaskBox ${data.id} selected in stepspanel ${this.task.id}`)
    })
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  private createTask(name: string) {
    this.model.exec("create", "Task", {
      label: name,
      createdById: "1",
      parentTaskId: this.task.id,
      curStepId: "1"
    })
    .then(task => {
      let box = this.dash.create(TaskBox, {
        group: "items",
        args: [ task ]
      })
      let bl = this.boxlistMap.get(task.curStepId)
      if (bl)
        bl.addBox(box)
    })
    .catch(error => {
      console.error("Unable to create task.", error)
    })
  }

  private createBoxlists() {
    if (!this.task.project.steps)
      return
    for (let step of this.task.project.steps) {
      let bl = this.dash.create(Boxlist, {
        args: [
          { id: step.id, name: step.name, group: this.task.code }
        ]
      })
      this.boxlistMap.set(step.id, bl)
      bl.attachTo(this.$stepsContainer[0])
    }
  }

  private fillBoxlists() {
    if (!this.task.children)
      return
    for (let task of this.task.children) {
      let bl = this.boxlistMap.get(task.curStepId)
      if (bl) {
        let box = this.dash.create(TaskBox, {
            group: "items",
            args: [ task ]
        })
        bl.addBox(box)
      }
    }
  }

}