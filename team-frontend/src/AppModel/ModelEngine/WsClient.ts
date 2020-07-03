export async function wsClientInit(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    // FIXME: find a better way to get server address.
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

export function closeWsClient(ws: WebSocket) {
  if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING)
    return
  const timer = setInterval(() => {
    if (ws.bufferedAmount === 0)
      ws.close()
  }, 5000)
  ws.addEventListener("close", () => clearInterval(timer), { once: true })
}

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
