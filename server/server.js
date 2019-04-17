class GameServer{
    
    constructor(io) {
        this.io = io;
        this.players = {};
        this.rooms = {};
    }

    //start monitoring io requests from each client
    start() {
        //all messages are exchanged on top of a connected socket
        this.io.on('connection', (socket) => {
            //when this player register itself to server
            socket.on('register', (name, color, callback) => {
                let player = this.register(name, color, socket);
                //respond to client with player as data
                callback(player);
            });

            //when this player requests to join a room with specified roomID
            socket.on('join', (roomID, callback) => {
                //if room exists and player registered
                if(roomID in this.rooms && socket.id in this.players) {
                    this.join(this.players[socket.id], roomID);
                    //respond to client with total players in room as data
                    callback(this.rooms[roomID].players);
                }
            });
            
            //when this player requests to make a room with specified roomID
            socket.on('create', (roomID, callback) => {
                //if no any existing room has roomID as the id
                if(!(roomID in this.rooms) && socket.id in this.players) {
                    this.create(this.players[socket.id], roomID);
                    callback('createOK');
                } else {
                    callback('createFail');
                }
            });

            //when this player requests to leave current room
            socket.on('leave', (callback) => {
                if(socket.id in this.players) {
                    this.leaveRoom(player['room'], socket);
                    callback('leaveOK');
                } else {
                    callback('leaveFail');
                }
            });

             //when this player disconnects from server
            socket.on('disconnect', () => {
                if(socket.id in this.players) {
                    let player = this.players[socket.id];
                    //remove from rooms
                    this.leaveRoom(player['room'], socket);
                    //remove from players
                    delete this.players[socket.id];
                    //remove player reference
                    player = null;
                    console.log(socket.id + ' disconnected');
                }
            });
        });
    }

    create(player, roomID) {
        const room = {
            players: [player]
        };
        this.rooms[roomID] = room;
        player['room'] = roomID;
    }

    join(player, roomID) {
        let room = this.rooms[roomID];
        player['room'] = roomID;
        room.players.push(player);
    }

    register(name, color, socket) {
        const player = {
            id: socket.id,
            name: name,
            color: color,
            room: null
        };
        this.players[socket.id] = player;
        return player;
    }

    leaveRoom(roomID, socket) {
        if(roomID) {
            this.rooms[roomID].players = this.rooms[roomID].players.filter((player) => {
                return player.id != socket.id;
            });
            if(!(this.rooms[roomID].players)) {
                delete this.rooms[roomID];
            }
        }
    }
}

//export to app.js for calling
module.exports = GameServer;