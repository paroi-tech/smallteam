require("../../shared-ui/theme.scss")
import { createApplication } from "bkb"
import "dialog-polyfill"
import { removeAllChildren } from "../../shared-ui/libraries/utils"
import App from "./App"

document.addEventListener("DOMContentLoaded", () => {
  let url = new URL(window.location.href)
  let action = url.searchParams.get("action") || undefined
  let token = url.searchParams.get("token") || undefined

  let appEl = document.querySelector(".js-app")
  if (appEl)
    removeAllChildren(appEl)

  createApplication(App, { action, token }).start()
})
