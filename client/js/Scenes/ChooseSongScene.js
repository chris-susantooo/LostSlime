import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import Entity from '../Entity.js';
import { Vec2, getMousePos, getScaledMid } from '../util.js';
import LoadScene from './LoadScene.js';
import JoinRoomScene from './JoinRoomScene.js';

const canvas = document.getElementById('canvas');

export default class ChooseSongScene extends Scene {

    constructor(name, socket, gameSpecific) {
        super(name, socket);
        this.gameSpecific = gameSpecific;

        this.loadVisualAsset();
        this.setupMouseEvents();
    }

    setupMouseEvents() {
        this.mouseClick = function onMouseClick(event) {
            const currentPosition = getMousePos(canvas, event);
            Object.entries(Scene.current.mouseBorders).forEach(entry => {
                if(currentPosition.x >= entry[1][0].x
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
            const currentPosition = getMousePos(canvas, event);
            try {
                Object.entries(Scene.current.mouseBorders).forEach(entry => {
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

        if (target === 'menu') {
            this.destroy();
            const title = Scene.scenes['title'];
            title.show();
        } else {
            if (this.gameSpecific === 'singlePlayer') {
                if (target === 'medium') {
                    const loadScene = new LoadScene('load', this.socket, '/json/ShapeOfYou.json', '/song/Shape Of You.mp3', 'survival');
                    loadScene.show();
                } else if (target === 'hard') {
                    const loadScene = new LoadScene('load', this.socket, '/json/MovesLikeJagger.json', '/song/Moves Like Jagger.mp3', 'survival');
                    loadScene.show();
                }
            } else {
                if (target === 'medium') {
                    const join = new JoinRoomScene('join', this.socket, '/json/ShapeOfYou.json', '/song/Shape Of You.mp3');
                    join.show();
                } else if (target === 'hard') {
                    const join = new JoinRoomScene('join', this.socket, '/json/MovesLikeJagger.json', '/song/Moves Like Jagger.mp3');
                    join.show();
                }
            }
        }
    }

    loadVisualAsset() {

        loadImage('img/background/forest.gif').then(image => {
            const background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });

        loadImage('img/chooseSongRoom/menu.png').then(image => {
            const songmenu = new Entity(new getScaledMid(image, canvas, 0, 0), image);
            this.addEntity('songmenu', songmenu, 1);
            this.mouseBorders['medium'] = [new Vec2(658, 366), new Vec2(1269, 535)];
            this.mouseBorders['hard'] = [new Vec2(658, 560), new Vec2(1269, 729)];
        });

        loadImage('img/game/menu button.png').then(image => {
            const menu = new Entity(new Vec2(1920 - image.width, 0), image);
            this.addEntity('menu', menu, 2);
            this.mouseBorders['menu'] = [menu.pos, new Vec2(menu.pos.x + image.width, menu.pos.y + image.height)];
        })
    }
}