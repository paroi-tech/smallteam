// FIXME: find a better way to get server address in 'doWsClientInit'.

export async function wsClientInit() {
  return new Promise((resolve, reject) => {
    void doWsClientInit().then(value => {
      if (!value.done) {
        value.ws.close()
        reject("Unable to successfully initiate ws connection.")
      }
      resolve(value.ws)
    })
  })
}

async function doWsClientInit(): Promise<{ done: boolean; ws: WebSocket }> {
  return new Promise(resolve => {
    const ws = new WebSocket(`ws://${window.location.hostname}:3921`)

    setTimeout(() => resolve({ done: false, ws }), 10000)
    ws.addEventListener("error", () => resolve({ done: false, ws }), { once: true })

    waitForWsId(ws)
      .then((socketId) => {
        ws.addEventListener("message", ev => handleWsMessage(ev))
        ws["attachedProperties"] = { socketId }
        resolve({ done: true, ws })
      })
      .catch(() => resolve({ done: false, ws }))
  })
}

async function waitForWsId(ws: WebSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    ws.addEventListener("message", function (ev: MessageEvent) {
      const socketId = getWsId(ev.data)
      if (!socketId)
        reject()
      resolve(socketId)
    }, { once: true })
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
