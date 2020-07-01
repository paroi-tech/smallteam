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
      // FIXME: handle WS connection failure and close ws connection on logout.
      await wsClientInit()
      await app.start(sessionData)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
  }
}

document.addEventListener("DOMContentLoaded", startup)
