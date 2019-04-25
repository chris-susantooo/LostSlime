
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class Scene {

    constructor(name, socket) {
        //socket for network communication
        this.socket = socket;
        this.name = name;

        //global scene management
        this.entities = {};
        Scene.scenes[name] = this;

        //mouse events template
        this.mouseBoundingBoxes = {};
        this.mouseClick;
        this.mouseMove;

        //update related
        this.deltaTime = 1/60;
        this.lastTime = 0;
        this.accuTime = 0;
    }

    addEntity(name, entity, layer) {
        if(this.entities[layer]) {
            this.entities[layer][name] = entity;
        } else {
            this.entities[layer] = { [name]: entity };
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
                delete layer[name];
            }
        });
        if(name in this.mouseBoundingBoxes) {
            delete this.mouseBoundingBoxes[name];
        }
    }

    show() {
        if(Scene.currentScene !== this) {
            $('#canvas').off('click');
            $('#canvas').off('mousemove');
            //set current scene to this scene
            Scene.currentScene = this;
            //setup click and mousemove events
            $('#canvas').on('click', this.mouseClick);
            $('#canvas').on('mousemove', this.mouseMove);

            //begin draw frames
            requestAnimationFrame(this.update.bind(this, context, this.camera));
        }
    }

    destroy() {
        $('#canvas').off('click');
        $('#canvas').off('mousemove');
        $(document).off('keydown');
        $(document).off('keyup');

        this.entities = {};
        delete Scene.scenes[this.name];
        Scene.currentScene = null;
    }

    update(context, camera) {
        if(Scene.currentScene == this) {
            const time = performance.now();
            this.accuTime += (time - this.lastTime) / 1000;
            while (this.accuTime > this.deltaTime) {
                Object.values(this.entities).forEach(layer => {
                    Object.values(layer).forEach(entity => {
                        entity.update(this.deltaTime);
                        entity.draw(context, camera);
                    });
                });
                this.accuTime -= this.deltaTime;
            }
            this.lastTime = time;
        requestAnimationFrame(this.update.bind(this, context));
        }
    }
}

Scene.scenes = {};
Scene.currentScene = null;