import { Server } from "http"
import * as WebSocket from "ws"

export function wsEngineInit(server: Server) {

  const wss = new WebSocket.Server({ server })

  wss.on("connection", function (ws, req) {
    // TODO: Check the session here
    // if (!req.session) {
    //   console.log("...........>> Missing session")
    //   return
    // }

    // ws.on("message", onMessage)
    ws.send("something")
  })
}

function onMessage(message) {
  console.log("...........>> received: %s", message)
}



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