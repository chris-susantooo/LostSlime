
class TitleScene extends Phaser.Scene {
    constructor() {
        super({key: 'TitleScene'});
    }

    preload() {
        this.load.image('background_img', '../assets/images/bk1.png')
    }

    create() {
        let background = this.add.sprite(0, 0, 'background_img');
        background.setOrigin(0, 0);

        this.input.once('pointerdown', function () {
            this.scene.transition({
                target: 'MainScene',
                moveBelow: true,
                duration: 3000,
                sleep: true
            });
        }, this);
    }
}

export default TitleScene;