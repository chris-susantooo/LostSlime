import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const startPos = 770.5;
const endPos = 1100.5;

export default class SoloGameScene extends Scene {

    constructor() {
        super();

        this.loadVisualAssets();

        this.setupMouseEvents();

    }

    setupMouseEvents() {
        this.mouseClick = function onMouseClick(event) {
            let currentPosition = getMousePos(canvas, event);
            Object.entries(Scene.currentScene.mouseBoundingBoxes).forEach(entry => {
                if (currentPosition.x >= entry[1][0].x
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
        if(target === 'menu') {
            const title = Scene.scenes['title'];
            title.show();
        } else if (target === 'blue') {
            requestAnimationFrame(this.move.bind(this));
        }
    }

    move() {
        let object = this.entity('slide');
        object.position.x += 1;

        if (object.position.x === endPos) {
            object.position.x = startPos;
        }
        //if (object.position.x === 1022.5) {
        //    object.position.x -= 1;
        //}
        requestAnimationFrame(this.move.bind(this));
    }

    loadVisualAssets() {
        //add entity as background
        loadImage('/img/solo_game_room/forest.gif').then(image => {
            let background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //panel
        loadImage('/img/solo_game_room/panel.png').then(image => {
            let panel = new Entity(calScaledMid(image, canvas, 0, -900), image);
            this.addEntity('panel', panel, 1);
        });
        //elements
        loadImage('/img/solo_game_room/press_spacebar.png').then(image => {
            let spacebar = new Entity(calScaledMid(image, canvas, -150, -720), image);
            this.addEntity('spacebar', spacebar, 2);
        });

        //slide
        loadImage('/img/solo_game_room/counting_beat.png').then(image => {
            let slide = new Entity(calScaledMid(image, canvas, 330, -720), image);
            this.addEntity('slide', slide, 2);
        });

        //comboarea
        loadImage('/img/solo_game_room/combo.png').then(image => {
            let combospace = new Entity(calScaledMid(image, canvas, 1600, 1000), image);
            this.addEntity('combospace', combospace, 2);
        });

        loadImage('/img/solo_game_room/blue.png').then(image => {
            let blue = new Entity(calScaledMid(image, canvas, 0, 100), image);
            this.addEntity('blue', blue, 2);
            this.mouseBoundingBoxes['blue'] = [blue.position, new Vec2(blue.position.x + image.width, blue.position.y + image.height)];
        });
        
        //buttons
        loadImage('/img/solo_game_room/menu button.png').then(image => {
            let menu = new Entity(calScaledMid(image, canvas,-1600, 1000), image);
            this.addEntity('menu', menu, 2);
            this.mouseBoundingBoxes['menu'] = [menu.position, new Vec2(menu.position.x + image.width, menu.position.y + image.height)];
        });
        
    }

}