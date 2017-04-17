import * as $ from "jquery"
import App from "../App/App"
import { Component, Dash, Bkb } from "bkb"
import Boxlist, { BoxlistParams } from "../Boxlist/Boxlist"
import TaskBox from "../TaskBox/TaskBox"
import { Model, ProjectModel, TaskModel} from "../Model/Model"

const template = require("html-loader!./stepspanel.html")

export default class StepsPanel {
  private model: Model
  private project: ProjectModel

  private $container: JQuery
  private $stepsContainer: JQuery

  private boxlistMap: Map<string, Boxlist<TaskBox>> = new Map()

  constructor(private dash: Dash<App>, private parentTask: TaskModel) {
    this.model = dash.app.model
    this.project = this.parentTask.project
    this.initJQueryObjects()
    this.createBoxlists()
    this.fillBoxlists()
    this.dash.listenToChildren<TaskModel>("taskBoxSelected").call("dataFirst", data => {
      console.log(`TaskBox ${data.id} selected in stepspanel ${this.parentTask.id}`)
    })
  }

  private initJQueryObjects() {
    this.$container = $(template)
    this.$container.find(".js-title").text(this.parentTask.label)
    this.$stepsContainer = this.$container.find(".js-boxlist-container")
    this.$container.find(".js-add-task-button").click(() => {
      let name = this.$container.find(".js-task-name").val().trim()
      if (name.length > 1 && this.project.steps.length > 0)
        this.createTask(name)
      else
        console.log("Impossible to create a new task. Invalid name or projet has no step.")
    })
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  private createTask(name: string) {
    this.model.exec("create", "Task", {
      label: name,
      createdById: "1",
      parentTaskId: this.parentTask.id,
      curStepId: "1"
    }).then(task => {
      let box = this.dash.create(TaskBox, {
        group: "items",
        args: [ task ]
      })
      let bl = this.boxlistMap.get(task.curStepId)
      if (bl)
        bl.addBox(box)
    }).catch(error => {
      console.error("Unable to create task...", error)
    })
  }

  private createBoxlists() {
    for (let step of this.project.steps) {
      let params = {
        id: step.id,
        group: this.parentTask.code,
        name: step.name,
        sort: true
      }
      let bl = this.dash.create(Boxlist, {
        args: [ params ]
      })
      this.boxlistMap.set(step.id, bl)
      bl.attachTo(this.$stepsContainer.get(0))
    }
  }

  private fillBoxlists() {
    if (!this.parentTask.children) {
      console.log("Parent task with no children", this.parentTask.description, "project:", this.project.id)
      return
    }
    console.log("filling stepspanel...")
    for (let task of this.parentTask.children) {
      let bl = this.boxlistMap.get(task.curStepId)
      if (bl) {
        let box = this.dash.create(TaskBox, {
            group: "items",
            args: [ task ]
        })
        bl.addBox(box)
      } else {
        console.log("unknown taskbox id...", task.curStepId)
      }
    }
  }

  public getContainer(): HTMLElement {
    return this.$container.get(0)
  }
}
