const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const ID = process.env.CLIENT_ID || 'your-client-id';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'your-client-secret';

async function requestToken() {
    // fetch a new token
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
    if (data.access_token) {
        return data.access_token;
    } else {
        throw new Error('No access_token in Twitch response');
    }
}

async function getTwitchToken() {
    try {
        const tokenData = await requestToken();
        return tokenData;
    } catch (err) {
        console.error('Error fetching Twitch token:', err.message);
        throw err;
    }
}

module.exports = {
    getTwitchToken
};

const app = express();
app.use(cors());
const PORT = process.env.TOKENPORT;

app.get('/token', async (req, res) => {
    try {
        const token = await getTwitchToken();
        res.json({ ok: true, token });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch Twitch token' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});