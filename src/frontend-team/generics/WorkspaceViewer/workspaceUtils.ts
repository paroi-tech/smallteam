import { render } from "@tomko/lt-monkberry"

const template = require("./CustomMenuBtn.monk")

export function createCustomMenuBtnEl(): HTMLElement {
  return render(template).rootEl()
}
