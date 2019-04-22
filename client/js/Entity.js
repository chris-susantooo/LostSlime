import Camera from './Camera.js';

export class Entity {

    constructor(position, image = null, isHidden = false) {
        this.position = position;
        this.image = image;
        this.isHidden = isHidden;
    }

    update(context, camera) {
        if(!this.isHidden) {
            if(camera instanceof Camera) {
                context.drawImage(this.image, this.position.x - camera.pos.x, this.position.y - camera.pos.y);
            } else {
                context.drawImage(this.image, this.position.x, this.position.y);
            }
        }
    }
}