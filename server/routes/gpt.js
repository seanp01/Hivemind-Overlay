const express = require('express');
const router = express.Router();
const LLMService = require('../../src/llm/index');

// Initialize the LLM service
const llmService = new LLMService();

// Route to summarize chat blocks
router.post('/summarize', async (req, res) => {
    const { chatBlocks } = req.body;

    if (!chatBlocks || !Array.isArray(chatBlocks)) {
        return res.status(400).json({ error: 'Invalid input. Expected an array of chat blocks.' });
    }

    try {
        const summary = await llmService.summarize(chatBlocks);
        res.json({ summary });
    } catch (error) {
        console.error('Error summarizing chat blocks:', error);
        res.status(500).json({ error: 'Failed to summarize chat blocks.' });
    }
});

module.exports = router;