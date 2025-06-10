// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("HivemindOverlay extension installed.");
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
            target: { tabId },
            files: ['content.bundle.js']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
            } else {
                console.log('content.bundle.js injected');
                // Send the URL to the content script
                chrome.tabs.sendMessage(tabId, { type: "tabUrl", url: tab.url });
            }
        });
    }
});