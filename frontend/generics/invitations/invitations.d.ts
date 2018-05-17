interface Invitation {
  id: string
  creationTs: number
  expirationTs: number
  email: string
  username: string | undefined
}
