// This file handles the logic for the popup UI, including event listeners for user interactions and communication with the content script.

document.addEventListener('DOMContentLoaded', () => {
    const statusDisplay = document.getElementById('status');

    // Load user preferences from LocalStorage
    chrome.storage.local.get(['filterSettings', 'highlightSettings'], (data) => {
        // Initialize UI with user preferences
        // Example: document.getElementById('filterToggle').checked = data.filterSettings.enabled;
    });
});