// Рендеринг ЛЕВОЙ боковой панели ("Арчи")
function renderLeftSidebar() {
    leftSidebarCollapsedIcons.innerHTML = '';
    leftSidebarExpandedMenu.innerHTML = '';

    // Кнопка "Новый чат"
    const newChatCollapsed = document.createElement('a');
    newChatCollapsed.href = "#";
    newChatCollapsed.className = "sidebar-item text-gray-300";
    newChatCollapsed.title = "Новый чат";
    newChatCollapsed.onclick = (e) => {
        e.preventDefault();
        // Простое создание нового чата через API
        fetch('/ai-assistant/api/conversations/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        }).then(response => response.json())
          .then(newChat => {
              console.log('New chat created:', newChat);
              loadChats(); // Перезагрузить список
              if (window.chatAssistantAPI) {
                  window.chatAssistantAPI.selectConversation(newChat.conversation_id);
              }
          }).catch(error => console.error('Error creating chat:', error));
    };
    newChatCollapsed.innerHTML = `<i data-lucide="plus-circle" class="w-6 h-6"></i>`;
    leftSidebarCollapsedIcons.appendChild(newChatCollapsed);

    // Кнопка "Предыдущее сообщение" (только в свернутом виде)
    const prevMessageBtn = document.createElement('button');
    prevMessageBtn.id = 'prev-message-btn';
    prevMessageBtn.className = "sidebar-item text-gray-400";
    prevMessageBtn.title = "Предыдущее сообщение";
    prevMessageBtn.onclick = () => {
        if (window.chatAssistantAPI) {
            window.chatAssistantAPI.navigateMessages('prev');
        }
    };
    prevMessageBtn.innerHTML = `<i data-lucide="chevron-up" class="w-6 h-6"></i>`;
    leftSidebarCollapsedIcons.appendChild(prevMessageBtn);

    // Кнопка "Следующее сообщение" (только в свернутом виде)
    const nextMessageBtn = document.createElement('button');
    nextMessageBtn.id = 'next-message-btn';
    nextMessageBtn.className = "sidebar-item text-gray-400";
    nextMessageBtn.title = "Следующее сообщение";
    nextMessageBtn.onclick = () => {
        if (window.chatAssistantAPI) {
            window.chatAssistantAPI.navigateMessages('next');
        }
    };
    nextMessageBtn.innerHTML = `<i data-lucide="chevron-down" class="w-6 h-6"></i>`;
    leftSidebarCollapsedIcons.appendChild(nextMessageBtn);

    const newChatExpanded = document.createElement('a');
    newChatExpanded.href = "#";
    newChatExpanded.className = "sidebar-item-expanded text-gray-300";
    newChatExpanded.onclick = (e) => {
        e.preventDefault();
        // Простое создание нового чата через API
        fetch('/ai-assistant/api/conversations/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        }).then(response => response.json())
          .then(newChat => {
              console.log('New chat created:', newChat);
              loadChats(); // Перезагрузить список
              if (window.chatAssistantAPI) {
                  window.chatAssistantAPI.selectConversation(newChat.conversation_id);
              }
          }).catch(error => console.error('Error creating chat:', error));
    };
    newChatExpanded.innerHTML = `<i data-lucide="plus-circle" class="w-5 h-5 flex-shrink-0"></i><span class="sidebar-text ml-4 font-medium">Новый чат</span>`;
    leftSidebarExpandedMenu.appendChild(newChatExpanded);

    // Разделитель только в развернутом виде
    leftSidebarExpandedMenu.innerHTML += '<hr class="border-t border-white/10 my-2">';

    // Список чатов (только в развернутом виде)
    const chatsContainerExpanded = document.createElement('div');
    chatsContainerExpanded.id = 'chats-container-expanded';
    chatsContainerExpanded.className = 'flex-1 overflow-y-auto space-y-1';
    chatsContainerExpanded.style.maxHeight = 'calc(100vh - 300px)'; // Ограничиваем высоту
    leftSidebarExpandedMenu.appendChild(chatsContainerExpanded);

    // Разделитель внизу только в развернутом виде
    leftSidebarExpandedMenu.innerHTML += '<hr class="border-t border-white/10 my-2">';

    // Кнопка "Поиск"
    const searchCollapsed = document.createElement('a');
    searchCollapsed.href = "#";
    searchCollapsed.className = "sidebar-item text-gray-300";
    searchCollapsed.title = "Поиск";
    searchCollapsed.innerHTML = `<i data-lucide="search" class="w-6 h-6"></i>`;
    leftSidebarCollapsedIcons.appendChild(searchCollapsed);

    const searchExpanded = document.createElement('a');
    searchExpanded.href = "#";
    searchExpanded.className = "sidebar-item-expanded text-gray-300";
    searchExpanded.innerHTML = `<i data-lucide="search" class="w-5 h-5 flex-shrink-0"></i><span class="sidebar-text ml-4 font-medium">Поиск</span>`;
    leftSidebarExpandedMenu.appendChild(searchExpanded);

    // Кнопка "Настройки"
    const settingsCollapsed = document.createElement('a');
    settingsCollapsed.href = "#";
    settingsCollapsed.className = "sidebar-item text-gray-300";
    settingsCollapsed.title = "Настройки";
    settingsCollapsed.onclick = (e) => {
        e.preventDefault();
        openModelSelectionModal();
    };
    settingsCollapsed.innerHTML = `<i data-lucide="settings" class="w-6 h-6"></i>`;
    leftSidebarCollapsedIcons.appendChild(settingsCollapsed);

    const settingsExpanded = document.createElement('a');
    settingsExpanded.href = "#";
    settingsExpanded.className = "sidebar-item-expanded text-gray-300";
    settingsExpanded.onclick = (e) => {
        e.preventDefault();
        openModelSelectionModal();
    };
    settingsExpanded.innerHTML = `<i data-lucide="settings" class="w-5 h-5 flex-shrink-0"></i><span class="sidebar-text ml-4 font-medium">Настройки</span>`;
    leftSidebarExpandedMenu.appendChild(settingsExpanded);
}

// Простая загрузка чатов
async function loadChats() {
    try {
        const response = await fetch('/ai-assistant/api/conversations/');
        if (response.ok) {
            const conversations = await response.json();
            console.log('Chats loaded:', conversations);
            
            // Сортируем по дате (новые сверху)
            conversations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            renderChatsInSidebar(conversations);
        } else {
            console.error('Failed to load chats:', response.status);
        }
    } catch (error) {
        console.error('Error loading chats:', error);
    }
}

// Простой рендеринг чатов в сайдбаре
function renderChatsInSidebar(conversations) {
    const chatsContainer = document.getElementById('chats-container-expanded');
    if (!chatsContainer) return;

    chatsContainer.innerHTML = '';

    if (!conversations || conversations.length === 0) {
        chatsContainer.innerHTML = '<div class="text-gray-500 text-sm p-3 text-center">Нет чатов</div>';
        return;
    }

    conversations.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'relative group';
        
        const chatLink = document.createElement('a');
        chatLink.href = "#";
        chatLink.className = 'chat-item text-gray-300 pr-8 block cursor-pointer';
        chatLink.onclick = (e) => {
            e.preventDefault();
            if (window.chatAssistantAPI) {
                window.chatAssistantAPI.selectConversation(chat.conversation_id);
            }
        };
        
        // Простое отображение с title и датой
        const title = chat.title && chat.title !== 'New Conversation' 
            ? chat.title 
            : 'Новый чат';
        const displayTitle = title.length > 25 ? title.substring(0, 25) + '...' : title;
        const dateDisplay = formatChatDate(chat.created_at);
        
        chatLink.innerHTML = `
            <div class="flex items-start">
                <i data-lucide="message-circle" class="w-4 h-4 flex-shrink-0 text-gray-400 mt-1"></i>
                <div class="ml-3 flex-1 min-w-0">
                    <div class="font-medium text-sm text-white truncate">${displayTitle}</div>
                    <div class="text-xs text-gray-500 truncate">${dateDisplay}</div>
                </div>
            </div>
        `;
        
        // Кнопка удаления
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300';
        deleteBtn.onclick = async (e) => {
            e.stopPropagation();
            if (confirm(`Удалить чат "${title}"?`)) {
                try {
                    await fetch(`/ai-assistant/api/conversations/${chat.conversation_id}/`, {
                        method: 'DELETE'
                    });
                    loadChats(); // Перезагрузить список
                } catch (error) {
                    console.error('Failed to delete chat:', error);
                }
            }
        };
        deleteBtn.innerHTML = '<i data-lucide="trash-2" class="w-3 h-3"></i>';
        
        chatItem.appendChild(chatLink);
        chatItem.appendChild(deleteBtn);
        chatsContainer.appendChild(chatItem);
    });

    // Обновить иконки
    lucide.createIcons();
}

// Рендеринг ПРАВОЙ боковой панели ("Дом")
function renderRightSidebar() {
    rightSidebarCollapsedIcons.innerHTML = '';
    rightSidebarExpandedMenu.innerHTML = '';

    const homeCollapsed = document.createElement('a');
    homeCollapsed.href = "#";
    homeCollapsed.className = "sidebar-item text-gray-300";
    homeCollapsed.dataset.appCategory = 'home';
    homeCollapsed.title = "Главная";
    homeCollapsed.innerHTML = `<i data-lucide="layout-grid" class="w-6 h-6"></i>`;
    rightSidebarCollapsedIcons.appendChild(homeCollapsed);

    const homeExpanded = document.createElement('a');
    homeExpanded.href = "#";
    homeExpanded.className = "sidebar-item-expanded text-gray-300";
    homeExpanded.dataset.appCategory = 'home';
    homeExpanded.innerHTML = `<i data-lucide="layout-grid" class="w-5 h-5 flex-shrink-0"></i><span class="sidebar-text ml-4 font-medium">Главная</span>`;
    rightSidebarExpandedMenu.appendChild(homeExpanded);

    const archieCollapsed = document.createElement('a');
    archieCollapsed.href = "#";
    archieCollapsed.className = "sidebar-item text-gray-300 active"; // Archie активен по умолч.
    archieCollapsed.dataset.appCategory = 'archie';
    archieCollapsed.title = "Archie Чат";
    archieCollapsed.innerHTML = `<i data-lucide="brain" class="w-6 h-6"></i>`;
    rightSidebarCollapsedIcons.appendChild(archieCollapsed);

    const archieExpanded = document.createElement('a');
    archieExpanded.href = "#";
    archieExpanded.className = "sidebar-item-expanded text-gray-300 active";
    archieExpanded.dataset.appCategory = 'archie';
    archieExpanded.innerHTML = `<i data-lucide="brain" class="w-5 h-5 flex-shrink-0"></i><span class="sidebar-text ml-4 font-medium">Archie Чат</span>`;
    rightSidebarExpandedMenu.appendChild(archieExpanded);

    rightSidebarCollapsedIcons.innerHTML += '<hr class="border-t border-white/10 my-2">';
    rightSidebarExpandedMenu.innerHTML += '<hr class="border-t border-white/10 my-2">';

    dashboardData.smarthome_dashboard.tiles.forEach(tile => {
        const iconColorClass = getTailwindColorClass(tile.status_color);
        
        const collapsedItem = document.createElement('a');
        collapsedItem.href = `/${tile.category}/`;
        collapsedItem.className = `sidebar-item ${iconColorClass}`;
        collapsedItem.dataset.appCategory = tile.category;
        collapsedItem.title = tile.title;
        collapsedItem.innerHTML = `<i data-lucide="${tile.icon}" class="w-6 h-6"></i>`;
        rightSidebarCollapsedIcons.appendChild(collapsedItem);

        const expandedItem = document.createElement('a');
        expandedItem.href = `/${tile.category}/`;
        expandedItem.className = `sidebar-item-expanded text-gray-300`; // Текст всегда светлый
        expandedItem.dataset.appCategory = tile.category;
        expandedItem.innerHTML = `<i data-lucide="${tile.icon}" class="w-5 h-5 flex-shrink-0 ${iconColorClass}"></i><span class="sidebar-text ml-4 font-medium">${tile.title}</span>`;
        rightSidebarExpandedMenu.appendChild(expandedItem);
    });
}

// Обновить активное состояние кнопок "Archie" / "Home"
function updateSidebarActiveState(activeCategory) {
    document.querySelectorAll('#right-sidebar a').forEach(el => {
        if (el.dataset.appCategory === activeCategory) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

// Обновить состояние кнопок навигации по сообщениям
function updateMessageNavigationButtons(currentIndex, totalMessages) {
    const prevBtn = document.getElementById('prev-message-btn');
    const nextBtn = document.getElementById('next-message-btn');
    
    if (!prevBtn || !nextBtn) return;

    // Кнопки видны только в свернутом состоянии левого сайдбара
    if (isLeftSidebarExpanded) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    }

    // Предыдущее сообщение доступно если индекс > 0
    if (currentIndex <= 0) {
        prevBtn.classList.add('opacity-30', 'cursor-not-allowed');
        prevBtn.classList.remove('text-gray-400');
        prevBtn.classList.add('text-gray-600');
        prevBtn.disabled = true;
    } else {
        prevBtn.classList.remove('opacity-30', 'cursor-not-allowed', 'text-gray-600');
        prevBtn.classList.add('text-gray-400');
        prevBtn.disabled = false;
    }

    // Следующее сообщение доступно если индекс < total - 1
    if (currentIndex >= totalMessages - 1) {
        nextBtn.classList.add('opacity-30', 'cursor-not-allowed');
        nextBtn.classList.remove('text-gray-400');
        nextBtn.classList.add('text-gray-600');
        nextBtn.disabled = true;
    } else {
        nextBtn.classList.remove('opacity-30', 'cursor-not-allowed', 'text-gray-600');
        nextBtn.classList.add('text-gray-400');
        nextBtn.disabled = false;
    }
}

// Свернуть/Развернуть ЛЕВУЮ панель
function toggleLeftSidebar(forceCollapse = false) {
    isLeftSidebarExpanded = !isLeftSidebarExpanded;
    if (forceCollapse) isLeftSidebarExpanded = false;

    // Экспортируем состояние для React компонента
    window.isLeftSidebarExpanded = isLeftSidebarExpanded;

    if (isLeftSidebarExpanded) {
        leftSidebar.classList.remove('w-20');
        leftSidebar.classList.add('w-72');
        mainContentArea.style.marginLeft = '0'; // Убираем margin
        leftSidebarCollapsedIcons.classList.add('hidden');
        leftSidebarExpandedMenu.classList.remove('hidden');
        leftSidebarToggleBtn.innerHTML = `<i data-lucide="chevron-left" class="w-6 h-6"></i>`;
        leftSidebarToggleBtn.title = "Свернуть панель";
        document.querySelectorAll('#left-sidebar .sidebar-text').forEach(el => el.style.opacity = '1');
        
        // Загружаем чаты при раскрытии панели
        loadChats();
    } else {
        leftSidebar.classList.add('w-20');
        leftSidebar.classList.remove('w-72');
        mainContentArea.style.marginLeft = '0'; // Убираем margin
        leftSidebarCollapsedIcons.classList.remove('hidden');
        leftSidebarExpandedMenu.classList.add('hidden');
        leftSidebarToggleBtn.innerHTML = `<i data-lucide="chevron-right" class="w-6 h-6"></i>`;
        leftSidebarToggleBtn.title = "Развернуть панель";
        document.querySelectorAll('#left-sidebar .sidebar-text').forEach(el => el.style.opacity = '0');
    }
    lucide.createIcons({
        nodes: [leftSidebarToggleBtn]
    });
    
    // Обновляем состояние кнопок навигации по сообщениям при переключении
    if (window.chatAssistantAPI && window.chatAssistantAPI.updateNavigationButtons) {
        window.chatAssistantAPI.updateNavigationButtons();
    }
}

// Свернуть/Развернуть ПРАВУЮ панель
function toggleRightSidebar(forceCollapse = false) {
    isRightSidebarExpanded = !isRightSidebarExpanded;
    if (forceCollapse) isRightSidebarExpanded = false;

    if (isRightSidebarExpanded) {
        rightSidebar.classList.remove('w-20');
        rightSidebar.classList.add('w-72');
        mainContentArea.style.marginRight = '0'; // Убираем margin
        rightSidebarCollapsedIcons.classList.add('hidden');
        rightSidebarExpandedMenu.classList.remove('hidden');
        rightSidebarToggleBtn.innerHTML = `<i data-lucide="chevron-right" class="w-6 h-6"></i>`;
        rightSidebarToggleBtn.title = "Свернуть панель";
        document.querySelectorAll('#right-sidebar .sidebar-text').forEach(el => el.style.opacity = '1');
    } else {
        rightSidebar.classList.add('w-20');
        rightSidebar.classList.remove('w-72');
        mainContentArea.style.marginRight = '0'; // Убираем margin
        rightSidebarCollapsedIcons.classList.remove('hidden');
        rightSidebarExpandedMenu.classList.add('hidden');
        rightSidebarToggleBtn.innerHTML = `<i data-lucide="chevron-left" class="w-6 h-6"></i>`;
        rightSidebarToggleBtn.title = "Развернуть панель";
        document.querySelectorAll('#right-sidebar .sidebar-text').forEach(el => el.style.opacity = '0');
    }
    lucide.createIcons({
        nodes: [rightSidebarToggleBtn]
    });
}

// Available AI models configuration
const AI_MODELS = {
    openai: [
        "gpt-4.1",
        "gpt-4.1-mini",
        "gpt-4.1-nano",
        "gpt-5",
        "gpt-5.1",
        "gpt-5-mini",
        "gpt-5-nano",
    ],
    gemini: [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
    ],
};

// Get selected model from localStorage or default
function getSelectedModel() {
    return localStorage.getItem('selectedAIModel') || 'gpt-4.1-mini';
}

// Set selected model in localStorage
function setSelectedModel(model) {
    localStorage.setItem('selectedAIModel', model);
    window.selectedAIModel = model;
}

// Open model selection modal
function openModelSelectionModal() {
    const currentModel = getSelectedModel();
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-white/20';
    modalContent.onclick = (e) => e.stopPropagation();
    
    const title = document.createElement('h2');
    title.className = 'text-xl font-bold text-white mb-4';
    title.textContent = 'Выбор модели AI';
    modalContent.appendChild(title);
    
    const currentModelInfo = document.createElement('div');
    currentModelInfo.className = 'mb-4 p-3 bg-white/10 rounded-lg';
    currentModelInfo.innerHTML = `
        <div class="text-sm text-gray-400 mb-1">Текущая модель:</div>
        <div class="text-white font-medium">${currentModel}</div>
    `;
    modalContent.appendChild(currentModelInfo);
    
    // OpenAI models section
    const openaiSection = document.createElement('div');
    openaiSection.className = 'mb-4';
    
    const openaiTitle = document.createElement('h3');
    openaiTitle.className = 'text-lg font-semibold text-white mb-2';
    openaiTitle.textContent = 'OpenAI';
    openaiSection.appendChild(openaiTitle);
    
    const openaiList = document.createElement('div');
    openaiList.className = 'space-y-2';
    AI_MODELS.openai.forEach(model => {
        const modelItem = createModelItem(model, currentModel, modal);
        openaiList.appendChild(modelItem);
    });
    openaiSection.appendChild(openaiList);
    modalContent.appendChild(openaiSection);
    
    // Gemini models section
    const geminiSection = document.createElement('div');
    geminiSection.className = 'mb-4';
    
    const geminiTitle = document.createElement('h3');
    geminiTitle.className = 'text-lg font-semibold text-white mb-2';
    geminiTitle.textContent = 'Gemini';
    geminiSection.appendChild(geminiTitle);
    
    const geminiList = document.createElement('div');
    geminiList.className = 'space-y-2';
    AI_MODELS.gemini.forEach(model => {
        const modelItem = createModelItem(model, currentModel, modal);
        geminiList.appendChild(modelItem);
    });
    geminiSection.appendChild(geminiList);
    modalContent.appendChild(geminiSection);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors';
    closeBtn.textContent = 'Закрыть';
    closeBtn.onclick = () => document.body.removeChild(modal);
    modalContent.appendChild(closeBtn);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Create model selection item
function createModelItem(model, currentModel, modal) {
    const item = document.createElement('button');
    item.className = `w-full text-left px-4 py-2 rounded-lg transition-colors ${
        model === currentModel 
            ? 'bg-blue-600 text-white' 
            : 'bg-white/5 hover:bg-white/10 text-gray-300'
    }`;
    item.textContent = model;
    item.onclick = () => {
        setSelectedModel(model);
        document.body.removeChild(modal);
        console.log(`Selected AI model: ${model}`);
    };
    return item;
}

// Initialize selected model on page load
window.selectedAIModel = getSelectedModel();
