import { ApplicationDash, ApplicationBkb, Log, LogItem } from "bkb"
import WorkspaceViewer from "../WorkspaceViewer/WorkspaceViewer"
import ModelComp, { Model, ProjectModel } from "../AppModel/AppModel"
import { BgCommand } from "../AppModel/BgCommandManager"
import ProjectWorkspace from "../ProjectWorkspace/ProjectWorkspace"
import ProjectForm from "../ProjectForm/ProjectForm"
import StepTypeWorkspace from "../StepTypeWorkspace/StepTypeWorkspace"
import ContributorWorkspace from "../ContributorWorkspace/ContributorWorkspace"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import BackgroundCommandManager from "../BackgroundCommandManager/BackgroundCommandManager"
import LoginDialog from "../LoginDialog/LoginDialog"

export default class App {
  readonly log: Log
  readonly model: Model

  constructor(private dash: ApplicationDash<App>) {
    this.log = dash.log
    this.model = dash.create(ModelComp)

    this.dash.onData("log", (data: LogItem) => {
      console.log(`[LOG] ${data.type} `, data.messages)
    })

    this.dash.listenTo(this.model, "change").onData(data => {
      if (data.orderedIds)
        console.log(`[MODEL] ${data.cmd} ${data.type}`, data.orderedIds)
      else
        console.log(`[MODEL] ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    this.dash.listenTo<BgCommand>(this.model, "bgCommandAdded").onData(data => {
      console.log(`[BG] Add: ${data.label}`)
    })

    this.dash.listenTo<BgCommand>(this.model, "bgCommandDone").onData(data => {
      console.log(`[BG] Done: ${data.label}`)
    })

    this.dash.listenTo<BgCommand>(this.model, "bgCommandError").onData(data => {
      console.log(`[BG] Error: ${data.label}`, data.errorMessage)
    })
  }

  public async start() {
    let dialog = this.dash.create(LoginDialog)

    dialog.el.addEventListener("close", async function() {
      if (this.returnValue) {
        await this.model.global.load
        let appEl = document.querySelector(".js-app")
        if (appEl) {
          let viewer = this.dash.create(WorkspaceViewer)
          this.createWorkspaces(viewer)
          appEl.appendChild(viewer.el)

          let bgCommandManager = this.dash.create(BackgroundCommandManager)
          viewer.addElementToHeader(bgCommandManager.buttonEl)
        }
      } else {
        console.log("Unsuccessfull login...")
      }
    })

    document.body.appendChild(dialog.el)
    dialog.el.showModal()
  }

  private createWorkspaces(viewer: WorkspaceViewer) {
    viewer.addWorkspace("createProject", "dropdown", "New project", this.dash.create(ProjectForm))
    viewer.addWorkspace("manageStepTypes", "dropdown", "Manage step types", this.dash.create(StepTypeWorkspace))
    viewer.addWorkspace("manageContributors", "dropdown", "Contributors", this.dash.create(ContributorWorkspace))

    let projects = this.model.global.projects
    for (let p of projects)
      this.addProject(viewer, p)

    this.dash.listenTo<UpdateModelEvent>(this.model, "createProject").onData(data => this.addProject(viewer, data.model))
  }


  private addProject(viewer: WorkspaceViewer, p: ProjectModel) {
    viewer.addWorkspace(`prj-${p.id}`, "main", p.code, this.dash.create(ProjectWorkspace, p))
  }
}

// // TODO: remove this...
// // The following code has been added for tests purpose.
// import * as $ from "jquery"
// import { StepModel, StepTypeModel } from "../AppModel/AppModel"

// function makeTests(el, model: Model) {
//   model.on("change", "dataFirst", data => {
//     console.log(`++ event "change"`, data.type, "; ID:", data.id, "; data:", data)
//   })
//   model.on("update", "dataFirst", data => {
//     console.log(`++ event "update"`, data.type, "; ID:", data.id, "; data:", data)
//   })
//   model.on("updateProject", "dataFirst", data => {
//     console.log(`++ event "updateProject"`, data.type, "; ID:", data.id, "; data:", data)
//   })
//   model.on("createStepType", "dataFirst", data => {
//     console.log(`++ event "createStepType"`, data.type, "; ID:", data.id, "; data:", data)
//   })

//   let type: StepTypeModel
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Add type</button>`).appendTo(el).click(async () => {
//     let t = await model.exec("create", "StepType", {
//       name: "TODO"
//     })
//     console.log("Created type:", t)
//     type = t
//   })
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Get types</button>`).appendTo(el).click(async () => {
//     let types = await model.query("StepType")
//     console.log("Loaded types:", types)
//   })
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Get contributors</button>`).appendTo(el).click(async () => {
//     let contributors = await model.query("Contributor")
//     console.log("Loaded contributors:", contributors)
//   })
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Batch</button>`).appendTo(el).click(async () => {
//     let batch = model.createCommandBatch();

//     batch.query("StepType").then(result => {
//       console.log("Queryied steptype:", result)
//     })
//     batch.query("Project", {archived: false}).then(result => {
//       console.log("Queryied Project:", result)
//     })

//     // batch.exec("delete", "Step", {
//     //   id: "3"
//     // }).then(result => {
//     //   console.log("Deleted step:", result)
//     // })
//     // batch.exec("create", "Step", {
//     //   projectId: "1",
//     //   typeId: "2"
//     // }).then(step => {
//     //   console.log("Created step:", step)
//     // })

//     let results = await batch.sendAll()
//     console.log("Batch result:", results)
//   })
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Add task</button>`).appendTo(el).click(async () => {
//     let step = await model.exec("create", "Task", {
//       label: "ABC",
//       createdById: "1",
//       curStepId: "1",
//       parentTaskId: "5"
//     })
//     console.log("Created step:", step)
//   })
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Update project</button>`).appendTo(el).click(async () => {
//    let project = await model.exec("update", "Project", {
//       id: "1",
//       description: "Hop la description",
//       name: "Beau projet"
//     })
//     console.log("Updated project:", project, project.tasks)
//   })
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Reorder types</button>`).appendTo(el).click(async () => {
//     await model.reorder("StepType", ["4", "3", "5"])
//     console.log("Reordered StepTypes...")
//     let types = await model.query("StepType")
//     console.log("Ordered types:", types)
//   })
// }
