import App from "../../App/App"
import BoxList, { BoxEvent } from "../../BoxList/BoxList"
import { Dash, Bkb } from "bkb"
import { ProjectModel, StepModel, StepTypeModel, Model } from "../../Model/Model"
import StepTypeBox from "../../StepTypeBox/StepTypeBox"

export default class ProjectStepsPanel {
  private container: HTMLDivElement
  private availableStepTypeList: BoxList<StepTypeBox>
  private specialStepTypeList: BoxList<StepTypeBox>
  private usedStepTypeList: BoxList<StepTypeBox>
  private model: Model

  /**
   * Map used to store StepTypeBoxes created in the panel.
   */
  private boxMap: Map<string, StepTypeBox> = new Map()

  /**
   * Map used to store StepTypes.
   */
  private stepTypeMap: Map<string, StepTypeModel> = new Map()

  /**
   * Timer used to schedule the commit of the changes in the BoxLists to the model.
   */
  private timer: any = undefined

  /**
   * Create a new ProjectStepsPanel.
   *
   * @param dash
   * @param project
   */
  constructor(private dash: Dash<App>, readonly project: ProjectModel) {
    this.model = this.dash.app.model
    this.initComponents()
    this.model.query("StepType").then(stepTypes => {
      this.fillBoxLists(stepTypes)
    }).catch(err => {
      console.log(`Error while loading StepTypes in ProjectStepsPanel ${this.project.id}`)
    })
    this.listenToModel()
  }

  /**
   * Listen to events from the model.
   * Events handled are:
   *  - StepType creation
   *  - StepType deletion
   *  - StepType reorder
   */
  private listenToModel() {
    // StepType creation event.
    this.model.on("createStepType", "dataFirst", data => {
      let box = this.dash.create(StepTypeBox, {
        args: [ data.model, "id" ]
      })
      this.stepTypeMap.set(data.model.id, data.model)
      this.boxMap.set(data.model.id, box)
      this.availableStepTypeList.addBox(box)
    })
    // StepType deletion.
    this.model.on("change", "dataFirst", data => {
      if (data.type != "StepType" || data.cmd != "delete")
        return
      let stepTypeId = data.id as string
      let a = [this.availableStepTypeList, this.specialStepTypeList, this.usedStepTypeList]
      let boxList = a.find(bl => bl.hasBox(stepTypeId))
      if (boxList)
        boxList.removeBox(stepTypeId)
      this.boxMap.delete(stepTypeId)
      this.stepTypeMap.delete(stepTypeId)
    })
    // StepType reorder event.
    // We run through the orderedIds and for each of the ID, we check if the project use the corresponding
    // StepType. If yes, we add it to an array which will be use to sort the usedStepTypeList. Else,
    // we add the id to the array used to sort availableStepTypeList.
    this.model.on("reorder", "dataFirst", data => {
      if (data.type !== "StepType" || !data.orderedIds)
        return
      let ids = data.orderedIds as string[],
          usedStepTypeIds =  new Array<string>(),
          availableStepTypeIds = new Array<string>()
      ids.forEach(id => {
        if (this.project.findStepByType(id))
          usedStepTypeIds.push(id)
        else
          availableStepTypeIds.push(id)
      })
      this.availableStepTypeList.setBoxesOrder(availableStepTypeIds)
      this.usedStepTypeList.setBoxesOrder(usedStepTypeIds)
    })
  }

  /**
   * Create ProjectStepsPanel subcomponents.
   */
  private initComponents() {
    this.container = document.createElement("div")
    this.container.classList.add("ProjectStepsPanel")

    let p1 = {
      id: "Available",
      group: this.project.id,
      name: "Available step types",
      obj: this,
      onMove: ev => this.validateStepTypeMove(ev),
      sort: false
    }
    this.availableStepTypeList = this.dash.create(BoxList, { args: [ p1 ] })
    this.availableStepTypeList.attachTo(this.container)

    let p2 = {
      id: "Used",
      group: this.project.id,
      name: "Used step types",
      obj: this,
      onMove: ev => this.validateStepTypeMove(ev),
      sort: false
    }
    this.usedStepTypeList = this.dash.create(BoxList, { args: [ p2 ] })
    this.usedStepTypeList.attachTo(this.container)

    let p3 = {
      id: "Special",
      group: undefined,
      name: "Special step types",
      sort: false
    }
    this.specialStepTypeList = this.dash.create(BoxList, { args: [ p3 ] })
    this.specialStepTypeList.attachTo(this.container)
  }

  /**
   * Fill the BoxList with the StepTypes loaded from  model.
   * @param stepTypes
   */
  private fillBoxLists(stepTypes: StepTypeModel[]) {
    for (let stepType of stepTypes) {
      this.stepTypeMap.set(stepType.id, stepType)
      let box = this.dash.create(StepTypeBox, { args: [ stepType, "id" ] })
      this.boxMap.set(stepType.id, box)
      if (stepType.isSpecial)
        this.specialStepTypeList.addBox(box)
      else if (this.project.hasStepType(stepType.id))
        this.usedStepTypeList.addBox(box)
      else
        this.availableStepTypeList.addBox(box)
    }
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
      this.doUpdate()
    }, 2000)
  }

  /**
   * Request the update of the project StepTypes in the model.
   */
  private async doUpdate() {
    let used = this.usedStepTypeList.getBoxesOrder()
    let unused = this.availableStepTypeList.getBoxesOrder()
    let batch = this.model.createCommandBatch()

    // We create steps for newly added StepTypes.
    for (let id of used) {
      let stepType = this.stepTypeMap.get(id)
      if (!stepType) // This should not happen.
        throw new Error(`Unknown StepType ID ${id} in ProjectStepsPanel ${this.project.code}`)
      if (!this.project.hasStepType(stepType.id))
          batch.exec("create", "Step", { typeId: stepType.id, projectId: this.project.id })
    }

    // We remove unused StepTypes. No need to check if there are tasks in the Step. There was an control
    // when the StepTypeBox was moved.
    for (let id of unused) {
      let stepType = this.stepTypeMap.get(id)
      if (!stepType) // This should not happen.
        throw new Error(`Unknown StepType ID ${id} in ProjectStepsPanel ${this.project.code}`)
      let step = this.project.findStepByType(stepType.id)
      if (step)
        batch.exec("delete", "Step", { id: step.id })
    }

    try {
      let val = await batch.sendAll()
    } catch (err) {
      console.error("Error while updating project steps.", err)
      // We need to restore the content of the BoxLists.
      this.boxMap.forEach((box, id) => {
        if (this.project.hasStepType(id) && this.availableStepTypeList.hasBox(id)) {
          this.availableStepTypeList.removeBox(id)
          this.usedStepTypeList.addBox(box)
        }
        if (!this.project.hasStepType(id) && this.usedStepTypeList.hasBox(id)) {
          this.usedStepTypeList.removeBox(id)
          this.availableStepTypeList.addBox(box)
        }
      })
    }
    // Now we sort the content of the BoxLists. Easy to sort the used StepType BoxList...
    this.usedStepTypeList.setBoxesOrder(this.project.steps.map(step => step.typeId))
    // Tricky to sort the available StepType BoxList. We get the unused StepTypes from `stepTypeMap`,
    // then we sort them and finally we keep only the IDs in order to call BoxList#setBoxesOrder().
    let ids = Array.from(this.stepTypeMap.values()).filter((stepType) => {
      return !stepType.isSpecial && !this.project.hasStepType(stepType.id)
    }).sort((a: StepTypeModel, b: StepTypeModel) => {
      return a.orderNum! - b.orderNum!
    }).map(stepType => stepType.id)
    this.availableStepTypeList.setBoxesOrder(ids)
  }

  /**
   * Add the panel as a child of an element.
   *
   * @param el - the new parent element of the panel
   */
  public attachTo(el: HTMLElement) {
    el.appendChild(this.container)
  }

  /**
   * Check if a StepTypeBox can be moved between BoxLists.
   *
   * @param ev
   */
  private validateStepTypeMove(ev: BoxEvent) {
    if (ev.boxListId === "Available") {
      // A step type is being added to the project.
      this.handleUpdate()
      return true
    } else {
      // A step type is removed from the project. We check if the step contains tasks.
      let stepType = this.stepTypeMap.get(ev.boxId)
      if (!stepType) // This should not happen. It means there is an error in the model or in Map#get().
        throw new Error(`Unknown StepType ID ${ev.boxId} in ProjectStepsPanel ${this.project.code}`)
      let step = this.project.findStepByType(stepType.id)
      if (!step || step.taskCount === 0) {
        this.handleUpdate()
        return true
      } else
        return false
    }
  }

  /**
   * Return the panel root element.
   */
  public getRootElement(): HTMLElement {
    return this.container
  }
}
