import * as $ from "jquery"
import App from "../App/App"
import { Component, Dash, Bkb } from "bkb"
import BoxList, { BoxListParams, BoxEvent, BoxListEvent } from "../BoxList/BoxList"
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

  // BoxLists we created are stored in a map. The keys are the IDs of the project step types.
  // We use StepType IDs because ProjectModel does not have a function to retrieve a Step based on its ID.
  // The only way to retrieve a Step given its ID is to search in `ProjectModel#steps`, which can time.
  private boxListMap: Map<string, BoxList<TaskBox>> = new Map()

  // Map used to store TaskBoxes. The keys are the tasks IDs.
  private taskBoxMap: Map<string, TaskBox> = new Map()

  /**
   * Create a new StepsPanel.
   * @param dash
   * @param parentTask
   */
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
    this.$container.find(".js-add-task-button").click(() => this.onAddtaskClick())
  }

  /**
   * Create a BoxList for each of the project step.
   */
  private createBoxLists() {
    for (let step of this.project.steps) {
      let l = this.createBoxListFor(step)
      this.boxListMap.set(step.typeId, l)
      l.attachTo(this.$boxListContainer.get(0))
    }
  }

  /**
   * Create a BoxList for a given step.
   *
   * @param step - the step for which the BoxList will be created
   */
  private createBoxListFor(step: StepModel): BoxList<TaskBox> {
    let params = {
      id: step.typeId,
      group: this.parentTask.code,
      name: step.name,
      sort: true
    }
    return this.dash.create(BoxList, { args: [ params ] })
  }

  /**
   * Create a TaskBox for a given task.
   * @param task the task for which the box will be created for.
   */
  private createTaskBoxFor(task: TaskModel, idProp = "id") {
    return this.dash.create(TaskBox, {
      group: "items",
      args: [ task, idProp ]
    })
  }

  /**
   * Handle the move of a TaskBox inside a BoxList.
   * NOTE: this method is called when a TaskBox is added to a BoxList.
   *
   * @param ev
   */
  private async onTaskBoxMove(ev: BoxEvent) {
    let box = this.taskBoxMap.get(ev.boxId)
    let step = this.project.findStepByType(ev.boxListId)
    if (!box)
      throw new Error(`Unable to find task with ID "${ev.boxId}" in StepsPanel "${this.parentTask.label}"`)
    else if (!step)
      throw new Error(`Unable to find StepType "${ev.boxListId}" in StepsPanel "${this.parentTask.label}"`)
    else {
      let task = box.task
      try {
        await this.model.exec("update", "Task", { id: box.task.id, curStepId: step.id })
      } catch(err) {
        console.error(`Unable to update task "${box.task.id}" in StepsPanel "${this.parentTask.label}"`)
        // We bring back the TaskBox in its old BoxList.
        let newList = this.boxListMap.get(step.typeId)
        let oldList = this.boxListMap.get(box.task.currentStep.typeId)
        if (!newList)
          throw new Error(`Cannot find BoxList with ID "${step.typeId}" in StepsPanel "${this.parentTask.label}"`)
        if (!oldList)
          throw new Error(`Cannot find BoxList with ID "${task.currentStep.typeId}" in StepsPanel "${this.parentTask.label}"`)
        newList.removeBox(box.task.id)
        oldList.addBox(box)
      }
    }
  }

  /**
   * Fill the BoxLists with the subtasks of the parent task.
   */
  private fillBoxLists() {
    if (!this.parentTask.children)
      return
    for (let task of this.parentTask.children) {
      let l = this.boxListMap.get(task.currentStep.typeId)
      if (l) {
        let box = this.createTaskBoxFor(task, "id")
        this.taskBoxMap.set(task.id, box)
        l.addBox(box)
      } else
        console.log(`Unknown StepType ID "${task.curStepId}" in StepsPanel "${this}"`)
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
   *  - boxListItemAdded
   *  - boxListSortingUpdated
   */
  private listenToChildrenComponents() {
    this.dash.listenToChildren<TaskModel>("taskBoxSelected").call("dataFirst", data => {
      console.log(`TaskBox ${data.id} selected in stepspanel ${this.parentTask.id}`)
    })
    this.dash.listenToChildren<BoxEvent>("boxListItemAdded").call("dataFirst", data => {
      this.onTaskBoxMove(data)
    })
    this.dash.listenToChildren<BoxListEvent>("boxListSortingUpdated").call("dataFirst", data => {
      this.onTaskReorder(data)
    })
  }

  /**
   * Update the order of the tasks in the model.
   *
   * @param ev
   */
  private async onTaskReorder(ev: BoxListEvent) {
    try {
      let result = await this.model.reorder("Task", ["-1"], this.parentTask.id)
      console.log(`Tasks successfully reordered in StepsPanel "${this.parentTask.label}"`)
    } catch (err) {
      console.log(`Impossible to reorder tasks in StepsPanel "${this.parentTask.label}"`)
      // We restore the previous order of the elements in the BoxList.
      // The following retrieve the child tasks which are in the concerned step.
      let taskIds = this.parentTask.children!.reduce(
        function (result: string[], task: TaskModel) {
          if (task.currentStep.typeId == ev.boxListId)
            result.push(task.id)
          return result
        }, []
      )
      let l = this.boxListMap.get(ev.boxListId)
      if (l)
        l.setBoxesOrder(taskIds)
      else
        console.error(`Cannot restore order in list "${ev.boxListId}" in StepsPanel "${this.parentTask.label}"`)
    }
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
    // FIXME: update code for step deletion event in model
    // StepType update event.
    this.model.on("update", "dataFirst", data => {
      if (data.type === "StepType") {
        let stepType = data.model as StepTypeModel
        let step = this.parentTask.project.findStepByType(stepType.id)
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
          this.boxListMap.set(step.typeId, l)
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
          let box = this.createTaskBoxFor(task, "id")
          this.taskBoxMap.set(task.id, box)
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
  public getRootElement(): HTMLElement {
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
