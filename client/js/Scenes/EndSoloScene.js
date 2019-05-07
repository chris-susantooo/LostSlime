import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import Entity from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const moves = ['Perfect', 'Excellent', 'Good', 'Bad', 'Miss'];

export default class EndSoloScene extends Scene {
    
    constructor(score, moveCount) {

        super();

        this.loadVisualAssets();

        this.setupMouseEvents();

        this.score = score;
        this.moveCount = moveCount;

        const displayScore = new Entity(new Vec2(0, 0), null, true);
        displayScore.update = () => {
            this.displayScore(this.score, this.moveCount);
        }
        this.addEntity('displayScore', displayScore, 10);

    }

    displayScore(score, moveCount) {
        context.font = "100px Annie Use Your Telescope";
        context.fillStyle = "#FFFFFF";
        context.textAlign = "center";
        context.fillText("Score: " + score, 960, 300);
        
        let i = 0;
        let space = 100;
        for (const move of moveCount) {
            context.fillText(moves[i] + ':' + move, 960, 400+space*(i+1));
            i++;
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
            const title = Scene.scenes['title'];
            title.show();
        }
    }

    loadVisualAssets() {
        //add entity as background
        loadImage('/img/background/highsky.gif').then(image => {
            let background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        
        //buttons
        loadImage('/img/game/menu button.png').then(image => {
            let menu = new Entity(calScaledMid(image, canvas, -1600, 1000), image);
            this.addEntity('menu', menu, 1);
            this.mouseBoundingBoxes['menu'] = [menu.pos, new Vec2(menu.pos.x + image.width, menu.pos.y + image.height)];
        });
        
    }
}