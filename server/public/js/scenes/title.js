
class TitleScene extends Phaser.Scene {
    constructor() {
        super({key: 'TitleScene'});
    }

    preload() {
        this.load.image('background_img', '../assets/images/bk1.png')
        this.background
    }

    create() {
        //add the loaded image as background, at position 0, 0 measured from center
        this.background = this.add.sprite(0, 0, 'background_img');
        this.background.setOrigin(0, 0); //set measure from top-left corner instead of center

        //transition to MainScene, trigger on click
        this.input.once('pointerdown', function () {
            this.scene.transition({
                target: 'MainScene',
                moveBelow: true, //move MainScene below instead of above
                duration: 3000,
                sleep: true, //sleep this scene after transition
                onUpdate: this.transitionOut // call transitionOut while updating transition
            });
        }, this);
    }

    transitionOut() {
        this.tweens.add({ //tween is a property modifier
            targets: this.background,
            alpha: 0,
            duration: 300,
        })
    }
}

export default TitleScene;