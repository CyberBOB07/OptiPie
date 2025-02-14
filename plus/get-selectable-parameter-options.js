try {
    console.log('Getting selectable parameter options...');
    
    var parameterIndex = document.querySelector("#get-selectable-parameter-key").getAttribute("parameter-index");
    console.log('Parameter index:', parameterIndex);

    // Находим диалог настроек
    const dialog = document.querySelector("div[data-name='indicator-properties-dialog']");
    if (!dialog) {
        console.error('Strategy settings dialog not found');
        return;
    }

    // Находим все строки с параметрами
    const rows = dialog.querySelectorAll('.inlineRow-D8g11qqA');
    if (!rows || rows.length === 0) {
        console.error('Parameter rows not found');
        return;
    }

    // Получаем нужную строку по индексу
    const row = rows[parameterIndex];
    if (!row) {
        console.error('Row not found for index:', parameterIndex);
        return;
    }

    // Ищем селект в строке
    const selectableParameter = row.querySelector("span[data-role='listbox']");
    if (!selectableParameter) {
        console.error('Listbox not found in row');
        return;
    }

    console.log('Found selectable parameter:', selectableParameter);

    // Получаем reactFiber ключ
    var reactFiberKey = Object.keys(selectableParameter).find(key => key.includes("reactFiber") || key.includes("__reactProps$"));
    if (!reactFiberKey) {
        console.error('React fiber key not found');
        return;
    }

    console.log('Found react fiber key:', reactFiberKey);

    // Пытаемся получить опции разными способами
    var options;
    try {
        // Способ 1: через return.pendingProps
        options = selectableParameter[reactFiberKey].return.pendingProps.items;
    } catch (err1) {
        console.log('Method 1 failed:', err1);
        try {
            // Способ 2: через internal.memoizedProps
            options = selectableParameter[reactFiberKey].internal.memoizedProps.items;
        } catch (err2) {
            console.log('Method 2 failed:', err2);
            try {
                // Способ 3: через return.memoizedProps
                options = selectableParameter[reactFiberKey].return.memoizedProps.items;
            } catch (err3) {
                console.error('All methods to get options failed');
                return;
            }
        }
    }

    console.log('Found options:', options);

    // Отправляем найденные опции
    window.postMessage({ 
        type: "GetSelectableParameterOptionsEvent", 
        options: options 
    }, "*");

} catch (error) {
    console.error('Error in get-selectable-parameter-options:', error);
}
