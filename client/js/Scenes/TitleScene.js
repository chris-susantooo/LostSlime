import Scene from './Base/Scene.js';
import { loadImage } from '../loaders.js';
import Entity from '../Entity.js';
import { Vec2, getScaledMid } from '../util.js';
import ChooseSongScene from './ChooseSongScene.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class TitleScene extends Scene {

    constructor(name, socket) {
        super(name, socket);
        this.loadVisualAssetss();
    }

    loadVisualAssetss() {
        //initialize promises array with a load-background-promise
        const promises = [loadImage('/img/background/forest.gif')];
        //add all remaining loadImage promises
        for(const name of ['white filter', 'Menu', 'newpvpbutton', 'newsurvivalbutton',
            'title_1', 'char1', 'char2', 'char3', 'char4']) 
        {
            promises.push(loadImage('/img/title/' + name + '.png'));
        }

        //resolve the promises
        Promise.all(promises).then(resources => {
            let index = 0;
            //create entity objects with the loaded images
            const background = new Entity(new Vec2(0, 0), resources[index++]);
            const filter = new Entity(new Vec2(0, 0), resources[index++]);
            const menu = new Entity(getScaledMid(resources[index], canvas, 0, -400), resources[index++]);
            const pvp = new Entity(getScaledMid(resources[index], canvas, 0, -550), resources[index++]);
            const survival = new Entity(getScaledMid(resources[index], canvas, 0, -300), resources[index++]);
            const title = new Entity(getScaledMid(resources[index], canvas, 0, 550), resources[index++]);
            const yellowSlime = new Entity(getScaledMid(resources[index], canvas, 500, 800), resources[index++]);
            const pinkSlime = new Entity(getScaledMid(resources[index], canvas, 1700, -800), resources[index++]);
            const greenSlime = new Entity(getScaledMid(resources[index], canvas, -500, -800), resources[index++]);
            const blueSlime = new Entity(getScaledMid(resources[index], canvas, -1200, 200), resources[index++]);

            //override individual draw functions to achieve custom results
            pinkSlime.draw = function drawSlime() {
                context.drawImage(this.image, this.pos.x, this.pos.y, this.image.width * 2, this.image.height * 2);
            }
            blueSlime.draw = function drawSlime() {
                context.drawImage(this.image, this.pos.x, this.pos.y, this.image.width / 4, this.image.height / 4);
            }

            //add the created static entities to this scene
            this.addEntity('background', background, 0);
            this.addEntity('filter', filter, 1);
            this.addEntity('menu', menu, 2);
            this.addEntity('title', title, 3);
            this.addEntity('yellowSlime', yellowSlime, 2);
            this.addEntity('pinkSlime', pinkSlime, 2);
            this.addEntity('greenSlime', greenSlime, 3);
            this.addEntity('blueSlime', blueSlime, 2);

            //add the created interactable entities to this scene
            this.addEntity('pvp', pvp, 3, () => {
                const choose = new ChooseSongScene('choose', this.socket, 'multiPlayer');
                choose.show();
            });
            this.addEntity('survival', survival, 3, () => {
                const choose = new ChooseSongScene('choose', this.socket, 'singlePlayer');
                choose.show();
            });
        });
    }
 }