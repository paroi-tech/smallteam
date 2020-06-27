require("../../shared-ui/theme.scss")
require("./common.scss")

import { createApplication } from "bkb"
import App from "./AppFrame/App"
import { wsClientInit } from "./AppModel/ModelEngine/WsClient"

async function startup() {
  try {
    let app = createApplication(App)
    let accountId = await app.connect()

    if (accountId === "resetPassword") {
      await app.showPasswordResetDialog()
    } else {
      let sessionData = { accountId }
      // TODO: handle WS connection failure.
      await wsClientInit()
      // tslint:disable-next-line:no-console
      console.log("WS connection successful")
      await app.start(sessionData)
    }
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
  }
}

document.addEventListener("DOMContentLoaded", startup)
