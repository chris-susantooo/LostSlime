//main logic for client

import {monitorSizeChange} from './resize.js';
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

//server will ping us periodically to calculate latency
socket.on('pingTest', () => {
    socket.emit('replyPing');
});

//create title scene
const title = new TitleScene('title', socket);
title.show();

//todo: game scene, multiplayer-able

