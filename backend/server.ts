import * as express from "express"

let app = express()

app.use(express.static("../www"))

app.listen(3000, function() {
    console.log("App listening on port 3000!")
})