import handledom from "handledom"
import { OwnDash } from "../AppFrame/OwnDash"

// tslint:disable-next-line: no-unused-expression
scss`
.ImagePicker {
  align-content: center;
  background-position: center;
  background-size: cover;
  border: 1px solid #5584ff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
`

const template = handledom`
<div class="ImagePicker" title="Click to change">
  <input type="file" accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml" hidden h="input">
  <!-- <button class="ImagePicker-btn" h="btn">Change</button> -->
</div>
`

interface ImagePickerOptions {
  height: number
  width: number
}

export default class ImagePicker {
  readonly el: HTMLElement
  private inputEl: HTMLInputElement

  constructor(private dash: OwnDash, options: ImagePickerOptions) {
    const { root, ref } = template()
    // let btn = ref("btn")

    this.el = root
    this.inputEl = ref("input")
    this.el.style.width = `${options.width}px`
    this.el.style.height = `${options.height}px`

    // btn.addEventListener("click", () => this.inputEl.click())
    this.el.addEventListener("click", () => this.inputEl.click())
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

    let imgURL = URL.createObjectURL(f)

    this.el.style.backgroundImage = `url("${imgURL}")`
    this.dash.emit("changed", { imgURL, f })
  }
}
