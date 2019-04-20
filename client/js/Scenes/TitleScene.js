import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid } from '../util.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class TitleScene extends Scene {

    constructor() {
        super();

        //add entity as background
        loadImage('/img/background/forest.gif').then(image => {
            let background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //white filter
        loadImage('/img/title/white filter.png').then(image => {
            let filter = new Entity(calScaledMid(image, canvas), image);
            this.addEntity('filter', filter, 1);
        });
        //menu panel backtround
        loadImage('/img/title/Menu.png').then(image => {
            let menu = new Entity(calScaledMid(image, canvas, 0, -400), image);
            this.addEntity('menu', menu, 2);
        });
        //buttons
        loadImage('/img/title/pvp button.png').then(image => {
            let pvp = new Entity(calScaledMid(image, canvas, 0, -250), image);
            //override update method when mouse hover
            this.addEntity('pvp', pvp, 3);
        });
        loadImage('/img/title/HighScore button.png').then(image => {
            let highscore = new Entity(calScaledMid(image, canvas, 0, -425), image);
            //override update method when mouse hover
            this.addEntity('highscore', highscore, 3);
        });
        loadImage('/img/title/survival button.png').then(image => {
            let survival = new Entity(calScaledMid(image, canvas, 0, -600), image);
            //override update method when mouse hover
            this.addEntity('survival', survival, 3);
        });
        //title
        loadImage('/img/title/title_1.png').then(image => {
            let title = new Entity(calScaledMid(image, canvas, 0, 550), image);
            this.addEntity('title', title, 3);
        });
        //slimes
        loadImage('/img/title/char1.png').then(image => {
            let yellowSlime = new Entity(calScaledMid(image, canvas, 500, 800), image);
            this.addEntity('yellowSlime', yellowSlime, 2);
        });
        loadImage('/img/title/char2.png').then(image => {
            let pinkSlime = new Entity(calScaledMid(image, canvas, 1700, -800), image);
            //override to scale 2x
            pinkSlime.update = function updatePinkSlime() {
                context.drawImage(this.image, this.position.x, this.position.y, image.width * 2, image.height * 2);
            }
            this.addEntity('pinkSlime', pinkSlime, 2);
        });
        loadImage('/img/title/char3.png').then(image => {
            let greenSlime = new Entity(calScaledMid(image, canvas, -500, -800), image);
            this.addEntity('greenSlime', greenSlime, 2);
        });
        loadImage('/img/title/char4.png').then(image => {
            let blueSlime = new Entity(calScaledMid(image, canvas, -1200, 200), image);
            //override to scale 2x
            blueSlime.update = function updatePinkSlime() {
                context.drawImage(this.image, this.position.x, this.position.y, image.width / 4, image.height / 4);
            }
            this.addEntity('blueSlime', blueSlime, 2);
        });
    }
}