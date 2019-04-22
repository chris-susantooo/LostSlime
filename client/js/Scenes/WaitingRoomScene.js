import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class WaitingRoomScene extends Scene {

    constructor(scenename, socket, room) {
        super(scenename, socket);

        this.room = room;
        this.self = null;
        this.assignedPlayers = 1;

        console.log(this.room);

        this.loadVisualAssets();

        this.setupNetworkEvents();
    
        this.setupMouseEvents();
    }

    setupNetworkEvents() {
        this.socket.on('playerJoin', newPlayer => {
            this.room.players.push(newPlayer);
            //remove previous player entities
            delete this.entities;
            this.entities = {};
            this.mouseBoundingBoxes = {};
            this.assignedPlayers = 1;
            //redraw players
            this.loadVisualAssets();
            console.log(this.mouseBoundingBoxes);
        });
        this.socket.on('playerLeave', newRoomData => {
            this.room = newRoomData;
            //remove previous player entities
            delete this.entities;
            this.entities = {};
            this.mouseBoundingBoxes = {};
            this.assignedPlayers = 1;
            //redraw players
            this.loadVisualAssets();
            console.log(this.mouseBoundingBoxes);
        });
    }

    setupMouseEvents() {
        this.mouseClick = function onMouseClick(event) {
            let currentPosition = getMousePos(canvas, event);
            Object.entries(Scene.currentScene.mouseBoundingBoxes).forEach(entry => {
                if(currentPosition.x >= entry[1][0].x
                    && currentPosition.x <= entry[1][1].x
                    && currentPosition.y >= entry[1][0].y
                    && currentPosition.y <= entry[1][1].y
                ) {
                    if(entry[0] === 'ready') {
                        
                    } else if(entry[0] === 'quit1') {

                    } else if(entry[0] === 'quit2') {

                    } else if(entry[0] === 'quit3') {

                    } else {
                        Scene.currentScene.transition(entry[0]);
                    }
                }
            });    
        }
        this.mouseMove = function onMouseMove(event) {
            event.preventDefault();
            let currentPosition = getMousePos(canvas, event);
            try {
                Object.entries(Scene.currentScene.mouseBoundingBoxes).forEach(entry => {
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

            }
        }
    }

    transition(target) {
        if(target === 'start') {
            console.log('start!');
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

    loadPlayers(resolve) {
        let playerPosNum = null;
        for (let player of this.room.players) {
            loadImage('/img/wait_room/' + player.color + '.png').then(image => {
                console.log('isPlayerSelf:', player.id === this.socket.id);
                console.log('isPlayerLeader:', player.id === this.room.leader.id);
                if(player.id === this.socket.id) { //this player is ourselves
                    this.self = player;
                    playerPosNum = this.assignedPlayers;
                }
                if (player.id === this.room.leader.id) {
                    let leader = new Entity(calScaledMid(image, canvas, 1450, 300), image);
                    this.addEntity('leader', leader, 2);

                } else {
                    let otherplayer = new Entity(calScaledMid(image, canvas, 1500 - 1000 * this.assignedPlayers, 300), image);
                    this.addEntity('player' + this.assignedPlayers.toString(), otherplayer, 2);
                    this.assignedPlayers += 1;
                }
                if(this.assignedPlayers === this.room.players.length) {
                    resolve(playerPosNum);
                }   
            });
        }
    }

    loadButtons(playerPosNum) {

        if(this.self.id === this.room.leader.id) { //this client is leader
            //buttons
            loadImage('/img/wait_room/start button.png').then(image => {
                let start = new Entity(calScaledMid(image, canvas, 1450, -500), image);
                this.addEntity('start', start, 2);
                this.mouseBoundingBoxes['start'] = [start.position, new Vec2(start.position.x + image.width, start.position.y + image.height)];
            });
            loadImage('/img/wait_room/Quitbutton.png').then(image => {
                let quit = new Entity(calScaledMid(image, canvas, 1450, -700), image);
                this.addEntity('quit', quit, 2);
                this.mouseBoundingBoxes['quit'] = [quit.position, new Vec2(quit.position.x + image.width, quit.position.y + image.height)];
            });
            for(let i = 1; i < this.assignedPlayers; i++) {
                loadImage('/img/wait_room/Quitbutton.png').then(image => {
                    let quit = new Entity(calScaledMid(image, canvas, 1450 - i * 970, -600), image);
                    this.addEntity('quit' + i.toString(), quit, 2);
                    this.mouseBoundingBoxes['quit' + i.toString()] = [quit.position, new Vec2(quit.position.x + image.width, quit.position.y + image.height)];
                });
            }
        } else { //this client is ordinary player
            loadImage('/img/wait_room/readybutton.png').then(image => {
                let ready = new Entity(calScaledMid(image, canvas, 1450 - playerPosNum * 970, -500), image);
                this.addEntity('ready', ready, 2);
                this.mouseBoundingBoxes['ready'] = [ready.position, new Vec2(ready.position.x + image.width, ready.position.y + image.height)];
            });
            loadImage('/img/wait_room/Quitbutton.png').then(image => {
                let quit = new Entity(calScaledMid(image, canvas, 1450 - playerPosNum * 970, -700), image);
                this.addEntity('quit', quit, 2);
                this.mouseBoundingBoxes['quit'] = [quit.position, new Vec2(quit.position.x + image.width, quit.position.y + image.height)];
            });
        }
    }

    loadVisualAssets() {
        //add entity as background
        loadImage('/img/wait_room/bg.gif').then(image => {
            let background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //white filter
        loadImage('/img/wait_room/1.png').then(image => {
            let filter = new Entity(calScaledMid(image, canvas), image);
            this.addEntity('filter', filter, 1);
        });
        //load slimes, save client player position
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
            this.addEntity('ice1', ice1, 2);
            this.addEntity('ice2', ice2, 2);
            this.addEntity('ice3', ice3, 2);
            this.addEntity('ice4', ice4, 2);
        }); //buttons
    }
 }