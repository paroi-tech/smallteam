import { createApplication } from "bkb"
import App from "./App/App"
import { wsClientInit } from "./AppModel/ModelEngine/WsClient"

async function startup() {
  try {
    let app = createApplication(App)
    let value = await app.connect()
    if (typeof value === "string") {
      let sessionData = { contributorId: value }
      wsClientInit()
      await app.start(sessionData)
    } else {
      await app.showPasswordResetDialog()
    }
  } catch (err) {
    console.log(err)
  }
}

document.addEventListener("DOMContentLoaded", startup)
