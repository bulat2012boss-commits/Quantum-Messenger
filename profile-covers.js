// group-search.js - Расширенный поиск сообщений для Quantum Messenger

// Глобальные переменные для поиска
let groupSearchResults = [];
let currentSearchType = 'user'; // 'user' или 'text'
let currentSearchUser = '';

// Инициализация функции поиска
function initGroupSearch() {
    console.log("Инициализация расширенного поиска сообщений в группах...");
    
    // Добавляем стили для поиска
    addSearchStyles();
    
    // Интегрируем с существующей системой групп
    integrateSearchWithGroups();
}

// Добавление стилей для поиска
function addSearchStyles() {
    const searchStyles = `
        .suggestion-item {
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid var(--border-color);
            transition: background 0.2s;
            font-size: 14px;
        }
        
        .suggestion-item:hover {
            background: var(--other-msg-bg);
        }
        
        .search-result-message {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 8px;
            background: var(--other-msg-bg);
            cursor: pointer;
            transition: all 0.2s;
            border-left: 3px solid #4facfe;
        }
        
        .search-result-message:hover {
            background: var(--message-bg);
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .search-highlight {
            background: #ffeb3b !important;
            color: #000 !important;
            transition: all 0.5s ease;
            border: 2px solid #ff9800 !important;
        }
        
        #userSuggestions {
            background: var(--header-bg);
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .search-type-selector {
            display: flex;
            background: var(--header-bg);
            border-radius: 8px;
            padding: 5px;
            margin-bottom: 15px;
            border: 1px solid var(--border-color);
        }
        
        .search-type-btn {
            flex: 1;
            padding: 10px;
            text-align: center;
            cursor: pointer;
            border-radius: 5px;
            transition: all 0.3s;
            font-size: 14px;
            border: none;
            background: transparent;
            color: var(--text-color);
        }
        
        .search-type-btn.active {
            background: linear-gradient(to right, #4facfe, #00f2fe);
            color: white;
            box-shadow: 0 2px 5px rgba(79, 172, 254, 0.3);
        }
        
        .search-type-btn i {
            margin-right: 5px;
        }
        
        .search-input-group {
            margin-bottom: 15px;
        }
        
        .search-input-group label {
            display: block;
            margin-bottom: 5px;
            font-size: 14px;
            color: var(--text-color);
            opacity: 0.8;
        }
        
        .combined-search-results {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid var(--border-color);
        }
        
        .result-count-badge {
            background: #4facfe;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
            margin-left: 5px;
        }
        
        @media (max-width: 768px) {
            .search-result-message {
                padding: 8px;
                margin-bottom: 10px;
            }
            
            .suggestion-item {
                padding: 12px;
                font-size: 16px;
            }
            
            .search-type-btn {
                padding: 12px 8px;
                font-size: 13px;
            }
        }
        
        @media (max-width: 480px) {
            .search-result-message {
                padding: 6px;
                margin-bottom: 8px;
                font-size: 13px;
            }
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = searchStyles;
    document.head.appendChild(styleSheet);
}

// Интеграция с существующей системой групп
function integrateSearchWithGroups() {
    // Перехватываем создание интерфейса группового чата
    const originalCreateGroupChat = window.createGroupChatInterface;
    
    if (originalCreateGroupChat) {
        window.createGroupChatInterface = function(group) {
            // Вызываем оригинальную функцию
            originalCreateGroupChat.call(this, group);
            
            // Добавляем наш пункт меню
            addSearchMenuItem();
        };
    }
    
    // Альтернативный способ - проверяем наличие меню и добавляем пункт
    setTimeout(() => {
        addSearchMenuItem();
    }, 1000);
}

// Добавление пункта меню для поиска
function addSearchMenuItem() {
    const groupMenuContent = document.getElementById('groupMenuContent');
    
    if (groupMenuContent && !document.getElementById('searchUserMessagesBtn')) {
        const searchMenuItem = document.createElement('div');
        searchMenuItem.className = 'chat-menu-item';
        searchMenuItem.id = 'searchUserMessagesBtn';
        searchMenuItem.innerHTML = '<i class="fas fa-search"></i> Расширенный поиск сообщений';
        
        // Вставляем после пункта "Информация о группе" или в начало
        const infoBtn = document.getElementById('groupInfoBtn');
        if (infoBtn) {
            infoBtn.parentNode.insertBefore(searchMenuItem, infoBtn.nextSibling);
        } else {
            groupMenuContent.insertBefore(searchMenuItem, groupMenuContent.firstChild);
        }
        
        // Добавляем обработчик
        searchMenuItem.addEventListener('click', showAdvancedSearchModal);
        
        console.log("Пункт расширенного поиска сообщений добавлен в меню группы");
    }
}

// Показ расширенного модального окна поиска
function showAdvancedSearchModal() {
    if (!currentGroupId) {
        showNotification("Откройте группу для поиска сообщений");
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'advancedSearchModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">
                <i class="fas fa-search-plus"></i> Расширенный поиск
            </h3>
            
            <div class="search-type-selector">
                <button class="search-type-btn active" data-type="user" id="searchUserBtn">
                    <i class="fas fa-user"></i> Поиск по пользователю
                </button>
                <button class="search-type-btn" data-type="text" id="searchTextBtn">
                    <i class="fas fa-comment"></i> Поиск по тексту
                </button>
                <button class="search-type-btn" data-type="combined" id="searchCombinedBtn">
                    <i class="fas fa-search-plus"></i> Комбинированный
                </button>
            </div>
            
            <div id="searchUserSection" class="search-section">
                <div class="search-input-group">
                    <label for="searchUserInput"><i class="fas fa-user"></i> Имя пользователя:</label>
                    <input type="text" id="searchUserInput" placeholder="Введите имя пользователя..." 
                           style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); 
                                  background: var(--input-bg); color: var(--input-color); font-size: 14px;">
                    <div id="userSuggestions" style="max-height: 150px; overflow-y: auto; margin-top: 5px; 
                          border: 1px solid var(--border-color); border-radius: 5px; display: none; background: var(--header-bg);"></div>
                </div>
                <div style="margin-bottom: 15px; font-size: 12px; color: var(--text-color); opacity: 0.7; text-align: center;">
                    <i class="fas fa-info-circle"></i> Найдёт все сообщения от выбранного пользователя
                </div>
            </div>
            
            <div id="searchTextSection" class="search-section" style="display: none;">
                <div class="search-input-group">
                    <label for="searchTextInput"><i class="fas fa-comment"></i> Текст сообщения:</label>
                    <input type="text" id="searchTextInput" placeholder="Введите текст для поиска..." 
                           style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); 
                                  background: var(--input-bg); color: var(--input-color); font-size: 14px;">
                </div>
                <div style="margin-bottom: 15px; font-size: 12px; color: var(--text-color); opacity: 0.7; text-align: center;">
                    <i class="fas fa-info-circle"></i> Найдёт все сообщения содержащие указанный текст
                </div>
            </div>
            
            <div id="searchCombinedSection" class="search-section" style="display: none;">
                <div class="search-input-group">
                    <label for="combinedUserInput"><i class="fas fa-user"></i> Имя пользователя:</label>
                    <input type="text" id="combinedUserInput" placeholder="Введите имя пользователя..." 
                           style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); 
                                  background: var(--input-bg); color: var(--input-color); font-size: 14px; margin-bottom: 10px;">
                    <div id="combinedUserSuggestions" style="max-height: 150px; overflow-y: auto; margin-top: 5px; 
                          border: 1px solid var(--border-color); border-radius: 5px; display: none; background: var(--header-bg);"></div>
                </div>
                <div class="search-input-group">
                    <label for="combinedTextInput"><i class="fas fa-comment"></i> Текст сообщения:</label>
                    <input type="text" id="combinedTextInput" placeholder="Введите текст для поиска..." 
                           style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); 
                                  background: var(--input-bg); color: var(--input-color); font-size: 14px;">
                </div>
                <div style="margin-bottom: 15px; font-size: 12px; color: var(--text-color); opacity: 0.7; text-align: center;">
                    <i class="fas fa-info-circle"></i> Найдёт сообщения от пользователя содержащие указанный текст
                </div>
            </div>
            
            <div class="modal-buttons">
                <button class="modal-btn primary" id="confirmSearchBtn" style="background: linear-gradient(to right, #4facfe, #00f2fe);">
                    <i class="fas fa-search"></i> Найти
                </button>
                <button class="modal-btn secondary" id="cancelSearchBtn">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);

    // Инициализация переключателя типа поиска
    initSearchTypeSelector();
    
    // Загружаем список участников группы для автодополнения
    loadGroupMembersForSearch('searchUserInput', 'userSuggestions');
    loadGroupMembersForSearch('combinedUserInput', 'combinedUserSuggestions');

    // Фокус на поле ввода
    setTimeout(() => {
        document.getElementById('searchUserInput').focus();
    }, 100);

    // Обработчики для модального окна
    document.getElementById('confirmSearchBtn').addEventListener('click', performAdvancedSearch);
    
    document.getElementById('cancelSearchBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', function closeOnEsc(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', closeOnEsc);
        }
    });
}

// Инициализация переключателя типа поиска
function initSearchTypeSelector() {
    const searchButtons = document.querySelectorAll('.search-type-btn');
    const searchSections = document.querySelectorAll('.search-section');
    
    searchButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            searchButtons.forEach(b => b.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Скрываем все секции
            searchSections.forEach(section => section.style.display = 'none');
            
            // Показываем нужную секцию
            const searchType = this.dataset.type;
            currentSearchType = searchType;
            
            if (searchType === 'user') {
                document.getElementById('searchUserSection').style.display = 'block';
                setTimeout(() => document.getElementById('searchUserInput').focus(), 100);
            } else if (searchType === 'text') {
                document.getElementById('searchTextSection').style.display = 'block';
                setTimeout(() => document.getElementById('searchTextInput').focus(), 100);
            } else if (searchType === 'combined') {
                document.getElementById('searchCombinedSection').style.display = 'block';
                setTimeout(() => document.getElementById('combinedUserInput').focus(), 100);
            }
        });
    });
}

// Загрузка участников группы для автодополнения
function loadGroupMembersForSearch(inputId, suggestionsId) {
    if (!currentGroupId) return;

    database.ref('groups/' + currentGroupId + '/members').once('value').then((snapshot) => {
        if (!snapshot.exists()) return;

        const members = snapshot.val();
        const searchInput = document.getElementById(inputId);
        const suggestionsContainer = document.getElementById(suggestionsId);

        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            suggestionsContainer.innerHTML = '';
            
            if (searchTerm.length < 1) {
                suggestionsContainer.style.display = 'none';
                return;
            }

            let hasSuggestions = false;
            Object.keys(members).forEach(memberId => {
                const member = members[memberId];
                if (member.name && member.name.toLowerCase().includes(searchTerm) && memberId !== userId) {
                    hasSuggestions = true;
                    const suggestionItem = document.createElement('div');
                    suggestionItem.className = 'suggestion-item';
                    suggestionItem.textContent = member.name;
                    
                    suggestionItem.addEventListener('click', () => {
                        searchInput.value = member.name;
                        suggestionsContainer.style.display = 'none';
                    });
                    
                    suggestionsContainer.appendChild(suggestionItem);
                }
            });
            
            suggestionsContainer.style.display = hasSuggestions ? 'block' : 'none';
        });

        // Скрываем подсказки при клике вне
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });
    });
}

// Выполнение расширенного поиска
function performAdvancedSearch() {
    let searchTerm, userName;
    
    if (currentSearchType === 'user') {
        userName = document.getElementById('searchUserInput').value.trim();
        if (!userName) {
            showNotification("Введите имя пользователя для поиска");
            return;
        }
        searchTerm = userName;
    } else if (currentSearchType === 'text') {
        searchTerm = document.getElementById('searchTextInput').value.trim();
        if (!searchTerm) {
            showNotification("Введите текст для поиска");
            return;
        }
    } else if (currentSearchType === 'combined') {
        userName = document.getElementById('combinedUserInput').value.trim();
        searchTerm = document.getElementById('combinedTextInput').value.trim();
        
        if (!userName && !searchTerm) {
            showNotification("Введите имя пользователя или текст для поиска");
            return;
        }
    }

    // Закрываем модальное окно поиска
    document.body.removeChild(document.getElementById('advancedSearchModal'));

    if (currentSearchType === 'user') {
        showNotification(`🔍 Поиск всех сообщений от ${userName}...`);
        performUserMessagesSearch(userName, 'all');
    } else if (currentSearchType === 'text') {
        showNotification(`🔍 Поиск сообщений содержащих "${searchTerm}"...`);
        performTextSearch(searchTerm);
    } else if (currentSearchType === 'combined') {
        if (userName && searchTerm) {
            showNotification(`🔍 Поиск сообщений от ${userName} содержащих "${searchTerm}"...`);
            performCombinedSearch(userName, searchTerm);
        } else if (userName) {
            showNotification(`🔍 Поиск всех сообщений от ${userName}...`);
            performUserMessagesSearch(userName, 'all');
        } else if (searchTerm) {
            showNotification(`🔍 Поиск сообщений содержащих "${searchTerm}"...`);
            performTextSearch(searchTerm);
        }
    }
}

// Поиск сообщений от конкретного пользователя
function performUserMessagesSearch(userName, searchContext = 'user') {
    if (!currentGroupId) return;

    database.ref('groupMessages').orderByChild('groupId').equalTo(currentGroupId).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            showNotification("Сообщения не найдены");
            return;
        }

        const messages = snapshot.val();
        groupSearchResults = [];

        // Ищем сообщения от указанного пользователя
        Object.keys(messages).forEach(messageId => {
            const message = messages[messageId];
            if (message.senderName && 
                message.senderName.toLowerCase().includes(userName.toLowerCase()) && 
                !message.isSystem) {
                groupSearchResults.push({
                    ...message,
                    id: messageId,
                    searchType: 'user',
                    searchContext: searchContext
                });
            }
        });

        // Сортируем по времени (новые сверху)
        groupSearchResults.sort((a, b) => b.timestamp - a.timestamp);

        // Показываем результаты
        if (searchContext === 'user') {
            showUserMessagesSearchResults(userName);
        }
        // Для комбинированного поиска результаты показываются в общей функции
    }).catch((error) => {
        console.error("Ошибка поиска сообщений:", error);
        showNotification("Ошибка поиска сообщений");
    });
    
    return groupSearchResults;
}

// Поиск сообщений по тексту
function performTextSearch(searchText) {
    if (!currentGroupId) return;

    database.ref('groupMessages').orderByChild('groupId').equalTo(currentGroupId).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            showNotification("Сообщения не найдены");
            return;
        }

        const messages = snapshot.val();
        groupSearchResults = [];

        // Ищем сообщения содержащие указанный текст
        Object.keys(messages).forEach(messageId => {
            const message = messages[messageId];
            if (message.text && 
                message.text.toLowerCase().includes(searchText.toLowerCase()) && 
                !message.isSystem) {
                groupSearchResults.push({
                    ...message,
                    id: messageId,
                    searchType: 'text',
                    searchTerm: searchText
                });
            }
        });

        // Сортируем по времени (новые сверху)
        groupSearchResults.sort((a, b) => b.timestamp - a.timestamp);

        // Показываем результаты
        showTextSearchResults(searchText);
    }).catch((error) => {
        console.error("Ошибка поиска сообщений:", error);
        showNotification("Ошибка поиска сообщений");
    });
}

// Комбинированный поиск
function performCombinedSearch(userName, searchText) {
    if (!currentGroupId) return;

    database.ref('groupMessages').orderByChild('groupId').equalTo(currentGroupId).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            showNotification("Сообщения не найдены");
            return;
        }

        const messages = snapshot.val();
        groupSearchResults = [];

        // Ищем сообщения от указанного пользователя содержащие указанный текст
        Object.keys(messages).forEach(messageId => {
            const message = messages[messageId];
            if (message.senderName && 
                message.text &&
                message.senderName.toLowerCase().includes(userName.toLowerCase()) && 
                message.text.toLowerCase().includes(searchText.toLowerCase()) &&
                !message.isSystem) {
                groupSearchResults.push({
                    ...message,
                    id: messageId,
                    searchType: 'combined',
                    userName: userName,
                    searchTerm: searchText
                });
            }
        });

        // Сортируем по времени (новые сверху)
        groupSearchResults.sort((a, b) => b.timestamp - a.timestamp);

        // Показываем результаты
        showCombinedSearchResults(userName, searchText);
    }).catch((error) => {
        console.error("Ошибка поиска сообщений:", error);
        showNotification("Ошибка поиска сообщений");
    });
}

// Показ результатов поиска по пользователю
function showUserMessagesSearchResults(userName) {
    showSearchResultsModal(
        userName, 
        'user', 
        `Найдено ${groupSearchResults.length} сообщений от ${userName}`,
        `Все сообщения от пользователя <strong>${userName}</strong>`
    );
}

// Показ результатов поиска по тексту
function showTextSearchResults(searchText) {
    showSearchResultsModal(
        searchText, 
        'text', 
        `Найдено ${groupSearchResults.length} сообщений содержащих "${searchText}"`,
        `Сообщения содержащие текст: <strong>"${searchText}"</strong>`
    );
}

// Показ результатов комбинированного поиска
function showCombinedSearchResults(userName, searchText) {
    showSearchResultsModal(
        `${userName} + "${searchText}"`, 
        'combined', 
        `Найдено ${groupSearchResults.length} сообщений от ${userName} содержащих "${searchText}"`,
        `Сообщения от <strong>${userName}</strong> содержащие текст: <strong>"${searchText}"</strong>`
    );
}

// Универсальная функция показа результатов поиска
function showSearchResultsModal(searchTerm, searchType, title, description) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'searchResultsModal';
    
    let resultsHTML = '';
    
    if (groupSearchResults.length === 0) {
        resultsHTML = `
            <div class="empty-chat" style="padding: 40px 20px;">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p style="font-size: 16px; margin-bottom: 10px;">Сообщения не найдены</p>
                <p style="font-size: 14px; opacity: 0.7;">Попробуйте изменить параметры поиска</p>
            </div>
        `;
    } else {
        resultsHTML = `
            <div style="margin-bottom: 15px; text-align: center;">
                <h4 style="color: #4facfe; margin-bottom: 5px;">
                    <i class="fas fa-check-circle"></i> ${title}
                </h4>
                <p style="font-size: 14px; opacity: 0.8;">${description}</p>
            </div>
            <div id="searchResults" style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); 
                  border-radius: 8px; padding: 10px; background: var(--header-bg);">
        `;
        
        groupSearchResults.forEach((message, index) => {
            const date = new Date(message.timestamp);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateString = date.toLocaleDateString();
            
            // Подсветка текста для поиска по тексту
            let messageText = message.text;
            if (searchType === 'text' && message.searchTerm) {
                const regex = new RegExp(`(${message.searchTerm})`, 'gi');
                messageText = messageText.replace(regex, '<mark style="background: #ffeb3b; padding: 1px 3px; border-radius: 3px;">$1</mark>');
            } else if (searchType === 'combined' && message.searchTerm) {
                const regex = new RegExp(`(${message.searchTerm})`, 'gi');
                messageText = messageText.replace(regex, '<mark style="background: #ffeb3b; padding: 1px 3px; border-radius: 3px;">$1</mark>');
            }
            
            resultsHTML += `
                <div class="search-result-message" style="margin-bottom: 15px; padding: 12px; border-radius: 8px; 
                     background: var(--other-msg-bg); cursor: pointer; border-left: 4px solid #4facfe;" 
                     data-message-id="${message.id}" data-result-index="${index}">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <strong style="color: #4facfe;">${message.senderName}</strong>
                            <span style="font-size: 11px; background: #4facfe; color: white; padding: 2px 6px; border-radius: 10px;">
                                ${index + 1}
                            </span>
                        </div>
                        <span style="font-size: 11px; opacity: 0.7;">${dateString} ${timeString}</span>
                    </div>
                    <div style="font-size: 14px; line-height: 1.4;">${messageText}</div>
                </div>
            `;
        });
        
        resultsHTML += '</div>';
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <h3 style="margin-bottom: 15px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                <i class="fas fa-search"></i> Результаты поиска
            </h3>
            ${resultsHTML}
            <div class="modal-buttons" style="margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                ${groupSearchResults.length > 0 ? `
                    <button class="modal-btn primary" id="scrollToFirstBtn" style="background: linear-gradient(to right, #4facfe, #00f2fe);">
                        <i class="fas fa-arrow-down"></i> Перейти к первому
                    </button>
                ` : ''}
                <button class="modal-btn" id="newSearchBtn" style="background: linear-gradient(to right, #ff7e5f, #feb47b);">
                    <i class="fas fa-redo"></i> Новый поиск
                </button>
                <button class="modal-btn secondary" id="closeResultsBtn">
                    <i class="fas fa-times"></i> Закрыть
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);

    // Обработчики для результатов
    document.getElementById('closeResultsBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
        groupSearchResults = [];
    });

    if (groupSearchResults.length > 0) {
        document.getElementById('scrollToFirstBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
            scrollToMessage(groupSearchResults[0].id);
        });
        
        // Обработчики для клика по сообщениям в результатах
        modal.querySelectorAll('.search-result-message').forEach(item => {
            item.addEventListener('click', () => {
                const messageId = item.dataset.messageId;
                document.body.removeChild(modal);
                scrollToMessage(messageId);
            });
        });
    }
    
    document.getElementById('newSearchBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
        groupSearchResults = [];
        setTimeout(showAdvancedSearchModal, 300);
    });
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            groupSearchResults = [];
        }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', function closeResultsOnEsc(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            groupSearchResults = [];
            document.removeEventListener('keydown', closeResultsOnEsc);
        }
    });
}

// Прокрутка к конкретному сообщению
function scrollToMessage(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        // Прокручиваем к сообщению
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Добавляем подсветку
        messageElement.classList.add('search-highlight');
        
        // Убираем подсветку через 3 секунды
        setTimeout(() => {
            messageElement.classList.remove('search-highlight');
        }, 3000);
        
        showNotification("Переход к найденному сообщению");
    } else {
        showNotification("Сообщение не найдено в текущем чате. Возможно, оно было удалено.");
    }
}

// Автоматическая инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Ждем инициализации Firebase и системы групп
    const checkInit = setInterval(() => {
        if (typeof database !== 'undefined' && typeof currentGroupId !== 'undefined') {
            clearInterval(checkInit);
            setTimeout(initGroupSearch, 1000);
        }
    }, 100);
});

// Экспорт функций для глобального доступа
window.searchMessagesFromUser = showAdvancedSearchModal;
window.initGroupSearch = initGroupSearch;
window.performUserMessagesSearch = performUserMessagesSearch;
window.performTextSearch = performTextSearch;

console.log("Advanced Group Search Module loaded - Расширенный поиск сообщений готов к использованию");