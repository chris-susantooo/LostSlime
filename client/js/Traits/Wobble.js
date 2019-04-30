import Trait from "../Trait.js";

export default class Wobble extends Trait {

    constructor(imgArray) {
        super('wobble');
        this.imgArray = imgArray;
        this.index = 0;
        this.accuTime = 0;
    }

    update(entity, deltaTime) {
        if(this.accuTime > deltaTime) {
            if (this.index === 30) this.index = 0;
            entity.image = this.imgArray[this.index++];
            this.accuTime = 0;
        }
        else {
            this.accuTime += deltaTime;
        }
    }
}