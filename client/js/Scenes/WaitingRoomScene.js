import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import Entity from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';
import LoadScene from './LoadScene.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class WaitingRoomScene extends Scene {

    constructor(scenename, socket, room, jsonURL, songURL) {
        super(scenename, socket);

        this.room = room;
        this.jsonURL = jsonURL;
        this.songURL = songURL;
        this.self = null;
        this.slots = {};

        this.loadVisualAssets();

        this.setupNetworkEvents();
    
        this.setupMouseEvents();
    }

    setupNetworkEvents() {
        this.socket.on('playerJoin', newPlayer => {
            this.room.players.push(newPlayer);
            this.refreshLayout();
        });
        this.socket.on('playerLeave', newRoomData => {
            this.room = newRoomData;
            this.refreshLayout();
        });
        this.socket.on('playerReady', readyPlayer => {
            this.room.readies.push(readyPlayer);
            this.refreshLayout();
        });
        this.socket.on('playerKicked', newRoomData => {
            this.room = newRoomData;
            this.refreshLayout();
        });
        this.socket.on('Kicked', () => {
            this.destroy();
            let quit = Scene.scenes['title'];
            quit.show();
        })
        this.socket.on('start', finalRoomData => {
            this.room = finalRoomData;
            this.destroy();
            const loadScene = new LoadScene('load', this.socket, this.jsonURL, this.songURL, this.room);
            loadScene.show();
        });
    }

    refreshLayout() {
        //remove previous player entities
        delete this.entities;
        this.entities = {};
        this.mouseBoundingBoxes = {};
        this.self = null;
        this.slots = {};
        //redraw players
        this.loadVisualAssets();
    }

    setupMouseEvents() {
        this.mouseClick = function onMouseClick(event) {
            let currentPosition = getMousePos(canvas, event);
            console.log(currentPosition);
            Object.entries(Scene.current.mouseBoundingBoxes).forEach(entry => {
                if(currentPosition.x >= entry[1][0].x
                    && currentPosition.x <= entry[1][1].x
                    && currentPosition.y >= entry[1][0].y
                    && currentPosition.y <= entry[1][1].y
                ) {
                    if(entry[0] === 'ready') {
                        if (!(Scene.current.room.readies.includes(self))) { //do only if this client is not ready yet
                            Scene.current.socket.emit('ready', () => {
                            Scene.current.room.readies.push(Scene.current.self);
                            Scene.current.refreshLayout();
                        });
                        }
                    } else if(entry[0] === 'quit1') {
                        Scene.current.socket.emit('kick', Scene.current.getPlayerIDFromSlot(1), newRoomData => {
                            Scene.current.room = newRoomData;
                            Scene.current.refreshLayout();
                        });
                    } else if(entry[0] === 'quit2') {
                        Scene.current.socket.emit('kick', Scene.current.getPlayerIDFromSlot(2), newRoomData => {
                            Scene.current.room = newRoomData;
                            Scene.current.refreshLayout();
                        });
                    } else if(entry[0] === 'quit3') {
                        Scene.current.socket.emit('kick', Scene.current.getPlayerIDFromSlot(3), newRoomData => {
                            Scene.current.room = newRoomData;
                            Scene.current.refreshLayout();
                        });
                    } else {
                        Scene.current.transition(entry[0]);
                    }
                }
            });    
        }
        this.mouseMove = function onMouseMove(event) {
            event.preventDefault();
            let currentPosition = getMousePos(canvas, event);
            try {
                Object.entries(Scene.current.mouseBoundingBoxes).forEach(entry => {
                    if(currentPosition.x >= entry[1][0].x
                        && currentPosition.x <= entry[1][1].x
                        && currentPosition.y >= entry[1][0].y
                        && currentPosition.y <= entry[1][1].y
                    ) {
                        canvas.style.cursor = 'pointer';
                        throw BreakException;
                    } else {
                        canvas.style.cursor = 'default';
                    }
                });    
            } catch(e) {
                //nothing to catch, we just want to break
            }
        }
    }

    transition(target) { //chaange here after debug
        if (target === 'start' && this.room.readies.length + 1 === this.room.players.length && this.room.players.length >= 1) {
            this.socket.emit('requestStart', finalRoomData => {
                this.room = finalRoomData;
                this.destroy();
                const loadScene = new LoadScene('load', this.socket, this.jsonURL, this.songURL, this.room);
                loadScene.show();
            });
        } else if (target === 'quit') {
            //send leave request to server
            this.socket.emit('leave', response => {
                if(response) {
                    this.destroy();
                    let quit = Scene.scenes['title'];
                    quit.show();
                }
            });
        }
    }

    getPlayerIDFromSlot(slotNumber) {
        let playerID = null;
        Object.entries(this.slots).forEach(entry => {
            if(entry[1] === slotNumber) {
                playerID = entry[0];
            }
        });
        return playerID;
    }

    loadPlayers(resolve) {
        let assigned = 1;
        for (let player of this.room.players) {
            loadImage('/img/wait_room/' + player.color + '.png').then(image => {
                if(player.id === this.room.leader.id) { //is leader
                    this.slots[player.id] = 0;
                    let leader = new Entity(new Vec2(120, 277), image);
                    this.addEntity('leader', leader, 2);
                    //add smile to player
                    //loadImage('/img/endscene/1stplace.png').then(image => {
                    //    let smile = new Entity(new Vec2(210, 442), image);
                    //    this.addEntity('slime0', smile, 3);
                    //})
                } else { //is other player
                    this.slots[player.id] = assigned;
                    let otherplayer = new Entity(new Vec2(120 + assigned * 480, 277), image);
                    this.addEntity('player' + assigned.toString(), otherplayer, 2);
                    //add smile to player
                    //loadImage('/img/endscene/1stplace.png').then(image => {
                    //    let smile = new Entity(new Vec2(210 + assigned * 480, 442), image);
                    //    this.addEntity('slime' + assigned.toString(), smile, 3);
                    //})
                    assigned += 1;
                }
                if(assigned === this.room.players.length) {
                    resolve(this.slots);
                }
            });
            
            //check if player is ready
            for (let ready of this.room.readies) {
                if(ready.id === player.id) {
                    loadImage('/img/wait_room/ready_text.png').then(image => {
                        let ready = new Entity(new Vec2(480 * (this.slots[player.id] + 1) - 430, 36), image);
                        this.addEntity('ready' + this.slots[player.id].toString(), ready, 4);
                    });
                }
            }
            //save player as self if socket id matches
            if(player.id === this.socket.id) {
                this.self = player;
            }
        }
    }

    loadButtons(slots) {
        if(this.room.leader.id === this.socket.id) { //you are the leader
            loadImage('/img/wait_room/start button.png').then(image => {
                let start = new Entity(calScaledMid(image, canvas, 1450, -500), image);
                this.addEntity('start', start, 2);
                this.mouseBoundingBoxes['start'] = [start.pos, new Vec2(start.pos.x + image.width, start.pos.y + image.height)];
            });
            loadImage('/img/wait_room/Quitbutton.png').then(image => {
                let quit = new Entity(calScaledMid(image, canvas, 1450, -700), image);
                this.addEntity('quit', quit, 2);
                this.mouseBoundingBoxes['quit'] = [quit.pos, new Vec2(quit.pos.x + image.width, quit.pos.y + image.height)];
            });
            //loop through the rest players
            Object.keys(slots).forEach(id => {
                if(id !== this.room.leader.id) {
                    const i = slots[id];
                    loadImage('/img/wait_room/Quitbutton.png').then(image => {
                        let quit = new Entity(calScaledMid(image, canvas, 1450 - i * 970, -600), image);
                        this.addEntity('quit' + i.toString(), quit, 2);
                        this.mouseBoundingBoxes['quit' + i.toString()] = [quit.pos, new Vec2(quit.pos.x + image.width, quit.pos.y + image.height)];
                    });
                }
            });
        } else { //you are a normal player
            Object.keys(slots).forEach(id => {
                if(id === this.socket.id) {
                    const i = slots[id];
                    loadImage('/img/wait_room/readybutton.png').then(image => {
                        let ready = new Entity(calScaledMid(image, canvas, 1450 - i * 970, -500), image);
                        this.addEntity('ready', ready, 2);
                        this.mouseBoundingBoxes['ready'] = [ready.pos, new Vec2(ready.pos.x + image.width, ready.pos.y + image.height)];
                    });
                    loadImage('/img/wait_room/Quitbutton.png').then(image => {
                        let quit = new Entity(calScaledMid(image, canvas, 1450 - i * 970, -700), image);
                        this.addEntity('quit', quit, 2);
                        this.mouseBoundingBoxes['quit'] = [quit.pos, new Vec2(quit.pos.x + image.width, quit.pos.y + image.height)];
                    });
                }
            });
        }
    }

    loadVisualAssets() {
        //add entity as background
        loadImage('/img/wait_room/bg.png').then(image => {
            let background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //white filter
        loadImage('/img/wait_room/1.png').then(image => {
            let filter = new Entity(calScaledMid(image, canvas), image);
            this.addEntity('filter', filter, 1);
        });
        //load slimes, save client player pos
        let promise = new Promise(resolve => {
            this.loadPlayers(resolve);
        }).then(resolve => {
            this.loadButtons(resolve);
        });
        //pillars
        loadImage('/img/wait_room/icepillar.png').then(image => {
            let ice1 = new Entity(calScaledMid(image, canvas, 1450, -50), image);
            let ice2 = new Entity(calScaledMid(image, canvas, 500, -50), image);
            let ice3 = new Entity(calScaledMid(image, canvas, -500, -50), image);
            let ice4 = new Entity(calScaledMid(image, canvas, -1450, -50), image);
            this.addEntity('ice1', ice1, 3);
            this.addEntity('ice2', ice2, 3);
            this.addEntity('ice3', ice3, 3);
            this.addEntity('ice4', ice4, 3);
        });
    }
 }