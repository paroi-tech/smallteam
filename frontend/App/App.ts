import { ApplicationDash, ApplicationBkb, Log, LogItem, Component } from "bkb"
import WorkspaceViewer from "../WorkspaceViewer/WorkspaceViewer"
import ModelComp, { Model, ModelEvent, ProjectModel } from "../AppModel/AppModel"
import { BgCommand } from "../AppModel/BgCommandManager"
import ProjectWorkspace from "../ProjectWorkspace/ProjectWorkspace"
import ProjectForm from "../ProjectForm/ProjectForm"
import StepTypeWorkspace from "../StepTypeWorkspace/StepTypeWorkspace"
import ContributorWorkspace from "../ContributorWorkspace/ContributorWorkspace"

export default class App {
  readonly log: Log
  readonly nextTick: (cb: () => void) => void
  readonly model: Component<Model>

  constructor(private dash: ApplicationDash<App>) {
    this.log = dash.log
    this.nextTick = dash.nextTick
    this.model = dash.create(ModelComp)

    this.dash.on("log", "dataFirst", (data: LogItem) => {
      console.log(`[LOG] ${data.type} `, data.messages)
    })

    this.dash.listenTo<ModelEvent>(this.model, "change").call("dataFirst", data => {
      if (data.orderedIds)
        console.log(`[MODEL] ${data.cmd} ${data.type}`, data.orderedIds)
      else
        console.log(`[MODEL] ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    this.dash.listenTo<BgCommand>(this.model, "bgCommandAdded").call("dataFirst", data => {
      console.log(`[BG] Add: ${data.label}`)
    })

    this.dash.listenTo<BgCommand>(this.model, "bgCommandDone").call("dataFirst", data => {
      console.log(`[BG] Done: ${data.label}`)
    })

    this.dash.listenTo<BgCommand>(this.model, "bgCommandError").call("dataFirst", data => {
      console.log(`[BG] Error: ${data.label}`, data.errorMessage)
    })
  }

  public async start() {
    await this.model.global.load
    let appEl = document.querySelector(".js-app")
    if (appEl) {
      let viewer = this.dash.create(WorkspaceViewer)
      this.createWorkspaces(viewer)
      appEl.appendChild(viewer.el)
    }
  }

  private createWorkspaces(viewer: WorkspaceViewer) {
    viewer.addWorkspace(`createProject`, "dropdown", "New project", this.dash.create(ProjectForm))
    viewer.addWorkspace(`manageStepTypes`, "dropdown", "Manage step types", this.dash.create(StepTypeWorkspace))
    viewer.addWorkspace(`manageContributors`, "dropdown", "Contributors", this.dash.create(ContributorWorkspace))

    let projects = this.model.global.projects
    for (let p of projects)
      this.addProject(viewer, p)

    this.model.on("createProject", "dataFirst", data => this.addProject(viewer, data.model))

    // if (projects.length === 0) {
    //   if (confirm("No project to load from server. Do you want to create a new one?"))
    //     this.showProjectForm()
    // }

  }


  private addProject(viewer: WorkspaceViewer, p: ProjectModel) {
    viewer.addWorkspace(`prj-${p.id}`, "main", p.code, this.dash.create(ProjectWorkspace, {
      args: [p]
    }))
  }
}



    //     /**
    //  * Options displayed in the dropdown menu of the PanelSelector.
    //  */
    // const settingMenuItems = [
    //   {
    //     id: "createProject",
    //     label: "New project",
    //     eventName: "createProject"
    //   },
    //   {
    //     id: "manageStepTypes",
    //     label: "Manage step types",
    //     eventName: "manageStepTypes"
    //   },
    //   {
    //     id: "manageContributors",
    //     label: "Contributors",
    //     eventName: "manageContributors"
    //   }
    // ]

// /**
//  * Listen to events from model.
//  * The following events are handled:
//  *  - Project creation
//  *  - Project deletion
//  */
// private listenToModel() {
//   // Project creation.
//   this.model.on("createProject", "dataFirst", data => this.addProject(data.model))

//   // Project deletion.
//   this.model.on("change", "dataFirst", data => {
//     if (data.cmd !== "delete" || data.type !==  "Project")
//       return
//     let projectId = data.id as string
//     this.projectMap.delete(projectId)
//     let panelInfo = this.workspaceMap.get("ProjectWorkspace" + ":" + projectId)
//     if (panelInfo && panelInfo.type === ProjectWorkspace && panelInfo.workspace)
//       this.bodyEl.removeChild(panelInfo.workspace.el)
//     this.menu.removeItem(projectId)
//   })
// }

  // /**
  //  * Add a project the panel.
  //  * An entry is added to the menu for the project.
  //  *
  //  * @param project the project to add
  //  */
  // private addProject(project: ProjectModel) {
  //   this.projectMap.set(project.id, project)
  //   let boardId = "ProjectWorkspace" + ":" + project.id
  //   this.workspaceMap.set(boardId, {
  //     projectModel: project,
  //     type: ProjectWorkspace
  //   })
  //   this.menu.addItem({
  //     id: project.id,
  //     label: project.code,
  //     eventName: "projectSelected",
  //     data: project.id
  //   })
  // }



  // /**
  //  * Create WorkspaceViewer subcomponents.
  //  */
  // private createChildComponents() {


  //       this.settingMenu = this.dash.create(DropdownMenu, {
  //         args: ["Global settings menu", "right"]
  //       })
  //       this.dropdownMenuEl.appendChild(this.settingMenu.el)
  //       this.settingMenu.addItems(settingMenuItems)

  //       this.projectForm = this.dash.create(ProjectForm, { args: [] })
  //       this.projectForm.hide()
  //       this.bodyEl.appendChild(this.projectForm.el)

  //       // We have to do this, or else the project board won't be able to display StepTypePanel
  //       // and ContributorPanel later. See the showSettingPanel() method for details.
  //       this.workspaces.set("stepTypeWorkspace", { type: StepTypeWorkspace })
  //       this.workspaces.set("contributorWorkspace", { type: ContributorWorkspace })
  //     }



















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
