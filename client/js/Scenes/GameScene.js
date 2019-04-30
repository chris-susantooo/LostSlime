import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';
import Velocity from '../Traits/Velocity.js';
import Gravity from '../Traits/Gravity.js';
import Jump from '../Traits/Jump.js';
import Wobble from '../Traits/Wobble.js';
import Collider from '../Traits/Collider.js';
import Camera from '../Camera.js';
import EndScene from './EndScene.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const KEYS = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-_=+,./<>? ';
const SLIDE_START_X = 770.5;
const SLIDE_END_X = 1100.5;
const SLIDE_PERFECT_X = 1010.5;

export default class GameScene extends Scene {

    constructor(name, socket, room, beatmap, audio) {
        super(name, socket);

        this.room = room;
        this.beatmap = beatmap;
        this.audio = audio;
        this.startTime = null;
        this.playerVerifiedInput = '';

        this.slots = {};
        this.jumped = false;
        this.lastJumped = null;
        this.jumpable = true;
        this.pillarImage = null;

        this.setupNetworkEvents();
        this.loadVisualAssets();
        this.setupMouseEvents();
        this.setupKeyEvents();
        this.makeScorer();
        this.makeNamer();

        this.camera = new Camera();
    }

    setupNetworkEvents() {
        //server has announced to everyone to start the game, handle game start stuff here
        this.socket.on('startGame', () => {
            console.log('ACK received, game starts in 3s...');
            setTimeout(this.startGame.bind(this), 3000);
        });
        //a player jumps
        this.socket.on('playerJump', (playerID, jumpType, score, combo) => {
            if (jumpType !== 'emptyJump') {
                if (jumpType !== 'miss') {
                    this.entity(playerID).jump.jump();
                    setTimeout(Scene.current.insertPillar.bind(Scene.current, playerID), 500);
                }
                Scene.current.slots[playerID].score = score;
                Scene.current.slots[playerID].combo = combo;
            }
            else {
                this.entity(playerID).jump.jump();
            }
        });
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

    setupKeyEvents() {
        $(document).on('keydown', e => {
            const playerAsset = Scene.current.slots[Scene.current.socket.id];
            const playerTallestPillar = playerAsset.pillars[playerAsset.pillars.length - 1];

            if (e.key === 'Enter' && !e.repeat && Scene.current.jumpable && !Scene.current.jumped
                && Scene.current.entity('self').pos.y === playerTallestPillar.pos.y - 128 + 25) {
                Scene.current.jumped = true;
                Scene.current.lastJumped = (Date.now() - Scene.current.startTime) / 1000;
                Scene.current.socket.emit('jump', (result, score, combo) => {
                    if (result !== 'emptyJump') {
                        if (result !== 'miss') {
                            Scene.current.entity('self').jump.jump();
                            setTimeout(Scene.current.insertPillar.bind(Scene.current, Scene.current.socket.id), 500);
                        }
                        Scene.current.beatmap.nextSpace++;
                        Scene.current.beatmap.nextCaption++;
                        Scene.current.slots[Scene.current.socket.id].score = score;
                        Scene.current.slots[Scene.current.socket.id].combo = combo;
                        Scene.current.entity(result).pos = new Vec2(Scene.current.entity('slide').pos.x, Scene.current.entity('slide').pos.y - 100);
                        Scene.current.entity(result).isHidden = false;
                        setTimeout(() => {
                            Scene.current.entity(result).isHidden = true;
                        }, 1000);
                    }
                    else {
                        Scene.current.entity('self').jump.jump();
                        Scene.current.jumped = false;
                    }
                });
            }
            else if ((KEYS.indexOf(e.key) !== -1 || e.key === 'Backspace') && this.startTime) {
                Scene.current.socket.emit('playerInput', e.key, response => {
                    Scene.current.playerVerifiedInput = response;
                });
            }
        });
        $(document).on('keyup', e => {
            if (e.key === 'Enter') {
                Scene.current.jumpable = false;
            }
        });
    }

    transition(target) {
        this.audio.src = '';
        this.destroy();
        if (target === 'menubtn') {
            this.socket.emit('leave', () => {
                const title = Scene.scenes['title'];
                title.show();
            });
        } else if (target === 'end') {
            this.socket.emit('endGame', players => {
                const endscene = new EndScene('end', this.socket, players);
                endscene.show();
            });
        }
    }
    
    //TODO: score
    startGame() {
        this.startTime = Date.now();
        this.audio.play();
        this.makeCaptioner();
        this.socket.emit('declareStart');
        console.log('Game start!');
    }
    
    //displays players' names
    makeNamer() {
        const namer = new Entity(null, null, true);
        namer.update = () => {
            Object.entries(this.slots).forEach(entry => {
                context.font = "50px Annie Use Your Telescope";
                context.fillStyle = entry[0] === this.socket.id ? "#00ff00" : "#ffffff";
                context.textAlign = 'center';
                context.fillText(entry[1].name, entry[1].slime.pos.x + entry[1].slime.image.width / 2, entry[1].slime.pos.y - 30 - this.camera.pos.y);
            });
        };
        this.addEntity('namer', namer, 5);
    }

    //displays players' scores and combos
    makeScorer() {
        const scorer = new Entity(null, null, true);
        scorer.update = () => {
            //display self combo
            context.font = "50px Annie Use Your Telescope";
            context.fillStyle = "#FFFFFF";
            context.textAlign = 'center';
            if (this.slots[this.socket.id] && this.slots[this.socket.id].combo) {
                context.fillText("Combo: " + this.slots[this.socket.id].combo, 165, 445);
            }
            else {
                context.fillText("Combo: 0", 165, 445);
            }
            
            //display leaderboard
            context.font = "bold 50px Annie Use Your Telescope";
            context.fillStyle = "#FFFFFF";
            context.textAlign = 'center';
            context.fillText("Leaderboards", 165, 175);
            //save player score and id/name mapping ascendingly
            const leaderboard = [];
            Object.entries(this.slots).forEach(entry => {
                leaderboard.push([entry[1].score, entry[1].name, entry[0]]);
            });
            //reverse the order to descending and print out the leaderboard
            let i = 0;
            leaderboard.sort((a, b) => b[0] - a[0]);
            for (const entry of leaderboard) {
                if (entry[2] === this.socket.id) {
                    context.font = context.font = "bold 40px Annie Use Your Telescope";
                    context.fillStyle = "#00ff00";
                    context.textAlign = 'center';
                } else {
                    context.font = context.font = "40px Annie Use Your Telescope";
                    context.fillStyle = "#000000";
                    context.textAlign = 'center';
                }
                //print out the line
                const text = (i + 1).toString() + '. ' + entry[1] + ': ' + entry[0];
                context.fillText(text, 165, 225 + 40 * i);
                i++;
            }
        };
        this.addEntity('scorer', scorer, 5)
    }

    //assist server by monitoring player misses
    makeCaptioner() {
        const captioner = new Entity(null, null, true);
        captioner.update = () => {
            try {
                const currentTime = (Date.now() - this.startTime) / 1000;
                // if player has not jumped in the designated time
                if (this.beatmap.getNextSpace(false) && currentTime >= this.beatmap.getNextSpace(false) + 0.3 && !this.jumped) {
                    this.beatmap.nextSpace++;
                    this.beatmap.nextCaption++;
                    this.socket.emit('playerMiss');
                    this.slots[this.socket.id].combo = 0;
                    //show miss label
                    this.entity('miss').pos = new Vec2(Scene.current.entity('slide').pos.x, Scene.current.entity('slide').pos.y - 100);
                    this.entity('miss').isHidden = false;
                    setTimeout(() => {
                        Scene.current.entity('miss').isHidden = true;
                    }, 1000);
                }
                //if caption should be shown
                if (this.beatmap.getNextCaption(false)[1] && currentTime >= this.beatmap.getNextCaption(false)[1]) {
                    context.font = '100px Annie Use Your Telescope';
                    context.fillStyle = "#ffffff";
                    context.textAlign = "center";
                    context.fillText(this.beatmap.getNextCaption(false)[0], 960, 270);
                    this.jumped = this.lastJumped >= this.beatmap.getNextCaption(false)[1];
                    //show player input
                    context.font = '60px Annie Use Your Telescope';
                    if (this.beatmap.getNextCaption(false)[0].slice(0, this.playerVerifiedInput.length) === this.playerVerifiedInput) {
                        context.fillStyle = "#000000";
                    } else {
                        context.fillStyle = "#ff0000";
                    }
                    context.fillText(this.playerVerifiedInput, 960, 1000);
                } else {
                    this.playerVerifiedInput = '';
                }
            } catch (e) {
                //song finished
                console.log(e);
                setTimeout(() => {
                    this.transition('end')
                }, 3000);
            }
        };
        this.addEntity('captioner', captioner, 10);
        
    }

    insertPillar(playerID) {
        const lastPillar = this.slots[playerID].pillars[this.slots[playerID].pillars.length - 1];
        const pillar = new Entity(new Vec2(lastPillar.pos.x, lastPillar.pos.y - 123), this.pillarImage, false, this.camera);
        this.addEntity('pillar' + playerID + (this.slots[playerID].pillars.length + 1).toString(), pillar, 1);
        this.slots[playerID].pillars.push(pillar);
    }
    
    loadVisualAssets() {
        //initialize array for later instructions to load the resources below:
        const promises = [];

        //load background
        for (const name of ['forest', 'sky', 'highsky', 'space']) {
            promises.push(loadImage('/img/background/' + name + '.gif'));
        }
        //load slimes
        for (const player of this.room.players) {
            promises.push(loadImage('/img/game/slimes/' + player.color + '/' + player.color + '.png'));
            //load animations
            for (let i = 1; i <= 30; i++) {
                promises.push(loadImage('/img/game/slimes/' + player.color + '/' + i.toString() + '.png'));
            }
        }
        //load pillar and UI elements
        for (const name of ['icepillar', 'combo', 'counting_beat', 'leaderboard', 'menu button', 'panel', 'spacebar', 'Perfect', 'Excellent', 'Good', 'Bad', 'Miss']) {
            promises.push(loadImage('/img/game/' + name + '.png'));
        }

        //feed array to setup promise
        Promise.all(promises).then(resources => {
            //the code below only executes adter all above promises are fulfilled (assets all loaded)
            let index = 0;
            //add backgrounds to this.entities, only forest is initially visible
            for (const name of ['forest', 'sky', 'highsky', 'space']) {
                const background = new Entity(new Vec2(0, 0), resources[index++], name !== 'forest', this.camera, true);
                this.addEntity(name, background, 0);
            }

            const playerQuant = this.room.players.length;
            const pillarGap = (1240 - playerQuant * 260) / (playerQuant + 1);

            //add slimes to this.entities (138 x 28 each)
            for (let i = 1; i <= playerQuant; i++) {
                const slime = new Entity(new Vec2(400 + pillarGap * i + 260 * (i - 1), 0), resources[index++], false, this.camera);
                if (this.room.players[i - 1].id === this.socket.id) { //this slime is self
                    this.addEntity('self', slime, 2);
                    this.camera.follow(slime);
                }
                else { //this slime is other player
                    this.addEntity(this.room.players[i - 1].id, slime, 2);
                }
                this.slots[this.room.players[i - 1].id] = { slime: slime, name: this.room.players[i - 1].name, score: 0 };
                //load animations
                const animations = [];
                for (let i = 1; i <= 30; i++) {
                    animations.push(resources[index++]);
                }
                //add traits to slime
                slime.addTrait(new Wobble(animations));
                slime.addTrait(new Velocity());
                slime.addTrait(new Gravity());
                slime.addTrait(new Collider());
                slime.addTrait(new Jump());
            }
            //add pillar to this.entities (260 x 123 each)
            this.pillarImage = resources[index++];
            for (let i = 1; i <= playerQuant; i++) {
                const pillar = new Entity(new Vec2(340 + pillarGap * i + 260 * (i - 1), 800), this.pillarImage, false, this.camera);
                this.addEntity('pillar' + this.room.players[i - 1].id + '1', pillar, 1);
                if (this.slots[this.room.players[i - 1].id].pillars) {
                    this.slots[this.room.players[i - 1].id].pillars.push(pillar);
                }
                else {
                    this.slots[this.room.players[i - 1].id].pillars = [pillar];
                }
            }
            //create references to UI elements
            const combo = new Entity(new Vec2(10, 390), resources[index++]);
            const slide = new Entity(calScaledMid(resources[index], canvas, -150, -680), resources[index++]);
            //override update method to move the slider
            let AvgSpeed = null;
            let AvgCount = 0;
            slide.update = deltaTime => {
                const currentTime = Math.max(0, (Date.now() - this.startTime) / 1000 - this.beatmap.getSongStart())
                if (this.startTime && currentTime) {
                    //calculate the supposed moveSpeed of the slide
                    const interval = this.beatmap.getSpaceInterval() / 4;
                    let slideLen = slide.pos.x < SLIDE_PERFECT_X ? SLIDE_PERFECT_X - slide.pos.x : SLIDE_END_X - slide.pos.x + SLIDE_PERFECT_X - SLIDE_START_X;
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
                    if (slide.pos.x >= SLIDE_END_X) slide.pos.x = SLIDE_START_X;
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
            const leaderboard = new Entity(new Vec2(10, 130), resources[index++]);
            const menubtn = new Entity(new Vec2(30, 30), resources[index]);
            //add bounding box to detect click for menubtn
            this.mouseBoundingBoxes['menubtn'] = [menubtn.pos, new Vec2(menubtn.pos.x + resources[index].width, menubtn.pos.y + resources[index++].height)];
            //continue with creating remaining references to UI elements
            const panel = new Entity(calScaledMid(resources[index], canvas, 0, -865), resources[index++]);
            const spacebar = new Entity(calScaledMid(resources[index], canvas, -150, -690), resources[index++]);
            const perfect = new Entity(null, resources[index++], true);
            const excellent = new Entity(null, resources[index++], true);
            const good = new Entity(null, resources[index++], true);
            const bad = new Entity(null, resources[index++], true);
            const miss = new Entity(null, resources[index++], true);
            //add entity to scene
            this.addEntity('combospace', combo, 2);
            this.addEntity('slide', slide, 4);
            this.addEntity('leaderboard', leaderboard, 2);
            this.addEntity('menubtn', menubtn, 2);
            this.addEntity('panel', panel, 2);
            this.addEntity('spacebar', spacebar, 3);
            this.addEntity('perfect', perfect, 5);
            this.addEntity('excellent', excellent, 5);
            this.addEntity('good', good, 5);
            this.addEntity('bad', bad, 5);
            this.addEntity('miss', miss, 5);

            this.loaded = true;
            this.socket.emit('finLoad', () => {
                //server replied, we can start the game now
                console.log('ACK received, game starts in 3s...');
                setTimeout(this.startGame.bind(this), 3000);
            });
        })        
    }
}