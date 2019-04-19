import Scene from './scene.js';
import {loadImage} from './loader.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class TitleScene extends Scene {

    constructor() {
        super();

        this.addElement('background', () => {
            loadImage('../img/background/forest.gif').then(image => {
                context.drawImage(image, 0, 0);
            });
        }, 0);
    }


}