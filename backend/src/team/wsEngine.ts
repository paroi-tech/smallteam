import { Server } from "http"
import { v4 } from "uuid"
import { Server as WsServer } from "ws"
import { appLog } from "../context"
import { hasSession } from "../session"
import WebSocket = require("ws")

interface WebSocketWithProperties extends WebSocket {
  attachedProperties?: WSProperties
}

interface WSProperties {
  socketId: string
  isAlive: boolean
  listenModel?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {
}

export function wsEngineInit(server: Server) {
  const wss = new WsServer({ server })

  server.on("upgrade", async function upgrade(req, socket) {
    let accept = false

    try {
      accept = await hasSession(req)
    } catch (error) {
      appLog.error("Error while checking user session.", error.message || undefined)
    } finally {
      if (!accept)
        socket.destroy()
    }
  })

  wss.on("connection", function (ws: WebSocketWithProperties) {
    ws.attachedProperties = {
      socketId: v4(),
      isAlive: true
    }

    ws.on("pong", function (this: WebSocketWithProperties) {
      if (!this.attachedProperties)
        return
      this.attachedProperties.isAlive = true
    })

    ws.send(JSON.stringify({
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
