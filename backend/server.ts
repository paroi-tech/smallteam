import * as path from "path"
import * as express from "express"
import { Response } from "express"

let app = express()

app.post("/api/query", function (req, res) {
  var body = ""
  req.on("data", function (data) {
    body += data
  })
  req.on("end", function () {
    let reqData;
    try {
      reqData = JSON.parse(body)
    } catch (err) {
    }
    if (reqData)
      executeRequest(res, reqData)
    else
      badJsonRequest(res, body)
  })
})

app.use(express.static(path.join(__dirname, "..", "www")))
app.listen(3000, function () {
  console.log("The smallteam server is listening on port 3000...")
})

function badJsonRequest(res: Response, body: string) {
  res.setHeader("Content-Type", "application/json")
  res.status(500)
  res.send(JSON.stringify({
    error: `Invalid JSON request`,
    requestData: body
  }))
  res.end()
}

function executeRequest(res: Response, data) {

  res.setHeader("Content-Type", "application/json")
  res.status(200)
  res.send(JSON.stringify({ a: 1 }))
  res.end()
}