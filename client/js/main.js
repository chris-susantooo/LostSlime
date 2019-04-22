//main logic for client

import {monitorSizeChange} from './resize.js';
import NormalScene from './Scenes/NormalScene.js';
import TitleScene from './Scenes/TitleScene.js';

//get canvas element and retrieve its context
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

//enable canvas smoothing
context.imageSmoothingEnabled = true;

//listen to dimension changes to canvas and render correctly
monitorSizeChange();

//estabish connection to game server
const socket = io();

//create title scene
const title = new TitleScene('title', socket);
title.show();

//create normal game
// const normal = new NormalScene(socket);
// normal.show();

//todo: implement click listeners and controls for title scene
//todo: room scene
//todo: game scene, multiplayer-able

//networking test
// socket.emit('register', 'myname', 'I WANNA BE RED', response => {
//     console.log('self', response);
// });
// socket.emit('create', 'myFUCKINGROOM', response => {
//     console.log(response);
// });
// socket.emit('join', 'myFUCKINGROOM', response => {
//     console.log('join', response);
// });

socket.on('playerLeave', data => {
    console.log('playerLeave', data);
});

socket.on('playerJoin', data => {
    console.log('playerJoin', data)
});

