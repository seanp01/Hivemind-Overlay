const ID = process.env.CLIENT_ID;
const TOKENPORT = process.env.TOKENPORT;

/**
 * Fetches a new token 
 * @returns {Promise<string>} The valid access token.
 */
async function getToken() {
    const response = await fetch(`http://localhost:${TOKENPORT}/token`);
    if (!response.ok) {
        throw new Error(`Failed to fetch Twitch token: ${response.status}`);
    }
    const data = await response.json();
    if (!data.token) {
        throw new Error('No token received from token service');
    }
    return data.token;
}

/**
 * TwitchClient class to interact with Twitch API.
 */
class TwitchClient {
    constructor() {
        this.clientId = ID;
        this.accessToken = getToken();
        this.baseUrl = 'https://api.twitch.tv/helix';
    }

    async getViewerCount(streamerLogin) {
        const token = await this.accessToken; // Await the Promise here!
        const url = `${this.baseUrl}/streams?user_login=${streamerLogin}`;
        const response = await fetch(url, {
            headers: {
                'Client-ID': this.clientId,
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Twitch API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            return data.data[0].viewer_count;
        } else {
            return 0;
        }
    }

    /**
     * Periodically fetches viewer count and calls the callback with the value.
     * @param {string} url
     * @param {function(number):void} callback
     * @param {number} intervalMs
     * @returns {function} stop function
     */
    startViewerCountPolling(url, callback, intervalMs = 30000) {
        let stopped = false;
        // Extract channel name from the Twitch chat URL
        const match = url.match(/twitch\.tv\/(?:popout\/)?([^\/]+)\/chat/);
        if (!match) {
            throw new Error('Invalid Twitch chat URL');
        }
        const channel = match[1];
        // Dynamically import tmi.js 
        const poll = async () => {
            if (stopped) return;
            try {
                const count = await this.getViewerCount(channel);
                console.log(`Viewer count for ${channel}: ${count}`);
                callback(count, Date.now());
            } catch (err) {
                callback(null, null, err);
            }
            if (!stopped) {
                setTimeout(() => { poll(); }, intervalMs);
            }
        };

        poll();

        return () => { stopped = true; };
    }

}

export default TwitchClient;