import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import WaitingRoomScene from './WaitingRoomScene.js';
import ChooseSongScene from '/ChooseSongScene.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class JoinRoomScene extends Scene {

    constructor(name, socket, jsonURL, songURL) {
        super(name, socket);

        this.loadVisualAssets();

        this.setupMouseEvents();

        this.jsonURL = jsonURL;
        this.songURL = songURL;
        this.playername = '';
        this.roomname = '';
        this.color = 'blue';
        this.focus = 'playername';
        this.setupKeyEvents();
    }

    setupKeyEvents() {
        $(document).on('keydown', function(e) {
            if(!e.repeat) {
                if(e.key === 'Backspace') {
                    if(Scene.current.focus === 'playername') { //player name field in focus
                        Scene.current.playername = Scene.current.playername.slice(0, -1);
                    } else { //room name field in focus
                        Scene.current.roomname = Scene.current.roomname.slice(0, -1);
                    }
                    return

                } else if (e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift'
                    && e.key !== 'Delete' && e.key !== 'Tab' && e.Key !== 'CapsLock') {
                    if (Scene.current.focus === 'playername' && Scene.current.playername.length <= 12) {
                        Scene.current.playername += e.key;
                    } else if (Scene.current.focus === 'roomname' && Scene.current.roomname.length <= 12) {
                        Scene.current.roomname += e.key;
                    }
                }
            }
        });
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
                    if(entry[0] === 'playername' || entry[0] === 'roomname') {
                        Scene.current.focus = entry[0];
                    } else if(entry[0] === 'slime'){
                        Scene.current.changeColor();
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
                        if (entry[0] === 'playername' || entry[0] === 'roomname') {
                            canvas.style.cursor = 'text';
                        } else {
                            canvas.style.cursor = 'pointer';
                        }
                        throw BreakException;
                    } else {
                        canvas.style.cursor = 'default';
                    }
                });    
            } catch(e) {
                //we do nothing because forEach has no break
                //we have no choice but to raise an exception to achieve break
            }
        }
    }

    transition(target) {
        if((target === 'join' || target === 'create') && this.playername !== '' && this.roomname !== '') {
            //send join/create request to server
            this.socket.emit('register', this.playername, this.color, player => {
                if(player) {
                    this.socket.emit(target, this.roomname, response => {
                        if(response && response !== 'createFail') { //response is an array of existing players in the room
                            this.destroy();
                            if(target === 'join') {
                                const room = new WaitingRoomScene('room', this.socket, response, this.jsonURL, this.songURL);
                                room.show();
                            } else { //create room, no other players in the room yet so send self
                                const room = new WaitingRoomScene('room', this.socket, response, this.jsonURL, this.songURL);
                                room.show();
                            }
                        }
                    });
                }
            });
        } else if (target === 'arrow') {
            this.destroy();
            const choose = new ChooseSongScene('choose', this.socket, 'multiPlayer');
            choose.show();
        }
    }

    changeColor() {
        switch(this.color) {
            case 'blue':
                this.color = 'green';
                break;
            case 'green':
                this.color = 'pink';
                break;
            case 'pink':
                this.color = 'yellow';
                break;
            case 'yellow':
                this.color = 'blue';
                break;
        }

        loadImage('/img/join_room/' + this.color + '_player.png').then(image => {
            this.entity('slime').image = image;
        });
    }

    loadVisualAssets() {
        //add entity as background
        loadImage('/img/join_room/bg.gif').then(image => {
            let background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //panel background
        loadImage('/img/join_room/inputname&roomnumber.png').then(image => {
            let panel = new Entity(calScaledMid(image, canvas, 0, -80), image);
            //override update method to paint room name text as well
            panel.draw = function drawPanel() {
                context.fillStyle = "#000000"; //set canvas text color to black
                context.drawImage(this.image, this.pos.x, this.pos.y);
                context.font = '50px Annie Use Your Telescope';
                context.textAlign = "start";
                const playernameLocation = new Vec2(910, 480);
                context.fillText(Scene.current.playername, playernameLocation.x, playernameLocation.y);
                const roomnameLocation = new Vec2(910, 550);
                context.fillText(Scene.current.roomname, roomnameLocation.x, roomnameLocation.y);
            }
            this.addEntity('panel', panel, 1);
            //add bounding boxes for the playername field and roomname field
            this.mouseBoundingBoxes['playername'] = [new Vec2(900, 435), new Vec2(1160, 490)];
            this.mouseBoundingBoxes['roomname'] = [new Vec2(900, 510), new Vec2(1160, 560)];
        });
        //buttons
        loadImage('/img/join_room/joingbutton.png').then(image => {
            let join = new Entity(calScaledMid(image, canvas, 0, -220), image);
            this.addEntity('join', join, 2);
            this.mouseBoundingBoxes['join'] = [join.pos, new Vec2(join.pos.x + image.width, join.pos.y + image.height)];
        });
        loadImage('/img/join_room/createbutton.png').then(image => {
            let create = new Entity(calScaledMid(image, canvas, 0, -400), image);
            this.addEntity('create', create, 2);
            this.mouseBoundingBoxes['create'] = [create.pos, new Vec2(create.pos.x + image.width, create.pos.y + image.height)];
        });
        loadImage('/img/join_room/backarrow.png').then(image => {
            let arrow = new Entity(calScaledMid(image, canvas, 500, 300), image);
            this.addEntity('arrow', arrow, 2);
            this.mouseBoundingBoxes['arrow'] = [arrow.pos, new Vec2(arrow.pos.x + image.width, arrow.pos.y + image.height)];
        });

        loadImage('/img/join_room/blue_player.png').then(image => {
            let slime = new Entity(calScaledMid(image, canvas, image.width / 1.5, 550), image);
            this.addEntity('slime', slime, 2);
            //override update function to scale 2x
            slime.draw = function drawSlimeColor() {
                context.drawImage(this.image, this.pos.x, this.pos.y, this.image.width * 1.5, this.image.height * 1.5);
            }
            this.mouseBoundingBoxes['slime'] = [slime.pos, new Vec2(slime.pos.x + image.width * 1.5, slime.pos.y + image.height * 1.5)];
        });
    }
}