
# http://localhost:3000/api/query

{
  "type": "Project",
  "filters": {"archived": false}
}

# http://localhost:3000/api/exec

{
  "cmd": "create",
  "type": "Project",
  "values": {
    "code": "ABC",
    "name": "Abc def"
  }
}
