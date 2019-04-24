import Camera from './Camera.js';

export class Entity {

    constructor(position, velocity, image = null, isHidden = false) {
        this.position = position;
        this.velocity = velocity;
        this.image = image;
        this.isHidden = isHidden;
    }

    update() {

    }

    draw(context, camera) {
        if(!this.isHidden) {
            if(camera instanceof Camera) {
                context.drawImage(this.image, this.position.x - camera.pos.x, this.position.y - camera.pos.y);
            } else {
                context.drawImage(this.image, this.position.x, this.position.y);
            }
        }
    }
}