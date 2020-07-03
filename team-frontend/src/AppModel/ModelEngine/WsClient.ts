// FIXME: find a better way to get server address in 'doWsClientInit'.
// TODO: add a listener to track error on ws client and create a new one if needed.

export async function wsClientInit(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${window.location.hostname}:3921`)

    ws.addEventListener("error", () => reject("Error when connecting to server via websockets."), { once: true })
    ws.addEventListener("open", () => {
      ws.addEventListener("message", ev => {
        const socketId = getWsId(ev.data)
        if (!socketId)
          return reject("No credentials received via websockets.")
        ws["attachedProperties"] = { socketId }
        ws.addEventListener("message", ev => handleWsMessage(ev))
        resolve(ws)
      }, { once: true })
    })
  })
}

// TODO: use application logger in these functions.

function getWsId(payload: string): string | undefined {
  try {
    return JSON.parse(payload).socketId
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Invalid Json received from ws server.")
  }
}

function handleWsMessage(ev: MessageEvent) {
  try {
    // eslint-disable-next-line no-console
    console.log("Received data from ws server", JSON.parse(ev.data))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Received bad JSON from ws server.")
  }
}
