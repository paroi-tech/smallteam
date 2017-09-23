import App from "../../App/App"
import BoxList, { BoxEvent } from "../../BoxList/BoxList"
import { Dash, Bkb } from "bkb"
import { ProjectModel, StepModel, StepTypeModel, Model } from "../../AppModel/AppModel"
import StepTypeBox from "../../StepTypeBox/StepTypeBox"

export default class StepSelector {
  readonly el: HTMLElement

  private spareStepBoxList: BoxList<StepTypeBox>
  private specialStepBoxList: BoxList<StepTypeBox>
  private usedStepBoxList: BoxList<StepTypeBox>

  private model: Model
  private project: ProjectModel | undefined = undefined

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
  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createChildComponents()
    this.listenToModel()
  }

  /**
   *
   * @param project
   */
  public setProject(project: ProjectModel | undefined) {
    this.clear()
    this.project = project
    if (!project)
      return
    this.model.global.stepTypes.forEach(stepType => this.registerStepType(stepType))
    this.fillBoxLists()
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
    this.model.on("change", "dataFirst", data => {
      if (data.type !== "StepType" || data.cmd !== "create")
        return
      let box = this.registerStepType(data.model)
      if (this.project)
        this.spareStepBoxList.addBox(box)
    })

    // StepType deletion.
    this.model.on("change", "dataFirst", data => {
      if (data.type != "StepType" || data.cmd != "delete")
        return
      let stepTypeId = data.id as string
      this.boxMap.delete(stepTypeId)
      this.stepTypeMap.delete(stepTypeId)
      // If we have a project, we have to remove the StepTypeBox created for the StepType.
      if (this.project) {
        let boxLists = [ this.spareStepBoxList, this.specialStepBoxList, this.usedStepBoxList ]
        let boxList = boxLists.find(bl => bl.hasBox(stepTypeId))
        if (boxList)
          boxList.removeBox(stepTypeId)
      }
    })

    // StepType reorder event.
    // We run through the orderedIds and for each of the ID, we check if the project use the corresponding
    // StepType. If yes, we add it to an array which will be use to sort the usedStepTypeList. Else,
    // we add the id to the array used to sort availableStepTypeList.
    this.model.on("reorder", "dataFirst", data => {
      if (!this.project || data.type !== "StepType" || !data.orderedIds)
        return
      let ids = data.orderedIds as string[],
          usedStepTypeIds =  new Array<string>(),
          spareStepTypeIds = new Array<string>()
      for (let id of ids) {
        if (this.project.findStepByType(id))
          usedStepTypeIds.push(id)
        else
          spareStepTypeIds.push(id)
      }
      this.spareStepBoxList.setBoxesOrder(spareStepTypeIds)
      this.usedStepBoxList.setBoxesOrder(usedStepTypeIds)
    })
  }

  /**
   * Create ProjectStepsPanel subcomponents.
   */
  private createChildComponents() {
    let container = document.createElement("div")
    container.classList.add("ProjectStepsPanel")

    let boxListGroup = "PrjStepsPanelBoxLists"
    let spareBoxListParams = {
      id: "Available",
      group: boxListGroup,
      name: "Available step types",
      obj: this,
      onMove: ev => this.validateStepTypeMove(ev),
      sort: false
    }
    this.spareStepBoxList = this.dash.create(BoxList, { args: [ spareBoxListParams ] })
    container.appendChild(this.spareStepBoxList.el)

    let usedBoxListParams = {
      id: "Used",
      group: boxListGroup,
      name: "Used step types",
      obj: this,
      onMove: ev => this.validateStepTypeMove(ev),
      sort: false
    }
    this.usedStepBoxList = this.dash.create(BoxList, { args: [ usedBoxListParams ] })
    container.appendChild(this.usedStepBoxList.el)

    let specialBoxListParams = {
      id: "Special",
      group: undefined,
      name: "Special step types",
      sort: false
    }
    this.specialStepBoxList = this.dash.create(BoxList, { args: [ specialBoxListParams ] })
    container.appendChild(this.specialStepBoxList.el)

    return container
  }

  /**
   * Clear the content of the BoxLists.
   */
  private clear() {
    let boxLists = [ this.spareStepBoxList, this.specialStepBoxList, this.usedStepBoxList ]
    boxLists.forEach(bl => bl.clear())
  }

  /**
   * Create a StepTypeBox for a given StepType.
   *
   * @param stepType
   */
  private createBoxForStepType(stepType: StepTypeModel): StepTypeBox {
    let box = this.dash.create(StepTypeBox, { args: [ stepType, "id" ] })
    this.boxMap.set(stepType.id, box)
    return box
  }

  /**
   * Store the StepType in the stepTypeMap and create a box for the StepType.
   *
   * @param stepType
   * @return the created StepTypeBox
   */
  private registerStepType(stepType: StepTypeModel) {
    this.stepTypeMap.set(stepType.id, stepType)
    return this.createBoxForStepType(stepType)
  }

  /**
   * Fill the BoxList with the StepTypes stored in the component.
   */
  private fillBoxLists() {
    if (!this.project)
      return
    this.stepTypeMap.forEach(stepType => {
      let box = this.boxMap.get(stepType.id)
      if (!box)
        throw new Error(`Unable to retrieve StepTypeBox of StepType ${stepType.id} in ProjectStepsPanel`)
      if (stepType.isSpecial)
        this.specialStepBoxList.addBox(box)
      else if (this.project!.hasStepType(stepType.id))
        this.usedStepBoxList.addBox(box)
      else
        this.spareStepBoxList.addBox(box)
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

  /**
   * Request the update of the project StepTypes in the model.
   */
  private async doUpdate() {
    if (!this.project)
      return
    let used = this.usedStepBoxList.getBoxesOrder()
    let unused = this.spareStepBoxList.getBoxesOrder()
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

    // Send request to the server...
    try {
      let val = await batch.sendAll()
    } catch (err) {
      console.error("Error while updating project steps.", err)
      // We need to restore the content of the BoxLists.
      for (let [id, box] of this.boxMap.entries()) {
        if (this.project.hasStepType(id) && this.spareStepBoxList.hasBox(id)) {
          this.spareStepBoxList.removeBox(id)
          this.usedStepBoxList.addBox(box)
        }
        if (!this.project.hasStepType(id) && this.usedStepBoxList.hasBox(id)) {
          this.usedStepBoxList.removeBox(id)
          this.spareStepBoxList.addBox(box)
        }
      }
    }
    // Now we sort the content of the BoxLists. Easy to sort the used StepType BoxList...
    this.usedStepBoxList.setBoxesOrder(this.project.steps.map(step => step.typeId))
    // Tricky to sort the available StepType BoxList. We get the unused StepTypes from `stepTypeMap`,
    // then we sort them and finally we keep only the IDs in order to call BoxList#setBoxesOrder().
    let ids = Array.from(this.stepTypeMap.values()).filter((stepType) => {
      return !stepType.isSpecial && !this.project!.hasStepType(stepType.id)
    }).sort((a: StepTypeModel, b: StepTypeModel) => {
      return a.orderNum! - b.orderNum!
    }).map(stepType => stepType.id)
    this.spareStepBoxList.setBoxesOrder(ids)
  }

  /**
   * Check if a StepTypeBox can be moved between BoxLists.
   *
   * @param ev
   */
  private validateStepTypeMove(ev: BoxEvent) {
    if (!this.project)
      return
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
   * Hide the ProjectBoard.
   */
  public hide() {
    this.el.style.display = "none";
  }

  /**
   * Make the ProjectBoard visible.
   */
  public show() {
    this.el.style.display = "block";
  }
}
