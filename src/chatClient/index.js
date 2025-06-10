import tmi from 'tmi.js'; // Import tmi.js for Twitch chat handling
import LLMService from '../llm/index.js';

const llm = new LLMService();

class ChatClient {
    constructor(platform) {
        this.platform = platform; // 'twitch' or 'youtube'
        this.chatMessages = [];
        this.eventListeners = {};
        this.twitchClient = null; // Will hold the tmi.js client instance
    }

    connect(url) {
        if (this.platform === 'twitch') {
            this.connectToTwitch(url);
        } else if (this.platform === 'youtube') {
            this.connectToYouTube(url);
        }
    }

    connectToTwitch(url) {
        // Extract channel name from the Twitch chat URL
        const match = url.match(/twitch\.tv\/(?:popout\/)?([^\/]+)\/chat/);
        if (!match) {
            throw new Error('Invalid Twitch chat URL');
        }
        const channel = match[1];

        // Dynamically import tmi.js if not already imported
        try {
            this.twitchClient = new tmi.Client({
                channels: [channel]
            });

            this.twitchClient.connect();

            this.twitchClient.on('message', (channel, tags, message, self) => {
                if (self) return; // Ignore echoed messages
                this.handleMessage({
                    user: tags['display-name'] || tags.username,
                    message,
                    platform: 'twitch',
                    tags
                });
            });

            this.twitchClient.on('connected', () => {
                this.emit('connected', { platform: 'twitch', channel });
            });

            this.twitchClient.on('disconnected', (reason) => {
                this.emit('disconnected', { platform: 'twitch', reason });
            });
        } catch (err) {
            this.emit('error', { platform: 'twitch', error: err });
        }
    }

    connectToYouTube(url) {
        // Implement YouTube Live Chat API connection logic here
        // Example: using YouTube API to listen for live chat messages
    }

    on(event, listener) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(listener);
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(listener => listener(data));
        }
    }

    async handleMessage(message) {
        this.chatMessages.push(message);
        // get a prediction
        const predictions = await llm.callPredict(message.message);
        message.predictions = predictions; // Attach sentiment analysis result to the message
        this.emit('message', message);
    }

    // Additional methods for handling chat messages, filtering, etc.
}

export default ChatClient;