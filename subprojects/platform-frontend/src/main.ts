require("@smallteam-local/shared-ui/theme.scss")
require("./platform.scss")
import { createApplication } from "bkb"
import App from "./App"

document.addEventListener("DOMContentLoaded", () => {
  const url = new URL(window.location.href)
  const action = url.searchParams.get("action") || undefined
  const token = url.searchParams.get("token") || undefined

  createApplication(App, { action, token }).start()
})
