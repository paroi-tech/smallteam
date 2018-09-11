import { render } from "@fabtom/lt-monkberry";

import template = require("./CustomMenuBtn.monk")

export function createCustomMenuBtnEl() {
  return render(template).rootEl()
}
