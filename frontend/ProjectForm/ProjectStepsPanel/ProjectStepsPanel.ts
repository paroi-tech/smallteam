import App from "../../App/App"
import Boxlist from "../../Boxlist/Boxlist"
import { Dash, Bkb } from "bkb"
import { ProjectModel, StepTypeModel } from "../../Model/Model"
import StepTypeBox from "../../StepTypeBox/StepTypeBox"

export default class ProjectStepsPanel {
  private container: HTMLDivElement
  private availableStepsBl: Boxlist<StepTypeBox>
  private specialStepsBl: Boxlist<StepTypeBox>
  private usedStepsBl: Boxlist<StepTypeBox>

  private stepTypes: StepTypeModel[] | undefined

  constructor(private dash: Dash<App>, private project: ProjectModel) {
    this.initComponents()
    this.loadStepTypes().then(() => {
      if (this.stepTypes)
        this.fillBoxlists()
    })
  }

  public attachTo(el: HTMLElement) {
    el.appendChild(this.container)
  }

  private fillBoxlists() {
    if (!this.stepTypes)
      return
    for (let stepType of this.stepTypes) {
      if (stepType.isSpecial)
        this.specialStepsBl.addBox(this.dash.create(StepTypeBox, { args: [ stepType ] }))
      else {
        if (this.project.hasStep(stepType.id)) {
          this.usedStepsBl.addBox(this.dash.create(StepTypeBox, { args: [ stepType ] }))
          console.log("step added to used boxlists.", stepType)
        } else {
          this.availableStepsBl.addBox(this.dash.create(StepTypeBox, { args: [ stepType ] }))
          console.log("step added to available boxlists.", stepType)
        }
      }
    }
  }

  private initComponents() {
    this.container = document.createElement("div")
    this.container.classList.add("ProjectStepsPanel")

    this.availableStepsBl = this.dash.create(Boxlist, {
      args: [ { id: "Available", name: "Available step types", group: this.project.id } ]
    })
    this.availableStepsBl.attachTo(this.container)

    this.usedStepsBl = this.dash.create(Boxlist, {
      args: [ { id: "Used", name: "Used step types", group: this.project.id } ]
    })
    this.usedStepsBl.attachTo(this.container)

    this.specialStepsBl = this.dash.create(Boxlist, {
      args: [ { id: "Special", name: "Special step types", group: undefined } ]
    })
    this.specialStepsBl.attachTo(this.container)
  }

  private async loadStepTypes() {
    try {
      this.stepTypes = await this.dash.app.model.query("StepType")
    } catch(err) {
      console.log("Unable to load step types from model.", err)
    }
  }
}
