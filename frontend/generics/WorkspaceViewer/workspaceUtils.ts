import { render } from "monkberry"

const template = require("./CustomMenuBtn.monk")

export function createCustomMenuBtnEl() {
  let view = render(template, document.createElement("div"))
  return view.nodes[0] as HTMLButtonElement
}
