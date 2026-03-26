console.log("Bugly content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getMetadata") {
        sendResponse({
            url: window.location.href,
            browser: navigator.userAgent,
            os: navigator.platform,
            screen: `${window.innerWidth}x${window.innerHeight}`
        });
    }
});
