import { createApplication } from "bkb"
import App from "./App/App"

document.addEventListener("DOMContentLoaded", ev => {
  let url = new URL(window.location.href)
  // The method used get URL params found at:
  // https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters
  let token = url.searchParams.get("token")
  let contributorId = url.searchParams.get("uid")
  let action = url.searchParams.get("action")
  if (action && token)
    createApplication(App, action, token, contributorId).start()
})
