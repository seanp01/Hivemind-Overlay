import Chart from 'chart.js/auto';

/**
 * Create a sticky/floating button bar for popout/minimize/expand buttons.
 */
const buttonBar = document.createElement('div');
buttonBar.style.position = 'sticky';
buttonBar.style.top = '0';
buttonBar.style.left = '0';
buttonBar.style.width = '100%';
buttonBar.style.display = 'flex';
buttonBar.style.justifyContent = 'flex-end';
buttonBar.style.alignItems = 'center';
buttonBar.style.gap = '8px';
buttonBar.style.background = 'rgba(30,30,30,0.95)';
buttonBar.style.zIndex = '10001';
buttonBar.style.padding = '4px 0 4px 0';
buttonBar.style.boxShadow = '0 2px 8px #0002';

const popoutButton = document.createElement('button');
popoutButton.textContent = '⧉';
popoutButton.title = 'Pop out overlay';
popoutButton.style.background = '#222';
popoutButton.style.color = '#fff';
popoutButton.style.border = 'none';
popoutButton.style.borderRadius = '50%';
popoutButton.style.width = '28px';
popoutButton.style.height = '28px';
popoutButton.style.fontSize = '16px';
popoutButton.style.cursor = 'pointer';
popoutButton.style.boxShadow = '0 1px 4px #0004';

const minimizeButton = document.createElement('button');
minimizeButton.textContent = '−';
minimizeButton.title = 'Minimize overlay';
minimizeButton.style.top = '8px';
minimizeButton.style.right = '8px';
minimizeButton.style.zIndex = '10000';
minimizeButton.style.background = '#222';
minimizeButton.style.color = '#fff';
minimizeButton.style.border = 'none';
minimizeButton.style.borderRadius = '50%';
minimizeButton.style.width = '28px';
minimizeButton.style.height = '28px';
minimizeButton.style.fontSize = '18px';
minimizeButton.style.cursor = 'pointer';
minimizeButton.style.boxShadow = '0 1px 4px #0004';

const expandButton = document.createElement('button');
expandButton.textContent = '+';
expandButton.title = 'Expand overlay';
expandButton.style.top = '10px';
expandButton.style.right = '10px';
expandButton.style.zIndex = '10001';
expandButton.style.background = '#222';
expandButton.style.color = '#fff';
expandButton.style.border = 'none';
expandButton.style.borderRadius = '50%';
expandButton.style.width = '32px';
expandButton.style.height = '32px';
expandButton.style.fontSize = '20px';
expandButton.style.cursor = 'pointer';
expandButton.style.boxShadow = '0 1px 4px #0004';
expandButton.style.display = 'none';

document.body.appendChild(expandButton);

// Move button creation here so they're not appended directly to overlayContainer
buttonBar.appendChild(popoutButton);
buttonBar.appendChild(minimizeButton);

// Ensure expandButton is always on top of everything
expandButton.style.zIndex = '10002';
// This file injects overlay/UI elements into Twitch and YouTube pages, allowing real-time monitoring and interaction with live chats.
// Only create the overlay if it doesn't already exist
let overlayContainer = document.getElementById('hivemind-overlay');
if (!overlayContainer) {
    overlayContainer = document.createElement('div');
    overlayContainer.id = 'hivemind-overlay';
    overlayContainer.style.position = 'fixed';
    overlayContainer.style.top = '10px';
    overlayContainer.style.right = '10px';
    overlayContainer.style.bottom = '50px';
    overlayContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlayContainer.style.color = 'white';
    overlayContainer.style.padding = '20px';
    overlayContainer.style.borderRadius = '5px';
    overlayContainer.style.zIndex = '9999';
    overlayContainer.style.maxHeight = 'calc(100vh - 30px)'; // 10px top + 20px bottom
    overlayContainer.style.overflowY = 'scroll';
    overlayContainer.style.width = '800px';
    overlayContainer.style.fontFamily = 'Arial, sans-serif';
    overlayContainer.style.fontSize = '14px';
    document.body.appendChild(overlayContainer);
}
overlayContainer.appendChild(buttonBar);

// --- Sentiment Summary UI ---
const sentimentSummaryContainer = document.createElement('div');
sentimentSummaryContainer.id = 'sentiment-summary';
sentimentSummaryContainer.style.background = 'rgba(30,30,30,0.85)';
sentimentSummaryContainer.style.padding = '10px';
sentimentSummaryContainer.style.marginBottom = '10px';
sentimentSummaryContainer.style.borderRadius = '8px';
sentimentSummaryContainer.style.display = 'flex';
sentimentSummaryContainer.style.flexDirection = 'row';
sentimentSummaryContainer.style.alignItems = 'center';
sentimentSummaryContainer.style.gap = '24px';

// Ranking list
const movementArrowList = document.createElement('ol');
movementArrowList.id = 'sentiment-ranking';
movementArrowList.style.margin = '0';
movementArrowList.style.padding = '0 0 0 20px';
movementArrowList.style.listStyle = 'decimal';
sentimentSummaryContainer.appendChild(movementArrowList);
// Ensure sentimentSummaryContainer is always inside overlayContainer

popoutButton.addEventListener('click', () => {
    const popout = window.open(
        chrome.runtime.getURL('popout.html'),
        'HivemindOverlayPopout',
        'width=850,height=700,resizable,scrollbars'
    );
    const sendOverlay = () => {
        if (popout && popout.closed === false) {
            popout.postMessage({ type: 'initOverlay' }, '*');
        }
    };
    setTimeout(sendOverlay, 500);
    // Move the overlayContainer to the new window when it's ready
    const transferOverlay = () => {
        if (popout.document && popout.document.body) {
            popout.document.body.appendChild(overlayContainer);
            overlayContainer.style.position = 'fixed';
            overlayContainer.style.top = '10px';
            overlayContainer.style.right = '10px';
            overlayContainer.style.bottom = '10px';
            overlayContainer.style.left = '10px';
            overlayContainer.style.width = 'auto';
        } else {
            setTimeout(transferOverlay, 50);
        }
    };
    popout.onload = transferOverlay;
});
minimizeButton.addEventListener('click', () => {
    overlayContainer.style.display = 'none';
    expandButton.style.display = 'block';
});
expandButton.addEventListener('click', () => {
    overlayContainer.style.display = 'block';
    expandButton.style.display = 'none';
});
overlayContainer.appendChild(sentimentSummaryContainer);

// --- Chart.js Pie Chart Setup (make sure Chart.js is loaded in your extension) ---
let pieChart;
function updatePieChart(sentimentCounts) {
    // Sort sentimentCounts by count descending
    const sortedEntries = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1]);
    const labels = sortedEntries.map(([sentiment, count]) => `${sentiment} (${count})`);
    const data = sortedEntries.map(([, count]) => count);

    if (!pieChart) {
        const ctx = pieCanvas.getContext('2d');
        pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#4CAF50',   // positive
                        '#F44336',   // negative
                        '#B0BEC5',   // neutral
                        '#2196F3',   // mixed
                        '#81C784',   // happy
                        '#9575CD',   // sad
                        '#E57373',   // angry
                        '#FFD54F',   // surprised
                        '#9575CD',   // fear
                        '#FF9800',   // sarcastic
                        '#39FF14',   // hype
                        '#FF69B4',   // cringe
                        '#FFD700',   // joke
                        '#8D6E63',   // mocking
                        '#B71C1C',   // toxic
                        '#90CAF9',   // confused
                        '#CE93D8',   // copypasta
                        '#00B8D4',   // emote_spam
                        '#FF7043',   // bait
                        '#64B5F6',   // question
                        '#AEEA00',   // command_request
                        '#00E676',   // insightful
                        '#FFD54F',   // meta
                        '#FF8A65',   // criticism
                        '#FFB300',   // backseat
                        '#7E57C2',   // fan_theory
                        '#00C853',   // supportive
                        '#A1887F',   // personal_story
                        '#F06292',   // reaction_gif_text
                        '#B0BEC5'    // default/fallback
                    ]
                }]
            },
            options: {
                responsive: false, 
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'left', padding: '0 20px 0 0' } }
            }
        });
    } else {
        // Update data and labels
        pieChart.data.labels = labels;
        pieChart.data.datasets[0].data = data;
        pieChart.update();
    }
}

// --- Ranking List with Up/Down Arrows ---
let previousRanking = [];
function updateRankingList(sortedSentiments) {
    movementArrowList.innerHTML = '';
    sortedSentiments.forEach((item, idx) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.gap = '6px';
        li.style.whiteSpace = 'nowrap'; // Prevent line break
        li.style.overflow = 'hidden';
        li.style.textOverflow = 'ellipsis';
        li.style.maxWidth = '220px'; // Adjust as needed

        // Arrow logic
        const prevIdx = previousRanking.findIndex(s => s.sentiment === item.sentiment);
        let arrow = '';
        let arrowColor = '';
        if (prevIdx !== -1) {
            if (prevIdx > idx) {
                arrow = '⬆︎';
                arrowColor = 'green';
            } else if (prevIdx < idx) {
                arrow = '⬇︎';
                arrowColor = 'red';
            }
        }
        li.style.padding = '0.5px 0'; // Add vertical padding
        // Sentiment label
        // const sentimentLabel = document.createElement('span');
        // sentimentLabel.textContent = item.sentiment;
        // sentimentLabel.style.marginRight = '1px';

        // Arrow (if any)
        if (arrow) {
            const arrowSpan = document.createElement('span');
            arrowSpan.textContent = arrow;
            arrowSpan.style.color = arrowColor;
            arrowSpan.style.fontWeight = 'bold';
            arrowSpan.style.marginRight = '2px';
            li.appendChild(arrowSpan);
        }

        //li.appendChild(sentimentLabel);
        li.appendChild(document.createTextNode(' '));
        movementArrowList.appendChild(li);
    });
    previousRanking = sortedSentiments.map(s => ({ ...s })); // Deep copy
}

// --- Sentiment Data Aggregation Example ---
const sentimentCounts = {};
function aggregateSentiment(message) {
    if (Array.isArray(message.predictions)) {
        message.predictions.forEach(pred => {
            sentimentCounts[pred.sentiment] = (sentimentCounts[pred.sentiment] || 0) + 1;
        });
        // Update UI
        updatePieChart(sentimentCounts);
        // Sort and update ranking
        const sorted = Object.entries(sentimentCounts)
            .map(([sentiment, count]) => ({ sentiment, count }))
            .sort((a, b) => b.count - a.count);
        updateRankingList(sorted);
    }
}

// Pie chart canvas
const pieCanvas = document.createElement('canvas');
pieCanvas.id = 'sentiment-pie';
pieCanvas.style.width = '500px';
pieCanvas.style.height = '500px';
pieCanvas.width = 500;
pieCanvas.height = 500;
pieCanvas.setAttribute('style', 'width:500px !important;height:500px !important;display:block;');
const pieWrapper = document.createElement('div');
pieWrapper.style.width = '500px';
pieWrapper.style.height = '500px';
pieWrapper.style.overflow = 'hidden';
pieWrapper.appendChild(pieCanvas);
sentimentSummaryContainer.style.alignItems = 'center'; // helps vertically align
sentimentSummaryContainer.appendChild(pieWrapper);

// stay scrolled to the bottom
const scrollOverlayToBottom = () => {
    overlayContainer.scrollTop = overlayContainer.scrollHeight;
};

import ChatClient from '../src/chatClient/index.js';

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
        neutral: '#B0BEC5',         // Changed to grey
        mixed: '#2196F3',
        happy: '#81C784',
        sad: '#9575CD',
        angry: '#E57373',
        surprised: '#FFD54F',
        fear: '#9575CD',
        sarcastic: '#FF9800',       // Orange
        hype: '#39FF14',            // Neon green
        cringe: '#FF69B4',          // Hot pink
        joke: '#FFD700',            // Gold/yellow
        mocking: '#8D6E63',         // Brownish
        toxic: '#B71C1C',           // Dark red
        confused: '#90CAF9',        // Light blue
        copypasta: '#CE93D8',       // Light purple
        emote_spam: '#00B8D4',      // Cyan
        bait: '#FF7043',            // Deep orange
        question: '#64B5F6',        // Blue
        command_request: '#AEEA00', // Lime
        insightful: '#00E676',      // Bright green
        meta: '#FFD54F',            // Yellow
        criticism: '#FF8A65',       // Orange
        backseat: '#FFB300',        // Amber
        fan_theory: '#7E57C2',      // Purple
        supportive: '#00C853',      // Green
        personal_story: '#A1887F',  // Taupe
        reaction_gif_text: '#F06292', // Pink
        // fallback
        default: '#B0BEC5'
    };

    messageElement.appendChild(userSpan);
    messageElement.appendChild(textSpan);

    // Sentiment badges
    // Create a flex container for message text and badges
    messageElement.style.display = 'flex';
    messageElement.style.alignItems = 'center';
    messageElement.style.justifyContent = 'space-between';

    // Left: user and message
    const leftContainer = document.createElement('span');
    leftContainer.appendChild(userSpan);
    leftContainer.appendChild(textSpan);

    // Right: badges
    const rightContainer = document.createElement('span');
    rightContainer.style.display = 'flex';
    rightContainer.style.gap = '4px';

    if (Array.isArray(message.predictions) && message.predictions.length > 0) {
        message.predictions
            .slice(0, 3)
            .filter(sentiment => sentiment.score * 100 >= 1) // Only show if score >= 1%
            .forEach(sentiment => {
                const badge = document.createElement('span');
                badge.textContent = sentiment.sentiment;
                badge.style.display = 'inline-block';
                badge.style.padding = '2px 8px';
                badge.style.marginLeft = 'auto';
                badge.style.marginRight = '0';
                badge.style.borderRadius = '12px';
                badge.style.fontSize = '12px';
                badge.style.fontWeight = 'bold';
                badge.style.backgroundColor = sentimentColors[sentiment.sentiment] || sentimentColors.default;
                badge.style.color = '#222';
                badge.style.border = '1px solid #fff2';
                badge.style.verticalAlign = 'middle';
                rightContainer.appendChild(badge);
            });
    }

    messageElement.appendChild(leftContainer);
    messageElement.appendChild(rightContainer);

    overlayContainer.insertBefore(messageElement, sentimentSummaryContainer);
    scrollOverlayToBottom();
    aggregateSentiment(message);
};

// Listen for messages from the chat client (to be implemented)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "tabUrl") {
        // Use request.url as needed
        console.log("Tab URL received in content script:", request.url);
        // You can now use request.url in your content script logic
        chatClient.connect(request.url);
    }
    if (request.type === "getOverlayHtml") {
        const overlay = document.getElementById('hivemind-overlay');
        sendResponse({
            overlayHtml: overlay ? overlay.outerHTML : "<div>Overlay not found.</div>"
        });
        return true;
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