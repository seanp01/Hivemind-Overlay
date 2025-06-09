// This file handles the logic for the popup UI, including event listeners for user interactions and communication with the content script.

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const statusDisplay = document.getElementById('status');

    startButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'startMonitoring' }, (response) => {
            if (response.success) {
                statusDisplay.textContent = 'Monitoring started...';
            } else {
                statusDisplay.textContent = 'Failed to start monitoring.';
            }
        });
    });

    stopButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'stopMonitoring' }, (response) => {
            if (response.success) {
                statusDisplay.textContent = 'Monitoring stopped.';
            } else {
                statusDisplay.textContent = 'Failed to stop monitoring.';
            }
        });
    });

    // Load user preferences from LocalStorage
    chrome.storage.local.get(['filterSettings', 'highlightSettings'], (data) => {
        // Initialize UI with user preferences
        // Example: document.getElementById('filterToggle').checked = data.filterSettings.enabled;
    });
});