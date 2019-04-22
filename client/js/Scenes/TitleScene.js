import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';
import JoinRoomScene from './JoinRoomScene.js';
import GameScene from './GameScene.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class TitleScene extends Scene {

    constructor(name, socket) {
        super(name, socket);

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
        if(target === 'pvp') {
            let join = new JoinRoomScene('join', this.socket);
            join.show();
        } else if (target === 'survival') {
            let sologame = new GameScene();
            sologame.show();
        }
    }

    loadVisualAssets() {
        //add entity as background
        loadImage('/img/background/forest.gif').then(image => {
            let background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //white filter
        loadImage('/img/title/white filter.png').then(image => {
            let filter = new Entity(calScaledMid(image, canvas), image);
            this.addEntity('filter', filter, 1);
        });
        //menu panel backtround
        loadImage('/img/title/Menu.png').then(image => {
            let menu = new Entity(calScaledMid(image, canvas, 0, -400), image);
            this.addEntity('menu', menu, 2);
        });
        //buttons
        loadImage('/img/title/pvp button.png').then(image => {
            let pvp = new Entity(calScaledMid(image, canvas, 0, -250), image);
            this.addEntity('pvp', pvp, 3);
            this.mouseBoundingBoxes['pvp'] = [pvp.position, new Vec2(pvp.position.x + image.width, pvp.position.y + image.height)];
        });
        loadImage('/img/title/HighScore button.png').then(image => {
            let highscore = new Entity(calScaledMid(image, canvas, 0, -425), image);
            this.addEntity('highscore', highscore, 3);
            this.mouseBoundingBoxes['highscore'] = [highscore.position, new Vec2(highscore.position.x + image.width, highscore.position.y + image.height)];
        });
        loadImage('/img/title/survival button.png').then(image => {
            let survival = new Entity(calScaledMid(image, canvas, 0, -600), image);
            this.addEntity('survival', survival, 3);
            this.mouseBoundingBoxes['survival'] = [survival.position, new Vec2(survival.position.x + image.width, survival.position.y + image.height)];
        });
        //title
        loadImage('/img/title/title_1.png').then(image => {
            let title = new Entity(calScaledMid(image, canvas, 0, 550), image);
            this.addEntity('title', title, 3);
        });
        //slimes
        loadImage('/img/title/char1.png').then(image => {
            let yellowSlime = new Entity(calScaledMid(image, canvas, 500, 800), image);
            this.addEntity('yellowSlime', yellowSlime, 2);
        });
        loadImage('/img/title/char2.png').then(image => {
            let pinkSlime = new Entity(calScaledMid(image, canvas, 1700, -800), image);
            //override update function to scale 2x
            pinkSlime.update = function updatePinkSlime() {
                context.drawImage(this.image, this.position.x, this.position.y, image.width * 2, image.height * 2);
            }
            this.addEntity('pinkSlime', pinkSlime, 2);
        });
        loadImage('/img/title/char3.png').then(image => {
            let greenSlime = new Entity(calScaledMid(image, canvas, -500, -800), image);
            this.addEntity('greenSlime', greenSlime, 2);
        });
        loadImage('/img/title/char4.png').then(image => {
            let blueSlime = new Entity(calScaledMid(image, canvas, -1200, 200), image);
            //override update function to scale down the slime
            blueSlime.update = function updatePinkSlime() {
                context.drawImage(this.image, this.position.x, this.position.y, image.width / 4, image.height / 4);
            }
            this.addEntity('blueSlime', blueSlime, 2);
        });
    }
 }