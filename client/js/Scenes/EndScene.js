import Scene from "../Scene.js";
import { loadImage } from "../loaders.js";
import { Entity } from "../Entity.js";
import { Vec2, getMousePos } from "../util.js";

export default class EndScene extends Scene {

    constructor(name, socket, players) {
        super(name, socket);

        this.pillarImage = null;

        this.setupNetworkEvents();
        this.loadVisualAssets();
        this.setupMouseEvents();
    }

    setupNetworkEvents() {

    }

    setupMouseEvents() {
        this.mouseClick = function onMouseClick(event) {
            const currentPosition = getMousePos(canvas, event);
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
            const currentPosition = getMousePos(canvas, event);
            console.log(currentPosition);
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
            const layout = new Entity(new Vec2(26, 20), resources[index++]);
            const background = new Entity(new Vec2(0, 0), resources[index++]);
            const blue = new Entity(new Vec2(0, 300), resources[index++]);
            const green = new Entity(new Vec2(0, 300), resources[index++]);
            const pink = new Entity(new Vec2(0, 300), resources[index++]);
            const yellow = new Entity(new Vec2(0, 300), resources[index++]);
            this.pillarImage = resources[index++];
            for (let i = 0; i < 4; i++) {
                const pillar = new Entity(new Vec2(80 + i * 480, 480), this.pillarImage);
                this.addEntity('pillar' + (i + 1).toString(), pillar, 2);
            }
            const leavebtn = new Entity(new Vec2(0, 850), resources[index++]);
            const first = new Entity(new Vec2(0, 450), resources[index++]);
            const second = new Entity(new Vec2(0, 450), resources[index++]);
            const third = new Entity(new Vec2(0, 450), resources[index++]);
            const forth = new Entity(new Vec2(0, 450), resources[index++]);
            
            this.addEntity('background', background, 0);
            this.addEntity('layout', layout, 1);
            this.addEntity('blue', blue, 3);
            this.addEntity('green', green, 3);
            this.addEntity('pink', pink, 3);
            this.addEntity('yellow', yellow, 3);
            this.addEntity('first', first, 4);
            this.addEntity('second', second, 4);
            this.addEntity('third', third, 4);
            this.addEntity('forth', forth, 4);

            let i = 0;
            const smiles = ['first', 'second', 'third', 'forth'];
            for (const color of ['blue', 'green', 'pink', 'yellow']) {
                this.entity(color).pos.x = 120 + i * 480;
                this.entity(smiles[i]).pos.x = 205 + i * 480;
                i++;
            }

            
        });
    }
}