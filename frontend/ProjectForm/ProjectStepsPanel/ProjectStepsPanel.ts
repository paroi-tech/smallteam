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
   * StepTypeBoxes created in the panel. There is no box created for special step types.
   */
  private boxes: Map<string, StepTypeBox> = new Map()

  /**
   * Timer used to schedule the commit of the changes in the BoxLists to the model.
   */
  private timer: any = undefined

  constructor(private dash: Dash<App>, private project: ProjectModel) {
    this.model = this.dash.app.model
    this.initComponents()
    this.model.query("StepType").then(stepTypes => {
      this.fillBoxLists(stepTypes)
    }).catch(err => {
      console.log(`Error while loading StepTypes in ProjectStepsPanel ${this.project.id}`)
    })
    this.listenToModel()
  }

  private listenToModel() {
    this.model.on("createStepType", "dataFirst", data => {
      let box = this.dash.create(StepTypeBox, {
        args: [ data.model, "orderNum" ]
      })
      this.availableStepsList.addBox(box)
    })
  }

  private initComponents() {
    this.container = document.createElement("div")
    this.container.classList.add("ProjectStepsPanel")
    this.availableStepsList = this.dash.create(BoxList, {
      args: [{
        id: "Available",
        group: this.project.id,
        name: "Available step types",
        obj: this,
        onMove: ev => this.validateStepTypeMove(ev),
        sort: false
      }]
    })
    this.availableStepsList.attachTo(this.container)
    this.usedStepsList = this.dash.create(BoxList, {
      args: [{
        id: "Used",
        group: this.project.id,
        name: "Used step types",
        obj: this,
        onMove: ev => this.validateStepTypeMove(ev),
        sort: false
      }]
    })
    this.usedStepsList.attachTo(this.container)
    this.specialStepsList = this.dash.create(BoxList, {
      args: [{
        id: "Special",
        group: undefined,
        name: "Special step types",
        sort: false
      }]
    })
    this.specialStepsList.attachTo(this.container)
  }

  private fillBoxLists(stepTypes: StepTypeModel[]) {
    for (let stepType of stepTypes) {
      if (stepType.isSpecial)
        this.specialStepsList.addBox(this.dash.create(StepTypeBox, { args: [ stepType ] }))
      else {
        let box = this.dash.create(StepTypeBox, {
          args: [ stepType, "orderNum" ]
        })
        // FIXME: StepType#orderNum can't be undefined for a non special StepType.
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

  private async doUpdate() {
    let used = this.usedStepsList.getBoxesOrder()
    let unused = this.availableStepsList.getBoxesOrder()
    let batch = this.model.createCommandBatch()
    for (let id of used) {
      // We only create steps for newly added StepTypes.
      // Note: the StepTypeBox used in ProjectStepsPanel have Step#orderNum as IDs...
      let step = this.project.steps.find(step => step.orderNum != null && step.orderNum.toString() === id)
      if (!step) {
        let box = this.boxes.get(id)
        if (box)
          batch.exec("create", "Step", {
            typeId: box.getStepType().id, projectId: this.project.id
          })
      }
    }
    // We remove unused StepTypes.
    for (let id of unused) {
      // let stepType = this.stepTypes.find(stepType => stepType.orderNum !== null && stepType.orderNum!.toString() === id)
      // if (!stepType)
      //   continue
      // let step = this.project.findStep(stepType.id)
      // if (step)
      //   batch.exec("delete", "Step", {id: step.id})
      let step = this.project.steps.find(step => step.orderNum != null && step.orderNum.toString() === id)
      if (step)
        batch.exec("delete", "Step", { id: step.id })
    }
    try {
      let val = await batch.sendAll()
      // TODO: sort the content of the boxlists based on stepTypes orderNum.
      // TODO: Feature request: stepTypes should be sorted based on orderNum in the model.
      console.log("Project steps updated.")
    } catch (err) {
      // TODO: update failed. Put the boxlists in their original state.
      console.error("Error while updating project steps.", err)
    }
  }

  public attachTo(el: HTMLElement) {
    el.appendChild(this.container)
  }

  private validateStepTypeMove(ev: BoxEvent) {
    if (ev.boxListId === "Available") {
      // A step type is being added to the project...
      // TODO: should handleUpdate() be an async function?
      this.handleUpdate()
      return true
    } else {
      // A step type is removed from the project. We check if the step contains tasks.
      let step = this.project.steps.find((step): boolean => {
        return step.orderNum != null && step.orderNum.toString() === ev.boxId
      })
      if (!step || step.taskCount === 0) {
        this.handleUpdate()
        return true
      } else {
        return false
      }
    }
  }

  public getContainer(): HTMLElement {
    return this.container
  }
}
