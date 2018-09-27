import { createApplication } from "bkb"
import App from "./App/App"

document.addEventListener("DOMContentLoaded", () => {
  let url = new URL(window.location.href)
  // The method used to get URL was params found at:
  // https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters
  let action = url.searchParams.get("action")
  if (!action)
    throw new Error("Missing parameter 'action'")
  let token = url.searchParams.get("action")
  if (!token)
    throw new Error("Missing parameter 'token'")
  createApplication(App, {
    action,
    token,
    accountId: url.searchParams.get("uid") || undefined,
    username: url.searchParams.get("username") || undefined
  }).start()
})
