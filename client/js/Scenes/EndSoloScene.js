import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let finalScore = 0;
let finalMoveCount = [0, 0, 0, 0, 0];
let moves = ['Perfect', 'Excellent', 'Good', 'Bad', 'Miss'];

export default class EndSoloScene extends Scene {
    
    constructor(score, moveCount) {

        super();

        this.loadVisualAssets();

        this.setupMouseEvents();

        finalScore = score;
        finalMoveCount = moveCount;

        this.displayScore(finalScore, finalMoveCount);

    }

    displayScore(score, moveCount) {
        context.font = "48px Arial";
        context.fillStyle = "#0095DD";
        context.fillText("Score: " + score, 50, 60);
        
        let i = 0;
        let space = 50;
        for (const move of moveCount) {
            context.fillText(moves[i] + ':' + move, 50, 60+space*(i+1));
            i++;
        }
    }

    setupMouseEvents() {
        this.mouseClick = function onMouseClick(event) {
            let currentPosition = getMousePos(canvas, event);
            Object.entries(Scene.currentScene.mouseBoundingBoxes).forEach(entry => {
                if (currentPosition.x >= entry[1][0].x
                    && currentPosition.x <= entry[1][1].x
                    && currentPosition.y >= entry[1][0].y
                    && currentPosition.y <= entry[1][1].y
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
        loadImage('/img/background/space.gif').then(image => {
            let background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        
        //buttons
        loadImage('/img/game/menu button.png').then(image => {
            let menu = new Entity(calScaledMid(image, canvas, 0, 0), image);
            this.addEntity('menu', menu, 1);
            this.mouseBoundingBoxes['menu'] = [menu.pos, new Vec2(menu.pos.x + image.width, menu.pos.y + image.height)];
        });
        
    }
}