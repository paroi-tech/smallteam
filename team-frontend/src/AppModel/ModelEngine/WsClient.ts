export async function wsClientInit() {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket("ws://localhost:3921")

    socket.addEventListener("error", () => reject("Unable to contact server via websocket"))
    socket.addEventListener("open", () => resolve(true))
    socket.addEventListener("message", handleWsMessage)
  })
}

function handleWsMessage(this: WebSocket, ev: MessageEvent) {
  let data: any | undefined

  try {
    data = JSON.parse(ev.data)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Received bad JSON from server.")
    return
  }

  switch (data.type) {
    case "close":
      this.close()
      break
    case "id":
      // TODO: set socket connection ID here
      break
    default:
      break
  }
}
