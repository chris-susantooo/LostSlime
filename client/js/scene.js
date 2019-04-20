
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class Scene {

    constructor() {
        this.entities = {};
        Scene.scenes.push(this);
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
        if(Scene.currentScene != this) {
            Scene.currentScene = this;
            requestAnimationFrame(this.update.bind(this, context));
        }
    }

    update(context) {
        Object.values(this.entities).forEach(layer => {
            Object.values(layer).forEach(entity => {
                entity.update(context);
            });
        });
        requestAnimationFrame(this.update.bind(this, context));
    }

}

Scene.scenes = [];
Scene.currentScene = null;