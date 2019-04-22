import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

function loadJSON(callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', './js/Scenes/test.json', true); 
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }

let actual_json = (key,value) => console.log(`${key} : ${value}`);
loadJSON(function(response){
    actual_json = JSON.parse(response.song);
});

alert(JSON.stringify('./js/Scenes/test.json'));

function match(item, fileter){
    var keys = Object.keys(filter);
    return keys.some(function(key){
        if (item[key] == filter[key]){
            return item;
        }
    });
}

export default class GameScene extends Scene {
    constructor() {
        super();
        this.test = "test";
        console.log(this.test);
        this.loadVisualAssets();
        this.jsonfile = actual_json;
        console.dir(actual_json);
    }

    loadVisualAssets() {
        //add entity as background
        loadImage('/img/pvp_game_room/forest.gif').then(image => {
            let background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });
        //elements
        loadImage('/img/pvp_game_room/blue.png').then(image => {
            let main = new Entity(calScaledMid(image, canvas, 0, -600), image);
            this.addEntity('main', main, 1);
        });
        loadImage('/img/pvp_game_room/icepillar.png').then(image => {
            let ice = new Entity(calScaledMid(image, canvas, 0, -1000), image);
            this.addEntity('ice', ice, 1);
        });
        
        
    }

}