import tmi from 'tmi.js'; // Import tmi.js for Twitch chat handling
import LLMService from '../llm/index.js';
import copypastaData from '../data/copypasta.json' with { type: "json" };
import emotesData from '../data/emotes.json' with { type: "json" };

const llm = new LLMService();

class ChatClient {
    constructor(platform) {
        this.platform = platform; // 'twitch' or 'youtube'
        this.subOnlyMode = false; // Tracks if the channel is in sub-only mode
        this.chatMessages = [];
        this.eventListeners = {};
        this.twitchClient = null; // Will hold the tmi.js client instance
        this.messageFrequency = {}; // Tracks message frequencies
        this.predictionCache = {}; // Caches predictions for frequent messages
        this.frequencyThreshold = 3; // Set your desired threshold here
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

            this.twitchClient.on('message', async (channel, tags, message, self) => {
                if (self) return; // Ignore echoed messages
                let user = tags['display-name'] || tags.username;
                if (user === 'Fossabot' || user === 'StreamElements' || user === 'Nightbot') return;
                const autoLabeledMessage = await this.autoLabelMessage(message, tags);
                if (autoLabeledMessage) {
                    this.emit('message', autoLabeledMessage);
                } else {
                    this.handleMessage({
                        user: tags['display-name'] || tags.username,
                        message,
                        platform: 'twitch',
                        tags,
                        subOnlyMode: this.subOnlyMode
                    });
                }
            });

            this.twitchClient.on('roomstate', (channel, state) => {
                if ('subs-only' in state) {
                    if (state['subs-only'] === true) {
                        this.subOnlyMode = true;
                    } else {
                        this.subOnlyMode = false; // Reset if not in sub-only mode
                    }
                }
            });

            this.twitchClient.on('roomstate', (channel, state) => {
                if ('subs-only' in state) {
                    if (state['subs-only'] === true) {
                        this.subOnlyMode = true;
                    } else {
                        this.subOnlyMode = false; // Reset if not in sub-only mode
                    }
                }
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

        // Track message frequency
        const msgText = message.message;
        this.messageFrequency[msgText] = (this.messageFrequency[msgText] || 0) + 1;

        // If message is frequent enough, cache its prediction
        if (
            this.messageFrequency[msgText] >= this.frequencyThreshold &&
            !this.predictionCache[msgText]
        ) {
            const predictions = await llm.callPredict(msgText);
            this.predictionCache[msgText] = predictions;
            message.predictions = predictions;
        } else if (this.predictionCache[msgText]) {
            message.predictions = this.predictionCache[msgText];
        } else {
            // Not frequent, get prediction as usual (not cached)
            message.predictions = await llm.callPredict(msgText);
        }

        this.emit('message', message);
    }
    // Store long messages with timestamps for copypasta candidate detection
    longMessageCandidates = new Map(); // messageText -> { count, firstSeen, lastSeen, timeoutId }

    trackLongMessage(messageText) {
        const now = Date.now();
        const minLength = 200;
        const repeatThreshold = 5; // times
        const windowMs = 60 * 1000; // 1 minute

        if (messageText.length < minLength) return;

        let entry = this.longMessageCandidates.get(messageText);
        if (!entry) {
            // New candidate
            entry = {
                count: 1,
                firstSeen: now,
                lastSeen: now,
                timeoutId: null
            };
            // Set up expiration
            entry.timeoutId = setTimeout(() => {
                this.longMessageCandidates.delete(messageText);
            }, windowMs);
            this.longMessageCandidates.set(messageText, entry);
        } else {
            // Existing candidate
            entry.count += 1;
            entry.lastSeen = now;
            // Reset expiration
            clearTimeout(entry.timeoutId);
            entry.timeoutId = setTimeout(() => {
                this.longMessageCandidates.delete(messageText);
            }, windowMs);
        }

        // If threshold met within window, append as copypasta candidate to copypasta.json
        if (
            entry.count >= repeatThreshold &&
            (entry.lastSeen - entry.firstSeen) <= windowMs
        ) {
            chrome.storage.local.get({ copypastas: [] }, (result) => {
                const localCopypastas = result.copypastas;
                if (!localCopypastas.some(p => p.trim() === messageText.trim())) {
                    localCopypastas.push(messageText.trim());
                    chrome.storage.local.set({ copypastas: localCopypastas });
                }
            });
            clearTimeout(entry.timeoutId);
            this.longMessageCandidates.delete(messageText);
        }
    }

    conversationCache = new Map(); // user -> { lastMessage, timestamp }

    expireConversations(windowMs = 2 * 60 * 1000) {
        const now = Date.now();
        for (const [user, data] of this.conversationCache.entries()) {
            if (now - data.timestamp > windowMs) {
                this.conversationCache.delete(user);
            }
        }
    }
    // Track multi-user conversation threads by topic or reply chain
    conversationThreads = new Map(); // threadId -> { users: Set, messages: [{user, message, timestamp}], lastActive }

    // Extracts a thread ID based on reply/mention or topic similarity
    getThreadId(message, user) {
        // If message contains @mentions, use the sorted set of users as thread ID
        const mentions = Array.from(message.matchAll(/@(\w+)/g)).map(m => m[1].toLowerCase());
        if (mentions.length > 0) {
            // Include sender in thread
            const threadUsers = Array.from(new Set([...mentions, user.toLowerCase()])).sort();
            return threadUsers.join(',');
        }
        // Optionally, use message similarity for topic-based threads (simple hash)
        // For now, fallback to user as thread
        return user.toLowerCase();
    }

    // Returns true if message is part of an active multi-user conversation thread
    isMultiUserConversation(message, user) {
        const threadId = this.getThreadId(message, user);
        const now = Date.now();
        const windowMs = 2 * 60 * 1000;

        let thread = this.conversationThreads.get(threadId);
        if (!thread) {
            // New thread
            thread = {
                users: new Set([user.toLowerCase()]),
                messages: [{ user, message, timestamp: now }],
                lastActive: now
            };
            this.conversationThreads.set(threadId, thread);
            return false;
        } else {
            // Existing thread: update
            thread.users.add(user.toLowerCase());
            thread.messages.push({ user, message, timestamp: now });
            thread.lastActive = now;
            // If more than one user and recent activity, consider it a conversation
            if (thread.users.size > 1 && now - thread.messages[0].timestamp < windowMs) {
                return true;
            }
            return false;
        }
    }

    // Clean up old threads
    expireConversationThreads(windowMs = 2 * 60 * 1000) {
        const now = Date.now();
        for (const [threadId, thread] of this.conversationThreads.entries()) {
            if (now - thread.lastActive > windowMs) {
                this.conversationThreads.delete(threadId);
            }
        }
    }

    // Improved isConversation: checks for reply/mention or message similarity
    isConversation(message, user) {
        this.expireConversations();
        this.expireConversationThreads();

        // Multi-user thread detection
        if (this.isMultiUserConversation(message, user)) {
            return true;
        }

        // Per-user fallback: require some similarity or reply/mention
        const last = this.conversationCache.get(user);
        if (last && Date.now() - last.timestamp < 2 * 60 * 1000) {
            // Check for reply/mention
            if (/@\w+/.test(message) || /@\w+/.test(last.lastMessage)) {
                return true;
            }
            // Simple similarity: Jaccard index over words
            const wordsA = new Set(message.toLowerCase().split(/\s+/));
            const wordsB = new Set(last.lastMessage.toLowerCase().split(/\s+/));
            const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
            const union = new Set([...wordsA, ...wordsB]);
            const similarity = intersection.size / union.size;
            if (similarity > 0.5) {
                return true;
            }
        }
        // Update cache
        this.conversationCache.set(user, { lastMessage: message, timestamp: Date.now() });
        return false;
    }

    // Call this in handleMessage for long messages
    async handleMessage(message) {
        this.chatMessages.push(message);

        // Track message frequency
        const msgText = message.message;
        this.messageFrequency[msgText] = (this.messageFrequency[msgText] || 0) + 1;

        // Track long message candidates
        this.trackLongMessage(msgText);

        // If message is frequent enough, cache its prediction
        if (
            this.messageFrequency[msgText] >= this.frequencyThreshold &&
            !this.predictionCache[msgText]
        ) {
            const predictions = await llm.callPredict(msgText);
            this.predictionCache[msgText] = predictions;
            message.predictions = predictions;
        } else if (this.predictionCache[msgText]) {
            message.predictions = this.predictionCache[msgText];
        } else {
            // Not frequent, get prediction as usual (not cached)
            message.predictions = await llm.callPredict(msgText);
        }

        this.emit('message', message);
    }

    async autoLabelMessage(message, tags = {}) {
        // Command detection (cheap: just check first char)
        if (message.trim().startsWith('!')) {
            return {
                user: tags['display-name'] || tags.username,
                message,
                platform: this.platform,
                tags,
                subOnlyMode: this.subOnlyMode,
                predictions: [{ sentiment: 'command_request', score: 1 }]
            };
        }

        // Numeric only (digits, dates, times, weights, measurements)
        const numericOnly = /^[\d\s:\/\-.]+$/.test(message);
        if (numericOnly) return {
            user: tags['display-name'] || tags.username,
            message,
            platform: this.platform,
            tags,
            subOnlyMode: this.subOnlyMode,
            predictions: [{ sentiment: 'answer', score: 1 }]
        };

        // Link only
        const linkOnly = /^(https?:\/\/[^\s]+)$/.test(message.trim());
        if (linkOnly) return {
            user: tags['display-name'] || tags.username,
            message,
            platform: this.platform,
            tags,
            subOnlyMode: this.subOnlyMode,
            predictions: [{ sentiment: 'conversation', score: 1 }]
        };

        // @mention only
        const mentionOnly = /^@\w+$/.test(message.trim());
        if (mentionOnly) return {
            user: tags['display-name'] || tags.username,
            message,
            platform: this.platform,
            tags,
            subOnlyMode: this.subOnlyMode,
            predictions: [{ sentiment: 'conversation', score: 1 }]
        };

        // Conversation tracking (messages containing @username)
        if (/@\w+/.test(message)) {
            return {
                user: tags['display-name'] || tags.username,
                message,
                platform: this.platform,
                tags,
                subOnlyMode: this.subOnlyMode,
                predictions: [{ sentiment: 'conversation', score: 1 }]
            };
        }

        // Emote only (Twitch emotes or common emotes)
        // Simple heuristic: all words are emotes (no alphanumerics except emote names)
        // Twitch emotes are in tags.emotes, or fallback to a basic regex for global emotes
        // Use emotes from emotes.json for fallback detection
        // All camelCase, lowerCamelCase, or ALLUPPERCASE words with no spaces are emotes
        const words = message.trim().split(/\s+/);
        // Enhanced emote spam detection: allow trailing numbers and ALLUPPERCASE
        if (
            words.length > 0 &&
            words.every(word =>
            /^[A-Z][a-z]+(?:[A-Z][a-z]+)+\d*$/.test(word) || // CamelCase + optional digits
            /^[a-z]+(?:[A-Z][a-z]+)+\d*$/.test(word) ||      // lowerCamelCase + optional digits
            (/^[A-Z]{8,}$/.test(word) && !/\s/.test(word)) || // ALLUPPERCASE, 8+ chars, no spaces
            /^[a-z]+[A-Z][a-z]+\d*$/.test(word) ||           // dsaRaid style: lowercase(s) + Uppercase + lowercase(s) + optional digits
            /^[a-z]+[A-Z]+\d*$/.test(word)                   // dsaRaid style: lowercase(s) + Uppercase(s) + optional digits
            )
        ) {
            return {
            user: tags['display-name'] || tags.username,
            message,
            platform: this.platform,
            tags,
            subOnlyMode: this.subOnlyMode,
            predictions: [{ sentiment: 'emote_spam', score: 1 }]
            };
        } else {
            // Fallback: check if all words are in emotes.json list
            const emoteList = emotesData.emotes || [];
            if (
            words.length > 0 &&
            words.every(word => emoteList.includes(word))
            ) {
            return {
                user: tags['display-name'] || tags.username,
                message,
                platform: this.platform,
                tags,
                subOnlyMode: this.subOnlyMode,
                predictions: [{ sentiment: 'emote_spam', score: 1 }]
            };
            }
        }

        // Copypasta detection (compare to known list from copypasta.json)
        let knownCopypastas = copypastaData.copypastas.map(pasta => pasta.text.trim());
        const localCopypastas = JSON.parse(localStorage.getItem('copypastas') || '[]');
        knownCopypastas = [...new Set([...knownCopypastas, ...localCopypastas])];
        if (knownCopypastas.some(pasta => message.trim() === pasta)) {
            return {
                user: tags['display-name'] || tags.username,
                message,
                platform: this.platform,
                tags,
                subOnlyMode: this.subOnlyMode,
                predictions: [{ sentiment: 'copypasta', score: 1 }]
            };
        }

        // Conversation cache check (expensive, so last)
        const user = tags['display-name'] || tags.username;
        if (this.isConversation(message, user)) {
            return {
                user,
                message,
                platform: this.platform,
                tags,
                subOnlyMode: this.subOnlyMode,
                predictions: [{ sentiment: 'conversation', score: 1 }]
            };
        }

        return null; // No auto-labeling matched
    }
}

export default ChatClient;