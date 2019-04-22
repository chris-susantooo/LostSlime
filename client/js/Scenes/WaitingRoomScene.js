import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';
import TitleScene from './TitleScene.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class WaitingRoomScene extends Scene {

    constructor(scenename, socket, roomname, players = null) { //players = null if room is created instead of joined
        super(scenename, socket);

        this.loadVisualAssets();
        //setup mouse events
        this.setupMouseEvents();
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
        if(target === 'start') {
            console.log('start!');
        } else if (target === 'quit') {
            let quit = new TitleScene();
            quit.show();
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
        //elements
        loadImage('/img/wait_room/blue.png').then(image => {
            let blue = new Entity(calScaledMid(image, canvas, 1450, 300), image);
            this.addEntity('blue', blue, 2);
        });
        loadImage('/img/wait_room/pink.png').then(image => {
            let pink = new Entity(calScaledMid(image, canvas, 500, 300), image);
            this.addEntity('pink', pink, 2);
        });
        loadImage('/img/wait_room/yellow.png').then(image => {
            let yellow = new Entity(calScaledMid(image, canvas, -500, 300), image);
            this.addEntity('yellow', yellow, 2);
        });
        loadImage('/img/wait_room/green.png').then(image => {
            let green = new Entity(calScaledMid(image, canvas, -1450, 300), image);
            this.addEntity('green', green, 2);
        });
        loadImage('/img/wait_room/icepillar.png').then(image => {
            let ice1 = new Entity(calScaledMid(image, canvas, 1450, -50), image);
            this.addEntity('ice1', ice1, 2);
        });
        loadImage('/img/wait_room/icepillar.png').then(image => {
            let ice2 = new Entity(calScaledMid(image, canvas, 500, -50), image);
            this.addEntity('ice2', ice2, 2);
        });
        loadImage('/img/wait_room/icepillar.png').then(image => {
            let ice3 = new Entity(calScaledMid(image, canvas, -500, -50), image);
            this.addEntity('ice3', ice3, 2);
        });
        loadImage('/img/wait_room/icepillar.png').then(image => {
            let ice4 = new Entity(calScaledMid(image, canvas, -1450, -50), image);
            this.addEntity('ice4', ice4, 2);
        });
        //buttons
        loadImage('/img/wait_room/start button.png').then(image => {
            let start = new Entity(calScaledMid(image, canvas, 1450, -500), image);
            //override update method when mouse hover
            this.addEntity('start', start, 2);
            this.mouseBoundingBoxes['start'] = [start.position, new Vec2(start.position.x + image.width, start.position.y + image.height)];
        });
        loadImage('/img/wait_room/Quitbutton.png').then(image => {
            let quit = new Entity(calScaledMid(image, canvas, 1450, -700), image);
            //override update method when mouse hover
            this.addEntity('quit', quit, 2);
            this.mouseBoundingBoxes['quit'] = [quit.position, new Vec2(quit.position.x + image.width, quit.position.y + image.height)];
        });
    }
 }