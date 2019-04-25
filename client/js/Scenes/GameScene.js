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

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class GameScene extends Scene {

    constructor(name, socket, room, beatmap, audio) {
        super(name, socket);

        this.room = room;
        this.beatmap = beatmap;
        this.audio = audio;
        this.startTime = null;

        this.slots = {};
        this.isJumping = false;
        this.pillarImage = null;

        this.setupNetworkEvents();
        this.loadVisualAssets();
        this.setupMouseEvents();
        this.setupKeyEvents();
        
        this.camera = new Camera();
        window.camera = this.camera;
    }

    setupNetworkEvents() {
        //server has announced to everyone to start the game, handle game start stuff here
        this.socket.on('startGame', () => {
            console.log('ACK received, game starts in 3s...');
            setTimeout(this.startGame.bind(this), 3000);
        });
        //a player jumps
        this.socket.on('playerJump', (playerID) => {
            this.entity(playerID).jump.jump();
            setTimeout(Scene.currentScene.insertPillar.bind(Scene.currentScene, playerID), 500);
        });
    }

    setupMouseEvents() {
        this.mouseClick = function onMouseClick(event) {
            let currentPosition = getMousePos(canvas, event);
            Object.entries(Scene.currentScene.mouseBoundingBoxes).forEach(entry => {
                if (currentPosition.x >= entry[1][0].x &&
                    currentPosition.x <= entry[1][1].x &&
                    currentPosition.y >= entry[1][0].y &&
                    currentPosition.y <= entry[1][1].y
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
            const playerAsset = Scene.currentScene.slots[Scene.currentScene.socket.id];
            const playerTallestPillar = playerAsset.pillars[playerAsset.pillars.length - 1];
            if (e.key === ' ' && !e.repeat && !Scene.currentScene.isJumping && Scene.currentScene.entity('self').pos.y === playerTallestPillar.pos.y - 115 + 10) {
                Scene.currentScene.socket.emit('jump', (response) => {
                    if (response === 'jumpOK') Scene.currentScene.entity('self').jump.jump();
                    setTimeout(Scene.currentScene.insertPillar.bind(Scene.currentScene, Scene.currentScene.socket.id), 500);
                });
            }
        });
        $(document).on('keyup', e => {
            if (e.key === ' ') {
                Scene.currentScene.isJumping = false;
            }
        });
    }

    transition(target) {
        if (target === 'menubtn') {
            this.socket.emit('leave', () => {
                this.audio.src = '';
                this.destroy();
                const title = Scene.scenes['title'];
                title.show();
            });
        }
    }
    
    //TODO: combo, checkinput, scrolling background, networking to update other players status
    startGame() {
        this.startTime = Date.now();
        console.log('Game start!', this.startTime);
        //this.audio.play();
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
        for (const name of ['forest', 'sky', 'sky2', 'sky3', 'space']) {
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
        for (const name of ['icepillar', 'combo', 'counting_beat', 'leaderboard', 'menu button', 'panel', 'spacebar']) {
            promises.push(loadImage('/img/game/' + name + '.png'));
        }

        //feed array to setup promise
        Promise.all(promises).then(resources => {
            //the code below only executes adter all above promises are fulfilled (assets all loaded)
            let index = 0;
            //add backgrounds to this.entities, only forest is initially visible
            for (const name of ['forest', 'sky', 'sky2', 'sky3', 'space']) {
                const background = new Entity(new Vec2(0, 0), resources[index++], name !== 'forest', this.camera, true);
                this.addEntity(name, background, 0);
            }

            const playerQuant = this.room.players.length;
            const pillarGap = (1240 - playerQuant * 260) / (playerQuant + 1);

            //add slimes to this.entities (107 x 115 each)
            for (let i = 1; i <= playerQuant; i++) {
                const slime = new Entity(new Vec2(419 + pillarGap * i + 260 * (i - 1), 0), resources[index++], false, this.camera);
                if (this.room.players[i - 1].id === this.socket.id) { //this slime is self
                    this.addEntity('self', slime, 2);
                    this.camera.follow(slime);
                }
                else { //this slime is other player
                    this.addEntity(this.room.players[i - 1].id, slime, 2);
                }
                this.slots[this.room.players[i - 1].id] = { slime: slime };
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
            const slide = new Entity(calScaledMid(resources[index], canvas, 330, -680), resources[index++]);
            const leaderboard = new Entity(new Vec2(10, 130), resources[index++]);
            const menubtn = new Entity(new Vec2(30, 30), resources[index]);
            //add bounding box to detect click for menubtn
            this.mouseBoundingBoxes['menubtn'] = [menubtn.pos, new Vec2(menubtn.pos.x + resources[index].width, menubtn.pos.y + resources[index++].height)];
            //continue with creating remaining references to UI elements
            const panel = new Entity(calScaledMid(resources[index], canvas, 0, -865), resources[index++]);
            const spacebar = new Entity(calScaledMid(resources[index], canvas, -150, -690), resources[index++]);
            //use references to create entities for all UI elements
            this.addEntity('combospace', combo, 2);
            this.addEntity('slide', slide, 4);
            this.addEntity('leaderboard', leaderboard, 2);
            this.addEntity('menubtn', menubtn, 2);
            this.addEntity('panel', panel, 2);
            this.addEntity('spacebar', spacebar, 3);

            this.loaded = true;
            this.socket.emit('finLoad', () => {
                //server replied, we can start the game now
                console.log('ACK received, game starts in 3s...');
                setTimeout(this.startGame.bind(this), 3000);
            });
        })        
    }

    // match(item, fileter) {
    //     var keys = Object.keys(filter);
    //     return keys.some(function (key) {
    //         if (item[key] == filter[key]) {
    //             return item;
    //         }
    //     });
    // }
}