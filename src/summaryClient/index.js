


class SummaryClient {
    constructor(options = {}) {
        // e.g., endpoint, API key, model name, etc.
        this.endpoint = options.endpoint || 'http://localhost:5223/summarize';
        this.apiKey = options.apiKey || null;
        this.model = options.model || 'summary-llm';
    }

    /**
     * Sends a window of chat messages (with predictions) to the summarizer LLM.
     * @param {Array} messageWindow - Array of chat message objects, each with predictions.
     * @param {Object} [meta] - Optional metadata (e.g., time window, channel info).
     * @returns {Promise<Object>} - The summary result.
     */
    async summarizeWindow(messageWindow, meta = {}) {
        // Prepare payload
        const payload = {
            messages: messageWindow,
            meta,
            model: this.model
        };

        // Send to LLM endpoint (adjust for your backend)
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Summary LLM error: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    }
}

export default SummaryClient;