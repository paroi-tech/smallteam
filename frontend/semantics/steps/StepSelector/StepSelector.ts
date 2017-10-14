import { Dash, Bkb } from "bkb"
import { render } from "monkberry"
import BoxList, { BoxEvent } from "../../../generics/BoxList/BoxList";
import StepBox from "../StepBox/StepBox";
import { Model, ProjectModel, StepModel, UpdateModelEvent, ReorderModelEvent } from "../../../AppModel/AppModel";
import App from "../../../App/App";

const template = require("./StepSelector.monk")

export default class StepSelector {
  readonly el: HTMLElement

  private view: MonkberryView
  private boxLists: {
    available: BoxList<StepBox>,
    used: BoxList<StepBox>,
    special: BoxList<StepBox>
  }
  private boxes = new Map<string, StepBox>()

  private model: Model
  private project?: ProjectModel

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createChildComponents()
    this.listenToModel()

    this.model.global.steps.forEach(step => this.createBoxForStep(step))
    this.dash.listenTo<UpdateModelEvent>(this.model, "createStep").onData(data => {
      let box = this.registerStep(data.model)
      if (this.project)
        this.availableStepBoxList.addBox(box)
    })
  }

  public setProject(project?: ProjectModel) {
    this.clear()
    this.project = project
    if (!project)
      return
    this.fillBoxLists()
  }

  /**
   * Listen to events from the model.
   * Events handled are:
   *  - Step creation
   *  - Step deletion
   *  - Step reorder
   */
  private listenToModel() {
    // Step creation event.

    // Step deletion.
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteStep").onData(data => {
      let stepId = data.id as string
      this.boxes.delete(stepId)
      this.steps.delete(stepId)
      // If we have a project, we have to remove the StepBox created for the Step.
      if (this.project) {
        let boxLists = [this.availableStepBoxList, this.specialStepBoxList, this.usedStepBoxList]
        let boxList = boxLists.find(bl => bl.hasBox(stepId))
        if (boxList)
          boxList.removeBox(stepId)
      }
    })

    // Step reorder event.
    // We run through the orderedIds and for each of the ID, we check if the project use the corresponding
    // Step. If yes, we add it to an array which will be use to sort the usedStepList. Else,
    // we add the id to the array used to sort availableStepList.
    this.dash.listenTo<ReorderModelEvent>(this.model, "reorderStep").onData(data => {
      if (!this.project)
        return
      let ids = data.orderedIds as string[],
        usedStepIds: string[] = [],
        spareStepIds: string[] = []
      let steps = this.project.steps
      for (let id of ids) {
        if (steps.has(id))
          usedStepIds.push(id)
        else
          spareStepIds.push(id)
      }
      this.availableStepBoxList.setBoxesOrder(spareStepIds)
      this.usedStepBoxList.setBoxesOrder(usedStepIds)
    })
  }

  /**
   * Create ProjectStepsPanel subcomponents.
   */
  private createChildComponents() {
    this.view = render(template, document.createElement("div"))

    let container = this.view.nodes[0] as HTMLElement

    let boxListGroup = "StepSelectorBoxLists"
    let spareBoxListParams = {
      id: "Available",
      group: boxListGroup,
      name: "Available step types",
      obj: this,
      onMove: ev => this.validateStepMove(ev),
      sort: false
    }
    this.availableStepBoxList = this.dash.create(BoxList, spareBoxListParams)
    container.appendChild(this.availableStepBoxList.el)

    let usedBoxListParams = {
      id: "Used",
      group: boxListGroup,
      name: "Used step types",
      obj: this,
      onMove: ev => this.validateStepMove(ev),
      sort: false
    }
    this.usedStepBoxList = this.dash.create(BoxList, usedBoxListParams)
    container.appendChild(this.usedStepBoxList.el)

    let specialBoxListParams = {
      id: "Special",
      group: undefined,
      name: "Special step types",
      sort: false
    }
    this.specialStepBoxList = this.dash.create(BoxList, specialBoxListParams)
    container.appendChild(this.specialStepBoxList.el)

    return container
  }

  /**
   * Clear the content of the BoxLists.
   */
  private clear() {
    let boxLists = [this.availableStepBoxList, this.specialStepBoxList, this.usedStepBoxList]
    boxLists.forEach(bl => bl.clear())
  }

  /**
   * Create a StepBox for a given Step.
   *
   * @param step
   */
  private createBoxForStep(step: StepModel): StepBox {
    let box = this.dash.create(StepBox, step, "id")
    this.boxes.set(step.id, box)
    return box
  }

  /**
   * Fill the BoxList with the Steps stored in the component.
   */
  private fillBoxLists() {
    if (!this.project)
      return
    let projectSteps = this.project.allSteps
    this.steps.forEach(step => {
      let box = this.boxes.get(step.id)
      if (!box)
        throw new Error(`Unable to retrieve StepBox of Step ${step.id} in ProjectStepsPanel`)
      if (step.isSpecial)
        this.specialStepBoxList.addBox(box)
      else if (projectSteps.has(step.id))
        this.usedStepBoxList.addBox(box)
      else
        this.availableStepBoxList.addBox(box)
    })
  }

  /**
   * Schedule the update of the project step types.
   *
   * A timeout of 2s is used to schedule the update. The timer is restarted if the user
   * reorders the step types within the 2s.
   */
  private handleUpdate() {
    if (this.timer)
      clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.doUpdate().catch(console.log)
    }, 2000)
  }

  // /**
  //  * Request the update of the project Steps in the model.
  //  */
  // private async doUpdate() {
  //   // FIXME: Do not update here. The update must be done in the parent component `ProjectForm`

  //   if (!this.project)
  //     return
  //   let used = this.usedStepBoxList.getBoxesOrder()
  //   let unused = this.freeStepBoxList.getBoxesOrder()
  //   let batch = this.model.createCommandBatch()

  //   let projectSteps = this.project.steps

  //   // We create ProjectSteps for newly added Steps.
  //   for (let id of used) {
  //     let step = this.steps.get(id)
  //     if (!step) // This should not happen.
  //       throw new Error(`Unknown step ID ${id} in project ${this.project.code}`)
  //     if (!projectSteps.has(step.id))
  //       batch.exec("update", "Project", { id: this.project.id, stepIds: this.stepIds })
  //   }

  //   // We remove unused Steps. No need to check if there are tasks in the Step. There was an control
  //   // when the StepBox was moved.
  //   for (let id of unused) {
  //     let step = this.steps.get(id)
  //     if (!step) // This should not happen.
  //       throw new Error(`Unknown Step ID ${id} in ProjectStepsPanel ${this.project.code}`)
  //     let step = this.project.findStepByType(step.id)
  //     if (step)
  //       batch.exec("delete", "Step", { id: step.id })
  //   }

  //   // Send request to the server...
  //   try {
  //     let val = await batch.sendAll()
  //   } catch (err) {
  //     console.error("Error while updating project steps.", err)
  //     // We need to restore the content of the BoxLists.
  //     for (let [id, box] of this.boxes.entries()) {
  //       if (this.project.hasStep(id) && this.freeStepBoxList.hasBox(id)) {
  //         this.freeStepBoxList.removeBox(id)
  //         this.usedStepBoxList.addBox(box)
  //       }
  //       if (!this.project.hasStep(id) && this.usedStepBoxList.hasBox(id)) {
  //         this.usedStepBoxList.removeBox(id)
  //         this.freeStepBoxList.addBox(box)
  //       }
  //     }
  //   }
  //   // Now we sort the content of the BoxLists. Easy to sort the used Step BoxList...
  //   this.usedStepBoxList.setBoxesOrder(this.project.steps.map(step => step.stepId))
  //   // Tricky to sort the available Step BoxList. We get the unused Steps from `stepMap`,
  //   // then we sort them and finally we keep only the IDs in order to call BoxList#setBoxesOrder().
  //   let ids = Array.from(this.steps.values()).filter((step) => {
  //     return !step.isSpecial && !this.project!.hasStep(step.id)
  //   }).sort((a: StepModel, b: StepModel) => {
  //     return a.orderNum! - b.orderNum!
  //   }).map(step => step.id)
  //   this.freeStepBoxList.setBoxesOrder(ids)
  // }

  /**
   * Check if a StepBox can be moved between BoxLists.
   *
   * @param ev
   */
  private validateStepMove(ev: BoxEvent) {
    if (!this.project)
      return
    if (ev.boxListId === "Available") {
      // A step type is being added to the project.
      this.handleUpdate()
      return true
    } else {
      // A step type is removed from the project. We check if the step contains tasks.
      let step = this.steps.get(ev.boxId)
      if (!step) // This should not happen. It means there is an error in the model or in Map#get().
        throw new Error(`Unknown Step ID ${ev.boxId} in ProjectStepsPanel ${this.project.code}`)

      if (!this.project.steps.has(step.id) || !this.project.hasTaskForStep(step.id)) {
        this.handleUpdate()
        return true
      } else
        return false
    }
  }

  /**
   * Hide the StepSelector.
   */
  public hide() {
    this.el.style.display = "none"
  }

  /**
   * Make the StepSelector visible.
   */
  public show() {
    this.el.style.display = "block"
  }
}
