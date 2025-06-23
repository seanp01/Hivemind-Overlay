import dotenv from 'dotenv';
const fs = require('fs');
const path = require('path');
const dotenvPath = path.resolve(__dirname, '.env');

dotenv.config();

const ID = process.env.CLIENT_ID || 'your-client-id';
const TOKEN = process.env.TOKEN || 'your-access-token';

const CLIENT_SECRET = process.env.CLIENT_SECRET || 'your-client-secret';

/**
 * Checks if the current access token is expired by calling Twitch's validate endpoint.
 * If expired, fetches a new token and updates the .env file.
 * @returns {Promise<string>} The valid access token.
 */
async function ensureValidToken() {
    const validateUrl = 'https://id.twitch.tv/oauth2/validate';
    let valid = false;

    try {
        const res = await fetch(validateUrl, {
            headers: {
                'Authorization': `OAuth ${TOKEN}`
            }
        });
        valid = res.ok;
    } catch (e) {
        valid = false;
    }

    if (valid) {
        return TOKEN;
    }

    // Token is invalid or expired, fetch a new one
    const tokenUrl = 'https://id.twitch.tv/oauth2/token';
    const params = new URLSearchParams({
        client_id: ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
    });

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });

    if (!response.ok) {
        throw new Error(`Failed to refresh Twitch token: ${response.status}`);
    }

    const data = await response.json();
    const newToken = data.access_token;

    // Save new token to .env
    await updateEnvVariable('TOKEN', newToken);

    return newToken;
}

async function updateEnvVariable(key, value) {
    let envContent = fs.readFileSync(dotenvPath, 'utf8');

    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
        // Replace existing key
        envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
        // Append if key not found
        envContent += `\n${key}=${value}`;
    }

    fs.writeFileSync(dotenvPath, envContent);
    console.log(`.env updated: ${key}=${value}`);
}

class TwitchClient {
    constructor() {
        this.clientId = ID;
        this.accessToken = TOKEN;
        this.baseUrl = 'https://api.twitch.tv/helix';
    }

    async getViewerCount(streamerLogin) {
        const url = `${this.baseUrl}/streams?user_login=${streamerLogin}`;
        const response = await fetch(url, {
            headers: {
                'Client-ID': this.clientId,
                'Authorization': `Bearer ${this.accessToken}`
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
     * @param {string} streamerLogin
     * @param {function(number):void} callback
     * @param {number} intervalMs
     * @returns {function} stop function
     */
    startViewerCountPolling(streamerLogin, callback, intervalMs = 60000) {
        let stopped = false;

        const poll = async () => {
            if (stopped) return;
            try {
                const count = await this.getViewerCount(streamerLogin);
                callback(count);
            } catch (err) {
                callback(null, err);
            }
            if (!stopped) {
                setTimeout(poll, intervalMs);
            }
        };

        poll();

        return () => { stopped = true; };
    }

}

export default TwitchClient;