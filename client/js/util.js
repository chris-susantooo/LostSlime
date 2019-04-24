
export class Vec2 {

    constructor(x, y) {
        this.set(x, y);
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }
}

export function calScaledMid(image, canvas, offsetX = 0, offsetY = 0) {
    let scaleX = canvas.width / 1920;
    let scaleY = canvas.height / 1080;

    return new Vec2((canvas.width / scaleX - offsetX - image.width) / 2, (canvas.height / scaleY  - offsetY - image.height) / 2);
}

export function calScaledPos(canvas, offsetX = 0, offsetY = 0) {
    let scaleX = canvas.width / 1920;
    let scaleY = canvas.height / 1080;

    return new Vec2(canvas.width / scaleX - offsetX, canvas.height / scaleY - offsetY);
}

export function getMousePos(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let scaleX = canvas.width / 1920;
    let scaleY = canvas.height / 1080;
    return new Vec2((event.clientX - rect.left) / scaleX, (event.clientY - rect.top) / scaleY);
}

export function getCenterPos(image, entity) {
    let width = image.width;
    let startPos = entity.position.x;
    return (width + 2 * startPos) / 2;
}