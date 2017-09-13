import * as $ from "jquery"
import App from "../App/App"
import { Dash, Bkb, Component } from "bkb"
import TaskBoard from "../TaskBoard/TaskBoard"
import { Panel } from "../WorkspaceViewer/WorkspaceViewer"
import { Model, ProjectModel, TaskModel } from "../Model/Model"
import { MenuItem } from "../Menu/Menu"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"

const template = require("html-loader!./projectworkspace.html")

const menuItems = [
  {
    id: "editProject",
    label: "Edit project",
    eventName: "editProject",
    data: undefined
  },
  {
    id: "showOnHoldTasks",
    label: "Show on hold tasks",
    eventName: "showOnHoldTasks",
    data: undefined
  },
  {
    id: "showArchivedTasks",
    label: "Show archived tasks",
    eventName: "showArchivedTasks",
    data: undefined
  },
  {
    id: "deleteProject",
    label: "Delete project",
    eventName: "deleteProject",
    data: undefined
  }
]

/**
 * ProjectWorkspace component.
 *
 * It can contain several step switchers (one for each project task with children) and
 * a side pane that contain a TaskForm.
 */
export default class ProjectWorkspace implements Panel {
  readonly el: HTMLElement
  private dropdownMenuContainerEl: HTMLElement
  private contentContainerEl: HTMLElement

  private dropdownMenu: Component<DropdownMenu>
  private taskBoard: TaskBoard

  private model: Model

  /**
   * Create a new project board.
   *
   * @param dash - the current application dash.
   * @param project - the project for which the project board is created.
   */
  constructor(private dash: Dash<App>, readonly project: ProjectModel) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()
    this.createChildComponents()
    this.listenToChildren()
    this.listenToModel()
  }

  /**
   * Create component content from template.
   */
  private createHtmlElements() {
    let $container = $(template)

    $container.find("span.js-title").text(this.project.name)
    this.dropdownMenuContainerEl = $container.find(".js-dropdown-menu-container").get(0)
    this.contentContainerEl = $container.find(".js-content").get(0)

    return $("<div></div>").append($container).get(0)
  }

  /**
   * Listen to event from child components.
   *
   * Handled events are:
   *  - TaskBox selection
   *  - Menu edition request
   *  - StepSwitcher display request
   *  - Project deletion request
   */
  private listenToChildren() {
    this.dropdownMenu.bkb.on("editProject", "eventOnly", ev => {
      this.dash.emit("editProject", this.project)
    })

    this.dropdownMenu.bkb.on("deleteProject", "eventOnly", async (ev) => {
      if (this.project.tasks && this.project.tasks.length !== 0) {
        alert("Sorry. The project can not be deleted. It contains tasks.")
        return
      }
      if (!confirm("Are you sure you want to delete this project"))
        return
      try {
        await this.model.exec("delete", "Project", { id: this.project.id })
      } catch (error) {
        alert("Unable to delete project. Try again later.")
      }
    })
  }

  /**
   * Create ProjectWorkspace inner components, i.e. DropDownMenu and TaskBoard.
   */
  private createChildComponents() {
    this.dropdownMenu = this.dash.create(DropdownMenu, {
      args: ["ProjectWorkspace dropdown menu", "left"]
    })
    this.dropdownMenuContainerEl.appendChild(this.dropdownMenu.el)
    this.dropdownMenu.addItems(menuItems)

    this.taskBoard = this.dash.create(TaskBoard, {
      args: [ this.project.rootTask ]
    })
    this.contentContainerEl.appendChild(this.taskBoard.el)
  }

  /**
   * Listen to model events.
   *
   * Handled event are:
   */
  private listenToModel() {

  }

  /**
   * Hide the ProjectWorkspace.
   */
  public hide() {
    this.el.style.display = "none";
  }

  /**
   * Make the ProjectWorkspace visible.
   */
  public show() {
    this.el.style.display = "block";
  }
}
