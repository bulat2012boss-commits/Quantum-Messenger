// recent-chats-search.js
// Компактная система недавних чатов в виде аватаров под поиском

class RecentChatsSearch {
    constructor() {
        this.recentChats = [];
        this.maxRecentChats = 8;
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔄 Инициализация системы недавних чатов...');
        this.loadRecentChats();
        this.injectRecentChatsUI();
        this.setupEventListeners();
        this.integrateWithChatSystem();
        this.isInitialized = true;
        
        console.log('✅ Система недавних чатов инициализирована', this.recentChats);
    }

    // Загрузка недавних чатов из localStorage
    loadRecentChats() {
        try {
            const saved = localStorage.getItem('quantumRecentChats');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.recentChats = Array.isArray(parsed) ? parsed.filter(chat => 
                    chat && chat.id && chat.name
                ) : [];
                console.log(`📁 Загружено ${this.recentChats.length} недавних чатов`);
            }
        } catch (error) {
            console.error('Ошибка загрузки недавних чатов:', error);
            this.recentChats = [];
        }
    }

    // Сохранение недавних чатов в localStorage
    saveRecentChats() {
        try {
            localStorage.setItem('quantumRecentChats', JSON.stringify(this.recentChats));
        } catch (error) {
            console.error('Ошибка сохранения недавних чатов:', error);
        }
    }

    // Добавление чата в список недавних
    addToRecentChats(chatId, chatName, avatarColor = null, lastMessage = '', isGroup = false) {
        if (!chatId || !chatName) {
            console.error('❌ Неверные данные для добавления в недавние:', {chatId, chatName});
            return;
        }

        const finalAvatarColor = avatarColor || this.generateUserColor();
        
        // Удаляем чат, если он уже есть в списке
        this.recentChats = this.recentChats.filter(chat => chat.id !== chatId);
        
        // Добавляем чат в начало списка
        this.recentChats.unshift({
            id: chatId,
            name: chatName,
            avatarColor: finalAvatarColor,
            lastMessage: lastMessage || 'Нет сообщений',
            isGroup: isGroup,
            timestamp: Date.now()
        });

        // Ограничиваем количество недавних чатов
        if (this.recentChats.length > this.maxRecentChats) {
            this.recentChats = this.recentChats.slice(0, this.maxRecentChats);
        }

        this.saveRecentChats();
        this.updateRecentChatsUI();
        
        console.log('➕ Добавлен в недавние:', chatName, chatId);
    }

    // Генерация цвета для аватара
    generateUserColor() {
        const colors = ['#4facfe', '#00f2fe', '#a0d2eb', '#7fdbda', '#6a9bd8', '#ff6b6b', '#51cf66', '#ffd43b'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Внедрение UI для недавних чатов
    injectRecentChatsUI() {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer) {
            console.log('⏳ Контейнер поиска не найден, повторная попытка...');
            setTimeout(() => this.injectRecentChatsUI(), 500);
            return;
        }

        // Проверяем, не добавлен ли уже контейнер
        if (document.getElementById('recentChatsAvatars')) {
            console.log('✅ Контейнер уже существует, обновляем...');
            this.updateRecentChatsUI();
            return;
        }

        // Создаем компактный контейнер для аватаров
        const recentChatsHTML = `
            <div class="recent-chats-avatars-container" id="recentChatsAvatars">
                <div class="recent-chats-label">
                    <span>Недавние</span>
                </div>
                <div class="recent-chats-avatars" id="recentChatsAvatarsList">
                    ${this.getAvatarsHTML()}
                </div>
            </div>
        `;

        // Вставляем после контейнера поиска
        searchContainer.insertAdjacentHTML('afterend', recentChatsHTML);
        this.injectStyles();
        
        console.log('🎨 UI недавних чатов добавлен');
    }

    // Получение HTML для аватаров
    getAvatarsHTML() {
        if (this.recentChats.length === 0) {
            return '<div class="no-recent-chats">Нет недавних чатов</div>';
        }

        return this.recentChats.map(chat => {
            const avatarInitial = chat.name.charAt(0).toUpperCase();
            const groupClass = chat.isGroup ? 'group' : '';

            return `
                <div class="recent-chat-avatar-item" data-chat-id="${chat.id}" data-user-id="${this.extractUserId(chat.id)}" data-chat-name="${this.escapeHtml(chat.name)}">
                    <div class="recent-chat-avatar-compact ${groupClass}" style="background: ${chat.avatarColor}">
                        ${avatarInitial}
                    </div>
                    <div class="recent-chat-name-compact">${this.escapeHtml(this.truncateName(chat.name))}</div>
                </div>
            `;
        }).join('');
    }

    // Извлекаем ID пользователя из ID чата
    extractUserId(chatId) {
        console.log('🔍 Извлекаем ID пользователя из:', chatId);
        
        // Если это прямой ID пользователя
        if (chatId.startsWith('user-')) {
            return chatId;
        }
        
        // Если это ID чата в формате "chat_user1_user2"
        if (chatId.startsWith('chat_')) {
            const parts = chatId.split('_');
            console.log('📋 Части ID чата:', parts);
            
            // Находим ID который не равен текущему пользователю
            const currentUserId = window.userId;
            console.log('👤 Текущий пользователь:', currentUserId);
            
            for (let i = 1; i < parts.length; i++) {
                if (parts[i] !== currentUserId && parts[i].startsWith('user-')) {
                    console.log('✅ Найден ID пользователя:', parts[i]);
                    return parts[i];
                }
            }
        }
        
        console.log('❌ Не удалось извлечь ID пользователя, возвращаем как есть:', chatId);
        return chatId;
    }

    // Обрезаем длинные имена
    truncateName(name) {
        return name.length > 12 ? name.substring(0, 10) + '...' : name;
    }

    // Добавление CSS стилей
    injectStyles() {
        if (document.getElementById('recentChatsStyles')) return;

        const styles = `
            .recent-chats-avatars-container {
                background: var(--header-bg);
                border-bottom: 1px solid var(--border-color);
                padding: 12px 15px 8px 15px;
                display: none;
                transition: all 0.3s ease;
            }

            .recent-chats-avatars-container.show {
                display: block;
                animation: slideDown 0.3s ease;
            }

            .recent-chats-label {
                font-size: 13px;
                font-weight: 600;
                opacity: 0.8;
                margin-bottom: 10px;
                padding: 0 5px;
            }

            .recent-chats-avatars {
                display: flex;
                gap: 15px;
                overflow-x: auto;
                padding: 5px 0 10px 0;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .recent-chats-avatars::-webkit-scrollbar {
                display: none;
            }

            .recent-chat-avatar-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                flex-shrink: 0;
                min-width: 60px;
            }

            .recent-chat-avatar-item:hover {
                transform: translateY(-2px);
            }

            .recent-chat-avatar-compact {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 16px;
                color: white;
                border: 3px solid var(--header-bg);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                transition: all 0.2s ease;
            }

            .recent-chat-avatar-item:hover .recent-chat-avatar-compact {
                border-color: var(--message-bg);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }

            .recent-chat-name-compact {
                font-size: 11px;
                font-weight: 500;
                text-align: center;
                opacity: 0.9;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 60px;
                line-height: 1.2;
            }

            .no-recent-chats {
                text-align: center;
                padding: 20px;
                opacity: 0.5;
                font-size: 13px;
                width: 100%;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @media (max-width: 768px) {
                .recent-chats-avatars-container {
                    padding: 10px 12px 6px 12px;
                }

                .recent-chat-avatar-compact {
                    width: 45px;
                    height: 45px;
                    font-size: 14px;
                }

                .recent-chats-avatars {
                    gap: 12px;
                }

                .recent-chat-avatar-item {
                    min-width: 55px;
                }

                .recent-chat-name-compact {
                    font-size: 10px;
                    max-width: 55px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'recentChatsStyles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Обновление UI недавних чатов
    updateRecentChatsUI() {
        const avatarsList = document.getElementById('recentChatsAvatarsList');
        if (avatarsList) {
            avatarsList.innerHTML = this.getAvatarsHTML();
            this.attachAvatarsEventListeners();
        }
    }

    // Показ/скрытие недавних чатов
    toggleRecentChats(show) {
        const container = document.getElementById('recentChatsAvatars');
        if (!container) return;

        if (show && this.recentChats.length > 0) {
            container.classList.add('show');
        } else {
            container.classList.remove('show');
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) {
            setTimeout(() => this.setupEventListeners(), 500);
            return;
        }

        // Показываем недавние при переходе на вкладку поиска
        this.setupTabSwitchHandler();

        // Скрываем недавние чаты при вводе текста
        searchInput.addEventListener('input', (e) => {
            if (e.target.value.trim()) {
                this.toggleRecentChats(false);
            } else {
                this.toggleRecentChats(this.isSearchTabActive());
            }
        });
    }

    // Обработчик переключения вкладок
    setupTabSwitchHandler() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.getAttribute('data-tab');
                setTimeout(() => {
                    if (tabType === 'search' && !this.hasSearchQuery()) {
                        this.toggleRecentChats(true);
                    } else {
                        this.toggleRecentChats(false);
                    }
                }, 100);
            });
        });

        // Проверяем текущую вкладку при загрузке
        if (this.isSearchTabActive() && !this.hasSearchQuery()) {
            setTimeout(() => this.toggleRecentChats(true), 500);
        }
    }

    // Проверка активной вкладки
    isSearchTabActive() {
        const searchTab = document.querySelector('.tab[data-tab="search"]');
        return searchTab && searchTab.classList.contains('active');
    }

    // Проверка есть ли текст в поиске
    hasSearchQuery() {
        const searchInput = document.getElementById('searchInput');
        return searchInput && searchInput.value.trim().length > 0;
    }

    // Прикрепление обработчиков к аватарам
    attachAvatarsEventListeners() {
        const avatarItems = document.querySelectorAll('.recent-chat-avatar-item');
        console.log(`🎯 Найдено ${avatarItems.length} аватаров для добавления обработчиков`);
        
        avatarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const chatId = item.dataset.chatId;
                const userId = item.dataset.userId;
                const chatName = item.dataset.chatName;
                
                console.log('🖱️ Клик по аватару:', { chatId, userId, chatName });
                
                this.openRecentChat(chatId, userId, chatName);
            });
        });
    }

    // ОТКРЫТИЕ ЧАТА - ГЛАВНАЯ ФУНКЦИЯ
    openRecentChat(chatId, userId, chatName) {
        console.log('🚀 ОТКРЫТИЕ ЧАТА:', { chatId, userId, chatName });
        
        // Обновляем время в недавних
        const chatIndex = this.recentChats.findIndex(c => c.id === chatId);
        if (chatIndex !== -1) {
            this.recentChats[chatIndex].timestamp = Date.now();
            this.saveRecentChats();
        }

        // СПОСОБ 1: Используем существующую функцию openChat
        if (typeof window.openChat === 'function') {
            console.log('✅ Способ 1: Используем window.openChat');
            try {
                window.openChat(userId, chatName, chatId);
                this.hideRecentChats();
                return;
            } catch (error) {
                console.error('❌ Ошибка в window.openChat:', error);
            }
        }

        // СПОСОБ 2: Используем глобальные переменные и прямой DOM
        console.log('✅ Способ 2: Прямое управление DOM');
        this.openChatDirect(chatId, userId, chatName);
    }

    // Прямое открытие чата через DOM
    openChatDirect(chatId, userId, chatName) {
        console.log('🎯 Прямое открытие чата через DOM');
        
        // Устанавливаем глобальные переменные
        window.currentChatWith = userId;
        window.currentChatWithName = chatName;
        window.currentChatId = chatId;
        
        console.log('📝 Установлены глобальные переменные:', {
            currentChatWith: window.currentChatWith,
            currentChatWithName: window.currentChatWithName,
            currentChatId: window.currentChatId
        });

        // Находим элементы
        const chatWrapper = document.getElementById('chatWrapper');
        const chatWindow = document.getElementById('chatWindow');
        
        console.log('🔍 Поиск элементов:', {
            chatWrapper: !!chatWrapper,
            chatWindow: !!chatWindow
        });

        if (!chatWrapper || !chatWindow) {
            console.error('❌ Не найдены элементы чата');
            return;
        }

        // Переключаем видимость
        chatWrapper.style.display = 'none';
        chatWindow.style.display = 'flex';
        
        console.log('🔄 Переключили видимость окон');

        // Обновляем заголовок чата
        this.updateChatHeader(chatName, this.recentChats.find(c => c.id === chatId)?.avatarColor);
        
        // Очищаем поиск и скрываем недавние
        this.hideRecentChats();
        
        // Загружаем сообщения если есть функция
        if (typeof window.loadMessages === 'function') {
            console.log('📨 Загружаем сообщения...');
            window.loadMessages(chatId);
        } else {
            console.log('ℹ️ Функция loadMessages не найдена');
        }

        console.log('✅ Чат успешно открыт!');
    }

    // Обновление заголовка чата
    updateChatHeader(chatName, avatarColor = null) {
        console.log('👤 Обновление заголовка чата:', chatName);
        
        const chatUserName = document.getElementById('chatUserName');
        const chatAvatarInitial = document.getElementById('chatAvatarInitial');
        const chatUserAvatar = document.getElementById('chatUserAvatar');
        
        if (chatUserName) {
            chatUserName.textContent = chatName;
            console.log('✅ Обновлено имя пользователя');
        }
        
        if (chatAvatarInitial) {
            chatAvatarInitial.textContent = chatName.charAt(0).toUpperCase();
            console.log('✅ Обновлена аватарка');
        }
        
        if (chatUserAvatar && avatarColor) {
            chatUserAvatar.style.background = avatarColor;
            console.log('✅ Обновлен цвет аватарки');
        }
        
        // Обновляем статус
        this.updateUserStatus();
    }

    // Обновление статуса пользователя
    updateUserStatus() {
        const chatUserStatus = document.getElementById('chatUserStatus');
        if (!chatUserStatus || !window.currentChatWith) return;

        console.log('🔄 Обновление статуса для:', window.currentChatWith);
        
        // Пытаемся получить статус из базы данных
        if (window.database && window.currentChatWith) {
            window.database.ref('profiles/' + window.currentChatWith).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    const user = snapshot.val();
                    const statusText = user.isOnline ? 
                        (user.status === 'online' ? 'Онлайн' : 
                         user.status === 'away' ? 'Отошёл' : 
                         user.status === 'busy' ? 'Занят' : 'Не в сети') : 'Не в сети';
                    chatUserStatus.textContent = statusText;
                    console.log('✅ Статус обновлен:', statusText);
                }
            }).catch(error => {
                console.error('❌ Ошибка получения статуса:', error);
                chatUserStatus.textContent = 'Не в сети';
            });
        } else {
            chatUserStatus.textContent = 'Не в сети';
        }
    }

    // Скрытие недавних чатов
    hideRecentChats() {
        this.toggleRecentChats(false);
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
    }

    // Интеграция с системой чатов
    integrateWithChatSystem() {
        console.log('🔗 Интеграция с системой чатов...');
        
        // Мониторим открытие чатов для добавления в недавние
        this.monitorChatOpening();
        
        // Загружаем существующие чаты
        this.loadExistingChats();
    }

    // Мониторинг открытия чатов
    monitorChatOpening() {
        console.log('👀 Мониторинг открытия чатов...');
        
        // Следим за кликами по элементам чатов
        document.addEventListener('click', (e) => {
            const chatItem = e.target.closest('.chat-item');
            const userItem = e.target.closest('.user-item');
            
            if (chatItem || userItem) {
                setTimeout(() => {
                    this.handleChatOpened();
                }, 100);
            }
        });
    }

    // Обработчик открытия чата
    handleChatOpened() {
        const chatUserName = document.getElementById('chatUserName');
        
        if (chatUserName && chatUserName.textContent && window.currentChatWith) {
            const chatName = chatUserName.textContent;
            const chatId = window.currentChatWith;
            
            console.log('💬 Чат открыт, добавляем в недавние:', chatName, chatId);
            
            // Добавляем в недавние
            this.addToRecentChats(chatId, chatName);
        }
    }

    // Загрузка существующих чатов из списка
    loadExistingChats() {
        setTimeout(() => {
            const chatsList = document.getElementById('chatsList');
            if (chatsList) {
                console.log('📋 Загрузка существующих чатов...');
                Array.from(chatsList.children).forEach(chatItem => {
                    if (chatItem.classList.contains('chat-item')) {
                        const chatName = chatItem.querySelector('.chat-item-name');
                        const chatId = chatItem.dataset.chatId;
                        
                        if (chatName && chatId) {
                            this.addToRecentChats(chatId, chatName.textContent);
                        }
                    }
                });
            }
        }, 2000);
    }

    // Экранирование HTML
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ==================== ГЛОБАЛЬНЫЕ ФУНКЦИИ ====================

let recentChatsSystem = null;

// Инициализация системы
function initRecentChatsSystem() {
    if (!recentChatsSystem) {
        console.log('🚀 ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ НЕДАВНИХ ЧАТОВ');
        recentChatsSystem = new RecentChatsSearch();
        
        // Добавляем глобальные функции
        window.QuantumRecentChats = {
            addChatToRecent: addChatToRecent,
            openChatFromRecent: openChatFromRecent
        };
        
        console.log('✅ СИСТЕМА НЕДАВНИХ ЧАТОВ ГОТОВА');
    }
    return recentChatsSystem;
}

// Глобальная функция для добавления чата в недавние
function addChatToRecent(chatId, chatName, avatarColor = null, lastMessage = '', isGroup = false) {
    if (!recentChatsSystem) {
        console.warn('⚠️ Система не инициализирована');
        return false;
    }
    return recentChatsSystem.addToRecentChats(chatId, chatName, avatarColor, lastMessage, isGroup);
}

// Глобальная функция для открытия чата из недавних
function openChatFromRecent(userId, userName, chatId = null) {
    if (!recentChatsSystem) return false;
    
    console.log('🔓 Открытие чата через глобальную функцию:', {userId, userName, chatId});
    recentChatsSystem.openRecentChat(chatId, userId, userName);
    return true;
}

// Автоматическая инициализация с задержкой
function autoInitialize() {
    console.log('⏳ Автоматическая инициализация...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📄 DOM загружен, инициализируем систему...');
            setTimeout(initRecentChatsSystem, 2000);
        });
    } else {
        console.log('📄 DOM уже загружен, инициализируем систему...');
        setTimeout(initRecentChatsSystem, 2000);
    }
}

// Запускаем автоматическую инициализацию
autoInitialize();

// Добавляем глобальную функцию для ручного открытия
window.openRecentChat = function(chatId, userId, chatName) {
    console.log('🔓 Ручное открытие чата через window.openRecentChat');
    if (recentChatsSystem) {
        recentChatsSystem.openRecentChat(chatId, userId, chatName);
    } else {
        console.error('❌ Система не инициализирована');
    }
};