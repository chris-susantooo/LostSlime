import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';
import Velocity from '../Traits/Velocity.js';
import Gravity from '../Traits/Gravity.js';
import Jump from '../Traits/Jump.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// function loadJSON(callback) {   
//     var xobj = new XMLHttpRequest();
//         xobj.overrideMimeType("application/json");
//     xobj.open('GET', './js/Scenes/test.json', false); 
//     xobj.onreadystatechange = function () {
//           if (xobj.readyState == 4 && xobj.status == "200") {
//             // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
//             callback(xobj.responseText);
//           }
//     };
//     xobj.send(null);  
// }

const playerQuant = 0;

export default class GameScene extends Scene {

    constructor(name, socket, room, beatmap, audio) {
        super(name, socket);

        this.room = room;
        this.beatmap = beatmap;
        this.audio = audio;
        this.starttime = null;
        this.isJumping = false;

        this.setupNetworkEvents();
        this.loadVisualAssets();
        this.setupMouseEvents();
        this.setupKeyEvents();

        //this.collider();
        //this.findAllowedSpaceTime();
        
    }

    //check when the space bar shd be press
    // findAllowedSpaceTime(){
    //     let accpetable = 0.5
    //     this.keytime = song_json.filter(function(item, index, array){
    //         return item.key === 'Key.space';
    //     });
    //     console.log(this.keytime)
    //     this.keytime.forEach(function(obj){
            
    //     });
    // }

    setupNetworkEvents() {
        //server has announced to everyone to start the game, handle game start stuff here
        this.socket.on('startGame', () => {
            console.log('ACK received, game starts in 3s...');
            setTimeout(this.startGame.bind(this), 3000);
        });
        //a player jumps
        this.socket.on('playerJump', (playerID) => {
            this.entity(playerID).jump.jump();
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

    //TODO: jump, combo, checkinput, scrolling background, networking to update other players status
    startGame() {
        console.log('Game start!');
        //this.audio.play();
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

    setupKeyEvents() {
        $(document).on('keydown', e => {
            if (e.key === ' ' && !e.repeat && !Scene.currentScene.isJumping && Scene.currentScene.entity('self').position.y === 710) {
                Scene.currentScene.socket.emit('jump', '', () => {
                    Scene.currentScene.entity('self').jump.jump()
                });
            }
        });
        $(document).on('keyup', function (e) {
            if (e.key === ' ') {
                Scene.currentScene.isJumping = false;
            }
        });
    }

    match(item, fileter){
        var keys = Object.keys(filter);
        return keys.some(function(key){
            if (item[key] == filter[key]){
                return item;
            }
        });
    }

    collider() { //check each slimes and ice pillar
        for (let i=0; i<playerQuant; i++) {
            //if ((this.Entity(this.room.players[i].id).position.y - this.Entity(this.room.players[i].id).image.height) >=
            //    this.Entity('pillar' + (i-1).toString()).position.y) {
            //        this.Entity(this.room.players[i].id).position.y = 
            //        this.Entity(this.room.players[i].id).image.height +
            //        this.Entity('pillar' + (i-1).toString()).position.y;
            //    }
            if ((this.Entity(this.room.players[i].id).position.y - this.Entity(this.room.players[i].id).image.height) >= 699) {
                this.Entity(this.room.players[i].id).position.y = 710 + this.Entity(this.room.players[i].id).image.height;
            }
        }
        requestAnimationFrame(this.collider.bind(this));
    }
    
    loadVisualAssets() {
        //initialize array for later instructions to load the resources below:
        const promises = [];

        //load backgrounds
        for (const name of ['forest', 'sky', 'sky2', 'sky3', 'space']) {
            promises.push(loadImage('/img/background/' + name + '.gif'));
        }
        //load slimes
        for (const player of this.room.players) {
            promises.push(loadImage('/img/game/slimes/' + player.color + '.png'))
        }
        //load pillar and UI elements
        for (const name of ['icepillar', 'combo', 'counting_beat', 'leaderboard', 'menu button', 'panel', 'spacebar']) {
            promises.push(loadImage('/img/game/' + name + '.png'));
        }

        //feed array to setup promise
        Promise.all(promises).then((resources) => {
            //the code below only executes adter all above promises are fulfilled (assets all loaded)
            let index = 0;
            //add backgrounds to this.entities, only forest is initially visible
            for (const name of ['forest', 'sky', 'sky2', 'sky3', 'space']) {
                const background = new Entity(new Vec2(0, 0), resources[index++], name !== 'forest'); //true gives hidden
                this.addEntity(name, background, 0);
            }

            const playerQuant = this.room.players.length;
            const pillarGap = (1240 - playerQuant * 260) / (playerQuant + 1);

            //add slimes to this.entities (115 x 101 each) 705
            for (let i = 1; i <= playerQuant; i++) {
                const slime = new Entity(new Vec2(412 + pillarGap * i + 260 * (i - 1), 0), resources[index++]);
                slime.addTrait(new Velocity());
                slime.addTrait(new Gravity());
                slime.addTrait(new Jump());
                if (this.room.players[i - 1].id === this.socket.id) { //this slime is self
                    this.addEntity('self', slime, 2);
                }
                else { //this slime is other player
                    this.addEntity(this.room.players[i - 1].id, slime, 2);
                }
            }
            //add pillar to this.entities (260 x 123 each)
            const pillarImage = resources[index++];
            for (let i = 1; i <= playerQuant; i++) {
                const pillar = new Entity(new Vec2(340 + pillarGap * i + 260 * (i - 1), 800), pillarImage);
                this.addEntity('pillar' + i.toString(), pillar, 1);
            }
            //create references to UI elements
            const combo = new Entity(new Vec2(10, 390), resources[index++]);
            const slide = new Entity(calScaledMid(resources[index], canvas, 330, -670), resources[index++]);
            const leaderboard = new Entity(new Vec2(10, 130), resources[index++]);
            const menubtn = new Entity(new Vec2(30, 30), resources[index]);
            //add bounding box to detect click for menubtn
            this.mouseBoundingBoxes['menubtn'] = [menubtn.position, new Vec2(menubtn.position.x + resources[index].width, menubtn.position.y + resources[index++].height)];
            //continue with creating remaining references to UI elements
            const panel = new Entity(calScaledMid(resources[index], canvas, 0, -855), resources[index++]);
            const spacebar = new Entity(calScaledMid(resources[index], canvas, -150, -680), resources[index++]);
            //use references to create entities for all UI elements
            this.addEntity('combospace', combo, 2);
            this.addEntity('slide', slide, 4);
            this.addEntity('leaderboard', leaderboard, 2);
            this.addEntity('menubtn', menubtn, 2);
            this.addEntity('panel', panel, 2);
            this.addEntity('spacebar', spacebar, 3);

            this.socket.emit('finLoad', () => {
                //server replied, we can start the game now
                console.log('ACK received, game starts in 3s...');
                setTimeout(this.startGame.bind(this), 3000);
            });
        })        
    }

}