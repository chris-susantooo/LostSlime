import Scene from './Base/Scene.js';
import { loadImage } from '../loaders.js';
import Entity from '../Entity.js';
import WaitingRoomScene from './WaitingRoomScene.js';
import ChooseSongScene from './ChooseSongScene.js';
import { Vec2, getScaledMid } from '../util.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const KEYS = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-_=+,./<>? ';

export default class JoinRoomScene extends Scene {

    constructor(name, socket, jsonURL, songURL) {
        super(name, socket);

        this.loadVisualAssets();

        this.jsonURL = jsonURL;
        this.songURL = songURL;

        this.playername = '';
        this.roomname = '';
        this.color = 'blue';
        this.focus = 'playername';
        this.setupKeyEvents();
    }

    setupKeyEvents() {
        $(document).on('keydown', e => {
            if(!e.repeat) {
                const currentScene = Scene.current;
                if(e.key === 'Backspace') { //remove last character
                    if(currentScene.focus === 'playername') { //player name field in focus
                        currentScene.playername = currentScene.playername.slice(0, -1);
                    } else { //room name field in focus
                        currentScene.roomname = currentScene.roomname.slice(0, -1);
                    }
                } else if(e.key === 'Enter') { //equivalent to clicking join or create
                    if(currentScene.playername && currentScene.roomname) {
                        currentScene.registerPlayer(currentScene.playername, currentScene.color).then(player => {
                            currentScene.gotoRoom('create', currentScene.roomname).then(response => {
                                if(response !== 'createFail') { //create room success
                                    const room = new WaitingRoomScene('room', currentScene.socket, response, currentScene.jsonURL, currentScene.songURL);
                                    room.show();
                                } else {
                                    currentScene.gotoRoom('join', currentScene.roomname).then(response => {
                                        const room = new WaitingRoomScene('room', currentScene.socket, response, currentScene.jsonURL, currentScene.songURL);
                                        room.show();
                                    });
                                }
                            });
                        });
                    }
                } else if(e.key === 'Tab') { //switch focus
                    event.preventDefault();
                    currentScene.focus = currentScene.focus === 'playername' ? 'roomname' : 'playername';
                } else if(KEYS.indexOf(e.key) !== -1 ) {
                    if (currentScene.focus === 'playername' && currentScene.playername.length <= 12) {
                        currentScene.playername += e.key;
                    } else if (currentScene.focus === 'roomname' && currentScene.roomname.length <= 12) {
                        currentScene.roomname += e.key;
                    }
                }
            }
        });
    }

    registerPlayer(name, color) {
        return new Promise(resolve => {
            Scene.current.socket.emit('register', name, color, player => {
                resolve(player);
            });
        });
    }

    gotoRoom(type, name) {
        return new Promise(resolve => {
            Scene.current.socket.emit(type, name, response => {
                resolve(response);
            });
        });
    }

    changeColor() {
        switch(this.color) {
            case 'blue':
                this.color = 'green';
                break;
            case 'green':
                this.color = 'pink';
                break;
            case 'pink':
                this.color = 'yellow';
                break;
            case 'yellow':
                this.color = 'blue';
                break;
        }

        loadImage('/img/join_room/' + this.color + '_player.png').then(image => {
            this.entity('slime').image = image;
        });
    }

    loadVisualAssets() {
        //initialize promises array with load background promise
        const promises = [loadImage('/img/join_room/bg.gif')];
        //add all remaining promises
        for(const name of ['inputname&roomnumber', 'joingbutton', 'createbutton', 'backarrow', 'blue_player']) {
            promises.push(loadImage('/img/join_room/' + name + '.png'));
        }

        //resolve the promises
        Promise.all(promises).then(resources => {
            const currentScene = Scene.current;
            let index = 0;
            //create entity objects with the loaded images
            const background = new Entity(new Vec2(0, 0), resources[index++]);
            const panel = new Entity(getScaledMid(resources[index], canvas, 0, -80), resources[index++]);
            const join = new Entity(getScaledMid(resources[index], canvas, 0, -220), resources[index++]);
            const create = new Entity(getScaledMid(resources[index], canvas, 0, -400), resources[index++]);
            const arrow = new Entity(getScaledMid(resources[index], canvas, 500, 300), resources[index++]);
            const slime = new Entity(getScaledMid(resources[index], canvas, resources[index].width / 1.5, 550), resources[index++]);
            //virtual entities for textboxes
            const playerfield = new Entity(new Vec2(900, 435), new Image(260, 55), true);
            const roomfield = new Entity(new Vec2(900, 510), new Image(260, 40), true);

            //override individual draw functions to achieve custom results
            panel.draw = function drawPanel() {
                context.fillStyle = "#000000"; //set canvas text color to black
                context.drawImage(this.image, this.pos.x, this.pos.y);
                context.font = '50px Annie Use Your Telescope';
                context.textAlign = "start";
                const playernameLocation = new Vec2(910, 480);
                context.fillText(currentScene.playername, playernameLocation.x, playernameLocation.y);
                const roomnameLocation = new Vec2(910, 550);
                context.fillText(currentScene.roomname, roomnameLocation.x, roomnameLocation.y);
            }
            slime.draw = function drawSlimeColor() {
                context.drawImage(this.image, this.pos.x, this.pos.y, this.image.width * 1.5, this.image.height * 1.5);
            }

            //add the created static entities to this scene
            this.addEntity('background', background, 0);
            this.addEntity('panel', panel, 1);

            //add the created interactable entites to this scene
            this.addEntity('join', join, 2, () => {
                if(this.playername && this.roomname) {
                    this.registerPlayer(this.playername, this.color).then(player => {
                        this.gotoRoom('join', this.roomname).then(response => {
                            const room = new WaitingRoomScene('room', this.socket, response, this.jsonURL, this.songURL);
                            room.show();
                        });
                    });
                }
            });
            this.addEntity('create', create, 2, () => {
                if(this.playername && this.roomname) {
                    this.registerPlayer(this.playername, this.color).then(player => {
                        this.gotoRoom('create', this.roomname).then(response => {
                            if(response !== 'createFail') {
                                const room = new WaitingRoomScene('room', this.socket, response, this.jsonURL, this.songURL);
                                room.show();
                            }
                        });
                    });
                }
            });
            this.addEntity('arrow', arrow, 2, () => {
                const choose = new ChooseSongScene('choose', this.socket, 'multiPlayer');
                choose.show();
            });
            this.addEntity('slime', slime, 2, () => {
                this.changeColor();
            }, 1.5);

            //add the virtual textboxes
            this.addEntity('playerField', playerfield, 2, () => {
                this.focus = 'playername';
            }, 1, 'text');
            this.addEntity('roomField', roomfield, 2, () => {
                this.focus = 'roomname';
            }, 1, 'text');
        });
    }
}