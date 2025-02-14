// Слушаем сообщения от content script и popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);

    // Пересылаем сообщения между popup и content script
    if (message.type === "StrategyParametersFound") {
        chrome.runtime.sendMessage(message);
    }
    else if (message.type === "OptimizationComplete") {
        chrome.runtime.sendMessage(message);
    }
    else if (message.type === "SleepEventStart") {
      const delay = message.delay || 3000;
      setTimeout(() => {
          sendResponse({ type: "SleepEventComplete" });
      }, delay);
      // Return true to indicate that the response will be sent asynchronously
      return true;
  }
    
    return true;
});

// Обработка установки расширения
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details);
    if (details.reason === "update"){
      chrome.tabs.create({url: "https://optipie.app/news/", active: true});
    }
});

// Обработка активации расширения
// chrome.action.onClicked.addListener((tab) => {
//     console.log('Extension clicked on tab:', tab);
// });

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({
    "userParameterCount": 1, "inputStart0": null, "inputEnd0": null, "inputStep0": null,
    "userTimeFrames": null, "selectAutoFill0": null
  }, function () {
    console.log("User parameter count state set to 0 at start up");
  });
})