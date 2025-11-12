// group-invite-members.js - Добавление людей в группу через меню группы

// Глобальные переменные
let currentGroupForInvite = null;
let selectedMembersSet = new Set();

// Основная функция инициализации
function initGroupInviteMembers() {
    console.log("Group invite members system initialized");
    
    // Интеграция с системой групп - добавляем пункт в меню группы
    integrateWithGroupMenu();
    
    // Внедряем стили
    injectAddMembersStyles();
}

// Интеграция с меню группы (три точки)
function integrateWithGroupMenu() {
    // Перехватываем создание меню группы
    const originalCreateGroupChatInterface = window.createGroupChatInterface;
    
    if (originalCreateGroupChatInterface) {
        window.createGroupChatInterface = function(group) {
            originalCreateGroupChatInterface(group);
            addInviteOptionToGroupMenu();
        };
    }
}

// Добавление пункта "Добавить людей" в меню группы
function addInviteOptionToGroupMenu() {
    // Ждем пока меню создастся
    setTimeout(() => {
        const groupMenuContent = document.getElementById('groupMenuContent');
        if (!groupMenuContent) return;
        
        // Проверяем, не добавлен ли уже этот пункт
        if (document.getElementById('addMembersToGroupBtn')) return;
        
        // Создаем пункт меню
        const addMembersItem = document.createElement('div');
        addMembersItem.className = 'chat-menu-item';
        addMembersItem.id = 'addMembersToGroupBtn';
        addMembersItem.innerHTML = '<i class="fas fa-user-plus"></i> Добавить людей';
        
        // Вставляем после пункта "Пригласить"
        const inviteBtn = document.getElementById('groupInviteBtn');
        if (inviteBtn) {
            inviteBtn.parentNode.insertBefore(addMembersItem, inviteBtn.nextSibling);
        } else {
            // Если пункта "Пригласить" нет, вставляем в начало
            groupMenuContent.insertBefore(addMembersItem, groupMenuContent.firstChild);
        }
        
        // Добавляем обработчик
        addMembersItem.addEventListener('click', () => {
            if (currentGroupId) {
                showAddMembersToGroup(currentGroupId, currentGroupName);
            }
            groupMenuContent.classList.remove('active');
        });
    }, 100);
}

// Показ меню добавления людей в группу
function showAddMembersToGroup(groupId, groupName) {
    currentGroupForInvite = groupId;
    selectedMembersSet.clear();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'addMembersModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Добавить людей в группу</h3>
            <p style="text-align: center; margin-bottom: 15px; opacity: 0.8;">
                Добавьте участников в группу "<strong>${groupName}</strong>"
            </p>
            
            <div class="search-container" style="margin-bottom: 15px;">
                <input type="text" id="searchMembersInput" placeholder="Поиск по контактам...">
                <button id="searchMembersBtn">
                    <i class="fas fa-search"></i>
                </button>
            </div>
            
            <div id="availableMembersList" style="max-height: 300px; overflow-y: auto;">
                <div class="empty-chat">
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                    <p>Загрузка контактов...</p>
                </div>
            </div>
            
            <div class="selected-members" id="selectedMembers" style="margin: 15px 0; display: none;">
                <h4 style="margin-bottom: 10px; font-size: 14px;">Выбранные участники:</h4>
                <div id="selectedMembersList" style="display: flex; flex-wrap: wrap; gap: 8px;"></div>
            </div>
            
            <div class="modal-buttons">
                <button class="modal-btn primary" id="confirmAddMembersBtn" disabled>
                    <i class="fas fa-user-plus"></i> Добавить выбранных (<span id="selectedCount">0</span>)
                </button>
                <button class="modal-btn secondary" id="cancelAddMembersBtn">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Загружаем список доступных контактов
    loadAvailableMembers();
    
    // Инициализируем обработчики событий
    initAddMembersEventListeners();
}

// Загрузка доступных контактов для добавления
function loadAvailableMembers(searchTerm = '') {
    const membersContainer = document.getElementById('availableMembersList');
    
    // Получаем список чатов пользователя
    database.ref('chats').once('value').then((snapshot) => {
        membersContainer.innerHTML = '';
        
        if (!snapshot.exists()) {
            membersContainer.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-users"></i>
                    <p>У вас пока нет контактов</p>
                    <p style="font-size: 14px; margin-top: 10px;">Начните общение с пользователями, чтобы добавить их в группу</p>
                </div>
            `;
            return;
        }
        
        const chats = snapshot.val();
        let availableContacts = [];
        let addedUserIds = new Set();
        
        // Собираем всех уникальных контактов из чатов
        Object.keys(chats).forEach(chatId => {
            const chat = chats[chatId];
            
            if (chat.participants && chat.participants[userId]) {
                // Находим собеседников
                Object.keys(chat.participants).forEach(participantId => {
                    if (participantId !== userId && !addedUserIds.has(participantId)) {
                        const participant = chat.participants[participantId];
                        
                        // Проверяем поисковый запрос
                        const userName = participant.name || '';
                        if (!searchTerm || userName.toLowerCase().includes(searchTerm.toLowerCase())) {
                            availableContacts.push({
                                id: participantId,
                                name: userName,
                                avatar: participant.avatar || '',
                                chatId: chatId
                            });
                            addedUserIds.add(participantId);
                        }
                    }
                });
            }
        });
        
        // Проверяем, не состоят ли уже пользователи в группе
        if (currentGroupForInvite) {
            database.ref('groups/' + currentGroupForInvite).once('value').then((groupSnapshot) => {
                if (groupSnapshot.exists()) {
                    const group = groupSnapshot.val();
                    const groupMembers = group.members || {};
                    
                    // Фильтруем пользователей, которые уже в группе
                    availableContacts = availableContacts.filter(contact => 
                        !groupMembers[contact.id]
                    );
                    
                    // Отображаем контакты
                    displayAvailableMembers(availableContacts);
                } else {
                    displayAvailableMembers(availableContacts);
                }
            });
        } else {
            displayAvailableMembers(availableContacts);
        }
        
    }).catch((error) => {
        console.error("Ошибка загрузки контактов:", error);
        membersContainer.innerHTML = `
            <div class="empty-chat">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Ошибка загрузки контактов</p>
            </div>
        `;
    });
}

// Отображение доступных контактов
function displayAvailableMembers(contacts) {
    const membersContainer = document.getElementById('availableMembersList');
    
    if (contacts.length === 0) {
        membersContainer.innerHTML = `
            <div class="empty-chat">
                <i class="fas fa-users"></i>
                <p>Нет доступных контактов</p>
                <p style="font-size: 14px; margin-top: 10px;">
                    Все ваши контакты уже в группе или нет подходящих пользователей
                </p>
            </div>
        `;
        return;
    }
    
    membersContainer.innerHTML = '';
    
    contacts.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.className = 'user-item selectable-contact';
        contactItem.dataset.userId = contact.id;
        contactItem.dataset.userName = contact.name;
        
        const isSelected = selectedMembersSet.has(contact.id);
        
        contactItem.innerHTML = `
            <div class="user-item-avatar" style="background: ${generateUserColor()}">
                ${contact.name ? contact.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div class="user-item-info">
                <div class="user-item-name">${contact.name}</div>
                <div class="user-item-status">Контакт</div>
            </div>
            <div class="selection-checkbox">
                <input type="checkbox" id="select_${contact.id}" class="contact-checkbox" ${isSelected ? 'checked' : ''}>
                <label for="select_${contact.id}"></label>
            </div>
        `;
        
        membersContainer.appendChild(contactItem);
    });
    
    // Добавляем обработчики для чекбоксов
    initContactSelectionHandlers();
}

// Инициализация обработчиков выбора контактов
function initContactSelectionHandlers() {
    const checkboxes = document.querySelectorAll('.contact-checkbox');
    const selectedMembersContainer = document.getElementById('selectedMembers');
    const selectedMembersList = document.getElementById('selectedMembersList');
    const confirmBtn = document.getElementById('confirmAddMembersBtn');
    const selectedCountSpan = document.getElementById('selectedCount');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const contactItem = this.closest('.user-item');
            const userId = contactItem.dataset.userId;
            const userName = contactItem.dataset.userName;
            
            if (this.checked) {
                // Добавляем в выбранные
                selectedMembersSet.add(userId);
                addToSelectedMembers(userId, userName);
            } else {
                // Удаляем из выбранных
                selectedMembersSet.delete(userId);
                removeFromSelectedMembers(userId);
            }
            
            // Обновляем счетчик
            const selectedCount = selectedMembersSet.size;
            selectedCountSpan.textContent = selectedCount;
            
            // Показываем/скрываем контейнер выбранных
            if (selectedCount > 0) {
                selectedMembersContainer.style.display = 'block';
            } else {
                selectedMembersContainer.style.display = 'none';
            }
            
            // Активируем/деактивируем кнопку подтверждения
            confirmBtn.disabled = selectedCount === 0;
        });
    });
}

// Добавление пользователя в список выбранных
function addToSelectedMembers(userId, userName) {
    const selectedMembersList = document.getElementById('selectedMembersList');
    
    // Проверяем, не добавлен ли уже этот пользователь
    if (document.querySelector(`.selected-member-tag[data-user-id="${userId}"]`)) {
        return;
    }
    
    const memberTag = document.createElement('div');
    memberTag.className = 'selected-member-tag';
    memberTag.dataset.userId = userId;
    memberTag.innerHTML = `
        <span>${userName}</span>
        <button class="remove-selected-member" data-user-id="${userId}">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    selectedMembersList.appendChild(memberTag);
    
    // Обработчик удаления из выбранных
    memberTag.querySelector('.remove-selected-member').addEventListener('click', function() {
        const userId = this.dataset.userId;
        selectedMembersSet.delete(userId);
        removeFromSelectedMembers(userId);
        
        // Снимаем галочку с чекбокса
        const checkbox = document.getElementById(`select_${userId}`);
        if (checkbox) {
            checkbox.checked = false;
        }
        
        // Обновляем счетчик
        const selectedCount = selectedMembersSet.size;
        document.getElementById('selectedCount').textContent = selectedCount;
        
        // Проверяем, есть ли еще выбранные пользователи
        const selectedMembersContainer = document.getElementById('selectedMembers');
        const confirmBtn = document.getElementById('confirmAddMembersBtn');
        
        if (selectedCount === 0) {
            selectedMembersContainer.style.display = 'none';
            confirmBtn.disabled = true;
        }
    });
}

// Удаление пользователя из списка выбранных
function removeFromSelectedMembers(userId) {
    const memberTag = document.querySelector(`.selected-member-tag[data-user-id="${userId}"]`);
    if (memberTag) {
        memberTag.remove();
    }
}

// Инициализация обработчиков событий для модального окна
function initAddMembersEventListeners() {
    // Поиск контактов
    document.getElementById('searchMembersBtn').addEventListener('click', () => {
        const searchTerm = document.getElementById('searchMembersInput').value.trim();
        loadAvailableMembers(searchTerm);
    });
    
    document.getElementById('searchMembersInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = document.getElementById('searchMembersInput').value.trim();
            loadAvailableMembers(searchTerm);
        }
    });
    
    document.getElementById('searchMembersInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        if (searchTerm === '') {
            loadAvailableMembers();
        }
    });
    
    // Подтверждение добавления
    document.getElementById('confirmAddMembersBtn').addEventListener('click', confirmAddMembers);
    
    // Отмена
    document.getElementById('cancelAddMembersBtn').addEventListener('click', () => {
        document.body.removeChild(document.getElementById('addMembersModal'));
        currentGroupForInvite = null;
        selectedMembersSet.clear();
    });
    
    // Закрытие при клике вне модального окна
    document.getElementById('addMembersModal').addEventListener('click', (e) => {
        if (e.target.id === 'addMembersModal') {
            document.body.removeChild(document.getElementById('addMembersModal'));
            currentGroupForInvite = null;
            selectedMembersSet.clear();
        }
    });
}

// Подтверждение добавления участников
function confirmAddMembers() {
    const selectedMembers = Array.from(selectedMembersSet);
    
    if (selectedMembers.length === 0 || !currentGroupForInvite) {
        showNotification("Выберите хотя бы одного участника");
        return;
    }
    
    // Получаем информацию о группе
    database.ref('groups/' + currentGroupForInvite).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            showNotification("Группа не найдена");
            return;
        }
        
        const group = snapshot.val();
        const groupName = group.name;
        
        // Показываем индикатор загрузки
        const confirmBtn = document.getElementById('confirmAddMembersBtn');
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Добавление...';
        confirmBtn.disabled = true;
        
        // Добавляем каждого выбранного пользователя
        const updates = {};
        const timestamp = Date.now();
        let addedCount = 0;
        
        const addMemberPromises = selectedMembers.map(userId => {
            return new Promise((resolve, reject) => {
                // Получаем имя пользователя
                database.ref('profiles/' + userId).once('value').then((userSnapshot) => {
                    const userName = userSnapshot.exists() ? 
                        (userSnapshot.val().username || userSnapshot.val().name || 'Пользователь') : 
                        'Пользователь';
                    
                    // Добавляем в обновления
                    updates[userId] = {
                        id: userId,
                        name: userName,
                        role: 'member',
                        joinedAt: timestamp,
                        isOnline: false,
                        addedBy: currentUser,
                        addedById: userId
                    };
                    
                    // Отправляем уведомление пользователю
                    sendGroupInviteNotification(userId, groupName, currentGroupForInvite, userName)
                        .then(() => {
                            addedCount++;
                            resolve();
                        })
                        .catch(error => {
                            console.error("Ошибка отправки уведомления:", error);
                            resolve(); // Продолжаем даже при ошибке уведомления
                        });
                    
                }).catch(error => {
                    console.error("Ошибка получения данных пользователя:", error);
                    resolve(); // Продолжаем даже при ошибке
                });
            });
        });
        
        // Ждем завершения всех операций
        Promise.all(addMemberPromises).then(() => {
            // Обновляем группу в базе данных
            database.ref('groups/' + currentGroupForInvite + '/members').update(updates)
                .then(() => {
                    // Обновляем активность группы
                    database.ref('groups/' + currentGroupForInvite).update({
                        lastActivity: timestamp
                    });
                    
                    showNotification(`Успешно добавлено ${addedCount} участников в группу "${groupName}"`);
                    
                    // Отправляем системное сообщение в группу
                    sendSystemMessageToGroup(currentGroupForInvite, 
                        `В группу добавлено ${addedCount} новых участников`);
                    
                    // Закрываем модальное окно
                    document.body.removeChild(document.getElementById('addMembersModal'));
                    currentGroupForInvite = null;
                    selectedMembersSet.clear();
                    
                })
                .catch((error) => {
                    console.error("Ошибка добавления участников:", error);
                    showNotification("Ошибка добавления участников");
                    confirmBtn.innerHTML = '<i class="fas fa-user-plus"></i> Добавить выбранных';
                    confirmBtn.disabled = false;
                });
            
        });
        
    }).catch((error) => {
        console.error("Ошибка получения информации о группе:", error);
        showNotification("Ошибка добавления участников");
    });
}

// Отправка уведомления о приглашении в группу
function sendGroupInviteNotification(targetUserId, groupName, groupId, userName) {
    return new Promise((resolve, reject) => {
        const messageId = database.ref('messages').push().key;
        const timestamp = Date.now();
        const inviteLink = generateInviteLink(groupId);
        
        const messageData = {
            id: messageId,
            text: `Вас добавили в группу "${groupName}"`,
            senderId: userId,
            senderName: currentUser,
            receiverId: targetUserId,
            receiverName: userName,
            timestamp: timestamp,
            isGroupInvite: true,
            groupLink: inviteLink,
            groupName: groupName,
            inviteData: {
                groupLink: inviteLink,
                groupName: groupName,
                timestamp: timestamp,
                addedBy: currentUser
            }
        };
        
        database.ref('messages/' + messageId).set(messageData)
            .then(() => {
                // Создаем или обновляем чат
                const chatId = generateChatId(targetUserId);
                updateChatInfo(chatId, `Вас добавили в группу: ${groupName}`, timestamp);
                resolve();
            })
            .catch((error) => {
                console.error("Ошибка отправки уведомления:", error);
                reject(error);
            });
    });
}

// Отправка системного сообщения в группу
function sendSystemMessageToGroup(groupId, messageText) {
    const messageId = database.ref('groupMessages').push().key;
    const timestamp = Date.now();
    
    const systemMessage = {
        id: messageId,
        text: messageText,
        senderId: 'system',
        senderName: 'Система',
        groupId: groupId,
        timestamp: timestamp,
        isSystem: true
    };
    
    database.ref('groupMessages/' + messageId).set(systemMessage);
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

function generateInviteLink(groupId) {
    return `${window.location.origin}${window.location.pathname}?join_group=${groupId}`;
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

function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Добавляем уведомление в тело документа
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// CSS стили для функции добавления участников
const addMembersStyles = `
    .selectable-contact {
        position: relative;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .selectable-contact:hover {
        background: rgba(79, 172, 254, 0.1) !important;
        transform: translateX(5px);
    }
    
    .selection-checkbox {
        margin-left: auto;
        display: flex;
        align-items: center;
    }
    
    .contact-checkbox {
        display: none;
    }
    
    .contact-checkbox + label {
        width: 20px;
        height: 20px;
        border: 2px solid var(--border-color);
        border-radius: 4px;
        cursor: pointer;
        position: relative;
        transition: all 0.3s ease;
        background: transparent;
    }
    
    .contact-checkbox:checked + label {
        background: var(--message-bg);
        border-color: var(--message-bg);
    }
    
    .contact-checkbox:checked + label:after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 12px;
        font-weight: bold;
    }
    
    .selected-member-tag {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: var(--message-bg);
        color: white;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        animation: tagAppear 0.3s ease;
    }
    
    @keyframes tagAppear {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .remove-selected-member {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        transition: all 0.2s ease;
    }
    
    .remove-selected-member:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
    }
`;

// Внедрение стилей в документ
function injectAddMembersStyles() {
    if (!document.getElementById('add-members-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'add-members-styles';
        styleSheet.textContent = addMembersStyles;
        document.head.appendChild(styleSheet);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Ждем инициализации основных функций
    const checkInit = setInterval(() => {
        if (typeof database !== 'undefined' && typeof userId !== 'undefined' && userId) {
            clearInterval(checkInit);
            initGroupInviteMembers();
        }
    }, 100);
});