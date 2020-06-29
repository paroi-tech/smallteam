require("@smallteam/shared-ui/theme.scss")
import { removeAllChildren } from "@smallteam/shared-ui/libraries/utils"
import { createApplication } from "bkb"
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
