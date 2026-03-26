chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureScreenshot") {
        // We use activeTab permission to capture the visible tab
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                console.error("Screenshot Error:", chrome.runtime.lastError.message);
                sendResponse({ error: chrome.runtime.lastError.message });
                return;
            }
            sendResponse({ dataUrl });
        });
        return true; // Indicates async response
    }
});
