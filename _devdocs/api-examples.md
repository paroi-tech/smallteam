
# http://localhost:3000/api/model/query

{
  "type": "Project",
  "filters": {"archived": false}
}

# http://localhost:3000/api/model/exec

{
  "cmd": "create",
  "type": "Project",
  "values": {
    "code": "ABC",
    "name": "Abc def"
  }
}
