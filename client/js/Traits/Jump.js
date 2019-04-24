import Trait from '../Trait.js';
import { Vec2 } from '../util.js';

export default class Jump extends Trait {

    constructor() {
        super('jump');
        this.vel = -1500;
        this.activated = false;
    }

    jump() {
        this.activated = true;
    }

    update(entity, deltaTime) {
        if (entity.position.y >= 699) {
            entity.position.y = 699;
            entity.vel = new Vec2(0, 0);
        }
        if(this.activated) {
            entity.vel.y += this.vel;
            this.activated = false;
        }
    }
}