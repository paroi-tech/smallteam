import * as $ from "jquery"
import App from "../App/App"
import { Component, Dash, Bkb } from "bkb"
import BoxList, { BoxListParams } from "../BoxList/BoxList"
import TaskBox from "../TaskBox/TaskBox"
import { Model, ProjectModel, TaskModel, StepModel, StepTypeModel } from "../Model/Model"
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
  private boxlistMap: Map<string, BoxList<TaskBox>> = new Map()

  constructor(private dash: Dash<App>, private parentTask: TaskModel) {
    this.model = dash.app.model
    this.project = this.parentTask.project
    this.initJQueryObjects()
    this.createBoxLists()
    this.fillBoxLists()
    this.listenToModel()
    this.dash.listenToChildren<TaskModel>("taskBoxSelected").call("dataFirst", data => {
      console.log(`TaskBox ${data.id} selected in stepspanel ${this.parentTask.id}`)
    })
  }

  public refresh() {
    this.boxlistMap.clear()
    this.$stepsContainer.empty()
    this.createBoxLists()
    this.fillBoxLists()
  }

  private initJQueryObjects() {
    this.$container = $(template)
    // If the task of this StepsPanel is the project main task, the panel title is set to `Main task`.
    let $title = this.$container.find(".js-title span")
    $title.text(this.parentTask.id == this.project.rootTaskId? "Main tasks": this.parentTask.label)
    this.$stepsContainer = this.$container.find(".js-boxlist-container")
    this.$container.find(".js-add-task-button").click(() => { this.onAddtaskClick() })
  }

  private onAddtaskClick() {
    let name = (this.$container.find(".js-task-name").val() as string).trim()
    if (name.length < 1)
      console.log("Impossible to create a new task. Invalid name...")
    else if (this.project.steps.length == 0)
      console.log("Impossible to create a new task. Project has no step.")
    else
       this.createTask(name)
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  private listenToModel() {
    // We listen to StepType update events in order to update the BoxList titles.
    this.model.on("update", "dataFirst", data => {
      if (data.type === "StepType") {
        let stepType = data.model as StepTypeModel
        let step = this.parentTask.project.steps.find(step => step.typeId === stepType.id)
        if (step) {
          let list = this.boxlistMap.get(step.id)
          if (list)
            list.setTitle(stepType.name)
        }
      }
    })
    // We listen to Step creation events to remove or add BoxLists.
    this.model.on("change", "dataFirst", data => {
      if (data.cmd === "create" && data.type === "Step") {
        if ((data.model as StepModel).projectId === this.project.id)
          this.refresh()
      }
    })
    this.model.on("change", "dataFirst", data => {
      if (data.cmd === "delete" && data.type === "Step") {
        let stepId = data.id as string
        if (this.boxlistMap.has(stepId))
          this.refresh()
      }
    })
    this.model.on("reorder", "dataFirst", data => {
      this.refresh()
    })
  }

  private async createTask(name: string) {
    try {
        let task = await this.model.exec("create", "Task", {
        label: name,
        createdById: "1",
        parentTaskId: this.parentTask.id,
        curStepId: this.project.steps[0].id
      })
      let box = this.dash.create(TaskBox, {
        group: "items",
        args: [ task ]
      })
      let bl = this.boxlistMap.get(task.curStepId)
      if (bl)
        bl.addBox(box)
      this.$container.find(".js-task-name").val("")
    } catch(err) {
      console.error("Unable to create task...", err)
    }
  }

  private createBoxLists() {
    for (let step of this.project.steps) {
      let params = {
        id: step.id,
        group: this.parentTask.code,
        name: step.name,
        sort: true
      }
      let bl = this.dash.create(BoxList, {
        args: [params]
      })
      this.boxlistMap.set(step.id, bl)
      bl.attachTo(this.$stepsContainer.get(0))
    }
  }

  private fillBoxLists() {
    if (!this.parentTask.children)
      return
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
