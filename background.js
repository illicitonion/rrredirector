var pullUrlPattern = /^https:\/\/github.com\/([^\/]*)\/([^\/]*)\/pull\/([0-9]+)/i;
var createPattern = /^https:\/\/github.com\/([^\/]*)\/([^\/]*)\/pull\/create/i;

var disabled;

setDisabled(!!localStorage["disabled"]);

chrome.browserAction.onClicked.addListener(function() {
    setDisabled(!disabled);
});

var createCache = {};

chrome.webRequest.onBeforeRequest.addListener(
    function(req) {
        if (disabled) {
            return {};
        }
        if (req.type !== "main_frame") {
            return {};
        }
        if (req.method === "POST" && createPattern.test(req.url)) {
            createCache[req.tabId] = Date.now()
            return {};
        }
        var match = pullUrlPattern.exec(req.url);
        if (!match) {
            return {};
        }
        var lastCreate = createCache[req.tabId];
        delete createCache[req.tabId];
        if (lastCreate > Date.now() - 10000) {
            return {};
        }
        var redirectUrl = "https://review.rocks/#/repos/" + match[1] + "/" + match[2] + "/" + match[3] + "/history";
        return {redirectUrl: redirectUrl};
    },
    {urls: ["https://github.com/*/pull/*"]},
    ["blocking"]
);

function setDisabled(val) {
    disabled = val;
    localStorage["disabled"] = val;
    chrome.browserAction.setBadgeText({
        text: val ? "OFF" : "ON"
    });
    chrome.browserAction.setBadgeBackgroundColor({
        color: val ? "#F00" : "#0F0"
    });
}
