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
   */
  private listenToModel() {
    this.model.on("createStepType", "dataFirst", data => {
      let box = this.dash.create(StepTypeBox, {
        args: [ data.model, "id" ]
      })
      this.stepTypeMap.set(data.model.id, data.model)
      this.boxMap.set(data.model.id, box)
      this.availableStepTypeList.addBox(box)
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
      else if (this.project.hasStep(stepType.id))
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
        throw new Error("Unknown StepType ID in ProjectStepsPanel " + this.project.code)
      if (!this.project.hasStep(stepType.id))
          batch.exec("create", "Step", { typeId: stepType.id, projectId: this.project.id })
    }

    // We remove unused StepTypes. No need to check if there are tasks in the Step. There was an control
    // when the StepTypeBox was moved.
    for (let id of unused) {
      let stepType = this.stepTypeMap.get(id)
      if (!stepType) // This should not happen.
        throw new Error("Unknown StepType ID in ProjectStepsPanel " + this.project.code)
      let step = this.project.findStep(stepType.id)
      if (step)
        batch.exec("delete", "Step", { id: step.id })
    }

    try {
      let val = await batch.sendAll()
    } catch (err) {
      console.error("Error while updating project steps.", err)
      // We need to restore the content of the BoxLists.
      this.boxMap.forEach((box, id) => {
        if (this.project.hasStep(id) && this.availableStepTypeList.hasBox(id)) {
          this.availableStepTypeList.removeBox(id)
          this.usedStepTypeList.addBox(box)
        } else
        if (!this.project.hasStep(id) && this.usedStepTypeList.hasBox(id)) {
          this.usedStepTypeList.removeBox(id)
          this.availableStepTypeList.addBox(box)
        }
      })
    }
    // Now we sort the content of the BoxLists.
    this.usedStepTypeList.setBoxesOrder(this.project.steps.map(step => step.typeId))
    this.availableStepTypeList.setBoxesOrder(
      Array.from(this.stepTypeMap.values()).filter(stepType => this.project.hasStep(stepType.id)).map(
        stepType => stepType.id
      )
    )
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
        throw new Error("Unknown StepType ID in ProjectStepsPanel " + this.project.code)
      let step = this.project.findStep(stepType.id)
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
