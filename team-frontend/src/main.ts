require("@smallteam/shared-ui/theme.scss")
require("./common.scss")

import { createApplication } from "bkb"
import App from "./AppFrame/App"
import { wsClientInit } from "./AppModel/ModelEngine/WsClient"

async function startup() {
  try {
    const app = createApplication(App)
    const accountId = await app.connect()

    if (accountId === "resetPassword") {
      await app.showPasswordResetDialog()
    } else {
      const sessionData = { accountId }
      // TODO: handle WS connection failure.
      await wsClientInit()
      // eslint-disable-next-line no-console
      console.log("WS connection successful")
      await app.start(sessionData)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
  }
}

document.addEventListener("DOMContentLoaded", startup)
