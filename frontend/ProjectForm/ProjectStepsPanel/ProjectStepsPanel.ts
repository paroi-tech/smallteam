import App from "../../App/App"
import Boxlist, { BoxEvent } from "../../Boxlist/Boxlist"
import { Dash, Bkb } from "bkb"
import { ProjectModel, StepModel, StepTypeModel } from "../../Model/Model"
import StepTypeBox from "../../StepTypeBox/StepTypeBox"

export default class ProjectStepsPanel {
  private container: HTMLDivElement

  private availableStepsBl: Boxlist<StepTypeBox>
  private specialStepsBl: Boxlist<StepTypeBox>
  private usedStepsBl: Boxlist<StepTypeBox>

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
    this.initComponents()
    this.loadStepTypes().then(() => {
      if (this.stepTypes)
        this.fillBoxlists()
    })
  }

  private listenToEvents() {
    this.dash.listenToChildren<BoxEvent>("boxlistItemAdded").call("dataFirst", ev => {
      let stepType = this.stepTypes.find((stepType): boolean => {
        // FIXME: StepType#orderNum can't be undefined
        return stepType.orderNum!.toString() === ev.boxId
      })
      if (!stepType)
        return
      // this.handleStepMove(ev.boxlistId, stepType)
    })
  }

  /**
   * Schedule the update of step types order.
   *
   * A timeout of 2s is used to schedule the update. The timer is restarted if the user
   * reorders the step types within the 2s.
   */
  // private handleBoxlistUpdate(ev: BoxlistEvent) {
  //   if (this.timer)
  //       clearTimeout(this.timer)
  //   this.timer = setTimeout(() => {
  //     this.doUpdate(ev.boxIds)
  //   }, 2000)
  // }

  public attachTo(el: HTMLElement) {
    el.appendChild(this.container)
  }

  private fillBoxlists() {
    for (let stepType of this.stepTypes) {
      if (stepType.isSpecial)
        this.specialStepsBl.addBox(this.dash.create(StepTypeBox, { args: [ stepType ] }))
      else {
        let box = this.dash.create(StepTypeBox, { args: [ stepType, "orderNum" ] })
        // FIXME: StepType#orderNum can't be undefined
        this.boxes.set(stepType.orderNum!.toString(), box)
        if (this.project.hasStep(stepType.id))
          this.usedStepsBl.addBox(box)
        else
          this.availableStepsBl.addBox(box)
      }
    }
  }

  private initComponents() {
    this.container = document.createElement("div")
    this.container.classList.add("ProjectStepsPanel")

    this.availableStepsBl = this.dash.create(Boxlist, {
      args: [{
        id: "Available",
        group: this.project.id,
        name: "Available step types",
        onMove: this.onMove,
        sort:false
      }]
    })
    this.availableStepsBl.attachTo(this.container)

    this.usedStepsBl = this.dash.create(Boxlist, {
      args: [{
        id: "Used",
        group: this.project.id,
        name: "Used step types",
        onMove: this.onMove,
        sort: false
      }]
    })
    this.usedStepsBl.attachTo(this.container)

    this.specialStepsBl = this.dash.create(Boxlist, {
      args: [{
        id: "Special",
        group: undefined,
        name: "Special step types",
        sort: false
      }]
    })
    this.specialStepsBl.attachTo(this.container)
  }

  private onMove(ev: BoxEvent) {
    let stepType = this.stepTypes.find(stepType => stepType.orderNum!.toString() === ev.boxId)
    if (!stepType)
      return false
    if (ev.boxlistId === "Used")
      return true
    else {
      // let step = this.project.steps.find()
    }
  }

  private async loadStepTypes() {
    try {
      this.stepTypes = await this.dash.app.model.query("StepType")
    } catch(err) {
      console.log("Unable to load step types from model.", err)
    }
  }
}
