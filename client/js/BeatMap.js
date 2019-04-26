
//Allow easy access for spaces and captions timestamps
//Usage: beatmap.getNextSpace(), beatmap.getNextCaption()

export default class BeatMap {

    constructor(json) {

        this.nextSpace = 0;
        this.nextCaption = 0;

        this.json = json;
        this.captions = [];
        this.spaces = [];

        this.translateJSON(json);
    }

    getSongName() {
        return this.songName;
    }

    getSongStart() {
        return this.songStart;
    }

    //returns next space timestamp, advances pointer if commit = true
    getNextSpace(commit = false) {
        if ((this.nextSpace === 0 && this.spaces.length > 0) || (this.nextSpace > 0 && this.nextSpace < this.spaces.length)) {
            if (commit) {
                return this.spaces[this.nextSpace++];
            }
            else {
                return this.spaces[this.nextSpace];
            }
        }
        return null;
    }

    //returns a 2-item array with caption content and show timestamp, advances pointer if commit = true
    getNextCaption(commit = false) {
        if ((this.nextCaption === 0 && this.captions.length > 0) || (this.nextCaption > 0 && this.nextCaption < this.captions.length)) {
            if (commit) {
                return this.captions[this.nextCaption++];
            }
            else {
                return this.captions[this.nextCaption];
            }
        }
        return null;
    }

    //translates json into two arrays: spaces and captions
    //spaces contains all timestamps that space-presses are expected
    //captions contains 2-item arrays of [caption content, caption timestamp]
    translateJSON(json) {
        let bufferChars = ''; //for concatenating individual characters into captions
        let bufferTimestamp = null;

        this.songName = json.shift().time;
        this.songStart = json.shift().time;

        for (const entry of json) { //entry['key'] = key pressed, entry['time'] = respective timestamp
            if (entry['key'] === 'Key.space') {
                //if there are accumulated characters then push (caption, time) to captions
                if (bufferChars !== '' && bufferTimestamp) {
                    this.captions.push([bufferChars, bufferTimestamp]);
                    bufferChars = '';
                    bufferTimestamp = null;
                }
                //push space timestamp to spaces
                this.spaces.push(entry['time'])
            }
            else if (entry['key' === 'Key.enter']) {
                //if there are accumulated characters then push (caption, time) to captions
                if (bufferChars !== '' && bufferTimestamp) {
                    this.captions.push([bufferChars, bufferTimestamp]);
                    bufferChars = '';
                    bufferTimestamp = null;
                }
            }
            else { //normal characters accumulate here
                if (bufferChars === '') {
                    bufferTimestamp = entry['time'];
                }
                bufferChars += entry['key'];
            }
        }
    }
}