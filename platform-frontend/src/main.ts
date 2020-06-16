require("../../shared-ui/_start.scss")
import { createApplication } from "bkb"
import { removeAllChildren } from "../../shared-ui/libraries/utils"
import App from "./App/App"

document.addEventListener("DOMContentLoaded", () => {
  let url = new URL(window.location.href)
  let action = url.searchParams.get("action") || undefined
  let token = url.searchParams.get("token") || undefined

  let appEl = document.querySelector(".js-app")
  if (appEl)
    removeAllChildren(appEl)

  createApplication(App, { action, token }).start()
})
