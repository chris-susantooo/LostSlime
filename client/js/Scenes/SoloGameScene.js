import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos, getCenterPos } from '../util.js';
import EndSoloScene from './EndSoloScene.js';
import Beatmap from '../BeatMap.js';
import Velocity from '../Traits/Velocity.js';
import Gravity from '../Traits/Gravity.js';
import Jump from '../Traits/Jump.js';
import Wobble from '../Traits/Wobble.js';
import Collider from '../Traits/Collider.js';
import Camera from '../Camera.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const startPos = 770.5;
const endPos = 1100.5;
const charList = 'abcdefghijklmnopqrstuvwxyz'; 

let score = 0;
let moveCount = [0, 0, 0, 0, 0];
let lastMove = '';
let song;
let round = 0;
let startTime = 0;
let spacebarPressed = false;

let buffer = [];

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

        this.songName = beatmap.getSongName();
        this.songStartTime = beatmap.getSongStart();

        this.setupKeyEvents();

        song.play();
        startTime = Date.now();

        this.slots = {};
        this.camera = new Camera();

        requestAnimationFrame(this.move.bind(this, startTime));

        const checker = new Entity(new Vec2(0, 0), null, true);
        checker.update = () => {
            Scene.currentScene.displayScore();
            if ((Date.now() - startTime)/1000 >= 
                Scene.currentScene.beatmap.getNextCaption(false)[1]) {
                context.font = '140px Annie Use Your Telescope';
                context.fillStyle = "#000000";
                context.fillText(Scene.currentScene.beatmap.getNextCaption(false)[0], 550, 1040); 
            }
            if ((Date.now() - startTime)/1000 >= 
            Scene.currentScene.beatmap.getNextSpace(false) + 1) {
                if (!spacebarPressed) {
                    let temp1 = Scene.currentScene.beatmap.getNextSpace(true);
                    let temp2 = Scene.currentScene.beatmap.getNextCaption(true);
                    lastMove = 'Miss';
                    moveCount[4]++;
                }
            }
        }
        this.addEntity('checker', checker, 10);

    }

    setupKeyEvents() {
        $(document).on('keydown', function(e) {
            if (!e.repeat && Scene.currentScene.canPressSpace(round)) {
                if (e.keyCode === 32) {
                    round++;
                    spacebarPressed = true;
                    Scene.currentScene.spaceBarCheck(buffer);
                    buffer = [];
                } else if (charList.indexOf(e.key) != -1) {
                    buffer += e.key;
                    console.log(buffer);
                } else if (e.key === 'Backspace') {
                    buffer = buffer.slice(0, buffer.length-1);
                    console.log(buffer);
                }
            }
        });
    }

    //return true if spacebar can be detected during the time, false otherwise
    canPressSpace(i) {
        let currentTime = Date.now();
        if ((currentTime - startTime) >= (16185 + 10000 * i) && (currentTime - startTime) <= (23685 + 10000 * i)) {
            return true;
        }
        return false;
    }

    //checking when spacebar is pressed, the time difference between the press and the correct press
    spaceBarCheck(buffer) {
        console.log("spacebar pressed")
        let pressedTime = (Date.now() - startTime)/1000;
        let correctTime = Scene.currentScene.beatmap.getNextSpace(true);
        let correctWord = Scene.currentScene.beatmap.getNextCaption(true)[0];

        console.log(buffer, correctWord);
        if (buffer === correctWord) {

            console.log("correct word")

            if (Math.abs(pressedTime - correctTime) <= 0.1) {
                score += this.calScore(lastMove) * 10;
                lastMove = 'Perfect';
                moveCount[0]++;
            } else if (Math.abs(pressedTime - correctTime) <= 0.5) {
                score += this.calScore(lastMove) * 7;
                lastMove = 'Excellent';
                moveCount[1]++;
            } else if (Math.abs(pressedTime - correctTime) <= 1) {
                score += this.calScore(lastMove) * 5;
                lastMove = 'Good';
                moveCount[2]++;
            } else if (Math.abs(pressedTime - correctTime) <= 1.25) {
                score += this.calScore(lastMove) * 1;
                lastMove = 'Bad';
                moveCount[3]++;
            } 

            console.log(score);
        } else {
            lastMove = 'Miss';
            moveCount[4]++;
        }
    }

    //calculating score based on players' last move with corresponding mulitplier
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
        } 
    }

    move(startTime) {

        let object = this.entity('slide');

        //start sliding when the music start
        if((Date.now() - startTime) >= Scene.currentScene.songStartTime * 1000) {
            object.pos.x += 1.28625;

            //loop the slide
            if (object.pos.x >= endPos) {
                object.pos.x = startPos;
            }
        }

        

        requestAnimationFrame(this.move.bind(this, startTime));
    }

    //draw the score and update each frame at move()
    displayScore() {
        context.font = "50px Annie Use Your Telescope";
        context.fillStyle = "#FFFFFF";
        context.fillText("Score: " + score, 20, 55);
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
            this.addEntity('panel', panel, 2);
        });
        //elements
        loadImage('/img/game/spacebar.png').then(image => {
            let spacebar = new Entity(calScaledMid(image, canvas, -150, -720), image);
            this.addEntity('spacebar', spacebar, 3);
        });

        //slide
        loadImage('/img/game/counting_beat.png').then(image => {
            let slide = new Entity(calScaledMid(image, canvas, -150, -720), image);
            this.addEntity('slide', slide, 4);
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
        
        //loadslime
        loadImage('/img/game/slimes/blue/blue.png').then(image => {
            let slime = new Entity(new Vec2(909, 0), image);
            this.addEntity('slime', slime, 2);

            this.slots[this.socket.id] = { slime: slime }

            //slime animations
            let animations = [];
            for (let i = 1; i <= 30; i++) {
                loadImage('/img/game/slimes/blue/' + i.toString() + '.png').then(image => {
                    animations.push(image);
                });
            }
            slime.addTrait(new Wobble(animations));
            slime.addTrait(new Velocity());
            slime.addTrait(new Gravity());
            slime.addTrait(new Collider());
            slime.addTrait(new Jump());

            this.camera.follow(slime);
        });
        
        //pillar
        loadImage('/img/game/icepillar.png').then(image => {
            let pillar = new Entity(new Vec2(830, 800), image);
            this.addEntity('pillar' + this.socket.id + '1', pillar, 1);
            if (this.slots[this.socket.id].pillars) {
                this.slots[this.socket.id].pillars.push(pillar);
            }
            else {
                this.slots[this.socket.id].pillars = [pillar];
            }
        });

    }
}