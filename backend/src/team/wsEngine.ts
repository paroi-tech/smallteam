import { RequestHandler } from "express"
import { Server } from "http"
import { v4 as uuid } from "uuid"
import { Server as WsServer } from "ws"
import { appLog } from "../context"
import WebSocket = require("ws")

interface WebSocketWithProperties extends WebSocket {
  attachedProperties?: WSProperties
}

interface WSProperties {
  socketId: string
  isAlive: boolean
  listenModel?: boolean
  subdomain: string
  accountId: string
}

let wsServer: WsServer | undefined
const wsClients = new Map<string, Map<string, WebSocketWithProperties>>()

export function wsEngineInit(server: Server, sessionParser: RequestHandler) {
  const parseSession = async (req) => {
    return new Promise((resolve) => {
      sessionParser(req, {} as any, () => resolve(req))
    })
  }

  wsServer = new WsServer({ server })

  wsServer.on("connection", async function (ws: WebSocketWithProperties, req: any) {
    // FIXME: find a better way to validate user session. Try to use session::hasSession.
    await parseSession(req)
    if (req.session?.subdomain && req.session?.accountId) {
      const { accountId, subdomain } = req.session
      handleWsClientRegistration(ws, subdomain, accountId)
    } else {
      appLog.info("Rejected ws client to due missing session data.")
      ws.terminate()
    }
  })

  const interval = setInterval(function ping() {
    if (!wsServer)
      return
    wsServer.clients.forEach((ws: WebSocketWithProperties) => {
      if (!ws.attachedProperties)
        return
      if (!ws.attachedProperties.isAlive) {
        const { subdomain, socketId } = ws.attachedProperties
        unregisterWsClient(subdomain, socketId)
        return ws.terminate()
      }
      ws.attachedProperties.isAlive = false
      ws.ping(noop)
    })
  }, 60000)

  wsServer.on("close", () => {
    wsClients.clear()
    clearInterval(interval)
  })
}

export function broadcastModelUpdate(subdomain: string, accountId: string, data) {
  appLog.trace(`Broadcasting model update for '${subdomain}' subdomain clients.`)

  const clients = wsClients.get(subdomain)
  if (!clients) {
    appLog.trace(`No client registred Map for '${subdomain}'`)
    return
  }

  const payload = JSON.stringify(data)
  for (const client of clients.values()) {
    if (client.readyState === WebSocket.OPEN)
      client.send(payload)
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {
}

function handleWsClientRegistration(ws: WebSocketWithProperties, subdomain: string, accountId: string) {
  const socketId = uuid()
  const data = JSON.stringify({
    type: "id",
    socketId
  })

  ws.send(data, (error) => {
    if (error) {
      appLog.error("Unable to send identifier to a ws. Closing the connection.")
      return ws.close()
    }

    doWsClientRegistration(ws, {
      accountId,
      subdomain,
      socketId,
      isAlive: true
    })
  })
}

function doWsClientRegistration(ws: WebSocketWithProperties, props: WSProperties) {
  ws.attachedProperties = props

  let clients = wsClients.get(props.subdomain)
  if (!clients) {
    clients = new Map<string, WebSocketWithProperties>()
    wsClients.set(props.subdomain, clients)
  }
  clients.set(props.socketId, ws)

  ws.on("pong", function (this: WebSocketWithProperties) {
    if (!this.attachedProperties)
      return
    this.attachedProperties.isAlive = true
  })

  ws.on("close", () => unregisterWsClient(props.subdomain, props.socketId))
}

function unregisterWsClient(subdomain: string, socketId: string) {
  const clients = wsClients.get(subdomain)
  if (!clients)
    return
  clients.delete(socketId)
}
