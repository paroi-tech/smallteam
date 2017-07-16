import App from "../../App/App"
import Boxlist, { BoxEvent } from "../../Boxlist/Boxlist"
import { Dash, Bkb } from "bkb"
import { ProjectModel, StepModel, StepTypeModel, Model } from "../../Model/Model"
import StepTypeBox from "../../StepTypeBox/StepTypeBox"

export default class ProjectStepsPanel {
  private container: HTMLDivElement
  private availableStepsList: Boxlist<StepTypeBox>
  private specialStepsList: Boxlist<StepTypeBox>
  private usedStepsList: Boxlist<StepTypeBox>
  private model: Model

  /**
   * StepTypeBoxes created in the panel. There is no box created for special step types.
   */
  private boxes: Map<string, StepTypeBox> = new Map()

  /**
   * StepTypes loaded from model.
   */
  private stepTypes: StepTypeModel[]

  /**
   * Timer used to schedule the commit of the changes in the Boxlists to the model.
   */
  private timer: any = undefined

  constructor(private dash: Dash<App>, private project: ProjectModel) {
    this.model = this.dash.app.model
    this.initComponents()
    this.loadStepTypes().then(() => {
        this.fillBoxlists()
    })
  }

  private initComponents() {
    this.container = document.createElement("div")
    this.container.classList.add("ProjectStepsPanel")
    this.availableStepsList = this.dash.create(Boxlist, {
      args: [{
        id: "Available",
        group: this.project.id,
        name: "Available step types",
        obj: this,
        onMove: this.validateStepTypeMove,
        sort:false
      }]
    })
    this.availableStepsList.attachTo(this.container)
    this.usedStepsList = this.dash.create(Boxlist, {
      args: [{
        id: "Used",
        group: this.project.id,
        name: "Used step types",
        obj: this,
        onMove: this.validateStepTypeMove,
        sort: false
      }]
    })
    this.usedStepsList.attachTo(this.container)
    this.specialStepsList = this.dash.create(Boxlist, {
      args: [{
        id: "Special",
        group: undefined,
        name: "Special step types",
        sort: false
      }]
    })
    this.specialStepsList.attachTo(this.container)
  }

  /**
   * Load all step types from the model.
   */
  private async loadStepTypes() {
    try {
      this.stepTypes = await this.model.query("StepType")
    } catch(err) {
      console.log("Unable to load step types from model.", err)
    }
  }

  private fillBoxlists() {
    for (let stepType of this.stepTypes) {
      if (stepType.isSpecial)
        this.specialStepsList.addBox(this.dash.create(StepTypeBox, { args: [ stepType ] }))
      else {
        let box = this.dash.create(StepTypeBox, {
          args: [ stepType, "orderNum" ]
        })
        // FIXME: StepType#orderNum can't be undefined
        this.boxes.set(stepType.orderNum!.toString(), box)
        if (this.project.hasStep(stepType.id))
          this.usedStepsList.addBox(box)
        else
          this.availableStepsList.addBox(box)
      }
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

  private doUpdate() {
    let used = this.usedStepsList.getBoxesOrder()
    let unused = this.availableStepsList.getBoxesOrder()
    let batch = this.model.createCommandBatch()
    for (let id of used) {
      let step = this.stepTypes.find(step => step.orderNum != null && step.orderNum!.toString() === id)
      if (step && !this.project.hasStep(step.id))
        batch.exec("create", "Step", {
          typeId: step.id, projectId: this.project.id
        })
    }
    for (let id of unused) {
      let step = this.stepTypes.find(step => step.orderNum != null  && step.orderNum!.toString() === id)
      if (step && this.project.hasStep(step.id))
        batch.exec("delete", "Step", step.id)
    }
    batch.sendAll().then(val => {
      // TODO: sort the content of the boxlists based on stepTypes orderNum.
      // TODO: Feature request: stepTypes should be sorted based on orderNum in the model.
      console.log("Project steps updated.")
    }).catch(error => {
      // TODO: update failed. Put the boxlists in their original state.
      console.error("Error while updating project steps.", error)
    })
  }

  public attachTo(el: HTMLElement) {
    el.appendChild(this.container)
  }

  /**
   * Function used to validate events from boxlists.
   *
   * The rules used to validate are:
   *  - Special step types can't be moved.
   *  - If the user want to remove a used step type, we check there is no task currently at this step.
   *
   * @param ev
   */
  private validateStepTypeMove(ev: BoxEvent) {
    // We have to find the step type that is concerned by the BoxEvent.
    // FIXME: This search can take time. Use a map to hold step types.
    let stepType = this.stepTypes.find((stepType): boolean => {
      return (!stepType.isSpecial) && (stepType.orderNum!.toString() === ev.boxId)
    })
    if (!stepType) // This is here because Array.find() can return undefined...
      return false
    if (ev.boxlistId === "Available") {
      // A step type is being added to the project...
      // TODO: should handleUpdate() be an async function?
      this.handleUpdate()
      return true
    } else {
      // A step type is removed from the project...
      let step = this.project.findStep(stepType.id)
      if (!step)
        return false
      else {
        if (step.taskCount === 0) {
          this.handleUpdate()
          return true
        } else
          return false
      }
    }
  }

  public getContainer(): HTMLElement {
    return this.container
  }
}
