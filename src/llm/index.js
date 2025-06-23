// webpack handles this with .env
const LMPORT = process.env.LMPORT || 5222;

const sentiment_to_label = {
    // 🟢 Tone-based sentiments
    "neutral": 0,              // 😐 No strong sentiment
    "positive": 1,             // 😊 Kind, optimistic, supportive
    "negative": 2,             // 😠 Disapproving, pessimistic
    "toxic": 3,                // ☠️ Aggressive, rude, inflammatory
    "confused": 4,             // 😕 Expresses confusion or lack of understanding
    "angry": 5,                // 😡 Expresses frustration or anger
    "sad": 6,                  // 😢 Expresses disappointment, loss, or empathy
    "hype": 7,                 // 🔥 Excited cheering or support (e.g. "LETS GOOO")
    "agreeable": 8,            // 👍 Signals agreement, like "yep", "true", "based"
    "supportive": 9,           // 🤗 Deeply affirming, emotionally positive
    "playful": 10,             // 😜 Silly, teasing, or lighthearted tone
    "reaction": 11,            // 😲 General expressive response to events

    // 🎭 Expression style / delivery
    "sarcasm": 12,             // 😏 Ironic, saying the opposite of what's meant
    "humor": 13,               // 😂 Light-hearted humor, not mocking
    "copypasta": 14,           // 📋 Repeated or meme block text
    "emote_spam": 15,          // 🤪 Emote-only or excessive emotes
    "bait": 16,                // 🎣 Provocative to stir a reaction
    "mocking": 17,             // 😏 Ridiculing someone/something
    "cringe": 18,              // 😬 Social embarrassment, second-hand shame

    // ❓ Intent or purpose of message
    "question": 19,            // ❓ Seeking info, asking streamer or chat
    "joke": 20,                // 😂 Joke or kidding tone

    "command_request": 21,     // ❗ Suggesting actions ("play X", "go here")
    "insightful": 22,          // 💡 Adds valuable knowledge or perspective
    "meta": 23,                // 🧠 Commentary about chat or the stream itself
    "criticism": 24,           // 🧐 Disapproval or critique, non-toxic

    // 🧩 Add-on specialized classes
    "backseat": 25,            // 🪑 Telling the streamer how to play
    "fan_theory": 26,          // 🧩 Lore speculation or plot guessing
    "personal_story": 27,      // 📖 Sharing personal anecdotes to relate

    // 🧠 Fine-grained interaction labels
    "commentary": 28,          // 🗣️ Observational, running commentary
    "affirmative": 29,         // ✅ Confirming message ("true", "yep", etc)
    "compliment": 30,          // 🥰 Direct praise or flattery

    // Additional mappings
    "mixed": 31,               // 🤔 Mixed sentiment
    "happy": 32,               // 😄 Happy
    "surprised": 33,           // 😲 Surprised
    "fear": 34,                // 😱 Fear
    "conversation": 35,        // 💬 Conversation
    "default": 36              // 💬 Default/unspecified
};


class LLMService {
    constructor(apiUrl) {
        // Use provided apiUrl or default to localhost with LMPORT
        this.apiUrl = apiUrl || new URL(`/predict`, `http://localhost:${LMPORT}`).toString();
    }

    async summarizeChat(chatBlocks) {
        // Step 1: Get a summary for each chat block
        const summaries = await Promise.all(
            chatBlocks.map(block => this.callPredict(block))
        );

        // Step 2: Optionally, combine summaries and get a final summary
        const combinedSummary = summaries.join('\n');
        const finalSummary = await this.callPredict(
            `Summarize the following chat summaries:\n${combinedSummary}`
        );

        return finalSummary;
    }

    createPrompt(chatBlocks) {
        return `Summarize the following chat messages:\n${chatBlocks.join('\n')}`;
    }

    // Send a prompt to the local LLM server's /predict endpoint
    async callPredict(chatMessages) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_messages: chatMessages })
            });

            if (!response.ok) {
                // Optionally log the error response
                // const errorText = await response.text();
                // console.error('LLM API error:', errorText);
                return [{ sentiment: 'error', score: 0, message: 'Failed to fetch prediction from LLM API' }];
            }

            const data = await response.json();
            // Reverse the sentiment_to_label mapping for label lookup
            const labelToSentiment = Object.entries(sentiment_to_label)
                .reduce((acc, [sentiment, idx]) => {
                    acc[`LABEL_${idx}`] = sentiment;
                    return acc;
                }, {});

            // Map predictions to readable sentiment labels
            return (data.prediction || []).map(pred => ({
                sentiment: labelToSentiment[pred.label] || pred.label,
                score: pred.score
            }));
        } catch (error) {
            // Handle network or parsing errors gracefully
            // Optionally log the error
            // console.error('Fetch failed:', error);
            return [{ sentiment: 'error', score: 0, message: error.message || 'Unknown error' }];
        }
    }
}

export default LLMService;