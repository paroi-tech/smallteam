import { RequestHandler } from "express"
import { Server } from "http"
import { v4 } from "uuid"
import { Server as WsServer } from "ws"
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

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {
}

export function wsEngineInit(server: Server, sessionParser: RequestHandler) {
  const wss = new WsServer({ server })

  server.on("upgrade", function upgrade(req, socket) {
    sessionParser(req, {} as any, () => {
      if (!req.session || !req.session.accountId || req.session.subdomain) {
        socket.destroy()
        return
      }
    })
  })

  wss.on("connection", function (ws: WebSocketWithProperties, req: any) {
    const accountId = req.session?.accountId
    const subdomain = req.session?.subdomain

    if (!accountId || !subdomain) {
      ws.terminate()
      return
    }

    ws.attachedProperties = {
      socketId: v4(),
      isAlive: true,
      subdomain,
      accountId
    }

    ws.on("pong", function (this: WebSocketWithProperties) {
      if (!this.attachedProperties)
        return
      this.attachedProperties.isAlive = true
    })

    ws.send(JSON.stringify({
      type: "id",
      socketId: ws.attachedProperties.socketId
    }))
  })

  const interval = setInterval(function ping() {
    wss.clients.forEach((ws: WebSocketWithProperties) => {
      if (!ws.attachedProperties)
        return
      if (!ws.attachedProperties.isAlive) {
        ws.terminate()
        return
      }
      ws.attachedProperties.isAlive = false
      ws.ping(noop)
    })
  }, 60000)

  wss.on("close", () => clearInterval(interval))
}

// // Broadcast to all.
// wss.broadcast = function broadcast(data) {
//   wss.clients.forEach(function each(client) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(data)
//     }
//   })
// }
