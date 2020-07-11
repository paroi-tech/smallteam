import { RequestHandler } from "express"
import { Server } from "http"
import { v4 as uuid } from "uuid"
import WebSocket, { Server as WsServer } from "ws"
import { appLog } from "../context"
import { checkIncomingMessageSession } from "../session"

interface WebSocketWithProperties extends WebSocket {
  attachedProperties?: WSProperties
}

interface WSProperties {
  listenModel?: boolean
  subdomain: string
  accountId: string
  clientId: string
  isAlive: boolean
}

const wsServer = new WsServer({
  noServer: true,
  path: "/subscribe"
})
const wsClients = new Map<string, Map<string, WebSocketWithProperties>>()

export function wsEngineInit(server: Server, sessionMiddleware: RequestHandler) {
  server.on("upgrade", (req: any, socket, head) => {
    sessionMiddleware(req, {} as any, async () => {
      let accept = false

      try {
        accept = await checkIncomingMessageSession(req) ?? false
      } catch (error) {
        appLog.error("Error while checking session in ws connnection establishment.", error)
      }

      if (!accept) {
        socket.destroy()
        appLog.warn("Rejected ws connection request due to missing session data.")
        return
      }

      wsServer.handleUpgrade(req, socket, head, ws => {
        wsServer.emit("connection", ws, req)
        const props = {
          subdomain: req.session.subdomain,
          accountId: req.session.accountId,
          isAlive: true,
          clientId: uuid()
        }
        registerWsClient(ws, props)
      })
    })
  })

  const interval = setInterval(function ping() {
    if (!wsServer)
      return
    wsServer.clients.forEach((ws: WebSocketWithProperties) => {
      if (!ws.attachedProperties)
        return
      if (!ws.attachedProperties.isAlive) {
        const { subdomain, clientId } = ws.attachedProperties
        unregisterWsClient(subdomain, clientId)
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

export async function wsEngineClose() {
  await new Promise((resolve, reject) => {
    wsServer.close(err => {
      if (err)
        reject(err)
      else
        resolve()
    })
  })
}

export function broadcastModelUpdate(subdomain: string, data) {
  appLog.debug(`Broadcasting model update for '${subdomain}' subdomain clients.`)

  const map = wsClients.get(subdomain)
  if (!map) {
    appLog.debug(`No client registred Map for '${subdomain}'`)
    return
  }

  const payload = JSON.stringify(data)
  for (const ws of map.values()) {
    if (!ws.attachedProperties || ws.readyState !== WebSocket.OPEN)
      continue
    ws.send(payload, error => {
      if (error)
        appLog.error("Error while sending data through websocket:", error)
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {
}

function registerWsClient(ws: WebSocketWithProperties, props: WSProperties) {
  ws.attachedProperties = props

  let map = wsClients.get(props.subdomain)
  if (!map) {
    map = new Map<string, WebSocketWithProperties>()
    wsClients.set(props.subdomain, map)
  }
  map.set(props.clientId, ws)

  ws.on("pong", function (this: WebSocketWithProperties) {
    if (!this.attachedProperties)
      return
    this.attachedProperties.isAlive = true
  })

  ws.on("close", (code, reason) => {
    if (code !== 1000)
      appLog.debug(`Websocket closed with ${code} code: ${reason}.`, ws.attachedProperties)
    unregisterWsClient(props.subdomain, props.clientId)
  })
}

function unregisterWsClient(subdomain: string, clientId: string) {
  const map = wsClients.get(subdomain)
  if (!map)
    return
  map.delete(clientId)
}
