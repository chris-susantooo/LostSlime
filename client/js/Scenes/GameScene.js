import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class GameScene extends Scene {

    constructor() {
        super();

        this.loadVisualAssets();
        var data = JSON.parse(fs.readFileSync('./pink.json').toString());
    }

    setupKeyEvents() {
        $(document).on('keydown', function(e) {
            if(e.keyCode==32) { //pressing space bar
                data.forEach(function(obj){ //retrieve the timestamp of space
                    spacetime=match(obj,{"key": "Key.enter"});
                });
            }
        });
    }

    match(item, fileter){
        var keys = Object.keys(filter);
        return keys.some(function(key){
            if (item[key] == filter[key]){
                return item;
            }
        });
    }

    loadVisualAssets() {
        //add entity as background
        loadImage('/img/game_room/forest.gif').then(image => {
            let background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //elements
        loadImage('/img/game_room/blue.png').then(image => {
            let main = new Entity(calScaledMid(image, canvas, 0, -600), image);
            this.addEntity('main', main, 1);
        });
        loadImage('/img/game_room/icepillar.png').then(image => {
            let ice = new Entity(calScaledMid(image, canvas, 0, -1000), image);
            this.addEntity('ice', ice, 1);
        });
        
        
    }

}