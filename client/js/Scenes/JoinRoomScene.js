import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class JoinRoomScene extends Scene {

    constructor() {
        super();

        this.loadVisualAssets();

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
        if(target === 'join') {
            console.log('join!');
        } else if(target === 'create') {
            console.log('create!');
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
            this.addEntity('panel', panel, 1);
        });
        //buttons
        loadImage('/img/join_room/joingbutton.png').then(image => {
            let join = new Entity(calScaledMid(image, canvas, 0, -220), image);
            //override update method when mouse hover
            this.addEntity('join', join, 2);
            this.mouseBoundingBoxes['join'] = [join.position, new Vec2(join.position.x + image.width, join.position.y + image.height)];
        });
        loadImage('/img/join_room/createbutton.png').then(image => {
            let create = new Entity(calScaledMid(image, canvas, 0, -460), image);
            //override update method when mouse hover
            this.addEntity('create', create, 2);
            this.mouseBoundingBoxes['create'] = [create.position, new Vec2(create.position.x + image.width, create.position.y + image.height)];
        });
        
    }
 }