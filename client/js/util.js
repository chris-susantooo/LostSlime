
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

export function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}