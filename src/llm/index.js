// webpack handles this with .env
const LMPORT = process.env.LMPORT || 5222;

const sentiment_to_label = {
    // 🟢 Tone-based sentiments
    "neutral": 0,           // No strong sentiment
    "positive": 1,          // Kind, optimistic, supportive
    "negative": 2,          // Disapproving, pessimistic
    "toxic": 3,             // Aggressive, rude, inflammatory
    "confused": 4,          // Expresses confusion or lack of understanding
    "angry": 5,             // Expresses frustration or anger
    "sad": 6,               // Expresses disappointment, loss, or empathy
    "hype": 7,              // Excited cheering or support (e.g. "LETS GOOO")

    // 🎭 Expression style / delivery
    "sarcastic": 8,         // Ironic, saying the opposite of what's meant
    "joke": 9,              // Light-hearted humor, not mocking
    "copypasta": 10,        // Repeated or meme block text
    "emote_spam": 11,       // Emote-only or excessive emotes
    "bait": 12,             // Provocative to stir a reaction
    "mocking": 13,          // Ridiculing someone/something
    "cringe": 14,           // Social embarrassment, second-hand shame

    // ❓ Intent or purpose of message
    "question": 15,         // Seeking info, asking streamer or chat
    "command_request": 16,  // Suggesting actions ("play X", "go here")
    "insightful": 17,       // Adds valuable knowledge or perspective
    "meta": 18,             // Commentary about chat or the stream itself
    "criticism": 19,        // Disapproval or critique, non-toxic

    // 🧩 Add-on specialized classes
    "backseat": 20,         // Telling the streamer how to play
    "fan_theory": 21,       // Lore speculation or plot guessing
    "supportive": 22,       // Deeply affirming, emotionally positive
    "personal_story": 23,   // Sharing personal anecdotes to relate
    "reaction_gif_text": 24 // Expressive reactions ("*grabs popcorn*", "sheesh")
}

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
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_messages: chatMessages })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch prediction from LLM API');
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
    }
}

export default LLMService;