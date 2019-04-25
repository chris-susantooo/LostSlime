import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos, getCenterPos } from '../util.js';
import EndSoloScene from './EndSoloScene.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const startPos = 770.5;
const endPos = 1100.5;

let score = 0;
let moveCount = [0, 0, 0, 0, 0];
let lastMove = '';
let song;

export default class SoloGameScene extends Scene {

    constructor(name, socket, beatmap, audio) {
        super(name, socket);

        this.loadVisualAssets();

        this.setupMouseEvents();
        
        //new: audio is already loaded and passed
        song = audio;
        song.onended = function() {
            const end = new EndSoloScene(score, moveCount);
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

    //checking when spacebar is pressed, the distance difference between the slide and the white space
    spaceBarCheck() {
        let slide = this.entity('slide');
        let white = this.entity('spacebar');

        let slideMid = getCenterPos(slide.image, slide);
        let whiteMid = getCenterPos(white.image, white);

        if (Math.abs(slideMid - whiteMid) <= 1) {
            score += this.calScore(lastMove) * 10;
            console.log(score);
            lastMove = 'Perfect';
            moveCount[0]++;
        } else if (Math.abs(slideMid - whiteMid) <= 5) {
            score += this.calScore(lastMove) * 7;
            console.log(score);
            lastMove = 'Excellent';
            moveCount[1]++;
        } else if (Math.abs(slideMid - whiteMid) <= 10) {
            score += this.calScore(lastMove) * 5;
            console.log(score);
            lastMove = 'Good';
            moveCount[2]++;
        } else if (Math.abs(slideMid - whiteMid) <= 20) {
            score += this.calScore(lastMove) * 1;
            console.log(score);
            lastMove = 'Bad';
            moveCount[3]++;
        } else {
            score += this.calScore(lastMove) * 0;
            console.log(score);
            lastMove = 'Miss';
            moveCount[4]++;
        }
    }

    calScore(lastMove) {
        let base = 1000;
        if (lastMove === '') {
            return base;
        } else if (lastMove === 'Perfect') {
            return base * 3;
        } else if (lastMove === 'Excellent') {
            return base * 2;
        } else if (lastMove === 'Good') {
            return base * 1.5;
        } else {
            return base;
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
            let startButtonPressed = Date.now();
            requestAnimationFrame(this.move.bind(this, startButtonPressed));
        }
    }

    move(startTime) {

        
        this.displayScore();

        let object = this.entity('slide');

        console.log(object.pos.x);

        if((Date.now() - startTime) > 6185) {
            object.pos.x += 1.32;

            if (object.pos.x >= endPos) {
                object.pos.x = startPos;
            }
        }
        requestAnimationFrame(this.move.bind(this, startTime));
    }

    displayScore() {
        context.font = "48px Arial";
        context.fillStyle = "#0095DD";
        context.fillText("Score: " + score, 50, 60);
    }

    loadVisualAssets() {
        //add entity as background
        loadImage('/img/background/forest.gif').then(image => {
            let background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //panel
        loadImage('/img/game/panel.png').then(image => {
            let panel = new Entity(calScaledMid(image, canvas, 0, -900), image);
            this.addEntity('panel', panel, 1);
        });
        //elements
        loadImage('/img/game/spacebar.png').then(image => {
            let spacebar = new Entity(calScaledMid(image, canvas, -150, -720), image);
            this.addEntity('spacebar', spacebar, 2);
        });

        //slide
        loadImage('/img/game/counting_beat.png').then(image => {
            let slide = new Entity(calScaledMid(image, canvas, -150, -720), image);
            this.addEntity('slide', slide, 3);
        });

        //comboarea
        loadImage('/img/game/combo.png').then(image => {
            let combospace = new Entity(calScaledMid(image, canvas, 1600, 1000), image);
            this.addEntity('combospace', combospace, 2);
        });
        
        //buttons
        loadImage('/img/game/menu button.png').then(image => {
            let menu = new Entity(calScaledMid(image, canvas, -1600, 1000), image);
            this.addEntity('menu', menu, 2);
            this.mouseBoundingBoxes['menu'] = [menu.pos, new Vec2(menu.pos.x + image.width, menu.pos.y + image.height)];
        });
        loadImage('/img/wait_room/start button.png').then(image => {
            let start = new Entity(calScaledMid(image, canvas, 0, 0), image);
            this.addEntity('start', start, 2);
            this.mouseBoundingBoxes['start'] = [start.pos, new Vec2(start.pos.x + image.width, start.pos.y + image.height)];
        });
        
    }
}