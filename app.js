
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

const startServer = require('./server/server');
startServer(io);

app.use(express.static(__dirname + '/client'));
 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
 
server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});