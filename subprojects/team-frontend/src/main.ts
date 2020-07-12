require("@smallteam-local/shared-ui/theme.scss")
require("./common.scss")

import { createApplication } from "bkb"
import App from "./AppFrame/App"
import { initWsClient } from "./AppModel/ModelEngine/WsClient"

async function startup() {
  try {
    const app = createApplication(App)
    const loginResult = await app.connect()

    if (loginResult === "password-reset") {
      await app.showPasswordResetDialog()
    } else {
      const ws = await initWsClient()
      await app.start(loginResult, ws)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
  }
}

document.addEventListener("DOMContentLoaded", startup)
