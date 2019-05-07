
import Scene from '../Scene.js';
import BeatMap from '../BeatMap.js';
import { loadImage, loadJSON, loadAudio } from '../loaders.js';
import Entity from '../Entity.js';
import { Vec2 } from '../util.js';
import GameScene from './GameScene.js';
import HighScoreGameScene from './HighScoreGameScene.js';
import SoloGameScene from './SoloGameScene.js';

export default class LoadScene extends Scene {

    constructor(name, socket, jsonURL, audioURL, gameSpecific) {
        super(name, socket);
        this.gameSpecific = gameSpecific;
        this.loadAssets(jsonURL, audioURL);
    }

    loadAssets(jsonURL, audioURL) {
        loadImage('/img/background/space.gif').then(image => {
            const background = new Entity(new Vec2(0, 0), image);
            this.addEntity('background', background, 0);
        });

        Promise.all([loadJSON(jsonURL), loadAudio(audioURL)])
            .then(([json, audio]) => { //at this point the json, audio files finished loading
                const beatmap = new BeatMap(json);
                audio.volume = 0.2;
                this.destroy();
                if (this.gameSpecific === 'highscore') {
                    const highscoreGame = new HighScoreGameScene('highscore', this.socket, beatmap, audio);
                    highscoreGame.show();
                }
                else if (this.gameSpecific === 'survival') {
                    const survival = new SoloGameScene('survival', this.socket, beatmap, audio);
                    survival.show();
                } else if (this.gameSpecific instanceof Object) { //passes room information to pvp
                    this.socket.emit('beatmap', json, callback => { //pass beatmap to server
                        if (callback === 'beatmapReceived') {
                            const pvpGame = new GameScene('pvp', this.socket, this.gameSpecific, beatmap, audio);
                            pvpGame.show();
                        }
                    });
                }
            });
    }
}