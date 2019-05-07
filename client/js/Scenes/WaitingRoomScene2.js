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

    show() {
        console.log('showhsowhsowhsw');
        let promise = new Promise(resolve => {
                if (this.loaded) {
                    console.log('fuck');
                    resolve;
                }
        })
        .then(() => {
            console.log('load la', msg);
            if(Scene.current !== this) {
                $('#canvas').off('click');
                $('#canvas').off('mousemove');
                //set current scene to this scene
                Scene.current = this;
                //setup click and mousemove events
                $('#canvas').on('click', this.mouseClick);
                $('#canvas').on('mousemove', this.mouseMove);
    
                //begin draw frames
                requestAnimationFrame(this.update.bind(this, context));
                this.loadPlayers();
                this.loadButtons();
            }
        })
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
            const loadScene = new LoadScene('load', this.socket, '/json/test2.json', '/song/test.mp3', this.room);
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

    loadPlayers() {
        let assigned = 1;
        for (let player of this.room.players) {
            if (player.id === this.room.leader.id) { //is leader
                this.slots[player.id] = 0;
                let leader = Scene.current.entity(player.color);
                console.log(leader);
                leader.pos = new Vec2(120, 277);
                leader.isHidden = false;
                //add smile to player
                let smile = Scene.current.entity('smile' + (this.slots[player.id] + 1).toString());
                smile.isHidden = false;
            } else { //is other player
                this.slots[player.id] = assigned;
                let otherplayer = Scene.current.entity(player.color);
                otherplayer.pos = new Vec2(120 + assigned * 480, 277);
                otherplayer.isHidden = false;
                //add smile to player
                let smile = Scene.current.entity('smile' + (this.slots[player.id] + 1).toString());
                smile.isHidden = false;
                assigned += 1;
            }
            if (assigned === this.room.players.length) {
               resolve(this.slots);
            }
            
            //check if player is ready
            for (let ready of this.room.readies) {
                if (ready.id === player.id) {
                    let ready = Scene.current.entity('readytext' + (this.slots[ready.id] + 1).toString());
                    ready.isHidden = false;
                }
            }
            //save player as self if socket id matches
            if (player.id === this.socket.id) {
                this.self = player;
            }
        }
    }

    loadButtons() {
            if (this.room.leader.id === this.socket.id) { //you are the leader
                let start = Scene.current.entity('start');
                start.isHidden = false;
                this.mouseBoundingBoxes['start'] = [start.pos, new Vec2(start.pos.x + start.image.width, start.pos.y + start.image.height)];
                let quit = Scene.current.entity('quit');
                quit.isHidden = false;
                this.mouseBoundingBoxes['quit'] = [quit.pos, new Vec2(quit.pos.x + quit.image.width, quit.pos.y + quit.image.height)];
                //loop through the rest players
                for (let player of this.room.players) {
                    if (player.id !== this.room.leader.id) {
                        let quit = Scene.current.entity('quit' + this.slots[player.id].toString());
                        quit.isHidden = false;
                        this.mouseBoundingBoxes['quit' + this.slots[player.id].toString()] = [quit.pos, new Vec2(quit.pos.x + quit.image.width, quit.pos.y + quit.image.height)];
                    }
                }
            } else { //you are a normal player
                for (let player of this.room.players) {
                    if (player.id === this.socket.id) {
                        this.slots[player.id]
                            let ready = Scene.current.entity('ready' + this.slots[player.id].toString());
                            ready.isHidden = false;
                            this.mouseBoundingBoxes['ready'] = [ready.pos, new Vec2(ready.pos.x + ready.image.width, ready.pos.y + ready.image.height)];
                            let quit = Scene.current.entity('quit' + this.slots[player.id].toString());
                            quit.isHidden = false;
                            this.mouseBoundingBoxes['quit'] = [quit.pos, new Vec2(quit.pos.x + image.width, quit.pos.y + image.height)];
                    }
                }
            }
    }

    loadVisualAssets() {
        const promises = [];
        for (const name of ['1', 'bg', 'blue', 'green', 'pink', 'yellow', 'icepillar', '1stplace', 'Quitbutton', 'ready_text', 'readybutton', 'start button']) {
            promises.push(loadImage('/img/wait_room/' + name + '.png'));
        }
        let index = 0;
        Promise.all(promises).then(resources => {
            const layout = new Entity(calScaledMid(resources[index], canvas), resources[index++]);
            const background = new Entity(new Vec2(0, 0), resources[index++]);
            const blue = new Entity(new Vec2(0, 300), resources[index++], true);
            const green = new Entity(new Vec2(0, 300), resources[index++], true);
            const pink = new Entity(new Vec2(0, 300), resources[index++], true);
            const yellow = new Entity(new Vec2(0, 300), resources[index++], true);
            let temp = resources[index++];
            for (let i = 0; i < 4; i++) {
                const pillar = new Entity(new Vec2(80 + i * 480, 480), temp);
                this.addEntity('pillar' + (i + 1).toString(), pillar, 2);
            }
            temp = resources[index++];
            for (let i = 0; i < 4; i++) {
                const smile = new Entity(new Vec2(250 + i * 480, 442), temp, true);
                this.addEntity('smile' + (i + 1).toString(), smile, 2);
            }
            temp = resources[index++];
            const quit = new Entity(calScaledMid(temp, canvas, 1450, -700), temp, true);
            for (let i = 1; i < 4; i++) {
                const quitplayer = new Entity(calScaledMid(temp, canvas, 1450 - i * 970, -600), temp, true);
                this.addEntity('quit' + i.toString(), quitplayer, 2);
            }
            temp = resources[index++];
            for (let i = 0; i < 3; i++) {
                const readytext = new Entity(new Vec2(480 * (i + 1) - 430, 36), temp, true);
                this.addEntity('readytext' + (i + 1).toString(), readytext, 3);
            }
            temp = resources[index++];
            for (let i = 0; i < 3; i++) {
                const ready = new Entity(calScaledMid(temp, canvas, 1450 - i * 970, -500), temp, true);
                this.addEntity('ready' + (i + 1).toString(), ready, 2);
            }
            const start = new Entity(calScaledMid(resources[index], canvas, 1450, -500), resources[index++], true);
            
            this.addEntity('layout', layout, 1);
            this.addEntity('background', background, 0);
            this.addEntity('blue', blue, 2);
            this.addEntity('green', green, 2);
            this.addEntity('pink', pink, 2);
            this.addEntity('yellow', yellow, 2);
            this.addEntity('quit', quit, 2);
            this.addEntity('start', start, 2);
            console.log('21321');
            this.loaded = true;
            console.log(this.loaded);
        });
    }
 }