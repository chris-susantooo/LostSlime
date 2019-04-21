import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, calScaledPos, getMousePos } from '../util.js';
import RoomScene from './RoomScene.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class JoinRoomScene extends Scene {

    constructor(socket) {
        super();

        this.loadVisualAssets();

        this.setupMouseEvents();

        this.roomname = '';
        this.setupKeyEvents();
    }

    setupKeyEvents() {
        $(document).on('keydown', function(e) {
            if(!e.repeat) {
                if(e.key === 'Backspace') {
                    Scene.currentScene.roomname = Scene.currentScene.roomname.slice(0, -1);
                    return
                } else if(Scene.currentScene.roomname.length <= 12 && e.key !== 'Control' && e.key !== 'Alt'
                    && e.key !== 'Shift' && e.key !== 'Delete' && e.key !== 'Tab' && e.Key !== 'CapsLock') {
                    Scene.currentScene.roomname += e.key;
                }
            }
        });
    }

    setupMouseEvents() {
        this.mouseClick = function onMouseClick(event) {
            let currentPosition = getMousePos(canvas, event);
            let boundingBoxes = event.data.extra;
            Object.entries(boundingBoxes).forEach(entry => {
                if(currentPosition.x >= entry[1][0].x
                    && currentPosition.x <= entry[1][1].x
                    && currentPosition.y >= entry[1][0].y
                    && currentPosition.y <= entry[1][1].y
                ) {
                    Scene.currentScene.transition(entry[0]);
                }
            });    
        }
        this.mouseMove = function onMouseMove(event) {
            event.preventDefault();
            let currentPosition = getMousePos(canvas, event);
            let boundingBoxes = event.data.extra;
            try {
                Object.entries(boundingBoxes).forEach(entry => {
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
        $(document).off('keydown');
        if(target === 'join') {
            const room = new RoomScene(this.socket, this.roomname);
            room.show();
        } else if(target === 'create') {
            console.log('create', this.roomname, 'room!');
        }
    }

    loadVisualAssets() {
        //add entity as background
        loadImage('/img/join_room/bg.gif').then(image => {
            let background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //panel background
        loadImage('/img/join_room/inputroomnumber.png').then(image => {
            let panel = new Entity(calScaledMid(image, canvas, 0, -80), image);
            //override update method to paint room name text as well
            panel.update = function updatePanel() {
                context.drawImage(this.image, this.position.x, this.position.y);
                context.font = '40px Georgia';
                let textLocation = calScaledPos(canvas, 1000, 560);
                context.fillText(Scene.currentScene.roomname, textLocation.x, textLocation.y);
            }
            this.addEntity('panel', panel, 1);
        });
        //buttons
        loadImage('/img/join_room/joingbutton.png').then(image => {
            let join = new Entity(calScaledMid(image, canvas, 0, -220), image);
            this.addEntity('join', join, 2);
            this.mouseBoundingBoxes['join'] = [join.position, new Vec2(join.position.x + image.width, join.position.y + image.height)];
        });
        loadImage('/img/join_room/createbutton.png').then(image => {
            let create = new Entity(calScaledMid(image, canvas, 0, -400), image);
            this.addEntity('create', create, 2);
            this.mouseBoundingBoxes['create'] = [create.position, new Vec2(create.position.x + image.width, create.position.y + image.height)];
        });
        
    }
 }