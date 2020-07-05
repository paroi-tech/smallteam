export async function wsClientInit(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const { host, protocol } = window.location
    const wsProtocol = protocol === "https:" ? "wss" : "ws"
    const ws = new WebSocket(`${wsProtocol}://${host}/subscribe`)

    ws.addEventListener("error", () => reject("Error when connecting to server via websockets."), { once: true })
    ws.addEventListener("open", () => {
      ws.addEventListener("message", ev => {
        const sessionId = getWsId(ev.data)
        if (!sessionId)
          return reject("No credentials received via websockets.")
        ws["attachedProperties"] = { sessionId }
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
    return JSON.parse(payload).sessionId
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Invalid Json received from ws server.")
  }
}
