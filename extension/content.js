import Chart from 'chart.js/auto';
import ChatClient from '../src/chat-client/index.js';
import SummaryClient from '../src/summary-client/index.js';

export const sentimentEmojis = {
    positive: '😊',
    negative: '😠',
    neutral: '😐',
    toxic: '☠️',
    confused: '😕',
    angry: '😡',
    sad: '😢',
    hype: '🔥',
    agreeable: '👍',
    supportive: '🤗',
    playful: '😜',
    reaction: '😲',
    sarcasm: '😏',
    humor: '😂',
    joke: '😂',
    copypasta: '📋',
    emote_spam: '🤪',
    bait: '🎣',
    mocking: '😏',
    cringe: '😬',
    question: '❓',
    command_request: '❗',
    insightful: '💡',
    meta: '🧠',
    criticism: '🧐',
    backseat: '🪑',
    fan_theory: '🧩',
    personal_story: '📖',
    commentary: '🗣️',
    affirmative: '✅',
    compliment: '🥰',
    mixed: '🤔',
    happy: '😄',
    surprised: '😮',
    fear: '😱',
    conversation: '💬',
    default: '💬'
};

// Sentiment color palette: unique, visually distinct colors for each sentiment
export const sentimentColorPalette = {
    positive: '#43A047',
    negative: '#E53935',
    neutral: '#90A4AE',
    toxic: '#212121',
    confused: '#7E57C2',
    angry: '#F4511E',
    sad: '#5E35B1',
    hype: '#00E676',
    agreeable: '#81C784',
    supportive: '#388E3C',
    playful: '#FF6F00',
    reaction: '#00BFAE',
    sarcasm: '#FFB300',
    humor: '#FDD835',
    joke: '#FF7043',
    copypasta: '#FF7043',
    emote_spam: '#29B6F6',
    bait: '#FF8A65',
    mocking: '#6D4C41',
    cringe: '#D81B60',
    question: '#3949AB',
    command_request: '#C0CA33',
    insightful: '#00ACC1',
    meta: '#B2FF59',
    criticism: '#C62828',
    backseat: '#F9A825',
    fan_theory: '#8E24AA',
    personal_story: '#A1887F',
    commentary: '#7986CB',
    affirmative: '#4CAF50',
    compliment: '#FFD54F',
    mixed: '#1E88E5',
    happy: '#FFD600',
    surprised: '#00B8D4',
    fear: '#8D6E63',
    conversation: '#BA68C8',
    default: '#B0BEC5'
};

/**
 * Create a sticky/floating button bar for popout/minimize/expand buttons.
 * Improved styling: more rounded corners, slightly lower opacity, subtle shadow.
 */
const buttonBar = document.createElement('div');
buttonBar.style.background = 'rgba(173, 169, 169, 0.90)';
buttonBar.style.borderRadius = '12px';
buttonBar.style.boxShadow = '0 4px 16px #0002';
buttonBar.style.position = 'sticky';
buttonBar.style.top = '0';
buttonBar.style.left = '0';
buttonBar.style.width = '100%';
buttonBar.style.display = 'flex';
buttonBar.style.justifyContent = 'flex-end';
buttonBar.style.alignItems = 'center';
buttonBar.style.gap = '8px';
buttonBar.style.zIndex = '10001';
buttonBar.style.padding = '4px 4px 4px 4px';

/**
 * Standard Deviation Control: Allows user to set the peak threshold for bar chart.
 */
const stddevControlContainer = document.createElement('div');
stddevControlContainer.style.display = 'flex';
stddevControlContainer.style.alignItems = 'center';
stddevControlContainer.style.gap = '6px';
stddevControlContainer.style.marginRight = '12px';

const stddevLabel = document.createElement('label');
stddevLabel.textContent = 'Peak Sensitivity:';
stddevLabel.style.fontWeight = 'bold';
stddevLabel.style.fontSize = '13px';
stddevLabel.style.color = '#333';

const stddevInput = document.createElement('input');
stddevInput.type = 'range';
stddevInput.min = '1';
stddevInput.max = '5';
stddevInput.step = '0.1';
stddevInput.value = '2';
stddevInput.style.width = '80px';
stddevInput.style.margin = '0 6px';

const stddevValue = document.createElement('span');
stddevValue.textContent = stddevInput.value + 'σ';
stddevValue.style.fontWeight = 'bold';
stddevValue.style.fontSize = '13px';

stddevInput.addEventListener('input', () => {
    stddevValue.textContent = stddevInput.value + 'σ';
    updateBarChart.peakStddev = parseFloat(stddevInput.value);
    updateBarChart();
});

// Default value for peak threshold
updateBarChart.peakStddev = parseFloat(stddevInput.value);

stddevControlContainer.appendChild(stddevLabel);
stddevControlContainer.appendChild(stddevInput);
stddevControlContainer.appendChild(stddevValue);

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
popoutButton.style.lineHeight = '1'; // Ensures vertical centering
popoutButton.style.padding = '0';    // Remove extra space

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

const legendClickState = {
    lastClickTime: 0,
    lastClickIndex: -1
};

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
        updateSliderTicks(); 
        updateBarChart();    // (optional, but keeps everything in sync)
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
buttonBar.appendChild(stddevControlContainer);
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
    overlayContainer.style.width = '1000px';
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
sentimentSummaryContainer.style.marginTop = '10px';
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


const radarIframe = document.createElement('iframe');
radarIframe.src = chrome.runtime.getURL('emotion-radar.html');
radarIframe.style.width = '520px';
radarIframe.style.height = '520px';
radarIframe.style.border = 'none';
radarIframe.style.background = 'transparent';
radarIframe.allowTransparency = 'true';

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
timeSlider.style.width = '89.5%';  
timeSlider.style.height = '12px';  // Typical slider height
timeSlider.style.margin = '8px auto';
timeSlider.style.display = 'block';
timeSlider.style.backgroundColor = 'grey';
timeSlider.style.cursor = 'pointer';
// Make the slider thumb/button grey
timeSlider.style.setProperty('accent-color', 'grey');

// Vertical bar chart container
const barChartContainer = document.createElement('div');
barChartContainer.style.display = 'flex';
barChartContainer.style.flexDirection = 'row';
barChartContainer.style.alignItems = 'flex-end';
barChartContainer.style.height = '60px'; // Height of the bars
barChartContainer.style.width = '88%';  
barChartContainer.style.justifyContent = 'flex-start';
barChartContainer.style.gap = '1px';

const barChartEmojiRow = document.createElement('div');
barChartEmojiRow.style.display = 'flex';
barChartEmojiRow.style.flexDirection = 'row';
barChartEmojiRow.style.alignItems = 'flex-start';
barChartEmojiRow.style.height = '15px'; // Height for emoji row
barChartEmojiRow.style.width = '88%';
barChartEmojiRow.style.margin = '0 auto';
barChartEmojiRow.style.justifyContent = 'flex-start';
barChartEmojiRow.style.gap = '1px';

// Create a container for the timestamps
const sliderTicksContainer = document.createElement('div');
sliderTicksContainer.style.display = 'flex';
sliderTicksContainer.style.justifyContent = 'space-between';
sliderTicksContainer.style.width = '90%';
sliderTicksContainer.style.fontSize = '11px';
sliderTicksContainer.style.color = '#bbb';
sliderTicksContainer.style.marginTop = '-4px'; // Pull closer to slider
sliderTicksContainer.style.marginLeft = 'auto';
sliderTicksContainer.style.marginRight = 'auto';

// Create or get the y-axis container and insert it as a sibling to the bar chart container
let yAxisContainer = document.getElementById('hivemind-bar-yaxis');
if (!yAxisContainer) {
    yAxisContainer = document.createElement('div');
    yAxisContainer.id = 'hivemind-bar-yaxis';
    yAxisContainer.style.display = 'flex';
    yAxisContainer.style.flexDirection = 'column';
    yAxisContainer.style.justifyContent = 'space-between';
    yAxisContainer.style.height = '75px';
    yAxisContainer.style.width = '25px'; // Adjust width as needed
    yAxisContainer.style.marginRight = '4px';
    yAxisContainer.style.fontSize = '12px';
    yAxisContainer.style.color = '#bbb';
    yAxisContainer.style.textAlign = 'right';
    yAxisContainer.style.userSelect = 'none';
}

// Create y-axis line with ticks
const yAxisLineContainer = document.createElement('div');
yAxisLineContainer.style.display = 'flex';
yAxisLineContainer.style.flexDirection = 'column';
yAxisLineContainer.style.justifyContent = 'space-between';
yAxisLineContainer.style.alignItems = 'flex-end';
yAxisLineContainer.style.height = barChartContainer.style.height;
yAxisLineContainer.style.width = '18px'; // Adjust width as needed
yAxisLineContainer.style.marginRight = '10px';
yAxisLineContainer.style.position = 'relative';

const yAxisTicks = 3;
for (let i = 0; i < yAxisTicks; i++) {
    // Draw the vertical axis line only on the first tick (full height)
    if (i === 0) {
        const axisLine = document.createElement('div');
        axisLine.style.position = 'absolute';
        axisLine.style.left = '8px';
        axisLine.style.top = '0';
        axisLine.style.bottom = '0';
        axisLine.style.width = '2px';
        axisLine.style.background = '#bbb';
        axisLine.style.height = '100%';
        axisLine.style.zIndex = '1';
        yAxisLineContainer.appendChild(axisLine);
    }
    // Draw the tick mark
    const tickMark = document.createElement('div');
    tickMark.style.width = '10px';
    tickMark.style.height = '2px';
    tickMark.style.background = '#bbb';
    tickMark.style.position = 'right';
    tickMark.style.left = '0'; // Align tick mark to the left edge (touching the axis line)
    tickMark.style.zIndex = '2';
    yAxisLineContainer.appendChild(tickMark);
}

// Ensure sliderBarContainer uses a row layout for y-axis + bar chart
const barChartRow = document.createElement('div');
barChartRow.style.display = 'flex';
barChartRow.style.flexDirection = 'row';
barChartRow.style.alignItems = 'flex-end';
barChartRow.appendChild(yAxisContainer);
barChartRow.appendChild(yAxisLineContainer);
barChartRow.appendChild(barChartContainer);
barChartRow.style.width = '100%';

// Replace direct barChartContainer append with barChartRow
sliderBarContainer.appendChild(barChartRow);

// Add slider and bar chart to the container
sliderBarContainer.appendChild(barChartEmojiRow);
sliderBarContainer.appendChild(timeSlider);
sliderBarContainer.appendChild(sliderTicksContainer);

updateSliderTicks();

// Insert the sliderBarContainer into your overlay (e.g., after sentimentSummaryContainer)
overlayContainer.appendChild(sliderBarContainer);

const timelineContainer = document.createElement('div');
timelineContainer.style.display = 'flex';
timelineContainer.style.justifyContent = 'space-between';
timelineContainer.style.width = '100%';
timelineContainer.style.fontSize = '11px';
timelineContainer.style.color = '#bbb';
timelineContainer.style.marginTop = '-2px'; // Adjust as needed

sliderBarContainer.appendChild(timelineContainer);

const mediaEmbedRowContainer = document.createElement('div');
mediaEmbedRowContainer.style.display = 'flex';
mediaEmbedRowContainer.style.flexDirection = 'row';
mediaEmbedRowContainer.style.alignItems = 'center';
mediaEmbedRowContainer.style.width = '100%';

sliderBarContainer.appendChild(mediaEmbedRowContainer);

const chatBuffer = [];
const MAX_BUFFER_SECONDS = timeFrames[timeFrames.length - 1].value; // 24h (86400 seconds)
let windowMessages = [];

timeFrameRadios.querySelectorAll('input[type=radio]').forEach(radio => {
    radio.addEventListener('change', adjustTimeSliderForTimeFrame);
});

timeSlider.addEventListener('input', () => {
    chatPaused = true; // Pause chat updates while adjusting slider
    // Show overlay button if chat is paused
    let pauseOverlay = document.getElementById('hivemind-pause-overlay');
    if (!pauseOverlay) {
        pauseOverlay = document.createElement('div');
        pauseOverlay.id = 'hivemind-pause-overlay';
        pauseOverlay.style.position = 'absolute';
        pauseOverlay.style.left = '0';
        pauseOverlay.style.right = '0';
        pauseOverlay.style.bottom = '0';
        pauseOverlay.style.height = '40px';
        pauseOverlay.style.background = 'rgba(33, 150, 243, 0.90)'; // Match button color, more blue
        pauseOverlay.style.display = 'flex';
        pauseOverlay.style.justifyContent = 'center';
        pauseOverlay.style.alignItems = 'center';
        pauseOverlay.style.zIndex = '10010';
        pauseOverlay.style.pointerEvents = 'auto';

        const resumeBtn = document.createElement('button');
        resumeBtn.textContent = 'Chat Paused';
        resumeBtn.style.transition = 'background 0.2s, color 0.2s, box-shadow 0.2s';
        resumeBtn.style.boxShadow = '0 2px 8px #0003';
        resumeBtn.addEventListener('mouseenter', () => {
            resumeBtn.textContent = '↓ New Messages';
            resumeBtn.style.background = '#1976D2'; // Slightly darker blue
            resumeBtn.style.color = '#fff';
            resumeBtn.style.boxShadow = '0 4px 16px #1976D2AA';
        });
        resumeBtn.addEventListener('mouseleave', () => {
            resumeBtn.textContent = 'Chat Paused';
            resumeBtn.style.background = '#2196F3'; // Match overlay
            resumeBtn.style.color = '#fff';
            resumeBtn.style.boxShadow = '0 2px 8px #0003';
        });
        resumeBtn.style.background = '#2196F3'; // Match overlay
        resumeBtn.style.color = '#fff';
        resumeBtn.style.border = 'none';
        resumeBtn.style.borderRadius = '8px';
        resumeBtn.style.padding = '8px 20px';
        resumeBtn.style.fontWeight = 'bold';
        resumeBtn.style.fontSize = '15px';
        resumeBtn.style.cursor = 'pointer';
        resumeBtn.addEventListener('click', () => {
            chatPaused = false;
            pauseOverlay.remove();
            timeSlider.value = 99; // Reset slider to "now"
        });

        pauseOverlay.appendChild(resumeBtn);
    }
    // Add the pause overlay to the overlayContainer instead of messagesContainer
    if (overlayContainer && !document.getElementById('hivemind-pause-overlay')) {
        overlayContainer.appendChild(pauseOverlay);
    }
    // 1. Calculate the target timestamp for the slider value
    const value = parseInt(timeSlider.value, 10);
    // The slider represents the selectedTimeFrame window, with 0 = oldest, 99 = now
    const now = Date.now();
    const windowEnd = now - ((99 - value) / 99) * selectedTimeFrame * 1000;
    const windowStart = windowEnd - selectedTimeFrame * 1000;

    // 2. Filter messages in the window
    windowMessages = chatBuffer.filter(msg => msg.ts >= windowStart && msg.ts <= windowEnd) || [];
    const messagesContainer = document.getElementById('hivemind-messages');

    // 3. Aggregate sentiment counts for the window
    const windowSentimentCounts = {};
    windowMessages.forEach(msg => {
        if (Array.isArray(msg.predictions)) {
            msg.predictions.forEach(pred => {
                windowSentimentCounts[pred.sentiment] = (windowSentimentCounts[pred.sentiment] || 0) + 1;
            });
        }
    });

    if (messagesContainer) {
        messagesContainer.innerHTML = '';
        windowMessages.forEach(msg => {
            // Use the helper function to render the message element without side effects
            const messageElement = renderMessageElement(msg);
            messagesContainer.appendChild(messageElement);
        });
    }

    // 4. Update the pie chart and ranking list
    updatePieChart(windowSentimentCounts);

    // Prevent slider from resizing by setting a fixed width and min/max width
    timeSlider.style.width = '90%';
    timeSlider.style.minWidth = '0';
    timeSlider.style.maxWidth = '90%';
    scrollOverlayToBottom();
    updateSliderTicks();
    updateBarChart(); // Optionally update bar chart to reflect new window
    updateTimelineLabels();
    updateEmbedsForWindow();
});

updateTimelineLabels();

// Pie chart canvas
const pieCanvas = document.createElement('canvas');
pieCanvas.id = 'sentiment-pie';
pieCanvas.style.width = '900px';
pieCanvas.style.height = '300px';
pieCanvas.width = 900;
pieCanvas.height = 300;
pieCanvas.setAttribute('style', 'width:900px !important;height:300px !important;display:block;');

const pieWrapper = document.createElement('div');
pieWrapper.style.width = '900px';
pieWrapper.style.height = '300px';
pieWrapper.style.overflow = 'hidden';
pieWrapper.appendChild(pieCanvas);
sentimentSummaryContainer.style.alignItems = 'center'; // helps vertically align
sentimentSummaryContainer.appendChild(pieWrapper);

sentimentSummaryContainer.appendChild(radarIframe);
//sentimentSummaryContainer.appendChild(movementArrowList);

let chatPaused = false;

let windowEmbeds = [];
function updateEmbedsForWindow() {
    // Remove all current embeds
    mediaEmbedRowContainer.innerHTML = '';
    // Collect all unique URLs from messages in the current window
    const urlSet = new Set();
    windowMessages.forEach(msg => {
        if (typeof msg.message === "string") {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urls = msg.message.match(urlRegex);
            if (urls) {
                urls.forEach(url => urlSet.add(url));
            }
        }
    });
    // Add embeds for all URLs in the window
    if (urlSet.size > 0) {
        addEmbedToOverlay(Array.from(urlSet));
    }
}

const chatClient = new ChatClient('twitch'); // or 'youtube'
chatClient.on('message', (msg) => {
    console.log(toggledSentiments);
    aggregateSentiment(msg);
    // If the message contains a URL for any type of media embed, add an embed to the UI
    if (typeof msg.message === "string") {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = msg.message.match(urlRegex);
        if (urls) {
            addEmbedToOverlay(urls);
        }
    }
    bufferMessage(msg);
    if (toggledSentiments && msg.predictions.some(pred => toggledSentiments.has(pred.sentiment))) return;
    addMessageToOverlay(msg)
});

const summaryClient = new SummaryClient();

// Update bar chart when time frame changes
timeFrameRadios.querySelectorAll('input[type=radio]').forEach(radio => {
    radio.addEventListener('change', () => {
        updateBarChart();
        updateTimelineLabels();
    });
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

function addEmbedToOverlay(urls) {
    urls.forEach(url => {
        // Basic media type detection
        let embedElement = null;
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
            // Image
            embedElement = document.createElement('img');
            embedElement.src = url;
            embedElement.style.maxWidth = '200px';
            embedElement.style.maxHeight = '120px';
            embedElement.style.margin = '4px';
        } else if (/youtube\.com\/watch\?v=|youtu\.be\//i.test(url)) {
            // YouTube video
            let videoId = null;
            const ytMatch = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_\-]+)/);
            if (ytMatch) videoId = ytMatch[1];
            if (videoId) {
                embedElement = document.createElement('iframe');
                embedElement.src = `https://www.youtube.com/embed/${videoId}`;
                embedElement.width = "220";
                embedElement.height = "124";
                embedElement.frameBorder = "0";
                embedElement.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                embedElement.allowFullscreen = true;
                embedElement.style.margin = '4px';
            }
        } else if (/twitch\.tv\/videos\/(\d+)/i.test(url)) {
            // Twitch VOD
            const twitchMatch = url.match(/twitch\.tv\/videos\/(\d+)/i);
            if (twitchMatch) {
                embedElement = document.createElement('iframe');
                embedElement.src = `https://player.twitch.tv/?video=${twitchMatch[1]}&parent=${location.hostname}`;
                embedElement.width = "220";
                embedElement.height = "124";
                embedElement.frameBorder = "0";
                embedElement.allowFullscreen = true;
                embedElement.style.margin = '4px';
            }
        } else if (/\.mp4$/i.test(url)) {
            // MP4 video
            embedElement = document.createElement('video');
            embedElement.src = url;
            embedElement.controls = true;
            embedElement.style.maxWidth = '220px';
            embedElement.style.maxHeight = '124px';
            embedElement.style.margin = '4px';
        }
        if (embedElement) {
            mediaEmbedRowContainer.appendChild(embedElement);
        }
    });
}

/**
 * Aggregate sentiment predictions from a message and update the sentiment summary.
 */
function scrollOverlayToBottom() {
    const messagesContainer = document.getElementById('hivemind-messages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

/**
 * Aggregate sentiment predictions from a message and update the sentiment summary.
 */
function addMessageToOverlay(message) {
    const messageElement = renderMessageElement(message);

    // Create a parent container for messages
    let messagesContainer = document.getElementById('hivemind-messages');
    if (!messagesContainer) {
        messagesContainer = document.createElement('div');
        messagesContainer.id = 'hivemind-messages';
        messagesContainer.style.height = '45%';
        messagesContainer.style.overflowY = 'auto';
        messagesContainer.style.position = 'static';
        messagesContainer.style.display = 'flex';
        messagesContainer.style.flexDirection = 'column';
        messagesContainer.style.gap = '4px';
        // Insert messages container before sentimentSummaryContainer if not already present
        overlayContainer.insertBefore(messagesContainer, sentimentSummaryContainer);
    }
    if (!chatPaused) messagesContainer.appendChild(messageElement);
    scrollOverlayToBottom();
    if (!chatPaused) updateBarChart();
    if (!chatPaused) updatePieChartForWindow();
    if (!chatPaused) updateTimelineLabels();
}

/**
 * Aggregate sentiment predictions from a message and update the sentiment summary.
 */
function renderMessageElement(message) {
    // Alternate user colors
    
    const userColors = [
        '#4FC3F7', '#FFB74D', '#81C784', '#BA68C8', '#FFD54F',
        '#E57373', '#64B5F6', '#A1887F', '#90A4AE', '#F06292',
        '#AED581', '#FFF176', '#9575CD', '#4DB6AC', '#FF8A65',
        '#DCE775', '#7986CB', '#B0BEC5', '#F44336', '#00BCD4'
    ];
    if (!renderMessageElement.userColorMap) renderMessageElement.userColorMap = {};
    let userColor = userColors[0];
    if (message.user) {
        if (!renderMessageElement.userColorMap[message.user]) {
            const idx = Object.keys(renderMessageElement.userColorMap).length % userColors.length;
            renderMessageElement.userColorMap[message.user] = userColors[idx];
        }
        userColor = renderMessageElement.userColorMap[message.user];
    }

    // User styling
    const userSpan = document.createElement('span');
    userSpan.textContent = message.user + ": ";
    userSpan.style.fontWeight = 'bold';
    userSpan.style.color = userColor;

    // Message text
    const textSpan = document.createElement('span');
    textSpan.textContent = message.message + " ";

    // Sentiment badges
    const rightContainer = document.createElement('span');
    rightContainer.style.display = 'flex';
    rightContainer.style.gap = '4px';

    if (Array.isArray(message.predictions) && message.predictions.length > 0) {
        message.predictions
            .slice(0, 3)
            .filter(sentiment => sentiment.score * 100 >= 10)
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
                badge.style.backgroundColor = sentimentColorPalette[sentiment.sentiment] || sentimentColorPalette.default;
                badge.style.color = '#222';
                badge.style.border = '1px solid #fff2';
                badge.style.verticalAlign = 'middle';
                rightContainer.appendChild(badge);
            });
    }

    // Left: user and message
    const leftContainer = document.createElement('span');
    leftContainer.appendChild(userSpan);
    leftContainer.appendChild(textSpan);

    // Message element
    const messageElement = document.createElement('div');
    messageElement.style.display = 'flex';
    messageElement.style.alignItems = 'center';
    messageElement.style.justifyContent = 'space-between';
    messageElement.appendChild(leftContainer);
    messageElement.appendChild(rightContainer);

    return messageElement;
}

/**
 * Update the pie chart based on the current window's sentiment counts.
 */
function updateBarChart() {
    let bucketCount = Math.max(10, Math.min(100, Math.round(selectedTimeFrame / 2)));
    const timespan = selectedTimeFrame;
    const bucketSize = timespan / bucketCount;
    const now = Date.now();

    // 1. Build buckets for the selected window (to display)
    const windowBuckets = Array(bucketCount).fill(0);
    const bucketMessages = Array(bucketCount).fill().map(() => []);
    const windowStart = now - timespan * 1000;

    chatBuffer.forEach(msg => {
        // Only consider messages in the visible window
        if (msg.ts < windowStart || msg.ts > now) return;
        const ageSec = (now - msg.ts) / 1000;
        // Always clamp bucketIdx to [0, bucketCount-1]
        let bucketIdx = Math.floor((timespan - ageSec) / bucketSize);
        if (bucketIdx < 0) bucketIdx = 0;
        if (bucketIdx >= bucketCount) bucketIdx = bucketCount - 1;
        windowBuckets[bucketIdx]++;
        bucketMessages[bucketIdx].push(msg);
    });

    // 2. Find the window max for scaling
    const windowMax = Math.max(...windowBuckets, 1);

    // 3. Detect more extreme peaks (e.g., > mean + 3*stddev)
    const mean = windowBuckets.reduce((a, b) => a + b, 0) / bucketCount;
    const stddev = Math.sqrt(windowBuckets.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / bucketCount);
    const peakThreshold = mean + (updateBarChart.peakStddev || 2) * stddev;

    // 4. Draw bars, scaling to the window max

    yAxisContainer.innerHTML = '';
    const yTicks = 3;
    const tickInterval = niceTickInterval(windowMax, yTicks);
    const topTick = tickInterval * (yTicks - 1);
    for (let i = 0; i < yTicks; i++) {
        const tick = document.createElement('div');
        tick.style.flex = '1 1 0';
        tick.style.height = '3px';
        tick.style.display = 'flex';
        tick.style.fontSize = '12px';
        tick.style.alignItems = 'flex-end';
        tick.style.justifyContent = 'flex-end';
        const value = topTick - i * tickInterval;
        // Format value: 10000 -> 10k, 1500000 -> 1.5M, etc.
        let formattedValue;
        if (value >= 1_000_000) {
            formattedValue = (value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1) + 'M';
        } else if (value >= 1_000) {
            formattedValue = (value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1) + 'k';
        } else {
            formattedValue = value;
        }

        tick.textContent = formattedValue;
        yAxisContainer.appendChild(tick);
    }
    barChartContainer.innerHTML = '';
    barChartEmojiRow.innerHTML = '';
    // Reset static variables for lock/unlock emoji
    updateBarChart.firstLockShown = false;
    updateBarChart.firstUnlockShown = false;
    for (let i = 0; i < bucketCount; i++) {
        // --- Bar ---
        const bar = document.createElement('div');
        bar.style.width = `${100 / bucketCount}%`;
        bar.style.background = windowBuckets[i] > 0 ? '#4FC3F7' : '#263238';
        bar.style.display = 'inline-block';
        bar.style.verticalAlign = 'bottom';
        bar.style.margin = '0 0.5px';
        // Calculate bar height relative to the top tick (not windowMax)
        const barTop = tickInterval * (yTicks - 1);
        bar.style.height = `${(windowBuckets[i] / barTop) * 100}%`;
        bar.style.transition = 'background 0.15s';
        bar.title = `${windowBuckets[i]} Chats`;

        const emojiSpan = document.createElement('span');
        emojiSpan.style.display = 'inline-block';
        emojiSpan.style.width = `${100 / bucketCount}%`;
        emojiSpan.style.textAlign = 'center';
        emojiSpan.style.fontSize = '14px';
        emojiSpan.style.userSelect = 'none';
        
        bar.addEventListener('mouseenter', () => {
            if (windowBuckets[i] > 0) {
                bar.style.background = '#039BE5';
            }
        });
        bar.addEventListener('mouseleave', () => {
            bar.style.background = windowBuckets[i] > 0 ? '#4FC3F7' : '#263238';
        });

        barChartContainer.appendChild(bar);

        // --- Emoji Row ---
        // Sub Only Mode Toggle Emoji (show only the first lock and first unlock)
        if (bucketMessages[i].length > 0) {
            // Find first message where subOnlyMode === true (lock) and first where === false (unlock)
            const firstLockMsg = bucketMessages[i].find(msg => msg.subOnlyMode === true);
            const firstUnlockMsg = bucketMessages[i].find(msg => msg.subOnlyMode === false);

            // Only show the first lock or unlock in the entire chart (not per bucket)
            // We'll use static variables to track if we've already shown them
            if (!updateBarChart.firstLockShown && firstLockMsg) {
                emojiSpan.textContent = '🔒';
                emojiSpan.title = 'Sub Only Mode Enabled';
                updateBarChart.firstLockShown = true;
            } else if (!updateBarChart.firstUnlockShown && firstUnlockMsg) {
                emojiSpan.textContent = '🔓';
                emojiSpan.title = 'Sub Only Mode Disabled';
                updateBarChart.firstUnlockShown = true;
            }
        }

        if (windowBuckets[i] > peakThreshold && bucketMessages[i].length > 0) {
            // Ranked choice aggregation using scores
            const sentimentScores = {};
            const sentimentCounts = {};
            // For each message, treat predictions as ranked choices (ranked by score)
            bucketMessages[i].forEach(msg => {
            if (Array.isArray(msg.predictions)) {
                // Sort predictions by score descending (just in case)
                const preds = [...msg.predictions].sort((a, b) => b.score - a.score);
                // Assign points: 1st = 3, 2nd = 2, 3rd = 1 (Borda count style)
                preds.forEach((pred, idx) => {
                    const sentiment = pred.sentiment;
                    const points = 3 - idx; // 3, 2, 1
                    if (points > 0) {
                        sentimentScores[sentiment] = (sentimentScores[sentiment] || 0) + points * pred.score;
                        sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1;
                    }
                });
            }
            });
            const sortedSentiments = Object.entries(sentimentScores)
                .sort((a, b) => b[1] - a[1])
                .map(([sentiment]) => sentiment);

            // Find the first sentiment not toggled off
            const topSentiment = sortedSentiments.find(s => !toggledSentiments.has(s));

            if (topSentiment) {
                emojiSpan.textContent = sentimentEmojis[topSentiment] || sentimentEmojis.default;
                emojiSpan.title = topSentiment;
            } else {
                emojiSpan.textContent = sentimentEmojis.default;
                emojiSpan.title = "No sentiment";
            }
        }
        barChartEmojiRow.appendChild(emojiSpan);
    }
}

/**
 * Calculates a "nice" tick interval for a chart axis based on the maximum value and desired tick count.
 */
function niceTickInterval(maxValue, tickCount) {
    if (maxValue === 0) return 1;
    const rough = maxValue / (tickCount - 1);
    const pow10 = Math.pow(10, Math.floor(Math.log10(rough)));
    // Use even finer steps for more precision, especially at low values
    const niceSteps = [
        0.01, 0.02, 0.025, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500,
        1000, 2000, 2500, 5000, 10000, 20000, 25000, 50000, 100000
    ];
    let bestStep = pow10;
    for (let step of niceSteps) {
        if (pow10 * step >= rough) {
            bestStep = pow10 * step;
            break;
        }
    }
    return bestStep;
}

// --- Chart.js Pie Chart Setup (make sure Chart.js is loaded in your extension) ---
let toggledSentiments = new Set();
let pieChart;
/**
 * Updates the pie chart with the given sentiment counts.
 */
function updatePieChart(sentimentCounts) {
    // Sort sentimentCounts by count descending
    const sortedEntries = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1]);
    const labels = sortedEntries.map(([sentiment, count]) => {
        const emoji = sentimentEmojis[sentiment] || sentimentEmojis.default;
        return `${emoji} ${sentiment} (${count})`;
    });
    const data = sortedEntries.map(([, count]) => count);
    const sentiments = sortedEntries.map(([sentiment, ]) => sentiment);
    const backgroundColors = sentiments.map(sentiment =>
        sentimentColorPalette[sentiment.trim().toLowerCase()] || sentimentColorPalette.default
    );    
    if (!pieChart) {
        const ctx = pieCanvas.getContext('2d');
        pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels, // Slice labels
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => ({
                                        text: label,
                                        fontColor: '#fff',
                                        color: '#fff',
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: chart.getDatasetMeta(0).data[i].hidden,
                                        index: i,
                                        datasetIndex: 0 // Important for onClick!
                                    }));
                                }
                                return [];
                            }
                        },
                        onClick: function(e, legendItem, legend) {
                            // Double-click detection
                            // If double-clicked on the same legend item within threshold, toggle ONLY this sentiment,
                            // or if already only this sentiment is visible, restore all (undo)
                            
                            if (!legendClickState.lastClickTime) legendClickState.lastClickTime = 0;
                            if (legendClickState.lastClickIndex === undefined || legendClickState.lastClickIndex === null) legendClickState.lastClickIndex = -1;
                            const now = Date.now();
                            const DOUBLE_CLICK_MS = 500;
                            const chart = legend.chart;
                            const index = legendItem.index;
                            const sentiment = chart.data.labels[index]
                                .replace(/^[^\w]+/, '') // Remove leading emoji and spaces
                                .replace(/\s*\(\d+\)$/, '') // Remove trailing (count)
                                .trim()
                                .toLowerCase();
                            if (
                                legendClickState.lastClickIndex === index &&
                                now - legendClickState.lastClickTime < DOUBLE_CLICK_MS
                            ) {
                                // If only this sentiment is visible (all others hidden), restore all
                                if (
                                    toggledSentiments.size === chart.data.labels.length - 1 &&
                                    !toggledSentiments.has(sentiment)
                                ) {
                                    toggledSentiments.clear();
                                } else if (
                                    toggledSentiments.size === chart.data.labels.length - 1 &&
                                    toggledSentiments.has(sentiment)
                                ) {
                                    // If this sentiment is the only one hidden, restore all
                                    toggledSentiments.clear();
                                } else {
                                    // Hide all except this sentiment
                                    toggledSentiments = new Set(
                                        chart.data.labels
                                            .map(l => l.replace(/\s*\(\d+\)$/, '').trim().toLowerCase())
                                            .filter(s => s !== sentiment)
                                    );
                                }
                            } else {
                                // Normal single click: toggle this sentiment
                                if (toggledSentiments.has(sentiment)) {
                                    toggledSentiments.delete(sentiment);
                                } else {
                                    toggledSentiments.add(sentiment);
                                }
                            }

                            legendClickState.lastClickTime = now;
                            legendClickState.lastClickIndex = index;

                            // After toggling, update all slices' hidden state based on sentiment key
                            const meta = chart.getDatasetMeta(legendItem.datasetIndex);
                            meta.data.forEach((slice, i) => {
                                const sliceSentiment = pieChart.data.labels[i]
                                    .replace(/^[^\w]+/, '') // Remove leading emoji and spaces
                                    .replace(/\s*\(\d+\)$/, '') // Remove trailing (count)
                                    .trim()
                                    .toLowerCase();
                                slice.hidden = toggledSentiments.has(sliceSentiment);
                            });

                            chart.update();
                            const messagesContainer = document.getElementById('hivemind-messages');
                            if (messagesContainer) {
                                messagesContainer.innerHTML = '';
                                windowMessages.forEach(msg => {
                                    if (msg.predictions.some(pred => toggledSentiments.has(pred.sentiment))) return;
                                    // Use the helper function to render the message element without side effects
                                    const messageElement = renderMessageElement(msg);
                                    messagesContainer.appendChild(messageElement);
                                });
                            }
                            updateBarChart(); // Update bar chart to reflect new sentiment visibility
                        }
                    }
                }
            }
        });
    } else {
        pieChart.data.labels = labels;
        pieChart.data.datasets[0].data = data;
        pieChart.data.datasets[0].backgroundColor = backgroundColors;

        // After updating data, re-apply hidden state to slices
        const meta = pieChart.getDatasetMeta(0);
        meta.data.forEach((slice, i) => {
            if (pieChart.data.labels[i] === undefined) {
            return;
            }
            // Remove emoji and (#) from the label to get the sentiment key
            const sliceSentiment = pieChart.data.labels[i]
                .replace(/^[^\w]+/, '') // Remove leading emoji and spaces
                .replace(/\s*\(\d+\)$/, '') // Remove trailing (count)
                .trim()
                .toLowerCase();
            slice.hidden = toggledSentiments.has(sliceSentiment);
        });

        pieChart.update();
        updateBarChart(); // Optionally update bar chart to reflect new window
    }
}

/**
 * Updates the time slider to match the selected time frame.
 */
function updateTimelineLabels() {
    timelineContainer.innerHTML = '';
    const tickCount = 8; // Match your sliderTicks
    const value = parseInt(timeSlider.value, 10);
    const bufferStart = chatBuffer.length ? chatBuffer[0].ts : Date.now();
    const bufferEnd = chatBuffer.length ? chatBuffer[chatBuffer.length - 1].ts : Date.now();
    const bufferDuration = bufferEnd - bufferStart;
    const sliderFraction = value / 99;
    const windowEnd = bufferStart + sliderFraction * bufferDuration;
    const windowStart = windowEnd - selectedTimeFrame * 1000;

    const interval = selectedTimeFrame / (tickCount - 1);

    for (let i = 0; i < tickCount; i++) {
        const tick = document.createElement('span');
        tick.style.flex = '1 1 0';
        tick.style.textAlign = 'center';
        // Calculate timestamp for this tick
        let secondsAgo = selectedTimeFrame - i * interval;
        let ts = windowEnd - secondsAgo * 1000;
        const date = new Date(ts);
        // Format as HH:MM:SS or HH:MM
        let label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: selectedTimeFrame < 3600 ? '2-digit' : undefined });
        tick.textContent = label;
        timelineContainer.appendChild(tick);
    }
}

/**
 * Updates the slider ticks to show the left (limit) and right ("now") labels.
 */
function updateSliderTicks() {
    sliderTicksContainer.innerHTML = '';
    // Only show two ticks: left (limit) and right ("now")
    const leftTick = document.createElement('span');
    leftTick.style.flex = '1 1 0';
    leftTick.style.textAlign = 'left';
    // Format left label as mm:ss or h:mm:ss
    let label;
    if (selectedTimeFrame >= 3600) {
        const h = Math.floor(selectedTimeFrame / 3600);
        const m = Math.floor((selectedTimeFrame % 3600) / 60);
        label = `${h}h${m > 0 ? m + 'm' : ''}`;
    } else if (selectedTimeFrame >= 60) {
        const m = Math.floor(selectedTimeFrame / 60);
        const s = selectedTimeFrame % 60;
        label = s === 0 ? `${m}m` : `${m}m${s}s`;
    } else {
        label = `${selectedTimeFrame}s`;
    }
    leftTick.textContent = label;
    sliderTicksContainer.appendChild(leftTick);

    const rightTick = document.createElement('span');
    rightTick.style.flex = '1 1 0';
    rightTick.style.textAlign = 'right';
    rightTick.textContent = 'now';
    sliderTicksContainer.appendChild(rightTick);
}

/**
 * Updates the pie chart for the current window based on the selected time frame.
 */
function updatePieChartForWindow() {
    const now = Date.now();
    const cutoff = now - selectedTimeFrame * 1000;
    windowMessages = chatBuffer.filter(msg => msg.ts >= cutoff) || [];

    // Aggregate sentiment counts in the window
    const windowSentimentCounts = {};
    windowMessages.forEach(msg => {
        if (Array.isArray(msg.predictions)) {
            msg.predictions.forEach(pred => {
                windowSentimentCounts[pred.sentiment] = (windowSentimentCounts[pred.sentiment] || 0) + 1;
            });
        }
    });

    if (!chatPaused) updatePieChart(windowSentimentCounts);
    updateEmbedsForWindow()
}

// --- Ranking List with Up/Down Arrows ---
let previousRanking = [];
/**
 * Updates the ranking list with sentiment movements.
 */
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

const sentimentCounts = {};
/**
 * Aggregates sentiment counts from a message and updates the pie chart.
 * @param {*} message 
 */
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

/**
 * Buffers a chat message for processing.
 * @param {*} message 
 */
function bufferMessage(message) {
    chatBuffer.push({ ...message, ts: Date.now() });
    // Remove old messages
    const cutoff = Date.now() - MAX_BUFFER_SECONDS * 1000;
    while (chatBuffer.length && chatBuffer[0].ts < cutoff) {
        chatBuffer.shift();
    }
}

/**
 * Adjust the timeSlider so that its range always matches the selectedTimeFrame.
 * The slider's left (0) is the oldest point in the buffer that still covers the selectedTimeFrame,
 * and right (99) is "now".
 * When the time frame changes, reset the slider to "now".
 */
function adjustTimeSliderForTimeFrame() {
    // Always keep slider at "now" when time frame changes
    timeSlider.value = 99;
}

// When you want to summarize the current chat window:
async function updateSummaryUI() {
    try {
        const summary = await summaryClient.summarizeWindow(windowMessages, {
            timeframe: selectedTimeFrame,
            channel: 'your_channel_name'
        });
        // Now update your emotion radar UI, alerts, etc. with summary
        updateEmotionRadarUI(summary);
    } catch (err) {
        console.error('Summary error:', err);
    }
}