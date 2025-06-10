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
overlayContainer.style.width = '600px';
overlayContainer.style.fontFamily = 'Arial, sans-serif';
overlayContainer.style.fontSize = '14px';
// stay scrolled to the bottom
const scrollOverlayToBottom = () => {
    overlayContainer.scrollTop = overlayContainer.scrollHeight;
};

import ChatClient from '../src/chatClient/index.js';

document.body.appendChild(overlayContainer);

const chatClient = new ChatClient('twitch'); // or 'youtube'
chatClient.on('message', (msg) => {
    addMessageToOverlay(msg)
});

const addMessageToOverlay = (message) => {
    const messageElement = document.createElement('div');

    // Alternate user colors
    const userColors = [
        '#4FC3F7', '#FFB74D', '#81C784', '#BA68C8', '#FFD54F',
        '#E57373', '#64B5F6', '#A1887F', '#90A4AE', '#F06292',
        '#AED581', '#FFF176', '#9575CD', '#4DB6AC', '#FF8A65',
        '#DCE775', '#7986CB', '#B0BEC5', '#F44336', '#00BCD4'
    ];
    if (!addMessageToOverlay.userColorMap) addMessageToOverlay.userColorMap = {};
    let userColor = userColors[0];
    if (message.user) {
        if (!addMessageToOverlay.userColorMap[message.user]) {
            const idx = Object.keys(addMessageToOverlay.userColorMap).length % userColors.length;
            addMessageToOverlay.userColorMap[message.user] = userColors[idx];
        }
        userColor = addMessageToOverlay.userColorMap[message.user];
    }

    // User styling
    const userSpan = document.createElement('span');
    userSpan.textContent = message.user + ": ";
    userSpan.style.fontWeight = 'bold';
    userSpan.style.color = userColor;

    // Message text
    const textSpan = document.createElement('span');
    textSpan.textContent = message.message + " ";

    // Sentiment badge colors
    const sentimentColors = {
        positive: '#4CAF50',
        negative: '#F44336',
        neutral: '#FFC107',
        mixed: '#2196F3',
        happy: '#81C784',
        sad: '#90A4AE',
        angry: '#E57373',
        surprised: '#FFD54F',
        fear: '#9575CD',
        // fallback
        default: '#B0BEC5'
    };

    messageElement.appendChild(userSpan);
    messageElement.appendChild(textSpan);

    // Sentiment badges
    if (Array.isArray(message.predictions) && message.predictions.length > 0) {
        message.predictions.slice(0, 3).forEach(sentiment => {
            const badge = document.createElement('span');
            badge.textContent = sentiment.sentiment;
            badge.style.display = 'inline-block';
            badge.style.padding = '2px 8px';
            badge.style.marginLeft = '8px';
            badge.style.marginRight = '2px';
            badge.style.borderRadius = '12px';
            badge.style.fontSize = '12px';
            badge.style.fontWeight = 'bold';
            badge.style.backgroundColor = sentimentColors[sentiment.sentiment] || sentimentColors.default;
            badge.style.color = '#222';
            badge.style.border = '1px solid #fff2';
            badge.style.verticalAlign = 'middle';
            messageElement.appendChild(badge);
        });
    }

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