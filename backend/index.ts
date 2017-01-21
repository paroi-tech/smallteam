import * as path from "path"
import * as express from "express"
import { Response } from "express"
import CargoLoader, { Cargo } from "./CargoLoader"
import { fetchProjects,  } from "./dbqueries/fetchProjects"

let app = express()

app.post("/api/query", function (req, res) {
  var body = ""
  req.on("data", function (data) {
    body += data
  })
  req.on("end", function () {
    let reqData;
    try {
      try {
        reqData = JSON.parse(body)
      } catch (err) {
        throw new Error(`Invalid JSON request`)
      }
      if (reqData) {
        executeQuery(res, reqData).then(
          cargo => writeServerResponse(res, 200, cargo),
          err => writeServerResponse(res, 500, err.message)
        )
      }
    } catch (err) {
      writeServerResponse(res, 500, err.message)
    }
  })
})

app.use(express.static(path.join(__dirname, "..", "www")))
app.listen(3000, function () {
  console.log("The smallteam server is listening on port 3000...")
})

function writeServerResponse(res: Response, httpCode, data) {
  res.setHeader("Content-Type", "application/json")
  res.status(httpCode)
  res.send(JSON.stringify(data))
  res.end()
}

async function executeQuery(res: Response, data): Promise<Cargo> {
  if (data.type !== "Project")
    throw new Error(`Invalid query type: "${data.type}"`)
  let loader = new CargoLoader()
  await fetchProjects(loader, data.filters || {})
  return loader.toCargo()
}
