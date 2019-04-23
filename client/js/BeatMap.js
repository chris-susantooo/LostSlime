
export default class BeatMap {
    constructor(json) {

        this.nextSpace = -1;
        this.nextCaption = -1;

        this.captions = [];
        this.spaces = [];

        this.translateJSON(json);
    }

    nextSpace(commit = false) {
        if (this.nextSpace === -1 && this.spaces.length > 0 || this.nextSpace >= 0 && this.nextSpace < this.spaces.length) {
            if (commit) {
                return this.spaces[this.nextSpace++];
            }
            else {
                return this.spaces[this.nextSpace];
            }
        }
        return null;
    }

    nextCaption(commit = false) {
        if (this.nextCaption === -1 && this.captions.length > 0 || this.nextCaption >= 0 && this.nextCaption < this.captions.length) {
            if (commit) {
                return this.captions[this.nextCaption++];
            }
            else {
                return this.captions[this.nextCaption];
            }
        }
        return null;
    }

    translateJSON(json) {
        let bufferChars = ''; //for concatenating individual characters into captions
        let bufferTimestamp = null;
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