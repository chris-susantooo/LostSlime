import Scene from '../Scene.js';
import { loadImage } from '../loaders.js';
import { Entity } from '../Entity.js';
import { Vec2, calScaledMid, getMousePos } from '../util.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// function loadJSON(callback) {   
//     var xobj = new XMLHttpRequest();
//         xobj.overrideMimeType("application/json");
//     xobj.open('GET', './js/Scenes/test.json', false); 
//     xobj.onreadystatechange = function () {
//           if (xobj.readyState == 4 && xobj.status == "200") {
//             // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
//             callback(xobj.responseText);
//           }
//     };
//     xobj.send(null);  
// }

export default class GameScene extends Scene {
    constructor(name, socket, room, beatmap, audio) {
        super(name, socket);

        this.room = room;
        this.beatmap = beatmap;
        this.audio = audio;

        console.log(this.room);

        this.loadVisualAssets();
        this.setupMouseEvents();
        //this.findAllowedSpaceTime();
        
    }

    //check when the space bar shd be press
    // findAllowedSpaceTime(){
    //     let accpetable = 0.5
    //     this.keytime = song_json.filter(function(item, index, array){
    //         return item.key === 'Key.space';
    //     });
    //     console.log(this.keytime)
    //     this.keytime.forEach(function(obj){
            
    //     });
    // }

    setupMouseEvents() {
        this.mouseClick = function onMouseClick(event) {
            let currentPosition = getMousePos(canvas, event);
            Object.entries(Scene.currentScene.mouseBoundingBoxes).forEach(entry => {
                if (currentPosition.x >= entry[1][0].x &&
                    currentPosition.x <= entry[1][1].x &&
                    currentPosition.y >= entry[1][0].y &&
                    currentPosition.y <= entry[1][1].y
                ) {
                    Scene.currentScene.transition(entry[0]);
                }
            });
        }

        this.mouseMove = function onMouseMove(event) {
            event.preventDefault();
            let currentPosition = getMousePos(canvas, event);
            console.log(currentPosition);
            try {
                Object.entries(Scene.currentScene.mouseBoundingBoxes).forEach(entry => {
                    if (currentPosition.x >= entry[1][0].x &&
                        currentPosition.x <= entry[1][1].x &&
                        currentPosition.y >= entry[1][0].y &&
                        currentPosition.y <= entry[1][1].y
                    ) {
                        canvas.style.cursor = 'pointer';
                        throw BreakException;
                    } else {
                        canvas.style.cursor = 'default';
                    }
                });
            } catch (e) {

            }
        }
    }

    transition(target) {
        if (target === 'menu') {
            this.destroy();
            const title = Scene.scenes['title'];
            title.show();
        }
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

        //initialize array for later instructions to load the resources below:
        let promises = [];

        //load backgrounds
        for (const name of ['forest', 'sky', 'sky2', 'sky3', 'space']) {
            promises.push(loadImage('/img/background/' + name + '.gif'));
        }
        //load slimes
        for (const player of this.room.players) {
            promises.push(loadImage('/img/game/slimes/' + player.color + '.png'))
        }
        //load pillar and UI elements
        for (const name of ['icepillar', 'combo', 'counting_beat', 'leaderboard', 'menu button', 'panel', 'press_spacebar']) {
            promises.push(loadImage('/img/game/' + name + '.png'));
        }

        //feed array to setup promise
        Promise.all(promises).then((resources) => {
                let index = 0;
                //add backgrounds to this.entities, only forest is initially visible
                for (const name of ['forest', 'sky', 'sky2', 'sky3', 'space']) {
                    const background = new Entity(new Vec2(0, 0), resources[index++], name !== 'forest'); //true gives hidden
                    this.addEntity(name, background, 0);
                }
                //add slimes to this.entities
                let i = 1;
                for (const player of this.room.players) {
                    const slime = new Entity(calScaledMid(resources[index], canvas), resources[index++]);
                    this.addEntity('player' + i.toString(), slime, 1);
                }
            })        
    }

}