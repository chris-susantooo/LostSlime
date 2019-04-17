//main logic for client

import {monitorSizeChange} from './resize.js';

//get canvas element and retrieve its context
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

//listen to dimension changes to canvas and render correctly
monitorSizeChange();

//estabish connection to game server
const socket = io();

socket.emit('register', 'myname', 'I WANNA BE RED', (response) => {
    console.log(response);
});
socket.emit('create', 'myFUCKINGROOM', (response) => {
    console.log(response);
});
socket.emit('join', 'myFUCKINGROOM', (response) => {
    console.log(response);
});