
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export class Entity {

    constructor(position, image = null) {
        this.position = position;
        this.image = image;
    }

    update() {
        context.drawImage(this.image, this.position.x, this.position.y);
    }
}