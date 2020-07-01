export async function wsClientInit() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${window.location.hostname}:3921`)

    setTimeout(() => reject(), 10000)
    ws.addEventListener("error", () => {
      reject()
    }, { once: true })

    ws.addEventListener("open", function () {
      ws.addEventListener("message", function (ev: MessageEvent) {
        const id = getWsId(ev.data)
        if (id) {
          this.addEventListener("message", ev => handleWsMessage(ev))
          ws["attachedProperties"] = { socketId: id }
          resolve(ws)
        }
        reject()
      }, { once: true })
    })
  })
}

// TODO: use application logger in these functions.

function getWsId(payload: string) {
  try {
    return JSON.parse(payload).socketId
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Invalid Json received from ws server.")
  }
}

function handleWsMessage(ev: MessageEvent) {
  let data: any | undefined

  try {
    data = JSON.parse(ev.data)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Received bad JSON from ws server.")
  }

  if (data) {
    // eslint-disable-next-line no-console
    console.log("Received data from ws server", data)
  }
}
