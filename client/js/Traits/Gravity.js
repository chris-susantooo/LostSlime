import Trait from '../Trait.js';

export default class Gravity extends Trait {

    constructor() {
        super('gravity');
        this.vel = 1200;
    }

    update(entity, deltaTime) {
        entity.vel.y += this.vel * deltaTime;
    }
}