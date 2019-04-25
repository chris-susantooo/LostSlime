import Trait from "../Trait.js";

export default class Wobble extends Trait {

    constructor(imgArray) {
        super('wobble');
        this.imgArray = imgArray;
        this.index = 0;
        this.forward = true;
        this.accuTime = 0;
    }

    update(entity, deltaTime) {
        if(this.accuTime > deltaTime) {
            if (this.index === 12) this.forward = false;
            if (this.index === 0) this.forward = true;
            if (this.forward) {
                entity.image = this.imgArray[this.index++];
            }
            else {
                entity.image = this.imgArray[this.index--];
            }
            this.accuTime = 0;
        } else {
            this.accuTime += deltaTime;
        }
    }
}