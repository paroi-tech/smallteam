import { Dash, Log } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import { Model, ProjectModel, TaskModel, StepModel, UpdateModelEvent, ReorderModelEvent } from "../../../AppModel/AppModel"
import BoxList, { BoxEvent, BoxListEvent } from "../../../generics/BoxList/BoxList"
import TaskBox from "../../tasks/TaskBox/TaskBox"
import App from "../../../App/App"
import { removeAllChildren } from "../../../libraries/utils"
import { OwnDash } from "../../../App/OwnDash";

const template = require("./StepSwitcher.monk")

const caretUp = "\u{25B2}"
const caretDown = "\u{25BC}"
const times = "\u{00D7}"

/**
 * Component used to display a task and its children (subtasks).
 *
 * A StepSwitcher can contain several BoxLists, one BoxList per project step. Substasks are displayed
 * in those BoxLists, according to subtasks states (e.g Todo, Running, Done, etc.)
 */
export default class StepSwitcher {
  readonly el: HTMLElement
  private toggleBtnSpanEl: HTMLElement
  private foldableEl: HTMLElement
  private blContainerEl: HTMLElement
  private busyIndicatorEl: HTMLElement
  private taskNameEl: HTMLInputElement
  private spinnerEl: HTMLElement
  private bottomEl: HTMLElement

  private model: Model
  private project: ProjectModel
  private log: Log

  private collapsibleElVisible = true
  private visible = true

  // BoxLists we created are stored in a map. The keys are the IDs of the project steps.
  private boxLists = new Map<string, BoxList<TaskBox>>()

  // Map used to store TaskBoxes. The keys are the task IDs.
  private taskBoxes = new Map<string, TaskBox>()

  constructor(private dash: OwnDash, readonly parentTask: TaskModel) {
    this.model = dash.app.model
    this.log = this.dash.app.log
    this.project = this.parentTask.project

    let view = render(template)
    this.el = view.rootEl()
    this.foldableEl = view.ref("foldable")
    this.blContainerEl = view.ref("boxList")
    this.taskNameEl = view.ref("taskName")
    this.toggleBtnSpanEl = view.ref("toggleSpan")
    this.toggleBtnSpanEl.textContent = caretUp
    this.spinnerEl = view.ref("spinner")
    this.busyIndicatorEl = view.ref("indicator")
    this.bottomEl = view.ref("bottom")

    let isRootTask = this.parentTask.id === this.project.rootTaskId

    let closeBtnEl = view.ref("closeBtn")
    closeBtnEl.textContent = times
    closeBtnEl.addEventListener("click", ev => {
      // We can't hide the rootTask StepSwitcher or tasks with children.
      let hasChildren = this.parentTask.children && this.parentTask.children.length !== 0
      if (!isRootTask && !hasChildren)
        this.setVisible(false)
    })

    let addBtnEl = view.ref("addBtn") as HTMLButtonElement
    addBtnEl.addEventListener("click", ev =>  this.onAddtaskClick())
    this.taskNameEl.addEventListener("keyup", ev => {
      if (ev.key === "Enter")
        addBtnEl.click()
    })
    view.ref("toggleBtn").addEventListener("click", ev => this.toggleFoldableContent())

    let title = this.parentTask.id === this.project.rootTaskId ? "Main tasks": this.parentTask.label
    let titleEl = view.ref("title") as HTMLElement
    titleEl.textContent = title

    this.createBoxLists()
    this.fillBoxLists()

    this.addModelListeners()
    this.dash.listenTo<BoxEvent>("boxListItemAdded", data => this.onTaskBoxMove(data))
    this.dash.listenTo<BoxListEvent>("boxListSortingUpdated", data => this.onTaskReorder(data))
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
    this.dash.listenTo<ReorderModelEvent>(this.model, "reorderStep", data => {
      this.reset()
      // for (let id of data.orderedIds as string[]) {
      //   let step = this.project.steps.get(id)
      //   if (step) {
      //     let list = this.boxLists.get(step.id)
      //     if (list)
      //       this.boxListContainerEl.appendChild(list.el)
      //   }
      // }
    })

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

  public showBusyIcon() {
    this.busyIndicatorEl.style.display = "inline"
  }

  public hideBusyIcon() {
    this.busyIndicatorEl.style.display = "none"
  }

  public setVisible(b: boolean) {
    if (b !== this.visible) {
      this.el.style.display = b ? "block" : "none"
      this.visible = b
    }
  }

  public get isVisible() {
    return this.visible
  }

  public enable(showBusyIcon: boolean = false) {
    this.foldableEl.style.pointerEvents = this.el.style.pointerEvents = "auto"
    this.foldableEl.style.opacity = "1.0"
    if (showBusyIcon)
      this.hideBusyIcon()
  }

  public disable(showBusyIcon: boolean = false) {
    this.foldableEl.style.pointerEvents = this.el.style.pointerEvents = "none"
    this.foldableEl.style.opacity = "0.4"
    if (showBusyIcon)
      this.showBusyIcon()
  }

  private toggleFoldableContent() {
    if (this.collapsibleElVisible) {
      this.toggleBtnSpanEl.textContent = caretDown
      this.foldableEl.style.display = "none"
    } else {
      this.toggleBtnSpanEl.textContent = caretUp
      this.foldableEl.style.display = "block"
    }
    this.collapsibleElVisible = !this.collapsibleElVisible
  }

  private reset() {
    this.dash.children().forEach(child => this.dash.getPublicDashOf(child).destroy())
    removeAllChildren(this.blContainerEl)
    this.createBoxLists()
    this.fillBoxLists()
  }

  /**
   * Create a BoxList for each of the project step.
   */
  private createBoxLists() {
    for (let step of this.project.steps) {
      let list = this.createBoxListFor(step)
      this.blContainerEl.appendChild(list.el)
    }
  }

  private createBoxListFor(step: StepModel): BoxList<TaskBox> {
    let params = {
      id: step.id,
      group: this.parentTask.code,
      name: step.label,
      sort: true
    }
    let b = this.dash.create(BoxList, params)
    this.boxLists.set(step.id, b)
    return b
  }

  private createTaskBoxFor(task: TaskModel) {
    let box = this.dash.create(TaskBox, task)
    this.dash.addToGroup(box, "items")
    this.taskBoxes.set(task.id, box)
    return box
  }

  private async onTaskBoxMove(ev: BoxEvent) {
    let box = this.taskBoxes.get(ev.boxId)
    let step = this.project.steps.find(step => step.id === ev.boxListId)

    if (!box)
      throw new Error(`Unable to find task with ID "${ev.boxId}" in StepSwitcher`)
    if (!step)
      throw new Error(`Unable to find step with ID "${ev.boxListId}" in StepSwitcher`)

    let task = box.task
    this.disable(true)
    try {
      await this.model.exec("update", "Task", { id: box.task.id, curStepId: step.id })
    } catch(err) {
      this.log.error(`Unable to update task "${box.task.id}" in StepSwitcher "${this.parentTask.label}"`)

      // We bring back the TaskBox in its old BoxList.
      let newList = this.boxLists.get(step.id)
      let oldList = this.boxLists.get(box.task.currentStep.id)
      if (!newList)
        throw new Error(`Cannot find BoxList with ID "${step.id}" in StepSwitcher "${this.parentTask.label}"`)
      if (!oldList)
        throw new Error(`Cannot find BoxList with ID "${task.currentStep.id}" in StepSwitcher "${this.parentTask.label}"`)
      newList.removeBox(box.task.id)
      oldList.addBox(box)
    }
    this.enable(true)
  }

  private fillBoxLists() {
    if (!this.parentTask.children)
      return
    for (let task of this.parentTask.children) {
      if (task.currentStep.isSpecial)
        continue
      let bl = this.boxLists.get(task.currentStep.id)
      if (bl) {
        let box = this.createTaskBoxFor(task)
        bl.addBox(box)
      } else
        this.log.info(`Missing step "${task.currentStep.id}" in StepSwitcher`, this)
    }
  }

  private async onAddtaskClick() {
    let name = this.taskNameEl.value.trim()

    if (name.length < 4) {
      this.log.warn("Impossible to create a new task. Invalid name...")
      await this.dash.app.alert("Impossible to create a new task. Name should have 4 characters.")
      this.taskNameEl.focus()
      return
    }

    if (this.project.steps.length === 0)  {
      this.log.warn("Impossible to create a new task. Project has no step.")
      this.taskNameEl.focus()
      return
    }

    this.bottomEl.style.pointerEvents = "none"
    this.spinnerEl.style.display = "inline"
    if (await this.createTask(name))
      this.taskNameEl.value = ""
    this.spinnerEl.style.display = "none"
    this.bottomEl.style.pointerEvents = "auto"
    this.taskNameEl.focus()
  }

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
          if (task.currentStep.id === ev.boxListId)
            result.push(task.id)
          return result
        }, []
      )
      let list = this.boxLists.get(ev.boxListId)
      if (list)
        list.sort(taskIds)
      else
        console.error(`Cannot restore order in list "${ev.boxListId}" in StepSwitcher "${this.parentTask.label}"`)
    }
    boxList.enable(true)
  }

  /**
   * Ask for the creation of a new task by the model.
   *
   * @param name - the name of a new task.
   */
  private async createTask(name: string): Promise<boolean> {
    try {
      let steps = this.project.steps
      if (steps.length === 0)
        throw new Error("Cannot create task, there is no steps!")
      let task = await this.model.exec("create", "Task", {
        label: name,
        parentTaskId: this.parentTask.id,
        curStepId: steps[0].id
      })
      return true
    } catch(err) {
      console.error("Unable to create task...", err)
      return false
    }
  }
}
