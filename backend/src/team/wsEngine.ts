import { Server } from "http"

// interface WebSocketWithProperties extends WebSocket {
//   attachedProperties?: WSProperties
// }

// interface WSProperties {
//   socketId: string
//   isAlive: boolean
//   listenModel?: boolean
// }

export function wsEngineInit(server: Server) {

  // const wss = new WebSocket.Server({ server })

  // wss.on("connection", function (ws: WebSocketWithProperties, req) {
  //   // TODO: Check the session here
  //   // if (!req.session) {
  //   //   log.error("...........>> Missing session")
  //   //   return
  //   // }

  //   ws.attachedProperties = {
  //     socketId: uuid(),
  //     isAlive: true
  //   }

  //   ws.on("pong", () => {
  //     ws.attachedProperties!.isAlive = true
  //   })
  //   ws.on("listenModel", () => {
  //     ws.attachedProperties!.listenModel = true
  //   })

  //   ws.send(JSON.stringify({
  //     socketId: ws.attachedProperties.socketId
  //   }))
  // })


  // const interval = setInterval(function ping() {
  //   wss.clients.forEach((ws: WebSocketWithProperties) => {
  //     if (!ws.attachedProperties)
  //       return
  //     if (!ws.attachedProperties.isAlive) {
  //       ws.terminate()
  //       return
  //     }
  //     ws.attachedProperties.isAlive = false
  //     ws.ping(noop)
  //   })
  // }, 60000)
}

// function noop() {
// }

// function onMessage(message) {
//   console.log("...........>> received: %s", message)
// }



// const wss = new WebSocket.Server({ port: 8080 })

// wss.on("connection", function connection(ws) {
//   ws.on("message", function incoming(message) {
//     console.log("received: %s", message)
//   })

//   ws.send("something")
// })

// // Broadcast to all.
// wss.broadcast = function broadcast(data) {
//   wss.clients.forEach(function each(client) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(data)
//     }
//   })
// }

// wss.on("connection", function connection(ws) {
//   ws.on("message", function incoming(data) {
//     // Broadcast to everyone else.
//     wss.clients.forEach(function each(client) {
//       if (client !== ws && client.readyState === WebSocket.OPEN) {
//         client.send(data)
//       }
//     })
//   })
// })