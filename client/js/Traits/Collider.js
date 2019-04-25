import Trait from "../Trait.js";
import Scene from "../Scene.js";
import {Vec2} from "../util.js";

export default class Collider extends Trait {
    
    constructor() {
        super('collider');
    }

    update(entity) {
        const slots = Scene.currentScene.slots;
        for (const playerID in slots) {
            if (slots[playerID].slime === entity) {
                const pillars = slots[playerID].pillars;
                if (entity.pos.y >= pillars[pillars.length - 1].pos.y - 115 + 10) {
                    entity.pos.y = pillars[pillars.length - 1].pos.y - 115 + 10;
                    entity.vel = new Vec2(0, 0);
                }
            }
        }
    }
}