import Trait from '../Trait.js';
import { Vec2 } from '../util.js';

export default class Jump extends Trait {

    //jump duration is 1s
    constructor() {
        super('jump');
        this.vel = -1000;
        this.activated = false;
    }

    jump() {
        this.activated = true;
    }

    update(entity) {
        if(this.activated) {
            entity.vel.y += this.vel;
            this.activated = false;
        }
    }
}