import * as $ from "jquery"
import App from "../App/App"
import { Dash, Bkb } from "bkb"
import BoxList, { BoxListParams, BoxEvent, BoxListEvent } from "../BoxList/BoxList"
import TaskBox from "../TaskBox/TaskBox"
import { Model, ProjectModel, TaskModel, StepModel, StepTypeModel } from "../AppModel/AppModel"
import { removeAllChildren } from "../libraries/utils"
import { toDebugObj } from "../../isomorphic/libraries/helpers"
import { ReorderModelEvent, UpdateModelEvent } from "../AppModel/ModelEngine"

const template = require("html-loader!./stepswitcher.html")

/**
 * Component used to display a task and its children (subtasks).
 *
 * A StepSwitcher can contain several BoxLists, one BoxList per project step. Substasks are displayed
 * in those BoxLists, according to subtasks states (e.g Todo, Running, Done, etc.)
 */
export default class StepSwitcher {
  readonly el: HTMLElement

  private model: Model
  private project: ProjectModel

  private taskNameEl: HTMLInputElement
  private addTaskSpinnerEl: HTMLElement
  private busyIndicatorEl: HTMLElement
  private collapsibleEl: HTMLElement
  private boxListContainerEl: HTMLElement
  private collapsibleElVisible = true
  private visible = true

  // BoxLists we created are stored in a map. The keys are the IDs of the project steps.
  private boxLists = new Map<string, BoxList<TaskBox>>()

  // Map used to store TaskBoxes. The keys are the task IDs.
  private taskBoxes = new Map<string, TaskBox>()

  /**
   * Create a new StepSwitcher.
   *
   * @param dash
   * @param parentTask
   */
  constructor(private dash: Dash<App>, readonly parentTask: TaskModel) {
    this.model = dash.app.model
    this.project = this.parentTask.project
    this.el = this.createHtmlElements()
    this.createBoxLists()
    this.fillBoxLists()
    this.listenToModel()
    this.listenToChildren()
  }

  /**
   * Create StepSwitcher components from the template.
   */
  private createHtmlElements() {
    let $container = $(template)
    this.taskNameEl = $container.find(".js-task-name").get(0) as HTMLInputElement
    this.addTaskSpinnerEl = $container.find(".js-add-task-button .fa-spinner").get(0)
    this.busyIndicatorEl = $container.find(".js-indicator").get(0)
    this.collapsibleEl = $container.find(".js-collapsible").get(0)
    this.boxListContainerEl = $container.find(".js-boxlist-container").get(0)

    // If the task of this StepSwitcher is the project main task, the panel title is set to 'Main tasks'.
    let title = this.parentTask.id === this.project.rootTaskId ? "Main tasks": this.parentTask.label
    $container.find(".js-title").text(title)

    let toggleBtn = $container.find(".js-toggle-btn").get(0) as HTMLButtonElement
    toggleBtn.addEventListener("click", ev => {
      toggleBtn.innerHTML = this.collapsibleElVisible ? "&#9660;" : "&#9650;"
      $(this.collapsibleEl).slideToggle()
      this.collapsibleElVisible = !this.collapsibleElVisible
    })

    let closeBtn = $container.find(".js-close-btn").get(0) as HTMLButtonElement
    closeBtn.addEventListener("click", ev => {
      if (this.parentTask.id !== this.project.rootTaskId) // We can't hide the rootTask StepSwitcher.
        this.setVisible(false)
    })

    $container.find(".js-add-task-button").click(() => this.onAddtaskClick())

    return $container.get(0)
  }

  /**
   * Create a BoxList for each of the project step.
   */
  private createBoxLists() {
    for (let step of this.project.steps) {
      let list = this.createBoxListFor(step)
      this.boxListContainerEl.appendChild(list.el)
    }
  }

  /**
   * Create a BoxList for a given step.
   *
   * @param step - the step for which the BoxList will be created
   */
  private createBoxListFor(step: StepModel): BoxList<TaskBox> {
    let params = {
      id: step.id,
      group: this.parentTask.code,
      name: step.name,
      sort: true
    }
    let b = this.dash.create(BoxList, params)
    this.boxLists.set(step.id, b)
    return b
  }

  /**
   * Create a StepSwitcher for a given task.
   * @param task the task for which the box will be created for.
   */
  private createTaskBoxFor(task: TaskModel) {
    return this.dash.customCreate({
      Class: TaskBox,
      group: "items",
      argument: task
    })
  }

  /**
   * Handle the move of a TaskBox inside a BoxList.
   *
   * NOTE: this method is called when a TaskBox is added to a BoxList.
   *
   * @param ev
   */
  private async onTaskBoxMove(ev: BoxEvent) {
    let box = this.taskBoxes.get(ev.boxId)
    let step = this.project.steps.find(step => step.id === ev.boxListId)
    if (!box)
      throw new Error(`Unable to find task with ID "${ev.boxId}" in StepSwitcher`)
    else if (!step)
      throw new Error(`Unable to find Step with ID "${ev.boxListId}" in StepSwitcher`)
    else {
      this.disable(true)
      let task = box.task
      try {
        await this.model.exec("update", "Task", { id: box.task.id, curStepId: step.id })
      } catch(err) {
        console.error(`Unable to update task "${box.task.id}" in StepSwitcher "${this.parentTask.label}"`)
        // We bring back the TaskBox in its old BoxList.
        let newList = this.boxLists.get(step.id)
        let oldList = this.boxLists.get(box.task.currentStep.typeId)
        if (!newList)
          throw new Error(`Cannot find BoxList with ID "${step.id}" in StepSwitcher "${this.parentTask.label}"`)
        if (!oldList)
          throw new Error(`Cannot find BoxList with ID "${task.currentStep.id}" in StepSwitcher "${this.parentTask.label}"`)
        newList.removeBox(box.task.id)
        oldList.addBox(box)
      }
      this.enable(true)
    }
  }

  /**
   * Fill the BoxLists with the subtasks of the parent task.
   */
  private fillBoxLists() {
    if (!this.parentTask.children)
      return
    for (let task of this.parentTask.children) {
      if (task.currentStep.isSpecial)
        continue
      let bl = this.boxLists.get(task.currentStep.id)
      if (bl) {
        let box = this.createTaskBoxFor(task)
        this.taskBoxes.set(task.id, box)
        bl.addBox(box)
      } else
        console.log(`Unknown Step "${task.currentStep.id}" in StepSwitcher`, this)
    }
  }

  /**
   * Handle the creation of a new task.
   */
  private async onAddtaskClick() {
    let name = this.taskNameEl.value
    if (name.length < 1)
      console.log("Impossible to create a new task. Invalid name...")
    else if (this.project.steps.length === 0)
      console.log("Impossible to create a new task. Project has no step.")
    else {
      this.addTaskSpinnerEl.style.display = "inline"
      if (await this.createTask(name))
        this.taskNameEl.value = ""
      this.addTaskSpinnerEl.style.display = "none"
      this.taskNameEl.focus()
    }
  }

  /**
   * Listen to event from children components.
   * We listen to the following events:
   *  - taskBoxSelected
   *  - boxListItemAdded
   *  - boxListSortingUpdated
   */
  private listenToChildren() {
    // this.dash.listenToChildren<TaskModel>("taskBoxSelected").onData(data => {
    //   console.log(`TaskBox ${data.id} selected in StepSwitcher ${this.parentTask.id}`)
    // })
    this.dash.listenToChildren<BoxEvent>("boxListItemAdded").onData(data => {
      this.onTaskBoxMove(data)
    })
    this.dash.listenToChildren<BoxListEvent>("boxListSortingUpdated").onData(data => {
      this.onTaskReorder(data)
    })
  }

  /**
   * Update the order of the tasks in the model.
   *
   * @param ev
   */
  private async onTaskReorder(ev: BoxListEvent) {
    let boxList = this.boxLists.get(ev.boxListId)
    if (!boxList)
      throw new Error(`Unknown BoxList with ID ${ev.boxListId} in StepSwitcher ${this.parentTask.label}`)
    boxList.disable(true)
    try {
      let result = await this.model.reorder("Task", ev.boxIds, "childOf", this.parentTask.id)
      console.log(`Tasks successfully reordered in StepSwitcher "${this.parentTask.label}"`)
    } catch (err) {
      console.log(`Impossible to reorder tasks in StepSwitcher "${this.parentTask.label}"`)
      // We restore the previous order of the elements in the BoxList.
      // The following retrieve the child tasks which are in the concerned step.
      let taskIds = this.parentTask.children!.reduce((result: string[], task: TaskModel) => {
          if (task.currentStep.id == ev.boxListId)
            result.push(task.id)
          return result
        }, []
      )
      let list = this.boxLists.get(ev.boxListId)
      if (list)
        list.setBoxesOrder(taskIds)
      else
        console.error(`Cannot restore order in list "${ev.boxListId}" in StepSwitcher "${this.parentTask.label}"`)
    }
    boxList.enable(true)
  }

  /**
   * Listen to changes in the model.
   * The following events are handled:
   *  - StepType update, in order to update the BoxList titles.
   *  - StepType reorder, to reorder the BoxLists.
   *  - Step creation, to add a new BoxList.
   *  - Step deletion, to remove the corresponding BoxList.
   *  - Task creation, to create a taskBox for the new task.
   *  - Task deletion, to remove TaskBox (if any).
   */
  private listenToModel() {
    // StepType update event.
    this.dash.listenTo<UpdateModelEvent>(this.model, "updateStepType").onData(data => {
      let stepType = data.model as StepTypeModel
      let step = this.parentTask.project.findStepByType(stepType.id)
      if (step) {
        let list = this.boxLists.get(step.id)
        if (list)
          list.setTitle(stepType.name)
      }
    })

    // Step creation event.
    this.dash.listenTo<UpdateModelEvent>(this.model, "createStep").onData(data => {
      let newStep = data.model as StepModel
      if (newStep.projectId !== this.project.id)
        return
      // We find the index of the Step in projectModel#steps and insert a BoxList
      // in $boxListContainer.
      let i = this.project.steps.findIndex(step => step.id === newStep.id)
      if (i != -1) {
        let list = this.createBoxListFor(newStep)
        let parent = this.boxListContainerEl
        parent.insertBefore(list.el, i < parent.childNodes.length? parent.childNodes[i]: null)
      }
    })

    // Step deletion event. We remove the BoxList from the StepSwitcher.
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteStep").onData(data => {
      let stepId = data.id as string
      let list = this.boxLists.get(stepId)
      if (list) {
        this.boxListContainerEl.removeChild(list.el)
        this.boxLists.delete(stepId)
      }
    })

    // StepTypes reorder event.
    // An alternative solution to sort the content of an HTML element using `data-sort` attribute
    // can be found at:
    // https://stackoverflow.com/questions/7831712/jquery-sort-divs-by-innerhtml-of-children
    this.dash.listenTo<ReorderModelEvent>(this.model, "reorderStepType").onData(data => {
      for (let id of data.orderedIds) {
        let step = this.project.findStepByType(id as string)
        if (step) {
          let list = this.boxLists.get(step.id)
          if (list)
            this.boxListContainerEl.appendChild(list.el)
        }
      }
    })

    // Task creation event.
    this.dash.listenTo<UpdateModelEvent>(this.model, "createTask").onData(data => {
      let task = data.model as TaskModel
      if (task.projectId != this.project.id || task.parentTaskId != this.parentTask.id)
        return
      let list = this.boxLists.get(task.curStepId)
      if (list) {
        let box = this.createTaskBoxFor(task)
        this.taskBoxes.set(task.id, box)
        list.addBox(box)
      }
    })

    // Task deletion event.
    // We check if the StepSwitcher contains a TaskBox related to the deleted task.
    // If yes, we remove the TaskBox from the BoxList and from the StepSwitcher taskBoxMap.
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteTask").onData(data => {
      let taskId = data.id as string
      let taskBox = this.taskBoxes.get(taskId)
      if (!taskBox)
        return
      let boxList = [...this.boxLists.values()].find(b => b.hasBox(taskId))
      if (boxList)
        boxList.removeBox(taskId)
      this.taskBoxes.delete(taskId)
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
   * Show the busy indicator.
   */
  public showBusyIcon() {
    this.busyIndicatorEl.style.display = "inline"
  }

  /**
   * Hide the busy indicator.
   */
  public hideBusyIcon() {
    this.busyIndicatorEl.style.display = "none"
  }

  /**
   * Show or hide the pane.
   * @param b
   */
  public setVisible(b: boolean) {
    if (b !== this.visible) {
      this.el.style.display = b ? "block" : "none"
      this.visible = b
    }
  }

  /**
   * Tell if the pane is currently visible or hidden.
   */
  public get isVisible() {
    return this.visible
  }

  /**
   * Enable the component, i.e. the collapsible content.
   *
   * @param showBusyIcon Indicate if the busy icon should be hidden
   */
  public enable(showBusyIcon: boolean = false) {
    this.collapsibleEl.style.pointerEvents = this.el.style.pointerEvents = "auto"
    this.collapsibleEl.style.opacity = "1.0"
    if (showBusyIcon)
      this.hideBusyIcon()
  }

  /**
   * Disable the component, i.e. the collapsible content.
   *
   * @param showBusyIcon Indicate if the busy should be shown
   */
  public disable(showBusyIcon: boolean = false) {
    this.collapsibleEl.style.pointerEvents = this.el.style.pointerEvents = "none"
    this.collapsibleEl.style.opacity = "0.4"
    if (showBusyIcon)
      this.showBusyIcon()
  }
}
