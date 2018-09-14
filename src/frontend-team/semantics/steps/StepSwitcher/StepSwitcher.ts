import { render } from "@fabtom/lt-monkberry"
import { Log } from "bkb"
import { removeAllChildren } from "../../../../sharedFrontend/libraries/utils"
import { OwnDash } from "../../../App/OwnDash"
import { Model, ProjectModel, ReorderModelEvent, StepModel, TaskModel } from "../../../AppModel/AppModel"
import BoxList, { BoxEvent, BoxListEvent } from "../../../generics/BoxList/BoxList"
import { DropdownMenu } from "../../../generics/DropdownMenu/DropdownMenu"
import TaskBox from "../../tasks/TaskBox/TaskBox"

const template = require("./StepSwitcher.monk")

const caretUp = "\u{25B2}"
const caretDown = "\u{25BC}"

export interface TaskBoardOptions {
  parentTask: TaskModel
  dropdownMenu?: DropdownMenu
}

/**
 * Component used to display a task and its children (subtasks).
 *
 * A StepSwitcher can contain several BoxLists, one BoxList per project step. Substasks are displayed
 * in those BoxLists, according to subtasks states (e.g Todo, Running, Done, etc.)
 */
export default class StepSwitcher {
  readonly el: HTMLElement
  private toggleBtnEl: HTMLElement
  private foldableEl: HTMLElement
  private listContainerEl: HTMLElement
  private busyIndicatorEl: HTMLElement
  private taskNameEl: HTMLInputElement
  private spinnerEl: HTMLElement
  private bottomEl: HTMLElement

  private log: Log
  private model: Model
  private parentTask: TaskModel
  private project: ProjectModel

  private collapsibleElVisible = true
  private visible = true

  // BoxLists we created are stored in a map. The keys are the IDs of the project steps.
  private boxLists = new Map<string, BoxList<TaskBox>>()

  // Map used to store TaskBoxes. The keys are the task IDs.
  private taskBoxes = new Map<string, TaskBox>()

  constructor(private dash: OwnDash, options: TaskBoardOptions) {
    this.model = dash.app.model
    this.log = dash.app.log
    this.parentTask = options.parentTask
    this.project = options.parentTask.project

    let view = render(template)

    this.el = view.rootEl()
    this.foldableEl = view.ref("foldable")
    this.listContainerEl = view.ref("boxLists")
    this.taskNameEl = view.ref("taskName")
    this.toggleBtnEl = view.ref("toggleBtn")
    this.spinnerEl = view.ref("spinner")
    this.busyIndicatorEl = view.ref("indicator")
    this.bottomEl = view.ref("bottom")

    if (options.dropdownMenu)
      view.ref("menu").appendChild(options.dropdownMenu.btnEl)

    this.toggleBtnEl.textContent = caretUp
    view.ref("title").textContent = options.parentTask.label

    let isRootTask = options.parentTask.id === this.project.rootTaskId
    let closeBtnEl = view.ref("closeBtn") as HTMLElement

    if (options.parentTask.children && options.parentTask.children.length > 0)
      closeBtnEl.hidden = true
    closeBtnEl.addEventListener("click", () => {
      // We can't hide the rootTask StepSwitcher or tasks with children.
      let hasChildren = options.parentTask.children && options.parentTask.children.length !== 0
      if (!isRootTask && !hasChildren)
        this.setVisible(false)
    })

    view.ref("addBtn").addEventListener("click", () =>  this.onAddtaskClick())
    this.taskNameEl.addEventListener("keyup", ev => {
      if (ev.key === "Enter")
        this.onAddtaskClick()
    })
    view.ref("toggleBtn").addEventListener("click", () => this.toggleFoldableContent())

    this.createBoxLists()
    this.fillBoxLists()
    this.addModelListeners()

    this.dash.listenTo<BoxEvent>("boxListItemAdded", data => this.onTaskBoxMove(data))
    this.dash.listenTo<BoxListEvent>("boxListSortingUpdated", data => this.onTaskReorder(data))
  }

  showBusyIcon() {
    this.busyIndicatorEl.hidden = false
  }

  hideBusyIcon() {
    this.busyIndicatorEl.hidden = true
  }

  setVisible(b: boolean) {
    if (b !== this.visible) {
      this.el.hidden = !b
      this.visible = b
    }
  }

  isVisible() {
    return this.visible
  }

  enable(showBusyIcon: boolean = false) {
    this.foldableEl.style.pointerEvents = this.el.style.pointerEvents = "auto"
    this.foldableEl.style.opacity = "1.0"
    if (showBusyIcon)
      this.hideBusyIcon()
  }

  disable(showBusyIcon: boolean = false) {
    this.foldableEl.style.pointerEvents = this.el.style.pointerEvents = "none"
    this.foldableEl.style.opacity = "0.4"
    if (showBusyIcon)
      this.showBusyIcon()
  }

  /**
   * Listen to changes in the model.
   * The following events are handled:
   *  - Step update, in order to update the BoxList titles.
   *  - Step reorder, to reorder the BoxLists.
   *  - ProjectStep creation, to add a new BoxList.
   *  - ProjectStep deletion, to remove the corresponding BoxList.
   *  - Task creation, to create a taskBox for the new task.
   *  - Task deletion, to remove TaskBox (if any).
   *  - Task update (step change) to remove the TaskBox.
   */
  private addModelListeners() {
    // Step update event.
    this.dash.listenToModel("updateStep", data => {
      let step = data.model as StepModel
      if (this.parentTask.project.allSteps.has(step.id)) {
        let list = this.boxLists.get(step.id)
        if (list)
          list.setTitle(step.label)
      }
    })

    // ProjectStep creation event.
    this.dash.listenToModel("updateProject", data => {
      if (data.id === this.project.id)
        this.reset()
    })

    // Steps reorder event.
    // An alternative solution to sort the content of an HTML element using `data-sort` attribute
    // can be found at:
    // https://stackoverflow.com/questions/7831712/jquery-sort-divs-by-innerhtml-of-children
    this.dash.listenTo<ReorderModelEvent>(this.model, "reorderStep", data => this.reset())

    // Task creation event.
    this.dash.listenToModel("createTask", data => {
      let task = data.model as TaskModel
      if (task.projectId !== this.project.id || task.parentTaskId !== this.parentTask.id)
        return
      let list = this.boxLists.get(task.curStepId)
      if (list) {
        let box = this.createTaskBoxFor(task)
        list.addBox(box)
      }
    })

    // Task update event. We handle the case when a task is archived or put on hold.
    this.dash.listenToModel("updateTask", data => {
      let task = data.model as TaskModel
      if (!task.currentStep.isSpecial || !this.parentTask.children || !this.parentTask.children.has(task.id))
        return
      for (let list of this.boxLists.values()) {
        // Since we don't know the stepId of the updated task, we have to remove from potentially all BoxLists.
        if (list.removeBox(task.id))
          break
      }
      this.taskBoxes.delete(task.id)
    })

    // TODO: Handle event when task is removed from

    // Task deletion event.
    // We check if the StepSwitcher contains a TaskBox related to the deleted task.
    // If yes, we remove the TaskBox from the BoxList and from the StepSwitcher taskBoxMap.
    this.dash.listenToModel("deleteTask", data => {
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

  private toggleFoldableContent() {
    if (this.collapsibleElVisible) {
      this.toggleBtnEl.textContent = caretDown
      this.foldableEl.hidden = true
    } else {
      this.toggleBtnEl.textContent = caretUp
      this.foldableEl.hidden = false
    }
    this.collapsibleElVisible = !this.collapsibleElVisible
  }

  private reset() {
    this.dash.children().forEach(child => this.dash.getPublicDashOf(child).destroy())
    removeAllChildren(this.listContainerEl)
    this.createBoxLists()
    this.fillBoxLists()
  }

  private createBoxLists() {
    for (let step of this.project.steps)
      this.listContainerEl.appendChild(this.createBoxListFor(step).el)
  }

  private createBoxListFor(step: StepModel): BoxList<TaskBox> {
    let list = this.dash.create(BoxList, {
      id: step.id,
      group: this.parentTask.code,
      title: step.label,
      sort: true
    })

    this.boxLists.set(step.id, list)

    return list
  }

  private createTaskBoxFor(task: TaskModel) {
    let box = this.dash.create(TaskBox, task)

    this.dash.addToGroup(box, "items")
    this.taskBoxes.set(task.id, box)

    return box
  }

  private async onTaskBoxMove(ev: BoxEvent) {
    let box = this.taskBoxes.get(ev.boxId)
    let step = this.project.steps.get(ev.boxListId)

    if (!box)
      throw new Error(`Unable to find task with ID "${ev.boxId}" in StepSwitcher`)
    if (!step)
      throw new Error(`Unable to find step with ID "${ev.boxListId}" in StepSwitcher`)

    this.disable(true)
    try {
      await this.model.exec("update", "Task", {
        id: box.task.id,
        curStepId: step.id
      })
      this.sortBoxListContent(step)
    } catch (err) {
      let taskId = box.task.id
      let label = this.parentTask.label

      this.log.error(`Unable to update task "${taskId}" in StepSwitcher "${label}"`)
      this.restoreTaskBoxPosition(box, step.id)
    }
    this.enable(true)
  }

  private sortBoxListContent(step: StepModel) {
    let list = this.boxLists.get(step.id)
    let tasks = Array.from(this.parentTask.children || [])

    if (!list)
      return

    tasks.filter(task => task.curStepId === step.id)
    tasks.sort((t1, t2) => (t1.orderNum || 0) - (t2.orderNum || 0))
    list.sort(tasks.map(t => t.id))
  }

  private restoreTaskBoxPosition(box: TaskBox, wrongBoxListId: string) {
    let label = this.parentTask.label
    let wrongList = this.boxLists.get(wrongBoxListId)
    let rightListId = box.task.curStepId
    let rightList = this.boxLists.get(box.task.currentStep.id)

    if (!wrongList) {
      this.log.error(`Cannot find BoxList with ID "${wrongBoxListId}" in StepSwitcher "${label}"`)
      return
    }

    if (!rightList) {
      this.log.error(`Cannot find BoxList with ID "${rightListId}" in StepSwitcher "${label}"`)
      return
    }

    wrongList.removeBox(box.task.id)
    rightList.addBox(box)
  }

  private fillBoxLists() {
    if (!this.parentTask.children)
      return

    for (let task of this.parentTask.children) {
      if (task.currentStep.isSpecial)
        continue
      let list = this.boxLists.get(task.currentStep.id)
      if (list) {
        let box = this.createTaskBoxFor(task)
        list.addBox(box)
      } else
        this.log.info(`Missing step "${task.currentStep.id}" in StepSwitcher`, this)
    }
  }

  private async onAddtaskClick() {
    let name = this.taskNameEl.value.trim()

    if (name.length < 2) {
      this.log.warn("Impossible to create a new task. Invalid name...")
      await this.dash.app.alert("Impossible to create a new task. Name should have 2 characters.")
      this.taskNameEl.focus()
      return
    }

    if (this.project.steps.length === 0)  {
      this.log.warn("Impossible to create a new task. Project has no step.")
      this.taskNameEl.focus()
      return
    }

    this.bottomEl.style.pointerEvents = "none"
    this.spinnerEl.hidden = false
    if (await this.createTask(name))
      this.taskNameEl.value = ""
    this.spinnerEl.hidden = true
    this.bottomEl.style.pointerEvents = "auto"
    this.taskNameEl.focus()
  }

  private async onTaskReorder(ev: BoxListEvent) {
    let stepId = ev.boxListId
    let label = this.parentTask.label
    let list = this.boxLists.get(stepId)

    if (!list) {
      this.log.error(`Unknown BoxList with ID ${stepId} in StepSwitcher ${label}`)
      return
    }

    list.disable(true)
    try {
      await this.model.reorder("Task", ev.boxIds, "childOf", this.parentTask.id)
    } catch (err) {
      this.log.error(`Impossible to reorder tasks in StepSwitcher "${label}"`)
      this.restoreBoxListOrder(stepId)
    }
    list.enable(true)
  }

  private restoreBoxListOrder(stepId: string) {
    let label = this.parentTask.label
    let list = this.boxLists.get(stepId)

    if (!list) {
      this.log.error(`Cannot restore order in list "${stepId}" in StepSwitcher "${label}"`)
      return
    }

    let taskIds = [] as string[]

    for (let task of (this.parentTask.children || [] as TaskModel[])) {
      if (task.currentStep.id === stepId)
        taskIds.push(task.id)
    }
    list.sort(taskIds)
  }

  private async createTask(name: string): Promise<boolean> {
    let b = false

    try {
      let steps = this.project.steps

      if (steps.length === 0)
        throw new Error("Cannot create task, there is no steps!")

      await this.model.exec("create", "Task", {
        label: name,
        parentTaskId: this.parentTask.id,
        curStepId: steps[0].id
      })
      b = true
    } catch (err) {
      this.log.error("Unable to create task", err)
    }

    return b
  }
}
