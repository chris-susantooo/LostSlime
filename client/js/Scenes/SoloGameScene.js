import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class GameScene extends Scene {

    constructor() {
        super();

        this.loadVisualAssets();

        this.setupMouseEvents();

        let slide = this.entity('slide');
        this.movingSlide(slide);
    }

    setupMouseEvents() {
        this.mouseClick = function onMouseClick(event) {
            let currentPosition = getMousePos(canvas, event);
            let boundingBoxes = event.data.extra;
            Object.entries(boundingBoxes).forEach(entry => {
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
        if(target === 'menu') {
            const title = Scene.scenes['title'];
            title.show();
        }
    }

    movingSlide(slide) {

        let maxpos = 330;
        let minpos = -330;
        let time = 3000; //time of 1 cycle
        let velocity = (maxpos-minpos)/time;
        
        //let posX = getX();
        //if (posX === minpos) {
        //    setPosition(maxpos);
        //}
        
        //this.position.x = posX - velocity;

        function getX() {
            return this.position.x;
        }

        function setPosition(posX) {
            this.position.x = posX;
        }

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

        //buttons
        loadImage('/img/solo_game_room/menu button.png').then(image => {
            let menu = new Entity(calScaledMid(image, canvas,-1600, 1000), image);
            this.addEntity('menu', menu, 2);
            this.mouseBoundingBoxes['menu'] = [menu.position, new Vec2(menu.position.x + image.width, menu.position.y + image.height)];
        });
        
    }

}