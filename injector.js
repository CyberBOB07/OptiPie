console.log('OptiPie injector loaded');

// Инжектируем script.js в DOM
function injectScript() {
    console.log('Injecting script.js...');
    
    // Проверяем, открыто ли окно настроек стратегии
    if (document.querySelectorAll("div[data-name=indicator-properties-dialog]").length < 1) {
        console.log('Strategy settings window not found');
        chrome.runtime.sendMessage({
            type: "Error",
            message: "Please open Strategy Settings on TradingView"
        });
        return false;
    }

    // Инжектируем основной скрипт
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('script.js');
    s.onload = function() {
        console.log('script.js loaded');
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);

    return true;
}

// Слушаем сообщения от script.js
window.addEventListener("message", (event) => {
    // Проверяем источник сообщения
    if (event.source !== window) return;

    console.log('Injector received message:', event.data);

    const message = event.data;
    
    // Обрабатываем различные типы сообщений
    switch (message.type) {
        case "ParametersFound":
            console.log('Parameters found:', message.parameters);
            chrome.runtime.sendMessage({
                type: "StrategyParametersFound",
                parameters: message.parameters
            });
            break;

        case "OptimizationProgress":
            console.log('Optimization progress:', message.progress);
            chrome.runtime.sendMessage({
                type: "OptimizationProgress",
                progress: message.progress
            });
            break;

        case "OptimizationComplete":
            console.log('Optimization complete');
            // Сохраняем отчет
            if (message.report) {
                const reportKey = "report-data-" + message.report.strategyId;
                chrome.storage.local.set({ [reportKey]: message.report }, () => {
                    chrome.runtime.sendMessage({
                        type: "OptimizationComplete",
                        success: true,
                        message: "Optimization completed successfully"
                    });
                });
            } else {
                chrome.runtime.sendMessage({
                    type: "OptimizationComplete",
                    success: false,
                    message: "Optimization completed but no report was generated"
                });
            }
            break;

        case "Error":
            console.error('Error from script:', message.error);
            chrome.runtime.sendMessage({
                type: "Error",
                message: message.error
            });
            break;
    }
});

// Слушаем сообщения от background.js и popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Injector received chrome message:', message);

    // Пересылаем сообщения в script.js
    if (message.type === "GetStrategyParameters" || 
        message.type === "StartOptimization" || 
        message.type === "StopOptimization") {
        window.postMessage(message, "*");
    }
});

// Инжектируем script.js при загрузке
injectScript();