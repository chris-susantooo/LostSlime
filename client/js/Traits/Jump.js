import Trait from '../Trait.js';

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
        if(this.activated) {
            entity.vel.y += this.vel;
            this.activated = false;
        }
    }
}