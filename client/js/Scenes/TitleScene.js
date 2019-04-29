import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';
import ChooseSongScene from './ChooseSongScene.js';

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
            const currentPosition = getMousePos(canvas, event);
            Object.entries(Scene.current.mouseBoundingBoxes).forEach(entry => {
                if(currentPosition.x >= entry[1][0].x
                    && currentPosition.x <= entry[1][1].x
                    && currentPosition.y >= entry[1][0].y
                    && currentPosition.y <= entry[1][1].y
                ) {
                    Scene.current.transition(entry[0]);
                }
            });    
        }
        this.mouseMove = function onMouseMove(event) {
            event.preventDefault();
            const currentPosition = getMousePos(canvas, event);
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

            }
        }
    }

    transition(target) {
        const choose = null;
        if(target === 'pvp') {
            choose = new ChooseSongScene('choose', this.socket, 'multiPlayer');
            choose.show();
        } else if (target === 'survival') {
            choose = new ChooseSongScene('choose', this.socket, 'singlePlayer');
            choose.show();
        }
    }

    loadVisualAssets() {
        //add entity as background
        loadImage('/img/background/forest.gif').then(image => {
            const background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //white filter
        loadImage('/img/title/white filter.png').then(image => {
            const filter = new Entity(calScaledMid(image, canvas), image);
            this.addEntity('filter', filter, 1);
        });
        //menu panel backtround
        loadImage('/img/title/Menu.png').then(image => {
            const menu = new Entity(calScaledMid(image, canvas, 0, -400), image);
            this.addEntity('menu', menu, 2);
        });
        //buttons
        loadImage('/img/title/pvp button.png').then(image => {
            const pvp = new Entity(calScaledMid(image, canvas, 0, -250), image);
            this.addEntity('pvp', pvp, 3);
            this.mouseBoundingBoxes['pvp'] = [pvp.pos, new Vec2(pvp.pos.x + image.width, pvp.pos.y + image.height)];
        });
        loadImage('/img/title/HighScore button.png').then(image => {
            const highscore = new Entity(calScaledMid(image, canvas, 0, -425), image);
            this.addEntity('highscore', highscore, 3);
            this.mouseBoundingBoxes['highscore'] = [highscore.pos, new Vec2(highscore.pos.x + image.width, highscore.pos.y + image.height)];
        });
        loadImage('/img/title/survival button.png').then(image => {
            const survival = new Entity(calScaledMid(image, canvas, 0, -600), image);
            this.addEntity('survival', survival, 3);
            this.mouseBoundingBoxes['survival'] = [survival.pos, new Vec2(survival.pos.x + image.width, survival.pos.y + image.height)];
        });
        //title
        loadImage('/img/title/title_1.png').then(image => {
            const title = new Entity(calScaledMid(image, canvas, 0, 550), image);
            this.addEntity('title', title, 3);
        });
        //slimes
        loadImage('/img/title/char1.png').then(image => {
            const yellowSlime = new Entity(calScaledMid(image, canvas, 500, 800), image);
            this.addEntity('yellowSlime', yellowSlime, 2);
        });
        loadImage('/img/title/char2.png').then(image => {
            const pinkSlime = new Entity(calScaledMid(image, canvas, 1700, -800), image);
            //override update function to scale 2x
            pinkSlime.draw = function drawSlime() {
                context.drawImage(this.image, this.pos.x, this.pos.y, image.width * 2, image.height * 2);
            }
            this.addEntity('pinkSlime', pinkSlime, 2);
        });
        loadImage('/img/title/char3.png').then(image => {
            const greenSlime = new Entity(calScaledMid(image, canvas, -500, -800), image);
            this.addEntity('greenSlime', greenSlime, 3);
        });
        loadImage('/img/title/char4.png').then(image => {
            const blueSlime = new Entity(calScaledMid(image, canvas, -1200, 200), image);
            //override update function to scale down the slime
            blueSlime.draw = function drawSlime() {
                context.drawImage(this.image, this.pos.x, this.pos.y, image.width / 4, image.height / 4);
            }
            this.addEntity('blueSlime', blueSlime, 2);
        });
    }
 }