// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("HivemindOverlay extension installed.");
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
        changeInfo.status === 'complete' &&
        (
            (tab.url && tab.url.match(/^https:\/\/www\.twitch\.tv\/.*\/chat/)) 
            // ||
            // (tab.url && tab.url.match(/^https:\/\/www\.youtube\.com\/live_chat/))
        )
    ) {
        chrome.tabs.sendMessage(tabId, { type: "tabUrl", url: tab.url });
    }   
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'requestOverlay') {
        // Find the active tab in the current window
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                sendResponse({ overlayHtml: "<div>No active tab found.</div>" });
                return;
            }
            const tabId = tabs[0].id;
            chrome.tabs.sendMessage(tabId, { type: "getOverlayHtml" }, (response) => {
                if (response && response.overlayHtml) {
                    sendResponse({ overlayHtml: response.overlayHtml });
                } else {
                    sendResponse({ overlayHtml: "<div>Failed to fetch overlay content.</div>" });
                }
            });
        });
        return true; // Keep the message channel open for async response
    }
});