import * as $ from "jquery"
import App from "../App/App"
import { Component, Dash, Bkb } from "bkb"
import { Boxlist, BoxlistParams } from "../Boxlist/Boxlist"
import TaskBox from "../TaskBox/TaskBox"
import { exec, query, TaskModel } from "../Model/Model"

const template = require("html-loader!./stepspanel.html")

export default class StepsPanel {
  private $container: JQuery
  private $stepsContainer: JQuery

  private boxlistMap: Map<string, Boxlist>

  constructor(private dash: Dash<App>, private taskModel: TaskModel) {
    this.boxlistMap = new Map<string, Boxlist>()

    this.$container = $(template)
    this.$container.find(".js-title").text(this.taskModel.label)
    this.$stepsContainer = this.$container.find(".js-boxlist-container")
    this.$container.find(".js-add-task-button").click(() => {
      let name = this.$container.find(".js-task-name").val().trim()
      if (name.length > 1)
        this.createTask(name)
    })

    this.createBoxlists()
    this.fillBoxlists()
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  private createTask(name: string) {
    exec("create", "Task", {
      label: name,
      createdById: "1",
      parentTaskId: this.taskModel.id,
      curStepId: "1"
    })
    .then(taskModel => {
      let box = this.dash.create(TaskBox, {
        group: "items",
        args: [
          taskModel.id,
          taskModel.label
        ]
      })
      let bl = this.boxlistMap.get(taskModel.curStepId)
      if (bl)
        bl.addBox(box)
    })
    .catch(error => {
      console.error("Unable to create task.", error)
    })
  }

  private createBoxlists() {
    for (let step of this.taskModel.project.steps) {
      let bl = this.dash.create(Boxlist, {
        args: [
          {
            id: step.id,
            name: step.name,
            group: this.taskModel.code
          }
        ]
      })
      this.boxlistMap.set(step.id, bl)
      bl.attachTo(this.$stepsContainer[0])
    }
  }

  private fillBoxlists() {
    if (!this.taskModel.children)
      return
    for (let task of this.taskModel.children) {
      let bl = this.boxlistMap.get(task.curStepId)
      if (bl) {
        let box = this.dash.create(TaskBox, {
            group: "items",
            args: [
              task.id,
              task.label
            ]
        })
        bl.addBox(box)
      }
    }
  }

}