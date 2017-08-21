import * as $ from "jquery"
import App from "../App/App"
import { Component, Dash, Bkb } from "bkb"
import BoxList, { BoxListParams } from "../BoxList/BoxList"
import TaskBox from "../TaskBox/TaskBox"
import { Model, ProjectModel, TaskModel, StepModel, StepTypeModel } from "../Model/Model"
import { removeAllChildren } from "../libraries/utils"
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
  private $boxListContainer: JQuery

  // BoxLists we created are stored in a map. The Keys are the IDs of the project steps.
  private boxListMap: Map<string, BoxList<TaskBox>> = new Map()

  // Map used to store TaskBoxes. The keys are the tasks orderNums.
  private taskBoxMap: Map<string, TaskBox> = new Map()

  constructor(private dash: Dash<App>, readonly parentTask: TaskModel) {
    this.model = dash.app.model
    this.project = this.parentTask.project
    this.initJQueryObjects()
    this.createBoxLists()
    this.fillBoxLists()
    this.listenToModel()
    this.listenToChildrenComponents()
  }

  /**
   * Create StepsPanel components from the template.
   */
  private initJQueryObjects() {
    this.$container = $(template)
    // If the task of this StepsPanel is the project main task, the panel title is set to `Main task`.
    let $title = this.$container.find(".js-title span")
    $title.text(this.parentTask.id == this.project.rootTaskId? "Main tasks": this.parentTask.label)
    this.$boxListContainer = this.$container.find(".js-boxlist-container")
    this.$container.find(".js-add-task-button").click(() => { this.onAddtaskClick() })
  }

  /**
   * Create a BoxList for each of the project step.
   */
  private createBoxLists() {
    for (let step of this.project.steps) {
      let l = this.createBoxListFor(step)
      this.boxListMap.set(step.id, l)
      l.attachTo(this.$boxListContainer.get(0))
    }
  }

  /**
   * Create a BoxList for a given step.
   *
   * @param step - the step for which the BoxList is created
   */
  private createBoxListFor(step: StepModel): BoxList<TaskBox> {
    let params = {
      id: step.id,
      group: this.parentTask.code,
      name: step.name,
      sort: true
    }
    return this.dash.create(BoxList, { args: [ params ] })
  }

  /**
   * Fill the BoxLists with the subtasks of the parent task.
   */
  private fillBoxLists() {
    if (!this.parentTask.children)
      return
    for (let task of this.parentTask.children) {
      let l = this.boxListMap.get(task.curStepId)
      if (l) {
        let box = this.dash.create(TaskBox, {
          group: "items",
          args: [ task ]
        })
        l.addBox(box)
      } else {
        console.log(`Unknown curStepId ${task.curStepId} in StepsPanel ${this}`)
      }
    }
  }

  /**
   * Handle the creation of a new task.
   */
  private onAddtaskClick() {
    let nameField = this.$container.find(".js-task-name")
    let name = nameField.val() as string
    if (name.length < 1)
      console.log("Impossible to create a new task. Invalid name...")
    else if (this.project.steps.length == 0)
      console.log("Impossible to create a new task. Project has no step.")
    else {
      if (this.createTask(name))
        nameField.val("")
      nameField.focus()
    }
  }

  /**
   * Listen to event from children components.
   * We listen to the following events:
   *  - taskBoxSelected
   */
  private listenToChildrenComponents() {
    this.dash.listenToChildren<TaskModel>("taskBoxSelected").call("dataFirst", data => {
      console.log(`TaskBox ${data.id} selected in stepspanel ${this.parentTask.id}`)
    })
  }

  /**
   * Listen to changes in the model.
   * The following events are handled:
   *  - StepType update, in order to update the BoxList titles.
   *  - Step creation, to add a new BoxList.
   *  - Step deletion, to remove the corresponding BoxList.
   *  - Task creation, to create a taskBox for the new task.
   */
  private listenToModel() {
    // StepType update event.
    this.model.on("update", "dataFirst", data => {
      if (data.type === "StepType") {
        let stepType = data.model as StepTypeModel
        let step = this.parentTask.project.findStep(stepType.id)
        if (step) {
          let list = this.boxListMap.get(step.id)
          if (list)
            list.setTitle(stepType.name)
        }
      }
    })
    // Step creation event.
    this.model.on("change", "dataFirst", data => {
      if (data.cmd === "create" && data.type === "Step") {
        let step = data.model as StepModel
        if (step.projectId !== this.project.id)
          return
        // We find the index of the Step in projectModel#steps and insert a BoxList
        // in $boxListContainer.
        let i = this.project.steps.indexOf(step)
        if (i != -1) {
          let l = this.createBoxListFor(step)
          this.boxListMap.set(step.id, l)
          let p = this.$boxListContainer.get(0)
          p.insertBefore(l.getRootElement(), i < p.childNodes.length? p.childNodes[0]: null)
        }
      }
    })
    // Step deletion event. We remove the BoxList from the StepsPanel.
    this.model.on("change", "dataFirst", data => {
      if (data.cmd === "delete" && data.type === "Step") {
        let stepId = data.id as string
        let bl = this.boxListMap.get(stepId)
        if (bl) {
          this.$boxListContainer.get(0).removeChild(bl.getRootElement())
          this.boxListMap.delete(stepId)
        }
      }
    })
    // StepTypes reorder event. The new order of the StepTypes are reflected in the ProjectModel.
    // We reorder the BoxLists in two steps. We remove the BoxLists from $boxListContainer, then we run
    // through projectModel#steps and add BoxLists in the order of the Steps. all children
    this.model.on("reorder", "dataFirst", data => {
      removeAllChildren(this.$boxListContainer.get(0))
      for (let step of this.project.steps) {
        let bl = this.boxListMap.get(step.id)
        if (bl)
          this.$boxListContainer.get(0).appendChild(bl.getRootElement())
      }
    })
    // Task creation event.
    this.model.on("change", "dataFirst", data => {
      if (data.cmd == "create" && data.type == "Task") {
        let task = data.model as TaskModel
        if (task.projectId != this.project.id || task.parentTaskId != this.parentTask.id)
          return
        let l = this.boxListMap.get(task.curStepId)
        if (l) {
          let box = this.dash.create(TaskBox, { group: "items", args: [ task ] })
          l.addBox(box)
        }
      }
    })
  }

  /**
   * Ask for the creation of a new task by the model.
   *
   * @param name - the name of a new task.
   */
  private async createTask(name: string): Promise<boolean> {
    try {
      let task = await this.model.exec("create", "Task", {
        label: name,
        createdById: "1",
        parentTaskId: this.parentTask.id,
        curStepId: this.project.steps[0].id
      })
      return true
    } catch(err) {
      console.error("Unable to create task...", err)
      return false
    }
  }

  /**
   * Return the StepsPanel root element.
   */
  public getContainer(): HTMLElement {
    return this.$container.get(0)
  }

  /**
   * Add the panel to a parent element.
   *
   * @param el - the element to which the panel will be added
   */
  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }
}
