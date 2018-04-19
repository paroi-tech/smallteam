import { render } from "../../libraries/lt-monkberry";

const template = require("./CustomMenuBtn.monk")

export function createCustomMenuBtnEl() {
  return render(template).rootEl()
}
