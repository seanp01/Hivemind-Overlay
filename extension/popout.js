chrome.runtime.sendMessage({ type: 'requestOverlay' }, function(response) {
    if (response && response.overlayHtml) {
        document.body.innerHTML = response.overlayHtml;
    } else {
        document.body.innerHTML = "<div>Failed to load overlay.</div>";
    }
});