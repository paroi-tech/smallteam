export async function initWsClient(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const { host, protocol } = window.location
    const wsProtocol = protocol === "https:" ? "wss" : "ws"
    const ws = new WebSocket(`${wsProtocol}://${host}/subscribe`)

    ws.addEventListener("error", () => reject("Unable to create websocket client."), { once: true })
    ws.addEventListener("open", () => resolve(ws))
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
