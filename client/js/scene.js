
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class Scene {

    constructor(name, socket) {
        //socket for network communication
        this.socket = socket;

        //global scene management
        this.entities = {};
        Scene.scenes[name] = this;

        //mouse events template
        this.mouseBoundingBoxes = {};
        this.mouseClick;
        this.mouseMove;
    }

    addEntity(name, entity, layer) {
        if(this.entities[layer]) {
            this.entities[layer][name] = entity;
        } else {
            this.entities[layer] = { [name]: entity };
        }
        
    }

    entity(name) {
        for(let layer in this.entities) {
            if(name in layer) {
                return layer[name];
            }
        }
    }
    delEntity(name) {
        for(let layer in this.entities) {
            if(name in layer) {
                delete layer[name];
            }
        }
    }

    show() {
        if(Scene.currentScene !== this) {
            $('#canvas').off('click');
            $('#canvas').off('mousemove');
            //set current scene to this scene
            Scene.currentScene = this;
            //setup click and mousemove events
            $('#canvas').on('click', { extra: this.mouseBoundingBoxes }, this.mouseClick);
            $('#canvas').on('mousemove', { extra: this.mouseBoundingBoxes }, this.mouseMove);

            //begin draw frames
            requestAnimationFrame(this.update.bind(this, context));
        }
    }

    destroy() {
        delete Scene.scenes[this.name];
    }

    update(context) {
        if(Scene.currentScene == this) {
            Object.values(this.entities).forEach(layer => {
            Object.values(layer).forEach(entity => {
                entity.update(context);
            });
        });
        requestAnimationFrame(this.update.bind(this, context));
        }
    }
}

Scene.scenes = {};
Scene.currentScene = null;