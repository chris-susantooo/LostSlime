/*  makes sure canvas size is always full screen
    maintains aspect ratio for content drawing  */

import Scene from './scene.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export function monitorSizeChange() {

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