import Scene from '../Scene.js';
import { loadImage, loadJSON, loadAudio } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';

const canvas = document.getElementById('canvas');

export default class HighScoreGameScene extends Scene {

    constructor(name) {
        super(name);

        this.spaces = [];
        this.captions = [];
        this.music = null;
        this.musicStart = null;

        this.loadVisualAssets();
        this.loadBeatMappingAssets();
        this.setupMouseEvents();
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

    transition(target) {
        if (target === 'menu') {
            this.music.src = '';
            this.destroy();
            const title = Scene.scenes['title'];
            title.show();
        }
    }

    startGame() {
        this.music.play();
        this.musicStart = Date.now()
    }
    
    loadBeatMappingAssets() {

        //load json into spaces array and captions array
        //spaces array are filled with timestamps where spaces are expected to be pressed
        //captions array starts with a first timestamp, followed with combined characters
        loadJSON('/json/OceanMan.json').then(beatmap => {
            //find the first timestamp for character input and push to captions array
            for(let entry of beatmap) {
                if(entry['key'] !== 'Key.space' && entry['key'] !== 'Key.enter') {
                    this.captions.push(entry['time']);
                    break;
                }
            }
            //propagate the remaining information into spaces array and captions array
            let charBuffer = '';
            for(let entry of beatmap) {
                if(entry['key'] === 'Key.space') {
                    if(charBuffer !== '') {
                        this.captions.push(charBuffer);
                        charBuffer = '';
                    }
                    this.spaces.push(entry['time']);
                } else if(entry['key'] !== 'Key.enter') {
                    charBuffer += entry['key'];
                }
            }
        });

        //load music file
        loadAudio('/song/OceanMan.mp3').then(audio => {
            this.music = audio;
            this.startGame();
        });

    }

    loadVisualAssets() {
        //add backgrounds
        loadImage('/img/solo_game_room/forest.gif').then(image => {
            let background1 = new Entity(new Vec2(0, 0), image);
            this.addEntity('forest', background1, 0);
        });
        loadImage('/img/solo_game_room/sky.gif').then(image => {
            let background2 = new Entity(new Vec2(0, 0), image, true);
            this.addEntity('sky', background2, 0);
        });
        loadImage('/img/solo_game_room/sky2.gif').then(image => {
            let background3 = new Entity(new Vec2(0, 0), image, true);
            this.addEntity('sky2', background3, 0);
        });
        loadImage('/img/solo_game_room/sky3.gif').then(image => {
            let background4 = new Entity(new Vec2(0, 0), image, true);
            this.addEntity('sky3', background4, 0);
        });
        loadImage('/img/solo_game_room/space.gif').then(image => {
            let background5 = new Entity(new Vec2(0, 0), image, true);
            this.addEntity('space', background5, 0);
        });
        //panel
        loadImage('/img/solo_game_room/panel.png').then(image => {
            let panel = new Entity(calScaledMid(image, canvas, 0, -850), image);
            this.addEntity('panel', panel, 1);
        });
        //elements
        loadImage('/img/solo_game_room/press_spacebar.png').then(image => {
            let spacebar = new Entity(calScaledMid(image, canvas, -150, -675), image);
            this.addEntity('spacebar', spacebar, 2);
        });

        //slide
        loadImage('/img/solo_game_room/counting_beat.png').then(image => {
            let slide = new Entity(calScaledMid(image, canvas, 330, -670), image);
            this.addEntity('slide', slide, 2);
        });

        //comboarea
        loadImage('/img/solo_game_room/combo.png').then(image => {
            let combospace = new Entity(new Vec2(10, 300), image);
            this.addEntity('combospace', combospace, 2);
        });

        loadImage('/img/solo_game_room/blue.png').then(image => {
            let blue = new Entity(calScaledMid(image, canvas, 0, 100), image);
            this.addEntity('blue', blue, 2);
            this.mouseBoundingBoxes['blue'] = [blue.position, new Vec2(blue.position.x + image.width, blue.position.y + image.height)];
        });

        //buttons
        loadImage('/img/solo_game_room/menu button.png').then(image => {
            let menu = new Entity(new Vec2(10, 10), image);
            this.addEntity('menu', menu, 2);
            this.mouseBoundingBoxes['menu'] = [menu.position, new Vec2(menu.position.x + image.width, menu.position.y + image.height)];
        });
    }
}