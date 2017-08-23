import App from "../../App/App"
import BoxList, { BoxEvent } from "../../BoxList/BoxList"
import { Dash, Bkb } from "bkb"
import { ProjectModel, StepModel, StepTypeModel, Model } from "../../Model/Model"
import StepTypeBox from "../../StepTypeBox/StepTypeBox"

export default class ProjectStepsPanel {
  private container: HTMLDivElement
  private availableStepsList: BoxList<StepTypeBox>
  private specialStepsList: BoxList<StepTypeBox>
  private usedStepsList: BoxList<StepTypeBox>
  private model: Model

  /**
   * Map used to store StepTypeBoxes created in the panel.
   */
  private boxMap: Map<string, StepTypeBox> = new Map()

  /**
   * Maps used to store StepTypes.
   * We use two maps, one which keys are StepTypes IDs and another which keys are StepType orderNum.
   * We do that because special StepTypes have no orderNum but still have an ID.
   * The `stepTypeOrderNumMap` is needed because StepTypeBoxes in the `availableStepTypeList` and
   * `usedStepTypeList` use StepType#orderNum as ID.
   * So when a StepTypeBox is moved and we have to * handle the event, we retrieve the StepType based on the orderNum.
   */
  private stepTypeIdMap: Map<string, StepTypeModel> = new Map()
  private stepTypeOrderNumMap: Map<string, StepTypeModel> = new Map()

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
        args: [ data.model, "orderNum" ]
      })
      this.availableStepsList.addBox(box)
    })
  }

  /**
   * Create ProjectStepsPanel subcomponents.
   */
  private initComponents() {
    this.container = document.createElement("div")
    this.container.classList.add("ProjectStepsPanel")
    this.availableStepsList = this.dash.create(BoxList, {
      args: [ {
        id: "Available",
        group: this.project.id,
        name: "Available step types",
        obj: this,
        onMove: ev => this.validateStepTypeMove(ev),
        sort: false
      } ]
    })
    this.availableStepsList.attachTo(this.container)
    this.usedStepsList = this.dash.create(BoxList, {
      args: [ {
        id: "Used",
        group: this.project.id,
        name: "Used step types",
        obj: this,
        onMove: ev => this.validateStepTypeMove(ev),
        sort: false
      } ]
    })
    this.usedStepsList.attachTo(this.container)
    this.specialStepsList = this.dash.create(BoxList, {
      args: [ {
        id: "Special",
        group: undefined,
        name: "Special step types",
        sort: false
      } ]
    })
    this.specialStepsList.attachTo(this.container)
  }

  /**
   * Fill the BoxList with the StepTypes loaded from  model.
   * @param stepTypes
   */
  private fillBoxLists(stepTypes: StepTypeModel[]) {
    let boxList: BoxList<StepTypeBox>
    let box: StepTypeBox
    for (let stepType of stepTypes) {
      this.stepTypeIdMap.set(stepType.id, stepType)

      if (stepType.isSpecial) {
        box = this.dash.create(StepTypeBox, { args: [ stepType ] })
        boxList = this.specialStepsList
      } else {
        // FIXME: StepType#orderNum can't be undefined for a StepType which is not special.
        this.stepTypeOrderNumMap.set(stepType.orderNum!.toString(), stepType)
        box = this.dash.create(StepTypeBox, { args: [ stepType, "orderNum" ] })
        boxList = this.project.hasStep(stepType.id) ? this.usedStepsList : this.availableStepsList
      }
      this.boxMap.set(stepType.id, box)
      boxList.addBox(box)
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
    let used = this.usedStepsList.getBoxesOrder()
    let unused = this.availableStepsList.getBoxesOrder()
    let batch = this.model.createCommandBatch()

    // We create steps for newly added StepTypes.
    for (let id of used) {
      // Note: the StepTypeBox used in ProjectStepsPanel have Step#orderNum as IDs...
      let stepType = this.stepTypeOrderNumMap.get(id)
      if (!stepType) // This should not happen.
        continue
      if (!this.project.hasStep(stepType.id))
          batch.exec("create", "Step", { typeId: stepType.id, projectId: this.project.id })
    }

    // We remove unused StepTypes. No need to check if there are tasks in the Step. There was an control
    // when the StepTypeBox was moved.
    for (let id of unused) {
      let stepType = this.stepTypeOrderNumMap.get(id)
      if (!stepType) // This should not happen.
        continue
      let step = this.project.findStep(stepType.id)
      if (step)
        batch.exec("delete", "Step", { id: step.id })
    }

    try {
      let val = await batch.sendAll()
      // TODO: sort the content of the boxlists based on stepTypes orderNum.
      console.log("Project steps updated.")
    } catch (err) {
      // TODO: update failed. Put the boxlists in their original state.
      console.error("Error while updating project steps.", err)
    }
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
      let stepType = this.stepTypeOrderNumMap.get(ev.boxId)
      if (!stepType) // This should not happen. It means there is an error in the model or in Map#get().
        return false
      let step = this.project.findStep(stepType.id)
      if (!step || step.taskCount === 0) {
        this.handleUpdate()
        return true
      } else {
        return false
      }
    }
  }

  /**
   * Return the panel root element.
   */
  public getRootElement(): HTMLElement {
    return this.container
  }
}
