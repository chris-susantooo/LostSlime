//start server logic, detect io events
function startServer(io) {
    
    //fire below upon any new client connects
    io.on('connection', (socket) => {
        console.log(socket.id);

        //fire below upon any existing client disconnects
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
}

//export to app.js for calling
module.exports = startServer;