
export function wsClientInit() {

  // let socket = new WebSocket("ws://localhost:3921")
  // // socket = new WebSocket("wss://localhost:3921") // HTTPS

  // // Récupération des erreurs.
  // // Si la connexion ne s'établie pas,
  // // l'erreur sera émise ici.
  // socket.onerror = function (error) {
  //   console.error(error)
  // }

  // // Lorsque la connexion est établie.
  // socket.onopen = function (event) {
  //   console.log("Connexion établie.")

  //   // Lorsque la connexion se termine.
  //   this.onclose = function (event) {
  //     console.log("Connexion terminé.")
  //   }

  //   // Lorsque le serveur envoi un message.
  //   this.onmessage = function (event) {
  //     console.log("Message:", event.data)
  //   }

  //   // Envoi d'un message vers le serveur.
  //   this.send("Hello world!")
  // }
}