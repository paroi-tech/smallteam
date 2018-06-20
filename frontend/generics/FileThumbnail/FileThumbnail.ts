import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import { MediaModel } from "../../AppModel/Models/MediaModel"

const template = require("./FileThumbnail.monk")

export default class FileThumbnail {
  readonly el: HTMLElement

  constructor(private dash: Dash, private media: MediaModel, readonly width: number, readonly height: number) {
    let view = render(template)
    this.el = view.rootEl()
    this.setDimensions()
  }

  private setDimensions() {
    this.el.style.width = this.width.toString()
    this.el.style.height = this.height.toString()
  }
}


