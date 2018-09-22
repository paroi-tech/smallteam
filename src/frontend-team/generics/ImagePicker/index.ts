import { render } from "@fabtom/lt-monkberry"
import { OwnDash } from "../../App/OwnDash"

const template = require("./ImagePicker.monk")

interface ImagePickerOptions {
  height: number
  width: number
}

export default class ImagePicker {
  readonly el: HTMLElement
  private inputEl: HTMLInputElement

  constructor(private dash: OwnDash, private options: ImagePickerOptions) {
    let view = render(template)
    let btn = view.ref("btn")

    this.el = view.rootEl()
    this.inputEl = view.ref("input")
    this.el.style.width = `${options.width}px`
    this.el.style.height = `${options.height}px`

    btn.addEventListener("click", () => this.inputEl.click())
    this.inputEl.addEventListener("change", () => this.onImageChange())
  }

  setImage(imgURL: string) {
    this.el.style.backgroundImage = imgURL
  }

  private onImageChange() {
    let list = this.inputEl.files

    if (!list || list.length === 0)
      return

    let f = list.item(0)

    if (!f)
      return

    console.log("got file", f)

    let imgURL = URL.createObjectURL(f)

    this.el.style.backgroundImage = `url("${imgURL}")`
    this.dash.emit("changed", imgURL)
  }
}
