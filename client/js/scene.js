
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class Scene {

    constructor() {
        //global scene management
        this.entities = {};
        Scene.scenes.push(this);

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
        $('#canvas').off('click');
        $('#canvas').off('mousemove');
        if(Scene.currentScene !== this) {
            //set current scene to this scene
            Scene.currentScene = this;
            //setup click and mousemove events
            $('#canvas').on('click', { extra: this.mouseBoundingBoxes }, this.mouseClick);
            $('#canvas').on('mousemove', { extra: this.mouseBoundingBoxes }, this.mouseMove);
            //begin draw frames
            requestAnimationFrame(this.update.bind(this, context));
        }
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

Scene.scenes = [];
Scene.currentScene = null;