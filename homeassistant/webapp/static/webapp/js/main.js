// --- Функции управления состоянием ---

// Показать "Чат"
function showChatView() {
    chatView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
    leftSidebar.classList.remove('hidden'); // Показываем левый сайдбар в режиме чата
    updateSidebarActiveState('archie');
    
    // Stop dashboard polling when leaving dashboard
    if (typeof stopDashboardPolling === 'function') {
        stopDashboardPolling();
    }
}

// Показать "Дашборд"
function showDashboardView() {
    chatView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    leftSidebar.classList.add('hidden'); // Скрываем левый сайдбар в режиме дашборда
    updateSidebarActiveState('home');
    
    // Start dashboard polling when showing dashboard
    if (typeof startDashboardPolling === 'function') {
        startDashboardPolling(30000); // Poll every 30 seconds
    }
}

// --- Инициализация и обработчики событий ---
document.addEventListener('DOMContentLoaded', () => {
    // 0. Инициализация глобальных переменных
    leftSidebar = document.getElementById('left-sidebar');
    leftSidebarCollapsedIcons = document.getElementById('left-sidebar-collapsed-icons');
    leftSidebarExpandedMenu = document.getElementById('left-sidebar-expanded-menu');
    leftSidebarToggleBtn = document.getElementById('left-sidebar-toggle-btn');
    
    rightSidebar = document.getElementById('right-sidebar');
    rightSidebarCollapsedIcons = document.getElementById('right-sidebar-collapsed-icons');
    rightSidebarExpandedMenu = document.getElementById('right-sidebar-expanded-menu');
    rightSidebarToggleBtn = document.getElementById('right-sidebar-toggle-btn');
    
    mainContentArea = document.getElementById('main-content-area');
    chatView = document.getElementById('chat-view');
    dashboardView = document.getElementById('dashboard-view');
    
    globalQuickActionsContainer = document.getElementById('global-quick-actions');
    dashboardTilesContainer = document.getElementById('dashboard-tiles');

    // 1. Рендеринг всего
    renderLeftSidebar();
    renderRightSidebar();
    renderDashboardGrid();
    
    // 2. Инициализация иконок Lucide
    lucide.createIcons();

    // 3. Установка начального состояния
    showChatView(); // Показываем чат по умолчанию (левый сайдбар будет видим)
    // Устанавливаем иконки для кнопок сворачивания
    leftSidebarToggleBtn.innerHTML = `<i data-lucide="chevron-right" class="w-6 h-6"></i>`;
    rightSidebarToggleBtn.innerHTML = `<i data-lucide="chevron-left" class="w-6 h-6"></i>`;
    lucide.createIcons({ nodes: [leftSidebarToggleBtn, rightSidebarToggleBtn] });
    
    // Устанавливаем начальные отступы для контента
    mainContentArea.style.marginLeft = '0';
    mainContentArea.style.marginRight = '0';
    
    // Экспортируем начальное состояние для React компонента
    window.isLeftSidebarExpanded = isLeftSidebarExpanded;

    // 4. Обработчик клика на кнопку "Свернуть/Развернуть" (ЛЕВАЯ ПАНЕЛЬ)
    leftSidebarToggleBtn.addEventListener('click', () => toggleLeftSidebar());
    
    // 5. Обработчик клика на кнопку "Свернуть/Развернуть" (ПРАВАЯ ПАНЕЛЬ)
    rightSidebarToggleBtn.addEventListener('click', () => toggleRightSidebar());

    // 6. Обработчик кликов на элементы ПРАВОЙ ПАНЕЛИ (делегирование)
    rightSidebar.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return; 

        const category = link.dataset.appCategory;

        if (category === 'archie') {
            e.preventDefault();
            showChatView();
        } else if (category === 'home') {
            e.preventDefault();
            showDashboardView();
            updateSidebarActiveState('home');
        } else {
            // Для остальных категорий (light, weather и т.д.) позволяем переход по href
            // Ссылки уже настроены на /${category}/
        }

        // Сворачиваем, если была развернута
        if (isRightSidebarExpanded) {
            toggleRightSidebar(true); // force collapse
        }
    });
    
    // 7. Обработчики для сворачивания панелей (Escape и Клик)
    
    // Клик на центральный контент
    mainContentArea.addEventListener('click', () => {
        // Сворачиваем левый сайдбар только если он видим (режим чата)
        if (isLeftSidebarExpanded && !leftSidebar.classList.contains('hidden')) {
            toggleLeftSidebar(true); // force collapse
        }
        if (isRightSidebarExpanded) {
            toggleRightSidebar(true); // force collapse
        }
    });

    // Нажатие Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Сворачиваем левый сайдбар только если он видим (режим чата)
            if (isLeftSidebarExpanded && !leftSidebar.classList.contains('hidden')) {
                toggleLeftSidebar(true); // force collapse
            }
            if (isRightSidebarExpanded) {
                toggleRightSidebar(true); // force collapse
            }
        }
    });

    // Обработчик изменения размера окна для адаптивной сетки
    window.addEventListener('resize', () => {
        // Перерендериваем дашборд при изменении ориентации
        if (!dashboardView.classList.contains('hidden')) {
            renderDashboardGrid();
        }
    });
});
