import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';
import EndSoloScene from './EndSoloScene.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const startPos = 770.5;
const endPos = 1100.5;

let score = 0;
let combo = 0;
let song;

export default class SoloGameScene extends Scene {

    constructor(name, socket, beatmap, audio) {
        super(name, socket);

        this.loadVisualAssets();

        this.setupMouseEvents();
        
        //new: audio is already loaded and passed
        song = audio;
        song.onended = function() {
            const end = new EndSoloScene();
            end.show();
        }

        //new: json infomation parsed and passed to beatmap, read BeatMap.js
        this.beatmap = beatmap;

        this.setupKeyEvents();
    }

    setupKeyEvents() {
        $(document).on('keydown', function(e) {
            if (!e.repeat) {
                if (e.keyCode === 32) {
                    Scene.currentScene.spaceBarCheck();
                }
            }
        });
    }

    spaceBarCheck() {
        let slide = this.entity('slide');
        let white = this.entity('spacebar');

        console.log(slide.position.x, white.position.x, slide.position.x - white.position.x);

        if (Math.abs(slide.position.x - white.position.x) <= 10) {
            score += 100;
            console.log('Perfect!', score);
        } else if (Math.abs(slide.position.x - white.position.x) <= 50) {
            score += 50;
            console.log('Excellent!', score);
        } else if (Math.abs(slide.position.x - white.position.x) <= 100) {
            score += 20;
            console.log('Good!', score);
        } else {
            score -= 10;
            console.log('Bad!', score);
        }
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
            song.pause();
            song.currentTime = 0;
            score = 0;
            const title = Scene.scenes['title'];
            title.show();
        } else if (target === 'start') {
            song.play();
            this.delEntity('start');
            requestAnimationFrame(this.move.bind(this));
        }
    }

    move() {
        
        this.displayScore();

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

    displayScore() {
        context.font = "48px Arial";
        context.fillStyle = "#0095DD";
        context.fillText("Score: " + score, 50, 60);
    }

    loadVisualAssets() {
        //add entity as background
        loadImage('/img/background/forest.gif').then(image => {
            let background = new Entity(new Vec2(0, 0), new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //panel
        loadImage('/img/game/panel.png').then(image => {
            let panel = new Entity(calScaledMid(image, canvas, 0, -900), new Vec2(0, 0), image);
            this.addEntity('panel', panel, 1);
        });
        //elements
        loadImage('/img/game/press_spacebar.png').then(image => {
            let spacebar = new Entity(calScaledMid(image, canvas, -150, -720), new Vec2(0, 0), image);
            this.addEntity('spacebar', spacebar, 2);
        });

        //slide
        loadImage('/img/game/counting_beat.png').then(image => {
            let slide = new Entity(calScaledMid(image, canvas, 330, -720), new Vec2(0, 0), image);
            this.addEntity('slide', slide, 3);
        });

        //comboarea
        loadImage('/img/game/combo.png').then(image => {
            let combospace = new Entity(calScaledMid(image, canvas, 1600, 1000), new Vec2(0, 0), image);
            this.addEntity('combospace', combospace, 2);
        });
        
        //buttons
        loadImage('/img/game/menu button.png').then(image => {
            let menu = new Entity(calScaledMid(image, canvas, -1600, 1000), new Vec2(0, 0), image);
            this.addEntity('menu', menu, 2);
            this.mouseBoundingBoxes['menu'] = [menu.position, new Vec2(menu.position.x + image.width, menu.position.y + image.height)];
        });
        loadImage('/img/wait_room/start button.png').then(image => {
            let start = new Entity(calScaledMid(image, canvas, 0, 0), new Vec2(0, 0), image);
            this.addEntity('start', start, 2);
            this.mouseBoundingBoxes['start'] = [start.position, new Vec2(start.position.x + image.width, start.position.y + image.height)];
        });
        
    }
}