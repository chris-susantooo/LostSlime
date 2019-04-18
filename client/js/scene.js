
export default class Scene {

    constructor() {
        this.elements = {};
        Scene.scenes.push(this);
    }

    //accepts element as a function
    addElement(name, element, layer) {
        if(layer in this.elements) {
            this.elements[layer][name] = element;
        } else {
            this.elements[layer] = {
                [name]: element
            };
        }
    }

    removeElement(name) {
        for(let layer in this.elements) {
            if(name in layer) {
                delete this.elements[layer][name];
            }
        }
    }

    draw() {
        if(Scene.currentScene != this) {
            Scene.currentScene = this;
        }
        Object.values(this.elements).forEach(layer => {
            Object.values(layer).forEach(element => {
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');
                element();
            });
        });
        window.requestAnimationFrame(this.draw.bind(this));
    }
}
//static variable scenes
Scene.scenes = [];
Scene.currentScene = null;