var pullUrlPattern = /^https:\/\/github.com\/([^\/]*)\/([^\/]*)\/pull\/([0-9]+)/i;

var disabled;

setDisabled(!!localStorage["disabled"]);

chrome.browserAction.onClicked.addListener(function() {
    setDisabled(!disabled);
});

chrome.webRequest.onBeforeRequest.addListener(
    function(req) {
        if (disabled) {
            return {};
        }
        if (req.type !== "main_frame") {
            return {};
        }
        var match = pullUrlPattern.exec(req.url);
        if (!match) {
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
