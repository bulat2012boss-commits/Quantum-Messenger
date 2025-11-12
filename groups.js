// groups.js - Функциональность групп для Quantum Messenger

// Глобальные переменные для групп
let currentGroupId = null;
let currentGroupName = '';
let currentGroupRole = '';
let groupsListener = null;
let groupMessagesListener = null;
let typingListeners = {};
let groupAvatarUrl = '';

// Инициализация функционала групп
function initGroups() {
    // Добавляем вкладку "Группы" в интерфейс
    addGroupsTab();
    
    // Добавляем кнопку создания группы в бургер-меню
    addCreateGroupButton();
    
    // Инициализируем обработчики событий для групп
    initGroupsEventListeners();
    
    // Обрабатываем ссылки-приглашения
    handleGroupInviteLinks();
}

// Добавление вкладки "Группы" в интерфейс
function addGroupsTab() {
    // Находим контейнер вкладок
    const tabsContainer = document.querySelector('.tabs');
    
    // Создаем новую вкладку
    const groupsTab = document.createElement('div');
    groupsTab.className = 'tab';
    groupsTab.setAttribute('data-tab', 'groups');
    groupsTab.textContent = 'Группы';
    
    // Добавляем вкладку
    tabsContainer.appendChild(groupsTab);
    
    // Создаем контент для вкладки групп
    const groupsContent = document.createElement('div');
    groupsContent.className = 'tab-content';
    groupsContent.id = 'tab-groups';
    
    groupsContent.innerHTML = `
        <div class="search-container">
            <input type="text" id="searchGroupInput" placeholder="Поиск групп...">
            <button id="searchGroupBtn">
                <i class="fas fa-search"></i>
            </button>
            <button id="createGroupBtn" style="background: linear-gradient(to right, #ff7e5f, #feb47b);">
                <i class="fas fa-plus"></i> Создать
            </button>
        </div>
        <div class="chats-list" id="groupsList">
            <div class="empty-chat">
                <i class="fas fa-users"></i>
                <p>У вас пока нет групп</p>
                <p style="font-size: 14px; margin-top: 10px;">Создайте группу или вступите в существующую</p>
            </div>
        </div>
    `;
    
    // Добавляем контент в основной контейнер
    document.querySelector('.main-container').querySelector('.chat-wrapper').appendChild(groupsContent);
    
    // Обновляем обработчики вкладок
    updateTabsEventListeners();
}

// Добавление кнопки создания группы в бургер-меню
function addCreateGroupButton() {
    const createGroupItem = document.createElement('div');
    createGroupItem.className = 'burger-menu-item';
    createGroupItem.id = 'createGroupBtnMenu';
    createGroupItem.innerHTML = '<i class="fas fa-users"></i> Создать группу';
    
    // Вставляем перед кнопкой "О программе"
    const aboutBtn = document.getElementById('aboutBtn');
    aboutBtn.parentNode.insertBefore(createGroupItem, aboutBtn);
}

// Инициализация обработчиков событий для групп
function initGroupsEventListeners() {
    // Обработчик создания группы из меню
    document.getElementById('createGroupBtnMenu').addEventListener('click', showCreateGroupModal);
    
    // Обработчик создания группы из вкладки
    document.getElementById('createGroupBtn').addEventListener('click', showCreateGroupModal);
    
    // Обработчик поиска групп
    document.getElementById('searchGroupBtn').addEventListener('click', searchGroups);
    
    document.getElementById('searchGroupInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchGroups();
    });
}

// Обновление обработчиков вкладок
function updateTabsEventListeners() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Убираем активный класс у всех вкладок и контента
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс к выбранной вкладке и контенту
            tab.classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            // Загружаем соответствующие данные
            if (tabId === 'chats') {
                loadChatsList();
            } else if (tabId === 'groups') {
                loadGroupsList();
            } else if (tabId === 'search') {
                // Поиск пользователей
            }
        });
    });
}

// Показ модального окна создания группы
function showCreateGroupModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'createGroupModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Создание группы</h3>
            
            <div style="text-align: center; margin-bottom: 20px;">
                <div class="avatar-upload" style="position: relative; display: inline-block;">
                    <div class="group-avatar-preview" id="groupAvatarPreview" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(to right, #ff7e5f, #feb47b); display: flex; align-items: center; justify-content: center; font-size: 24px; color: white; margin: 0 auto 10px; overflow: hidden; cursor: pointer;">
                        <i class="fas fa-users" id="groupAvatarIcon"></i>
                        <img id="groupAvatarImg" style="width: 100%; height: 100%; object-fit: cover; display: none;">
                    </div>
                    <input type="file" id="groupAvatarInput" accept="image/*" style="display: none;">
                    <button id="changeAvatarBtn" style="position: absolute; bottom: 0; right: 0; background: #4facfe; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 12px;">
                        <i class="fas fa-camera"></i>
                    </button>
                </div>
                <div style="font-size: 12px; color: var(--text-color); opacity: 0.7;">Нажмите для загрузки аватарки</div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <input type="text" id="groupNameInput" placeholder="Название группы" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-color);">
                <textarea id="groupDescriptionInput" placeholder="Описание группы (необязательно)" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-color); height: 80px; resize: vertical;"></textarea>
                
                <div class="settings-section" style="margin-top: 15px;">
                    <h4 style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-cog"></i> Настройки группы
                    </h4>
                    <div class="settings-option">
                        <span>Публичная группа</span>
                        <label class="switch">
                            <input type="checkbox" id="publicGroupToggle" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="settings-option">
                        <span>Требуется одобрение вступления</span>
                        <label class="switch">
                            <input type="checkbox" id="approvalRequiredToggle">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="settings-option">
                        <span>Только админы пишут</span>
                        <label class="switch">
                            <input type="checkbox" id="adminsOnlyToggle">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="settings-option">
                        <span>Показывать кто печатает</span>
                        <label class="switch">
                            <input type="checkbox" id="showTypingToggle" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="settings-option">
                        <span>Разрешить реакции</span>
                        <label class="switch">
                            <input type="checkbox" id="allowReactionsToggle" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn primary" id="confirmCreateGroupBtn">Создать</button>
                <button class="modal-btn secondary" id="cancelCreateGroupBtn">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Инициализация загрузки аватарки
    initAvatarUpload();
    
    // Обработчики для модального окна
    document.getElementById('confirmCreateGroupBtn').addEventListener('click', createGroup);
    document.getElementById('cancelCreateGroupBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Фокус на поле ввода названия
    document.getElementById('groupNameInput').focus();
}

// Инициализация загрузки аватарки
function initAvatarUpload() {
    const avatarPreview = document.getElementById('groupAvatarPreview');
    const avatarInput = document.getElementById('groupAvatarInput');
    const avatarIcon = document.getElementById('groupAvatarIcon');
    const avatarImg = document.getElementById('groupAvatarImg');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    
    avatarPreview.addEventListener('click', () => {
        avatarInput.click();
    });
    
    changeAvatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        avatarInput.click();
    });
    
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarImg.src = e.target.result;
                avatarImg.style.display = 'block';
                avatarIcon.style.display = 'none';
                groupAvatarUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Создание группы
function createGroup() {
    const groupName = document.getElementById('groupNameInput').value.trim();
    const groupDescription = document.getElementById('groupDescriptionInput').value.trim();
    const isPublic = document.getElementById('publicGroupToggle').checked;
    const approvalRequired = document.getElementById('approvalRequiredToggle').checked;
    const adminsOnly = document.getElementById('adminsOnlyToggle').checked;
    const showTyping = document.getElementById('showTypingToggle').checked;
    const allowReactions = document.getElementById('allowReactionsToggle').checked;
    
    if (!groupName) {
        showNotification("Введите название группы");
        return;
    }
    
    const groupId = 'group_' + generateUniqueId();
    const inviteLink = generateInviteLink(groupId);
    
    const groupData = {
        id: groupId,
        name: groupName,
        description: groupDescription || '',
        avatar: groupAvatarUrl || '',
        creator: userId,
        creatorName: currentUser,
        createdAt: Date.now(),
        members: {
            [userId]: {
                id: userId,
                name: currentUser,
                role: 'admin',
                joinedAt: Date.now(),
                isOnline: true
            }
        },
        inviteLink: inviteLink,
        settings: {
            public: isPublic,
            approvalRequired: approvalRequired,
            adminsOnly: adminsOnly,
            showTyping: showTyping,
            allowReactions: allowReactions,
            maxMembers: 100
        },
        lastActivity: Date.now()
    };
    
    // Сохраняем группу в базе данных
    database.ref('groups/' + groupId).set(groupData)
        .then(() => {
            showNotification(`Группа "${groupName}" создана!`);
            
            // Закрываем модальное окно
            const modal = document.getElementById('createGroupModal');
            if (modal) {
                document.body.removeChild(modal);
            }
            
            // Показываем модальное окно с ссылкой-приглашением
            showInviteLinkModal(groupName, inviteLink, groupId);
            
            // Переключаемся на вкладку групп
            switchToGroupsTab();
        })
        .catch((error) => {
            console.error("Ошибка создания группы:", error);
            showNotification("Ошибка создания группы");
        });
}

// Генерация уникального ID
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Генерация ссылки-приглашения
function generateInviteLink(groupId) {
    return `${window.location.origin}${window.location.pathname}?join_group=${groupId}`;
}

// Показ модального окна с ссылкой-приглашением
function showInviteLinkModal(groupName, inviteLink, groupId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'inviteLinkModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Приглашение в группу</h3>
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px; color: #ff7e5f;">
                    <i class="fas fa-user-plus"></i>
                </div>
                <p>Группа "<strong>${groupName}</strong>" создана!</p>
                <p style="font-size: 14px; margin-top: 10px;">Отправьте эту ссылку для приглашения:</p>
            </div>
            <div style="display: flex; margin-bottom: 20px;">
                <input type="text" id="inviteLinkInput" value="${inviteLink}" readonly style="flex: 1; padding: 10px; border-radius: 5px 0 0 5px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-color); font-size: 12px;">
                <button id="copyInviteLinkBtn" style="padding: 10px 15px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 0 5px 5px 0; cursor: pointer;">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            <div style="margin-bottom: 15px;">
                <button class="modal-btn" id="shareInChatBtn" style="width: 100%; margin-bottom: 10px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-paper-plane"></i> Отправить в личные сообщения
                </button>
                <button class="modal-btn" id="shareInGroupBtn" style="width: 100%; margin-bottom: 10px; background: linear-gradient(to right, #ff7e5f, #feb47b); color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-share-alt"></i> Поделиться в других группах
                </button>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn primary" id="openGroupBtn">
                    <i class="fas fa-users"></i> Перейти в группу
                </button>
                <button class="modal-btn secondary" id="closeInviteLinkBtn">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики для модального окна
    document.getElementById('copyInviteLinkBtn').addEventListener('click', () => {
        const linkInput = document.getElementById('inviteLinkInput');
        linkInput.select();
        document.execCommand('copy');
        showNotification("Ссылка скопирована в буфер обмена");
    });
    
    document.getElementById('shareInChatBtn').addEventListener('click', () => {
        shareGroupInChat(inviteLink, groupName);
        document.body.removeChild(modal);
    });
    
    document.getElementById('shareInGroupBtn').addEventListener('click', () => {
        shareGroupInOtherGroups(inviteLink, groupName);
        document.body.removeChild(modal);
    });
    
    document.getElementById('openGroupBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
        openGroupChat(groupId, groupName);
    });
    
    document.getElementById('closeInviteLinkBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Отправка ссылки на группу в личные сообщения
function shareGroupInChat(inviteLink, groupName) {
    // Показываем список чатов для выбора
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'shareGroupModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Отправить приглашение</h3>
            <p style="text-align: center; margin-bottom: 15px;">Выберите чат для отправки приглашения в группу "${groupName}"</p>
            <div id="chatsForSharing" style="max-height: 300px; overflow-y: auto;">
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn secondary" id="cancelShareBtn">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Загружаем список чатов
    loadChatsForSharing(inviteLink, groupName);
    
    document.getElementById('cancelShareBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Поделиться ссылкой в других группах
function shareGroupInOtherGroups(inviteLink, groupName) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'shareInGroupsModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Поделиться в группах</h3>
            <p style="text-align: center; margin-bottom: 15px;">Выберите группу для отправки приглашения в группу "${groupName}"</p>
            <div id="groupsForSharing" style="max-height: 300px; overflow-y: auto;">
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn secondary" id="cancelShareGroupsBtn">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Загружаем список групп
    loadGroupsForSharing(inviteLink, groupName);
    
    document.getElementById('cancelShareGroupsBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Загрузка групп для отправки приглашения
function loadGroupsForSharing(inviteLink, groupName) {
    const groupsContainer = document.getElementById('groupsForSharing');
    
    database.ref('groups').once('value').then((snapshot) => {
        groupsContainer.innerHTML = '';
        
        if (!snapshot.exists()) {
            groupsContainer.innerHTML = '<div class="empty-chat"><p>Нет групп для отправки</p></div>';
            return;
        }
        
        const groups = snapshot.val();
        let userGroups = [];
        
        // Собираем все группы пользователя (кроме текущей создаваемой)
        Object.keys(groups).forEach(groupId => {
            const group = groups[groupId];
            
            if (group.members && group.members[userId]) {
                userGroups.push({
                    id: groupId,
                    name: group.name,
                    ...group
                });
            }
        });
        
        // Отображаем группы
        if (userGroups.length === 0) {
            groupsContainer.innerHTML = '<div class="empty-chat"><p>Нет групп для отправки</p></div>';
        } else {
            userGroups.forEach(group => {
                const groupItem = document.createElement('div');
                groupItem.className = 'user-item';
                groupItem.innerHTML = `
                    <div class="user-item-avatar" style="background: ${group.avatar ? 'transparent' : 'linear-gradient(to right, #ff7e5f, #feb47b)'}; overflow: hidden;">
                        ${group.avatar ? 
                            `<img src="${group.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                            `<i class="fas fa-users" style="color: white;"></i>`
                        }
                    </div>
                    <div class="user-item-info">
                        <div class="user-item-name">${group.name}</div>
                        <div class="user-item-status">${Object.keys(group.members || {}).length} участников</div>
                    </div>
                    <button class="send-invite-btn" data-group-id="${group.id}" data-group-name="${group.name}" style="padding: 5px 10px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 12px;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                `;
                
                groupItem.querySelector('.send-invite-btn').addEventListener('click', () => {
                    sendGroupInviteToGroup(group.id, group.name, inviteLink, groupName);
                    document.body.removeChild(document.getElementById('shareInGroupsModal'));
                });
                
                groupsContainer.appendChild(groupItem);
            });
        }
    });
}

// Отправка приглашения в другую группу
function sendGroupInviteToGroup(targetGroupId, targetGroupName, inviteLink, groupName) {
    const messageId = database.ref('groupMessages').push().key;
    const timestamp = Date.now();
    
    const messageData = {
        id: messageId,
        text: `Присоединяйтесь к новой группе "${groupName}"`,
        senderId: userId,
        senderName: currentUser,
        groupId: targetGroupId,
        groupName: targetGroupName,
        timestamp: timestamp,
        isGroupInvite: true,
        groupLink: inviteLink,
        inviteGroupName: groupName,
        inviteData: {
            groupLink: inviteLink,
            groupName: groupName,
            timestamp: timestamp
        }
    };
    
    database.ref('groupMessages/' + messageId).set(messageData)
        .then(() => {
            showNotification(`Приглашение отправлено в группу "${targetGroupName}"`);
            
            // Обновляем активность группы
            database.ref('groups/' + targetGroupId).update({
                lastActivity: timestamp
            });
        })
        .catch((error) => {
            console.error("Ошибка отправки приглашения:", error);
            showNotification("Ошибка отправки приглашения");
        });
}

// Загрузка чатов для отправки приглашения
function loadChatsForSharing(inviteLink, groupName) {
    const chatsContainer = document.getElementById('chatsForSharing');
    
    database.ref('chats').once('value').then((snapshot) => {
        chatsContainer.innerHTML = '';
        
        if (!snapshot.exists()) {
            chatsContainer.innerHTML = '<div class="empty-chat"><p>Нет чатов для отправки</p></div>';
            return;
        }
        
        const chats = snapshot.val();
        let userChats = [];
        
        // Собираем все чаты пользователя
        Object.keys(chats).forEach(chatId => {
            const chat = chats[chatId];
            
            if (chat.participants && chat.participants[userId]) {
                // Находим собеседника
                let otherUserId = null;
                let otherUserName = '';
                Object.keys(chat.participants).forEach(participantId => {
                    if (participantId !== userId) {
                        otherUserId = participantId;
                        otherUserName = chat.participants[participantId].name;
                    }
                });
                
                if (otherUserId) {
                    userChats.push({
                        id: chatId,
                        otherUserId: otherUserId,
                        otherUserName: otherUserName,
                        ...chat
                    });
                }
            }
        });
        
        // Отображаем чаты
        if (userChats.length === 0) {
            chatsContainer.innerHTML = '<div class="empty-chat"><p>Нет чатов для отправки</p></div>';
        } else {
            userChats.forEach(chat => {
                const chatItem = document.createElement('div');
                chatItem.className = 'user-item';
                chatItem.innerHTML = `
                    <div class="user-item-avatar" style="background: ${generateUserColor()}">
                        ${chat.otherUserName.charAt(0).toUpperCase()}
                    </div>
                    <div class="user-item-info">
                        <div class="user-item-name">${chat.otherUserName}</div>
                    </div>
                    <button class="send-invite-btn" data-user-id="${chat.otherUserId}" data-user-name="${chat.otherUserName}" style="padding: 5px 10px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 12px;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                `;
                
                chatItem.querySelector('.send-invite-btn').addEventListener('click', () => {
                    sendGroupInviteToUser(chat.otherUserId, chat.otherUserName, inviteLink, groupName);
                    document.body.removeChild(document.getElementById('shareGroupModal'));
                });
                
                chatsContainer.appendChild(chatItem);
            });
        }
    });
}

// Отправка приглашения пользователю
function sendGroupInviteToUser(otherUserId, otherUserName, inviteLink, groupName) {
    const messageId = database.ref('messages').push().key;
    const timestamp = Date.now();
    
    const messageData = {
        id: messageId,
        text: `Привет! Присоединяйся к моей группе "${groupName}"`,
        senderId: userId,
        senderName: currentUser,
        receiverId: otherUserId,
        receiverName: otherUserName,
        timestamp: timestamp,
        isGroupInvite: true,
        groupLink: inviteLink,
        groupName: groupName,
        inviteData: {
            groupLink: inviteLink,
            groupName: groupName,
            timestamp: timestamp
        }
    };
    
    database.ref('messages/' + messageId).set(messageData)
        .then(() => {
            showNotification(`Приглашение отправлено ${otherUserName}`);
            
            // Создаем или обновляем чат
            const chatId = generateChatId(otherUserId);
            updateChatInfo(chatId, `Приглашение в группу: ${groupName}`, timestamp);
        })
        .catch((error) => {
            console.error("Ошибка отправки приглашения:", error);
            showNotification("Ошибка отправки приглашения");
        });
}

// Переключение на вкладку групп
function switchToGroupsTab() {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector('.tab[data-tab="groups"]').classList.add('active');
    document.getElementById('tab-groups').classList.add('active');
    
    loadGroupsList();
}

// Загрузка списка групп
function loadGroupsList() {
    const groupsList = document.getElementById('groupsList');
    groupsList.innerHTML = `
        <div class="empty-chat">
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <p>Загрузка групп...</p>
        </div>
    `;
    
    // Удаляем предыдущий слушатель, если он есть
    if (groupsListener) {
        database.ref('groups').off('value', groupsListener);
    }
    
    // Слушаем изменения в группах
    groupsListener = database.ref('groups').on('value', (snapshot) => {
        groupsList.innerHTML = '';
        
        if (!snapshot.exists()) {
            groupsList.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-users"></i>
                    <p>У вас пока нет групп</p>
                    <p style="font-size: 14px; margin-top: 10px;">Создайте группу или вступите в существующую</p>
                </div>
            `;
            return;
        }
        
        const groups = snapshot.val();
        let userGroups = [];
        
        // Фильтруем группы, где пользователь является участником
        Object.keys(groups).forEach(groupId => {
            const group = groups[groupId];
            if (group.members && group.members[userId]) {
                userGroups.push({
                    id: groupId,
                    ...group
                });
            }
        });
        
        // Сортируем группы по времени последней активности
        userGroups.sort((a, b) => (b.lastActivity || b.createdAt) - (a.lastActivity || a.createdAt));
        
        // Отображаем группы
        if (userGroups.length === 0) {
            groupsList.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-users"></i>
                    <p>У вас пока нет групп</p>
                    <p style="font-size: 14px; margin-top: 10px;">Создайте группу или вступите в существующую</p>
                </div>
            `;
        } else {
            userGroups.forEach(groupData => {
                addGroupToList(groupData);
            });
        }
    });
}

// Добавление группы в список
function addGroupToList(groupData) {
    const groupItem = document.createElement('div');
    groupItem.classList.add('chat-item');
    groupItem.dataset.groupId = groupData.id;
    
    const membersCount = Object.keys(groupData.members || {}).length;
    const lastActivity = groupData.lastActivity ? new Date(groupData.lastActivity) : new Date(groupData.createdAt);
    const timeString = formatTime(lastActivity);
    
    // Проверяем роль пользователя в группе
    const userRole = groupData.members[userId]?.role || 'member';
    const isAdmin = userRole === 'admin';
    
    groupItem.innerHTML = `
        <div class="chat-item-avatar" style="background: ${groupData.avatar ? 'transparent' : 'linear-gradient(to right, #ff7e5f, #feb47b)'}; overflow: hidden;">
            ${groupData.avatar ? 
                `<img src="${groupData.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                `<i class="fas fa-users" style="color: white;"></i>`
            }
        </div>
        <div class="chat-item-info">
            <div class="chat-item-header">
                <div class="chat-item-name">
                    ${groupData.name}
                    ${isAdmin ? ' <i class="fas fa-crown" style="color: gold; font-size: 12px;"></i>' : ''}
                </div>
                <div class="chat-item-time">${timeString}</div>
            </div>
            <div class="chat-item-last-message">
                ${groupData.description || 'Групповой чат'} • ${membersCount} участников
            </div>
        </div>
    `;
    
    groupItem.addEventListener('click', () => {
        openGroupChat(groupData.id, groupData.name);
    });
    
    // Добавляем обработчик долгого нажатия для мобильных
    let pressTimer;
    groupItem.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
            showGroupContextMenu(groupData, e);
        }, 500);
    });
    
    groupItem.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
    });
    
    groupItem.addEventListener('touchmove', () => {
        clearTimeout(pressTimer);
    });
    
    document.getElementById('groupsList').appendChild(groupItem);
}

// Контекстное меню для групп (мобильные)
function showGroupContextMenu(groupData, event) {
    event.preventDefault();
    
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.cssText = `
        position: fixed;
        left: ${event.touches[0].clientX}px;
        top: ${event.touches[0].clientY}px;
        background: var(--header-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 8px 0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1000;
        min-width: 150px;
    `;
    
    const userRole = groupData.members[userId]?.role || 'member';
    const isAdmin = userRole === 'admin';
    
    contextMenu.innerHTML = `
        <div class="context-menu-item" data-action="open">
            <i class="fas fa-comments"></i> Открыть
        </div>
        <div class="context-menu-item" data-action="invite">
            <i class="fas fa-user-plus"></i> Пригласить
        </div>
        <div class="context-menu-item" data-action="info">
            <i class="fas fa-info-circle"></i> Информация
        </div>
        ${isAdmin ? `
        <div class="context-menu-item" data-action="settings">
            <i class="fas fa-cog"></i> Настройки
        </div>
        ` : ''}
        <div class="context-menu-item" data-action="leave" style="color: #ff6b6b;">
            <i class="fas fa-sign-out-alt"></i> Покинуть
        </div>
    `;
    
    document.body.appendChild(contextMenu);
    
    // Обработчики для пунктов меню
    contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            handleGroupContextAction(action, groupData);
            document.body.removeChild(contextMenu);
        });
        
        // Стили для пунктов меню
        item.style.cssText = `
            padding: 10px 15px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background 0.2s;
        `;
        
        item.addEventListener('mouseenter', () => {
            item.style.background = 'var(--other-msg-bg)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.background = 'transparent';
        });
    });
    
    // Закрытие меню при клике вне его
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            if (contextMenu.parentNode) {
                document.body.removeChild(contextMenu);
            }
            document.removeEventListener('click', closeMenu);
        });
    }, 100);
}

// Обработка действий контекстного меню
function handleGroupContextAction(action, groupData) {
    switch (action) {
        case 'open':
            openGroupChat(groupData.id, groupData.name);
            break;
        case 'invite':
            showInviteLinkModal(groupData.name, groupData.inviteLink, groupData.id);
            break;
        case 'info':
            showGroupInfoModal(groupData.id, groupData);
            break;
        case 'settings':
            if (currentGroupRole === 'admin') {
                showGroupSettings();
            }
            break;
        case 'leave':
            leaveGroup();
            break;
    }
}

// Показ информации о группе
function showGroupInfoModal(groupId, group) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'groupInfoModal';
    
    const members = group.members || {};
    const membersCount = Object.keys(members).length;
    const createdDate = new Date(group.createdAt).toLocaleDateString();
    
    let membersList = '';
    Object.keys(members).forEach(memberId => {
        const member = members[memberId];
        membersList += `
            <div class="user-item">
                <div class="user-item-avatar" style="background: ${generateUserColor()}">
                    ${member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div class="user-item-info">
                    <div class="user-item-name">${member.name} ${member.role === 'admin' ? '👑' : ''}</div>
                    <div class="user-item-status ${member.isOnline ? 'online' : 'offline'}">${member.role === 'admin' ? 'Администратор' : 'Участник'} • ${member.isOnline ? 'Онлайн' : 'Оффлайн'}</div>
                </div>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Информация о группе</h3>
            <div style="text-align: center; margin-bottom: 20px;">
                <div class="group-avatar-preview" style="width: 80px; height: 80px; border-radius: 50%; background: ${group.avatar ? 'transparent' : 'linear-gradient(to right, #ff7e5f, #feb47b)'}; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white; margin: 0 auto 10px; overflow: hidden;">
                    ${group.avatar ? 
                        `<img src="${group.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                        `<i class="fas fa-users"></i>`
                    }
                </div>
                <h4 style="margin-bottom: 5px;">${group.name}</h4>
                <p style="font-size: 14px; color: var(--text-color); opacity: 0.8; margin-bottom: 10px;">${group.description || 'Описание отсутствует'}</p>
                <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: bold;">${membersCount}</div>
                        <div style="font-size: 12px;">участников</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: bold;">${group.settings?.public ? 'Публичная' : 'Закрытая'}</div>
                        <div style="font-size: 12px;">группа</div>
                    </div>
                </div>
                <div style="font-size: 12px; color: var(--text-color); opacity: 0.7;">Создана ${createdDate}</div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin-bottom: 10px;">Участники (${membersCount})</h4>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${membersList}
                </div>
            </div>
            
            <div class="modal-buttons">
                <button class="modal-btn secondary" id="closeGroupInfoBtn">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeGroupInfoBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Открытие группового чата
function openGroupChat(groupId, groupName) {
    currentGroupId = groupId;
    currentGroupName = groupName;
    
    // Получаем информацию о группе и роли пользователя
    database.ref('groups/' + groupId).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            showNotification("Группа не найдена");
            return;
        }
        
        const group = snapshot.val();
        currentGroupRole = group.members[userId]?.role || 'member';
        groupAvatarUrl = group.avatar || '';
        
        // Создаем интерфейс группового чата
        createGroupChatInterface(group);
        
        // Загружаем сообщения группы
        loadGroupMessages(groupId);
        
        // Инициализируем отслеживание печати
        initTypingIndicator(groupId);
        
        // Фокусируемся на поле ввода
        setTimeout(() => {
            const groupMessageInput = document.getElementById('groupMessageInput');
            if (groupMessageInput) {
                groupMessageInput.focus();
            }
        }, 100);
    });
}

// Создание интерфейса группового чата
function createGroupChatInterface(group) {
    // Скрываем основные контейнеры
    document.getElementById('chatWrapper').style.display = 'none';
    document.getElementById('chatWindow').style.display = 'none';
    
    // Создаем контейнер для группового чата, если его нет
    let groupChatContainer = document.getElementById('groupChatContainer');
    if (!groupChatContainer) {
        groupChatContainer = document.createElement('div');
        groupChatContainer.className = 'chat-wrapper';
        groupChatContainer.id = 'groupChatContainer';
        groupChatContainer.style.display = 'flex';
        
        document.querySelector('.main-container').appendChild(groupChatContainer);
    }
    
    const isAdmin = currentGroupRole === 'admin';
    const canWrite = isAdmin || !group.settings.adminsOnly;
    const showTyping = group.settings.showTyping;
    const allowReactions = group.settings.allowReactions;
    
    groupChatContainer.innerHTML = `
        <div class="chat-header">
            <div class="chat-header-info">
                <button class="burger-menu" id="backToGroupsBtn">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <div class="user-avatar" style="background: ${groupAvatarUrl ? 'transparent' : 'linear-gradient(to right, #ff7e5f, #feb47b)'}; overflow: hidden;">
                    ${groupAvatarUrl ? 
                        `<img src="${groupAvatarUrl}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                        `<i class="fas fa-users" style="color: white;"></i>`
                    }
                </div>
                <div class="user-name">
                    <span id="groupChatName">${currentGroupName}</span>
                    <span id="groupChatInfo" style="font-size: 11px; opacity: 0.7;">
                        Групповой чат • ${Object.keys(group.members || {}).length} участников
                        ${!canWrite ? ' • Только чтение' : ''}
                    </span>
                    <div id="typingIndicator" style="font-size: 10px; color: #4facfe; height: 15px; margin-top: 2px;"></div>
                </div>
            </div>
            <div class="chat-header-actions">
                <button class="chat-menu" id="groupMenuBtn">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="chat-menu-content" id="groupMenuContent">
                    <div class="chat-menu-item" id="groupInfoBtn">
                        <i class="fas fa-info-circle"></i> Информация о группе
                    </div>
                    <div class="chat-menu-item" id="groupMembersBtn">
                        <i class="fas fa-users"></i> Участники
                    </div>
                    <div class="chat-menu-item" id="groupInviteBtn">
                        <i class="fas fa-user-plus"></i> Пригласить
                    </div>
                    ${isAdmin ? `
                    <div class="chat-menu-item" id="groupSettingsBtn">
                        <i class="fas fa-cog"></i> Настройки группы
                    </div>
                    <div class="chat-menu-item" id="manageMembersBtn">
                        <i class="fas fa-user-cog"></i> Управление участниками
                    </div>
                    <div class="chat-menu-item" id="changeGroupAvatarBtn">
                        <i class="fas fa-camera"></i> Сменить аватар
                    </div>
                    ` : ''}
                    <div class="chat-menu-item" id="clearGroupChatBtn">
                        <i class="fas fa-broom"></i> Очистить историю
                    </div>
                    <div class="chat-menu-item danger" id="leaveGroupBtn">
                        <i class="fas fa-sign-out-alt"></i> Покинуть группу
                    </div>
                </div>
            </div>
        </div>
        
        <div class="messages-wrapper" id="groupMessagesContainer">
            <div class="empty-chat">
                <i class="fas fa-comments"></i>
                <p>Начните общение в группе</p>
            </div>
        </div>
        
        <div class="input-area" ${!canWrite ? 'style="display: none;"' : ''}>
            <input type="text" id="groupMessageInput" placeholder="Введите сообщение..." autocomplete="off" ${!canWrite ? 'disabled' : ''}>
            <button id="sendGroupMessageBtn" disabled ${!canWrite ? 'disabled' : ''}>
                <i class="fas fa-paper-plane"></i> <span>Отправить</span>
            </button>
        </div>
        
        ${!canWrite ? `
        <div style="padding: 15px; text-align: center; background: var(--other-msg-bg); color: var(--text-color); font-size: 14px;">
            <i class="fas fa-info-circle"></i> В этой группе могут писать только администраторы
        </div>
        ` : ''}
        
        <!-- Попап для реакций -->
        <div id="reactionsPopup" class="reactions-popup" style="display: none;">
            <div class="reactions-container">
                <span class="reaction" data-reaction="👍">👍</span>
                <span class="reaction" data-reaction="❤️">❤️</span>
                <span class="reaction" data-reaction="😂">😂</span>
                <span class="reaction" data-reaction="😮">😮</span>
                <span class="reaction" data-reaction="😢">😢</span>
                <span class="reaction" data-reaction="😡">😡</span>
            </div>
        </div>
    `;
    
    groupChatContainer.style.display = 'flex';
    
    // Инициализируем обработчики для группового чата
    initGroupChatEventListeners(group);
}

// Инициализация обработчиков для группового чата
function initGroupChatEventListeners(group) {
    // Кнопка возврата к группам
    document.getElementById('backToGroupsBtn').addEventListener('click', backToGroups);
    
    // Меню группы
    document.getElementById('groupMenuBtn').addEventListener('click', () => {
        document.getElementById('groupMenuContent').classList.toggle('active');
    });
    
    // Пункты меню группы
    document.getElementById('groupInfoBtn').addEventListener('click', showGroupInfoFromChat);
    document.getElementById('groupMembersBtn').addEventListener('click', showGroupMembers);
    document.getElementById('groupInviteBtn').addEventListener('click', showGroupInviteModal);
    document.getElementById('clearGroupChatBtn').addEventListener('click', clearGroupChatHistory);
    document.getElementById('leaveGroupBtn').addEventListener('click', leaveGroup);
    
    // Дополнительные пункты для админов
    if (currentGroupRole === 'admin') {
        document.getElementById('groupSettingsBtn').addEventListener('click', showGroupSettings);
        document.getElementById('manageMembersBtn').addEventListener('click', showManageMembers);
        document.getElementById('changeGroupAvatarBtn').addEventListener('click', changeGroupAvatar);
    }
    
    // Отправка сообщений
    const groupMessageInput = document.getElementById('groupMessageInput');
    const sendGroupMessageBtn = document.getElementById('sendGroupMessageBtn');
    
    if (groupMessageInput && sendGroupMessageBtn) {
        groupMessageInput.addEventListener('input', () => {
            sendGroupMessageBtn.disabled = groupMessageInput.value.trim() === '';
            handleTyping(true);
        });
        
        groupMessageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleTyping(false);
                sendGroupMessage();
            }
        });
        
        groupMessageInput.addEventListener('blur', () => {
            handleTyping(false);
        });
        
        sendGroupMessageBtn.addEventListener('click', () => {
            handleTyping(false);
            sendGroupMessage();
        });
    }
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!document.getElementById('groupMenuBtn').contains(e.target) && 
            !document.getElementById('groupMenuContent').contains(e.target)) {
            document.getElementById('groupMenuContent').classList.remove('active');
        }
        
        // Закрытие попапа реакций
        if (!document.getElementById('reactionsPopup').contains(e.target)) {
            document.getElementById('reactionsPopup').style.display = 'none';
        }
    });
}

// Обработка индикатора печати
function handleTyping(isTyping) {
    if (!currentGroupId || !document.getElementById('groupMessageInput')) return;
    
    const typingRef = database.ref(`groups/${currentGroupId}/typing/${userId}`);
    
    if (isTyping) {
        typingRef.set({
            userName: currentUser,
            timestamp: Date.now()
        });
        
        // Автоматически удаляем статус печати через 3 секунды
        setTimeout(() => {
            typingRef.remove();
        }, 3000);
    } else {
        typingRef.remove();
    }
}

// Инициализация отслеживания печати
function initTypingIndicator(groupId) {
    const typingIndicator = document.getElementById('typingIndicator');
    if (!typingIndicator) return;
    
    // Удаляем предыдущий слушатель
    if (typingListeners[groupId]) {
        database.ref(`groups/${groupId}/typing`).off('value', typingListeners[groupId]);
    }
    
    // Слушаем изменения статуса печати
    typingListeners[groupId] = database.ref(`groups/${groupId}/typing`).on('value', (snapshot) => {
        if (!snapshot.exists()) {
            typingIndicator.innerHTML = '';
            return;
        }
        
        const typingData = snapshot.val();
        const typingUsers = [];
        
        Object.keys(typingData).forEach(typingUserId => {
            if (typingUserId !== userId) {
                const typingUser = typingData[typingUserId];
                // Проверяем, что статус не устарел (менее 4 секунд)
                if (Date.now() - typingUser.timestamp < 4000) {
                    typingUsers.push(typingUser.userName);
                }
            }
        });
        
        if (typingUsers.length > 0) {
            let text = '';
            if (typingUsers.length === 1) {
                text = `${typingUsers[0]} печатает...`;
            } else if (typingUsers.length === 2) {
                text = `${typingUsers[0]} и ${typingUsers[1]} печатают...`;
            } else {
                text = `${typingUsers[0]}, ${typingUsers[1]} и другие печатают...`;
            }
            typingIndicator.innerHTML = `<i class="fas fa-pencil-alt"></i> ${text}`;
        } else {
            typingIndicator.innerHTML = '';
        }
    });
}

// Возврат к списку групп
function backToGroups() {
    const groupChatContainer = document.getElementById('groupChatContainer');
    if (groupChatContainer) {
        groupChatContainer.style.display = 'none';
    }
    document.getElementById('chatWrapper').style.display = 'flex';
    
    // Удаляем слушатель сообщений группы
    if (groupMessagesListener) {
        database.ref('groupMessages').off('value', groupMessagesListener);
        groupMessagesListener = null;
    }
    
    // Удаляем слушатель печати
    if (currentGroupId && typingListeners[currentGroupId]) {
        database.ref(`groups/${currentGroupId}/typing`).off('value', typingListeners[currentGroupId]);
        delete typingListeners[currentGroupId];
    }
    
    currentGroupId = null;
    currentGroupName = '';
    currentGroupRole = '';
    groupAvatarUrl = '';
}

// Загрузка сообщений группы
function loadGroupMessages(groupId) {
    const groupMessagesContainer = document.getElementById('groupMessagesContainer');
    groupMessagesContainer.innerHTML = '<div class="empty-chat"><div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div><p>Загрузка сообщений...</p></div>';
    
    // Удаляем предыдущий слушатель, если он есть
    if (groupMessagesListener) {
        database.ref('groupMessages').off('value', groupMessagesListener);
    }
    
    // Слушаем сообщения группы
    groupMessagesListener = database.ref('groupMessages').orderByChild('timestamp').on('value', (snapshot) => {
        if (!snapshot.exists()) {
            groupMessagesContainer.innerHTML = '<div class="empty-chat"><i class="fas fa-comments"></i><p>Начните общение в группе</p></div>';
            return;
        }
        
        const messages = snapshot.val();
        groupMessagesContainer.innerHTML = '';
        let hasMessages = false;
        
        // Собираем сообщения в массив и сортируем по времени
        const messagesArray = [];
        Object.keys(messages).forEach(messageId => {
            const message = messages[messageId];
            if (message.groupId === groupId) {
                messagesArray.push({...message, id: messageId});
            }
        });
        
        // Сортируем по времени
        messagesArray.sort((a, b) => a.timestamp - b.timestamp);
        
        // Отображаем сообщения
        messagesArray.forEach(message => {
            hasMessages = true;
            addGroupMessageToChat(message);
        });
        
        if (!hasMessages) {
            groupMessagesContainer.innerHTML = '<div class="empty-chat"><i class="fas fa-comments"></i><p>Начните общение в группе</p></div>';
        } else {
            // Прокручиваем вниз
            scrollGroupToBottom();
        }
    });
}

// Добавление сообщения в групповой чат
function addGroupMessageToChat(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.dataset.messageId = message.id;
    
    if (message.senderId === userId) {
        messageElement.classList.add('my-message');
    } else {
        messageElement.classList.add('other-message');
    }
    
    const date = new Date(message.timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Обработка сообщений-приглашений в группы
    if (message.isGroupInvite) {
        messageElement.innerHTML = `
            <div class="group-invite-message">
                <div class="group-invite-header">
                    <i class="fas fa-user-plus"></i>
                    <span>Приглашение в группу</span>
                </div>
                <div class="group-invite-content">
                    <div class="group-invite-name">${message.inviteGroupName || message.groupName}</div>
                    <div class="group-invite-sender">От: ${message.senderName}</div>
                    <button class="group-invite-btn" data-group-link="${message.groupLink}">
                        <i class="fas fa-users"></i> Присоединиться к группе
                    </button>
                </div>
                <div class="message-time">${timeString}</div>
            </div>
        `;
        
        // Обработчик для кнопки присоединения
        messageElement.querySelector('.group-invite-btn').addEventListener('click', () => {
            handleGroupInviteLink(message.groupLink);
        });
        
    } else {
        // Обычное сообщение
        // Формируем HTML для реакций
        let reactionsHTML = '';
        if (message.reactions && Object.keys(message.reactions).length > 0) {
            const reactionCounts = {};
            Object.values(message.reactions).forEach(reaction => {
                reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
            });
            
            reactionsHTML = `<div class="message-reactions" style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 2px;">`;
            Object.keys(reactionCounts).forEach(reaction => {
                const count = reactionCounts[reaction];
                const hasUserReacted = message.reactions[userId] === reaction;
                reactionsHTML += `<span class="reaction-badge ${hasUserReacted ? 'user-reacted' : ''}" data-reaction="${reaction}" data-message-id="${message.id}" style="background: ${hasUserReacted ? '#4facfe' : 'var(--other-msg-bg)'}; padding: 2px 6px; border-radius: 10px; font-size: 12px; cursor: pointer;">${reaction} ${count}</span>`;
            });
            reactionsHTML += `</div>`;
        }
        
        messageElement.innerHTML = `
            ${message.senderId !== userId ? `<div class="sender">${message.senderName}</div>` : ''}
            <div class="message-content">${message.text}</div>
            ${reactionsHTML}
            <div class="timestamp">${timeString}</div>
            <div class="message-actions" style="position: absolute; top: 5px; right: 5px; display: none;">
                <button class="react-btn" style="background: none; border: none; color: var(--text-color); cursor: pointer; font-size: 12px; opacity: 0.7;">
                    <i class="fas fa-smile"></i>
                </button>
            </div>
        `;
        
        // Добавляем обработчики для реакций
        const reactBtn = messageElement.querySelector('.react-btn');
        const reactionBadges = messageElement.querySelectorAll('.reaction-badge');
        
        if (reactBtn) {
            reactBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showReactionsPopup(message.id, e.clientX, e.clientY);
            });
        }
        
        reactionBadges.forEach(badge => {
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleReaction(message.id, badge.dataset.reaction);
            });
        });
        
        // Показываем кнопки действий при наведении
        messageElement.addEventListener('mouseenter', () => {
            const actions = messageElement.querySelector('.message-actions');
            if (actions) actions.style.display = 'block';
        });
        
        messageElement.addEventListener('mouseleave', () => {
            const actions = messageElement.querySelector('.message-actions');
            if (actions) actions.style.display = 'none';
        });
    }
    
    document.getElementById('groupMessagesContainer').appendChild(messageElement);
}

// Обработка ссылки-приглашения из сообщения
function handleGroupInviteLink(inviteLink) {
    // Извлекаем ID группы из ссылки
    const url = new URL(inviteLink);
    const groupId = url.searchParams.get('join_group');
    
    if (groupId) {
        // Закрываем групповой чат если открыт
        backToGroups();
        
        // Показываем модальное окно присоединения
        showJoinGroupDialogFromLink(groupId);
    }
}

// Показ диалога вступления в группу из ссылки
function showJoinGroupDialogFromLink(groupId) {
    database.ref('groups/' + groupId).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            showNotification("Группа не найдена или была удалена");
            return;
        }
        
        const group = snapshot.val();
        
        // Проверяем, не состоит ли пользователь уже в группе
        if (group.members && group.members[userId]) {
            showNotification(`Вы уже состоите в группе "${group.name}"`);
            openGroupChat(groupId, group.name);
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'joinGroupDialog';
        
        const membersCount = Object.keys(group.members || {}).length;
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3 style="margin-bottom: 15px; text-align: center;">Приглашение в группу</h3>
                <div style="text-align: center; margin-bottom: 20px;">
                    <div class="user-avatar" style="width: 80px; height: 80px; margin: 0 auto 10px; background: ${group.avatar ? 'transparent' : 'linear-gradient(to right, #ff7e5f, #feb47b)'}; overflow: hidden;">
                        ${group.avatar ? 
                            `<img src="${group.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                            `<i class="fas fa-users" style="font-size: 32px; color: white;"></i>`
                        }
                    </div>
                    <div class="profile-name">${group.name}</div>
                    <div style="font-size: 14px; opacity: 0.7;">${group.description || 'Групповой чат'}</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.7;">${membersCount} участников</div>
                    <div style="font-size: 12px; margin-top: 5px; opacity: 0.7;">Создатель: ${group.creatorName}</div>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn primary" id="confirmJoinGroupBtn">Вступить в группу</button>
                    <button class="modal-btn secondary" id="cancelJoinGroupBtn">Отмена</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('confirmJoinGroupBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
            joinGroup(groupId, group.name);
        });
        
        document.getElementById('cancelJoinGroupBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }).catch((error) => {
        console.error("Ошибка загрузки данных группы:", error);
        showNotification("Ошибка загрузки информации о группе");
    });
}

// Показ попапа с реакциями
function showReactionsPopup(messageId, x, y) {
    const popup = document.getElementById('reactionsPopup');
    popup.style.display = 'block';
    popup.style.position = 'fixed';
    popup.style.left = (x - 100) + 'px';
    popup.style.top = (y - 50) + 'px';
    popup.style.zIndex = '1000';
    
    // Обработчики для реакций в попапе
    const reactions = popup.querySelectorAll('.reaction');
    reactions.forEach(reaction => {
        reaction.onclick = () => {
            toggleReaction(messageId, reaction.dataset.reaction);
            popup.style.display = 'none';
        };
    });
}

// Добавление/удаление реакции
function toggleReaction(messageId, reaction) {
    if (!currentGroupId) return;
    
    const reactionRef = database.ref(`groupMessages/${messageId}/reactions/${userId}`);
    
    // Проверяем текущую реакцию пользователя
    database.ref(`groupMessages/${messageId}/reactions/${userId}`).once('value').then((snapshot) => {
        if (snapshot.exists() && snapshot.val() === reaction) {
            // Удаляем реакцию, если она уже есть
            reactionRef.remove();
        } else {
            // Добавляем новую реакцию
            reactionRef.set(reaction);
        }
    });
}

// Отправка сообщения в группу
function sendGroupMessage() {
    const text = document.getElementById('groupMessageInput').value.trim();
    
    if (text && currentGroupId) {
        // Проверяем, может ли пользователь писать в группу
        database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
            if (!snapshot.exists()) {
                showNotification("Группа не найдена");
                return;
            }
            
            const group = snapshot.val();
            const isAdmin = currentGroupRole === 'admin';
            const canWrite = isAdmin || !group.settings.adminsOnly;
            
            if (!canWrite) {
                showNotification("В этой группе могут писать только администраторы");
                return;
            }
            
            const messageId = database.ref('groupMessages').push().key;
            const timestamp = Date.now();
            
            const messageData = {
                id: messageId,
                text: text,
                senderId: userId,
                senderName: currentUser,
                groupId: currentGroupId,
                groupName: currentGroupName,
                timestamp: timestamp
            };
            
            // Сохраняем сообщение в базе данных
            database.ref('groupMessages/' + messageId).set(messageData)
                .then(() => {
                    // Обновляем активность группы
                    database.ref('groups/' + currentGroupId).update({
                        lastActivity: timestamp
                    });
                    
                    // Очищаем поле ввода
                    document.getElementById('groupMessageInput').value = '';
                    document.getElementById('sendGroupMessageBtn').disabled = true;
                    
                    // Прокручиваем вниз
                    scrollGroupToBottom();
                })
                .catch((error) => {
                    console.error("Ошибка отправки сообщения:", error);
                    showNotification("Ошибка отправки сообщения");
                });
        });
    }
}

// Прокрутка группового чата вниз
function scrollGroupToBottom() {
    setTimeout(() => {
        const container = document.getElementById('groupMessagesContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, 100);
}

// Показ информации о группе из чата
function showGroupInfoFromChat() {
    if (!currentGroupId) return;
    
    database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const group = snapshot.val();
            showGroupInfoModal(currentGroupId, group);
        }
    });
    
    document.getElementById('groupMenuContent').classList.remove('active');
}

// Показ участников группы
function showGroupMembers() {
    if (!currentGroupId) return;
    
    database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const group = snapshot.val();
            showGroupMembersModal(group);
        }
    });
    
    document.getElementById('groupMenuContent').classList.remove('active');
}

// Показ модального окна с участниками группы
function showGroupMembersModal(group) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'groupMembersModal';
    
    const members = group.members || {};
    const membersList = Object.keys(members).map(memberId => {
        const member = members[memberId];
        return `<div class="user-item">
            <div class="user-item-avatar" style="background: ${generateUserColor()}">
                ${member.name ? member.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div class="user-item-info">
                <div class="user-item-name">${member.name} ${member.role === 'admin' ? '👑' : ''}</div>
                <div class="user-item-status ${member.isOnline ? 'online' : 'offline'}">${member.role === 'admin' ? 'Администратор' : 'Участник'} • ${member.isOnline ? 'Онлайн' : 'Оффлайн'}</div>
            </div>
        </div>`;
    }).join('');
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Участники группы</h3>
            <div style="max-height: 300px; overflow-y: auto;">
                ${membersList}
            </div>
            <div class="modal-buttons">
                <button class="modal-btn secondary" id="closeGroupMembersBtn">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeGroupMembersBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Показ модального окна приглашения в группу
function showGroupInviteModal() {
    if (!currentGroupId) return;
    
    database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const group = snapshot.val();
            showInviteLinkModal(group.name, group.inviteLink, currentGroupId);
        }
    });
    
    document.getElementById('groupMenuContent').classList.remove('active');
}

// Смена аватарки группы
function changeGroupAvatar() {
    if (!currentGroupId || currentGroupRole !== 'admin') return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'changeGroupAvatarModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Смена аватара группы</h3>
            <div style="text-align: center; margin-bottom: 20px;">
                <div class="avatar-upload" style="position: relative; display: inline-block;">
                    <div class="group-avatar-preview" id="newGroupAvatarPreview" style="width: 120px; height: 120px; border-radius: 50%; background: ${groupAvatarUrl ? 'transparent' : 'linear-gradient(to right, #ff7e5f, #feb47b)'}; display: flex; align-items: center; justify-content: center; font-size: 36px; color: white; margin: 0 auto 10px; overflow: hidden; cursor: pointer;">
                        ${groupAvatarUrl ? 
                            `<img src="${groupAvatarUrl}" id="newGroupAvatarImg" style="width: 100%; height: 100%; object-fit: cover;">` : 
                            `<i class="fas fa-users" id="newGroupAvatarIcon"></i>`
                        }
                    </div>
                    <input type="file" id="newGroupAvatarInput" accept="image/*" style="display: none;">
                    <button id="changeNewAvatarBtn" style="position: absolute; bottom: 0; right: 0; background: #4facfe; color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 14px;">
                        <i class="fas fa-camera"></i>
                    </button>
                </div>
                <div style="font-size: 12px; color: var(--text-color); opacity: 0.7;">Нажмите для загрузки новой аватарки</div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn primary" id="saveNewAvatarBtn">Сохранить</button>
                <button class="modal-btn danger" id="removeAvatarBtn">Удалить аватар</button>
                <button class="modal-btn secondary" id="cancelAvatarChangeBtn">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Инициализация загрузки аватарки
    const newAvatarPreview = document.getElementById('newGroupAvatarPreview');
    const newAvatarInput = document.getElementById('newGroupAvatarInput');
    const newAvatarIcon = document.getElementById('newGroupAvatarIcon');
    const newAvatarImg = document.getElementById('newGroupAvatarImg');
    const changeNewAvatarBtn = document.getElementById('changeNewAvatarBtn');
    
    let newAvatarUrl = groupAvatarUrl;
    
    newAvatarPreview.addEventListener('click', () => {
        newAvatarInput.click();
    });
    
    changeNewAvatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        newAvatarInput.click();
    });
    
    newAvatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if (!newAvatarImg) {
                    newAvatarPreview.innerHTML = `<img id="newGroupAvatarImg" src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                } else {
                    newAvatarImg.src = e.target.result;
                }
                if (newAvatarIcon) newAvatarIcon.style.display = 'none';
                newAvatarUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('saveNewAvatarBtn').addEventListener('click', () => {
        database.ref('groups/' + currentGroupId).update({
            avatar: newAvatarUrl
        }).then(() => {
            showNotification("Аватар группы обновлен");
            groupAvatarUrl = newAvatarUrl;
            document.body.removeChild(modal);
            
            // Обновляем аватар в интерфейсе
            const groupAvatar = document.querySelector('#groupChatContainer .user-avatar');
            if (groupAvatar) {
                if (newAvatarUrl) {
                    groupAvatar.innerHTML = `<img src="${newAvatarUrl}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    groupAvatar.style.background = 'transparent';
                } else {
                    groupAvatar.innerHTML = '<i class="fas fa-users" style="color: white;"></i>';
                    groupAvatar.style.background = 'linear-gradient(to right, #ff7e5f, #feb47b)';
                }
            }
        });
    });
    
    document.getElementById('removeAvatarBtn').addEventListener('click', () => {
        database.ref('groups/' + currentGroupId).update({
            avatar: ''
        }).then(() => {
            showNotification("Аватар группы удален");
            groupAvatarUrl = '';
            document.body.removeChild(modal);
            
            // Обновляем аватар в интерфейсе
            const groupAvatar = document.querySelector('#groupChatContainer .user-avatar');
            if (groupAvatar) {
                groupAvatar.innerHTML = '<i class="fas fa-users" style="color: white;"></i>';
                groupAvatar.style.background = 'linear-gradient(to right, #ff7e5f, #feb47b)';
            }
        });
    });
    
    document.getElementById('cancelAvatarChangeBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    document.getElementById('groupMenuContent').classList.remove('active');
}

// Показ настроек группы (только для админов)
function showGroupSettings() {
    if (!currentGroupId || currentGroupRole !== 'admin') return;
    
    database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const group = snapshot.val();
            
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.id = 'groupSettingsModal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <h3 style="margin-bottom: 15px; text-align: center;">Настройки группы</h3>
                    <div style="margin-bottom: 15px;">
                        <input type="text" id="editGroupName" value="${group.name}" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-color);">
                        <textarea id="editGroupDescription" placeholder="Описание группы" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-color); height: 80px; resize: vertical;">${group.description || ''}</textarea>
                    </div>
                    
                    <div class="settings-section">
                        <h4 style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-cog"></i> Настройки группы
                        </h4>
                        <div class="settings-option">
                            <span>Публичная группа</span>
                            <label class="switch">
                                <input type="checkbox" id="editPublicToggle" ${group.settings.public ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="settings-option">
                            <span>Требуется одобрение вступления</span>
                            <label class="switch">
                                <input type="checkbox" id="editApprovalToggle" ${group.settings.approvalRequired ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="settings-option">
                            <span>Только админы пишут</span>
                            <label class="switch">
                                <input type="checkbox" id="editAdminsOnlyToggle" ${group.settings.adminsOnly ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="settings-option">
                            <span>Показывать кто печатает</span>
                            <label class="switch">
                                <input type="checkbox" id="editShowTypingToggle" ${group.settings.showTyping ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="settings-option">
                            <span>Разрешить реакции</span>
                            <label class="switch">
                                <input type="checkbox" id="editAllowReactionsToggle" ${group.settings.allowReactions ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="modal-buttons">
                        <button class="modal-btn primary" id="saveGroupSettingsBtn">Сохранить</button>
                        <button class="modal-btn danger" id="deleteGroupBtn">Удалить группу</button>
                        <button class="modal-btn secondary" id="closeGroupSettingsBtn">Закрыть</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('saveGroupSettingsBtn').addEventListener('click', () => {
                saveGroupSettings(group);
            });
            
            document.getElementById('deleteGroupBtn').addEventListener('click', () => {
                deleteGroup();
            });
            
            document.getElementById('closeGroupSettingsBtn').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        }
    });
    
    document.getElementById('groupMenuContent').classList.remove('active');
}

// Сохранение настроек группы
function saveGroupSettings(group) {
    const newName = document.getElementById('editGroupName').value.trim();
    const newDescription = document.getElementById('editGroupDescription').value.trim();
    const isPublic = document.getElementById('editPublicToggle').checked;
    const approvalRequired = document.getElementById('editApprovalToggle').checked;
    const adminsOnly = document.getElementById('editAdminsOnlyToggle').checked;
    const showTyping = document.getElementById('editShowTypingToggle').checked;
    const allowReactions = document.getElementById('editAllowReactionsToggle').checked;
    
    if (!newName) {
        showNotification("Введите название группы");
        return;
    }
    
    const updates = {
        name: newName,
        description: newDescription,
        'settings/public': isPublic,
        'settings/approvalRequired': approvalRequired,
        'settings/adminsOnly': adminsOnly,
        'settings/showTyping': showTyping,
        'settings/allowReactions': allowReactions
    };
    
    database.ref('groups/' + currentGroupId).update(updates)
        .then(() => {
            showNotification("Настройки группы сохранены");
            document.body.removeChild(document.getElementById('groupSettingsModal'));
            
            // Обновляем название в интерфейсе
            if (document.getElementById('groupChatName')) {
                document.getElementById('groupChatName').textContent = newName;
            }
            currentGroupName = newName;
        })
        .catch((error) => {
            console.error("Ошибка сохранения настроек:", error);
            showNotification("Ошибка сохранения настроек");
        });
}

// Управление участниками (только для админов)
function showManageMembers() {
    if (!currentGroupId || currentGroupRole !== 'admin') return;
    
    database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const group = snapshot.val();
            const members = group.members || {};
            
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.id = 'manageMembersModal';
            
            let membersListHTML = '';
            Object.keys(members).forEach(memberId => {
                const member = members[memberId];
                if (memberId !== userId) { // Не показываем себя
                    membersListHTML += `
                        <div class="user-item">
                            <div class="user-item-avatar" style="background: ${generateUserColor()}">
                                ${member.name.charAt(0).toUpperCase()}
                            </div>
                            <div class="user-item-info">
                                <div class="user-item-name">${member.name}</div>
                                <div class="user-item-status">${member.role === 'admin' ? 'Администратор' : 'Участник'}</div>
                            </div>
                            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                                ${member.role !== 'admin' ? `
                                    <button class="make-admin-btn" data-user-id="${memberId}" data-user-name="${member.name}" style="padding: 5px 10px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 12px;">
                                        Сделать админом
                                    </button>
                                ` : `
                                    <button class="remove-admin-btn" data-user-id="${memberId}" data-user-name="${member.name}" style="padding: 5px 10px; background: linear-gradient(to right, #ff7e5f, #feb47b); color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 12px;">
                                        Убрать админа
                                    </button>
                                `}
                                <button class="kick-member-btn" data-user-id="${memberId}" data-user-name="${member.name}" style="padding: 5px 10px; background: linear-gradient(to right, #ff416c, #ff4b2b); color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 12px;">
                                    Исключить
                                </button>
                            </div>
                        </div>
                    `;
                }
            });
            
            modal.innerHTML = `
                <div class="modal-content">
                    <h3 style="margin-bottom: 15px; text-align: center;">Управление участниками</h3>
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${membersListHTML || '<p>Нет других участников</p>'}
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-btn secondary" id="closeManageMembersBtn">Закрыть</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Обработчики для кнопок управления
            modal.querySelectorAll('.make-admin-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetUserId = e.target.dataset.userId;
                    const targetUserName = e.target.dataset.userName;
                    makeAdmin(targetUserId, targetUserName);
                });
            });
            
            modal.querySelectorAll('.remove-admin-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetUserId = e.target.dataset.userId;
                    const targetUserName = e.target.dataset.userName;
                    removeAdmin(targetUserId, targetUserName);
                });
            });
            
            modal.querySelectorAll('.kick-member-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetUserId = e.target.dataset.userId;
                    const targetUserName = e.target.dataset.userName;
                    kickMember(targetUserId, targetUserName);
                });
            });
            
            document.getElementById('closeManageMembersBtn').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        }
    });
    
    document.getElementById('groupMenuContent').classList.remove('active');
}

// Назначение администратора
function makeAdmin(targetUserId, targetUserName) {
    if (confirm(`Сделать пользователя "${targetUserName}" администратором?`)) {
        database.ref(`groups/${currentGroupId}/members/${targetUserId}/role`).set('admin')
            .then(() => {
                showNotification(`Пользователь "${targetUserName}" теперь администратор`);
                document.body.removeChild(document.getElementById('manageMembersModal'));
            })
            .catch((error) => {
                console.error("Ошибка назначения администратора:", error);
                showNotification("Ошибка назначения администратора");
            });
    }
}

// Снятие прав администратора
function removeAdmin(targetUserId, targetUserName) {
    if (confirm(`Убрать права администратора у пользователя "${targetUserName}"?`)) {
        database.ref(`groups/${currentGroupId}/members/${targetUserId}/role`).set('member')
            .then(() => {
                showNotification(`Пользователь "${targetUserName}" больше не администратор`);
                document.body.removeChild(document.getElementById('manageMembersModal'));
            })
            .catch((error) => {
                console.error("Ошибка снятия прав администратора:", error);
                showNotification("Ошибка снятия прав администратора");
            });
    }
}

// Исключение участника из группы
function kickMember(targetUserId, targetUserName) {
    if (confirm(`Исключить пользователя "${targetUserName}" из группы?`)) {
        database.ref(`groups/${currentGroupId}/members/${targetUserId}`).remove()
            .then(() => {
                showNotification(`Пользователь "${targetUserName}" исключен из группы`);
                document.body.removeChild(document.getElementById('manageMembersModal'));
                
                // Отправляем системное сообщение об исключении
                const messageId = database.ref('groupMessages').push().key;
                const timestamp = Date.now();
                
                const systemMessage = {
                    id: messageId,
                    text: `Пользователь ${targetUserName} был исключен из группы`,
                    senderId: 'system',
                    senderName: 'Система',
                    groupId: currentGroupId,
                    groupName: currentGroupName,
                    timestamp: timestamp,
                    isSystem: true
                };
                
                database.ref('groupMessages/' + messageId).set(systemMessage);
            })
            .catch((error) => {
                console.error("Ошибка исключения пользователя:", error);
                showNotification("Ошибка исключения пользователя");
            });
    }
}

// Удаление группы
function deleteGroup() {
    if (confirm("Вы уверены, что хотите удалить группу? Это действие нельзя отменить!")) {
        // Удаляем группу
        database.ref('groups/' + currentGroupId).remove()
            .then(() => {
                // Удаляем все сообщения группы
                database.ref('groupMessages').once('value').then((snapshot) => {
                    const updates = {};
                    snapshot.forEach((childSnapshot) => {
                        const message = childSnapshot.val();
                        if (message.groupId === currentGroupId) {
                            updates[childSnapshot.key] = null;
                        }
                    });
                    database.ref('groupMessages').update(updates);
                });
                
                showNotification("Группа удалена");
                backToGroups();
                document.body.removeChild(document.getElementById('groupSettingsModal'));
            })
            .catch((error) => {
                console.error("Ошибка удаления группы:", error);
                showNotification("Ошибка удаления группы");
            });
    }
}

// Очистка истории группового чата
function clearGroupChatHistory() {
    if (!currentGroupId) return;
    
    if (confirm("Вы уверены, что хотите очистить историю группового чата?")) {
        // Удаляем все сообщения этой группы
        database.ref('groupMessages').once('value').then((snapshot) => {
            const updates = {};
            
            snapshot.forEach((childSnapshot) => {
                const message = childSnapshot.val();
                if (message.groupId === currentGroupId) {
                    updates[childSnapshot.key] = null;
                }
            });
            
            database.ref('groupMessages').update(updates)
                .then(() => {
                    showNotification("История чата очищена");
                    document.getElementById('groupMessagesContainer').innerHTML = '<div class="empty-chat"><i class="fas fa-comments"></i><p>История чата очищена</p></div>';
                })
                .catch((error) => {
                    console.error("Ошибка очистки истории:", error);
                    showNotification("Ошибка очистки истории");
                });
        });
    }
    
    document.getElementById('groupMenuContent').classList.remove('active');
}

// Выход из группы
function leaveGroup() {
    if (!currentGroupId) return;
    
    if (confirm("Вы уверены, что хотите покинуть группу?")) {
        database.ref(`groups/${currentGroupId}/members/${userId}`).remove()
            .then(() => {
                showNotification("Вы покинули группу");
                backToGroups();
                
                // Отправляем системное сообщение о выходе
                const messageId = database.ref('groupMessages').push().key;
                const timestamp = Date.now();
                
                const systemMessage = {
                    id: messageId,
                    text: `Пользователь ${currentUser} покинул группу`,
                    senderId: 'system',
                    senderName: 'Система',
                    groupId: currentGroupId,
                    groupName: currentGroupName,
                    timestamp: timestamp,
                    isSystem: true
                };
                
                database.ref('groupMessages/' + messageId).set(systemMessage);
            })
            .catch((error) => {
                console.error("Ошибка выхода из группы:", error);
                showNotification("Ошибка выхода из группы");
            });
    }
    
    document.getElementById('groupMenuContent').classList.remove('active');
}

// Обработка ссылок-приглашений
function handleGroupInviteLinks() {
    const urlParams = new URLSearchParams(window.location.search);
    const joinGroupId = urlParams.get('join_group');
    
    if (joinGroupId) {
        // Убираем параметр из URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Проверяем существование группы
        database.ref('groups/' + joinGroupId).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                const group = snapshot.val();
                
                // Проверяем, не состоит ли пользователь уже в группе
                if (group.members && group.members[userId]) {
                    showNotification(`Вы уже состоите в группе "${group.name}"`);
                    openGroupChat(joinGroupId, group.name);
                } else {
                    // Показываем диалог вступления в группу
                    showJoinGroupDialog(group, joinGroupId);
                }
            } else {
                showNotification("Группа не найдена или была удалена");
            }
        }).catch((error) => {
            console.error("Ошибка проверки группы:", error);
            showNotification("Ошибка загрузки информации о группе");
        });
    }
}

// Показ диалога вступления в группу
function showJoinGroupDialog(group, groupId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'joinGroupDialog';
    
    const membersCount = Object.keys(group.members || {}).length;
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Приглашение в группу</h3>
            <div style="text-align: center; margin-bottom: 20px;">
                <div class="user-avatar" style="width: 80px; height: 80px; margin: 0 auto 10px; background: ${group.avatar ? 'transparent' : 'linear-gradient(to right, #ff7e5f, #feb47b)'}; overflow: hidden;">
                    ${group.avatar ? 
                        `<img src="${group.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                        `<i class="fas fa-users" style="font-size: 32px; color: white;"></i>`
                    }
                </div>
                <div class="profile-name">${group.name}</div>
                <div style="font-size: 14px; opacity: 0.7;">${group.description || 'Групповой чат'}</div>
                <div style="font-size: 12px; margin-top: 10px; opacity: 0.7;">${membersCount} участников</div>
                <div style="font-size: 12px; margin-top: 5px; opacity: 0.7;">Создатель: ${group.creatorName}</div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn primary" id="confirmJoinGroupBtn">Вступить в группу</button>
                <button class="modal-btn secondary" id="cancelJoinGroupBtn">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('confirmJoinGroupBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
        joinGroup(groupId, group.name);
    });
    
    document.getElementById('cancelJoinGroupBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Вступление в группу
function joinGroup(groupId, groupName) {
    const memberData = {
        id: userId,
        name: currentUser,
        role: 'member',
        joinedAt: Date.now(),
        isOnline: true
    };
    
    database.ref(`groups/${groupId}/members/${userId}`).set(memberData)
        .then(() => {
            showNotification(`Вы вступили в группу "${groupName}"`);
            
            // Обновляем активность группы
            database.ref(`groups/${groupId}`).update({
                lastActivity: Date.now()
            });
            
            // Открываем групповой чат
            openGroupChat(groupId, groupName);
        })
        .catch((error) => {
            console.error("Ошибка вступления в группу:", error);
            showNotification("Ошибка вступления в группу");
        });
}

// Поиск групп
function searchGroups() {
    const searchTerm = document.getElementById('searchGroupInput').value.trim().toLowerCase();
    
    if (!searchTerm) {
        showNotification("Введите поисковый запрос");
        return;
    }
    
    const groupsList = document.getElementById('groupsList');
    groupsList.innerHTML = `
        <div class="empty-chat">
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <p>Поиск групп...</p>
        </div>
    `;
    
    database.ref('groups').once('value').then((snapshot) => {
        groupsList.innerHTML = '';
        
        if (!snapshot.exists()) {
            groupsList.innerHTML = '<div class="empty-chat"><i class="fas fa-users"></i><p>Группы не найдены</p></div>';
            return;
        }
        
        const groups = snapshot.val();
        let foundGroups = false;
        
        Object.keys(groups).forEach(groupId => {
            const group = groups[groupId];
            
            // Проверяем совпадение по названию или описанию
            const groupName = (group.name || '').toLowerCase();
            const groupDescription = (group.description || '').toLowerCase();
            
            if (groupName.includes(searchTerm) || groupDescription.includes(searchTerm)) {
                // Пропускаем группы, в которых пользователь уже состоит
                if (group.members && group.members[userId]) {
                    return;
                }
                
                // Пропускаем приватные группы
                if (!group.settings.public) {
                    return;
                }
                
                foundGroups = true;
                addPublicGroupToList(groupId, group);
            }
        });
        
        if (!foundGroups) {
            groupsList.innerHTML = '<div class="empty-chat"><i class="fas fa-users"></i><p>Группы не найдены</p></div>';
        }
    }).catch((error) => {
        console.error("Ошибка поиска групп:", error);
        groupsList.innerHTML = '<div class="empty-chat"><i class="fas fa-exclamation-triangle"></i><p>Ошибка поиска</p></div>';
    });
}

// Добавление публичной группы в список
function addPublicGroupToList(groupId, group) {
    const groupItem = document.createElement('div');
    groupItem.classList.add('user-item');
    groupItem.dataset.groupId = groupId;
    
    const membersCount = Object.keys(group.members || {}).length;
    
    groupItem.innerHTML = `
        <div class="user-item-avatar" style="background: ${group.avatar ? 'transparent' : 'linear-gradient(to right, #ff7e5f, #feb47b)'}; overflow: hidden;">
            ${group.avatar ? 
                `<img src="${group.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                `<i class="fas fa-users" style="color: white;"></i>`
            }
        </div>
        <div class="user-item-info">
            <div class="user-item-name">${group.name}</div>
            <div class="user-item-status">${membersCount} участников • ${group.settings.public ? 'Открытая' : 'Закрытая'}</div>
        </div>
        <button class="join-group-btn" style="padding: 5px 10px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 12px;">Вступить</button>
    `;
    
    groupItem.querySelector('.join-group-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        joinGroup(groupId, group.name);
    });
    
    groupItem.addEventListener('click', () => {
        showGroupInfoModal(groupId, group);
    });
    
    document.getElementById('groupsList').appendChild(groupItem);
}

// Вспомогательные функции
function generateUserColor() {
    const colors = [
        'linear-gradient(to right, #ff7e5f, #feb47b)',
        'linear-gradient(to right, #4facfe, #00f2fe)',
        'linear-gradient(to right, #a8edea, #fed6e3)',
        'linear-gradient(to right, #ffecd2, #fcb69f)',
        'linear-gradient(to right, #84fab0, #8fd3f4)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

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

function generateChatId(otherUserId) {
    const ids = [userId, otherUserId].sort();
    return `chat_${ids[0]}_${ids[1]}`;
}

function updateChatInfo(chatId, lastMessage, timestamp) {
    const chatUpdate = {
        lastMessage: lastMessage,
        lastMessageTime: timestamp
    };
    
    database.ref('chats/' + chatId).update(chatUpdate);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Ждем инициализации Firebase и загрузки основных функций
    const checkInit = setInterval(() => {
        if (typeof database !== 'undefined' && typeof userId !== 'undefined' && userId) {
            clearInterval(checkInit);
            initGroups();
        }
    }, 100);
});

// CSS стили для групп (добавляем динамически)
const groupStyles = `
    .groups-list {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .join-group-btn {
        padding: 5px 10px;
        background: linear-gradient(to right, #4facfe, #00f2fe);
        color: white;
        border: none;
        border-radius: 15px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
    }

    .join-group-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    .send-invite-btn {
        padding: 5px 10px;
        background: linear-gradient(to right, #4facfe, #00f2fe);
        color: white;
        border: none;
        border-radius: 15px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
    }

    .send-invite-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    .reactions-popup {
        background: var(--header-bg);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        padding: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .reactions-container {
        display: flex;
        gap: 5px;
    }

    .reaction {
        font-size: 18px;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        transition: all 0.2s;
    }

    .reaction:hover {
        background: var(--other-msg-bg);
        transform: scale(1.2);
    }

    .message-reactions {
        margin-top: 5px;
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
    }

    .reaction-badge {
        background: var(--other-msg-bg);
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
    }

    .reaction-badge:hover {
        background: var(--message-bg);
        transform: scale(1.05);
    }

    .reaction-badge.user-reacted {
        background: #4facfe;
        color: white;
        border-color: #4facfe;
    }

    .message-actions {
        position: absolute;
        top: 5px;
        right: 5px;
        display: none;
        background: var(--header-bg);
        border-radius: 15px;
        padding: 5px;
    }

    .react-btn {
        background: none;
        border: none;
        color: var(--text-color);
        cursor: pointer;
        font-size: 12px;
        opacity: 0.7;
        transition: all 0.2s;
    }

    .react-btn:hover {
        opacity: 1;
        transform: scale(1.1);
    }

    .group-invite-message {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        padding: 15px;
        color: white;
        margin: 10px 0;
        max-width: 85%;
        position: relative;
    }

    .group-invite-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .group-invite-content {
        margin-bottom: 10px;
    }

    .group-invite-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 5px;
    }

    .group-invite-sender {
        font-size: 12px;
        opacity: 0.8;
        margin-bottom: 10px;
    }

    .group-invite-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 8px 15px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .group-invite-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
    }

    .context-menu {
        background: var(--header-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 8px 0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1000;
        min-width: 150px;
    }

    .context-menu-item {
        padding: 10px 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.2s;
    }

    .context-menu-item:hover {
        background: var(--other-msg-bg);
    }

    /* Адаптивность для мобильных */
    @media (max-width: 768px) {
        .group-chat-header {
            padding: 8px 10px;
        }
        
        .group-message {
            max-width: 90%;
            font-size: 13px;
            padding: 8px 10px;
        }
        
        .reactions-container {
            gap: 3px;
        }
        
        .reaction {
            font-size: 16px;
            padding: 4px;
        }
        
        .modal-content {
            width: 95%;
            margin: 10px;
            padding: 15px;
        }
        
        .user-item {
            padding: 10px;
        }
        
        .chat-menu-content {
            min-width: 180px;
            right: 5px;
        }

        .group-invite-message {
            max-width: 95%;
            padding: 12px;
        }

        .group-invite-btn {
            padding: 10px 20px;
            font-size: 16px;
        }

        .context-menu {
            min-width: 140px;
        }

        .context-menu-item {
            padding: 12px 15px;
            font-size: 14px;
        }
    }

    @media (max-width: 480px) {
        .groups-list {
            padding: 5px;
        }
        
        .group-item {
            padding: 8px;
        }
        
        .search-container {
            padding: 8px;
        }
        
        .search-container input {
            padding: 8px;
            font-size: 14px;
        }
        
        .search-container button {
            padding: 8px 12px;
            font-size: 12px;
        }
        
        .modal-content {
            padding: 12px;
        }
        
        .settings-option {
            padding: 8px;
            font-size: 14px;
        }
        
        .user-item-avatar {
            width: 35px;
            height: 35px;
            font-size: 14px;
        }
        
        .chat-item-avatar {
            width: 35px;
            height: 35px;
        }
        
        .message-actions {
            top: 2px;
            right: 2px;
            padding: 3px;
        }
        
        .react-btn {
            font-size: 10px;
        }

        .group-invite-message {
            padding: 10px;
            max-width: 100%;
        }

        .group-invite-name {
            font-size: 14px;
        }

        .group-invite-btn {
            padding: 8px 16px;
            font-size: 14px;
            width: 100%;
            justify-content: center;
        }
    }

    @media (max-width: 360px) {
        .groups-list {
            padding: 3px;
        }
        
        .group-item {
            padding: 6px;
        }
        
        .chat-item-info {
            font-size: 12px;
        }
        
        .chat-item-last-message {
            font-size: 11px;
        }
        
        .modal-content {
            padding: 10px;
        }
        
        .settings-option {
            padding: 6px;
            font-size: 12px;
        }

        .group-invite-message {
            padding: 8px;
        }

        .group-invite-header {
            font-size: 12px;
        }

        .group-invite-name {
            font-size: 13px;
        }

        .group-invite-btn {
            padding: 6px 12px;
            font-size: 12px;
        }
    }

    /* Улучшения для touch-устройств */
    @media (hover: none) and (pointer: coarse) {
        .message-actions {
            display: block !important;
            opacity: 0.7;
        }
        
        .join-group-btn, 
        .send-invite-btn {
            padding: 8px 12px;
            font-size: 14px;
        }
        
        .reaction {
            padding: 8px;
            font-size: 20px;
        }
        
        .chat-menu-item {
            padding: 12px 15px;
            font-size: 16px;
        }

        .group-invite-btn {
            padding: 12px 20px;
            font-size: 16px;
        }

        .context-menu-item {
            padding: 15px 20px;
            font-size: 16px;
        }
    }
    // Глобальная функция отправки сообщений в группу
window.sendGroupMessage = function() {
    const text = document.getElementById('groupMessageInput')?.value.trim();
    
    if (!text || !currentGroupId) return;
    
    // Проверяем, может ли пользователь писать в группу
    database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            showNotification("Группа не найдена");
            return;
        }
        
        const group = snapshot.val();
        const isAdmin = currentGroupRole === 'admin';
        const canWrite = isAdmin || !group.settings.adminsOnly;
        
        if (!canWrite) {
            showNotification("В этой группе могут писать только администраторы");
            return;
        }
        
        const messageId = database.ref('groupMessages').push().key;
        const timestamp = Date.now();
        
        const messageData = {
            id: messageId,
            text: text,
            senderId: userId,
            senderName: currentUser,
            groupId: currentGroupId,
            groupName: currentGroupName,
            timestamp: timestamp
        };
        
        // Сохраняем сообщение в базе данных
        database.ref('groupMessages/' + messageId).set(messageData)
            .then(() => {
                // Обновляем активность группы
                database.ref('groups/' + currentGroupId).update({
                    lastActivity: timestamp
                });
                
                // Очищаем поле ввода
                document.getElementById('groupMessageInput').value = '';
                if (document.getElementById('sendGroupMessageBtn')) {
                    document.getElementById('sendGroupMessageBtn').disabled = true;
                }
                
                // Прокручиваем вниз
                scrollGroupToBottom();
            })
            .catch((error) => {
                console.error("Ошибка отправки сообщения:", error);
                showNotification("Ошибка отправки сообщения");
            });
    }).catch((error) => {
        console.error("Ошибка проверки группы:", error);
        showNotification("Ошибка отправки сообщения");
    });
};

// Также обновим обработчик в initGroupChatEventListeners
function initGroupChatEventListeners(group) {
    // Кнопка возврата к группам
    document.getElementById('backToGroupsBtn').addEventListener('click', backToGroups);
    
    // Меню группы
    document.getElementById('groupMenuBtn').addEventListener('click', () => {
        document.getElementById('groupMenuContent').classList.toggle('active');
    });
    
    // Пункты меню группы
    document.getElementById('groupInfoBtn').addEventListener('click', showGroupInfoFromChat);
    document.getElementById('groupMembersBtn').addEventListener('click', showGroupMembers);
    document.getElementById('groupInviteBtn').addEventListener('click', showGroupInviteModal);
    document.getElementById('clearGroupChatBtn').addEventListener('click', clearGroupChatHistory);
    document.getElementById('leaveGroupBtn').addEventListener('click', leaveGroup);
    
    // Дополнительные пункты для админов
    if (currentGroupRole === 'admin') {
        document.getElementById('groupSettingsBtn').addEventListener('click', showGroupSettings);
        document.getElementById('manageMembersBtn').addEventListener('click', showManageMembers);
        document.getElementById('changeGroupAvatarBtn').addEventListener('click', changeGroupAvatar);
    }
    
    // Отправка сообщений - используем глобальную функцию
    const groupMessageInput = document.getElementById('groupMessageInput');
    const sendGroupMessageBtn = document.getElementById('sendGroupMessageBtn');
    
    if (groupMessageInput && sendGroupMessageBtn) {
        groupMessageInput.addEventListener('input', () => {
            sendGroupMessageBtn.disabled = groupMessageInput.value.trim() === '';
            handleTyping(true);
        });
        
        groupMessageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleTyping(false);
                window.sendGroupMessage(); // Используем глобальную функцию
            }
        });
        
        groupMessageInput.addEventListener('blur', () => {
            handleTyping(false);
        });
        
        sendGroupMessageBtn.addEventListener('click', () => {
            handleTyping(false);
            window.sendGroupMessage(); // Используем глобальную функцию
        });
    }
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!document.getElementById('groupMenuBtn').contains(e.target) && 
            !document.getElementById('groupMenuContent').contains(e.target)) {
            document.getElementById('groupMenuContent').classList.remove('active');
        }
    });
}

console.log("Group message functions initialized");
`;

// Добавляем стили в документ
const styleSheet = document.createElement('style');
styleSheet.textContent = groupStyles;
document.head.appendChild(styleSheet);


