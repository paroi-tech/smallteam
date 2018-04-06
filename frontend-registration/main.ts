import { createApplication } from "bkb"
import App from "./App/App"

function onDomContentLoaded() {
  let url = new URL(window.location.href)
  let token = url.searchParams.get("token")
  let contributorId = url.searchParams.get("uid")
  let action = url.searchParams.get("action")

  /**
   * Trick to get URL params found at:
   * https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters
   */
  if (token && contributorId && action)
    createApplication(App, contributorId, token).start()
}

document.addEventListener("DOMContentLoaded", ev => onDomContentLoaded())
