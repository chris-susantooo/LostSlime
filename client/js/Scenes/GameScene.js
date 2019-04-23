import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
var song_json;

function loadJSON(callback) {   
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', './js/Scenes/test.json', false); 
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
}


export default class GameScene extends Scene {
    constructor(name, socket, beatmap, audio) {
        super(name, socket);

        this.beatmap = beatmap;
        this.audio = audio;

        this.loadVisualAssets();
        loadJSON(function(response) {
            song_json = JSON.parse(response);
        });
        this.findAllowedSpaceTime();
        
    }

    //check when the space bar shd be press
    findAllowedSpaceTime(){
        let accpetable = 0.5
        this.keytime = song_json.filter(function(item, index, array){
            return item.key === 'Key.space';
        });
        console.log(this.keytime)
        this.keytime.forEach(function(obj){
            
        });
    }

    setupKeyEvents() {
        $(document).on('keydown', function(e) {
            if(e.keyCode==32) { //pressing space bar
                
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