var
  qs   = require('qs'),
  fs   = require('fs'),
  path = require('path'),
  DB   = 'database.json';

var getResponse = function(request, response, queryData, url){
  if(!queryData[url[0]]){
    var page = fs.createReadStream(path.join(__dirname, 'views/main.html'), {encoding: 'utf8'})
    page.pipe(response);
  } else if(queryData[url[0]]) {
    headers['Content-Type'] = "text/plain";
    response.writeHead(200, headers);
    var results = queryData[url[0]][url[1]] || [];
    var responseObject = {
      results: results
    }
    response.end(JSON.stringify(responseObject));
  } else {
    response.writeHead(404, "Invalid request", headers);
    response.end("Nothing to see here");
  }
};

var postResponse = function(request, response, queryData, url){
  if(request.method === "POST"){
    var body = '';
    request.on('data', function(data){
      body += data;
    })
    request.on('end', function(){
      var message = JSON.parse(body);
      message['createdAt'] = new Date();
      if(queryData[url[0]]){
        queryData[url[0]][url[1]] = queryData[url[0]][url[1]] || [];
        queryData[url[0]][url[1]].push(message);
        writeToDB(queryData, message);
        headers['Content-Type'] = "application/json";
        response.writeHead(201, headers);
        response.end(JSON.stringify(message));
      } else {
        response.writeHead(403, "Invalid post request", headers);
        response.end();
      }
    })
  }
};

var optionsResponse = function(request, response, queryData, url){
  response.writeHead(200, headers)
  response.end();
};

var router = {
  'GET': getResponse,
  'POST': postResponse,
  'OPTIONS': optionsResponse
};

var handleRequest = function(request, response) {
  console.log("Serving request type " + request.method + " for url " + request.url);
  var
    url       = require('url').parse(request.url, true).pathname.split('/').splice(1),
    queryData = retrieveFromDB(),
    method    = router[request.method];

  method(request, response, queryData, url);
};

var headers = {
  "access-control-allow-origin":  "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age":       10
};

var retrieveFromDB = function(){
  return JSON.parse(fs.readFileSync(path.join(__dirname, DB), {encoding: 'utf8'}));
};

var writeToDB = function(data, entry){
  data = JSON.stringify(data)
  fs.writeFile(path.join(__dirname, DB), data, function(err){
    if (err) throw err;
    console.log("Entry stored: " + JSON.stringify(entry))
  });
};

exports.handleRequest = handleRequest;