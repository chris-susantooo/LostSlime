
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

    //switches current scene to calling instance, begin drawing
    show() {
        if(Scene.currentScene != this) {
            Scene.currentScene = this;
            this.draw();
        }
    }

    //continuously draw on canvas through recursing requestAnimationFrame
    draw() {
        Object.values(this.elements).forEach(layer => {
            Object.values(layer).forEach(element => {
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');
                element();
            });
        });
        if(Scene.currentScene == this) {
            window.requestAnimationFrame(this.draw.bind(this));
        }
    }
}
//static variable scenes
Scene.scenes = [];
Scene.currentScene = null;