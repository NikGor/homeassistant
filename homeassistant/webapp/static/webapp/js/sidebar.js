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

    // Кнопка "Настройки чата"
    const settingsCollapsed = document.createElement('a');
    settingsCollapsed.href = "#";
    settingsCollapsed.className = "sidebar-item text-gray-300";
    settingsCollapsed.title = "Настройки чата";
    settingsCollapsed.onclick = (e) => {
        e.preventDefault();
        openChatSettingsModal();
    };
    settingsCollapsed.innerHTML = `<i data-lucide="sliders-horizontal" class="w-6 h-6"></i>`;
    leftSidebarCollapsedIcons.appendChild(settingsCollapsed);

    const settingsExpanded = document.createElement('a');
    settingsExpanded.href = "#";
    settingsExpanded.className = "sidebar-item-expanded text-gray-300";
    settingsExpanded.onclick = (e) => {
        e.preventDefault();
        openChatSettingsModal();
    };
    settingsExpanded.innerHTML = `<i data-lucide="sliders-horizontal" class="w-5 h-5 flex-shrink-0"></i><span class="sidebar-text ml-4 font-medium">Настройки чата</span>`;
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

    // Convert dashboard structure to array for rendering
    const tiles = [
        { ...dashboardData.light, category: 'light' },
        { ...dashboardData.climate, category: 'climate' },
        { ...dashboardData.music, category: 'music' },
        { ...dashboardData.documents, category: 'documents' },
        { ...dashboardData.apps, category: 'apps' },
        { ...dashboardData.settings, category: 'settings' }
    ];

    tiles.forEach(tile => {
        const iconColorClass = getTailwindColorClass(tile.status_color);
        
        const collapsedItem = document.createElement('a');
        collapsedItem.href = "#";
        collapsedItem.className = `sidebar-item ${iconColorClass}`;
        collapsedItem.dataset.appCategory = tile.category;
        collapsedItem.title = tile.title;
        collapsedItem.innerHTML = `<i data-lucide="${tile.icon}" class="w-6 h-6"></i>`;
        
        // Reserved for future widgets - do nothing on click
        collapsedItem.onclick = (e) => {
            e.preventDefault();
            console.log('Tile icon clicked (reserved for future):', tile.category);
        };
        
        rightSidebarCollapsedIcons.appendChild(collapsedItem);

        const expandedItem = document.createElement('a');
        expandedItem.href = "#";
        expandedItem.className = `sidebar-item-expanded text-gray-300`;
        expandedItem.dataset.appCategory = tile.category;
        expandedItem.innerHTML = `<i data-lucide="${tile.icon}" class="w-5 h-5 flex-shrink-0 ${iconColorClass}"></i><span class="sidebar-text ml-4 font-medium">${tile.title}</span>`;
        
        // Reserved for future widgets - do nothing on click
        expandedItem.onclick = (e) => {
            e.preventDefault();
            console.log('Tile icon clicked (reserved for future):', tile.category);
        };
        
        rightSidebarExpandedMenu.appendChild(expandedItem);
    });

    // Разделитель перед настройками профиля
    rightSidebarCollapsedIcons.innerHTML += '<hr class="border-t border-white/10 my-2">';
    rightSidebarExpandedMenu.innerHTML += '<hr class="border-t border-white/10 my-2">';

    // Кнопка "Настройки профиля"
    const profileSettingsCollapsed = document.createElement('a');
    profileSettingsCollapsed.href = "#";
    profileSettingsCollapsed.className = "sidebar-item text-gray-300";
    profileSettingsCollapsed.title = "Настройки профиля";
    profileSettingsCollapsed.onclick = (e) => {
        e.preventDefault();
        openUserProfileModal();
    };
    profileSettingsCollapsed.innerHTML = `<i data-lucide="user-cog" class="w-6 h-6"></i>`;
    rightSidebarCollapsedIcons.appendChild(profileSettingsCollapsed);

    const profileSettingsExpanded = document.createElement('a');
    profileSettingsExpanded.href = "#";
    profileSettingsExpanded.className = "sidebar-item-expanded text-gray-300";
    profileSettingsExpanded.onclick = (e) => {
        e.preventDefault();
        openUserProfileModal();
    };
    profileSettingsExpanded.innerHTML = `<i data-lucide="user-cog" class="w-5 h-5 flex-shrink-0"></i><span class="sidebar-text ml-4 font-medium">Настройки профиля</span>`;
    rightSidebarExpandedMenu.appendChild(profileSettingsExpanded);
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
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4.1",
        "gpt-4.1-mini",
        "gpt-4.1-nano",
        "gpt-5",
        "gpt-5-mini",
        "gpt-5-nano",
        "gpt-5-pro",
        "gpt-5.1",
        "o1",
        "o1-pro",
        "o3",
        "o3-mini",
        "o3-pro",
    ],
    openrouter: [
        // Google Gemini
        "google/gemini-3-pro-preview",
        "google/gemini-2.5-pro",
        "google/gemini-2.5-flash",
        "google/gemini-2.5-flash-lite",
        // Anthropic Claude
        "anthropic/claude-opus-4.5",
        "anthropic/claude-sonnet-4.5",
        "anthropic/claude-sonnet-4",
        "anthropic/claude-haiku-4.5",
        // xAI Grok
        "x-ai/grok-4",
        "x-ai/grok-4-fast",
        "x-ai/grok-4.1-fast",
        // DeepSeek
        "deepseek/deepseek-v3.2-exp",
        // Meta Llama
        "meta-llama/llama-4-maverick",
        "meta-llama/llama-4-scout",
    ],
};

// Available response formats
const RESPONSE_FORMATS = [
    { value: "plain", label: "Plain Text" },
    { value: "markdown", label: "Markdown" },
    { value: "html", label: "HTML" },
    { value: "ssml", label: "SSML" },
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
    { value: "xml", label: "XML" },
    { value: "yaml", label: "YAML" },
    { value: "prompt", label: "Prompt" },
    { value: "python", label: "Python" },
    { value: "bash", label: "Bash" },
    { value: "sql", label: "SQL" },
    { value: "regex", label: "Regex" },
    { value: "dockerfile", label: "Dockerfile" },
    { value: "makefile", label: "Makefile" },
    { value: "ui_answer", label: "UI Answer" },
];

// Get selected command model from localStorage or default
function getSelectedCommandModel() {
    return localStorage.getItem('selectedCommandModel') || 'gpt-4.1-mini';
}

// Set selected command model in localStorage
function setSelectedCommandModel(model) {
    localStorage.setItem('selectedCommandModel', model);
    window.selectedCommandModel = model;
}

// Get selected final output model from localStorage or default
function getSelectedFinalOutputModel() {
    return localStorage.getItem('selectedFinalOutputModel') || 'gpt-4.1';
}

// Set selected final output model in localStorage
function setSelectedFinalOutputModel(model) {
    localStorage.setItem('selectedFinalOutputModel', model);
    window.selectedFinalOutputModel = model;
}

// Get selected response format from localStorage or default
function getSelectedResponseFormat() {
    return localStorage.getItem('selectedResponseFormat') || 'ui_answer';
}

// Set selected response format in localStorage
function setSelectedResponseFormat(format) {
    localStorage.setItem('selectedResponseFormat', format);
    window.selectedResponseFormat = format;
}

// Open chat settings modal
function openChatSettingsModal() {
    const currentCommandModel = getSelectedCommandModel();
    const currentFinalOutputModel = getSelectedFinalOutputModel();
    const currentFormat = getSelectedResponseFormat();
    
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
    title.className = 'text-xl font-bold text-white mb-6';
    title.textContent = 'Настройки чата';
    modalContent.appendChild(title);
    
    // Command Model selection section
    const commandModelSection = document.createElement('div');
    commandModelSection.className = 'mb-6';
    
    const commandModelLabel = document.createElement('label');
    commandModelLabel.className = 'block text-sm font-medium text-gray-300 mb-2';
    commandModelLabel.textContent = 'Модель для команд';
    commandModelSection.appendChild(commandModelLabel);
    
    const commandModelSelect = document.createElement('select');
    commandModelSelect.className = 'w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none';
    commandModelSelect.style.color = 'white';
    commandModelSelect.style.backgroundColor = '#1f2937';
    
    // Add OpenAI models
    const openaiGroup1 = document.createElement('optgroup');
    openaiGroup1.label = 'OpenAI';
    openaiGroup1.style.backgroundColor = '#374151';
    openaiGroup1.style.color = 'white';
    AI_MODELS.openai.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        option.selected = model === currentCommandModel;
        option.style.backgroundColor = '#1f2937';
        option.style.color = 'white';
        openaiGroup1.appendChild(option);
    });
    commandModelSelect.appendChild(openaiGroup1);
    
    // Add OpenRouter models
    const openrouterGroup1 = document.createElement('optgroup');
    openrouterGroup1.label = 'OpenRouter';
    openrouterGroup1.style.backgroundColor = '#374151';
    openrouterGroup1.style.color = 'white';
    AI_MODELS.openrouter.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        option.selected = model === currentCommandModel;
        option.style.backgroundColor = '#1f2937';
        option.style.color = 'white';
        openrouterGroup1.appendChild(option);
    });
    commandModelSelect.appendChild(openrouterGroup1);
    
    commandModelSection.appendChild(commandModelSelect);
    modalContent.appendChild(commandModelSection);
    
    // Final Output Model selection section
    const finalOutputModelSection = document.createElement('div');
    finalOutputModelSection.className = 'mb-6';
    
    const finalOutputModelLabel = document.createElement('label');
    finalOutputModelLabel.className = 'block text-sm font-medium text-gray-300 mb-2';
    finalOutputModelLabel.textContent = 'Модель для финального ответа';
    finalOutputModelSection.appendChild(finalOutputModelLabel);
    
    const finalOutputModelSelect = document.createElement('select');
    finalOutputModelSelect.className = 'w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none';
    finalOutputModelSelect.style.color = 'white';
    finalOutputModelSelect.style.backgroundColor = '#1f2937';
    
    // Add OpenAI models
    const openaiGroup2 = document.createElement('optgroup');
    openaiGroup2.label = 'OpenAI';
    openaiGroup2.style.backgroundColor = '#374151';
    openaiGroup2.style.color = 'white';
    AI_MODELS.openai.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        option.selected = model === currentFinalOutputModel;
        option.style.backgroundColor = '#1f2937';
        option.style.color = 'white';
        openaiGroup2.appendChild(option);
    });
    finalOutputModelSelect.appendChild(openaiGroup2);
    
    // Add OpenRouter models
    const openrouterGroup2 = document.createElement('optgroup');
    openrouterGroup2.label = 'OpenRouter';
    openrouterGroup2.style.backgroundColor = '#374151';
    openrouterGroup2.style.color = 'white';
    AI_MODELS.openrouter.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        option.selected = model === currentFinalOutputModel;
        option.style.backgroundColor = '#1f2937';
        option.style.color = 'white';
        openrouterGroup2.appendChild(option);
    });
    finalOutputModelSelect.appendChild(openrouterGroup2);
    
    finalOutputModelSection.appendChild(finalOutputModelSelect);
    modalContent.appendChild(finalOutputModelSection);
    
    // Response format selection section
    const formatSection = document.createElement('div');
    formatSection.className = 'mb-6';
    
    const formatLabel = document.createElement('label');
    formatLabel.className = 'block text-sm font-medium text-gray-300 mb-2';
    formatLabel.textContent = 'Формат ответа';
    formatSection.appendChild(formatLabel);
    
    const formatSelect = document.createElement('select');
    formatSelect.className = 'w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none';
    formatSelect.style.color = 'white';
    formatSelect.style.backgroundColor = '#1f2937';
    
    RESPONSE_FORMATS.forEach(format => {
        const option = document.createElement('option');
        option.value = format.value;
        option.textContent = format.label;
        option.selected = format.value === currentFormat;
        option.style.backgroundColor = '#1f2937';
        option.style.color = 'white';
        formatSelect.appendChild(option);
    });
    
    formatSection.appendChild(formatSelect);
    modalContent.appendChild(formatSection);
    
    // Current settings info
    const currentInfo = document.createElement('div');
    currentInfo.className = 'mb-4 p-3 bg-white/10 rounded-lg text-sm';
    currentInfo.innerHTML = `
        <div class="text-gray-400 mb-1">Текущие настройки:</div>
        <div class="text-white">Команды: <span class="font-medium">${currentCommandModel}</span></div>
        <div class="text-white">Финальный ответ: <span class="font-medium">${currentFinalOutputModel}</span></div>
        <div class="text-white">Формат: <span class="font-medium">${RESPONSE_FORMATS.find(f => f.value === currentFormat)?.label || currentFormat}</span></div>
    `;
    modalContent.appendChild(currentInfo);
    
    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'flex gap-3';
    
    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium';
    saveBtn.textContent = 'Сохранить';
    saveBtn.onclick = () => {
        const selectedCommandModel = commandModelSelect.value;
        const selectedFinalOutputModel = finalOutputModelSelect.value;
        const selectedFormat = formatSelect.value;
        
        setSelectedCommandModel(selectedCommandModel);
        setSelectedFinalOutputModel(selectedFinalOutputModel);
        setSelectedResponseFormat(selectedFormat);
        
        console.log(`Settings saved - Command Model: ${selectedCommandModel}, Final Output Model: ${selectedFinalOutputModel}, Format: ${selectedFormat}`);
        document.body.removeChild(modal);
    };
    buttonsContainer.appendChild(saveBtn);
    
    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium';
    cancelBtn.textContent = 'Отмена';
    cancelBtn.onclick = () => document.body.removeChild(modal);
    buttonsContainer.appendChild(cancelBtn);
    
    modalContent.appendChild(buttonsContainer);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Initialize selected models and response format on page load
window.selectedCommandModel = getSelectedCommandModel();
window.selectedFinalOutputModel = getSelectedFinalOutputModel();
window.selectedResponseFormat = getSelectedResponseFormat();

// Open user profile settings modal
async function openUserProfileModal() {
    try {
        // Fetch profile data and choices in parallel
        const [profileResponse, choicesResponse] = await Promise.all([
            fetch('/api/profile/'),
            fetch('/api/profile/choices/')
        ]);

        if (!profileResponse.ok) {
            throw new Error('Failed to load profile');
        }

        const profile = await profileResponse.json();
        const choices = await choicesResponse.json();

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 flex items-center justify-center z-50';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };

        const modalContent = document.createElement('div');
        modalContent.className = 'bg-gray-900 rounded-2xl p-6 max-w-2xl w-full mx-4 border border-white/20 max-h-[90vh] overflow-y-auto';
        modalContent.onclick = (e) => e.stopPropagation();

        const title = document.createElement('h2');
        title.className = 'text-xl font-bold text-white mb-6';
        title.textContent = 'Настройки профиля';
        modalContent.appendChild(title);

        // Create form
        const form = document.createElement('form');
        form.className = 'space-y-4';

        // Basic Information Section
        form.innerHTML += '<h3 class="text-lg font-semibold text-white mt-4 mb-2">Основная информация</h3>';
        
        form.innerHTML += createFormField('user_name', 'Имя пользователя', 'text', profile.user_name);
        form.innerHTML += createFormSelect('persona', 'Персона', choices.persona, profile.persona);

        // Location & Time Section
        form.innerHTML += '<h3 class="text-lg font-semibold text-white mt-6 mb-2">Местоположение и время</h3>';
        
        form.innerHTML += createFormField('default_city', 'Город по умолчанию', 'text', profile.default_city);
        form.innerHTML += createFormField('default_country', 'Страна по умолчанию', 'text', profile.default_country);
        form.innerHTML += createFormField('user_timezone', 'Часовой пояс', 'text', profile.user_timezone);
        form.innerHTML += createFormField('measurement_units', 'Единицы измерения', 'text', profile.measurement_units);

        // Localization Section
        form.innerHTML += '<h3 class="text-lg font-semibold text-white mt-6 mb-2">Локализация</h3>';
        
        form.innerHTML += createFormSelect('language', 'Язык', choices.language, profile.language);
        form.innerHTML += createFormSelect('currency', 'Валюта', choices.currency, profile.currency);
        form.innerHTML += createFormField('date_format', 'Формат даты', 'text', profile.date_format);
        form.innerHTML += createFormSelect('time_format', 'Формат времени', choices.time_format, profile.time_format);

        // Commercial Settings Section
        form.innerHTML += '<h3 class="text-lg font-semibold text-white mt-6 mb-2">Коммерческие настройки</h3>';
        
        form.innerHTML += createFormField('commercial_holidays', 'Регион праздников', 'text', profile.commercial_holidays);
        form.innerHTML += createFormCheckbox('commercial_check_open_now', 'Проверять время работы', profile.commercial_check_open_now);

        modalContent.appendChild(form);

        // Buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'flex gap-3 mt-6';

        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium';
        saveBtn.textContent = 'Сохранить';
        saveBtn.onclick = async () => {
            try {
                const formData = new FormData(form);
                const data = {};
                
                for (let [key, value] of formData.entries()) {
                    if (key === 'commercial_check_open_now') {
                        data[key] = value === 'on';
                    } else {
                        data[key] = value;
                    }
                }

                const response = await fetch('/api/profile/update/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    console.log('Profile updated successfully');
                    document.body.removeChild(modal);
                } else {
                    const error = await response.json();
                    alert(`Ошибка: ${error.error || 'Не удалось сохранить профиль'}`);
                }
            } catch (err) {
                alert(`Ошибка: ${err.message}`);
            }
        };
        buttonsContainer.appendChild(saveBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium';
        cancelBtn.textContent = 'Отмена';
        cancelBtn.onclick = () => document.body.removeChild(modal);
        buttonsContainer.appendChild(cancelBtn);

        modalContent.appendChild(buttonsContainer);

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Не удалось загрузить профиль');
    }
}

// Helper function to create form field
function createFormField(name, label, type, value) {
    return `
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">${label}</label>
            <input type="${type}" name="${name}" value="${value || ''}" 
                   class="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none"
                   style="color: white; background-color: #1f2937;">
        </div>
    `;
}

// Helper function to create select field
function createFormSelect(name, label, options, selectedValue) {
    const optionsHtml = options.map(opt => 
        `<option value="${opt.value}" ${opt.value === selectedValue ? 'selected' : ''} 
                 style="background-color: #1f2937; color: white;">${opt.label}</option>`
    ).join('');
    
    return `
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">${label}</label>
            <select name="${name}" 
                    class="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none"
                    style="color: white; background-color: #1f2937;">
                ${optionsHtml}
            </select>
        </div>
    `;
}

// Helper function to create checkbox field
function createFormCheckbox(name, label, checked) {
    return `
        <div class="flex items-center">
            <input type="checkbox" name="${name}" ${checked ? 'checked' : ''} 
                   class="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500">
            <label class="ml-2 text-sm font-medium text-gray-300">${label}</label>
        </div>
    `;
}

// Helper function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
