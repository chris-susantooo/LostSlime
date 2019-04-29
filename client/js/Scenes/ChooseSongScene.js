import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2 } from '../util.js';
import LoadScene from './LoadScene.js';

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
            Object.entries(Scene.current.mouseBoundingBoxes).forEach(entry => {
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
        
        if (target === 'arrow') {
            this.destroy();
            const title = Scene.scene['title'];
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
            const menu = new Entity(new Vec2(0, 0), image);
            this.addEntity('menu', meun, 1);
            this.mouseBoundingBoxes['medium'] = [null, new Vec2(0, 0)];
            this.mouseBoundingBoxes['hard'] = [null, new Vec2(0, 0)];
        });
    }
}