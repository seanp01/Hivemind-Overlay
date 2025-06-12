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
buttonBar.style.background = 'rgba(173, 169, 169, 0.57)';
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
popoutButton.style.display = 'flex';
popoutButton.style.alignItems = 'center';
popoutButton.style.justifyContent = 'center';
popoutButton.style.textAlign = 'center';

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
minimizeButton.style.display = 'flex';
minimizeButton.style.alignItems = 'center';
minimizeButton.style.justifyContent = 'center';

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
expandButton.style.display = 'flex';
expandButton.style.alignItems = 'center';
expandButton.style.justifyContent = 'center';
expandButton.style.textAlign = 'center';

const timeFrames = [
    { label: '10s', value: 10 },
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '5m', value: 300 },
    { label: '10m', value: 600 },
    { label: '30m', value: 1800 },
    { label: '1h', value: 3600 },
    { label: '2h', value: 7200 },
    { label: '6h', value: 21600 },
    { label: '12h', value: 43200 },
    { label: '24h', value: 86400 }
];

const timeFrameRadios = document.createElement('div');
timeFrameRadios.style.display = 'flex';
timeFrameRadios.style.alignItems = 'center';
timeFrameRadios.style.gap = '8px';
timeFrameRadios.style.marginRight = 'auto'; // push to left

let selectedTimeFrame = 60; // default 1m

timeFrames.forEach(tf => {
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '2px';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'pie-timeframe';
    radio.value = tf.value;
    if (tf.value === selectedTimeFrame) radio.checked = true;

    radio.addEventListener('change', () => {
        selectedTimeFrame = parseInt(radio.value, 10);
        updatePieChartForWindow();
    });

    label.appendChild(radio);
    label.appendChild(document.createTextNode(tf.label));
    timeFrameRadios.appendChild(label);
});

buttonBar.insertBefore(timeFrameRadios, buttonBar.firstChild);

document.body.appendChild(expandButton);

// Ensure expandButton is always on top of everything
expandButton.style.position = 'fixed';
expandButton.style.top = '10px';
expandButton.style.right = '10px';
expandButton.style.zIndex = '10002';
expandButton.style.display = 'none';
// Move button creation here so they're not appended directly to overlayContainer
buttonBar.appendChild(popoutButton);
buttonBar.appendChild(minimizeButton);
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
movementArrowList.style.listStyle = 'decimal';
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
// --- Chat Volume Slider & Bar Chart ---

// Container for slider and bar chart
const sliderBarContainer = document.createElement('div');
sliderBarContainer.style.display = 'flex';
sliderBarContainer.style.flexDirection = 'column';
sliderBarContainer.style.alignItems = 'stretch';
sliderBarContainer.style.gap = '4px';
sliderBarContainer.style.marginBottom = '16px';

// Vertical slider
const timeSlider = document.createElement('input');
timeSlider.type = 'range';
timeSlider.min = 0;
timeSlider.max = 99;
timeSlider.value = 99;
timeSlider.step = 1;
timeSlider.style.width = '100%';   // Make it as wide as the bar chart
timeSlider.style.height = '16px';  // Typical slider height
timeSlider.style.margin = '8px 0';

// Vertical bar chart container
const barChartContainer = document.createElement('div');
barChartContainer.style.display = 'flex';
barChartContainer.style.flexDirection = 'row';
barChartContainer.style.alignItems = 'flex-end';
barChartContainer.style.height = '60px'; // Height of the bars
barChartContainer.style.width = '100%';  // Full width
barChartContainer.style.justifyContent = 'flex-start';
barChartContainer.style.gap = '1px';

// Add slider and bar chart to the container
sliderBarContainer.appendChild(barChartContainer);
sliderBarContainer.appendChild(timeSlider);
// Insert the sliderBarContainer into your overlay (e.g., after sentimentSummaryContainer)
overlayContainer.appendChild(sliderBarContainer);

const chatBuffer = [];
const MAX_BUFFER_SECONDS = 600; // 10 minutes

function bufferMessage(message) {
    chatBuffer.push({ ...message, ts: Date.now() });
    // Remove old messages
    const cutoff = Date.now() - MAX_BUFFER_SECONDS * 1000;
    while (chatBuffer.length && chatBuffer[0].ts < cutoff) {
        chatBuffer.shift();
    }
}

timeSlider.addEventListener('input', () => {
    // You can use timeSlider.value to select a time window
    // Optionally update other UI elements here
});

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
                plugins: { legend: { display: true, position: 'right' } }
            }
        });
    } else {
        // Update data and labels
        pieChart.data.labels = labels;
        pieChart.data.datasets[0].data = data;
        pieChart.update();
    }
}

function updatePieChartForWindow() {
    const now = Date.now();
    const cutoff = now - selectedTimeFrame * 1000;
    const windowMessages = chatBuffer.filter(msg => msg.ts >= cutoff);

    // Aggregate sentiment counts in the window
    const windowSentimentCounts = {};
    windowMessages.forEach(msg => {
        if (Array.isArray(msg.predictions)) {
            msg.predictions.forEach(pred => {
                windowSentimentCounts[pred.sentiment] = (windowSentimentCounts[pred.sentiment] || 0) + 1;
            });
        }
    });

    updatePieChart(windowSentimentCounts);
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
        updatePieChartForWindow();        // Sort and update ranking
        const sorted = Object.entries(sentimentCounts)
            .map(([sentiment, count]) => ({ sentiment, count }))
            .sort((a, b) => b.count - a.count);
        //updateRankingList(sorted);
    }
}

// Pie chart canvas
const pieCanvas = document.createElement('canvas');
pieCanvas.id = 'sentiment-pie';
pieCanvas.style.width = '600px';
pieCanvas.style.height = '400px';
pieCanvas.width = 600;
pieCanvas.height = 400;
pieCanvas.setAttribute('style', 'width:600px;height:400px !important;display:block;');
const pieWrapper = document.createElement('div');
pieWrapper.style.width = '600px';
pieWrapper.style.height = '400px';
pieWrapper.style.overflow = 'hidden';
pieWrapper.appendChild(pieCanvas);
sentimentSummaryContainer.style.alignItems = 'center'; // helps vertically align
sentimentSummaryContainer.appendChild(pieWrapper);
sentimentSummaryContainer.appendChild(movementArrowList);

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
    bufferMessage(message);
    updateBarChart();
    updatePieChartForWindow();
};

function updateBarChart() {
    const timespan = selectedTimeFrame;
    const bucketCount = 40;
    const bucketSize = timespan / bucketCount;
    const now = Date.now();

    // 1. Build buckets for the selected window (to display)
    const windowBuckets = Array(bucketCount).fill(0);
    chatBuffer.forEach(msg => {
        const ageSec = (now - msg.ts) / 1000;
        if (ageSec <= timespan) {
            const bucketIdx = Math.floor((timespan - ageSec) / bucketSize);
            if (bucketIdx >= 0 && bucketIdx < bucketCount) {
                windowBuckets[bucketIdx]++;
            }
        }
    });

    // 2. Find the window max for scaling
    const windowMax = Math.max(...windowBuckets, 1);

    // 3. Draw bars, scaling to the window max
    barChartContainer.innerHTML = '';
    for (let i = 0; i < bucketCount; i++) {
        const bar = document.createElement('div');
        bar.style.width = `${100 / bucketCount}%`;
        bar.style.background = windowBuckets[i] > 0 ? '#4FC3F7' : '#263238';
        bar.style.display = 'inline-block';
        bar.style.verticalAlign = 'bottom';
        bar.style.margin = '0 0.5px';
        bar.style.height = `${(windowBuckets[i] / windowMax) * 100}%`;
        barChartContainer.appendChild(bar);
    }
}

// Update bar chart when time frame changes
timeFrameRadios.querySelectorAll('input[type=radio]').forEach(radio => {
    radio.addEventListener('change', updateBarChart);
});

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