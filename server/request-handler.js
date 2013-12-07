var
  qs   = require('qs'),
  fs   = require('fs'),
  path = require('path'),
  DB   = 'database.json'

// var router = {
//   'GET': getresponse,
//   'POST': postresponse,
//   'OPTIONS': optionsresponse
// }

var handleRequest = function(request, response) {
  console.log("Serving request type " + request.method + " for url " + request.url);
  var
    url       = require('url').parse(request.url, true).pathname.split('/').splice(1),
    headers   = defaultCorsHeaders,
    queryData = retrieveFromDB();

  if(request.method === "GET"){

    //this would be a home page
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
  }

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

  if(request.method === "OPTIONS"){
    response.writeHead(200, headers)
    response.end();
  }
  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */

  /* .writeHead() tells our server what HTTP status code to send back */

  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin":  "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age":        10 // Seconds.
};

var retrieveFromDB = function(){
  return JSON.parse(fs.readFileSync(path.join(__dirname, DB), {encoding: 'utf8'}));
}

var writeToDB = function(data, entry){
  data = JSON.stringify(data)
  fs.writeFile(path.join(__dirname, DB), data, function(err){
    if (err) throw err;
    console.log("Entry stored: " + JSON.stringify(entry))
  });
}

var servePage = function(){

}

exports.handleRequest = handleRequest;