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
            console.log(getMousePos(canvas, event));
        }
        this.mouseMove = function onMouseMove(event) {
            console.log(getMousePos(canvas, event));
        }
    }

    loadVisualAssets() {
        //add entity as background
        loadImage('/img/join_room/bg.gif').then(image => {
            let background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //panel background
        loadImage('/img/join_room/inputrmno.png').then(image => {
            let panel = new Entity(calScaledMid(image, canvas, 0, -80), image);
            this.addEntity('panel', panel, 1);
        });
        //buttons
        loadImage('/img/join_room/joinbutton.png').then(image => {
            let join = new Entity(calScaledMid(image, canvas, 0, -220), image);
            //override update method when mouse hover
            this.addEntity('join', join, 2);
        });
        loadImage('/img/join_room/createbutton.png').then(image => {
            let create = new Entity(calScaledMid(image, canvas, 0, -460), image);
            //override update method when mouse hover
            this.addEntity('create', create, 2);
        });
        
    }
 }