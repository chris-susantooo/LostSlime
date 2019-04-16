
//setup client-server architecture
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

//start game server
const startServer = require('./server/server');
startServer(io);

app.use(express.static(__dirname + '/client'));
 
//process home requests
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//start service
server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});