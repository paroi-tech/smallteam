require("../../shared-ui/theme.scss")
require("./common.scss")
import { createApplication } from "bkb"
import App from "./AppFrame/App"
import { wsClientInit } from "./AppModel/ModelEngine/WsClient"

async function startup() {
  try {
    const app = createApplication(App)
    const value = await app.connect()
    if (value === "resetPassword")
      await app.showPasswordResetDialog()
    else {
      const sessionData = {
        accountId: value
      }
      wsClientInit()
      await app.start(sessionData)
    }
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
  }
}

document.addEventListener("DOMContentLoaded", startup)
