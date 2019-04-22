
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export class Entity {

    constructor(position, image = null, isHidden = false) {
        this.position = position;
        this.image = image;
        this.isHidden = isHidden;
    }

    update() {
        if(!isHidden) {
            context.drawImage(this.image, this.position.x, this.position.y);
        }
    }
}