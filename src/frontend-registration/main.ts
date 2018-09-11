import { createApplication } from "bkb"
import App from "./App/App"

document.addEventListener("DOMContentLoaded", () => {
  let url = new URL(window.location.href)
  // The method used to get URL was params found at:
  // https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters
  let params = {
    action: url.searchParams.get("action"),
    token: url.searchParams.get("token"),
    accountId: url.searchParams.get("uid"),
    username: url.searchParams.get("username")
  }
  if (params.action && params.token)
    createApplication(App, params).start()
})
