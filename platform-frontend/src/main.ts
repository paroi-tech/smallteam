require("../../shared-ui/theme.scss")
import { createApplication } from "bkb"
import { removeAllChildren } from "../../shared-ui/libraries/utils"
import App from "./App"

document.addEventListener("DOMContentLoaded", () => {
  const url = new URL(window.location.href)
  const action = url.searchParams.get("action") || undefined
  const token = url.searchParams.get("token") || undefined

  const appEl = document.querySelector(".js-app")
  if (appEl)
    removeAllChildren(appEl)

  createApplication(App, { action, token }).start()
})
