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
  clientId: string
  isAlive: boolean
  listenModel?: boolean
  subdomain: string
  accountId: string
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
        appLog.warn("Missing session data in websocket handshake.")
        return
      }

      wsServer.handleUpgrade(req, socket, head, ws => {
        wsServer.emit("connection", ws, req)

        const clientId = uuid()
        const data = JSON.stringify({ type: "id", clientId: clientId })

        ws.send(data, (error) => {
          if (error) {
            appLog.error("Error sending first message to ws client.", error)
            ws.close()
            return
          }
          registerWsClient(ws, {
            subdomain: req.session.subdomain,
            accountId: req.session.accountId,
            isAlive: true,
            clientId
          })
        })
      })
    })
  })

  // const handleUpgrade = wsServer.handleUpgrade.bind(wsServer)
  // wsServer.handleUpgrade = function (req: any, socket: Socket, head: Buffer, cb: (client: WebSocket) => void) {
  //   sessionMiddleware(req, {} as any, () => {
  //     if (req.session?.subdomain && req.session?.accountId) {
  //       handleUpgrade(req, socket, head, cb)
  //     } else {
  //       socket.destroy()
  //       appLog.trace("Rejected ws connection request due to missing session data.")
  //     }
  //   })
  // }

  // wsServer.on("connection", (ws: WebSocketWithProperties) => {
  // })

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

  const clients = wsClients.get(subdomain)
  if (!clients) {
    appLog.debug(`No client registred Map for '${subdomain}'`)
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
  clients.set(props.clientId, ws)

  ws.on("pong", function (this: WebSocketWithProperties) {
    if (!this.attachedProperties)
      return
    this.attachedProperties.isAlive = true
  })

  ws.on("close", () => unregisterWsClient(props.subdomain, props.clientId))
}

function unregisterWsClient(subdomain: string, clientId: string) {
  const clients = wsClients.get(subdomain)
  if (!clients)
    return
  clients.delete(clientId)
}
