
import { Vec2 } from './util.js';

export default class Camera {

    constructor() {
        this.pos = new Vec2(0, 0);
        this.targetEntity = null;
    }

    follow(entity) {
        this.targetEntity = entity;
    }

    update(PARALLAX_MULTIPLIER) {
        if (this.targetEntity) {
            if (this.targetEntity.pos.y - 540 < -4320 * PARALLAX_MULTIPLIER) {
                this.pos.y = -4320 * PARALLAX_MULTIPLIER;
            }
            else if (this.targetEntity.pos.y - 540 > 0) {
                this.pos.y = 0;
            } else {
                this.pos.y = this.targetEntity.pos.y - 540;
            }
        }
    }
}