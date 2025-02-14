// get tradingview parameters from strategy window for plus users
getTvParameters();

async function getTvParameters() {
    console.log('Getting TV parameters...');
    
    try {
        var tvParameters = [];

        // Находим диалог настроек
        const dialog = document.querySelector("div[data-name='indicator-properties-dialog']");
        if (!dialog) {
            console.error('Strategy settings dialog not found');
            return;
        }

        // Находим все строки с параметрами
        const rows = dialog.querySelectorAll('.inlineRow-D8g11qqA');
        console.log('Found parameter rows:', rows?.length);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            
            // Получаем имя параметра
            const labelCell = row.querySelector('.cell-tBgV1m0B.first-tBgV1m0B .inner-tBgV1m0B');
            if (!labelCell) {
                console.log(`Skipping row ${i} - no label cell found`);
                continue;
            }

            const parameterName = labelCell.textContent.trim();
            console.log(`Processing parameter: ${parameterName}`);

            // Проверяем тип параметра
            const selectableParameter = row.querySelector("span[data-role='listbox']");
            const numericInput = row.querySelector("input[inputmode='numeric']");
            const checkboxInput = row.querySelector("input[type='checkbox']");

            if (selectableParameter) {
                console.log(`Parameter ${parameterName} is Selectable`);
                
                // Инжектируем скрипт для получения опций
                var s = document.createElement('script');
                s.src = chrome.runtime.getURL('plus/get-selectable-parameter-options.js');
                s.id = "get-selectable-parameter-key";
                s.setAttribute("parameter-index", i);
                s.onload = function() {
                    this.remove();
                };
                (document.head || document.documentElement).appendChild(s);

                // Ждем ответа от инжектированного скрипта
                const options = await new Promise((resolve) => {
                    const listener = (event) => {
                        if (event.data.type === "GetSelectableParameterOptionsEvent") {
                            window.removeEventListener("message", listener);
                            resolve(event.data.options);
                        }
                    };
                    window.addEventListener("message", listener);
                    // Таймаут на случай, если ответ не придет
                    setTimeout(() => resolve([]), 1000);
                });

                tvParameters.push({
                    type: "Selectable",
                    name: parameterName,
                    options: options
                });
            } 
            else if (numericInput) {
                console.log(`Parameter ${parameterName} is Numeric`);
                tvParameters.push({
                    type: "Numeric",
                    name: parameterName,
                    current: numericInput.value,
                    min: numericInput.min,
                    max: numericInput.max,
                    step: numericInput.step
                });
            }
            else if (checkboxInput) {
                console.log(`Parameter ${parameterName} is Boolean`);
                tvParameters.push({
                    type: "Boolean",
                    name: parameterName,
                    current: checkboxInput.checked
                });
            }
            else {
                console.log(`Parameter ${parameterName} type not recognized`);
            }
        }

        console.log('Final TV parameters:', tvParameters);

        // Отправляем результаты
        chrome.runtime.sendMessage({
            popupAction: {
                event: "getTvParameters",
                message: {
                    tvParameters: tvParameters
                }
            }
        });

    } catch (error) {
        console.error('Error in getTvParameters:', error);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}