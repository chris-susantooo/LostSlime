import { Vec2 } from "./util.js";

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const PARALLAX_MULTIPLIER = 3;
const BACKGROUND_NUM = 4;

export default class Scene {

    constructor(name, socket) {
        //socket for network communication
        this.socket = socket;

        //flags to be used
        this.loaded = false;

        //global scene management
        this.entities = {};
        this.name = name;
        Scene.scenes[name] = this;

        //mouse events template
        this.mouseBoundingBoxes = {};
        this.mouseClick;
        this.mouseMove;

        //update related
        this.deltaTime = 1/60;
        this.lastTime = 0;
        this.accuTime = 0;
        this.backgroundPos = new Vec2(0, 0);
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
        if(Scene.current !== this) {
            $('#canvas').off('click');
            $('#canvas').off('mousemove');
            //set current scene to this scene
            Scene.current = this;
            //setup click and mousemove events
            $('#canvas').on('click', this.mouseClick);
            $('#canvas').on('mousemove', this.mouseMove);

            //begin draw frames
            requestAnimationFrame(this.update.bind(this, context));
        }
    }

    destroy() {
        $('#canvas').off('click');
        $('#canvas').off('mousemove');
        $(document).off('keydown');
        $(document).off('keyup');
        this.accuTime = 0;
        this.entities = {};
        delete Scene.scenes[this.name];
        Scene.current = null;
    }

    updateCamera() {
        if (this.camera && this.loaded) {
            this.camera.update(PARALLAX_MULTIPLIER);

            if (this.camera.pos.y - 540 <= this.backgroundPos.y) {
                let nextBackgroud = '';
                switch (this.backgroundPos.y) {
                    case 0:
                        nextBackgroud = 'sky';
                        break;
                    case -1080:
                        nextBackgroud = 'highsky';
                        break;
                    case -2160:
                        nextBackgroud = 'space';
                        break;
                }
                if (this.backgroundPos.y < 1080 * (BACKGROUND_NUM - 1)) {
                    this.backgroundPos.y -= 1080;
                    if (this.entity(nextBackgroud)) {
                        this.entity(nextBackgroud).pos.y = this.backgroundPos.y;
                        this.entity(nextBackgroud).isHidden = false;
                    }
                }
            }
        }
    }

    updateOrDeleteEntities(context) {
        Object.values(this.entities).forEach(layer => {
            Object.values(layer).forEach(entity => {
                entity.update(this.deltaTime);
                entity.draw(context, PARALLAX_MULTIPLIER);
            });
        });
    }

    update(context) {
        if(Scene.current == this) {
            if (this.camera) {
                //update camera first
                this.updateCamera();
                //update entities in accordance to time lapsed
                const time = performance.now();
                this.accuTime += (time - this.lastTime) / 1000;
                while (this.accuTime > this.deltaTime) {
                    this.updateOrDeleteEntities(context);
                    this.accuTime -= this.deltaTime;
                }
                this.lastTime = time;
            } else {
                this.updateOrDeleteEntities(context);
            }
        requestAnimationFrame(this.update.bind(this, context));
        }
    }
}

Scene.scenes = {};
Scene.current = null;