import TitleScene from './scenes/title.js';
import MainScene from './scenes/main.js';

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
};

var game = new Phaser.Game(config);

game.scene.add('TitleScene', new TitleScene());
game.scene.add('MainScene', new MainScene());

game.scene.start('TitleScene');