
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 8081);
app.use('/public', express.static(__dirname + '/'));

//Routing
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

//Starts the server
server.listen(8081, function() {
    console.log('Starting server on port 8081');
});