/*  
declare scene base class
setup static variables 
*/
import { getMousePos } from './util.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

//specify game update rate
const DELTA_TIME = 1/60;

//base class for all scenes
export default class Scene {

    constructor(name, socket) {
        //socket for network communication
        this.socket = socket;
        this.name = name;

        //global scene management
        Scene.scenes[name] = this;

        //initialize scene entities and mouse borders
        this.entities = {};
        this.mouseBorders = [];

        //initialize mouse events
        this.loadMouseEvents();
    }

    loadMouseEvents() {
        //when mouse button is clicked
        $('#canvas').on('click', event => {
            const currentPos = getMousePos(canvas, event);
            const currentScene = Scene.current;
            
            for(const mb of currentScene.mouseBorders) {
                //if cursor is on top of any controls
                if(currentPos.x >= mb[0].x
                    && currentPos.x <= mb[0].x + mb[1]
                    && currentPos.y >= mb[0].y
                    && currentPos.y <= mb[0].y + mb[2]
                ) { //call the corresponding action
                    currentScene.transition(mb[3]);
                    break;
                }
            }
        });
        //when mouse is moving
        $('#canvas').on('mousemove', event => {
            //gives us control over cursor properties
            event.preventDefault();
            const currentPos = getMousePos(canvas, event);
            const currentScene = Scene.current;

            for(const mb of currentScene.mouseBorders) {
                //if cursor is on top of any controls
                if(currentPos.x >= mb[0].x
                    && currentPos.x <= mb[0].x + mb[1]
                    && currentPos.y >= mb[0].y
                    && currentPos.y <= mb[0].y + mb[2]
                ) { //change cursor type accordingly
                    canvas.style.cursor = 'pointer';
                    break;
                } else {
                    canvas.style.cursor = 'default';
                }
            }
        });
    }

    transition(action) {
        this.destroy()
        action();
    }

    addEntity(name, entity, layer, onClick) {
        //add entity to specified layer
        if(this.entities[layer]) {
            this.entities[layer][name] = entity;
        } else {
            this.entities[layer] = { [name]: entity };
        }
        //add mouse border if interactable
        if(onClick) {
            this.mouseBorders.push([entity.pos, entity.image.width, entity.image.height, onClick]);
        }
    }

    entity(name) {
        let entity = null;
        Object.values(this.entities).forEach(layer => {
            if(name in layer) {
                entity = layer[name]
            }
        });
       return entity;
    }

    delEntity(name) {
        Object.values(this.entities).forEach(layer => {
            if(name in layer) {
                //remove mouse border
                const bbIndex = this.mouseBorders.findIndex(element => {
                    return element[0].equals(layer[name].pos);
                });
                if(bbIndex !== -1) {
                    this.mouseBorders.splice(bbIndex, 1);
                }
                //remove entity itself
                delete layer[name];
            }
        });
    }

    show() {
        if(Scene.current !== this) {
            //set current scene to this scene
            Scene.current = this;
            //begin draw frames
            requestAnimationFrame(this.update.bind(this, context));
        }
    }

    destroy() {
        //turn off keyboard events if needed
        $(document).off('keydown');
        $(document).off('keyup');
        //remove this scene
        delete Scene.scenes[this.name];
        Scene.current = null;
    }

    update(context) {
        if(Scene.current == this) {
            Object.values(this.entities).forEach(layer => {
                Object.values(layer).forEach(entity => {
                    entity.update(DELTA_TIME);
                    entity.draw(context);
                });
            });
            requestAnimationFrame(this.update.bind(this, context));
        }
    }
}

//declare static properties
Scene.scenes = {};
Scene.current = null;