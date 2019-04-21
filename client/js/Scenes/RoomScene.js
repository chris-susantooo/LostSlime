
import Scene from '../Scene.js';

export default class RoomScene extends Scene {
    
    constructor(socket, name, isCreate = false) {
        super();

        this.name = name;
    }
}