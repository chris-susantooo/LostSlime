import Camera from './Camera.js';
import { Vec2 } from './util.js';
import Scene from './Scene.js';

export class Entity {

    constructor(pos, image = null, isHidden = false) {
        this.pos = pos;
        this.vel = new Vec2(0, 0);
        this.image = image;
        this.isHidden = isHidden;
        this.traits = [];
    }

    addTrait(trait) {
        this.traits.push(trait);
        this[trait.name] = trait;
    }

    update(deltaTime) {
        for(const trait of this.traits) {
            trait.update(this, deltaTime);
        }
    }

    draw(context, camera) {
        if(!this.isHidden) {
            if(camera instanceof Camera) {
                context.drawImage(this.image, this.pos.x - camera.pos.x, this.pos.y - camera.pos.y);
            } else {
                context.drawImage(this.image, this.pos.x, this.pos.y);
            }
        }
    }
}