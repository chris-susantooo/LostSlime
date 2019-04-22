class GameServer{
    
    constructor(io) {
        this.io = io;
        this.players = {};
        this.rooms = {};
    }

    //start monitoring io requests from each client
    start() {
        //all messages are exchanged on top of a connected socket
        this.io.on('connection', socket => {
            //when this player register itself to server
            socket.on('register', (name, color, callback) => {
                const player = this.register(name, color, socket);
                //respond to client with player as data
                callback(player);
            });

            //when this player requests to join a room with specified roomID
            socket.on('join', (roomID, callback) => {
                //if room exists, room not full, room is waiting, player registered
                if(roomID in this.rooms 
                    && this.rooms[roomID].players.length < 4 
                    && this.rooms[roomID].state === 'waiting' 
                    && socket.id in this.players)
                {
                    this.join(this.players[socket.id], roomID, socket);
                    //respond to client with room data
                    callback(this.rooms[roomID]);
                }
            });
            
            //when this player requests to make a room with specified roomID
            socket.on('create', (roomID, callback) => {
                //if no any existing room has roomID as the id
                if(!(roomID in this.rooms) && socket.id in this.players) {
                    this.create(this.players[socket.id], roomID);
                    callback(this.rooms[roomID]);
                } else {
                    callback('createFail');
                }
            });

            //when this player requests to leave current room
            socket.on('leave', callback => {
                if(socket.id in this.players) {
                    let player = this.players[socket.id];
                    this.leaveRoom(player['room'], socket);
                    callback('leaveOK');
                } else {
                    callback('leaveFail');
                }
            });

            //when this player declares ready
            socket.on('ready', callback => {
                const roomID = this.players[socket.id].room;
                if(socket.id in this.players && roomID) { //player exists and has joined room
                    this.rooms[roomID].readies.push(this.players[socket.id]);
                    for (let player of this.rooms[roomID].players) {
                        socket.broadcast.to(player.id).emit('playerReady', this.players[socket.id]);
                    }
                    callback('ReadyOK');
                }
            });

            socket.on('kick', (playerID, callback) => {
                if(playerID in this.players) {
                    let roomID = this.players[playerID].room;
                    //remove this socket from room players array
                    this.rooms[roomID].players = this.rooms[roomID].players.filter(player => {
                        return player.id !== playerID;
                    });
                    this.rooms[roomID].readies = this.rooms[roomID].readies.filter(player => {
                        return player.id !== playerID;
                    });
                    //broadcast to all in-room players that this has been kicked
                    for (let player of this.rooms[roomID].players) {
                        socket.broadcast.to(player.id).emit('playerKicked', this.rooms[roomID]);
                    }
                    //tell this socket to quit as well
                    socket.broadcast.to(playerID).emit('Kicked', this.rooms[roomID]);
                    
                    callback(this.rooms[roomID]);
                }
            });

            socket.on('requestStart', callback => {
                const roomID = this.players[socket.id].room;
                this.rooms[roomID].state = 'started';
                //broadcast to all in-room players to prepare for start
                for (let player of this.rooms[roomID].players) {
                    socket.broadcast.to(player.id).emit('start', this.rooms[roomID]);
                }
                callback(this.rooms[roomID]);
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
                }
            });
        });
    }

    create(player, roomID) {
        const room = {
            id: roomID,
            players: [player],
            readies: [],
            state: 'waiting',
            leader: player
        };
        this.rooms[roomID] = room;
        player['room'] = roomID;
    }

    join(player, roomID, socket) {
        let room = this.rooms[roomID];
        player['room'] = roomID;

        for(let otherPlayer of room.players) {
            socket.broadcast.to(otherPlayer.id).emit('playerJoin', player);
        }
        room.players.push(player);
    }

    register(name, color, socket) {
        const player = {
            id: socket.id,
            name: name,
            color: color,
            room: null,
        };
        this.players[socket.id] = player;
        return player;
    }

    leaveRoom(roomID, socket) {
        //only leave when roomID is valid
        if(roomID) {
            try {
                //remove this socket from room players array
                this.rooms[roomID].players = this.rooms[roomID].players.filter(player => {
                    return player.id !== socket.id;
                });
                this.rooms[roomID].readies = this.rooms[roomID].readies.filter(player => {
                    return player.id !== socket.id;
                });
                //if room still has other players
                if (this.rooms[roomID].players.length !== 0) {
                    //replace leader if leader was the one who left
                    if (this.rooms[roomID].leader.id === socket.id) {
                        this.rooms[roomID].leader = this.rooms[roomID].players[0];
                        //leader cannot be in ready state, remove
                        this.rooms[roomID].readies = this.rooms[roomID].readies.filter(player => {
                            return this.rooms[roomID].players[0].id !== player.id;
                        });
                    }
                    //tell every other players in room that this has left
                    for (let player of this.rooms[roomID].players) {
                        socket.broadcast.to(player.id).emit('playerLeave', this.rooms[roomID]);
                    }
                } else {
                    //no one else in room, delete empty room
                    delete this.rooms[roomID];
                }
            } catch(e) {
                delete this.rooms[roomID];
            }
        }
    }
}

//export to app.js for calling
module.exports = GameServer;