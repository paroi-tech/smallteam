import { createApplication } from "bkb"
import App from "./App/App"

document.addEventListener("DOMContentLoaded", ev => {
  let url = new URL(window.location.href)
  let action =  url.searchParams.get("action")
  let token = url.searchParams.get("token")

  createApplication(App, action, token).start()
})
