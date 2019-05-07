import Scene from '../Scene.js';
import { loadImage, loadJSON, loadAudio } from '../loaders.js';
import Entity from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';

const canvas = document.getElementById('canvas');

export default class HighScoreGameScene extends Scene {

    constructor(name, socket, beatmap, audio) {
        super(name);

        this.socket = socket;
        this.beatmap = beatmap;
        this.audio = audio;
        this.audioStart = null;

        this.loadVisualAssets();
        this.setupMouseEvents();
    }

    setupMouseEvents() {
        this.mouseClick = function onMouseClick(event) {
            let currentPosition = getMousePos(canvas, event);
            Object.entries(Scene.current.mouseBoundingBoxes).forEach(entry => {
                if (currentPosition.x >= entry[1][0].x &&
                    currentPosition.x <= entry[1][1].x &&
                    currentPosition.y >= entry[1][0].y &&
                    currentPosition.y <= entry[1][1].y
                ) {
                    Scene.current.transition(entry[0]);
                }
            });
        }

        this.mouseMove = function onMouseMove(event) {
            event.preventDefault();
            let currentPosition = getMousePos(canvas, event);
            try {
                Object.entries(Scene.current.mouseBoundingBoxes).forEach(entry => {
                    if (currentPosition.x >= entry[1][0].x &&
                        currentPosition.x <= entry[1][1].x &&
                        currentPosition.y >= entry[1][0].y &&
                        currentPosition.y <= entry[1][1].y
                    ) {
                        canvas.style.cursor = 'pointer';
                        throw BreakException;
                    } else {
                        canvas.style.cursor = 'default';
                    }
                });
            } catch (e) {

            }
        }
    }

    transition(target) {
        if (target === 'menu') {
            this.audio.src = '';
            this.destroy();
            const title = Scene.scenes['title'];
            title.show();
        }
    }

    startGame() {
        this.audio.play();
        this.audioStart = Date.now()
    }

    loadVisualAssets() {
        //add backgrounds
        loadImage('/img/background/forest.gif').then(image => {
            let background1 = new Entity(new Vec2(0, 0), image);
            this.addEntity('forest', background1, 0);
        });
        loadImage('/img/background/sky.gif').then(image => {
            let background2 = new Entity(new Vec2(0, 0), image, true);
            this.addEntity('sky', background2, 0);
        });
        loadImage('/img/background/sky2.gif').then(image => {
            let background3 = new Entity(new Vec2(0, 0), image, true);
            this.addEntity('sky2', background3, 0);
        });
        loadImage('/img/background/sky3.gif').then(image => {
            let background4 = new Entity(new Vec2(0, 0), image, true);
            this.addEntity('sky3', background4, 0);
        });
        loadImage('/img/background/space.gif').then(image => {
            let background5 = new Entity(new Vec2(0, 0), image, true);
            this.addEntity('space', background5, 0);
        });
        //panel
        loadImage('/img/game/panel.png').then(image => {
            let panel = new Entity(calScaledMid(image, canvas, 0, -850), image);
            this.addEntity('panel', panel, 1);
        });
        //elements
        loadImage('/img/game/press_spacebar.png').then(image => {
            let spacebar = new Entity(calScaledMid(image, canvas, -150, -675), image);
            this.addEntity('spacebar', spacebar, 2);
        });

        //slide
        loadImage('/img/game/counting_beat.png').then(image => {
            let slide = new Entity(calScaledMid(image, canvas, 330, -670), image);
            this.addEntity('slide', slide, 2);
        });

        //comboarea
        loadImage('/img/game/combo.png').then(image => {
            let combospace = new Entity(new Vec2(10, 300), image);
            this.addEntity('combospace', combospace, 2);
        });

        loadImage('/img/game/slimes/blue.png').then(image => {
            let blue = new Entity(calScaledMid(image, canvas, 0, 100), image);
            this.addEntity('blue', blue, 2);
            this.mouseBoundingBoxes['blue'] = [blue.pos, new Vec2(blue.pos.x + image.width, blue.pos.y + image.height)];
        });

        //buttons
        loadImage('/img/game/menu button.png').then(image => {
            let menu = new Entity(new Vec2(10, 10), image);
            this.addEntity('menu', menu, 2);
            this.mouseBoundingBoxes['menu'] = [menu.pos, new Vec2(menu.pos.x + image.width, menu.pos.y + image.height)];
        });
    }
}