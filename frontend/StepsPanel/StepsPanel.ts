import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import { Boxlist, BoxlistParams } from "../Boxlist/Boxlist"
import TaskBox from "../TaskBox/TaskBox"
import App from "../App/App"
import { ProjectModel } from "../Model/FragmentsModel"
import { StepFragment } from "../../isomorphic/fragments/Step"
import { TaskFragment } from "../../isomorphic/fragments/Task"
import { exec, query } from "../Model/Model"

const template = require("html-loader!./stepspanel.html")

export default class StepsPanel {
  private $container: JQuery
  private $stepsContainer: JQuery

  private map: Map<string, Boxlist>

  constructor(private dash: Dash<App>, private projectModel: ProjectModel) {
    this.map = new Map<string, Boxlist>()

    this.$container = $(template)
    this.$stepsContainer = this.$container.find(".js-boxlist-container")

    this.createBoxlists()
    this.listenToEvents()
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  private listenToEvents() {
    this.$container.find(".js-add-task-button").click((ev) => {
      console.log(`Add Task button click from StepsPanel ${this.projectModel.code}`)

      let name: string = this.$container.find("input").val().trim()
      if(name.length < 1) {
        console.log("Invalid task name. The name should contain more characters.")
        return
      }

      exec("create", "Task", {
        label: name,
        createdById: "1",
        parentTaskId: this.projectModel.rootTaskId,
        // FIXME: there can be project without steps
        curStepId: this.projectModel.steps[0].id
      }).then(taskModel => {
        this.projectModel.tasks!.push(taskModel)
        let box = this.dash.create(TaskBox, {
          group: "items",
          args: [
            taskModel.id,
            taskModel.label
          ]
        })
        this.map.get(taskModel.curStepId)!.addBox(box)
        console.log(`Task Added in StepsPanel ${this.projectModel.code}`)
      }).catch(error => {
        console.error("Unable to create task.", error)
      })
    })
  }

  private createBoxlists() {
    for (let step of this.projectModel.steps) {
      let bl = this.dash.create(Boxlist, {
        args: [
          {
            id: step.id,
            name: step.name,
            group: this.projectModel.code
          }
        ]
      })
      for (let task of this.projectModel.rootTask.children!) {
        if (task.curStepId === step.id) {
          let box = this.dash.create(TaskBox, {
            group: "items",
            args: [
              task.id,
              task.label
            ]
          })
          bl.addBox(box)
        }
      }
      // TODO: Improve this. The key of the Boxlist in the map should be its stepId.
      // But since we add new tasks in the Boxlist which key is 1, we have to use
      // the typeId as key in the map.
      this.map.set(step.typeId, bl)
      bl.attachTo(this.$stepsContainer[0])
    }
  }

}