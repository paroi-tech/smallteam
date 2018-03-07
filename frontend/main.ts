import { createApplication } from "bkb"
import App from "./App/App"
import { wsClientInit } from "./AppModel/ModelEngine/WsClient";

async function startup() {
  try {
    let app = createApplication(App)
    let sessionData = await app.connect()

wsClientInit()

    await app.start(sessionData)
  } catch (err) {
    console.log(err)
  }
}

document.addEventListener("DOMContentLoaded", startup)
