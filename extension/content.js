import Chart from 'chart.js/auto';
import ChatClient from '../src/chat-client/index.js';
import TwitchClient from '../src/twitch-client/index.js';
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

let messagesContainer = document.createElement('div');
messagesContainer.id = 'hivemind-messages';
// Remove fixed height to allow flexbox to control sizing
messagesContainer.style.overflowY = 'auto';
messagesContainer.style.position = 'static';
messagesContainer.style.display = 'flex';
messagesContainer.style.background = 'rgba(30,30,30,0.85)';
messagesContainer.style.borderRadius = '8px';
messagesContainer.style.flexDirection = 'column';
messagesContainer.style.gap = '4px';
messagesContainer.style.flex = '1 1 0'; // Allow to grow/shrink in flex layout
messagesContainer.style.minWidth = '0';
messagesContainer.style.minHeight = '300px';
messagesContainer.style.width = '100%';
messagesContainer.style.margin = '10px';
messagesContainer.style.padding = '10px';

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
const downloadButton = document.createElement('button');
downloadButton.textContent = '⬇';
downloadButton.title = 'Download chat data';
downloadButton.style.background = '#222';
downloadButton.style.color = '#fff';
downloadButton.style.border = 'none';
downloadButton.style.borderRadius = '50%';
downloadButton.style.width = '28px';
downloadButton.style.height = '28px';
downloadButton.style.fontSize = '16px';
downloadButton.style.cursor = 'pointer';
downloadButton.style.boxShadow = '0 1px 4px #0004';
downloadButton.style.display = 'flex';
downloadButton.style.alignItems = 'center';
downloadButton.style.justifyContent = 'center';
downloadButton.style.textAlign = 'center';
downloadButton.style.lineHeight = '1';
downloadButton.style.padding = '0';

downloadButton.addEventListener('click', () => {
    const data = JSON.stringify(chatBuffer, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_data.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
});

buttonBar.appendChild(downloadButton);
// Move button creation here so they're not appended directly to overlayContainer
buttonBar.appendChild(stddevControlContainer);
buttonBar.appendChild(popoutButton);
buttonBar.appendChild(minimizeButton);

// This file injects overlay/UI elements into Twitch and YouTube pages, allowing real-time monitoring and interaction with live chats.
// Only create the overlay if it doesn't already exist
let overlayContainer = document.createElement('div');
overlayContainer.id = 'hivemind-overlay';
overlayContainer.style.position = 'fixed';
overlayContainer.style.top = '10px';
overlayContainer.style.right = '10px';
overlayContainer.style.bottom = '50px';
overlayContainer.style.flexDirection = 'row';
overlayContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
overlayContainer.style.color = 'white';
overlayContainer.style.padding = '20px';
overlayContainer.style.borderRadius = '5px';
overlayContainer.style.zIndex = '9999';
overlayContainer.style.height = '100%'
overlayContainer.style.maxHeight = 'calc(100vh - 30px)'; // 10px top + 20px bottom
overlayContainer.style.overflowY = 'scroll';
overlayContainer.style.width = '100%';
overlayContainer.style.fontFamily = 'Arial, sans-serif';
overlayContainer.style.fontSize = '14px';
document.body.appendChild(overlayContainer);

overlayContainer.appendChild(buttonBar);

let leftOverlayColumnContainer = document.createElement('div');
leftOverlayColumnContainer.style.display = 'flex';
leftOverlayColumnContainer.style.flexDirection = 'column';
leftOverlayColumnContainer.style.width = '80%';
leftOverlayColumnContainer.style.height = '800px';
leftOverlayColumnContainer.style.left = '0';
leftOverlayColumnContainer.style.alignItems = 'stretch'; // Ensures children stack vertically and fill width

// --- Sentiment Summary UI ---
const sentimentSummaryContainer = document.createElement('div');
sentimentSummaryContainer.id = 'sentiment-summary';
sentimentSummaryContainer.style.background = 'rgba(30,30,30,0.85)';
sentimentSummaryContainer.style.width = '100%';
sentimentSummaryContainer.style.height = '100%';
sentimentSummaryContainer.style.borderRadius = '8px';
sentimentSummaryContainer.style.display = 'flex';
sentimentSummaryContainer.style.flexDirection = 'row';
sentimentSummaryContainer.style.alignItems = 'left';

// Create a flex row container to hold sentiment summary and radar side by side
const summaryRadarRow = document.createElement('div');
summaryRadarRow.style.display = 'flex';
summaryRadarRow.style.flexDirection = 'row';
summaryRadarRow.style.alignItems = 'center';
summaryRadarRow.style.width = '100%';
summaryRadarRow.style.minHeight = '300px';
summaryRadarRow.style.overflowX = 'auto'; // Allow horizontal scrolling if needed
summaryRadarRow.style.marginLeft = '10px';

// Move sentimentSummaryContainer into the row
summaryRadarRow.appendChild(sentimentSummaryContainer);
// // Create a container for the radar
// const radarContainer = document.createElement('div');
// radarContainer.style.background = 'rgba(30,30,30,0.85)';
// radarContainer.style.padding = '10px';
// radarContainer.style.margin = '10px';
// radarContainer.style.borderRadius = '8px';
// radarContainer.style.display = 'flex';
// radarContainer.style.flexDirection = 'row';
// radarContainer.style.alignItems = 'center';
// radarContainer.style.gap = '24px';
// radarContainer.style.justifyContent = 'center';
// radarContainer.style.height = '100%';

// const radarIframe = document.createElement('iframe');
// radarIframe.src = chrome.runtime.getURL('emotion-radar.html');
// radarIframe.style.width = '20%';
// radarIframe.style.height = '300px';
// radarIframe.style.right = 0;
// radarIframe.style.margin = '10px';
// radarIframe.style.border = 'none';
// radarIframe.style.background = 'transparent';
// radarIframe.style.overflow = 'hidden';
// radarIframe.scrolling = 'no';
// radarIframe.setAttribute('scrolling', 'no');
// radarIframe.allowTransparency = 'true';

// // Move radarIframe into the radarContainer
// radarContainer.appendChild(radarIframe);

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
// Insert the row into the overlay (replace previous sentimentSummaryContainer usage)

leftOverlayColumnContainer.appendChild(messagesContainer);
leftOverlayColumnContainer.appendChild(summaryRadarRow);
// Create a row container to hold leftOverlayColumnContainer and mediaEmbedColumnContainer side by side
const overlayRowContainer = document.createElement('div');
overlayRowContainer.style.display = 'flex';
overlayRowContainer.style.flexDirection = 'row';
overlayRowContainer.style.width = '100%';
overlayRowContainer.style.alignItems = 'flex-start';
/**
 * --- Media Embed Filter Bar ---
 * This bar floats at the top of the mediaEmbedColumnContainer and allows filtering by embed type.
 */

// Define embed types and their labels/icons
const embedTypes = [
    { key: 'news', label: 'News', emoji: '📰' },
    { key: 'twitter', label: 'Twitter/X', emoji: '🐦' },
    { key: 'youtube', label: 'YouTube', emoji: '▶️' },
    { key: 'twitch', label: 'Twitch', emoji: '🎮' },
    { key: 'tiktok', label: 'TikTok', emoji: '🎵' },
    { key: 'instagram', label: 'Instagram', emoji: '📸' },
    { key: 'reddit', label: 'Reddit', emoji: '👽' },
    { key: 'wikipedia', label: 'Wiki', emoji: '📚' },
    { key: 'image', label: 'Image', emoji: '🖼️' },
    { key: 'video', label: 'Video', emoji: '🎬' },
    { key: 'other', label: 'Other', emoji: '🔗' }
];

// Track toggled-off embed types (hidden)
const toggledEmbedTypes = new Set();

// Helper to classify embed type from URL
function getEmbedType(url) {
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) return 'image';
    if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
    if (/twitch\.tv/i.test(url)) return 'twitch';
    if (/tiktok\.com/i.test(url)) return 'tiktok';
    if (/instagram\.com/i.test(url)) return 'instagram';
    if (/reddit\.com/i.test(url)) return 'reddit';
    if (/wikipedia\.org/i.test(url)) return 'wikipedia';
    if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
    if (/\.mp4$/i.test(url)) return 'video';
    if (/nytimes\.com|cnn\.com|bbc\.co\.uk|bbc\.com|washingtonpost\.com|theguardian\.com|reuters\.com|bloomberg\.com|npr\.org|forbes\.com|wsj\.com|apnews\.com|aljazeera\.com|cnbc\.com|foxnews\.com|abcnews\.go\.com|news\.yahoo\.com|usatoday\.com|nbcnews\.com|politico\.com|vox\.com|axios\.com|theverge\.com|techcrunch\.com|wired\.com|engadget\.com|arstechnica\.com|nature\.com|sciencemag\.org|scientificamerican\.com/i.test(url)) return 'news';
    return 'other';
}

// Create the filter bar
const embedFilterBar = document.createElement('div');
embedFilterBar.style.position = 'sticky';
embedFilterBar.style.top = '0';
embedFilterBar.style.left = '0';
embedFilterBar.style.right = '0';
embedFilterBar.style.zIndex = '100';
embedFilterBar.style.background = 'rgba(43,43,43,0.97)';
embedFilterBar.style.display = 'flex';
embedFilterBar.style.gap = '8px';
embedFilterBar.style.alignItems = 'center';
embedFilterBar.style.padding = '6px 10px 6px 10px';
embedFilterBar.style.borderBottom = '1px solid #2226';
embedFilterBar.style.borderTopLeftRadius = '8px';
embedFilterBar.style.borderTopRightRadius = '8px';
embedFilterBar.style.boxShadow = '0 2px 8px #0002';

// Add filter toggle buttons
embedTypes.forEach(type => {
    const btn = document.createElement('button');
    btn.textContent = `${type.emoji} ${type.label}`;
    btn.style.background = '#222';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.padding = '4px 10px';
    btn.style.fontSize = '13px';
    btn.style.cursor = 'pointer';
    btn.style.opacity = '1';
    btn.style.transition = 'background 0.2s, opacity 0.2s';
    btn.dataset.embedType = type.key;
    btn.classList.add('embed-filter-btn');
    btn.addEventListener('click', () => {
        if (toggledEmbedTypes.has(type.key)) {
            toggledEmbedTypes.delete(type.key);
            btn.style.opacity = '1';
            btn.style.background = '#222';
        } else {
            toggledEmbedTypes.add(type.key);
            btn.style.opacity = '0.5';
            btn.style.background = '#444';
        }
        updateEmbedFilterVisibility();
    });
    embedFilterBar.appendChild(btn);
});

// Patch updateEmbedsForWindow to re-apply filter after updating embeds
const origUpdateEmbedsForWindow = updateEmbedsForWindow;
updateEmbedsForWindow = function() {
    origUpdateEmbedsForWindow.apply(this, arguments);
    updateEmbedFilterVisibility();
};
// Media embed column container
let mediaEmbedColumnContainer = document.createElement('div');
// Make embeds stack from top to bottom (newest at top)
mediaEmbedColumnContainer.style.display = 'flex';
mediaEmbedColumnContainer.style.background = 'rgba(30,30,30,0.85)';
mediaEmbedColumnContainer.style.borderRadius = '8px';
mediaEmbedColumnContainer.id = 'hivemind-media-embeds';
mediaEmbedColumnContainer.style.flexDirection = 'column';
mediaEmbedColumnContainer.style.gap = '8px';
mediaEmbedColumnContainer.style.flex = '1 1 0';
mediaEmbedColumnContainer.style.height = '790px';
mediaEmbedColumnContainer.style.overflowY = 'scroll';
mediaEmbedColumnContainer.style.width = '80%';
mediaEmbedColumnContainer.style.marginTop = '10px';
mediaEmbedColumnContainer.style.marginRight = '10px';
mediaEmbedColumnContainer.style.marginLeft = '20px';
mediaEmbedColumnContainer.style.paddingLeft = '10px';
mediaEmbedColumnContainer.style.paddingRight = '10px';
mediaEmbedColumnContainer.style.paddingTop = '100px';
mediaEmbedColumnContainer.style.alignItems = 'stretch';

// Insert filter bar at the top of the media embed column
mediaEmbedColumnContainer.insertBefore(embedFilterBar, mediaEmbedColumnContainer.firstChild);

// Update embed visibility based on toggledEmbedTypes
function updateEmbedFilterVisibility() {
    Array.from(mediaEmbedColumnContainer.children).forEach(child => {
        if (child === embedFilterBar) return;
        const url = child.dataset.normalizedUrl || child.src || child.href || '';
        const type = getEmbedType(url);
        child.style.display = toggledEmbedTypes.has(type) ? 'none' : '';
    });
}

// Add left and right columns to the row container
overlayRowContainer.appendChild(leftOverlayColumnContainer);
overlayRowContainer.appendChild(mediaEmbedColumnContainer);

// Add the row container to the overlay
overlayContainer.appendChild(overlayRowContainer);

// --- Chat Volume Slider & Bar Chart ---

// Container for slider and bar chart
const sliderBarContainer = document.createElement('div');
sliderBarContainer.style.display = 'flex';
sliderBarContainer.style.flexDirection = 'column';
sliderBarContainer.style.alignItems = 'stretch';
sliderBarContainer.style.background = 'rgba(30,30,30,0.85)';
sliderBarContainer.style.borderRadius = '8px';
sliderBarContainer.style.gap = '4px';
sliderBarContainer.style.margin = '10px';
sliderBarContainer.style.padding = '10px';

// Vertical slider
const timeSlider = document.createElement('input');
timeSlider.type = 'range';
timeSlider.min = 0;
timeSlider.max = 99;
timeSlider.value = 99;
timeSlider.step = 1;
timeSlider.style.width = '89%';  
timeSlider.style.height = '12px';  // Typical slider height
timeSlider.style.margin = '8px auto';
timeSlider.style.display = 'block';
timeSlider.style.backgroundColor = 'grey';
timeSlider.style.cursor = 'pointer';
// Make the slider thumb/button grey
timeSlider.style.setProperty('accent-color', 'grey');

// Vertical bar chart container
const barChartContainer = document.createElement('div');
barChartContainer.style.background = 'rgba(43, 43, 43, 0.89)';
barChartContainer.style.display = 'flex';
barChartContainer.style.flexDirection = 'row';
barChartContainer.style.alignItems = 'flex-end';
barChartContainer.style.height = '60px'; // Height of the bars
barChartContainer.style.width = '89%';
barChartContainer.style.gap = '1px';
barChartContainer.style.position = 'relative';

// Add a background grid lines container so lines are always behind bars
const barChartGridLines = document.createElement('div');
barChartGridLines.style.position = 'absolute';
barChartGridLines.style.left = '0';
barChartGridLines.style.top = '0';
barChartGridLines.style.width = '100%';
barChartGridLines.style.height = '100%';
barChartGridLines.style.pointerEvents = 'none';
barChartGridLines.style.zIndex = '0';

// Add three horizontal chart lines (grid lines)
for (let i = 0; i < 3; i++) {
    const line = document.createElement('div');
    line.style.position = 'absolute';
    line.style.left = '0';
    line.style.width = '100%';
    line.style.height = '1px';
    line.style.background = 'black';
    line.style.opacity = '0.2';
    line.style.pointerEvents = 'none';
    // Position lines at 0%, 50%, 100% from the top
    if (i === 0) {
        line.style.top = '0';
    } else if (i === 1) {
        line.style.top = '50%';
        line.style.transform = 'translateY(-0.5px)';
    } else {
        line.style.bottom = '0';
    }
    barChartGridLines.appendChild(line);
}
barChartContainer.appendChild(barChartGridLines);
// Center the bar chart horizontally in the window
barChartContainer.style.marginLeft = 'auto';
barChartContainer.style.marginRight = 'auto';

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
sliderTicksContainer.style.width = '89%';
sliderTicksContainer.style.fontSize = '11px';
sliderTicksContainer.style.color = '#bbb';
sliderTicksContainer.style.marginTop = '-4px'; // Pull closer to slider
sliderTicksContainer.style.marginLeft = 'auto';
sliderTicksContainer.style.marginRight = 'auto';

/**
 * --- Viewership Line Plot ---
 * This section creates a new container row for viewership count.
 * It will be a simple line plot that extends the length of the timeline.
 */

// Container for the viewership plot
const viewershipRowContainer = document.createElement('div');
viewershipRowContainer.style.display = 'flex';
viewershipRowContainer.style.flexDirection = 'row';
viewershipRowContainer.style.alignItems = 'center';
viewershipRowContainer.style.background = 'rgba(30,30,30,0.85)';
viewershipRowContainer.style.borderRadius = '8px';
viewershipRowContainer.style.margin = '10px';
viewershipRowContainer.style.padding = '10px 10px 10px 10px';

// Canvas for the line plot
let viewershipCanvas = document.createElement('canvas');
viewershipCanvas.id = 'viewership-lineplot';
viewershipCanvas.width = 1800;
viewershipCanvas.height = 100;
viewershipCanvas.style.width = '100%';
viewershipCanvas.style.height = '100px';
viewershipCanvas.style.padding = '10px 10px 10px 10px';
viewershipCanvas.style.background = 'rgba(43,43,43,0.89)';
viewershipCanvas.style.borderRadius = '6px';
viewershipCanvas.style.display = 'block';
viewershipCanvas.style.margin = 'auto';
viewershipRowContainer.appendChild(viewershipCanvas);

// --- Viewership Data Buffer and Plotting ---
const viewershipBuffer = [];
const MAX_VIEWERSHIP_POINTS = 200; // Keep last 200 points

// Redraw when time frame changes
timeFrameRadios.querySelectorAll('input[type=radio]').forEach(radio => {
    radio.addEventListener('change', drawViewershipLinePlot);
});

// Create or get the y-axis container and insert it as a sibling to the bar chart container
let yAxisContainer = document.createElement('div');
yAxisContainer.id = 'hivemind-bar-yaxis';
yAxisContainer.style.display = 'flex';
yAxisContainer.style.flexDirection = 'row';
yAxisContainer.style.height = '75px';
yAxisContainer.style.width = '75px'; 
yAxisContainer.style.marginRight = '4px';
yAxisContainer.style.fontSize = '12px';
yAxisContainer.style.color = '#bbb';
yAxisContainer.style.textAlign = 'right';
yAxisContainer.style.userSelect = 'none';
yAxisContainer.style.marginLeft = '10px';
yAxisContainer.style.marginTop = '10px';

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

// Create y-axis line with ticks
const yAxisLabelsContainer = document.createElement('div');
yAxisLabelsContainer.style.display = 'flex';
yAxisLabelsContainer.style.flexDirection = 'column';
yAxisLabelsContainer.style.justifyContent = 'center'; // Center vertically
yAxisLabelsContainer.style.height = '75px';
yAxisLabelsContainer.style.alignItems = 'flex-end';
yAxisLabelsContainer.style.width = '18px'; // Adjust width as needed
yAxisLabelsContainer.style.marginTop = '-10px';
yAxisLabelsContainer.style.marginRight = '10px';
yAxisLabelsContainer.style.position = 'relative';

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
barChartRow.style.marginTop = '20px';
barChartRow.style.padding = '10px';
barChartRow.style.position = 'relative';

yAxisContainer.style.position = 'absolute';
yAxisContainer.style.left = '0';
yAxisContainer.style.top = '0';
yAxisContainer.style.bottom = '0';
yAxisContainer.style.zIndex = '2';
barChartRow.appendChild(yAxisContainer);
// Add yAxisContainer as a child of barChartRow (not barChartContainer)
yAxisContainer.appendChild(yAxisLineContainer);
barChartRow.appendChild(barChartContainer);
barChartRow.style.width = '100%';

// Replace direct barChartContainer append with barChartRow
sliderBarContainer.appendChild(barChartRow);

// Add slider and bar chart to the container
sliderBarContainer.appendChild(barChartEmojiRow);
sliderBarContainer.appendChild(timeSlider);
sliderBarContainer.appendChild(sliderTicksContainer);

updateSliderTicks();

// Insert the viewership row above the sliderBarContainer
overlayContainer.appendChild(viewershipRowContainer);

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
    drawViewershipLinePlot();
});

updateTimelineLabels();

// Pie chart canvas
const pieCanvas = document.createElement('canvas');
pieCanvas.id = 'sentiment-pie';
// Remove fixed width/height styles that may interfere with centering
pieCanvas.style.display = 'block';
pieCanvas.style.padding = '10px';
pieCanvas.style.width = '1200px';
pieCanvas.style.height = '300px';

const pieWrapper = document.createElement('div');
pieWrapper.style.width = '1200px';
pieWrapper.style.height = '320px';
pieWrapper.style.display = 'flex';
pieWrapper.style.justifyContent = 'left';
pieWrapper.style.alignItems = 'center';
pieWrapper.appendChild(pieCanvas);
sentimentSummaryContainer.style.alignItems = 'center'; // helps vertically align
sentimentSummaryContainer.appendChild(pieWrapper);

//sentimentSummaryContainer.appendChild(radarIframe);
//sentimentSummaryContainer.appendChild(movementArrowList);

let chatPaused = false;

const twitchClient = new TwitchClient();

const chatClient = new ChatClient('twitch'); // or 'youtube'
chatClient.on('message', (msg) => {
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
    if (
        toggledSentiments &&
        Array.isArray(msg.predictions) &&
        msg.predictions.some(pred => toggledSentiments.has(pred.sentiment))
    ) return;    
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

// Listen for messages from the chat client
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "tabUrl") {
        // Use request.url as needed
        console.log("Tab URL received in content script:", request.url);
        // You can now use request.url in your content script logic
        chatClient.connect(request.url);
        twitchClient.startViewerCountPolling(request.url, addViewershipPoint, 10000); // 10 seconds is the shortest time interval for the UI
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
/**
 * Track embed timestamps for deduplication and time-window filtering.
 */
const embedTimestamps = new Map();

/**
 * Updates the embeds shown in the overlay to match the current time window.
 * Only embeds from messages within the selectedTimeFrame are shown.
 * Ensures embeds are in correct order (newest at top, oldest at bottom).
 * If a URL is repeated, only the latest is shown, with a badge for the repeat count.
 */
function updateEmbedsForWindow() {
    // Map of normalizedUrl -> { count, msg, idx, type }
    // We'll process from newest to oldest so the first time we see a URL is the latest.
    const urlMap = new Map();
    windowMessages.slice().reverse().forEach((msg, idx) => {
        if (typeof msg.message === "string") {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urls = msg.message.match(urlRegex);
            if (urls) {
                urls.forEach(url => {
                    const embedUrl = getEmbedUrl(url); // always normalize!
                    const type = getEmbedType(embedUrl);
                    if (isEmbeddableUrl(embedUrl)) {
                        if (!urlMap.has(embedUrl)) {
                            urlMap.set(embedUrl, { count: 1, msg, idx, type });
                        } else {
                            urlMap.get(embedUrl).count += 1;
                        }
                    }
                });
            }
        }
    });

    // The order should be newest at top, so sort by idx descending (since we reversed above)
    let urlEntries = Array.from(urlMap.entries())
        .sort((a, b) => b[1].idx - a[1].idx);

    // Filter out toggled embed types
    urlEntries = urlEntries.filter(([url, info]) => !toggledEmbedTypes.has(info.type));

    // Remove embeds not in the window (regardless of order)
    const currentChildren = Array.from(mediaEmbedColumnContainer.children).filter(child => child !== embedFilterBar);
    currentChildren.forEach(child => {
        const url = child.dataset.normalizedUrl;
        if (url && !urlEntries.some(([u]) => u === url)) {
            child.remove();
        }
    });

    // Build a map of normalized url -> element for current children
    const urlToElement = {};
    Array.from(mediaEmbedColumnContainer.children).forEach(child => {
        const url = child.dataset.normalizedUrl;
        if (url) urlToElement[url] = child;
    });

    // Insert/move only the latest occurrence of each URL (newest at top, after embedFilterBar)
    urlEntries.forEach(([url, info], i) => {
        let embedElement = urlToElement[url];
        if (!embedElement) {
            addEmbedToOverlay([url]);
            embedElement = Array.from(mediaEmbedColumnContainer.children).find(child => child.dataset.normalizedUrl === url);
        }
        if (embedElement) {
            // Move to correct position if needed (after embedFilterBar)
            const children = Array.from(mediaEmbedColumnContainer.children);
            const embedIndex = children.indexOf(embedElement);
            const desiredIndex = i + 1; // +1 because embedFilterBar is always first
            if (embedIndex !== desiredIndex) {
                const refNode = mediaEmbedColumnContainer.children[desiredIndex] || null;
                if (embedElement !== refNode) {
                    mediaEmbedColumnContainer.insertBefore(embedElement, refNode);
                }
            }
            // Add or update badge for repeat count
            let badge = embedElement.querySelector('.embed-repeat-badge');
            if (info.count > 1) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'embed-repeat-badge';
                    badge.style.position = 'absolute';
                    badge.style.top = '6px';
                    badge.style.right = '6px';
                    badge.style.background = '#2196F3';
                    badge.style.color = '#fff';
                    badge.style.fontWeight = 'bold';
                    badge.style.fontSize = '12px';
                    badge.style.padding = '2px 7px';
                    badge.style.borderRadius = '12px';
                    badge.style.zIndex = '10';
                    badge.style.boxShadow = '0 1px 4px #0004';
                    badge.style.pointerEvents = 'none';
                    // Make sure the parent is positioned
                    embedElement.style.position = 'relative';
                    embedElement.appendChild(badge);
                }
                badge.textContent = `×${info.count}`;
                badge.title = `${info.count} people sent this link`;
            } else if (badge) {
                badge.remove();
            }
        }
    });

    // Remove any extra children beyond the number of unique URLs (so only one per group), but never remove embedFilterBar
    while (mediaEmbedColumnContainer.children.length > urlEntries.length + 1) {
        // Always keep embedFilterBar as the first child
        if (mediaEmbedColumnContainer.lastChild !== embedFilterBar) {
            mediaEmbedColumnContainer.removeChild(mediaEmbedColumnContainer.lastChild);
        } else {
            // If lastChild is embedFilterBar, remove the one before it
            if (mediaEmbedColumnContainer.children.length > 1) {
                mediaEmbedColumnContainer.removeChild(mediaEmbedColumnContainer.children[mediaEmbedColumnContainer.children.length - 2]);
            } else {
                break;
            }
        }
    }

    // --- Sticky/floating embedFilterBar logic ---
    // Ensure embedFilterBar is always the first child and styled to float above embeds
    if (mediaEmbedColumnContainer.firstChild !== embedFilterBar) {
        mediaEmbedColumnContainer.insertBefore(embedFilterBar, mediaEmbedColumnContainer.firstChild);
    }
    embedFilterBar.style.position = 'sticky';
    // Make embedFilterBar sticky to the window, not just the container
    embedFilterBar.style.position = 'fixed';
    embedFilterBar.style.top = (buttonBar.getBoundingClientRect().bottom + 10) + 'px';
    embedFilterBar.style.left = mediaEmbedColumnContainer.getBoundingClientRect().left + 'px';
    embedFilterBar.style.maxWidth = (parseInt(mediaEmbedColumnContainer.offsetWidth, 10) - 20) + 'px';
    embedFilterBar.style.overflowX = 'auto';
    embedFilterBar.style.zIndex = '10010';
    embedFilterBar.style.background = 'rgba(43,43,43,0.97)';
    embedFilterBar.style.boxShadow = '0 2px 8px #0002';

    // Keep the filter bar in sync with window scroll/resize
    function updateEmbedFilterBarPosition() {
        const rect = mediaEmbedColumnContainer.getBoundingClientRect();
        embedFilterBar.style.left = rect.left + 'px';
        embedFilterBar.style.width = rect.width + 'px';
        embedFilterBar.style.top = (buttonBar.getBoundingClientRect().bottom + 10) + 'px';
    }
    window.addEventListener('scroll', updateEmbedFilterBarPosition, { passive: true });
    window.addEventListener('resize', updateEmbedFilterBarPosition);
    updateEmbedFilterBarPosition();
    embedFilterBar.style.zIndex = '10010';
    embedFilterBar.style.background = 'rgba(43,43,43,0.97)';
    embedFilterBar.style.boxShadow = '0 2px 8px #0002';

    // Prevent overlap with buttonBar by adjusting top offset dynamically
    // (If overlayContainer is scrolled, sticky will keep it visible at the right spot)
}

/**
 * Returns true if the given URL is embeddable (i.e., addEmbedToOverlay will create an element for it)
 */
function isEmbeddableUrl(url) {
    // Image
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) return true;
    // Youtube videos
    if (
        /youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\//i.test(url) ||
        /youtube\.com\/embed\/[A-Za-z0-9_\-]+/i.test(url)
    ) return true;
    // YouTube channel/profile (not embeddable as video, but as a link)
    if (/youtube\.com\/(channel|user|c|@)[^\/\s]+/i.test(url)) return true;
    // Twitch VOD
    if (/twitch\.tv\/videos\/(\d+)/i.test(url)) return true;
    // MP4 video
    if (/\.mp4$/i.test(url)) return true;
    // TikTok video
    if (/tiktok\.com\/@[\w.-]+\/video\/\d+/i.test(url)) return true;
    // TikTok profile
    if (/tiktok\.com\/@[\w.-]+\/?$/i.test(url)) return true;
    // Instagram post
    if (/instagram\.com\/p\/[\w-]+/i.test(url)) return true;
    // Instagram profile
    if (/instagram\.com\/([a-zA-Z0-9_.]+)\/?$/i.test(url) && !/\/p\//i.test(url)) return true;
    // Wikipedia article
    if (/^https?:\/\/([a-z]+\.)?wikipedia\.org\/wiki\/[^ ]+/i.test(url)) return true;
    // X/Twitter post
    if (/^(https?:\/\/)?(x\.com|twitter\.com)\/[^\/]+\/status\/(\d+)/i.test(url)) return true;
    // ...add more as needed...
}

function getEmbedUrl(url) {
    // YouTube video (watch, short, youtu.be, embed)
    if (
        /youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\//i.test(url) ||
        /youtube\.com\/embed\/[A-Za-z0-9_\-]+/i.test(url)
    ) {
        // Try to extract video ID from various formats
        let videoId = null;
        // 1. /embed/VIDEOID
        let ytMatch = url.match(/(?:embed\/)([A-Za-z0-9_\-]+)/);
        if (ytMatch) videoId = ytMatch[1];
        // 2. /watch?v=VIDEOID
        if (!videoId) {
            ytMatch = url.match(/[?&]v=([A-Za-z0-9_\-]+)/);
            if (ytMatch) videoId = ytMatch[1];
        }
        // 3. youtu.be/VIDEOID
        if (!videoId) {
            ytMatch = url.match(/youtu\.be\/([A-Za-z0-9_\-]+)/);
            if (ytMatch) videoId = ytMatch[1];
        }
        // 4. /shorts/VIDEOID
        if (!videoId) {
            ytMatch = url.match(/shorts\/([A-Za-z0-9_\-]+)/);
            if (ytMatch) videoId = ytMatch[1];
        }
        if (videoId) {
            // Use the current window's origin for deduplication and embedding
            return `https://www.youtube.com/embed/${videoId}?origin=${encodeURIComponent(window.location.origin)}`;
        }
    }
    // YouTube channel/profile (not a video)
    if (/youtube\.com\/(channel|user|c|@)[^\/\s]+/i.test(url)) {
        // Track but do not embed as video
        return url;
    }
    // TikTok
    // TikTok video
    if (/tiktok\.com\/(@[\w.-]+\/video\/\d+)/i.test(url)) {
        // Use the official TikTok embed format to avoid flickering
        // https://www.tiktok.com/embed/v2/{videoId}?lang=en-US
        const match = url.match(/video\/(\d+)/);
        if (match) {
            return `https://www.tiktok.com/embed/v2/${match[1]}?lang=en-US`;
        }
    }
    // TikTok profile
    if (/tiktok\.com\/@[\w.-]+\/?$/i.test(url)) {
        // Remove trailing slash for consistency
        const match = url.match(/tiktok\.com\/(@[\w.-]+)/i);
        if (match) {
            return `https://www.tiktok.com/${match[1]}`;
        }
    }
    // Twitch VOD
    if (/twitch\.tv\/videos\/(\d+)/i.test(url)) {
        const match = url.match(/twitch\.tv\/videos\/(\d+)/i);
        const videoId = match ? match[1] : null;
        if (videoId) {
            return `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}`;
        } else {
            return url;
        }
    }
    // Wikipedia article
    if (/^https?:\/\/([a-z]+\.)?wikipedia\.org\/wiki\/[^ ]+/i.test(url)) {
        // Remove fragment for cleaner preview
        return url.replace(/#.*/, '');
    }
    // Instagram post
    if (/instagram\.com\/p\/[\w-]+/i.test(url)) {
        const match = url.match(/instagram\.com\/p\/([\w-]+)/i);
        if (match) {
            return `https://www.instagram.com/p/${match[1]}/embed`;
        }
    }
    // Instagram profile
    if (/instagram\.com\/([a-zA-Z0-9_.]+)\/?$/i.test(url) && !/\/p\//i.test(url)) {
        const match = url.match(/instagram\.com\/([a-zA-Z0-9_.]+)\/?$/i);
        if (match) {
            return `https://www.instagram.com/${match[1]}/embed`;
        }
    }
    // Wikipedia article
    if (/^https?:\/\/([a-z]+\.)?wikipedia\.org\/wiki\/[^ ]+/i.test(url)) {
        // Remove fragment for cleaner preview
        return url.replace(/#.*/, '');
    }
    // MP4
    if (/\.mp4$/i.test(url)) return url;
    // ...add other platforms as needed...
    return url;
}

// Patch addEmbedToOverlay to handle deduplication for the current window only
const origAddEmbedToOverlay = addEmbedToOverlay;
addEmbedToOverlay = function(urls) {
    // Only add embeds that are not already present
    const currentChildren = Array.from(mediaEmbedColumnContainer.children);
    const currentUrls = new Set();
    currentChildren.forEach(child => {
        let url = null;
        if (child.tagName === 'IMG' || child.tagName === 'VIDEO' || child.tagName === 'IFRAME') {
            url = getEmbedUrl(child.src);
        } else if (child.tagName === 'A' && child.href) {
            url = getEmbedUrl(child.href);
        }
        if (url) currentUrls.add(url);
    });

    // Only add new embeds
    const urlsToAdd = urls.filter(url => !currentUrls.has(url));
    if (urlsToAdd.length > 0) {
        origAddEmbedToOverlay(urlsToAdd);
    }
};

/**
 * Track embed expiration and deduplication.
 */
function addEmbedToOverlay(urls) {
    urls.forEach(url => {
        let embedElement = null;
        // Image
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
            embedElement = document.createElement('img');
            embedElement.src = url;
            embedElement.style.margin = '4px';
        }
        // Youtube videos
        else if (
            /youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\//i.test(url) ||
            /youtube\.com\/embed\/[A-Za-z0-9_\-]+/i.test(url)
        ) {
            let videoId = null;
            let ytMatch = url.match(/(?:embed\/)([A-Za-z0-9_\-]+)/);
            if (ytMatch) videoId = ytMatch[1];
            if (videoId) {
                embedElement = document.createElement('iframe');
                embedElement.src = url;
                embedElement.frameBorder = "0";
                embedElement.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                embedElement.allowFullscreen = true;
                embedElement.style.margin = '4px';
            }
        }
        // YouTube channel/profile
        else if (/youtube\.com\/(channel|user|c|@)[^\/\s]+/i.test(url)) {
            embedElement = document.createElement('a');
            embedElement.href = url;
            embedElement.target = '_blank';
            embedElement.rel = 'noopener noreferrer';
            embedElement.textContent = "View YouTube Channel/Profile";
            embedElement.style.display = 'inline-block';
            embedElement.style.margin = '4px';
            embedElement.style.fontSize = '12px';
            embedElement.style.color = '#FF0000';
            embedElement.style.textDecoration = 'underline';
        } else if (/^https?:\/\/youtu\.be\/[A-Za-z0-9_\-]+/i.test(url)) {
            const match = url.match(/^https?:\/\/youtu\.be\/([A-Za-z0-9_\-]+)/i);
            if (match) {
                embedElement = document.createElement('iframe');
                embedElement.src = `https://www.youtube.com/embed/${match[1]}?origin=${encodeURIComponent(window.location.origin)}`;
                embedElement.frameBorder = "0";
                embedElement.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                embedElement.allowFullscreen = true;
                embedElement.style.margin = '4px';
            }
        }
        // Twitch VOD
        else if (/twitch\.tv\/videos\/(\d+)/i.test(url)) {
            const match = url.match(/twitch\.tv\/videos\/(\d+)/i);
            const videoId = match ? match[1] : null;
            embedElement = document.createElement('iframe');
            if (videoId) {
                embedElement.src = `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}`;
            } else {
                embedElement.src = url;
            }
            embedElement.frameBorder = "0";
            embedElement.allowFullscreen = true;
            embedElement.style.margin = '4px';
        }
        // MP4 video
        else if (/\.mp4$/i.test(url)) {
            embedElement = document.createElement('video');
            embedElement.src = url;
            embedElement.controls = true;
            embedElement.style.margin = '4px';
        }
        // X/Twitter post - simple preview without API
        else if (/^(https?:\/\/)?(x\.com|twitter\.com)\/[^\/]+\/status\/(\d+)/i.test(url)) {
            // Extract username and tweet ID for display
            const match = url.match(/(?:x\.com|twitter\.com)\/([^\/]+)\/status\/(\d+)/i);
            const username = match ? match[1] : 'user';
            const tweetId = match ? match[2] : '';
            embedElement = document.createElement('div');
            embedElement.style.margin = '4px';
            embedElement.style.padding = '8px';
            embedElement.style.background = 'rgba(29, 161, 242, 0.1)';
            embedElement.style.borderRadius = '8px';
            embedElement.style.display = 'flex';
            embedElement.style.alignItems = 'center';
            embedElement.style.gap = '8px';
            // Add a Twitter emoji and username
            const icon = document.createElement('span');
            // Use X logo from their domain if available, else fallback to emoji
            icon.innerHTML = '<img src="https://abs.twimg.com/favicons/twitter.2.ico" alt="X" style="width:20px;height:20px;vertical-align:middle;">';
            icon.style.fontSize = '20px';
            icon.style.marginRight = '6px';
            embedElement.appendChild(icon);
            const userSpan = document.createElement('span');
            userSpan.textContent = `@${username}`;
            userSpan.style.fontWeight = 'bold';
            userSpan.style.color = '#1da1f2';
            embedElement.appendChild(userSpan);
            // Add a link to the tweet
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'View Tweet';
            link.style.marginLeft = '8px';
            link.style.color = '#1da1f2';
            link.style.textDecoration = 'underline';
            embedElement.appendChild(link);
        }
        // TikTok video
        else if (/tiktok\.com\/embed\/v2\/\d+\?lang=en-US/i.test(url)) {
            // Already normalized embed URL
            const match = url.match(/embed\/v2\/(\d+)/);
            if (match) {
                embedElement = document.createElement('iframe');
                embedElement.src = url;
                embedElement.frameBorder = "0";
                embedElement.allow = "encrypted-media";
                embedElement.allowFullscreen = true;
                embedElement.style.margin = '4px';
            }
        }
        // fallback for legacy direct video links (optional, for mp4s)
        else if (/tiktokcdn.*\.mp4/i.test(url)) {
            embedElement = document.createElement('video');
            embedElement.src = url;
            embedElement.controls = true;
            embedElement.style.margin = '4px';
        }
        // Threads post
        else if (/threads\.net\/@[\w.-]+\/post\/\d+/i.test(url)) {
            embedElement = document.createElement('iframe');
            embedElement.src = url;
            embedElement.frameBorder = "0";
            embedElement.allowFullscreen = true;
            embedElement.style.margin = '4px';
        }
        // Instagram post
        else if (/instagram\.com\/p\/[\w-]+/i.test(url)) {
            embedElement = document.createElement('iframe');
            embedElement.src = `https://www.instagram.com/p/${url.match(/instagram\.com\/p\/([\w-]+)/i)[1]}/embed`;
            embedElement.frameBorder = "0";
            embedElement.allowFullscreen = true;
            embedElement.style.margin = '4px';
        }
        // Facebook post
        else if (/facebook\.com\/[^\/]+\/posts\/\d+/i.test(url)) {
            embedElement = document.createElement('iframe');
            embedElement.src = `https://www.facebook.com/plugins/post.php?href=${url}`;
            embedElement.frameBorder = "0";
            embedElement.allowFullscreen = true;
            embedElement.style.margin = '4px';
        }
        // Reddit post
        else if (/reddit\.com\/r\/[\w\d_]+\/comments\/[\w\d]+/i.test(url)) {
            embedElement = document.createElement('iframe');
            embedElement.src = `https://www.redditmedia.com${url.replace(/^https?:\/\/(www\.)?reddit\.com/, '')}`;
            embedElement.frameBorder = "0";
            embedElement.setAttribute('allowfullscreen', '');
            embedElement.style.margin = '4px';
        }
        // Bluesky post
        else if (/bsky\.app\/profile\/[^\/]+\/post\/[\w\d]+/i.test(url)) {
            embedElement = document.createElement('iframe');
            embedElement.src = url;
            embedElement.frameBorder = "0";
            embedElement.allowFullscreen = true;
            embedElement.style.margin = '4px';
        }
        // Mastodon post
        else if (/\/@[\w\d_]+\/\d+$/i.test(url) && /mastodon\./i.test(url)) {
            embedElement = document.createElement('iframe');
            embedElement.src = url;
            embedElement.frameBorder = "0";
            embedElement.allowFullscreen = true;
            embedElement.style.margin = '4px';
        }
        // Wikipedia article
        else if (/^https?:\/\/([a-z]+\.)?wikipedia\.org\/wiki\/[^ ]+/i.test(url)) {
            embedElement = document.createElement('iframe');
            // Remove fragment for cleaner preview
            embedElement.src = url.replace(/#.*/, '');
            embedElement.frameBorder = "0";
            embedElement.allowFullscreen = false;
            embedElement.style.margin = '4px';
        }
        // Generic link (fallback)
        else {
            embedElement = document.createElement('a');
            embedElement.href = url;
            embedElement.target = '_blank';
            embedElement.rel = 'noopener noreferrer';
            embedElement.style.display = 'flex';
            embedElement.style.alignItems = 'center';
            embedElement.style.gap = '10px';
            embedElement.style.margin = '6px 0';
            embedElement.style.padding = '8px 12px';
            embedElement.style.borderRadius = '10px';
            embedElement.style.background = 'rgba(76,195,247,0.08)';
            embedElement.style.boxShadow = '0 2px 8px #0001';
            embedElement.style.fontSize = '13px';
            embedElement.style.color = '#4FC3F7';
            embedElement.style.textDecoration = 'none';
            embedElement.style.maxWidth = '350px';
            embedElement.style.overflow = 'hidden';

            // Try to add a thumbnail for news/articles
            let thumbUrl = '';
            // Common news/article domains
            if (/nytimes\.com|cnn\.com|bbc\.co\.uk|bbc\.com|washingtonpost\.com|theguardian\.com|reuters\.com|bloomberg\.com|npr\.org|forbes\.com|wsj\.com|apnews\.com|aljazeera\.com|cnbc\.com|foxnews\.com|abcnews\.go\.com|news\.yahoo\.com|usatoday\.com|nbcnews\.com|politico\.com|vox\.com|axios\.com|theverge\.com|techcrunch\.com|wired\.com|engadget\.com|arstechnica\.com|nature\.com|sciencemag\.org|scientificamerican\.com/i.test(url)) {
                // Use favicon as a fallback thumbnail
                try {
                    const domain = url.match(/^https?:\/\/([^\/?#]+)/i)[1];
                    thumbUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                } catch {}
            }
            // Wikipedia: use logo
            if (/wikipedia\.org/i.test(url)) {
                thumbUrl = 'https://en.wikipedia.org/static/favicon/wikipedia.ico';
            }
            // Generic fallback: favicon
            if (!thumbUrl) {
                try {
                    const domain = url.match(/^https?:\/\/([^\/?#]+)/i)[1];
                    thumbUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                } catch {}
            }
            if (thumbUrl) {
                const img = document.createElement('img');
                img.src = thumbUrl;
                img.alt = 'Site';
                img.style.width = '28px';
                img.style.height = '28px';
                img.style.borderRadius = '6px';
                img.style.objectFit = 'cover';
                img.style.flexShrink = '0';
                embedElement.appendChild(img);
            }

            // Show domain and a "News" badge if likely a news site
            const domain = url.replace(/^https?:\/\//, '').split(/[/?#]/)[0];
            const textDiv = document.createElement('div');
            textDiv.style.display = 'flex';
            textDiv.style.flexDirection = 'column';
            textDiv.style.overflow = 'hidden';

            const domainSpan = document.createElement('span');
            domainSpan.textContent = domain;
            domainSpan.style.fontWeight = 'bold';
            domainSpan.style.color = '#2196F3';
            domainSpan.style.fontSize = '13px';
            domainSpan.style.overflow = 'hidden';
            domainSpan.style.textOverflow = 'ellipsis';
            domainSpan.style.whiteSpace = 'nowrap';
            textDiv.appendChild(domainSpan);

            // Add "News" badge if domain matches news
            if (/nytimes\.com|cnn\.com|bbc\.co\.uk|bbc\.com|washingtonpost\.com|theguardian\.com|reuters\.com|bloomberg\.com|npr\.org|forbes\.com|wsj\.com|apnews\.com|aljazeera\.com|cnbc\.com|foxnews\.com|abcnews\.go\.com|news\.yahoo\.com|usatoday\.com|nbcnews\.com|politico\.com|vox\.com|axios\.com|theverge\.com|techcrunch\.com|wired\.com|engadget\.com|arstechnica\.com|nature\.com|sciencemag\.org|scientificamerican\.com/i.test(domain)) {
                const badge = document.createElement('span');
                badge.textContent = 'News';
                badge.style.background = '#2196F3';
                badge.style.color = '#fff';
                badge.style.fontSize = '10px';
                badge.style.fontWeight = 'bold';
                badge.style.borderRadius = '6px';
                badge.style.padding = '1px 6px';
                badge.style.marginTop = '2px';
                badge.style.display = 'inline-block';
                textDiv.appendChild(badge);
            }

            embedElement.appendChild(textDiv);
        }
        if (embedElement) {
            embedElement.style.objectFit = 'contain';
            embedElement.style.display = 'block';
            embedElement.style.height = 'auto';
            embedElement.style.minHeight = '50px';
            embedElement.style.maxHeight = '800px';
            // Store the normalized URL for robust deduplication
            embedElement.dataset.normalizedUrl = url;
            let firstChild = mediaEmbedColumnContainer.firstChild;
            if (firstChild) mediaEmbedColumnContainer.insertBefore(embedElement, firstChild);
            else mediaEmbedColumnContainer.appendChild(embedElement);
        }
    });
    if (mediaEmbedColumnContainer) {
        mediaEmbedColumnContainer.scrollTop = mediaEmbedColumnContainer.scrollHeight;
    }
}

/**
 * Aggregate sentiment predictions from a message and update the sentiment summary.
 */
function scrollOverlayToBottom() {
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

/**
 * Aggregate sentiment predictions from a message and update the sentiment summary.
 */
function addMessageToOverlay(message) {
    const messageElement = renderMessageElement(message);
    if (!chatPaused) messagesContainer.appendChild(messageElement);
    if (!chatPaused) scrollOverlayToBottom();
    if (!chatPaused) updateBarChart();
    if (!chatPaused) updatePieChartForWindow();
    if (!chatPaused) updateTimelineLabels();
}

/**
 * Aggregate sentiment predictions from a message and update the sentiment summary.
 */
function renderMessageElement(message) {
    // Use the color provided in the message object, or fallback to a default
    let userColor = message.tags.color || '#4FC3F7';

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
    messageElement.style.padding = '4px 8px';
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

    // --- Sentiment stacking order: compute for the whole window ---
    // Aggregate all sentiments in the window
    const windowSentimentCounts = {};
    bucketMessages.forEach(msgs => {
        msgs.forEach(msg => {
            if (Array.isArray(msg.predictions)) {
                msg.predictions.forEach(pred => {
                    if (!toggledSentiments.has(pred.sentiment)) {
                        windowSentimentCounts[pred.sentiment] = (windowSentimentCounts[pred.sentiment] || 0) + 1;
                    }
                });
            }
        });
    });
    // Sort by count descending, most common first
    const stackingOrder = Object.entries(windowSentimentCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([sentiment]) => sentiment);

    // 4. Draw bars, scaling to the window max, but clamp to container height
    yAxisContainer.innerHTML = '';
    yAxisLabelsContainer.innerHTML = '';
    const yTicks = 3;
    const tickInterval = niceTickInterval(windowMax, yTicks);
    const topTick = tickInterval * (yTicks - 1);

    // Calculate spacing for more vertical spread
    const totalHeight = parseInt(barChartContainer.style.height, 10) || 60;
    const extraSpacing = 10; // px of extra space between ticks

    for (let i = 0; i < yTicks; i++) {
        const tick = document.createElement('div');
        tick.style.flex = '1 1 0';
        tick.style.display = 'flex';
        tick.style.fontSize = '14px';
        tick.style.alignItems = 'flex-end';
        const value = topTick - i * tickInterval;
        // Vertically align ticks: top tick at top, bottom tick at bottom, others spaced evenly
        tick.style.position = 'relative';
        if (i == 0) {
            tick.style.top = '0';
            tick.style.position = 'absolute';
        } else if (i == yTicks - 1) {
            tick.style.bottom = '0';
            tick.style.position = 'absolute';
        } else {
            tick.style.marginTop = 'auto';
            tick.style.marginBottom = 'auto';
            tick.style.position = 'absolute';
        }
        let formattedValue;
        if (value >= 1_000_000) {
            formattedValue = (value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1) + 'M';
        } else if (value >= 1_000) {
            formattedValue = (value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1) + 'k';
        } else {
            formattedValue = value;
        }

        tick.textContent = formattedValue;
        yAxisLabelsContainer.appendChild(tick);
    }
    yAxisContainer.appendChild(yAxisLabelsContainer);
    yAxisContainer.appendChild(yAxisLineContainer);
    barChartContainer.innerHTML = '';
    barChartContainer.appendChild(barChartGridLines);
    barChartEmojiRow.innerHTML = '';
    // Reset static variables for lock/unlock emoji
    updateBarChart.firstLockShown = false;
    updateBarChart.firstUnlockShown = false;

    // --- Find the true max for proportional bar height, but clamp to windowMax ---
    // (windowMax is already the max in the visible window)
    const trueMax = windowMax;

    for (let i = 0; i < bucketCount; i++) {
        // --- Bar ---
        const bar = document.createElement('div');
        bar.style.width = `${100 / bucketCount}%`;
        bar.style.display = 'inline-block';
        bar.style.verticalAlign = 'bottom';
        bar.style.margin = '0 0.5px';
        // Clamp bar height to 100% of container
        const barHeightPercent = Math.min((windowBuckets[i] / trueMax) * 100, 100);
        bar.style.height = `${barHeightPercent}%`;
        bar.style.maxHeight = '100%';
        bar.style.position = 'relative';
        bar.style.background = 'transparent';
        bar.title = `${windowBuckets[i]} Chats`;
        // Sentiment stacking logic (use stackingOrder for segment order)
        const sentimentCounts = {};
        let total = 0;
        bucketMessages[i].forEach(msg => {
            if (Array.isArray(msg.predictions)) {
                msg.predictions.forEach(pred => {
                    if (!toggledSentiments.has(pred.sentiment)) {
                        sentimentCounts[pred.sentiment] = (sentimentCounts[pred.sentiment] || 0) + 1;
                        total++;
                    }
                });
            }
        });

        // If no sentiment data, fallback to default color
        if (total === 0) {
            bar.style.background = windowBuckets[i] > 0 ? '#4FC3F7' : '#263238';
        } else {
            // Create stacked segments in window stacking order (most common on bottom)
            let offset = 0;
            // Use the sum of all sentiment counts for this bucket as the denominator
            const totalSentiment = Object.values(sentimentCounts).reduce((a, b) => a + b, 0) || 1;
            stackingOrder.forEach(sentiment => {
                const count = sentimentCounts[sentiment] || 0;
                if (count > 0) {
                    const seg = document.createElement('div');
                    seg.style.position = 'absolute';
                    seg.style.left = '0';
                    seg.style.right = '0';
                    seg.style.bottom = `${offset}%`;
                    seg.style.height = `${(count / totalSentiment) * 100}%`;
                    seg.style.background = sentimentColorPalette[sentiment] || sentimentColorPalette.default;
                    seg.style.borderTop = '1px solid #2222';
                    seg.style.borderRadius = '2px';
                    bar.appendChild(seg);
                    offset += (count / totalSentiment) * 100;
                }
            });
        }

        // Apply hover effect to the entire bar stack only
        bar.addEventListener('mouseenter', () => {
            bar.style.boxShadow = '0 0 8px #039BE5';
        });
        bar.addEventListener('mouseleave', () => {
            bar.style.boxShadow = '';
        });

        barChartContainer.appendChild(bar);

        // --- Emoji Row ---
        const emojiSpan = document.createElement('span');
        emojiSpan.style.display = 'inline-block';
        emojiSpan.style.width = `${100 / bucketCount}%`;
        emojiSpan.style.textAlign = 'center';
        emojiSpan.style.fontSize = '14px';
        emojiSpan.style.userSelect = 'none';

        // Sub Only Mode Toggle Emoji (show only the first lock and first unlock)
        if (bucketMessages[i].length > 0) {
            // Find first message where subOnlyMode === true (lock) and first where === false (unlock)
            const firstLockMsg = bucketMessages[i].find(msg => msg.subOnlyMode === true);
            const firstUnlockMsg = bucketMessages[i].find(msg => msg.subOnlyMode === false);

            // Only show the first lock or unlock in the entire chart (not per bucket)
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
            // For each message, treat predictions as ranked choices (ranked by score)
            bucketMessages[i].forEach(msg => {
                if (Array.isArray(msg.predictions)) {
                    const preds = [...msg.predictions].sort((a, b) => b.score - a.score);
                    preds.forEach((pred, idx) => {
                        const sentiment = pred.sentiment;
                        const points = 3 - idx; // 3, 2, 1
                        if (points > 0) {
                            sentimentScores[sentiment] = (sentimentScores[sentiment] || 0) + points * pred.score;
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
                maintainAspectRatio: true,
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
                            console.log('Legend item clicked', legendItem);
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
                                console.log('double click', legendItem);
                                // If only this sentiment is visible (all others hidden), restore all
                                const totalSentiments = chart.data.labels.length;
                                const onlyThisVisible = (
                                    toggledSentiments.size === totalSentiments - 1 &&
                                    !toggledSentiments.has(sentiment)
                                );
                                const onlyThisHidden = (
                                    toggledSentiments.size === totalSentiments - 1 &&
                                    toggledSentiments.has(sentiment)
                                );
                                if (onlyThisVisible || onlyThisHidden) {
                                    toggledSentiments.clear();
                                } else {
                                    console.log('hide all');
                                    // Hide all except this sentiment
                                    toggledSentiments.clear();
                                    chart.data.labels.forEach(l => {
                                        const s = l.replace(/^[^\w]+/, '') // Remove leading emoji and spaces
                                            .replace(/\s*\(\d+\)$/, '') // Remove trailing (count)
                                            .trim()
                                            .toLowerCase();
                                        if (s !== sentiment) toggledSentiments.add(s);
                                    });
                                }
                            } else {
                                console.log('single click', legendItem);
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
    if (!chatPaused) updateEmbedsForWindow()
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
            if (pred.score * 100 >= 10) sentimentCounts[pred.sentiment] = (sentimentCounts[pred.sentiment] || 0) + 1;
        });
        // Update UI
        updatePieChartForWindow();        // Sort and update ranking
        const sorted = Object.entries(sentimentCounts)
            .map(([sentiment, count]) => ({ sentiment, count }))
            .sort((a, b) => b.count - a.count);
        //updateRankingList(sorted);
    }
}

const MAX_CHAT_MESSAGES = 10000; // or a lower value if needed
let windowUniqueChatters = new Set(); // Track unique chatters in the current window

/**
 * Buffers a chat message for processing.
 * @param {*} message 
 */
function bufferMessage(message) {
    chatBuffer.push({ ...message, ts: Date.now() });
    // Remove old messages by time
    const cutoff = Date.now() - MAX_BUFFER_SECONDS * 1000;
    while (chatBuffer.length && chatBuffer[0].ts < cutoff) {
        chatBuffer.shift();
    }
    // Remove old messages by count
    while (chatBuffer.length > MAX_CHAT_MESSAGES) {
        chatBuffer.shift();
    }
}

/**
 * Updates the unique chatters set for the current window.
 * Call this after updating windowMessages.
 */
function updateWindowUniqueChatters() {
    windowUniqueChatters = new Set();
    windowMessages.forEach(msg => {
        if (msg.user) windowUniqueChatters.add(msg.user);
    });
}

// Call updateWindowUniqueChatters() whenever windowMessages is updated
// For example, in updatePieChartForWindow and timeSlider/input event:
const origUpdatePieChartForWindow = updatePieChartForWindow;
updatePieChartForWindow = function() {
    origUpdatePieChartForWindow.apply(this, arguments);
    updateWindowUniqueChatters();
};

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

/**
 * Call this function whenever you receive a new viewership count.
 * @param {number} count - The current viewership count.
 * @param {number} [ts] - Optional timestamp (ms). Defaults to now.
 * @param {Error} [err] - Optional error parameter.
 */
function addViewershipPoint(count, ts, err) {
    if (err) {
        // Gracefully handle error and move on
        console.warn('Viewership fetch error:', err);
        return;
    }
    if (typeof count !== 'number' || isNaN(count)) {
        // Invalid count, skip this point
        return;
    }
    viewershipBuffer.push({ count, ts: ts !== undefined ? ts : Date.now() });
    while (viewershipBuffer.length > MAX_VIEWERSHIP_POINTS) {
        viewershipBuffer.shift();
    }
    drawViewershipLinePlot();
}

/**
 * Draws the viewership line plot on the canvas.
 * Also overlays a second line plot: % of unique chatters among viewers.
 * The right side of the plot shows min/max for the overlay line.
 */
function drawViewershipLinePlot() {
    // Use a slightly smaller drawing area to avoid overflow
    const ctx = viewershipCanvas.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, viewershipCanvas.width, viewershipCanvas.height);

    // Use only padding, no translate
    const leftPad = 8, rightPad = 8, topPad = 8, bottomPad = 16;
    const w = viewershipCanvas.width - leftPad - rightPad;
    const h = viewershipCanvas.height - topPad - bottomPad;

    if (viewershipBuffer.length < 1) return;

    // Determine the time window to plot (match selectedTimeFrame)
    const now = Date.now();
    const windowStart = now - selectedTimeFrame * 1000;
    const points = viewershipBuffer.filter(p => p.ts >= windowStart);

    // Compute percent points for each viewership point
    const CHATTER_WINDOW_MS = 60 * 1000; // 60s window for unique chatters per point
    const percentPoints = points.map(p => {
        const chatStart = p.ts - CHATTER_WINDOW_MS;
        const chatEnd = p.ts;
        const chatters = new Set(
            chatBuffer.filter(msg => msg.ts >= chatStart && msg.ts <= chatEnd && msg.user)
                    .map(msg => msg.user)
        );
        const uniqueChatters = chatters.size;
        const percent = (p.count > 0) ? (uniqueChatters / p.count) * 100 : 0;
        return { ts: p.ts, percent, count: p.count };
    });

    if (points.length === 1) {
        // Draw a single point in the center of the plot area
        const p = points[0];
        const x = leftPad + w / 2;
        const y = topPad + h / 2;
        ctx.fillStyle = '#2196F3';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${p.count} viewers`, x - 16, y + 16);

        // Draw unique chatters percentage if possible
        if (p.count > 0 && windowUniqueChatters && windowUniqueChatters.size > 0) {
            const percent = Math.round((windowUniqueChatters.size / p.count) * 100);
            ctx.fillStyle = '#43A047';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(`${percent}% chatting`, x - 16, y + 22);
        }

        ctx.restore();
        return;
    }

    // Find min/max for scaling (viewership)
    let min = Math.min(...points.map(p => p.count));
    let max = Math.max(...points.map(p => p.count));
    if (min === max) { min -= 1; max += 1; }

    // "Nice" min/max scaling: only round up if needed, keep tight bounds
    function niceNum(x, roundUp = false) {
        if (x === 0) return 0;
        const exp = Math.floor(Math.log10(Math.abs(x)));
        const f = x / Math.pow(10, exp);
        let nf;
        if (roundUp) {
            if (f <= 1) nf = 1;
            else if (f <= 2) nf = 2;
            else if (f <= 5) nf = 5;
            else nf = 10;
        } else {
            if (f < 1) nf = 0;
            else if (f < 2) nf = 1;
            else if (f < 5) nf = 2;
            else nf = 5;
        }
        return nf * Math.pow(10, exp);
    }

    // Only round up max if the range is too tight (less than 10% headroom)
    let range = max - min;
    let pad = Math.max(1, Math.round(range * 0.1));
    min = Math.floor(min - pad);
    max = Math.ceil(max + pad);

    // If the range is still too small, expand further
    if (max - min < 5) {
        min = Math.floor(min - 2);
        max = Math.ceil(max + 2);
    }
    if (min < 0) min = 0;

    // Draw viewership line
    ctx.beginPath();
    points.forEach((p, i) => {
        // Use both left and right padding of 100px
        const x = leftPad + 100 + ((p.ts - windowStart) / (selectedTimeFrame * 1000)) * (w - 200);
        const y = topPad + h - ((p.count - min) / (max - min)) * h;
        if (x < 100) return; // Skip points that are off the left edge
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#2196F3';
    ctx.shadowBlur = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw percent line
    // Calculate min/max percent for scaling, but ensure at least a small range (e.g., 0.5%) for visibility
    let percentMin = 0, percentMax = 100;
    if (percentPoints.length > 0) {
        percentMin = Math.min(...percentPoints.map(p => p.percent));
        percentMax = Math.max(...percentPoints.map(p => p.percent));
        // If min and max are the same, expand the range a bit for visibility
        if (percentMin === percentMax) {
            percentMin = Math.max(0, percentMin - 1);
            percentMax = Math.min(100, percentMax + 1);
        }
        // If the range is too small, expand it to at least 5% or 10% for clarity
        if (percentMax - percentMin < 5) {
            const mid = (percentMax + percentMin) / 2;
            percentMin = Math.max(0, mid - 2.5);
            percentMax = Math.min(100, mid + 2.5);
        }
        // Limit to two decimal places
        percentMin = Math.floor(percentMin * 100) / 100;
        percentMax = Math.ceil(percentMax * 100) / 100;
    }

    ctx.beginPath();
    percentPoints.forEach((p, i) => {
        const x = leftPad + 100 + ((p.ts - windowStart) / (selectedTimeFrame * 1000)) * (w - 200);
        // Clamp percent to min/max for safety
        const percent = Math.max(percentMin, Math.min(percentMax, p.percent));
        const y = topPad + h - ((percent - percentMin) / (percentMax - percentMin)) * h;
        if (x < 100) return; // Skip points that are off the left edge
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#43A047';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 2]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw min/max labels for viewership
    ctx.fillStyle = '#2196F3';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(max, leftPad + 40, topPad - 2);
    ctx.textBaseline = 'bottom';
    ctx.fillText(min, leftPad + 40, topPad + h);

    // Draw min/max labels for percent (right side)
    ctx.fillStyle = '#43A047';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(percentMax + '%', viewershipCanvas.width - rightPad - 40, topPad - 2);
    ctx.textBaseline = 'bottom';
    ctx.fillText(percentMin + '%', viewershipCanvas.width - rightPad - 40, topPad + h);

    // Draw latest value at the end
    const last = points[points.length - 1];
    const lastPercent = percentPoints[percentPoints.length - 1];
    if (last) {
        let x = leftPad + 100 + ((last.ts - windowStart) / (selectedTimeFrame * 1000)) * w - 200;
        const y = topPad + h - ((last.count - min) / (max - min)) * h;
        ctx.fillStyle = '#2196F3';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'left';

        // Calculate label widths
        const viewerLabel = `${last.count} viewers`;
        const percentLabel = lastPercent && lastPercent.count > 0 ? `${Math.round(lastPercent.percent)}% chatting` : '';
        const viewerLabelWidth = ctx.measureText(viewerLabel).width;
        const percentLabelWidth = ctx.measureText(percentLabel).width;
        const maxLabelWidth = Math.max(viewerLabelWidth, percentLabelWidth);

        // Prevent label overflow on the right edge
        const labelPadding = 8 + maxLabelWidth + 8;
        if (x + labelPadding > viewershipCanvas.width) {
            x = viewershipCanvas.width - labelPadding;
        }

        // Decide label positions to avoid overlap
        let viewerLabelY, percentLabelY;
        let yPercent = y;
        if (lastPercent && lastPercent.count > 0) {
            const percentFloat = lastPercent.percent;
            yPercent = topPad + h - ((percentFloat - percentMin) / (percentMax - percentMin)) * h;
        }

        // If the two points are close, stack labels to avoid overlap
        const minLabelGap = 18; // px
        if (lastPercent && lastPercent.count > 0 && Math.abs(y - yPercent) < minLabelGap) {
            // Stack: viewers above, percent below
            viewerLabelY = y - 10;
            percentLabelY = y + 10;
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = '#2196F3';
            ctx.fillText(viewerLabel, x - 24, viewerLabelY);
            ctx.fillStyle = '#43A047';
            ctx.textBaseline = 'top';
            ctx.fillText(percentLabel, x - 24, percentLabelY);
            // Draw percent dot
            ctx.beginPath();
            ctx.arc(x, yPercent, 3, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            // Place each label near its point, above unless near min, below if near max
            // Viewers label
            let viewerLabelBaseline, viewerLabelOffset;
            const threshold = Math.max(2, (max - min) * 0.1);
            if (Math.abs(last.count - max) < threshold) {
                viewerLabelBaseline = 'top';
                viewerLabelOffset = y + 8;
            } else if (Math.abs(last.count - min) < threshold) {
                viewerLabelBaseline = 'bottom';
                viewerLabelOffset = y - 8;
            } else {
                viewerLabelBaseline = 'bottom';
                viewerLabelOffset = y - 8;
            }
            ctx.textBaseline = viewerLabelBaseline;
            ctx.fillStyle = '#2196F3';
            ctx.fillText(viewerLabel, x - 24, viewerLabelOffset);

            // Percent label
            if (lastPercent && lastPercent.count > 0) {
                ctx.fillStyle = '#43A047';
                // Draw percent dot
                ctx.beginPath();
                ctx.arc(x, yPercent, 3, 0, 2 * Math.PI);
                ctx.fill();
                // Place label above or below depending on space
                let percentLabelBaseline, percentLabelOffset;
                if (Math.abs(lastPercent.percent - percentMax) < 5) {
                    percentLabelBaseline = 'top';
                    percentLabelOffset = yPercent + 8;
                } else if (Math.abs(lastPercent.percent - percentMin) < 5) {
                    percentLabelBaseline = 'bottom';
                    percentLabelOffset = yPercent - 8;
                } else {
                    // If far from edges, prefer above unless would overlap with viewers label
                    if (Math.abs(yPercent - y) < minLabelGap) {
                        percentLabelBaseline = (yPercent > y) ? 'top' : 'bottom';
                        percentLabelOffset = (yPercent > y) ? yPercent + 8 : yPercent - 8;
                    } else {
                        percentLabelBaseline = 'bottom';
                        percentLabelOffset = yPercent - 8;
                    }
                }
                ctx.textBaseline = percentLabelBaseline;
                ctx.fillText(percentLabel, x - 24, percentLabelOffset);
            }
        }
    }
    ctx.restore();
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