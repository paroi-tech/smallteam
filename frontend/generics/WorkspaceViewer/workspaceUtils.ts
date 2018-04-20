import { render } from "@fabtom/lt-monkberry";

const template = require("./CustomMenuBtn.monk")

export function createCustomMenuBtnEl() {
  return render(template).rootEl()
}
