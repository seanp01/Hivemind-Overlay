// This file injects overlay/UI elements into Twitch and YouTube pages, allowing real-time monitoring and interaction with live chats.

const overlayContainer = document.createElement('div');
overlayContainer.id = 'hivemind-overlay';
overlayContainer.style.position = 'fixed';
overlayContainer.style.bottom = '10px';
overlayContainer.style.right = '10px';
overlayContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
overlayContainer.style.color = 'white';
overlayContainer.style.padding = '10px';
overlayContainer.style.borderRadius = '5px';
overlayContainer.style.zIndex = '9999';
overlayContainer.style.maxHeight = '300px';
overlayContainer.style.overflowY = 'auto';
overlayContainer.style.width = '300px';
overlayContainer.style.fontFamily = 'Arial, sans-serif';
overlayContainer.style.fontSize = '14px';
// stay scrolled to the bottom
const scrollOverlayToBottom = () => {
    overlayContainer.scrollTop = overlayContainer.scrollHeight;
};

import ChatClient from '../src/chatClient/index.js';

document.body.appendChild(overlayContainer);

const chatClient = new ChatClient('twitch'); // or 'youtube'
chatClient.on('message', (msg) => addMessageToOverlay(msg));

const addMessageToOverlay = (message) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = message.user + ": " + message.message;
    overlayContainer.appendChild(messageElement);
    scrollOverlayToBottom();
};

// Listen for messages from the chat client (to be implemented)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'newMessage') {
        addMessageToOverlay(request.message);
    }
    if (request.type === "tabUrl") {
        // Use request.url as needed
        console.log("Tab URL received in content script:", request.url);
        // You can now use request.url in your content script logic
        chatClient.connect(request.url);
    }
});

chrome.runtime.sendMessage(
    { action: "predict", prompt: "Your prompt here" },
    (response) => {
        if (response && response.result) {
            addMessageToOverlay(response.result);
        }
    }
);