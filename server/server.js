
function startServer(io) {
    
    io.on('connection', (socket) => {
        console.log('a user connected');

        io.on('diconnect', () => {
            console.log('a user disconnected');
        });
    });
}

module.exports = startServer;