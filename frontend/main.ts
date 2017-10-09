import { createApplication } from "bkb"
import App from "./App/App"

async function startup() {
  try {
    let app = createApplication(App)
    let sessionData = await app.connect()
    await app.start(sessionData)
  } catch (err) {
    console.log(err)
  }
}

document.addEventListener("DOMContentLoaded", startup)
