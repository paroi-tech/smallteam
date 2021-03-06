import { removeAllChildren } from "@smallteam-local/shared-ui/libraries/utils"
import { Log } from "bkb"
import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { Model, ProjectModel, ReorderModelEvent, StepModel, TaskModel } from "../../AppModel/AppModel"
import BoxList, { BoxEvent, BoxListEvent } from "../../generics/BoxList"
import { DropdownMenu } from "../../generics/DropdownMenu"
import TaskBox from "../tasks/TaskBox"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.StepSwitcherHeader {
  &-btn {
    border-radius: 50%;
    width: 16px;
    &:focus, &:hover {
      color: rgba(255, 200, 170, 0.42);
      outline: none;
    }
  }

  &-foldableContent {
    transition-duration: 0.5s;
    transition-property: opacity;
    transition-timing-function: linear;
  }
}

.StepSwitcher {
  &-bottom {
    margin-top: 5px;
  }

  &-buttonContainer {
    display: flex;
    flex-direction: row;
  }

  &-spinner {
    width: 16px;
  }
}
`

const template = handledom`
<section class="StepSwitcher">
  <header class="StepSwitcherHeader TitleBar Row -spaced">
    <div class="Row">
      <span h="title"></span>
      <div class="DropdownMenuWrapper -asSuffix" h="menu"></div>
    </div>
    <div class="Row">
      <span class="LoaderBg" hidden h="indicator"></span>
      <button class="StepSwitcherHeader-btn" title="Fold/Unfold" h="toggleBtn"></button>
      <button class="StepSwitcherHeader-btn" title="Close" h="closeBtn">X</button>
    </div>
  </header>

  <div class="StepSwitcher-foldableContent" h="foldable">
    <div class="AutoColumns" h="boxLists"></div>
    <div class="StepSwitcher-bottom InputAndBtn" h="bottom">
      <input class="InputAndBtn-input" type="text" maxlength="255" placeholder="Task name" h="taskName">
      <button class="InputAndBtn-btn Btn WithLoader -right" type="button" h="addBtn">
        Add task
        <span class="WithLoader-l" hidden h="spinner"></span>
      </button>
    </div>
  </div>
</section>
`

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

    const { root, ref } = template()

    this.el = root
    this.foldableEl = ref("foldable")
    this.listContainerEl = ref("boxLists")
    this.taskNameEl = ref("taskName")
    this.toggleBtnEl = ref("toggleBtn")
    this.spinnerEl = ref("spinner")
    this.busyIndicatorEl = ref("indicator")
    this.bottomEl = ref("bottom")

    if (options.dropdownMenu)
      ref("menu").appendChild(options.dropdownMenu.btnEl)

    this.toggleBtnEl.textContent = caretUp
    ref("title").textContent = options.parentTask.label

    const isRootTask = options.parentTask.id === this.project.rootTaskId
    const closeBtnEl = ref("closeBtn") as HTMLElement

    if (options.parentTask.children && options.parentTask.children.length > 0)
      closeBtnEl.hidden = true
    closeBtnEl.addEventListener("click", () => {
      // We can't hide the rootTask StepSwitcher or tasks with children.
      const hasChildren = options.parentTask.children && options.parentTask.children.length !== 0
      if (!isRootTask && !hasChildren)
        this.setVisible(false)
    })

    ref("addBtn").addEventListener("click", () => this.onAddtaskClick())
    this.taskNameEl.addEventListener("keyup", ev => {
      if (ev.key === "Enter")
        this.onAddtaskClick().catch(err => this.dash.log.error(err))
    })
    ref("toggleBtn").addEventListener("click", () => this.toggleFoldableContent())

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

  enable(showBusyIcon = false) {
    this.foldableEl.style.pointerEvents = this.el.style.pointerEvents = "auto"
    this.foldableEl.style.opacity = "1.0"
    if (showBusyIcon)
      this.hideBusyIcon()
  }

  disable(showBusyIcon = false) {
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
      const step = data.model as StepModel
      if (this.parentTask.project.allSteps.has(step.id)) {
        const list = this.boxLists.get(step.id)
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
    this.dash.listenTo<ReorderModelEvent>(this.model, "reorderStep", () => this.reset())

    // Task creation event.
    this.dash.listenToModel("createTask", data => {
      const task = data.model as TaskModel
      if (task.projectId !== this.project.id || task.parentTaskId !== this.parentTask.id)
        return
      const list = this.boxLists.get(task.curStepId)
      if (list) {
        const box = this.createTaskBoxFor(task)
        list.addBox(box)
      }
    })

    // Task update event. We handle the case when a task is archived or put on hold.
    this.dash.listenToModel("updateTask", data => {
      const task = data.model as TaskModel
      if (!task.currentStep.isSpecial || !this.parentTask.children || !this.parentTask.children.has(task.id))
        return
      for (const list of this.boxLists.values()) {
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
      const taskId = data.id as string
      const taskBox = this.taskBoxes.get(taskId)
      if (!taskBox)
        return
      const boxList = [...this.boxLists.values()].find(b => b.hasBox(taskId))
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
    for (const step of this.project.steps)
      this.listContainerEl.appendChild(this.createBoxListFor(step).el)
  }

  private createBoxListFor(step: StepModel): BoxList<TaskBox> {
    const list = this.dash.create(BoxList, {
      id: step.id,
      group: this.parentTask.code,
      title: step.label,
      sort: true
    })

    this.boxLists.set(step.id, list)

    return list
  }

  private createTaskBoxFor(task: TaskModel) {
    const box = this.dash.create(TaskBox, task)

    this.dash.addToGroup(box, "items")
    this.taskBoxes.set(task.id, box)

    return box
  }

  private async onTaskBoxMove(ev: BoxEvent) {
    const box = this.taskBoxes.get(ev.boxId)
    const step = this.project.steps.get(ev.boxListId)

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
      const taskId = box.task.id
      const label = this.parentTask.label

      this.log.error(`Unable to update task "${taskId}" in StepSwitcher "${label}"`)
      this.restoreTaskBoxPosition(box, step.id)
    }
    this.enable(true)
  }

  private sortBoxListContent(step: StepModel) {
    const list = this.boxLists.get(step.id)
    const tasks = Array.from(this.parentTask.children || [])

    if (!list)
      return

    tasks.filter(task => task.curStepId === step.id)
    tasks.sort((t1, t2) => (t1.orderNum || 0) - (t2.orderNum || 0))
    list.sort(tasks.map(t => t.id))
  }

  private restoreTaskBoxPosition(box: TaskBox, wrongBoxListId: string) {
    const label = this.parentTask.label
    const wrongList = this.boxLists.get(wrongBoxListId)
    const rightListId = box.task.curStepId
    const rightList = this.boxLists.get(box.task.currentStep.id)

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

    for (const task of this.parentTask.children) {
      if (task.currentStep.isSpecial)
        continue
      const list = this.boxLists.get(task.currentStep.id)
      if (list) {
        const box = this.createTaskBoxFor(task)
        list.addBox(box)
      } else
        this.log.info(`Missing step "${task.currentStep.id}" in StepSwitcher`, this)
    }
  }

  private async onAddtaskClick() {
    const name = this.taskNameEl.value.trim()

    if (name.length < 2) {
      this.log.warn("Impossible to create a new task. Invalid name...")
      await this.dash.app.alert("Impossible to create a new task. Name should have 2 characters.")
      this.taskNameEl.focus()
      return
    }

    if (this.project.steps.length === 0) {
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
    const stepId = ev.boxListId
    const label = this.parentTask.label
    const list = this.boxLists.get(stepId)

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
    const label = this.parentTask.label
    const list = this.boxLists.get(stepId)

    if (!list) {
      this.log.error(`Cannot restore order in list "${stepId}" in StepSwitcher "${label}"`)
      return
    }

    const taskIds = [] as string[]

    for (const task of (this.parentTask.children || [] as TaskModel[])) {
      if (task.currentStep.id === stepId)
        taskIds.push(task.id)
    }
    list.sort(taskIds)
  }

  private async createTask(name: string): Promise<boolean> {
    let b = false

    try {
      const steps = this.project.steps

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
