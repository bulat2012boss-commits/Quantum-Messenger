// mutual-groups.js - Функциональность общих групп для Quantum Messenger

// Глобальные переменные для общих групп
let mutualGroupsListener = null;
let currentContactForMutualGroups = null;

// Инициализация функционала общих групп
function initMutualGroups() {
    console.log("Инициализация функционала общих групп...");
    
    // Добавляем пункт меню для просмотра общих групп
    addMutualGroupsMenuItem();
    
    // Инициализируем обработчики событий
    initMutualGroupsEventListeners();
    
    // Добавляем CSS стили
    addMutualGroupsStyles();
}

// Добавление пункта меню для общих групп
function addMutualGroupsMenuItem() {
    // Добавляем в контекстное меню пользователя
    const mutualGroupsItem = document.createElement('div');
    mutualGroupsItem.className = 'chat-menu-item';
    mutualGroupsItem.id = 'mutualGroupsBtn';
    mutualGroupsItem.innerHTML = '<i class="fas fa-users"></i> Общие группы';
    
    // Вставляем перед кнопкой блокировки
    const blockUserBtn = document.getElementById('blockUserBtn');
    if (blockUserBtn) {
        blockUserBtn.parentNode.insertBefore(mutualGroupsItem, blockUserBtn);
    } else {
        // Если меню чата еще не создано, добавляем при создании
        setTimeout(addMutualGroupsMenuItem, 100);
    }
}

// Инициализация обработчиков событий для общих групп
function initMutualGroupsEventListeners() {
    // Обработчик для кнопки общих групп
    document.addEventListener('click', function(e) {
        if (e.target.closest('#mutualGroupsBtn')) {
            showMutualGroupsModal();
        }
    });
    
    // Перехватываем открытие информации о чате для добавления данных об общих группах
    const originalShowChatInfo = window.showChatInfo;
    if (originalShowChatInfo) {
        window.showChatInfo = function() {
            originalShowChatInfo.apply(this, arguments);
            setTimeout(() => {
                if (currentChatWith && currentChatWithName) {
                    addMutualGroupsToProfile(currentChatWith, currentChatWithName);
                }
            }, 100);
        };
    }
}

// Показ модального окна с общими группами
function showMutualGroupsModal() {
    if (!currentChatWith) {
        showNotification("Выберите контакт для просмотра общих групп");
        return;
    }
    
    currentContactForMutualGroups = currentChatWith;
    const contactName = currentChatWithName || 'пользователем';
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'mutualGroupsModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Общие группы</h3>
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px; color: #4facfe;">
                    <i class="fas fa-users"></i>
                </div>
                <p>Группы, в которых вы оба состоите</p>
                <p style="font-size: 14px; margin-top: 5px; opacity: 0.7;">с <strong>${contactName}</strong></p>
            </div>
            <div id="mutualGroupsList" style="max-height: 300px; overflow-y: auto; margin-bottom: 15px;">
                <div class="empty-chat">
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                    <p>Поиск общих групп...</p>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn secondary" id="closeMutualGroupsBtn">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Загружаем общие группы
    loadMutualGroups();
    
    // Обработчики для модального окна
    document.getElementById('closeMutualGroupsBtn').addEventListener('click', () => {
        closeMutualGroupsModal();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeMutualGroupsModal();
        }
    });
    
    // Закрытие меню чата
    if (document.getElementById('chatMenuContent')) {
        document.getElementById('chatMenuContent').classList.remove('active');
    }
}

// Закрытие модального окна общих групп
function closeMutualGroupsModal() {
    const modal = document.getElementById('mutualGroupsModal');
    if (modal) {
        document.body.removeChild(modal);
    }
    cleanupMutualGroupsListener();
}

// Загрузка общих групп
function loadMutualGroups() {
    const mutualGroupsList = document.getElementById('mutualGroupsList');
    if (!mutualGroupsList) return;
    
    // Удаляем предыдущий слушатель, если он есть
    cleanupMutualGroupsListener();
    
    // Слушаем изменения в группах
    mutualGroupsListener = database.ref('groups').on('value', (snapshot) => {
        mutualGroupsList.innerHTML = '';
        
        if (!snapshot.exists()) {
            mutualGroupsList.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-users"></i>
                    <p>Нет общих групп</p>
                    <p style="font-size: 14px; margin-top: 10px;">Вы не состоите вместе ни в одной группе</p>
                </div>
            `;
            return;
        }
        
        const groups = snapshot.val();
        let mutualGroups = [];
        
        // Ищем группы, где оба пользователя являются участниками
        Object.keys(groups).forEach(groupId => {
            const group = groups[groupId];
            
            if (group.members && 
                group.members[userId] && 
                group.members[currentContactForMutualGroups]) {
                mutualGroups.push({
                    id: groupId,
                    ...group
                });
            }
        });
        
        // Отображаем общие группы
        if (mutualGroups.length === 0) {
            mutualGroupsList.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-users"></i>
                    <p>Нет общих групп</p>
                    <p style="font-size: 14px; margin-top: 10px;">Вы не состоите вместе ни в одной группе</p>
                </div>
            `;
        } else {
            // Сортируем по активности
            mutualGroups.sort((a, b) => (b.lastActivity || b.createdAt) - (a.lastActivity || a.createdAt));
            
            // Показываем статистику
            const statsElement = document.createElement('div');
            statsElement.style.cssText = 'text-align: center; font-size: 14px; opacity: 0.7; margin-bottom: 15px; padding: 10px; background: var(--other-msg-bg); border-radius: 8px;';
            statsElement.innerHTML = `Найдено общих групп: <strong>${mutualGroups.length}</strong>`;
            mutualGroupsList.appendChild(statsElement);
            
            mutualGroups.forEach(groupData => {
                addMutualGroupToList(groupData);
            });
        }
    }, (error) => {
        console.error("Ошибка загрузки общих групп:", error);
        mutualGroupsList.innerHTML = `
            <div class="empty-chat">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Ошибка загрузки</p>
                <p style="font-size: 14px; margin-top: 10px;">Попробуйте позже</p>
            </div>
        `;
    });
}

// Добавление общей группы в список
function addMutualGroupToList(groupData) {
    const mutualGroupsList = document.getElementById('mutualGroupsList');
    if (!mutualGroupsList) return;
    
    const groupItem = document.createElement('div');
    groupItem.classList.add('user-item', 'mutual-group-item');
    groupItem.dataset.groupId = groupData.id;
    
    const membersCount = Object.keys(groupData.members || {}).length;
    const lastActivity = groupData.lastActivity ? new Date(groupData.lastActivity) : new Date(groupData.createdAt);
    const timeString = formatMutualGroupsTime(lastActivity);
    
    // Проверяем роль пользователя в группе
    const userRole = groupData.members[userId]?.role || 'member';
    const contactRole = groupData.members[currentContactForMutualGroups]?.role || 'member';
    const contactName = currentChatWithName || 'Пользователь';
    
    groupItem.innerHTML = `
        <div class="user-item-avatar" style="background: ${groupData.avatar ? 'transparent' : 'linear-gradient(to right, #ff7e5f, #feb47b)'}; overflow: hidden;">
            ${groupData.avatar ? 
                `<img src="${groupData.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                `<i class="fas fa-users" style="color: white;"></i>`
            }
        </div>
        <div class="user-item-info">
            <div class="user-item-name">
                ${groupData.name}
                ${userRole === 'admin' ? ' <i class="fas fa-crown" style="color: gold; font-size: 12px;" title="Вы администратор"></i>' : ''}
            </div>
            <div class="user-item-status">
                ${membersCount} участников • 
                ${userRole === 'admin' ? 'Вы: Админ' : 'Вы: Участник'} • 
                ${contactRole === 'admin' ? `${contactName}: Админ` : `${contactName}: Участник`}
            </div>
            <div class="user-item-status" style="font-size: 11px; opacity: 0.7;">
                Активность: ${timeString}
            </div>
        </div>
        <button class="open-group-btn" style="padding: 5px 10px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 12px;" title="Открыть группу">
            <i class="fas fa-external-link-alt"></i>
        </button>
    `;
    
    // Обработчик для кнопки открытия группы
    groupItem.querySelector('.open-group-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openGroupFromMutualList(groupData.id, groupData.name);
    });
    
    // Обработчик для клика по всей карточке группы
    groupItem.addEventListener('click', (e) => {
        if (!e.target.closest('.open-group-btn')) {
            showMutualGroupInfo(groupData);
        }
    });
    
    mutualGroupsList.appendChild(groupItem);
}

// Открытие группы из списка общих групп
function openGroupFromMutualList(groupId, groupName) {
    // Закрываем модальное окно общих групп
    closeMutualGroupsModal();
    
    // Закрываем чат если открыт
    if (chatWindow && chatWindow.style.display === 'flex') {
        backToChats();
    }
    
    // Открываем группу
    if (typeof openGroupChat === 'function') {
        openGroupChat(groupId, groupName);
    } else {
        showNotification("Функционал групп не доступен");
    }
}

// Показ информации о группе из списка общих групп
function showMutualGroupInfo(groupData) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'mutualGroupInfoModal';
    
    const members = groupData.members || {};
    const membersCount = Object.keys(members).length;
    const createdDate = new Date(groupData.createdAt).toLocaleDateString();
    const contactName = currentChatWithName || 'Пользователь';
    
    // Получаем информацию о ролях
    const userRole = members[userId]?.role || 'member';
    const contactRole = members[currentContactForMutualGroups]?.role || 'member';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Информация о группе</h3>
            <div style="text-align: center; margin-bottom: 20px;">
                <div class="group-avatar-preview" style="width: 80px; height: 80px; border-radius: 50%; background: ${groupData.avatar ? 'transparent' : 'linear-gradient(to right, #ff7e5f, #feb47b)'}; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white; margin: 0 auto 10px; overflow: hidden;">
                    ${groupData.avatar ? 
                        `<img src="${groupData.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                        `<i class="fas fa-users"></i>`
                    }
                </div>
                <h4 style="margin-bottom: 5px;">${groupData.name}</h4>
                <p style="font-size: 14px; color: var(--text-color); opacity: 0.8; margin-bottom: 10px;">${groupData.description || 'Описание отсутствует'}</p>
                <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: bold;">${membersCount}</div>
                        <div style="font-size: 12px;">участников</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: bold;">${groupData.settings?.public ? 'Публичная' : 'Закрытая'}</div>
                        <div style="font-size: 12px;">группа</div>
                    </div>
                </div>
                <div style="font-size: 12px; color: var(--text-color); opacity: 0.7;">Создана ${createdDate}</div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin-bottom: 10px;">Роли в группе</h4>
                <div class="user-item">
                    <div class="user-item-avatar" style="background: ${generateMutualGroupsUserColor()}">
                        ${currentUser ? currentUser.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div class="user-item-info">
                        <div class="user-item-name">${currentUser || 'Вы'} ${userRole === 'admin' ? '👑' : ''}</div>
                        <div class="user-item-status">${userRole === 'admin' ? 'Администратор' : 'Участник'}</div>
                    </div>
                </div>
                <div class="user-item">
                    <div class="user-item-avatar" style="background: ${generateMutualGroupsUserColor()}">
                        ${contactName.charAt(0).toUpperCase()}
                    </div>
                    <div class="user-item-info">
                        <div class="user-item-name">${contactName} ${contactRole === 'admin' ? '👑' : ''}</div>
                        <div class="user-item-status">${contactRole === 'admin' ? 'Администратор' : 'Участник'}</div>
                    </div>
                </div>
            </div>
            
            <div class="modal-buttons">
                <button class="modal-btn primary" id="openMutualGroupBtn">
                    <i class="fas fa-users"></i> Перейти в группу
                </button>
                <button class="modal-btn secondary" id="closeMutualGroupInfoBtn">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('openMutualGroupBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
        openGroupFromMutualList(groupData.id, groupData.name);
    });
    
    document.getElementById('closeMutualGroupInfoBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Очистка слушателя общих групп
function cleanupMutualGroupsListener() {
    if (mutualGroupsListener) {
        database.ref('groups').off('value', mutualGroupsListener);
        mutualGroupsListener = null;
    }
}

// Функция для проверки общих групп
function checkMutualGroups(contactId, contactName) {
    return new Promise((resolve) => {
        if (!contactId) {
            resolve(0);
            return;
        }
        
        database.ref('groups').once('value').then((snapshot) => {
            if (!snapshot.exists()) {
                resolve(0);
                return;
            }
            
            const groups = snapshot.val();
            let mutualCount = 0;
            
            Object.keys(groups).forEach(groupId => {
                const group = groups[groupId];
                
                if (group.members && 
                    group.members[userId] && 
                    group.members[contactId]) {
                    mutualCount++;
                }
            });
            
            resolve(mutualCount);
        }).catch(() => {
            resolve(0);
        });
    });
}

// Добавление информации об общих группах в профиль контакта
function addMutualGroupsToProfile(contactId, contactName) {
    if (!contactId) return;
    
    checkMutualGroups(contactId, contactName).then(count => {
        if (count > 0) {
            // Добавляем информацию в модальное окно информации о чате
            const chatInfoModal = document.getElementById('chatInfoModal');
            if (chatInfoModal && chatInfoModal.classList.contains('active')) {
                const existingMutualInfo = document.getElementById('mutualGroupsInfo');
                if (!existingMutualInfo) {
                    const profileInfo = chatInfoModal.querySelector('.profile-info');
                    if (profileInfo) {
                        const mutualInfo = document.createElement('div');
                        mutualInfo.id = 'mutualGroupsInfo';
                        mutualInfo.className = 'profile-info-item';
                        mutualInfo.innerHTML = `
                            <span class="profile-info-label">Общие группы:</span>
                            <span class="profile-info-value" style="color: #4facfe; cursor: pointer;" id="showMutualGroupsFromProfile">
                                ${count}
                            </span>
                        `;
                        
                        profileInfo.appendChild(mutualInfo);
                        
                        // Добавляем обработчик клика
                        document.getElementById('showMutualGroupsFromProfile').addEventListener('click', () => {
                            chatInfoModal.classList.remove('active');
                            showMutualGroupsModal();
                        });
                    }
                }
            }
        }
    });
}

// Вспомогательные функции
function formatMutualGroupsTime(date) {
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

function generateMutualGroupsUserColor() {
    const colors = [
        'linear-gradient(to right, #ff7e5f, #feb47b)',
        'linear-gradient(to right, #4facfe, #00f2fe)',
        'linear-gradient(to right, #a8edea, #fed6e3)',
        'linear-gradient(to right, #ffecd2, #fcb69f)',
        'linear-gradient(to right, #84fab0, #8fd3f4)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Функция для показа уведомлений (если не определена)
function showNotification(message) {
    if (window.showNotification) {
        window.showNotification(message);
    } else {
        // Создаем простое уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Добавление CSS стилей
function addMutualGroupsStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .mutual-groups-badge {
            background: linear-gradient(to right, #4facfe, #00f2fe);
            color: white;
            border-radius: 10px;
            padding: 2px 8px;
            font-size: 11px;
            margin-left: 5px;
        }

        .mutual-group-item {
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .mutual-group-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            background: rgba(255, 255, 255, 0.15) !important;
        }

        .open-group-btn {
            transition: all 0.2s ease;
        }

        .open-group-btn:hover {
            transform: scale(1.1);
            opacity: 0.9;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        /* Адаптивность для мобильных */
        @media (max-width: 768px) {
            .mutual-groups-badge {
                font-size: 10px;
                padding: 1px 6px;
            }
            
            .mutual-group-item {
                padding: 10px 8px;
            }
        }

        @media (max-width: 480px) {
            .mutual-group-item {
                padding: 8px;
            }
            
            .user-item-info .user-item-status {
                font-size: 12px;
            }
            
            .open-group-btn {
                padding: 4px 8px;
                font-size: 11px;
            }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Ждем инициализации Firebase и загрузки основных функций
    const checkInit = setInterval(() => {
        if (typeof database !== 'undefined' && typeof userId !== 'undefined' && userId) {
            clearInterval(checkInit);
            setTimeout(initMutualGroups, 500);
        }
    }, 100);
});

// Экспорт функций для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMutualGroups,
        showMutualGroupsModal,
        checkMutualGroups,
        addMutualGroupsToProfile
    };
}