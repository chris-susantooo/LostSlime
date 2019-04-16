/*  makes sure canvas size is always full screen
    maintains aspect ratio for content drawing  */

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export function monitorSizeChange() {

    //initialize canvas to window dimension, 16:9 aspect ratio
    doResize();
    
    //attach listener to call doResize whenever window is resized
    $(window).on('resize', doResize);
}

function doResize() {
    if(Math.floor(window.innerWidth * 0.5625) <= window.innerHeight) {
        context.canvas.width = window.innerWidth;
        context.canvas.height = Math.floor(window.innerWidth * 0.5625);
    } else{
        context.canvas.height = window.innerHeight;
        context.canvas.width = window.innerHeight / 0.5625;
    }
}