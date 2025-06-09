class SyncEngine {
    constructor() {
        this.chatTimestamps = [];
        this.audioTimestamps = [];
    }

    addChatTimestamp(timestamp) {
        this.chatTimestamps.push(timestamp);
    }

    addAudioTimestamp(timestamp) {
        this.audioTimestamps.push(timestamp);
    }

    estimateDelay() {
        if (this.chatTimestamps.length === 0 || this.audioTimestamps.length === 0) {
            return 0;
        }

        const chatDelay = this.chatTimestamps[this.chatTimestamps.length - 1] - this.audioTimestamps[this.audioTimestamps.length - 1];
        return chatDelay;
    }

    alignMessages() {
        const delay = this.estimateDelay();
        return this.chatTimestamps.map(timestamp => timestamp + delay);
    }
}

export default SyncEngine;