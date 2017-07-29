import * as $ from "jquery"
import App from "../App/App"
import { Component, Dash, Bkb } from "bkb"
import Boxlist, { BoxlistParams } from "../Boxlist/Boxlist"
import TaskBox from "../TaskBox/TaskBox"
import { Model, ProjectModel, TaskModel } from "../Model/Model"
import { toDebugObj } from "../../isomorphic/libraries/helpers"

const template = require("html-loader!./stepspanel.html")

/**
 * Component used to display a task and its children (subtasks).
 *
 * A StepsPanel can contain several BoxLists, one BoxList per project step. Substasks are displayed in
 * those BoxLists, according to subtasks states (e.g Todo, Running, Done, etc.)
 */
export default class StepsPanel {
  private model: Model
  private project: ProjectModel

  private $container: JQuery
  private $stepsContainer: JQuery

  // BoxLists we created are stored in a map. The Keys are the IDs of the project steps.
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
    // If the task represented by this StepsPanel is the project main task, the title of the panel
    // is set to `Main task`.
    let $title = this.$container.find(".js-title span")
    $title.text(this.parentTask.id == this.project.rootTaskId? "Main tasks": this.parentTask.label)
    this.$stepsContainer = this.$container.find(".js-boxlist-container")
    this.$container.find(".js-add-task-button").click(() => {
      let name = this.$container.find(".js-task-name").val().trim()
      if (name.length < 1)
        console.log("Impossible to create a new task. Invalid name...")
      else if (this.project.steps.length == 0)
        console.log("Impossible to create a new task. Project has no step.")
      else
        this.createTask(name)
      })
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  private async createTask(name: string) {
    let task = await this.model.exec("create", "Task", {
      label: name,
      createdById: "1",
      parentTaskId: this.parentTask.id,
      curStepId: this.project.steps[0].id
    })
    try {
      let box = this.dash.create(TaskBox, {
        group: "items",
        args: [ task ]
      })
      let bl = this.boxlistMap.get(task.curStepId)
      if (bl)
        bl.addBox(box)
    } catch(err) {
      console.error("Unable to create task...", err)
    }
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
        args: [params]
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
          args: [task]
        })
        bl.addBox(box)
      } else {
        console.log("unknown taskbox id...", task.curStepId, toDebugObj(this.boxlistMap))
      }
    }
  }

  public getContainer(): HTMLElement {
    return this.$container.get(0)
  }
}
