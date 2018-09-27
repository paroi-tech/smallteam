import { createApplication } from "bkb"
import App from "./App/App"

document.addEventListener("DOMContentLoaded", () => {
  let url = new URL(window.location.href)
  let action = url.searchParams.get("action") || undefined
  let token = url.searchParams.get("token") || undefined

  createApplication(App, { action, token }).start()
})
