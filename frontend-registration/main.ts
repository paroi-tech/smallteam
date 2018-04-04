import { createApplication } from "bkb"
import App from "./App/App"

// Trick to get URL params found at:
// https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters
document.addEventListener("DOMContentLoaded", ev => {
  let url = new URL(window.location.href)
  let token = url.searchParams.get("token")
  let contributorId = url.searchParams.get("uid")

  if (!token || !contributorId)
    console.warn("Cannot get URL params...")
  else
    createApplication(App, contributorId, token).start()
})
