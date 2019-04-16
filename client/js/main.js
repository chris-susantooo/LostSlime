
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

window.onload = () => {
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
}

window.onresize = () => {
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
}

let socket = io();