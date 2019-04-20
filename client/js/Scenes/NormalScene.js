import Scene from '../Scene.js';
import { Entity } from '../Entity.js';
import { Vec2 } from '../util.js';
import { loadImage } from '../loaders.js';

export default class NormalScene extends Scene {

    constructor(socket) {
        super();
        this.socket = socket;

        //add entity as background
        loadImage('/img/background/forest.gif').then(image => {
            let background = new Entity('background', new Vec2(0, 0), image);
            background.update = function updateBackground(context) {
                context.drawImage(this.image, this.position.x, this.position.y);
            }
            this.addEntity('background', background, 0);
        });
    }
}