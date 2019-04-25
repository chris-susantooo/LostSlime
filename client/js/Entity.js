import Camera from './Camera.js';
import { Vec2 } from './util.js';
import Scene from './Scene.js';

export class Entity {

    constructor(pos, image = null, isHidden = false, camera = null, parallax = false) {
        this.pos = pos;
        this.vel = new Vec2(0, 0);
        this.image = image;
        this.isHidden = isHidden;
        this.camera = camera;
        this.parallax = parallax;
        this.traits = [];
    }

    addTrait(trait) {
        this.traits.push(trait);
        this[trait.name] = trait;
    }

    update(deltaTime) {
        for (const trait of this.traits) {
            console.log(this, trait);
            trait.update(this, deltaTime);
        }
    }

    draw(context, PARALLAX_MULTIPLIER) {
        if (!this.isHidden) {
            if (this.camera) {
                if (this.parallax) {
                    context.drawImage(this.image, this.pos.x - this.camera.pos.x, this.pos.y - this.camera.pos.y / PARALLAX_MULTIPLIER);
                }
                else {
                    context.drawImage(this.image, this.pos.x - this.camera.pos.x, this.pos.y - this.camera.pos.y);
                }
                
            } else {
                context.drawImage(this.image, this.pos.x, this.pos.y);
            }
        }
    }
}