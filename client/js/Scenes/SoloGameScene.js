import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';
import EndSoloScene from './EndSoloScene.js';
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
const perfectPos = 1010.5;
const charList = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-_=+,./<>? '; 

let score = 0;
let moveCount = [0, 0, 0, 0, 0];
let lastMove = '';

export default class SoloGameScene extends Scene {

    constructor(name, socket, beatmap, audio) {
        super(name, socket);

        this.beatmap = beatmap;
        this.audio = audio;
        this.buffer = [];

        this.songName = beatmap.getSongName();
        this.songStartTime = beatmap.getSongStart();

        this.audio.play();
        this.startTime = Date.now();

        this.slots = {};
        this.jumped = false;
        this.lastJumped = null;
        this.jumpable = true;
        this.pillarImage = null;

        this.loadVisualAssets();
        this.setupMouseEvents();
        this.setupKeyEvents();

        this.camera = new Camera();

        const checker = new Entity(null, null, true);
        checker.update = () => {
            Scene.current.displayScore();
            try {
                const currentTime = (Date.now() - this.startTime) / 1000;
                //the player did not press spacebar during the specified time
                if (currentTime >= 
                    this.beatmap.getNextSpace(false) + 0.3 && !this.jumped && this.beatmap.getNextSpace(false)) {
                    this.beatmap.nextSpace++;
                    this.beatmap.nextCaption++;
                    lastMove = 'Miss';
                    moveCount[4]++;
                    
                    //show Miss image when the player did not press spacebar
                    let showMove = Scene.current.entity(lastMove);
                    let slide = Scene.current.entity('slide');
                    showMove.pos.x = slide.pos.x;
                    showMove.pos.y = slide.pos.y - 100;
                    showMove.isHidden = false;

                    //hide the image after 1s
                    setTimeout(() => {
                        showMove.isHidden = true;
                    }, 1000);
                }
                //show captions
                if (currentTime >= 
                    this.beatmap.getNextCaption(false)[1] && this.beatmap.getNextCaption(false)[1]) {
                    context.font = '100px Annie Use Your Telescope';
                    context.fillStyle = "#ffffff";
                    context.textAlign = "center";
                    context.fillText(this.beatmap.getNextCaption(false)[0], 960, 270); 
                    this.jumped = this.lastJumped >= this.beatmap.getNextCaption(false)[1];
                    //show player input
                    context.font = '60px Annie Use Your Telescope';
                    if (this.beatmap.getNextCaption(false)[0].slice(0, this.buffer.length) === this.buffer) {
                        context.fillStyle = "#000000";
                    } else {
                        context.fillStyle = "#ff0000";
                    }
                    context.fillText(this.buffer, 960, 1025);
                    //hide lastMove image
                    if (lastMove) {
                        let last = Scene.current.entity(lastMove);
                        last.isHidden = true;
                    }
                } else {
                    this.buffer = [];
                }
            } catch (e) {
                this.audio.onended = function() {
                const end = new EndSoloScene(score, moveCount);
                end.show();
                }
            }
        }
        this.addEntity('checker', checker, 10);
    }

    setupKeyEvents() {
        $(document).on('keydown', function(e) {
            const playerAsset = Scene.current.slots[Scene.current.socket.id];
            const playerTallestPillar = playerAsset.pillars[playerAsset.pillars.length - 1];

            if (!e.repeat) {
                if (e.key === 'Enter' && Scene.current.jumpable && !Scene.current.jumped 
                    && Scene.current.entity('slime').pos.y === playerTallestPillar.pos.y - 128 + 25) {
                    Scene.current.jumped = true;
                    Scene.current.lastJumped = (Date.now() - Scene.current.startTime) / 1000;
                    const result = Scene.current.spaceBarCheck(Scene.current.buffer);
                    Scene.current.buffer = [];
                    if (result !== 'Miss') {
                        Scene.current.entity('slime').jump.jump();
                        setTimeout(Scene.current.insertPillar.bind(Scene.current, Scene.current.socket.id), 500);
                    }
                    //show image of the player's move
                    let showMove = Scene.current.entity(result);
                    let slide = Scene.current.entity('slide');
                    showMove.pos.x = slide.pos.x;
                    showMove.pos.y = slide.pos.y - 100;
                    showMove.isHidden = false;

                    //hide the image after 1s
                    setTimeout(() => {
                        showMove.isHidden = true;
                    }, 1000);

                } else if (charList.indexOf(e.key) != -1) {
                    Scene.current.buffer += e.key;
                } else if (e.key === 'Backspace') {
                    Scene.current.buffer = Scene.current.buffer.slice(0, Scene.current.buffer.length-1);
                }
            }
        });
        $(document).on('keyup', e => {
            if (e.key === 'Enter') {
                Scene.current.jumpable = false;
            }
        });
    }

    //checking when spacebar is pressed, the time difference between the press and the correct press
    spaceBarCheck(buffer) {
        let pressedTime = (Date.now() - this.startTime)/1000;
        let correctTime = Scene.current.beatmap.getNextSpace(true);
        let correctWord = Scene.current.beatmap.getNextCaption(true)[0];

        if (buffer === correctWord) {

            if (Math.abs(pressedTime - correctTime) <= 0.02) {
                score += this.calScore(lastMove) * 10;
                lastMove = 'Perfect';
                moveCount[0]++;
                Scene.current.canJump = true;
            } else if (Math.abs(pressedTime - correctTime) <= 0.05) {
                score += this.calScore(lastMove) * 7;
                lastMove = 'Excellent';
                moveCount[1]++;
                Scene.current.canJump = true;
            } else if (Math.abs(pressedTime - correctTime) <= 0.1) {
                score += this.calScore(lastMove) * 5;
                lastMove = 'Good';
                moveCount[2]++;
                Scene.current.canJump = true;
            } else if (Math.abs(pressedTime - correctTime) <= 0.3) {
                score += this.calScore(lastMove) * 1;
                lastMove = 'Bad';
                moveCount[3]++;
                Scene.current.canJump = true;
            }  else {
                lastMove = 'Miss';
                moveCount[4]++;
            }
        } else {
            lastMove = 'Miss';
            moveCount[4]++;
        }
        return lastMove;
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
            Object.entries(Scene.current.mouseBoundingBoxes).forEach(entry => {
                if (currentPosition.x >= entry[1][0].x
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
            let currentPosition = getMousePos(canvas, event);
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
        if(target === 'menu') {
            Scene.current.audio.pause();
            Scene.current.audio.currentTime = 0;
            score = 0;
            const title = Scene.scenes['title'];
            title.show();
        } 
    }

    //insert pillar when the player successfully jumped
    insertPillar(playerID) {
        const lastPillar = this.slots[playerID].pillars[this.slots[playerID].pillars.length - 1];
        const pillar = new Entity(new Vec2(lastPillar.pos.x, lastPillar.pos.y - 123), this.pillarImage, false, this.camera);
        this.addEntity('pillar' + playerID + (this.slots[playerID].pillars.length + 1).toString(), pillar, 1);
        this.slots[playerID].pillars.push(pillar);
    }

    //draw the score and update each frame at move()
    displayScore() {
        context.font = "50px Annie Use Your Telescope";
        context.fillStyle = "#FFFFFF";
        context.textAlign = 'center';
        context.fillText("Score: " + score, 150, 55);
    }

    loadVisualAssets() {
        let promises = [];
        for (const name of ['forest', 'sky', 'highsky', 'space']) {
            promises.push(loadImage('/img/background/' + name + '.gif'));
        }
        promises.push(loadImage('/img/game/panel.png'));
        promises.push(loadImage('/img/game/spacebar.png'));
        promises.push(loadImage('/img/game/counting_beat.png'));
        promises.push(loadImage('/img/game/combo.png'));
        promises.push(loadImage('/img/game/menu button.png'));
        promises.push(loadImage('/img/game/slimes/blue/blue.png'));
        for (let i = 1; i <= 30; i++) {
            promises.push(loadImage('/img/game/slimes/blue/' + i.toString() + '.png'));
        }
        promises.push(loadImage('/img/game/icepillar.png'));
        promises.push(loadImage('/img/game/Perfect.png'));
        promises.push(loadImage('/img/game/Excellent.png'));
        promises.push(loadImage('/img/game/Good.png'));
        promises.push(loadImage('/img/game/bad.png'));
        promises.push(loadImage('/img/game/Miss.png'));

        Promise.all(promises).then(resources => {
            let index = 0;
            for (const name of ['forest', 'sky', 'highsky', 'space']) {
                const background = new Entity(new Vec2(0, 0), resources[index++], name !== 'forest', this.camera, true);
                this.addEntity(name, background, 0);
            }
            let panel = new Entity(calScaledMid(resources[index], canvas, 0, -900), resources[index++]);
            this.addEntity('panel', panel, 2);

            let spacebar = new Entity(calScaledMid(resources[index], canvas, -150, -720), resources[index++]);
            this.addEntity('spacebar', spacebar, 3);

            let slide = new Entity(calScaledMid(resources[index], canvas, -150, -720), resources[index++]);
            let AvgSpeed = null;
            let AvgCount = 0;
            slide.update = deltaTime => {
                const currentTime = Math.max(0, (Date.now() - this.startTime) / 1000 - this.beatmap.getSongStart())
                if (this.startTime && currentTime) {
                    //calculate the supposed moveSpeed of the slide
                    const interval = this.beatmap.getSpaceInterval() / 2;
                    let slideLen = slide.pos.x < perfectPos ? perfectPos - slide.pos.x : endPos - slide.pos.x + perfectPos - startPos;
                    const moveSpeed = (slideLen / (interval - currentTime % interval)) * deltaTime;

                    //take average of moveSpeed, to discard extreme values of moveSpeed
                    if (!AvgSpeed) {
                        AvgSpeed = moveSpeed;
                    }
                    else if (Math.abs(AvgSpeed - moveSpeed) / AvgSpeed <= 0.5) {
                        AvgSpeed = (AvgSpeed * AvgCount + moveSpeed) / ++AvgCount;
                    }
                    slide.pos.x += Math.abs(AvgSpeed - moveSpeed) / AvgSpeed >= 0.5 ? AvgSpeed : moveSpeed;
                    //loop the slide
                    if (slide.pos.x >= endPos) slide.pos.x = startPos;
                }
                //determine if now is jumpable
                const spacebar = this.entity('spacebar');
                if (Math.abs((Date.now() - this.startTime) / 1000 - this.beatmap.getNextSpace(false)) <= 0.5) {
                    this.jumpable = slide.pos.x >= spacebar.pos.x && slide.pos.x <= spacebar.pos.x + spacebar.image.width;
                }
                else {
                    this.jumpable = (Date.now() - this.startTime) / 1000 < this.beatmap.captions[0][1];
                }
            }
            this.addEntity('slide', slide, 4);

            let combospace = new Entity(calScaledMid(resources[index], canvas, 1600, 1000), resources[index++]);
            this.addEntity('combospace', combospace, 2);

            let menu = new Entity(calScaledMid(resources[index], canvas, -1600, 1000), resources[index]);
            this.addEntity('menu', menu, 2);
            this.mouseBoundingBoxes['menu'] = [menu.pos, new Vec2(menu.pos.x + resources[index].width, menu.pos.y + resources[index++].height)];

            let slime = new Entity(new Vec2(890, 0), resources[index++], false, this.camera, false);
            this.addEntity('slime', slime, 2);

            this.slots[this.socket.id] = { slime: slime }

            //slime animations
            let animations = [];

            for (let i = 1; i<=30; i++) {
                animations.push(resources[index++]);
            }
            slime.addTrait(new Wobble(animations));
            slime.addTrait(new Velocity());
            slime.addTrait(new Gravity());
            slime.addTrait(new Collider());
            slime.addTrait(new Jump());

            this.camera.follow(slime);

            this.pillarImage = resources[index++];

            let pillar = new Entity(new Vec2(830, 800), this.pillarImage, false, this.camera);
            this.addEntity('pillar' + this.socket.id + '1', pillar, 1);
            if (this.slots[this.socket.id].pillars) {
                this.slots[this.socket.id].pillars.push(pillar);
            }
            else {
                this.slots[this.socket.id].pillars = [pillar];
            }
            this.loaded = true;

            let perfect = new Entity(new Vec2(0, 0), resources[index++], true, this.camera, false);
            let excellent = new Entity(new Vec2(0, 0), resources[index++], true, this.camera, false);
            let good = new Entity(new Vec2(0, 0), resources[index++], true, this.camera, false);
            let bad = new Entity(new Vec2(0, 0), resources[index++], true, this.camera, false);
            let miss = new Entity(new Vec2(0, 0), resources[index++], true, this.camera, false);

            this.addEntity('Perfect', perfect, 10);
            this.addEntity('Excellent', excellent, 10);
            this.addEntity('Good', good, 10);
            this.addEntity('Bad', bad, 10);
            this.addEntity('Miss', miss, 10);
        });
    }
}