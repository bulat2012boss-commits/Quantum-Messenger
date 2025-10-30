// channels.js - Система каналов для Quantum Messenger v3.5

// Элементы DOM для каналов
let channelsTab = null;
let channelsList = null;
let createChannelBtn = null;
let channelsContainer = null;

// Переменные состояния каналов
let currentChannel = null;
let channelsListener = null;
let userChannels = [];
let channelMessagesListener = null;
let activeModal = null;
let userRoleInCurrentChannel = null;
let userStatuses = {};
let mobileMenuBtn = null;
let channelPostsListener = null;

// Инициализация системы каналов
function initChannelsSystem() {
    console.log("Инициализация системы каналов v3.5...");
    
    // Ждем полной загрузки DOM
    if (!document.querySelector('.tabs')) {
        console.log("DOM еще не готов, повторная попытка через 500мс...");
        setTimeout(initChannelsSystem, 500);
        return;
    }
    
    // Создаем вкладку для каналов
    createChannelsTab();
    
    // Добавляем обработчики событий
    setupChannelsEventListeners();
    
    // Загружаем статусы пользователей
    loadUserStatuses();
    
    // Создаем плавающую кнопку
    
    
    console.log("✅ Система каналов v3.5 инициализирована");
}

// Создание плавающей кнопки меню
function createMobileMenuButton() {
    // Удаляем существующую кнопку если есть
    if (mobileMenuBtn) {
        mobileMenuBtn.remove();
    }
    
    mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.innerHTML = '<i class="fas fa-broadcast-tower"></i>';
    mobileMenuBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(to right, #4facfe, #00f2fe);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        z-index: 998;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        transition: transform 0.3s ease, opacity 0.3s ease;
    `;
    mobileMenuBtn.id = 'mobileMenuBtn';
    mobileMenuBtn.className = 'mobile-menu-btn';
    
    mobileMenuBtn.addEventListener('click', function() {
        showMobileChannelsMenu();
    });
    
    // Добавляем анимацию при наведении
    mobileMenuBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    mobileMenuBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(mobileMenuBtn);
}

// Показать/скрыть плавающую кнопку
function toggleMobileMenuButton(show) {
    if (mobileMenuBtn) {
        if (show) {
            mobileMenuBtn.style.display = 'flex';
            setTimeout(() => {
                mobileMenuBtn.style.opacity = '1';
                mobileMenuBtn.style.transform = 'scale(1)';
            }, 10);
        } else {
            mobileMenuBtn.style.opacity = '0';
            mobileMenuBtn.style.transform = 'scale(0.8)';
            setTimeout(() => {
                mobileMenuBtn.style.display = 'none';
            }, 300);
        }
    }
}

// Мобильное меню каналов
function showMobileChannelsMenu() {
    closeActiveModal();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText = `
        z-index: 1000;
        display: flex;
        align-items: flex-end;
        background: rgba(0,0,0,0.5);
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="width: 100%; margin: 0; border-radius: 20px 20px 0 0; max-height: 70vh; transform: translateY(100%); animation: slideUp 0.3s ease forwards;">
            <div style="padding: 20px; text-align: center; border-bottom: 1px solid var(--border-color);">
                <h3 style="margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-broadcast-tower" style="color: #9b59b6;"></i>
                    Быстрый доступ к каналам
                </h3>
            </div>
            <div style="padding: 20px;">
                <button id="mobileCreateChannel" style="width: 100%; padding: 15px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 10px; margin-bottom: 10px; font-size: 16px; cursor: pointer; transition: background 0.3s ease;">
                    <i class="fas fa-plus"></i> Создать канал
                </button>
                <button id="mobileJoinChannel" style="width: 100%; padding: 15px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 10px; font-size: 16px; cursor: pointer; transition: background 0.3s ease;">
                    <i class="fas fa-sign-in-alt"></i> Присоединиться
                </button>
                <button id="mobileViewChannels" style="width: 100%; padding: 15px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 10px; margin-top: 10px; font-size: 16px; cursor: pointer; transition: background 0.3s ease;">
                    <i class="fas fa-list"></i> Мои каналы
                </button>
            </div>
            <div style="padding: 15px; border-top: 1px solid var(--border-color);">
                <button id="closeMobileMenu" style="width: 100%; padding: 12px; background: transparent; color: var(--text-color); border: 1px solid var(--border-color); border-radius: 10px; font-size: 14px; cursor: pointer; transition: background 0.3s ease;">
                    Закрыть
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    activeModal = modal;
    
    // Добавляем анимации для кнопок
    const buttons = modal.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.opacity = '0.8';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    });
    
    // Обработчики для мобильного меню
    document.getElementById('mobileCreateChannel').addEventListener('click', function() {
        closeActiveModal();
        setTimeout(() => showCreateChannelModal(), 300);
    });
    
    document.getElementById('mobileJoinChannel').addEventListener('click', function() {
        closeActiveModal();
        setTimeout(() => showJoinChannelModal(), 300);
    });
    
    document.getElementById('mobileViewChannels').addEventListener('click', function() {
        closeActiveModal();
        switchToChannelsTab();
    });
    
    document.getElementById('closeMobileMenu').addEventListener('click', function() {
        closeActiveModal();
    });
    
    // Закрытие при клике вне меню
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeActiveModal();
        }
    });
    
    // Закрытие по ESC
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            closeActiveModal();
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
}

// Загрузка статусов пользователей
function loadUserStatuses() {
    if (!database) {
        console.error("База данных не инициализирована");
        return;
    }
    
    database.ref('profiles').on('value', (snapshot) => {
        if (snapshot.exists()) {
            const profiles = snapshot.val();
            userStatuses = {};
            
            Object.keys(profiles).forEach(userId => {
                const profile = profiles[userId];
                userStatuses[userId] = {
                    isOnline: profile.isOnline || false,
                    status: profile.status || 'offline',
                    lastOnline: profile.lastOnline || Date.now()
                };
            });
        }
    });
}

// Создание вкладки каналов
function createChannelsTab() {
    // Находим контейнер вкладок
    const tabsContainer = document.querySelector('.tabs');
    const tabContentsContainer = document.querySelector('.main-container .chat-wrapper');
    
    if (!tabsContainer || !tabContentsContainer) {
        console.error("❌ Не найден контейнер вкладок");
        setTimeout(createChannelsTab, 100);
        return;
    }
    
    // Проверяем, не создана ли уже вкладка
    if (document.querySelector('.tab[data-tab="channels"]')) {
        console.log("✅ Вкладка каналов уже существует");
        channelsTab = document.querySelector('.tab[data-tab="channels"]');
        channelsContainer = document.getElementById('tab-channels');
        return;
    }
    
    // Создаем вкладку "Каналы"
    channelsTab = document.createElement('div');
    channelsTab.className = 'tab';
    channelsTab.setAttribute('data-tab', 'channels');
    channelsTab.innerHTML = '<i class="fas fa-broadcast-tower"></i> Каналы';
    
    // Добавляем вкладку в контейнер
    tabsContainer.appendChild(channelsTab);
    
    // Создаем контент для вкладки каналов
    channelsContainer = document.createElement('div');
    channelsContainer.className = 'tab-content';
    channelsContainer.id = 'tab-channels';
    
    channelsContainer.innerHTML = `
        <div class="channels-actions" style="padding: 15px; display: flex; gap: 10px; border-bottom: 1px solid var(--border-color); flex-wrap: wrap;">
            <button id="createChannelBtn" style="flex: 1; min-width: 140px; padding: 12px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.3s ease;">
                <i class="fas fa-plus"></i> Создать канал
            </button>
            <button id="joinChannelBtn" style="flex: 1; min-width: 140px; padding: 12px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 10px; cursor: pointer; font-size: 14px; transition: background 0.3s ease;">
                <i class="fas fa-sign-in-alt"></i> Присоединиться
            </button>
        </div>
        <div class="channels-list" id="channelsList" style="flex: 1; overflow-y: auto; padding: 10px;">
            <div class="empty-chat">
                <i class="fas fa-broadcast-tower" style="font-size: 48px; color: #9b59b6; margin-bottom: 15px;"></i>
                <p>У вас пока нет каналов</p>
                <p style="font-size: 14px; margin-top: 10px; opacity: 0.7;">Создайте свой канал или присоединитесь к существующему</p>
            </div>
        </div>
        <div class="channels-footer" style="padding: 10px 15px; border-top: 1px solid var(--border-color); text-align: center;">
            <span style="font-size: 12px; opacity: 0.7;">Quantum Messenger Channels v3.5</span>
        </div>
    `;
    
    // Добавляем контент в контейнер
    tabContentsContainer.appendChild(channelsContainer);
    
    // Инициализируем элементы
    channelsList = document.getElementById('channelsList');
    createChannelBtn = document.getElementById('createChannelBtn');
    
    console.log("✅ Вкладка каналов создана успешно");
}

// Настройка обработчиков событий для каналов
function setupChannelsEventListeners() {
    // Обработчик переключения на вкладку каналов
    if (channelsTab) {
        channelsTab.addEventListener('click', function() {
            switchToChannelsTab();
        });
    }
    
    // Обработчик создания канала
    if (createChannelBtn) {
        createChannelBtn.addEventListener('click', showCreateChannelModal);
        
        // Добавляем анимацию при наведении
        createChannelBtn.addEventListener('mouseenter', function() {
            this.style.opacity = '0.9';
        });
        createChannelBtn.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    }
    
    // Обработчик присоединения к каналу
    const joinChannelBtn = document.getElementById('joinChannelBtn');
    if (joinChannelBtn) {
        joinChannelBtn.addEventListener('click', showJoinChannelModal);
        
        // Добавляем анимацию при наведении
        joinChannelBtn.addEventListener('mouseenter', function() {
            this.style.opacity = '0.9';
        });
        joinChannelBtn.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    }
    
    // Глобальный обработчик переключения вкладок
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('tab')) {
            const tabType = e.target.getAttribute('data-tab');
            
            // Если переключаемся на другую вкладку (не каналы)
            if (tabType !== 'channels' && currentChannel === null) {
                // Скрываем вкладку каналов
                if (channelsContainer) {
                    channelsContainer.classList.remove('active');
                }
            }
        }
    });
    
    console.log("✅ Обработчики событий каналов настроены");
}

// Переключение на вкладку каналов
function switchToChannelsTab() {
    // Показываем плавающую кнопку
    toggleMobileMenuButton(true);
    
    // Убираем активный класс у всех вкладок и контента
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Добавляем активный класс к выбранной вкладке и контенту
    if (channelsTab) channelsTab.classList.add('active');
    if (channelsContainer) channelsContainer.classList.add('active');
    
    // Загружаем список каналов
    loadUserChannels();
    
    console.log("✅ Переключено на вкладку каналов");
}

// Загрузка каналов пользователя
function loadUserChannels() {
    if (!userId) {
        console.log("⚠️ User ID не установлен");
        channelsList.innerHTML = `
            <div class="empty-chat">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Требуется авторизация</p>
                <p style="font-size: 14px; margin-top: 10px;">Войдите в систему для доступа к каналам</p>
            </div>
        `;
        return;
    }
    
    if (!channelsList) {
        console.error("❌ channelsList не инициализирован");
        return;
    }
    
    channelsList.innerHTML = `
        <div class="empty-chat">
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <p>Загрузка каналов...</p>
        </div>
    `;
    
    // Удаляем предыдущий слушатель, если он есть
    if (channelsListener) {
        database.ref('channels').off('value', channelsListener);
    }
    
    // Слушаем изменения в каналах
    channelsListener = database.ref('channels').orderByChild('lastMessageTime').on('value', (snapshot) => {
        if (!channelsList) return;
        
        channelsList.innerHTML = '';
        userChannels = [];
        
        if (!snapshot.exists()) {
            channelsList.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-broadcast-tower"></i>
                    <p>Каналы не найдены</p>
                    <p style="font-size: 14px; margin-top: 10px;">Создайте первый канал!</p>
                </div>
            `;
            return;
        }
        
        const channels = snapshot.val();
        let hasChannels = false;
        
        // Собираем каналы, где пользователь является участником
        Object.keys(channels).forEach(channelId => {
            const channel = channels[channelId];
            
            // Проверяем, является ли пользователь участником канала
            if (channel.participants && channel.participants[userId]) {
                hasChannels = true;
                userChannels.push({
                    id: channelId,
                    ...channel
                });
            }
        });
        
        // Сортируем каналы по времени последнего сообщения
        userChannels.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
        
        // Отображаем каналы
        userChannels.forEach(channelData => {
            addChannelToList(channelData);
        });
        
        if (!hasChannels) {
            channelsList.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-broadcast-tower"></i>
                    <p>У вас пока нет каналов</p>
                    <p style="font-size: 14px; margin-top: 10px;">Создайте свой канал или присоединитесь к существующему</p>
                </div>
            `;
        }
    }, (error) => {
        console.error("❌ Ошибка загрузки каналов:", error);
        channelsList.innerHTML = `
            <div class="empty-chat">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Ошибка загрузки каналов</p>
                <p style="font-size: 14px; margin-top: 10px;">Попробуйте обновить страницу</p>
            </div>
        `;
    });
}

// Добавление канала в список
function addChannelToList(channelData) {
    const channelItem = document.createElement('div');
    channelItem.classList.add('chat-item');
    channelItem.dataset.channelId = channelData.id;
    channelItem.style.cssText = `
        cursor: pointer;
        transition: background 0.3s ease;
        border-radius: 10px;
        margin-bottom: 5px;
    `;
    
    const lastMessage = channelData.lastMessage || 'Нет сообщений';
    const lastMessageTime = channelData.lastMessageTime ? new Date(channelData.lastMessageTime) : new Date();
    const timeString = formatTime(lastMessageTime);
    const membersCount = channelData.participants ? Object.keys(channelData.participants).length : 0;
    
    // Определяем роль пользователя в канале
    const userRole = channelData.participants[userId]?.role || 'member';
    const roleBadge = userRole === 'admin' ? '<span class="admin-badge" title="Администратор" style="color: #ff6b6b; font-size: 12px;">👑</span>' : '';
    
    // Бейдж для каналов только для чтения
    const readOnlyBadge = channelData.settings?.readOnly ? '<span class="readonly-badge" title="Только чтение" style="color: #3498db; font-size: 12px;">👁️</span>' : '';

    channelItem.innerHTML = `
        <div class="chat-item-avatar" style="background: #9b59b6; position: relative; border-radius: 10px;">
            <i class="fas fa-broadcast-tower"></i>
        </div>
        <div class="chat-item-info" style="flex: 1;">
            <div class="chat-item-header">
                <div class="chat-item-name">${channelData.name} ${roleBadge} ${readOnlyBadge}</div>
                <div class="chat-item-time">${timeString}</div>
            </div>
            <div class="chat-item-last-message">${lastMessage}</div>
            <div class="channel-meta-info" style="display: flex; gap: 15px; font-size: 11px; opacity: 0.7; margin-top: 2px;">
                <span class="members-count"><i class="fas fa-users"></i> ${membersCount}</span>
                <span class="channel-creator">Создатель: ${channelData.creatorName || 'Неизвестно'}</span>
            </div>
        </div>
    `;
    
    // Анимация при наведении
    channelItem.addEventListener('mouseenter', function() {
        this.style.background = 'var(--hover-color)';
    });
    
    channelItem.addEventListener('mouseleave', function() {
        this.style.background = '';
    });
    
    channelItem.addEventListener('click', () => {
        openChannel(channelData.id, channelData.name);
    });
    
    // Контекстное меню для канала
    channelItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showChannelContextMenu(e, channelData);
    });
    
    if (channelsList) {
        channelsList.appendChild(channelItem);
    }
}

// Контекстное меню для канала
function showChannelContextMenu(e, channelData) {
    // Удаляем предыдущее контекстное меню
    const existingMenu = document.getElementById('channelContextMenu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const contextMenu = document.createElement('div');
    contextMenu.id = 'channelContextMenu';
    
    const posX = e.pageX;
    const posY = e.pageY;
    
    contextMenu.style.cssText = `
        position: fixed;
        left: ${posX}px;
        top: ${posY}px;
        background: var(--header-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 5px;
        z-index: 10000;
        box-shadow: var(--shadow);
        min-width: 150px;
        animation: fadeIn 0.2s ease;
    `;
    
    const menuItems = [
        {
            icon: 'fa-info-circle',
            text: 'Информация',
            action: () => showChannelInfo(channelData.id)
        },
        {
            icon: 'fa-users',
            text: 'Участники',
            action: () => showChannelMembers(channelData.id)
        },
        {
            icon: 'fa-sign-out-alt',
            text: 'Покинуть',
            action: () => leaveChannel(channelData.id),
            danger: true
        }
    ];
    
    // Добавляем опции для администраторов
    const userRole = channelData.participants[userId]?.role;
    if (userRole === 'admin') {
        menuItems.splice(2, 0, {
            icon: 'fa-cog',
            text: 'Настройки',
            action: () => showChannelSettings(channelData.id)
        });
        menuItems.splice(3, 0, {
            icon: 'fa-user-shield',
            text: 'Управление участниками',
            action: () => showManageMembers(channelData.id)
        });
    }
    
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = `chat-menu-item ${item.danger ? 'danger' : ''}`;
        menuItem.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 5px;
            transition: background 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        menuItem.innerHTML = `
            <i class="fas ${item.icon}" style="width: 16px;"></i> ${item.text}
        `;
        menuItem.addEventListener('click', item.action);
        
        // Анимация при наведении
        menuItem.addEventListener('mouseenter', function() {
            this.style.background = item.danger ? 'rgba(231, 76, 60, 0.1)' : 'var(--hover-color)';
        });
        menuItem.addEventListener('mouseleave', function() {
            this.style.background = '';
        });
        
        contextMenu.appendChild(menuItem);
    });
    
    document.body.appendChild(contextMenu);
    
    // Закрытие меню при клике вне его
    setTimeout(() => {
        const closeMenu = () => {
            contextMenu.remove();
            document.removeEventListener('click', closeMenu);
        };
        document.addEventListener('click', closeMenu);
    }, 100);
}

// Показ модального окна создания канала
function showCreateChannelModal() {
    // Закрываем предыдущее модальное окно если есть
    closeActiveModal();
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '1000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; animation: scaleIn 0.3s ease;">
            <h3 style="margin-bottom: 15px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                <i class="fas fa-plus" style="color: #4facfe;"></i>
                Создание канала
            </h3>
            <div style="margin-bottom: 15px;">
                <input type="text" id="channelNameInput" placeholder="Название канала" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); font-size: 14px; transition: border-color 0.3s ease;">
                <textarea id="channelDescriptionInput" placeholder="Описание канала (необязательно)" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); height: 80px; resize: vertical; font-size: 14px; transition: border-color 0.3s ease;"></textarea>
                <div style="margin-top: 15px;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; padding: 8px; border-radius: 5px; transition: background 0.2s ease;">
                        <input type="checkbox" id="channelPublicToggle" checked>
                        <i class="fas fa-globe" style="color: #4facfe;"></i>
                        Публичный канал
                    </label>
                    <p style="font-size: 12px; opacity: 0.7; margin-top: 5px; margin-left: 24px;">
                        Публичные каналы видны всем пользователям, приватные - только по приглашению
                    </p>
                </div>
                <div style="margin-top: 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; padding: 8px; border-radius: 5px; transition: background 0.2s ease;">
                        <input type="checkbox" id="readOnlyToggle">
                        <i class="fas fa-eye" style="color: #3498db;"></i>
                        Режим только для чтения
                    </label>
                    <p style="font-size: 12px; opacity: 0.7; margin-top: 5px; margin-left: 24px;">
                        В этом режиме только администраторы могут отправлять сообщения
                    </p>
                </div>
                <div style="margin-top: 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; padding: 8px; border-radius: 5px; transition: background 0.2s ease;">
                        <input type="checkbox" id="allowPostsToggle" checked>
                        <i class="fas fa-edit" style="color: #9b59b6;"></i>
                        Разрешить посты
                    </label>
                    <p style="font-size: 12px; opacity: 0.7; margin-top: 5px; margin-left: 24px;">
                        Пользователи могут создавать посты с реакциями
                    </p>
                </div>
                <div style="margin-top: 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; padding: 8px; border-radius: 5px; transition: background 0.2s ease;">
                        <input type="checkbox" id="allowFilesToggle" checked>
                        <i class="fas fa-file-upload" style="color: #2ecc71;"></i>
                        Разрешить отправку файлов
                    </label>
                    <p style="font-size: 12px; opacity: 0.7; margin-top: 5px; margin-left: 24px;">
                        Пользователи могут отправлять файлы, изображения и медиа
                    </p>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn primary" id="confirmCreateChannelBtn" style="transition: all 0.3s ease;">
                    <i class="fas fa-plus"></i> Создать канал
                </button>
                <button class="modal-btn secondary" id="cancelCreateChannelBtn" style="transition: all 0.3s ease;">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    activeModal = modal;
    
    // Добавляем анимации для инпутов
    const inputs = modal.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#4facfe';
        });
        input.addEventListener('blur', function() {
            this.style.borderColor = 'var(--border-color)';
        });
    });
    
    // Добавляем анимации для чекбоксов
    const labels = modal.querySelectorAll('label');
    labels.forEach(label => {
        label.addEventListener('mouseenter', function() {
            this.style.background = 'var(--hover-color)';
        });
        label.addEventListener('mouseleave', function() {
            this.style.background = '';
        });
    });
    
    // Обработчики для модального окна
    document.getElementById('confirmCreateChannelBtn').addEventListener('click', createChannel);
    document.getElementById('cancelCreateChannelBtn').addEventListener('click', () => {
        closeActiveModal();
    });
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeActiveModal();
        }
    });
    
    // Закрытие по ESC
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            closeActiveModal();
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    // Фокус на поле ввода названия
    setTimeout(() => {
        const nameInput = document.getElementById('channelNameInput');
        if (nameInput) nameInput.focus();
    }, 100);
}

// Создание канала
function createChannel() {
    const channelNameInput = document.getElementById('channelNameInput');
    const channelDescriptionInput = document.getElementById('channelDescriptionInput');
    const channelPublicToggle = document.getElementById('channelPublicToggle');
    const readOnlyToggle = document.getElementById('readOnlyToggle');
    const allowPostsToggle = document.getElementById('allowPostsToggle');
    const allowFilesToggle = document.getElementById('allowFilesToggle');
    
    const channelName = channelNameInput.value.trim();
    const channelDescription = channelDescriptionInput.value.trim();
    const isPublic = channelPublicToggle.checked;
    const isReadOnly = readOnlyToggle.checked;
    const allowPosts = allowPostsToggle.checked;
    const allowFiles = allowFilesToggle.checked;
    
    if (!channelName) {
        showNotification("Введите название канала");
        channelNameInput.focus();
        return;
    }
    
    // Блокируем кнопку создания для предотвращения дублирования
    const createBtn = document.getElementById('confirmCreateChannelBtn');
    createBtn.disabled = true;
    createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Создание...';
    createBtn.style.opacity = '0.7';
    
    const channelId = 'channel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    
    const channelData = {
        id: channelId,
        name: channelName,
        description: channelDescription || '',
        creatorId: userId,
        creatorName: currentUser,
        createdAt: timestamp,
        participants: {
            [userId]: {
                id: userId,
                name: currentUser,
                joinedAt: timestamp,
                role: 'admin'
            }
        },
        lastMessage: "Канал создан",
        lastMessageTime: timestamp,
        isPublic: isPublic,
        settings: {
            allowInvites: true,
            allowMessages: true,
            slowMode: false,
            readOnly: isReadOnly,
            allowPosts: allowPosts,
            allowFiles: allowFiles
        }
    };
    
    // Сохраняем канал в базе данных
    database.ref('channels/' + channelId).set(channelData)
        .then(() => {
            showNotification("✅ Канал создан успешно!");
            
            // Закрываем модальное окно СРАЗУ
            closeActiveModal();
            
            // Обновляем список каналов
            loadUserChannels();
            
            // Открываем созданный канал
            setTimeout(() => {
                openChannel(channelId, channelName);
            }, 500);
        })
        .catch((error) => {
            console.error("❌ Ошибка создания канала:", error);
            showNotification("❌ Ошибка создания канала");
            
            // Разблокируем кнопку
            createBtn.disabled = false;
            createBtn.innerHTML = '<i class="fas fa-plus"></i> Создать канал';
            createBtn.style.opacity = '1';
        });
}

// Показ модального окна присоединения к каналу
function showJoinChannelModal() {
    // Закрываем предыдущее модальное окно если есть
    closeActiveModal();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '1000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; animation: scaleIn 0.3s ease;">
            <h3 style="margin-bottom: 15px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                <i class="fas fa-sign-in-alt" style="color: #4facfe;"></i>
                Присоединиться к каналу
            </h3>
            <div style="margin-bottom: 15px;">
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <input type="text" id="channelSearchJoinInput" placeholder="Поиск по названию канала..." style="flex: 1; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); font-size: 14px; transition: border-color 0.3s ease;">
                    <button id="searchJoinChannelBtn" style="padding: 12px 15px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <h4 style="margin-bottom: 10px; color: var(--text-color); display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-key"></i> Или введите ID канала
                    </h4>
                    <input type="text" id="channelIdInput" placeholder="ID канала" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); font-size: 14px; transition: border-color 0.3s ease;">
                    <p style="font-size: 12px; opacity: 0.7; margin-top: 5px;">Попросите ID канала у администратора</p>
                </div>
                
                <div id="searchResultsContainer" style="display: none;">
                    <h4 style="margin-bottom: 10px; color: var(--text-color);">Результаты поиска</h4>
                    <div id="searchResultsList" style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; background: var(--input-bg);">
                    </div>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn primary" id="confirmJoinChannelBtn" style="transition: all 0.3s ease;">Присоединиться по ID</button>
                <button class="modal-btn secondary" id="cancelJoinChannelBtn" style="transition: all 0.3s ease;">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    activeModal = modal;
    
    // Добавляем анимации для инпутов
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#4facfe';
        });
        input.addEventListener('blur', function() {
            this.style.borderColor = 'var(--border-color)';
        });
    });
    
    // Обработчики для модального окна
    document.getElementById('confirmJoinChannelBtn').addEventListener('click', joinChannelById);
    document.getElementById('cancelJoinChannelBtn').addEventListener('click', () => {
        closeActiveModal();
    });
    
    document.getElementById('searchJoinChannelBtn').addEventListener('click', searchChannelsToJoin);
    document.getElementById('channelSearchJoinInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchChannelsToJoin();
    });
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeActiveModal();
        }
    });
    
    // Закрытие по ESC
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            closeActiveModal();
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    // Фокус на поле поиска
    setTimeout(() => {
        document.getElementById('channelSearchJoinInput').focus();
    }, 100);
}

// Поиск каналов для присоединения
function searchChannelsToJoin() {
    const searchTerm = document.getElementById('channelSearchJoinInput').value.trim();
    const resultsContainer = document.getElementById('searchResultsContainer');
    const resultsList = document.getElementById('searchResultsList');
    
    if (!searchTerm) {
        showNotification("Введите поисковый запрос");
        return;
    }
    
    if (searchTerm.length < 3) {
        showNotification("Введите минимум 3 символа для поиска");
        return;
    }
    
    resultsList.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <p style="margin-top: 10px; opacity: 0.7;">Поиск каналов...</p>
        </div>
    `;
    
    resultsContainer.style.display = 'block';
    
    // Ищем публичные каналы по названию
    database.ref('channels').orderByChild('isPublic').equalTo(true).once('value')
        .then((snapshot) => {
            resultsList.innerHTML = '';
            
            if (!snapshot.exists()) {
                resultsList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">Каналы не найдены</p>';
                return;
            }
            
            const channels = snapshot.val();
            let foundChannels = false;
            const searchLower = searchTerm.toLowerCase();
            
            Object.keys(channels).forEach(channelId => {
                const channel = channels[channelId];
                
                // Пропускаем каналы, где пользователь уже участник
                if (channel.participants && channel.participants[userId]) {
                    return;
                }
                
                const channelName = (channel.name || '').toLowerCase();
                const channelDescription = (channel.description || '').toLowerCase();
                
                // Ищем по названию и описанию
                if (channelName.includes(searchLower) || channelDescription.includes(searchLower)) {
                    foundChannels = true;
                    
                    const channelElement = document.createElement('div');
                    channelElement.className = 'user-item';
                    channelElement.style.cssText = `
                        padding: 12px;
                        margin-bottom: 8px;
                        cursor: pointer;
                        border: 1px solid var(--border-color);
                        border-radius: 10px;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    `;
                    
                    const readOnlyBadge = channel.settings?.readOnly ? '<span style="color: #ff6b6b; font-size: 10px; margin-left: 5px;">👁️</span>' : '';
                    const membersCount = channel.participants ? Object.keys(channel.participants).length : 0;
                    
                    channelElement.innerHTML = `
                        <div class="user-item-avatar" style="background: #9b59b6; width: 40px; height: 40px; border-radius: 10px; font-size: 16px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-broadcast-tower"></i>
                        </div>
                        <div class="user-item-info" style="flex: 1;">
                            <div class="user-item-name" style="font-size: 14px; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                                ${channel.name} ${readOnlyBadge}
                            </div>
                            <div class="user-item-status" style="font-size: 12px; opacity: 0.8;">Участников: ${membersCount}</div>
                            <div class="user-item-status" style="font-size: 11px; opacity: 0.7;">${channel.description || 'Нет описания'}</div>
                            <div class="user-item-status" style="font-size: 10px; opacity: 0.5;">ID: ${channelId}</div>
                        </div>
                        <button class="join-search-channel-btn" data-channel-id="${channelId}" style="padding: 8px 15px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 8px; font-size: 12px; cursor: pointer; white-space: nowrap; transition: all 0.3s ease;">
                            Присоединиться
                        </button>
                    `;
                    
                    // Анимация при наведении
                    channelElement.addEventListener('mouseenter', function() {
                        this.style.transform = 'translateY(-2px)';
                        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    });
                    
                    channelElement.addEventListener('mouseleave', function() {
                        this.style.transform = 'translateY(0)';
                        this.style.boxShadow = 'none';
                    });
                    
                    resultsList.appendChild(channelElement);
                }
            });
            
            if (!foundChannels) {
                resultsList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">Каналы по вашему запросу не найдены</p>';
            }
            
            // Добавляем обработчики для кнопок присоединения
            document.querySelectorAll('.join-search-channel-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const channelId = this.getAttribute('data-channel-id');
                    joinChannelFromSearch(channelId);
                });
                
                // Анимация кнопки
                btn.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.05)';
                });
                btn.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                });
            });
            
            // Добавляем обработчики для клика по самому элементу канала
            document.querySelectorAll('.user-item').forEach(item => {
                const joinBtn = item.querySelector('.join-search-channel-btn');
                if (joinBtn) {
                    item.addEventListener('click', function(e) {
                        if (e.target !== joinBtn && !joinBtn.contains(e.target)) {
                            const channelId = joinBtn.getAttribute('data-channel-id');
                            joinChannelFromSearch(channelId);
                        }
                    });
                }
            });
        })
        .catch((error) => {
            console.error("Ошибка поиска каналов:", error);
            resultsList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">Ошибка поиска</p>';
        });
}

// Присоединение к каналу из поиска
function joinChannelFromSearch(channelId) {
    // Блокируем все кнопки присоединения
    document.querySelectorAll('.join-search-channel-btn').forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.style.opacity = '0.7';
    });
    
    // Добавляем пользователя в участники
    const updates = {};
    updates[`channels/${channelId}/participants/${userId}`] = {
        id: userId,
        name: currentUser,
        joinedAt: Date.now(),
        role: 'member'
    };
    
    database.ref().update(updates)
        .then(() => {
            showNotification("✅ Вы успешно присоединились к каналу!");
            
            // Закрываем модальное окно
            closeActiveModal();
            
            // Переключаемся на вкладку каналов и обновляем список
            if (channelsTab) {
                switchToChannelsTab();
            }
        })
        .catch((error) => {
            console.error("❌ Ошибка присоединения к каналу:", error);
            showNotification("❌ Ошибка присоединения к каналу");
            
            // Разблокируем кнопки
            document.querySelectorAll('.join-search-channel-btn').forEach(btn => {
                btn.disabled = false;
                btn.innerHTML = 'Присоединиться';
                btn.style.opacity = '1';
            });
        });
}

// Присоединение к каналу по ID
function joinChannelById() {
    const channelIdInput = document.getElementById('channelIdInput');
    const channelId = channelIdInput.value.trim();
    
    if (!channelId) {
        showNotification("Введите ID канала");
        channelIdInput.focus();
        return;
    }
    
    // Блокируем кнопку
    const joinBtn = document.getElementById('confirmJoinChannelBtn');
    joinBtn.disabled = true;
    joinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Присоединение...';
    joinBtn.style.opacity = '0.7';
    
    // Проверяем существование канала
    database.ref('channels/' + channelId).once('value')
        .then((snapshot) => {
            if (!snapshot.exists()) {
                showNotification("❌ Канал не найден");
                joinBtn.disabled = false;
                joinBtn.innerHTML = 'Присоединиться по ID';
                joinBtn.style.opacity = '1';
                return;
            }
            
            const channel = snapshot.val();
            
            // Проверяем, не является ли пользователь уже участником
            if (channel.participants && channel.participants[userId]) {
                showNotification("⚠️ Вы уже являетесь участником этого канала");
                joinBtn.disabled = false;
                joinBtn.innerHTML = 'Присоединиться по ID';
                joinBtn.style.opacity = '1';
                return;
            }
            
            // Проверяем, приватный ли канал
            if (!channel.isPublic) {
                showNotification("🔒 Это приватный канал. Требуется приглашение.");
                joinBtn.disabled = false;
                joinBtn.innerHTML = 'Присоединиться по ID';
                joinBtn.style.opacity = '1';
                return;
            }
            
            // Добавляем пользователя в участники
            const updates = {};
            updates[`channels/${channelId}/participants/${userId}`] = {
                id: userId,
                name: currentUser,
                joinedAt: Date.now(),
                role: 'member'
            };
            
            return database.ref().update(updates);
        })
        .then(() => {
            showNotification("✅ Вы успешно присоединились к каналу!");
            
            // Закрываем модальное окно
            closeActiveModal();
            
            // Переключаемся на вкладку каналов и обновляем список
            if (channelsTab) {
                switchToChannelsTab();
            }
        })
        .catch((error) => {
            console.error("❌ Ошибка присоединения к каналу:", error);
            showNotification("❌ Ошибка присоединения к каналу");
            joinBtn.disabled = false;
            joinBtn.innerHTML = 'Присоединиться по ID';
            joinBtn.style.opacity = '1';
        });
}

// Открытие канала
function openChannel(channelId, channelName) {
    currentChannel = channelId;
    
    // Скрываем плавающую кнопку при входе в канал
    toggleMobileMenuButton(false);
    
    // Скрываем ВСЕ контейнеры чатов и вкладок
    const mainContainer = document.querySelector('.main-container');
    const allChatWrappers = mainContainer.querySelectorAll('.chat-wrapper');
    
    allChatWrappers.forEach(wrapper => {
        wrapper.style.display = 'none';
    });
    
    // Скрываем контейнер авторизации если он виден
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.style.display = 'none';
    }
    
    // Получаем информацию о канале для определения роли пользователя
    database.ref('channels/' + channelId).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            showNotification("❌ Канал не найден");
            return;
        }
        
        const channel = snapshot.val();
        userRoleInCurrentChannel = channel.participants[userId]?.role || 'member';
        const isReadOnly = channel.settings?.readOnly;
        const canSendMessages = userRoleInCurrentChannel === 'admin' || !isReadOnly;
        const allowPosts = channel.settings?.allowPosts !== false;
        const allowFiles = channel.settings?.allowFiles !== false;
        
        // Создаем интерфейс канала
        const channelWindow = document.createElement('div');
        channelWindow.className = 'chat-wrapper';
        channelWindow.style.cssText = `
            display: flex; 
            flex-direction: column; 
            height: 100%; 
            position: absolute; 
            top: 0; 
            left: 0; 
            right: 0; 
            bottom: 0; 
            background: var(--primary-bg); 
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        channelWindow.id = 'channel-window';
        
        const readOnlyBadge = isReadOnly ? '<span style="color: #ff6b6b; font-size: 11px; margin-left: 5px;">👁️ Только чтение</span>' : '';
        const roleBadge = userRoleInCurrentChannel === 'admin' ? '<span style="color: #ff6b6b; font-size: 11px; margin-left: 5px;">👑 Админ</span>' : '';
        
        channelWindow.innerHTML = `
            <div class="chat-header" style="background: var(--header-bg); padding: 15px 20px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
                <div class="chat-header-info" style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <button class="burger-menu" id="backToChannelsBtn" style="background: none; border: none; color: var(--text-color); cursor: pointer; padding: 8px; border-radius: 5px; transition: background 0.2s ease;">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="user-avatar" style="background: #9b59b6; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-broadcast-tower"></i>
                    </div>
                    <div class="user-name" style="flex: 1;">
                        <div style="font-weight: 600; font-size: 16px;">${channelName}</div>
                        <div style="font-size: 11px; opacity: 0.7;">Канал ${readOnlyBadge} ${roleBadge}</div>
                    </div>
                </div>
                <div class="chat-header-actions" style="position: relative;">
                    <button class="chat-menu" id="channelMenuBtn" style="background: none; border: none; color: var(--text-color); cursor: pointer; padding: 8px; border-radius: 5px; transition: background 0.2s ease;">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="chat-menu-content" id="channelMenuContent" style="display: none; position: absolute; top: 100%; right: 0; background: var(--header-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 5px; z-index: 1001; min-width: 200px; box-shadow: var(--shadow);">
                        <div class="chat-menu-item" id="channelInfoBtn" style="padding: 8px 12px; cursor: pointer; border-radius: 5px; transition: background 0.2s ease;">
                            <i class="fas fa-info-circle"></i> Информация о канале
                        </div>
                        <div class="chat-menu-item" id="channelMembersBtn" style="padding: 8px 12px; cursor: pointer; border-radius: 5px; transition: background 0.2s ease;">
                            <i class="fas fa-users"></i> Участники
                        </div>
                        ${userRoleInCurrentChannel === 'admin' ? `
                        <div class="chat-menu-item" id="channelSettingsBtn" style="padding: 8px 12px; cursor: pointer; border-radius: 5px; transition: background 0.2s ease;">
                            <i class="fas fa-cog"></i> Настройки
                        </div>
                        <div class="chat-menu-item" id="manageMembersBtn" style="padding: 8px 12px; cursor: pointer; border-radius: 5px; transition: background 0.2s ease;">
                            <i class="fas fa-user-shield"></i> Управление участниками
                        </div>
                        ` : ''}
                        <div class="chat-menu-item danger" id="leaveChannelBtn" style="padding: 8px 12px; cursor: pointer; border-radius: 5px; transition: background 0.2s ease; color: #e74c3c;">
                            <i class="fas fa-sign-out-alt"></i> Покинуть канал
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="messages-wrapper" id="channelMessagesContainer" style="flex: 1; overflow-y: auto; padding: 15px; background: var(--primary-bg);">
                <div class="empty-chat">
                    <i class="fas fa-broadcast-tower" style="font-size: 48px; color: #9b59b6; margin-bottom: 15px;"></i>
                    <p>Загрузка сообщений канала...</p>
                </div>
            </div>
            
            ${canSendMessages ? `
            <div class="input-area" style="padding: 15px; border-top: 1px solid var(--border-color); background: var(--header-bg);">
                <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
                    ${allowPosts ? `
                    <button id="createPostBtn" style="padding: 8px 12px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 15px; cursor: pointer; font-size: 12px; transition: all 0.3s ease;">
                        <i class="fas fa-edit"></i> Создать пост
                    </button>
                    ` : ''}
                    ${allowFiles ? `
                    <button id="attachFileBtn" style="padding: 8px 12px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 15px; cursor: pointer; font-size: 12px; transition: all 0.3s ease;">
                        <i class="fas fa-paperclip"></i> Прикрепить файл
                    </button>
                    <input type="file" id="fileInput" multiple style="display: none;" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt">
                    ` : ''}
                </div>
                <div id="filePreviewContainer" style="margin-bottom: 10px; display: none;"></div>
                <div style="display: flex; gap: 10px; align-items: flex-end;">
                    <input type="text" id="channelMessageInput" placeholder="Введите сообщение для канала..." autocomplete="off" style="flex: 1; padding: 12px; border: 1px solid var(--border-color); border-radius: 20px; background: var(--input-bg); color: var(--input-color); font-size: 14px; transition: border-color 0.3s ease;">
                    <button id="sendChannelMessageBtn" disabled style="background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 50%; width: 44px; height: 44px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
            ` : `
            <div class="input-area" style="padding: 20px; border-top: 1px solid var(--border-color); background: rgba(255, 0, 0, 0.1); display: flex; justify-content: center; align-items: center;">
                <span style="color: #ff6b6b; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-eye"></i> Режим только для чтения. Сообщения могут отправлять только администраторы.
                </span>
            </div>
            `}
        `;
        
        // Добавляем интерфейс канала в основной контейнер
        mainContainer.appendChild(channelWindow);
        
        // Инициализируем обработчики для канала
        initChannelInterface(channelId, channelName, canSendMessages, allowPosts, allowFiles);
    });
}

// Инициализация интерфейса канала
function initChannelInterface(channelId, channelName, canSendMessages, allowPosts, allowFiles) {
    const backToChannelsBtn = document.getElementById('backToChannelsBtn');
    const channelMessagesContainer = document.getElementById('channelMessagesContainer');
    const channelMenuBtn = document.getElementById('channelMenuBtn');
    const channelMenuContent = document.getElementById('channelMenuContent');
    const channelInfoBtn = document.getElementById('channelInfoBtn');
    const channelMembersBtn = document.getElementById('channelMembersBtn');
    const channelSettingsBtn = document.getElementById('channelSettingsBtn');
    const manageMembersBtn = document.getElementById('manageMembersBtn');
    const leaveChannelBtn = document.getElementById('leaveChannelBtn');
    const createPostBtn = document.getElementById('createPostBtn');
    const attachFileBtn = document.getElementById('attachFileBtn');
    const fileInput = document.getElementById('fileInput');
    
    // Анимации для кнопок заголовка
    const headerButtons = [backToChannelsBtn, channelMenuBtn];
    headerButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('mouseenter', function() {
                this.style.background = 'var(--hover-color)';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.background = '';
            });
        }
    });
    
    // Анимации для пунктов меню
    const menuItems = channelMenuContent.querySelectorAll('.chat-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.background = this.classList.contains('danger') ? 'rgba(231, 76, 60, 0.1)' : 'var(--hover-color)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.background = '';
        });
    });
    
    // Обработчик возврата к списку каналов
    backToChannelsBtn.addEventListener('click', backToChannelsList);
    
    // Обработчик меню канала
    channelMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = channelMenuContent.style.display === 'block';
        channelMenuContent.style.display = isVisible ? 'none' : 'block';
    });
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!channelMenuBtn.contains(e.target) && !channelMenuContent.contains(e.target)) {
            channelMenuContent.style.display = 'none';
        }
    });
    
    // Обработчик создания поста
    if (createPostBtn && allowPosts) {
        createPostBtn.addEventListener('click', () => {
            showCreatePostModal(channelId);
        });
        
        createPostBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
        createPostBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    }
    
    // Обработчик прикрепления файлов
    if (attachFileBtn && allowFiles && fileInput) {
        attachFileBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        attachFileBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
        attachFileBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        // Обработчик выбора файлов
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Обработчики для отправки сообщений (только если можно отправлять)
    if (canSendMessages) {
        const channelMessageInput = document.getElementById('channelMessageInput');
        const sendChannelMessageBtn = document.getElementById('sendChannelMessageBtn');
        
        channelMessageInput.addEventListener('input', () => {
            const hasText = channelMessageInput.value.trim() !== '';
            const hasFiles = document.querySelector('#filePreviewContainer .file-preview-item') !== null;
            sendChannelMessageBtn.disabled = !hasText && !hasFiles;
            
            if (!sendChannelMessageBtn.disabled) {
                sendChannelMessageBtn.style.opacity = '1';
                sendChannelMessageBtn.style.transform = 'scale(1)';
            } else {
                sendChannelMessageBtn.style.opacity = '0.7';
                sendChannelMessageBtn.style.transform = 'scale(0.95)';
            }
        });
        
        channelMessageInput.addEventListener('focus', function() {
            this.style.borderColor = '#4facfe';
        });
        
        channelMessageInput.addEventListener('blur', function() {
            this.style.borderColor = 'var(--border-color)';
        });
        
        channelMessageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChannelMessage(channelId);
            }
        });
        
        sendChannelMessageBtn.addEventListener('click', () => {
            sendChannelMessage(channelId);
        });
        
        sendChannelMessageBtn.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'scale(1.1)';
            }
        });
        
        sendChannelMessageBtn.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = this.disabled ? 'scale(0.95)' : 'scale(1)';
            }
        });
    }
    
    // Обработчик информации о канале
    channelInfoBtn.addEventListener('click', () => {
        channelMenuContent.style.display = 'none';
        showChannelInfo(channelId);
    });
    
    // Обработчик просмотра участников
    channelMembersBtn.addEventListener('click', () => {
        channelMenuContent.style.display = 'none';
        showChannelMembers(channelId);
    });
    
    // Обработчик настроек канала (только для админов)
    if (channelSettingsBtn) {
        channelSettingsBtn.addEventListener('click', () => {
            channelMenuContent.style.display = 'none';
            showChannelSettings(channelId);
        });
    }
    
    // Обработчик управления участниками (только для админов)
    if (manageMembersBtn) {
        manageMembersBtn.addEventListener('click', () => {
            channelMenuContent.style.display = 'none';
            showManageMembers(channelId);
        });
    }
    
    // Обработчик выхода из канала
    leaveChannelBtn.addEventListener('click', () => {
        channelMenuContent.style.display = 'none';
        leaveChannel(channelId);
    });
    
    // Загружаем сообщения канала
    loadChannelMessages(channelId, channelMessagesContainer);
    
    // Фокус на поле ввода (если можно отправлять)
    if (canSendMessages) {
        setTimeout(() => {
            document.getElementById('channelMessageInput').focus();
        }, 100);
    }
}

// Обработчик выбора файлов
function handleFileSelect(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('filePreviewContainer');
    
    if (files.length === 0) return;
    
    previewContainer.style.display = 'block';
    previewContainer.innerHTML = '';
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileElement = document.createElement('div');
        fileElement.className = 'file-preview-item';
        fileElement.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px;
            background: var(--hover-color);
            border-radius: 8px;
            margin-bottom: 5px;
        `;
        
        const fileIcon = getFileIcon(file);
        const fileSize = formatFileSize(file.size);
        
        fileElement.innerHTML = `
            <div style="font-size: 20px; color: #4facfe;">${fileIcon}</div>
            <div style="flex: 1;">
                <div style="font-size: 12px; font-weight: bold;">${file.name}</div>
                <div style="font-size: 10px; opacity: 0.7;">${fileSize}</div>
            </div>
            <button class="remove-file-btn" data-file-index="${i}" style="background: none; border: none; color: #e74c3c; cursor: pointer; padding: 4px; border-radius: 4px;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        previewContainer.appendChild(fileElement);
    }
    
    // Обработчики для кнопок удаления файлов
    document.querySelectorAll('.remove-file-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const fileIndex = parseInt(this.getAttribute('data-file-index'));
            removeFileFromPreview(fileIndex);
        });
    });
    
    // Обновляем состояние кнопки отправки
    const sendBtn = document.getElementById('sendChannelMessageBtn');
    const messageInput = document.getElementById('channelMessageInput');
    const hasText = messageInput.value.trim() !== '';
    const hasFiles = previewContainer.children.length > 0;
    sendBtn.disabled = !hasText && !hasFiles;
}

// Удаление файла из превью
function removeFileFromPreview(fileIndex) {
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('filePreviewContainer');
    
    // Создаем новый FileList без удаленного файла
    const dt = new DataTransfer();
    for (let i = 0; i < fileInput.files.length; i++) {
        if (i !== fileIndex) {
            dt.items.add(fileInput.files[i]);
        }
    }
    fileInput.files = dt.files;
    
    // Перерисовываем превью
    if (fileInput.files.length === 0) {
        previewContainer.style.display = 'none';
        previewContainer.innerHTML = '';
    } else {
        // Имитируем событие change для перерисовки
        const event = new Event('change');
        fileInput.dispatchEvent(event);
    }
    
    // Обновляем состояние кнопки отправки
    const sendBtn = document.getElementById('sendChannelMessageBtn');
    const messageInput = document.getElementById('channelMessageInput');
    const hasText = messageInput.value.trim() !== '';
    const hasFiles = fileInput.files.length > 0;
    sendBtn.disabled = !hasText && !hasFiles;
}

// Получение иконки для типа файла
function getFileIcon(file) {
    const type = file.type;
    const name = file.name.toLowerCase();
    
    if (type.startsWith('image/')) return '<i class="fas fa-image"></i>';
    if (type.startsWith('video/')) return '<i class="fas fa-video"></i>';
    if (type.startsWith('audio/')) return '<i class="fas fa-music"></i>';
    if (name.endsWith('.pdf')) return '<i class="fas fa-file-pdf"></i>';
    if (name.endsWith('.doc') || name.endsWith('.docx')) return '<i class="fas fa-file-word"></i>';
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return '<i class="fas fa-file-excel"></i>';
    if (name.endsWith('.ppt') || name.endsWith('.pptx')) return '<i class="fas fa-file-powerpoint"></i>';
    if (name.endsWith('.zip') || name.endsWith('.rar')) return '<i class="fas fa-file-archive"></i>';
    if (name.endsWith('.txt')) return '<i class="fas fa-file-alt"></i>';
    
    return '<i class="fas fa-file"></i>';
}

// Форматирование размера файла
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Создание поста
function showCreatePostModal(channelId) {
    closeActiveModal();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '1000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; animation: scaleIn 0.3s ease;">
            <h3 style="margin-bottom: 15px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                <i class="fas fa-edit" style="color: #9b59b6;"></i>
                Создание поста
            </h3>
            <div style="margin-bottom: 15px;">
                <textarea id="postContentInput" placeholder="Напишите содержание поста..." style="width: 100%; padding: 15px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); height: 150px; resize: vertical; font-size: 14px; transition: border-color 0.3s ease;"></textarea>
                <div style="text-align: right; margin-top: 5px; font-size: 12px; opacity: 0.7;">
                    <span id="postCharCount">0</span>/1000 символов
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <h4 style="margin-bottom: 10px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-smile" style="color: #f39c12;"></i>
                    Доступные реакции:
                </h4>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <span style="font-size: 20px; cursor: pointer; transition: transform 0.2s ease;" onclick="addReactionToPost('👍')">👍</span>
                    <span style="font-size: 20px; cursor: pointer; transition: transform 0.2s ease;" onclick="addReactionToPost('❤️')">❤️</span>
                    <span style="font-size: 20px; cursor: pointer; transition: transform 0.2s ease;" onclick="addReactionToPost('😂')">😂</span>
                    <span style="font-size: 20px; cursor: pointer; transition: transform 0.2s ease;" onclick="addReactionToPost('😮')">😮</span>
                    <span style="font-size: 20px; cursor: pointer; transition: transform 0.2s ease;" onclick="addReactionToPost('😢')">😢</span>
                    <span style="font-size: 20px; cursor: pointer; transition: transform 0.2s ease;" onclick="addReactionToPost('👏')">👏</span>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn primary" id="confirmCreatePostBtn" style="transition: all 0.3s ease;">
                    <i class="fas fa-edit"></i> Опубликовать пост
                </button>
                <button class="modal-btn secondary" id="cancelCreatePostBtn" style="transition: all 0.3s ease;">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    activeModal = modal;
    
    // Счетчик символов
    const postInput = document.getElementById('postContentInput');
    const charCount = document.getElementById('postCharCount');
    
    postInput.addEventListener('input', () => {
        const length = postInput.value.length;
        charCount.textContent = length;
        if (length > 900) {
            charCount.style.color = '#e74c3c';
        } else if (length > 800) {
            charCount.style.color = '#f39c12';
        } else {
            charCount.style.color = '';
        }
    });
    
    // Анимация для эмодзи
    const emojis = modal.querySelectorAll('span[style*="font-size: 20px"]');
    emojis.forEach(emoji => {
        emoji.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2)';
        });
        emoji.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    document.getElementById('confirmCreatePostBtn').addEventListener('click', () => {
        createPost(channelId);
    });
    
    document.getElementById('cancelCreatePostBtn').addEventListener('click', () => {
        closeActiveModal();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeActiveModal();
        }
    });
    
    // Закрытие по ESC
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            closeActiveModal();
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    setTimeout(() => {
        postInput.focus();
    }, 100);
}

// Функция для добавления реакции в текст поста
function addReactionToPost(reaction) {
    const postInput = document.getElementById('postContentInput');
    const currentText = postInput.value;
    postInput.value = currentText + ' ' + reaction;
    postInput.focus();
}

function createPost(channelId) {
    const postContentInput = document.getElementById('postContentInput');
    const content = postContentInput.value.trim();
    
    if (!content) {
        showNotification("Введите содержание поста");
        postContentInput.focus();
        return;
    }
    
    if (content.length > 1000) {
        showNotification("Пост не должен превышать 1000 символов");
        return;
    }
    
    const postId = database.ref('channelPosts').push().key;
    const timestamp = Date.now();
    
    const postData = {
        id: postId,
        content: content,
        authorId: userId,
        authorName: currentUser,
        authorRole: userRoleInCurrentChannel,
        channelId: channelId,
        timestamp: timestamp,
        reactions: {},
        type: 'post'
    };
    
    // Блокируем кнопку
    const createBtn = document.getElementById('confirmCreatePostBtn');
    createBtn.disabled = true;
    createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Публикация...';
    
    database.ref('channelPosts/' + postId).set(postData)
        .then(() => {
            showNotification("✅ Пост опубликован!");
            closeActiveModal();
            
            // Обновляем информацию о канале
            database.ref('channels/' + channelId).update({
                lastMessage: "📝 Новый пост: " + (content.length > 50 ? content.substring(0, 47) + '...' : content),
                lastMessageTime: timestamp
            });
        })
        .catch((error) => {
            console.error("❌ Ошибка создания поста:", error);
            showNotification("❌ Ошибка публикации поста");
            
            // Разблокируем кнопку
            createBtn.disabled = false;
            createBtn.innerHTML = '<i class="fas fa-edit"></i> Опубликовать пост';
        });
}

// Возврат к списку каналов
function backToChannelsList() {
    // Показываем плавающую кнопку при возврате
    toggleMobileMenuButton(true);
    
    // Удаляем слушатель сообщений канала
    if (channelMessagesListener) {
        database.ref('channelMessages').off('value', channelMessagesListener);
        channelMessagesListener = null;
    }
    
    // Удаляем слушатель постов канала
    if (channelPostsListener) {
        database.ref('channelPosts').off('value', channelPostsListener);
        channelPostsListener = null;
    }
    
    // Удаляем интерфейс канала
    const channelWindow = document.getElementById('channel-window');
    if (channelWindow) {
        channelWindow.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            channelWindow.remove();
        }, 300);
    }
    
    // ВОССТАНАВЛИВАЕМ ОСНОВНОЙ ИНТЕРФЕЙС КОРРЕКТНО
    const mainContainer = document.querySelector('.main-container');
    
    // Показываем основной контейнер с вкладками
    const mainChatWrapper = mainContainer.querySelector('.chat-wrapper');
    if (mainChatWrapper) {
        mainChatWrapper.style.display = 'flex';
    }
    
    // Сбрасываем состояние
    currentChannel = null;
    userRoleInCurrentChannel = null;
    
    // Активируем вкладку каналов
    switchToChannelsTab();
}

// Загрузка сообщений канала
function loadChannelMessages(channelId, container) {
    container.innerHTML = '<div class="empty-chat"><div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div><p>Загрузка сообщений...</p></div>';
    
    // Удаляем предыдущий слушатель, если он есть
    if (channelMessagesListener) {
        database.ref('channelMessages').off('value', channelMessagesListener);
    }
    
    // Слушаем сообщения канала
    channelMessagesListener = database.ref('channelMessages').orderByChild('channelId').equalTo(channelId).on('value', (snapshot) => {
        if (!snapshot.exists()) {
            container.innerHTML = '<div class="empty-chat"><i class="fas fa-broadcast-tower"></i><p>В канале пока нет сообщений</p><p style="font-size: 14px; margin-top: 10px;">Будьте первым, кто напишет сообщение!</p></div>';
            return;
        }
        
        const messages = snapshot.val();
        container.innerHTML = '';
        
        // Преобразуем объект в массив и сортируем по времени
        const messagesArray = [];
        Object.keys(messages).forEach(messageId => {
            messagesArray.push(messages[messageId]);
        });
        
        messagesArray.sort((a, b) => a.timestamp - b.timestamp);
        
        // Отображаем сообщения
        messagesArray.forEach(message => {
            addChannelMessageToChat(message, container);
        });
        
        // Загружаем посты
        loadChannelPosts(channelId, container);
        
        // Прокручиваем вниз
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
        
        // Воспроизводим звук уведомления для новых сообщений
        if (messagesArray.length > 0 && userSettings.sound) {
            playNotificationSound();
        }
    });
}

// Загрузка постов канала
function loadChannelPosts(channelId, container) {
    // Удаляем предыдущий слушатель, если он есть
    if (channelPostsListener) {
        database.ref('channelPosts').off('value', channelPostsListener);
    }
    
    // Слушаем посты канала в реальном времени
    channelPostsListener = database.ref('channelPosts').orderByChild('channelId').equalTo(channelId).on('value', (snapshot) => {
        if (!snapshot.exists()) return;
        
        const posts = snapshot.val();
        const postsArray = [];
        
        Object.keys(posts).forEach(postId => {
            postsArray.push(posts[postId]);
        });
        
        postsArray.sort((a, b) => a.timestamp - b.timestamp);
        
        // Удаляем старые посты и добавляем новые
        const oldPosts = container.querySelectorAll('.post-message');
        oldPosts.forEach(post => post.remove());
        
        postsArray.forEach(post => {
            addPostToChat(post, container);
        });
        
        // Прокручиваем вниз
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    });
}

// Добавление поста в чат
function addPostToChat(post, container) {
    const postElement = document.createElement('div');
    postElement.classList.add('message', 'post-message');
    postElement.style.cssText = `
        background: var(--hover-color);
        border-left: 4px solid #9b59b6;
        padding: 15px;
        margin: 10px 0;
        border-radius: 8px;
        animation: fadeIn 0.3s ease;
    `;
    
    const date = new Date(post.timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const roleBadge = post.authorRole === 'admin' ? ' <span style="color: #ff6b6b; font-size: 10px;">👑</span>' : '';
    
    // Подсчет реакций
    const reactions = post.reactions || {};
    const reactionCounts = {};
    Object.values(reactions).forEach(reaction => {
        reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
    });
    
    const reactionElements = Object.entries(reactionCounts).map(([emoji, count]) => 
        `<span class="reaction" data-emoji="${emoji}" data-post-id="${post.id}" style="background: var(--primary-bg); padding: 4px 8px; border-radius: 12px; margin-right: 5px; cursor: pointer; border: 1px solid var(--border-color); transition: all 0.2s ease;">
            ${emoji} ${count}
        </span>`
    ).join('');
    
    const userReaction = Object.keys(reactions).find(key => reactions[key] === userId);
    const addReactionText = userReaction ? 'Изменить реакцию' : 'Добавить реакцию';
    
    postElement.innerHTML = `
        <div class="sender" style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 5px;">
            <i class="fas fa-edit" style="color: #9b59b6;"></i>
            ${post.authorName}${roleBadge}
            <span style="font-size: 11px; opacity: 0.7; margin-left: 10px;">опубликовал(а) пост</span>
        </div>
        <div class="post-content" style="margin-bottom: 10px; line-height: 1.4; white-space: pre-wrap;">${post.content}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
            <div class="post-reactions" style="display: flex; gap: 5px; flex-wrap: wrap;">
                ${reactionElements}
                <button class="add-reaction-btn" data-post-id="${post.id}" style="background: none; border: 1px dashed var(--border-color); padding: 4px 8px; border-radius: 12px; cursor: pointer; font-size: 12px; color: var(--text-color); transition: all 0.2s ease;">
                    ${addReactionText}
                </button>
            </div>
            <div class="timestamp" style="font-size: 11px; opacity: 0.7;">${timeString}</div>
        </div>
    `;
    
    container.appendChild(postElement);
    
    // Анимации для реакций
    const reactionBtns = postElement.querySelectorAll('.reaction, .add-reaction-btn');
    reactionBtns.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Обработчики для реакций
    postElement.querySelector('.add-reaction-btn').addEventListener('click', function() {
        showReactionPicker(post.id);
    });
    
    postElement.querySelectorAll('.reaction').forEach(reaction => {
        reaction.addEventListener('click', function() {
            const emoji = this.getAttribute('data-emoji');
            const postId = this.getAttribute('data-post-id');
            toggleReaction(postId, emoji);
        });
    });
}

// Показ выбора реакции
function showReactionPicker(postId) {
    const emojis = ['👍', '❤️', '😂', '😮', '😢', '👏'];
    
    const picker = document.createElement('div');
    picker.style.cssText = `
        position: fixed;
        background: var(--header-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 10px;
        z-index: 10000;
        display: flex;
        gap: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: scaleIn 0.2s ease;
    `;
    
    emojis.forEach(emoji => {
        const emojiBtn = document.createElement('button');
        emojiBtn.textContent = emoji;
        emojiBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            padding: 5px;
            border-radius: 5px;
            transition: all 0.2s ease;
        `;
        emojiBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.3)';
            this.style.background = 'var(--hover-color)';
        });
        emojiBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.background = 'none';
        });
        emojiBtn.addEventListener('click', () => {
            toggleReaction(postId, emoji);
            picker.remove();
        });
        picker.appendChild(emojiBtn);
    });
    
    // Позиционируем picker рядом с кнопкой
    const addBtn = document.querySelector(`[data-post-id="${postId}"]`);
    if (addBtn) {
        const rect = addBtn.getBoundingClientRect();
        picker.style.left = rect.left + 'px';
        picker.style.top = (rect.top - 50) + 'px';
        
        document.body.appendChild(picker);
        
        // Закрытие при клике вне picker
        setTimeout(() => {
            document.addEventListener('click', function closePicker(e) {
                if (!picker.contains(e.target) && e.target !== addBtn) {
                    picker.remove();
                    document.removeEventListener('click', closePicker);
                }
            });
        }, 100);
    }
}

// Переключение реакции
function toggleReaction(postId, emoji) {
    database.ref('channelPosts/' + postId + '/reactions').once('value')
        .then((snapshot) => {
            const reactions = snapshot.val() || {};
            
            // Находим реакцию пользователя
            let userReactionKey = null;
            Object.keys(reactions).forEach(key => {
                if (reactions[key] === userId) {
                    userReactionKey = key;
                }
            });
            
            if (userReactionKey) {
                // Если пользователь уже поставил эту реакцию - удаляем
                if (reactions[userReactionKey] === emoji) {
                    database.ref('channelPosts/' + postId + '/reactions/' + userReactionKey).remove();
                } else {
                    // Если другая реакция - заменяем
                    database.ref('channelPosts/' + postId + '/reactions/' + userReactionKey).set(emoji);
                }
            } else {
                // Если реакции нет - добавляем новую
                const newReactionKey = database.ref('channelPosts/' + postId + '/reactions').push().key;
                database.ref('channelPosts/' + postId + '/reactions/' + newReactionKey).set(emoji);
            }
        })
        .catch((error) => {
            console.error("❌ Ошибка добавления реакции:", error);
        });
}

// Добавление сообщения канала в чат
function addChannelMessageToChat(message, container) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.style.cssText = `
        margin-bottom: 10px;
        padding: 10px 15px;
        border-radius: 10px;
        animation: fadeIn 0.3s ease;
        max-width: 80%;
    `;
    
    if (message.senderId === userId) {
        messageElement.classList.add('my-message');
        messageElement.style.cssText += `
            background: linear-gradient(to right, #4facfe, #00f2fe);
            color: white;
            margin-left: auto;
            border-bottom-right-radius: 2px;
        `;
    } else {
        messageElement.classList.add('other-message');
        messageElement.style.cssText += `
            background: var(--hover-color);
            color: var(--text-color);
            margin-right: auto;
            border-bottom-left-radius: 2px;
        `;
    }
    
    const date = new Date(message.timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Добавляем бейдж для администраторов
    const roleBadge = message.senderRole === 'admin' ? ' <span style="color: #ff6b6b; font-size: 10px;">👑</span>' : '';
    
    messageElement.innerHTML = `
        <div class="sender" style="font-weight: bold; font-size: 12px; margin-bottom: 5px; opacity: 0.9;">${message.senderName}${roleBadge}</div>
        <div style="margin-bottom: 5px; word-wrap: break-word;">${message.text}</div>
        <div class="timestamp" style="font-size: 10px; opacity: 0.7; text-align: right;">${timeString}</div>
    `;
    
    container.appendChild(messageElement);
}

// Отправка сообщения в канал
function sendChannelMessage(channelId) {
    const channelMessageInput = document.getElementById('channelMessageInput');
    const text = channelMessageInput.value.trim();
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    
    if ((!text || text === '') && files.length === 0) {
        return;
    }
    
    const messageId = database.ref('channelMessages').push().key;
    const timestamp = Date.now();
    
    const messageData = {
        id: messageId,
        text: text,
        senderId: userId,
        senderName: currentUser,
        senderRole: userRoleInCurrentChannel,
        channelId: channelId,
        timestamp: timestamp
    };
    
    // Если есть файлы, добавляем информацию о них
    if (files.length > 0) {
        messageData.files = [];
        messageData.hasFiles = true;
        
        // Здесь должна быть логика загрузки файлов в хранилище
        // Для демонстрации просто добавляем информацию о файлах
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            messageData.files.push({
                name: file.name,
                type: file.type,
                size: file.size,
                url: URL.createObjectURL(file) // Временная ссылка для демонстрации
            });
        }
    }
    
    // Сохраняем сообщение в базе данных
    database.ref('channelMessages/' + messageId).set(messageData)
        .then(() => {
            // Обновляем информацию о канале
            let lastMessage = text;
            if (files.length > 0) {
                if (text) {
                    lastMessage = `📎 ${text}`;
                } else {
                    lastMessage = `📎 ${files.length} файл(ов)`;
                }
            }
            
            database.ref('channels/' + channelId).update({
                lastMessage: lastMessage.length > 50 ? lastMessage.substring(0, 47) + '...' : lastMessage,
                lastMessageTime: timestamp
            });
            
            // Очищаем поле ввода и файлы
            channelMessageInput.value = '';
            fileInput.value = '';
            const previewContainer = document.getElementById('filePreviewContainer');
            previewContainer.style.display = 'none';
            previewContainer.innerHTML = '';
            
            const sendBtn = document.getElementById('sendChannelMessageBtn');
            sendBtn.disabled = true;
            sendBtn.style.opacity = '0.7';
            sendBtn.style.transform = 'scale(0.95)';
        })
        .catch((error) => {
            console.error("❌ Ошибка отправки сообщения в канал:", error);
            showNotification("❌ Ошибка отправки сообщения");
        });
}

// Воспроизведение звука уведомления
function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log("🔇 Звуковые уведомления не поддерживаются");
    }
}

// Показ информации о канале
function showChannelInfo(channelId) {
    database.ref('channels/' + channelId).once('value').then((snapshot) => {
        if (!snapshot.exists()) return;
        
        const channel = snapshot.val();
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.zIndex = '1001';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; animation: scaleIn 0.3s ease;">
                <h3 style="margin-bottom: 15px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-info-circle" style="color: #4facfe;"></i>
                    Информация о канале
                </h3>
                <div style="text-align: center; margin-bottom: 20px;">
                    <div class="user-avatar" style="width: 60px; height: 60px; margin: 0 auto 10px; background: #9b59b6; border-radius: 15px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-broadcast-tower" style="font-size: 24px;"></i>
                    </div>
                    <div class="profile-name" style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${channel.name}</div>
                    <div style="font-size: 14px; opacity: 0.7; display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;">
                        ${channel.isPublic ? '<span style="color: #4facfe;"><i class="fas fa-globe"></i> Публичный канал</span>' : '<span style="color: #e74c3c;"><i class="fas fa-lock"></i> Приватный канал</span>'}
                        ${channel.settings?.readOnly ? '<span style="color: #3498db;">👁️ Только чтение</span>' : ''}
                        ${channel.settings?.allowPosts ? '<span style="color: #9b59b6;">📝 Посты разрешены</span>' : '<span style="color: #e74c3c;">📝 Посты запрещены</span>'}
                        ${channel.settings?.allowFiles ? '<span style="color: #2ecc71;">📎 Файлы разрешены</span>' : '<span style="color: #e74c3c;">📎 Файлы запрещены</span>'}
                    </div>
                </div>
                <div class="profile-info" style="background: var(--hover-color); padding: 15px; border-radius: 10px;">
                    <div class="profile-info-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                        <span class="profile-info-label" style="font-weight: 500;">Описание:</span>
                        <span class="profile-info-value" style="text-align: right;">${channel.description || 'Нет описания'}</span>
                    </div>
                    <div class="profile-info-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                        <span class="profile-info-label" style="font-weight: 500;">Создатель:</span>
                        <span class="profile-info-value">${channel.creatorName}</span>
                    </div>
                    <div class="profile-info-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                        <span class="profile-info-label" style="font-weight: 500;">Участников:</span>
                        <span class="profile-info-value">${channel.participants ? Object.keys(channel.participants).length : 0}</span>
                    </div>
                    <div class="profile-info-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                        <span class="profile-info-label" style="font-weight: 500;">Создан:</span>
                        <span class="profile-info-value">${new Date(channel.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="profile-info-item" style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span class="profile-info-label" style="font-weight: 500;">ID канала:</span>
                        <span class="profile-info-value" style="font-size: 12px; font-family: monospace;">${channelId}</span>
                    </div>
                </div>
                <div class="modal-buttons" style="margin-top: 20px;">
                    <button class="modal-btn secondary" id="closeChannelInfoBtn" style="transition: all 0.3s ease;">Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        activeModal = modal;
        
        document.getElementById('closeChannelInfoBtn').addEventListener('click', () => {
            closeActiveModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeActiveModal();
            }
        });
        
        // Закрытие по ESC
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                closeActiveModal();
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
    });
}

// Показ участников канала
function showChannelMembers(channelId) {
    database.ref('channels/' + channelId).once('value').then((snapshot) => {
        if (!snapshot.exists()) return;
        
        const channel = snapshot.val();
        const participants = channel.participants || {};
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.zIndex = '1001';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; animation: scaleIn 0.3s ease;">
                <h3 style="margin-bottom: 15px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-users" style="color: #4facfe;"></i>
                    Участники канала
                </h3>
                <div style="max-height: 300px; overflow-y: auto; margin-bottom: 15px;">
                    <div id="channelMembersList">
                        <div class="loading-dots" style="display: flex; justify-content: center; gap: 4px; padding: 20px;">
                            <div class="loading-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #9b59b6; animation: loadingDot 1.4s ease-in-out infinite both;"></div>
                            <div class="loading-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #9b59b6; animation: loadingDot 1.4s ease-in-out infinite both; animation-delay: -0.16s;"></div>
                            <div class="loading-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #9b59b6; animation: loadingDot 1.4s ease-in-out infinite both; animation-delay: -0.32s;"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="closeChannelMembersBtn" style="transition: all 0.3s ease;">Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        activeModal = modal;
        
        // Загружаем информацию об участниках
        const membersList = document.getElementById('channelMembersList');
        membersList.innerHTML = '';
        
        // Сортируем участников: сначала создатель, потом админы, потом обычные участники
        const sortedParticipants = Object.entries(participants).sort((a, b) => {
            const [userIdA, userA] = a;
            const [userIdB, userB] = b;
            
            // Создатель всегда первый
            if (userIdA === channel.creatorId) return -1;
            if (userIdB === channel.creatorId) return 1;
            
            // Админы перед обычными участниками
            if (userA.role === 'admin' && userB.role !== 'admin') return -1;
            if (userA.role !== 'admin' && userB.role === 'admin') return 1;
            
            // По имени для остальных
            return userA.name.localeCompare(userB.name);
        });
        
        sortedParticipants.forEach(([participantId, participant]) => {
            const memberElement = document.createElement('div');
            memberElement.className = 'user-item';
            memberElement.style.cssText = `
                padding: 12px;
                margin-bottom: 8px;
                border: 1px solid var(--border-color);
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.3s ease;
            `;
            
            const roleBadge = participant.role === 'admin' ? 
                '<span style="color: #ff6b6b; font-size: 10px; background: rgba(255, 107, 107, 0.1); padding: 2px 6px; border-radius: 8px;">👑 Админ</span>' : 
                '';
            
            const creatorBadge = participantId === channel.creatorId ? 
                '<span style="color: #4facfe; font-size: 10px; background: rgba(79, 172, 254, 0.1); padding: 2px 6px; border-radius: 8px;">⭐ Создатель</span>' : 
                '';
            
            const userStatus = userStatuses[participantId];
            const statusIndicator = userStatus?.isOnline ? 
                '<span style="color: #2ecc71; font-size: 10px; display: flex; align-items: center; gap: 4px;"><div style="width: 6px; height: 6px; border-radius: 50%; background: #2ecc71;"></div> Онлайн</span>' : 
                '<span style="color: #ccc; font-size: 10px; display: flex; align-items: center; gap: 4px;"><div style="width: 6px; height: 6px; border-radius: 50%; background: #ccc;"></div> Оффлайн</span>';
            
            memberElement.innerHTML = `
                <div class="user-item-avatar" style="background: ${generateUserColor(participant.name)}; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white;">
                    ${participant.name ? participant.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div class="user-item-info" style="flex: 1;">
                    <div class="user-item-name" style="font-size: 14px; font-weight: bold; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                        ${participant.name}
                        ${creatorBadge}
                        ${roleBadge}
                    </div>
                    <div class="user-item-status" style="font-size: 12px; opacity: 0.8; display: flex; align-items: center; gap: 8px;">
                        <span>Участник с ${new Date(participant.joinedAt).toLocaleDateString()}</span>
                        ${statusIndicator}
                    </div>
                </div>
            `;
            
            // Анимация при наведении
            memberElement.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            });
            
            memberElement.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
            
            membersList.appendChild(memberElement);
        });
        
        document.getElementById('closeChannelMembersBtn').addEventListener('click', () => {
            closeActiveModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeActiveModal();
            }
        });
        
        // Закрытие по ESC
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                closeActiveModal();
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
    });
}

// Показ настроек канала
function showChannelSettings(channelId) {
    database.ref('channels/' + channelId).once('value').then((snapshot) => {
        if (!snapshot.exists()) return;
        
        const channel = snapshot.val();
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.zIndex = '1001';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; animation: scaleIn 0.3s ease;">
                <h3 style="margin-bottom: 15px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-cog" style="color: #4facfe;"></i>
                    Настройки канала
                </h3>
                <div class="settings-section" style="background: var(--hover-color); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <h4 style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px;"><i class="fas fa-cog"></i> Основные настройки</h4>
                    <div class="settings-option" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                        <span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-user-plus" style="color: #4facfe;"></i> Разрешить приглашения</span>
                        <label class="switch">
                            <input type="checkbox" id="allowInvitesToggle" ${channel.settings?.allowInvites ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="settings-option" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                        <span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-comment" style="color: #4facfe;"></i> Разрешить сообщения</span>
                        <label class="switch">
                            <input type="checkbox" id="allowMessagesToggle" ${channel.settings?.allowMessages ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="settings-option" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                        <span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-eye" style="color: #3498db;"></i> Режим только для чтения</span>
                        <label class="switch">
                            <input type="checkbox" id="readOnlyToggle" ${channel.settings?.readOnly ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="settings-option" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                        <span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-edit" style="color: #9b59b6;"></i> Разрешить посты</span>
                        <label class="switch">
                            <input type="checkbox" id="allowPostsToggle" ${channel.settings?.allowPosts !== false ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="settings-option" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                        <span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-file-upload" style="color: #2ecc71;"></i> Разрешить файлы</span>
                        <label class="switch">
                            <input type="checkbox" id="allowFilesToggle" ${channel.settings?.allowFiles !== false ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="settings-option" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                        <span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-clock" style="color: #f39c12;"></i> Режим медленной отправки</span>
                        <label class="switch">
                            <input type="checkbox" id="slowModeToggle" ${channel.settings?.slowMode ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn primary" id="saveChannelSettingsBtn" style="transition: all 0.3s ease;">Сохранить</button>
                    <button class="modal-btn secondary" id="closeChannelSettingsBtn" style="transition: all 0.3s ease;">Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        activeModal = modal;
        
        document.getElementById('saveChannelSettingsBtn').addEventListener('click', () => {
            saveChannelSettings(channelId);
        });
        
        document.getElementById('closeChannelSettingsBtn').addEventListener('click', () => {
            closeActiveModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeActiveModal();
            }
        });
        
        // Закрытие по ESC
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                closeActiveModal();
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
    });
}

// Управление участниками
function showManageMembers(channelId) {
    database.ref('channels/' + channelId).once('value').then((snapshot) => {
        if (!snapshot.exists()) return;
        
        const channel = snapshot.val();
        const participants = channel.participants || {};
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.zIndex = '1001';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; animation: scaleIn 0.3s ease;">
                <h3 style="margin-bottom: 15px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-user-shield" style="color: #4facfe;"></i>
                    Управление участниками
                </h3>
                <div style="max-height: 400px; overflow-y: auto; margin-bottom: 15px;">
                    <div id="manageMembersList">
                        <div class="loading-dots" style="display: flex; justify-content: center; gap: 4px; padding: 20px;">
                            <div class="loading-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #9b59b6; animation: loadingDot 1.4s ease-in-out infinite both;"></div>
                            <div class="loading-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #9b59b6; animation: loadingDot 1.4s ease-in-out infinite both; animation-delay: -0.16s;"></div>
                            <div class="loading-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #9b59b6; animation: loadingDot 1.4s ease-in-out infinite both; animation-delay: -0.32s;"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="closeManageMembersBtn" style="transition: all 0.3s ease;">Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        activeModal = modal;
        
        // Загружаем информацию об участниках для управления
        const manageList = document.getElementById('manageMembersList');
        manageList.innerHTML = '';
        
        Object.keys(participants).forEach(userId => {
            const participant = participants[userId];
            if (userId === channel.creatorId) return; // Пропускаем создателя
            
            const memberElement = document.createElement('div');
            memberElement.className = 'user-item';
            memberElement.style.cssText = `
                padding: 12px;
                margin-bottom: 8px;
                border: 1px solid var(--border-color);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                transition: all 0.3s ease;
            `;
            
            const roleBadge = participant.role === 'admin' ? 
                '<span style="color: #ff6b6b; font-size: 10px; background: rgba(255, 107, 107, 0.1); padding: 2px 6px; border-radius: 8px;">👑 Админ</span>' : 
                '<span style="color: #4facfe; font-size: 10px; background: rgba(79, 172, 254, 0.1); padding: 2px 6px; border-radius: 8px;">👤 Участник</span>';
            
            memberElement.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div class="user-item-avatar" style="background: ${generateUserColor(participant.name)}; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white;">
                        ${participant.name ? participant.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div class="user-item-info">
                        <div class="user-item-name" style="font-size: 14px; font-weight: bold; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                            ${participant.name}
                            ${roleBadge}
                        </div>
                        <div class="user-item-status" style="font-size: 12px; opacity: 0.8;">
                            Участник с ${new Date(participant.joinedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${participant.role === 'member' ? 
                        `<button class="promote-user-btn" data-user-id="${userId}" style="padding: 6px 12px; background: #4facfe; color: white; border: none; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.3s ease;">
                            Назначить админом
                         </button>` : 
                        `<button class="demote-user-btn" data-user-id="${userId}" style="padding: 6px 12px; background: #ff6b6b; color: white; border: none; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.3s ease;">
                            Снять админа
                         </button>`
                    }
                    <button class="kick-user-btn" data-user-id="${userId}" style="padding: 6px 12px; background: #e74c3c; color: white; border: none; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.3s ease;">
                        Исключить
                    </button>
                </div>
            `;
            
            // Анимация при наведении
            memberElement.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            });
            
            memberElement.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
            
            manageList.appendChild(memberElement);
        });
        
        // Анимации для кнопок управления
        const actionButtons = manageList.querySelectorAll('button');
        actionButtons.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.opacity = '0.9';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.opacity = '1';
            });
        });
        
        // Добавляем обработчики для кнопок управления
        document.querySelectorAll('.promote-user-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetUserId = this.getAttribute('data-user-id');
                promoteUser(channelId, targetUserId);
            });
        });
        
        document.querySelectorAll('.demote-user-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetUserId = this.getAttribute('data-user-id');
                demoteUser(channelId, targetUserId);
            });
        });
        
        document.querySelectorAll('.kick-user-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetUserId = this.getAttribute('data-user-id');
                kickUser(channelId, targetUserId);
            });
        });
        
        document.getElementById('closeManageMembersBtn').addEventListener('click', () => {
            closeActiveModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeActiveModal();
            }
        });
        
        // Закрытие по ESC
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                closeActiveModal();
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
    });
}

// Назначение пользователя администратором
function promoteUser(channelId, targetUserId) {
    database.ref('channels/' + channelId + '/participants/' + targetUserId).update({
        role: 'admin'
    }).then(() => {
        showNotification("✅ Пользователь назначен администратором");
        closeActiveModal();
    }).catch((error) => {
        console.error("❌ Ошибка назначения администратора:", error);
        showNotification("❌ Ошибка назначения администратора");
    });
}

// Снятие пользователя с администратора
function demoteUser(channelId, targetUserId) {
    database.ref('channels/' + channelId + '/participants/' + targetUserId).update({
        role: 'member'
    }).then(() => {
        showNotification("✅ Пользователь снят с администратора");
        closeActiveModal();
    }).catch((error) => {
        console.error("❌ Ошибка снятия администратора:", error);
        showNotification("❌ Ошибка снятия администратора");
    });
}

// Исключение пользователя из канала
function kickUser(channelId, targetUserId) {
    if (confirm("Вы уверены, что хотите исключить этого пользователя из канала?")) {
        database.ref('channels/' + channelId + '/participants/' + targetUserId).remove()
            .then(() => {
                showNotification("✅ Пользователь исключен из канала");
                closeActiveModal();
            })
            .catch((error) => {
                console.error("❌ Ошибка исключения пользователя:", error);
                showNotification("❌ Ошибка исключения пользователя");
            });
    }
}

// Сохранение настроек канала
function saveChannelSettings(channelId) {
    const allowInvites = document.getElementById('allowInvitesToggle').checked;
    const allowMessages = document.getElementById('allowMessagesToggle').checked;
    const readOnly = document.getElementById('readOnlyToggle').checked;
    const allowPosts = document.getElementById('allowPostsToggle').checked;
    const allowFiles = document.getElementById('allowFilesToggle').checked;
    const slowMode = document.getElementById('slowModeToggle').checked;
    
    const updates = {
        'settings/allowInvites': allowInvites,
        'settings/allowMessages': allowMessages,
        'settings/readOnly': readOnly,
        'settings/allowPosts': allowPosts,
        'settings/allowFiles': allowFiles,
        'settings/slowMode': slowMode
    };
    
    database.ref('channels/' + channelId).update(updates)
        .then(() => {
            showNotification("✅ Настройки канала сохранены");
            closeActiveModal();
            
            // Обновляем интерфейс канала если он открыт
            if (currentChannel === channelId) {
                const channelWindow = document.getElementById('channel-window');
                if (channelWindow) {
                    channelWindow.remove();
                    database.ref('channels/' + channelId).once('value').then((snapshot) => {
                        if (snapshot.exists()) {
                            const channel = snapshot.val();
                            openChannel(channelId, channel.name);
                        }
                    });
                }
            }
        })
        .catch((error) => {
            console.error("❌ Ошибка сохранения настроек канала:", error);
            showNotification("❌ Ошибка сохранения настроек");
        });
}

// Выход из канала
function leaveChannel(channelId) {
    if (confirm("Вы уверены, что хотите покинуть этот канал?")) {
        // Удаляем пользователя из участников канала
        database.ref('channels/' + channelId + '/participants/' + userId).remove()
            .then(() => {
                showNotification("✅ Вы покинули канал");
                
                // Возвращаемся к списку каналов
                backToChannelsList();
            })
            .catch((error) => {
                console.error("❌ Ошибка выхода из канала:", error);
                showNotification("❌ Ошибка выхода из канала");
            });
    }
}

// Закрытие активного модального окна
function closeActiveModal() {
    if (activeModal) {
        activeModal.classList.remove('active');
        setTimeout(() => {
            if (activeModal && activeModal.parentNode) {
                activeModal.parentNode.removeChild(activeModal);
            }
            activeModal = null;
        }, 300);
    }
}

// Форматирование времени (вспомогательная функция)
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) {
        return 'только что';
    } else if (diff < 3600000) {
        return Math.floor(diff / 60000) + ' мин';
    } else if (diff < 86400000) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString();
    }
}

// Генерация цвета для пользователя (вспомогательная функция)
function generateUserColor(name = '') {
    const colors = ['#4facfe', '#00f2fe', '#a0d2eb', '#7fdbda', '#6a9bd8', '#9b59b6', '#e74c3c', '#2ecc71', '#f39c12', '#1abc9c'];
    
    if (name) {
        // Генерируем цвет на основе имени для консистентности
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }
    
    return colors[Math.floor(Math.random() * colors.length)];
}

// Показ уведомления
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--header-bg);
        color: var(--text-color);
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: var(--shadow);
        z-index: 10000;
        max-width: 300px;
        border-left: 4px solid ${type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : '#3498db'};
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${type === 'error' ? 'fa-exclamation-triangle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Автоматическое закрытие через 4 секунды
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Добавляем CSS анимации
function addChannelsStyles() {
    if (document.getElementById('channelsStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'channelsStyles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        
        @keyframes loadingDot {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        
        .loading-dots {
            display: flex;
            gap: 4px;
            margin-bottom: 15px;
        }
        
        .loading-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #9b59b6;
            animation: loadingDot 1.4s ease-in-out infinite both;
        }
        
        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        
        .mobile-menu-btn:hover {
            transform: scale(1.1) !important;
        }
        
        /* Стили для переключателей */
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #4facfe;
        }
        
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        
        /* Адаптивность для мобильных устройств */
        @media (max-width: 768px) {
            .channels-actions {
                flex-direction: column;
            }
            
            .channels-actions button {
                min-width: 100% !important;
            }
            
            .modal-content {
                width: 95% !important;
                margin: 10px !important;
            }
            
            .mobile-menu-btn {
                width: 50px !important;
                height: 50px !important;
                bottom: 15px !important;
                right: 15px !important;
                font-size: 18px !important;
            }
            
            #channel-window .chat-header {
                padding: 10px 15px !important;
            }
            
            #channel-window .input-area {
                padding: 10px !important;
            }
        }
        
        /* Улучшенная анимация для кнопок */
        button {
            transition: all 0.2s ease !important;
        }
        
        button:hover {
            transform: translateY(-1px);
        }
        
        .chat-item:hover {
            transform: translateX(5px);
        }
        
        /* Анимация для модальных окон */
        .modal.active {
            animation: fadeIn 0.3s ease;
        }
        
        .modal-content {
            animation: scaleIn 0.3s ease;
        }
        
        /* Стили для пустых состояний */
        .empty-chat {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-color);
            opacity: 0.7;
        }
        
        .empty-chat i {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
        }
        
        /* Стили для сообщений */
        .message {
            margin-bottom: 10px;
            padding: 10px 15px;
            border-radius: 10px;
            animation: fadeIn 0.3s ease;
            max-width: 80%;
        }
        
        .my-message {
            background: linear-gradient(to right, #4facfe, #00f2fe);
            color: white;
            margin-left: auto;
            border-bottom-right-radius: 2px;
        }
        
        .other-message {
            background: var(--hover-color);
            color: var(--text-color);
            margin-right: auto;
            border-bottom-left-radius: 2px;
        }
        
        .post-message {
            background: var(--hover-color);
            border-left: 4px solid #9b59b6;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
        }
        
        /* Стили для превью файлов */
        .file-preview-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px;
            background: var(--hover-color);
            border-radius: 8px;
            margin-bottom: 5px;
            transition: all 0.2s ease;
        }
        
        .file-preview-item:hover {
            background: var(--primary-bg);
        }
        
        .remove-file-btn {
            background: none;
            border: none;
            color: #e74c3c;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        
        .remove-file-btn:hover {
            background: rgba(231, 76, 60, 0.1);
        }
    `;
    
    document.head.appendChild(style);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Quantum Messenger Channels v3.5 загружается...");
    
    // Добавляем стили для каналов
    addChannelsStyles();
    
    // Ждем инициализации Firebase и пользователя
    const initInterval = setInterval(() => {
        if (typeof database !== 'undefined' && userId) {
            clearInterval(initInterval);
            setTimeout(initChannelsSystem, 1000);
        }
    }, 500);
    
    // Резервная инициализация через 5 секунд
    setTimeout(() => {
        if (!channelsTab) {
            console.log("🔄 Резервная инициализация системы каналов...");
            initChannelsSystem();
        }
    }, 5000);
});

// Глобальная функция для скрытия плавающей кнопки при входе в любой чат
window.hideMobileMenuButton = function() {
    toggleMobileMenuButton(false);
};

// Глобальная функция для показа плавающей кнопки при выходе из чата
window.showMobileMenuButton = function() {
    toggleMobileMenuButton(true);
};

// Экспортируем функции для глобального доступа
window.ChannelsSystem = {
    init: initChannelsSystem,
    createChannel: showCreateChannelModal,
    openChannel: openChannel,
    backToChannels: backToChannelsList,
    version: '3.5'
};

console.log("✅ Quantum Messenger Channels System v3.5 loaded successfully!");