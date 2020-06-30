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
  wsServer = new WsServer({ server })

  server.on("upgrade", function upgrade(req, socket) {
    sessionParser(req, {} as any, () => {
      if (!req.session || !req.session.accountId || req.session.subdomain) {
        socket.destroy()
        return
      }
    })
  })

  wsServer.on("connection", function (ws: WebSocketWithProperties, req: any) {
    const accountId = req.session?.accountId
    const subdomain = req.session?.subdomain

    if (!accountId || !subdomain)
      return

    ws.on("pong", function (this: WebSocketWithProperties) {
      if (!this.attachedProperties)
        return
      this.attachedProperties.isAlive = true
    })

    const socketId = uuid()
    const data = JSON.stringify({
      type: "id",
      socketId
    })

    ws.send(data, (err) => {
      if (err) {
        // FIXME: what to do if id is not sent to client?
        appLog.error("Unable to send identifier to a socket client.")
        return
      }

      ws.attachedProperties = {
        socketId,
        accountId,
        subdomain,
        isAlive: true
      }

      let subdomainClients = wsClients.get(subdomain)
      if (!subdomainClients) {
        subdomainClients = new Map<string, WebSocketWithProperties>()
        wsClients.set(subdomain, subdomainClients)
      }
      subdomainClients.set(ws.attachedProperties.socketId, ws)
    })
  })

  const interval = setInterval(function ping() {
    if (!wsServer)
      return
    wsServer.clients.forEach((ws: WebSocketWithProperties) => {
      if (!ws.attachedProperties)
        return
      if (!ws.attachedProperties.isAlive) {
        const { subdomain, socketId } = ws.attachedProperties
        removeWebSocketFromClients(subdomain, socketId)
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

export function broadcastModelUpdate(subdomain: string, data) {
  appLog.trace("broadcasting", subdomain, data)
  const subdomainClients = wsClients.get(subdomain)
  if (!subdomainClients) {
    appLog.trace("No clients")
    return
  }
  for (const client of subdomainClients.values()) {
    appLog.trace("First client")
    if (client.readyState === WebSocket.OPEN) {
      // TODO: handle error.
      client.send(data)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {
}

function removeWebSocketFromClients(subdomain: string, socketId: string) {
  const subdomainClients = wsClients.get(subdomain)
  if (!subdomainClients)
    return
  subdomainClients.delete(socketId)
}
