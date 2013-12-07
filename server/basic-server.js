var 
  http    = require("http"),
  handler = require("./request-handler.js"),
  qs      = require('qs'),
  port    = 3000,
  ip      = "127.0.0.1",
  server  = http.createServer(handler.handleRequest);


console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);