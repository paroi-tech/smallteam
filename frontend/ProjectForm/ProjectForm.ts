import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"
import { createProject } from "../Model/Model"

const template = require("html-loader!./projectform.html")

export default class ProjectForm implements Component {
  static readonly componentName = "ProjectForm"
  readonly bkb: Bkb

  private $container: JQuery
  private $form: JQuery
  private $projectCode: JQuery
  private $projectName: JQuery

  private generateCode: boolean = true;

  constructor(private dash: Dash<App>) {
    this.$container = $(template)
    this.$form = this.$container.find(".js-form")
    this.$projectCode = this.$form.find(".js-project-code")
    this.$projectName = this.$form.find(".js-project-name")
    this.$container.find(".js-title").text("Project Form")
    this.listenToForm()
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  private listenToForm() {
    this.$projectCode.keyup(ev => {
      this.generateCode = false;
    })
    this.$projectName.keyup(ev => {
      if (this.generateCode && this.$projectName.val().length > 0) {
        let s = this.$projectName.val().replace(/\s/g, "").slice(0, 5).toUpperCase()
        this.$projectCode.val(s)
      }
    })
    let $btn = this.$form.find(".js-submit-btn").click(ev => {
      let $indicator = $btn.find("span").show()
      setTimeout(() => {
        createProject({
          code: this.$form.find(".js-project-code").val(),
          name: this.$form.find(".js-project-name").val()
        }).then(project => {
          $indicator.hide()
          alert("Project successfully created...")
        }).catch(error => {
          $indicator.hide()
          alert(error)
        })
      }, 1500)
    })
  }

  public hide() {
    this.$container.hide();
  }

  public show() {
    (this.$form[0] as HTMLFormElement).reset()
    this.$container.show();
    // Reset state variable used to decide if the project code should be generated from the name.
    this.generateCode = true;
  }
}