import { LLMService } from '../src/llm/index.js';


// background.js
const llm = new LLMService();

chrome.runtime.onInstalled.addListener(() => {
    console.log("HivemindOverlay extension installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "predict") {
        llm.call(request.prompt)
            .then(summary => sendResponse({ result: summary }))
            .catch(err => sendResponse({ result: "Error: " + err.message }));
        return true; // Keep the message channel open for async response
    }
    if (request.action === "summarizeChat") {
        llm.summarizeChat(request.chatBlocks)
            .then(summary => sendResponse({ result: summary }))
            .catch(err => sendResponse({ result: "Error: " + err.message }));
        return true; // Keep the message channel open for async response
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
        changeInfo.status === 'complete' &&
        (
            (tab.url && tab.url.match(/^https:\/\/www\.twitch\.tv\/.*\/chat/)) ||
            (tab.url && tab.url.match(/^https:\/\/www\.youtube\.com\/live_chat/))
        )
    ) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });
    }
});