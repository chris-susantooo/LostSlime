/*
    Provides simple utility functions
    to simplify LostSlime development
*/
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export class Vec2 {

    constructor(x, y) {
        this.set(x, y);
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(vec2) {
        return this.x === vec2.x && this.y === vec2.y;
    }
}

export function getScaledMid(image, canvas, offsetX = 0, offsetY = 0) {
    let scaleX = canvas.width / 1920;
    let scaleY = canvas.height / 1080;

    return new Vec2((canvas.width / scaleX - offsetX - image.width) / 2, (canvas.height / scaleY  - offsetY - image.height) / 2);
}

export function getMousePos(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let scaleX = canvas.width / 1920;
    let scaleY = canvas.height / 1080;
    return new Vec2((event.clientX - rect.left) / scaleX, (event.clientY - rect.top) / scaleY);
}

export function monitorSizeChanges() {

    //initialize canvas to window dimension
    doResize();
    
    //attach listener to call doResize whenever window is resized
    $(window).on('resize', doResize);
}

//resize canvas to fit window, locks aspect ratio to 16:9
function doResize() {
    //resize
    if(Math.floor(window.innerWidth * 0.5625) <= window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = Math.floor(window.innerWidth * 0.5625);
        context.scale(canvas.width / 1920, canvas.height / 1080);
    } else{
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight / 0.5625;
        context.scale(canvas.width / 1920, canvas.height / 1080);
    }
}