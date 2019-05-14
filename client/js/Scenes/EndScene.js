import Scene from "../Scene.js";
import { loadImage } from "../loaders.js";
import Entity from "../Entity.js";
import { Vec2, getMousePos } from "../util.js";

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class EndScene extends Scene {

    constructor(name, socket, players) {
        super(name, socket);

        this.pillarImage = null;
        this.players = this.translatePlayers(players);

        this.blue = null;
        this.green = null;
        this.pink = null;
        this.yellow = null;

        this.loadVisualAssets();
        this.setupMouseEvents();
    }

    translatePlayers(playerObjects) {
        const players = [];
        for (const playerObject of playerObjects) {
            const player = [
                                playerObject.score, 
                                playerObject.maxcombo, 
                                playerObject.name, 
                                playerObject.color, 
                                playerObject.perfect, 
                                playerObject.excellent, 
                                playerObject.good, 
                                playerObject.bad, 
                                playerObject.miss
                            ];
            players.push(player);
        }
        players.sort((a, b) => {b[0] - a[0]});
        return players;
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
            this.blue = resources[index++];
            const blue = new Entity(new Vec2(0, 300), this.blue, true);
            this.green = resources[index++];
            const green = new Entity(new Vec2(0, 300), this.green, true);
            this.pink = resources[index++];
            const pink = new Entity(new Vec2(0, 300), this.pink, true);
            this.yellow = resources[index++];
            const yellow = new Entity(new Vec2(0, 300), this.yellow, true);
            this.pillarImage = resources[index++];
            for (let i = 0; i < 4; i++) {
                const pillar = new Entity(new Vec2(80 + i * 480, 480), this.pillarImage);
                this.addEntity('pillar' + (i + 1).toString(), pillar, 2);
            }
            const leavebtn = new Entity(new Vec2(1490, 960), resources[index++]);
            const first = new Entity(new Vec2(0, 450), resources[index++], true);
            const second = new Entity(new Vec2(0, 450), resources[index++], true);
            const third = new Entity(new Vec2(0, 450), resources[index++], true);
            const forth = new Entity(new Vec2(0, 450), resources[index++], true);
            const statistics = new Entity(null, null, true);
            statistics.update = () => {
                context.font = context.font = "60px Annie Use Your Telescope";
                context.fillStyle = "#ffffff";
                context.textAlign = 'center';
                let i = 0;
                for (const player of this.players) {
                    context.fillText(player[2], 240 + i * 480, 250);
                    context.fillText('Score: ' + player[0], 240+ i * 480, 720);
                    context.fillText('Max Combo: ' + player[1], 240 + i * 480, 780);
                    context.fillText(player[4] + ' / ' + player[5] + ' / ' + player[6] + ' / ' + player[7] + ' / ' + player[8], 240 + i * 480, 900);
                    i++;
                }
            };
            
            this.addEntity('background', background, 0);
            this.addEntity('layout', layout, 1);
            //attempt to fix same color
            let i = 0;
            for (const player of this.players) {
                let playerEntity = null;
                if (player[3] == 'blue') {
                    playerEntity = new Entity(new Vec2(0, 300), this.blue, true);
                }
                else if (player[3] == 'green') {
                    playerEntity = new Entity(new Vec2(0, 300), this.green, true);
                }
                else if (player[3] == 'pink') {
                    playerEntity = new Entity(new Vec2(0, 300), this.pink, true);
                }
                else {
                    playerEntity = new Entity(new Vec2(0, 300), this.yellow, true);
                }
                this.addEntity(i, playerEntity, 3);
                i++;
            }
            //this.addEntity('blue', blue, 3);
            //this.addEntity('green', green, 3);
            //this.addEntity('pink', pink, 3);
            //this.addEntity('yellow', yellow, 3);
            this.addEntity('first', first, 4);
            this.addEntity('second', second, 4);
            this.addEntity('third', third, 4);
            this.addEntity('forth', forth, 4);
            this.addEntity('statistics', statistics, 5);
            this.addEntity('leavebtn', leavebtn, 4);

            i = 0;
            const smiles = ['first', 'second', 'third', 'forth'];
            for (const player of this.players) {
                this.entity(i).pos.x = 120 + i * 480;
                this.entity(i).isHidden = false;
                this.entity(smiles[i]).pos.x = 205 + i * 480;
                this.entity(smiles[i]).isHidden = false;
                i++;
            }

            //bounding boxes
            this.mouseBoundingBoxes['menu'] = [leavebtn.pos, new Vec2(leavebtn.pos.x + leavebtn.image.width, leavebtn.pos.y + leavebtn.image.height)];
        });
    }
}