import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"
import Model from "../Model/Model"

const template = require("html-loader!./projectform.html")

export default class ProjectForm {
  private $container: JQuery
  private $form: JQuery
  private $projectCode: JQuery
  private $projectName: JQuery

  private generateCode = true

  constructor(private dash: Dash<App>) {
    this.initJQueryObjects()
    this.listenToForm()
  }

  private initJQueryObjects() {
    this.$container = $(template)
    this.$container.find(".js-title").text("Project Form")
    this.$form = this.$container.find(".js-form")
    this.$projectCode = this.$form.find(".js-project-code")
    this.$projectName = this.$form.find(".js-project-name")
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public hide() {
    this.$container.hide();
  }

  private listenToForm() {
    this.$projectCode.keyup(ev => {
      this.generateCode = false
    })

    this.$projectName.keyup(ev => {
      if (this.generateCode && this.$projectName.val().length > 0) {
        let code = this.$projectName.val().replace(/\s/g, "").slice(0, 5).toUpperCase()
        this.$projectCode.val(code)
      }
    })

    let $btn = this.$form.find(".js-submit-btn").click(ev => {
      let $indicator = $btn.find("span").show()
      let code = this.$form.find(".js-project-code").val()
      let name = this.$form.find(".js-project-name").val()

      this.dash.app.model.exec("create", "Project", { code, name }).then(project => {
        $indicator.hide()
        alert("Project successfully created.")
        this.dash.emit("projectCreated", { project })
      }).catch(error => {
        $indicator.hide()
        console.error(error)
      })
    })
  }

  public show() {
    (this.$form[0] as HTMLFormElement).reset()
    this.$container.show()
    this.generateCode = true
  }
}