var BeatMap = require('./BeatMap');

class GameServer{
    
    constructor(io) {
        this.io = io;
        this.lastping = null;
        this.players = {};
        this.rooms = {};
    }

    pingClients() {
        this.lastping = Date.now();
        this.io.emit('pingTest');
        //re-ping every 10 seconds to calculate
        setTimeout(this.pingClients.bind(this), 5000);
    }

    //start monitoring io requests from each client
    start() {

        //periodically ping all clients
        this.pingClients();

        //all messages are exchanged on top of a connected socket
        this.io.on('connection', socket => {
            //set disconnect timeout to 1 min
            socket.heartbeatTimeout = 60000;
            //when this player replies to server ping
            socket.on('replyPing', () => {
                if (socket.id in this.players) {
                    const latency = (Date.now() - this.lastping) / 2;
                    const player = this.players[socket.id];
                    //player is pinged before
                    if (player.latency) {
                        this.players[socket.id].latency = (player.latency * player.pings + latency) / (player.pings + 1);
                        this.players[socket.id].pings++;
                    //player is not pinged before
                    } else {
                        this.players[socket.id].latency = latency;
                        this.players[socket.id].pings = 1;
                    }
                    console.log(socket.id + ':', 'Ping:', latency + 'ms', 'Adjusted:', this.players[socket.id].latency + 'ms');
                }
            });

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

            //when this player(leader) kicks another from room
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

            //when this player(leader) presses start
            socket.on('requestStart', callback => {
                const roomID = this.players[socket.id].room;
                this.rooms[roomID].state = 'started';
                this.rooms[roomID].readies = [];
                //broadcast to all in-room players to prepare for start
                for (let player of this.rooms[roomID].players) {
                    socket.broadcast.to(player.id).emit('start', this.rooms[roomID]);
                    //reset last game statistics
                    player.combo = 0;
                    player.score = 0;
                }
                callback(this.rooms[roomID]);
            });

            //when this player(leader) passes in beatmap
            socket.on('beatmap', (beatmap, callback) => {
                this.players[socket.id].beatmap = new BeatMap(beatmap);
                callback('beatmapReceived');
            });

            //when this player has finished loading in-game assets
            socket.on('finLoad', callback => {
                const roomID = this.players[socket.id].room;
                this.rooms[roomID].readies.push(this.players[socket.id]);
                //check all finished loading and beatmap is present
                if (this.rooms[roomID].players.length === this.rooms[roomID].readies.length) {
                    this.rooms[roomID].readies = [];
                    for (let player of this.rooms[roomID].players) {
                        player.input = '';
                        socket.broadcast.to(player.id).emit('startGame', this.rooms[roomID]);
                    }
                    callback('startGame');
                }
            });

            //when this player has pressed a key
            socket.on('playerInput', (char, callback) => {
                //pressed key is backspace
                if (char === 'Backspace' && this.players[socket.id].input !== '') {
                    this.players[socket.id].input = this.players[socket.id].input.slice(0, this.players[socket.id].input.length - 1);
                }
                else { //pressed alphabetical keys
                    this.players[socket.id].input += char;
                }
                callback(this.players[socket.id].input);
            });

            //when this player missed :(
            socket.on('playerMiss', () => {
                if (this.players[socket.id]) {
                    this.players[socket.id].beatmap.nextSpace++;
                    this.players[socket.id].beatmap.nextCaption++;
                    this.players[socket.id].input = '';
                }
            });

            //when this player has pressed jump, check player input is correct or not
            socket.on('jump', callback => {
                const roomID = this.players[socket.id].room;
                const result = this.evaluateJump(Date.now(), socket);
                if (['perfect', 'excellent', 'good', 'bad'].includes(result)) {
                    for (let player of this.rooms[roomID].players) {
                        socket.broadcast.to(player.id).emit('playerJump', socket.id);
                    }
                this.players[socket.id].input = '';
                callback(result);
                }
            });

            //when the game has started in this client
            socket.on('declareStart', startTime => {
                if (this.players[socket.id]) {
                    this.players[socket.id].start = startTime;
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
                }
            });
        });
    }

    evaluateJump(time, socket) {
        const adjustedTime = time - this.players[socket.id].latency - this.players[socket.id].start;
        const designatedTime = this.players[socket.id].beatmap.getNextSpace(true);
        const designatedCaption = this.players[socket.id].beatmap.getNextCaption(true)[0];

        if (designatedCaption === this.players[socket.id].beatmap.input) {
            if (Math.abs(adjustedTime - designatedTime) <= 0.02) {
                return 'perfect';
            }
            else if (Math.abs(adjustedTime - designatedTime) <= 0.05) {
                return 'excellent';
            }
            else if (Math.abs(adjustedTime - designatedTime) <= 0.1) {
                return 'good';
            }
            else if (Math.abs(adjustedTime - designatedTime) <= 0.3) {
                return 'bad'
            }
            else {
                return 'miss'
            }
        }

    }

    create(player, roomID) {
        const room = {
            id: roomID,
            players: [player],
            readies: [],
            leader: player,
            state: 'waiting'
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
            latency: null,
            pings: 0,
            name: name,
            color: color,
            room: null,
            combo: 0,
            score: 0,
            input: '',
            start: null,
            beatmap: null
        };
        this.players[socket.id] = player;
        return player;
    }

    leaveRoom(roomID, socket) {
        //only leave when roomID is valid
        if(roomID) {
            try {
                //indicate this player is not in any room
                this.players[socket.id].room = null;
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