import { RequestHandler } from "express"
import { Server } from "http"
import { Socket } from "net"
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

  const handleUpgrade = wsServer.handleUpgrade.bind(wsServer)
  wsServer.handleUpgrade = function (req: any, socket: Socket, head: Buffer, cb: (client: WebSocket) => void) {
    sessionParser(req, {} as any, () => {
      if (req.session?.subdomain && req.session?.accountId) {
        handleUpgrade(req, socket, head, cb)
      } else {
        socket.destroy()
        appLog.trace("Rejected ws connection request due to missing session data.")
      }
    })
  }

  wsServer.on("connection", (ws: WebSocketWithProperties, req: any) => {
    const socketId = uuid()
    const data = JSON.stringify({ type: "id", socketId })

    ws.send(data, (error) => {
      if (error) {
        appLog.error("Unable to send identifier to a ws client. Closing the connection.")
        return ws.close()
      }
      const props = {
        subdomain: req.session.subdomain,
        accountId: req.session.accountId,
        isAlive: true,
        socketId
      }
      registerWsClient(ws, props)
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

function registerWsClient(ws: WebSocketWithProperties, props: WSProperties) {
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
