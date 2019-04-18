//main logic for client

import {monitorSizeChange} from './resize.js';
import {loadImage} from './loader.js';
import Scene from './scene.js';

//get canvas element and retrieve its context
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

//listen to dimension changes to canvas and render correctly
monitorSizeChange();

//estabish connection to game server
const socket = io();

//create title scene
const title = new Scene();
title.addElement('background', () => {
    loadImage('../img/background/forest.gif').then(image => {
        context.drawImage(image, 0, 0);
    });
}, 0);
title.draw();

//todo: implement click listeners and controls for title scene
//todo: room scene
//todo: game scene, multiplayer-able

//networking test
socket.emit('register', 'myname', 'I WANNA BE RED', (response) => {
    console.log(response);
});
socket.emit('create', 'myFUCKINGROOM', (response) => {
    console.log(response);
});
socket.emit('join', 'myFUCKINGROOM', (response) => {
    console.log(response);
});

