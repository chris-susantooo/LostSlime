import Scene from "../Scene.js";
import { loadImage } from "../loaders.js";
import { Entity } from "../Entity.js";
import { Vec2, getMousePos } from "../util.js";

export default class EndScene extends Scene {

    constructor(name, socket, players) {
        super(name, socket);

        this.setupNetworkEvents();
        this.loadVisualAssets();
        this.setupMouseEvents();
    }

    setupNetworkEvents() {

    }

    setupMouseEvents() {
        this.mouseClick = function onMouseClick(event) {
            let currentPosition = getMousePos(canvas, event);
            Object.entries(Scene.current.mouseBoundingBoxes).forEach(entry => {
                if (currentPosition.x >= entry[1][0].x &&
                    currentPosition.x <= entry[1][1].x &&
                    currentPosition.y >= entry[1][0].y &&
                    currentPosition.y <= entry[1][1].y
                ) {
                    Scene.current.transition(entry[0]);
                }
            });
        }

        this.mouseMove = function onMouseMove(event) {
            event.preventDefault();
            let currentPosition = getMousePos(canvas, event);
            try {
                Object.entries(Scene.current.mouseBoundingBoxes).forEach(entry => {
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
        this.destroy();
        if (target === 'menu') {
            this.socket.emit('leave', () => {
                const title = Scene.scenes['title'];
                title.show();
            });
        }
    }

    loadVisualAssets() {
        const promises = [];
        for (const name of ['1', 'bg', 'blue', 'green', 'pink', 'yellow', 'ice_pillar', 'leavebutton', '1stplace', '2ndplace', '3rdplace', '4thplace']) {
            promises.push(loadImage('/img/endscene/' + name + '.png'));
        }
        let index = 0;
        Promise.all(promises).then(resources => {
            const layout = new Entity(new Vec2(0, 0), resources[index++]);
            const background = new Entity(new Vec2(0, 0), resources[index++]);
            const blue = new Entity(new Vec2(0, 0), resources[index++]);

            this.addEntity('background', background, 0);
            this.addEntity('layout', layout, 1);
        });
    }
}