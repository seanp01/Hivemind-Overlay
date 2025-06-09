class LLMService {
    constructor(apiUrl = 'http://localhost:5000/predict') {
        this.apiUrl = apiUrl;
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
    async callPredict(prompt) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch summary from LLM API');
        }

        const data = await response.json();
        // Adjust this if your Flask server returns a different field
        return data.result || data.summary || '';
    }
}

export default LLMService;