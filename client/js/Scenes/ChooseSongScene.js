import Scene from './Base/Scene.js';
import { loadImage } from '../loaders.js';
import Entity from '../Entity.js';
import { Vec2, getScaledMid } from '../util.js';
import LoadScene from './LoadScene.js';
import JoinRoomScene from './JoinRoomScene.js';
import TitleScene from './TitleScene.js';

const canvas = document.getElementById('canvas');

const TRACK_MEDIUM = ['/json/ShapeOfYou.json', '/song/Shape Of You.mp3'];
const TRACK_HARD = ['/json/MovesLikeJagger.json', '/song/Moves Like Jagger.mp3'];

export default class ChooseSongScene extends Scene {

    constructor(name, socket, gameType) {
        //initialize scene
        super(name, socket);
        this.gameType = gameType;

        this.loadVisualAssets();
    }

    loadVisualAssets() {

        loadImage('img/background/forest.gif').then(image => {
            const background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //choose song menu
        loadImage('img/chooseSongRoom/menu.png').then(image => {
            //menu background
            const songmenu = new Entity(new getScaledMid(image, canvas, 0, 0), image);
            this.addEntity('songmenu', songmenu, 1);
            //make virtual buttons
            const medium = new Entity(new Vec2(658, 366), new Image(610, 170), true);
            const hard = new Entity(new Vec2(658, 560), new Image(610, 170), true);
            //add these virtual buttons to this.entities to make them clickable
            this.addEntity('medium', medium, 2, () => {
                let next;
                if(this.gameType === 'singlePlayer') {
                    next = new LoadScene('load', this.socket, TRACK_MEDIUM[0], TRACK_MEDIUM[1], 'survival');
                } else {
                    next = new JoinRoomScene('join', this.socket, TRACK_MEDIUM[0], TRACK_MEDIUM[1]);
                }
                next.show();
            });
            this.addEntity('hard', hard, 2, () => {
                let next;
                if(this.gameType === 'singlePlayer') {
                    next = new LoadScene('load', this.socket, TRACK_HARD[0], TRACK_HARD[1], 'survival');
                } else {
                    next = new JoinRoomScene('join', this.socket, TRACK_HARD[0], TRACK_HARD[1]);
                }
                next.show();
            });
        });
        //back to main menu button
        loadImage('img/game/menu button.png').then(image => {
            const menu = new Entity(new Vec2(1920 - image.width, 0), image);
            this.addEntity('menu', menu, 2, () => {
                const title = new TitleScene('title', this.socket);
                title.show();
            });
        })
    }
}