// Рендеринг плиток Дашборда
function renderDashboardGrid(dashboardData = null) {
    globalQuickActionsContainer.innerHTML = '';
    dashboardTilesContainer.innerHTML = '';
    
    // Use provided data or fall back to static data from data.js
    const data = dashboardData || window.dashboardData;
    
    if (!data || !data.tiles) {
        console.error('No dashboard data available');
        return;
    }
    
    // Определяем ориентацию экрана и разрешение
    const isLandscape = window.innerWidth > window.innerHeight;
    const isTabletLandscape = isLandscape && window.innerHeight <= 720;
    const isVeryLowScreen = isLandscape && window.innerHeight <= 600; // Для экстремально низких экранов
    
    // Устанавливаем CSS Grid классы в зависимости от ориентации
    let containerClasses = 'grid gap-6 mb-6';
    let tilesClasses = 'glass-tile rounded-2xl p-6 flex flex-col justify-between aspect-square cursor-pointer';
    let quickActionsClasses = 'flex flex-wrap gap-3';
    
    if (isLandscape) {
        // Альбомная ориентация: 3x2 (3 колонки, 2 ряда)
        containerClasses += ' grid-cols-3 grid-rows-2 max-w-5xl mx-auto';
        quickActionsClasses += ' max-w-5xl mx-auto';
    } else {
        // Портретная ориентация: 2x3 (2 колонки, 3 ряда)
        containerClasses += ' grid-cols-2 grid-rows-3 max-w-2xl mx-auto';
        quickActionsClasses += ' max-w-2xl mx-auto';
    }
    
    // Добавляем компактные стили для планшетов в альбомной ориентации
    if (isVeryLowScreen) {
        // Экстремально компактные стили для очень низких экранов (600px и меньше)
        containerClasses += ' dashboard-tiles-compact';
        tilesClasses += ' dashboard-tile-compact';
        quickActionsClasses += ' quick-actions-compact';
        
        // Применяем компактную высоту к контейнеру дашборда
        const dashboardContainer = dashboardTilesContainer.parentElement.parentElement;
        if (dashboardContainer) {
            dashboardContainer.classList.add('dashboard-compact');
        }
    } else if (isTabletLandscape) {
        // Обычные компактные стили для планшетов (до 720px)
        containerClasses += ' dashboard-tiles-compact';
        tilesClasses += ' dashboard-tile-compact';
        quickActionsClasses += ' quick-actions-compact';
        
        // Применяем компактную высоту к контейнеру дашборда
        const dashboardContainer = dashboardTilesContainer.parentElement.parentElement;
        if (dashboardContainer) {
            dashboardContainer.classList.add('dashboard-compact');
        }
    } else {
        // Убираем компактные классы если они были применены ранее
        const dashboardContainer = dashboardTilesContainer.parentElement.parentElement;
        if (dashboardContainer) {
            dashboardContainer.classList.remove('dashboard-compact');
        }
    }
    
    dashboardTilesContainer.className = containerClasses;
    globalQuickActionsContainer.className = quickActionsClasses;
    
    if (data.quick_actions) {
        data.quick_actions.forEach(action => {
            const button = document.createElement('button');
            let buttonClasses = ['glass-button', 'px-6', 'py-3', 'rounded-lg', 'text-white', 'flex', 'items-center', 'gap-3', 'text-lg', 'font-medium']; // Large button стили
            
            // Добавляем компактный класс для планшетов
            if (isVeryLowScreen) {
                // Экстремально компактные кнопки для очень низких экранов
                buttonClasses.push('quick-action-btn-compact');
            } else if (isTabletLandscape) {
                // Обычные компактные кнопки для планшетов
                buttonClasses.push('quick-action-btn-compact');
            }
            
            if (action.style === 'primary') buttonClasses.push('btn-primary');
            else if (action.style === 'secondary') buttonClasses.push('btn-secondary');
            button.className = buttonClasses.join(' ');
            button.innerHTML = `<i data-lucide="${action.icon}" class="w-6 h-6"></i><span>${action.text}</span>`; // Крупные иконки
            button.onclick = () => alert(`Запрос: "${action.assistant_request}"`);
            globalQuickActionsContainer.appendChild(button);
        });
    }

    data.tiles.forEach(tile => {
        const tileElement = document.createElement('div');
        tileElement.className = tilesClasses;
        tileElement.onclick = () => window.location.href = `/${tile.category}/`;
        const statusIconColorClass = getTailwindColorClass(tile.status_color);

        let devicesHtml = '';
        if (tile.devices && tile.devices.length > 0) {
            devicesHtml = `<div class="mt-4 flex flex-wrap gap-3">
                ${tile.devices.map(device => {
                    const deviceIconColorClass = getTailwindColorClass(device.color);
                    const deviceBgColorClass = device.variant === 'solid' ? getTailwindBgColorClass(device.color) : '';
                    return `
                        <div class="relative device-wrapper">
                            <div class="device-icon ${device.variant === 'solid' ? 'variant-solid ' + deviceBgColorClass : 'variant-outline'}">
                                <i data-lucide="${device.icon}" class="w-5 h-5 ${deviceIconColorClass}"></i>
                            </div>
                            <span class="device-tooltip text-xs">${device.tooltip}</span>
                        </div>
                    `;
                }).join('')}
            </div>`;
        }

        let quickActionsHtml = '';
        if (tile.quick_actions && tile.quick_actions.length > 0) {
            quickActionsHtml = `<div class="mt-6 grid grid-cols-2 gap-2">
                ${tile.quick_actions.map(action => `
                    <button class="glass-button text-xs px-3 py-1.5 rounded-lg text-white">${action}</button>
                `).join('')}
            </div>`;
        }

        tileElement.innerHTML = `
            <div>
                <div class="flex justify-between items-start">
                    <h2 class="text-xl font-semibold text-white">${tile.title}</h2>
                    <i data-lucide="${tile.icon}" class="w-6 h-6 ${statusIconColorClass}"></i>
                </div>
                <p class="text-sm text-gray-300 mt-1">${tile.subtitle}</p>
                ${devicesHtml}
            </div>
            ${quickActionsHtml}
        `;
        dashboardTilesContainer.appendChild(tileElement);
    });
}
