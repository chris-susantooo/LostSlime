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

//create title scene
const title = new TitleScene('title', socket);
title.show();

//create normal game
// const normal = new NormalScene(socket);
// normal.show();

//todo: implement click listeners and controls for title scene
//todo: room scene
//todo: game scene, multiplayer-able

