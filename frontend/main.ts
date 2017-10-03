import { createApplication } from "bkb"
import App from "./App/App"

async function startup() {
  try {
    let app = createApplication(App)
    await app.connect()
    await app.start()
  } catch (err) {
    console.log(err)
  }
}

document.addEventListener("DOMContentLoaded", startup)
