// group-anonymous-admins.js - Функция анонимных администраторов
// Автор: Quantum Messenger
// Версия: 1.1 (исправлены ошибки зависимостей)

let anonymousAdmins = {};
let anonymousSettings = {};

// Инициализация функции анонимных администраторов
function initAnonymousAdmins() {
    console.log("Anonymous Admins system initialized");
    loadAnonymousSettings();
    
    // Переопределяем функции групп для добавления анонимности
    overrideGroupFunctionsForAnonymous();
    
    // Инициализируем слушатели
    initAnonymousListeners();
}

// Загрузка настроек анонимности из localStorage
function loadAnonymousSettings() {
    const savedSettings = localStorage.getItem('quantumAnonymousSettings');
    if (savedSettings) {
        anonymousSettings = JSON.parse(savedSettings);
    } else {
        anonymousSettings = {};
    }
}

// Сохранение настроек анонимности
function saveAnonymousSettings() {
    localStorage.setItem('quantumAnonymousSettings', JSON.stringify(anonymousSettings));
}

// Инициализация слушателей для анонимных администраторов
function initAnonymousListeners() {
    // Слушаем изменения в группах для обновления интерфейса
    if (typeof database !== 'undefined') {
        database.ref('groups').on('child_changed', (snapshot) => {
            const group = snapshot.val();
            updateAnonymousUI(snapshot.key, group);
        });
    }
}

// Обновление UI при изменении настроек анонимности
function updateAnonymousUI(groupId, group) {
    if (currentGroupId === groupId) {
        updateGroupChatInterfaceForAnonymous(group);
    }
}

// Показ модального окна настроек анонимных администраторов
function showAnonymousAdminsModal() {
    if (!currentGroupId || currentGroupRole !== 'admin') return;
    
    database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            showNotification("Группа не найдена");
            return;
        }
        
        const group = snapshot.val();
        const isOwner = group.creator === userId;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'anonymousAdminsModal';
        
        const anonymousEnabled = group.settings?.anonymousAdmins || false;
        const currentAnonymousStatus = isUserAnonymous(currentGroupId, userId);
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3 style="margin-bottom: 15px; text-align: center;">Анонимные администраторы</h3>
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px; color: #6c757d;">
                        <i class="fas fa-user-secret"></i>
                    </div>
                    <p>Настройки анонимности для администраторов</p>
                </div>
                
                <div class="settings-section">
                    <h4 style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-cog"></i> Настройки анонимности
                    </h4>
                    <div class="settings-option">
                        <span>Включить анонимных администраторов</span>
                        <label class="switch">
                            <input type="checkbox" id="anonymousAdminsToggle" ${anonymousEnabled ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                        Администраторы смогут скрывать свое присутствие и отправлять сообщения от имени группы
                    </div>
                </div>
                
                <div id="anonymousPersonalSettings" style="display: ${anonymousEnabled ? 'block' : 'none'}; margin-top: 20px;">
                    <div class="settings-section">
                        <h4 style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-user"></i> Личные настройки
                        </h4>
                        <div class="settings-option">
                            <span>Работать анонимно в этой группе</span>
                            <label class="switch">
                                <input type="checkbox" id="personalAnonymousToggle" ${currentAnonymousStatus ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                            Ваши сообщения будут отправляться от имени группы, и вы будете скрыты из списка участников
                        </div>
                    </div>
                    
                    <div style="background: rgba(108, 117, 125, 0.1); border: 1px solid rgba(108, 117, 125, 0.3); border-radius: 8px; padding: 15px; margin-top: 15px;">
                        <h5 style="margin-bottom: 10px; color: #6c757d; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-info-circle"></i> Как это работает:
                        </h5>
                        <div style="font-size: 13px; line-height: 1.4;">
                            <p>• Ваши сообщения будут показываться от имени группы</p>
                            <p>• Вы будете скрыты из списка участников</p>
                            <p>• Другие администраторы увидят вас в специальном списке</p>
                            <p>• Вы можете в любой момент отключить анонимность</p>
                        </div>
                    </div>
                </div>
                
                <div class="modal-buttons">
                    <button class="modal-btn primary" id="saveAnonymousSettingsBtn">
                        <i class="fas fa-save"></i> Сохранить настройки
                    </button>
                    <button class="modal-btn secondary" id="closeAnonymousModalBtn">Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Обработчики для переключателей
        const anonymousToggle = document.getElementById('anonymousAdminsToggle');
        const personalToggle = document.getElementById('personalAnonymousToggle');
        const personalSettings = document.getElementById('anonymousPersonalSettings');
        
        anonymousToggle.addEventListener('change', function() {
            personalSettings.style.display = this.checked ? 'block' : 'none';
        });
        
        // Обработчик сохранения настроек
        document.getElementById('saveAnonymousSettingsBtn').addEventListener('click', () => {
            saveAnonymousSettingsToDB(anonymousToggle.checked, personalToggle.checked);
        });
        
        // Обработчик закрытия
        document.getElementById('closeAnonymousModalBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Закрытие при клике вне модального окна
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

// Сохранение настроек анонимности в базу данных
function saveAnonymousSettingsToDB(anonymousEnabled, personalAnonymous) {
    if (!currentGroupId) return;
    
    // Обновляем настройки группы
    const updates = {
        'settings/anonymousAdmins': anonymousEnabled
    };
    
    database.ref('groups/' + currentGroupId).update(updates)
        .then(() => {
            // Сохраняем личные настройки анонимности
            setUserAnonymousStatus(currentGroupId, personalAnonymous);
            
            showNotification("Настройки анонимности сохранены");
            document.body.removeChild(document.getElementById('anonymousAdminsModal'));
            
            // Обновляем интерфейс
            database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    const group = snapshot.val();
                    updateGroupChatInterfaceForAnonymous(group);
                }
            });
        })
        .catch((error) => {
            console.error("Ошибка сохранения настроек анонимности:", error);
            showNotification("Ошибка сохранения настроек");
        });
}

// Установка статуса анонимности пользователя
function setUserAnonymousStatus(groupId, isAnonymous) {
    if (!anonymousSettings[groupId]) {
        anonymousSettings[groupId] = {};
    }
    anonymousSettings[groupId][userId] = isAnonymous;
    saveAnonymousSettings();
    
    // Обновляем отображение в интерфейсе
    updateUserVisibilityInGroup(groupId, isAnonymous);
}

// Проверка, является ли пользователь анонимным в группе
function isUserAnonymous(groupId, userId) {
    return anonymousSettings[groupId]?.[userId] || false;
}

// Обновление видимости пользователя в группе
function updateUserVisibilityInGroup(groupId, isAnonymous) {
    if (currentGroupId === groupId) {
        // Здесь будет логика скрытия/показа пользователя в интерфейсе
        updateGroupMembersDisplay();
    }
}

// Обновление отображения участников группы с учетом анонимности
function updateGroupMembersDisplay() {
    const membersList = document.querySelectorAll('.user-item');
    membersList.forEach(item => {
        // Логика скрытия анонимных пользователей будет реализована ниже
    });
}

// Обновление интерфейса группового чата с учетом анонимности
function updateGroupChatInterfaceForAnonymous(group) {
    const anonymousEnabled = group.settings?.anonymousAdmins || false;
    const isAnonymous = isUserAnonymous(currentGroupId, userId);
    
    // Обновляем меню группы
    updateGroupMenuForAnonymous(anonymousEnabled);
    
    // Обновляем поле ввода для анонимных сообщений
    updateMessageInputForAnonymous(isAnonymous);
}

// Обновление меню группы для анонимности
function updateGroupMenuForAnonymous(anonymousEnabled) {
    const groupMenuContent = document.getElementById('groupMenuContent');
    if (!groupMenuContent) return;
    
    // Удаляем существующую кнопку если есть
    const existingAnonymousBtn = document.getElementById('anonymousAdminsBtn');
    if (existingAnonymousBtn) {
        existingAnonymousBtn.remove();
    }
    
    // Добавляем кнопку настроек анонимности если пользователь админ
    if (currentGroupRole === 'admin') {
        const anonymousAdminsItem = document.createElement('div');
        anonymousAdminsItem.className = 'chat-menu-item';
        anonymousAdminsItem.id = 'anonymousAdminsBtn';
        anonymousAdminsItem.innerHTML = '<i class="fas fa-user-secret"></i> Анонимные администраторы';
        
        // Вставляем перед кнопкой очистки чата
        const clearChatBtn = document.getElementById('clearGroupChatBtn');
        if (clearChatBtn) {
            groupMenuContent.insertBefore(anonymousAdminsItem, clearChatBtn);
        } else {
            groupMenuContent.appendChild(anonymousAdminsItem);
        }
        
        // Добавляем обработчик
        anonymousAdminsItem.addEventListener('click', showAnonymousAdminsModal);
    }
}

// Обновление поля ввода для анонимных сообщений
function updateMessageInputForAnonymous(isAnonymous) {
    const messageInput = document.getElementById('groupMessageInput');
    if (!messageInput) return;
    
    if (isAnonymous) {
        messageInput.placeholder = 'Введите сообщение (от имени группы)...';
        messageInput.style.background = 'rgba(108, 117, 125, 0.1)';
        messageInput.style.borderColor = 'rgba(108, 117, 125, 0.3)';
    } else {
        messageInput.placeholder = 'Введите сообщение...';
        messageInput.style.background = '';
        messageInput.style.borderColor = '';
    }
}

// Переопределение функции отправки сообщения для поддержки анонимности
function sendAnonymousGroupMessage(text) {
    if (!currentGroupId || !text) return;
    
    database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            showNotification("Группа не найдена");
            return;
        }
        
        const group = snapshot.val();
        const isAnonymous = isUserAnonymous(currentGroupId, userId);
        const anonymousEnabled = group.settings?.anonymousAdmins || false;
        
        // Проверяем, может ли пользователь писать в группу
        const isAdmin = currentGroupRole === 'admin';
        const canWrite = isAdmin || !group.settings.adminsOnly;
        
        if (!canWrite) {
            showNotification("В этой группе могут писать только администраторы");
            return;
        }
        
        const messageId = database.ref('groupMessages').push().key;
        const timestamp = Date.now();
        
        let messageData = {};
        
        if (isAnonymous && anonymousEnabled && isAdmin) {
            // Анонимное сообщение от имени группы
            messageData = {
                id: messageId,
                text: text,
                senderId: 'anonymous_' + userId,
                senderName: group.name,
                groupId: currentGroupId,
                groupName: currentGroupName,
                timestamp: timestamp,
                isAnonymous: true,
                originalSender: userId,
                originalSenderName: currentUser
            };
        } else {
            // Обычное сообщение
            messageData = {
                id: messageId,
                text: text,
                senderId: userId,
                senderName: currentUser,
                groupId: currentGroupId,
                groupName: currentGroupName,
                timestamp: timestamp,
                isAnonymous: false
            };
        }
        
        // Сохраняем сообщение в базе данных
        database.ref('groupMessages/' + messageId).set(messageData)
            .then(() => {
                // Обновляем активность группы
                database.ref('groups/' + currentGroupId).update({
                    lastActivity: timestamp
                });
                
                // Очищаем поле ввода
                const messageInput = document.getElementById('groupMessageInput');
                if (messageInput) {
                    messageInput.value = '';
                    const sendButton = document.getElementById('sendGroupMessageBtn');
                    if (sendButton) {
                        sendButton.disabled = true;
                    }
                }
                
                // Прокручиваем вниз
                scrollGroupToBottom();
            })
            .catch((error) => {
                console.error("Ошибка отправки сообщения:", error);
                showNotification("Ошибка отправки сообщения");
            });
    });
}

// Модифицированная функция добавления сообщения в чат для анонимных сообщений
function addAnonymousMessageToChat(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.dataset.messageId = message.id;
    
    // Определяем, наше ли это сообщение
    const isMyMessage = message.senderId === userId || 
                       (message.isAnonymous && message.originalSender === userId);
    
    if (isMyMessage) {
        messageElement.classList.add('my-message');
    } else {
        messageElement.classList.add('other-message');
    }
    
    // Добавляем класс для анонимных сообщений
    if (message.isAnonymous) {
        messageElement.classList.add('anonymous-message');
    }
    
    const date = new Date(message.timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let messageHTML = '';
    
    if (message.isAnonymous) {
        // Анонимное сообщение от имени группы
        messageHTML = `
            <div class="anonymous-message-header">
                <div class="group-avatar-small" style="display: inline-flex; align-items: center; gap: 5px;">
                    <div style="width: 16px; height: 16px; border-radius: 50%; background: linear-gradient(to right, #ff7e5f, #feb47b); display: flex; align-items: center; justify-content: center; font-size: 8px; color: white;">
                        <i class="fas fa-users"></i>
                    </div>
                    <span style="font-weight: bold; font-size: 12px;">${message.senderName}</span>
                </div>
                ${isMyMessage ? '<span style="font-size: 10px; opacity: 0.7; margin-left: 8px;">(Анонимно)</span>' : ''}
            </div>
            <div class="message-content">${message.text}</div>
            <div class="timestamp">${timeString}</div>
        `;
    } else {
        // Обычное сообщение
        messageHTML = `
            ${message.senderId !== userId ? `<div class="sender">${message.senderName}</div>` : ''}
            <div class="message-content">${message.text}</div>
            <div class="timestamp">${timeString}</div>
        `;
    }
    
    messageElement.innerHTML = messageHTML;
    
    // Добавляем кнопки действий для сообщений
    const messageActions = document.createElement('div');
    messageActions.className = 'message-actions';
    messageActions.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        display: none;
        background: var(--header-bg);
        border-radius: 15px;
        padding: 5px;
    `;
    
    if (isMyMessage && message.isAnonymous) {
        messageActions.innerHTML = `
            <button class="reveal-identity-btn" title="Раскрыть личность" style="background: none; border: none; color: var(--text-color); cursor: pointer; font-size: 12px; opacity: 0.7; margin-right: 5px;">
                <i class="fas fa-eye"></i>
            </button>
        `;
        
        // Обработчик раскрытия личности
        messageActions.querySelector('.reveal-identity-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            revealAnonymousIdentity(message.id);
        });
    }
    
    messageElement.appendChild(messageActions);
    
    // Показываем кнопки действий при наведении
    messageElement.addEventListener('mouseenter', () => {
        messageActions.style.display = 'block';
    });
    
    messageElement.addEventListener('mouseleave', () => {
        messageActions.style.display = 'none';
    });
    
    const messagesContainer = document.getElementById('groupMessagesContainer');
    if (messagesContainer) {
        messagesContainer.appendChild(messageElement);
    }
}

// Раскрытие личности анонимного сообщения
function revealAnonymousIdentity(messageId) {
    if (!currentGroupId) return;
    
    database.ref('groupMessages/' + messageId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const message = snapshot.val();
            if (message.isAnonymous && message.originalSender === userId) {
                // Обновляем сообщение, убирая анонимность
                const updates = {
                    senderId: userId,
                    senderName: currentUser,
                    isAnonymous: false,
                    originalSender: null,
                    originalSenderName: null
                };
                
                database.ref('groupMessages/' + messageId).update(updates)
                    .then(() => {
                        showNotification("Личность раскрыта");
                    })
                    .catch((error) => {
                        console.error("Ошибка раскрытия личности:", error);
                        showNotification("Ошибка раскрытия личности");
                    });
            }
        }
    });
}

// Безопасная проверка медленного режима
function safeCanSendMessageInSlowMode(groupId) {
    if (typeof canSendMessageInSlowMode === 'function') {
        return canSendMessageInSlowMode(groupId);
    }
    // Если функция не определена, разрешаем отправку
    return true;
}

// Безопасное обновление таймера медленного режима
function safeUpdateUserSlowModeTimer(groupId) {
    if (typeof updateUserSlowModeTimer === 'function') {
        updateUserSlowModeTimer(groupId);
    }
}

// Безопасный запуск таймера в поле ввода
function safeStartSlowModeTimerInInput(input, button, interval, maxInterval) {
    if (typeof startSlowModeTimerInInput === 'function') {
        startSlowModeTimerInInput(input, button, interval, maxInterval);
    }
}

// Безопасное получение настроек медленного режима
function getSafeSlowModeSettings(groupId) {
    // ИСПРАВЛЕНИЕ: Проверяем существование переменной slowModeIntervals
    if (typeof slowModeIntervals !== 'undefined' && slowModeIntervals && slowModeIntervals[groupId]) {
        return slowModeIntervals[groupId];
    }
    
    // Возвращаем настройки по умолчанию если переменная не определена
    return {
        interval: 0,
        lastMessageTimers: {}
    };
}

// Переопределение функций групп для добавления анонимности
function overrideGroupFunctionsForAnonymous() {
    // Переопределяем createGroupChatInterface для добавления кнопки анонимности
    const originalCreateGroupChatInterface = window.createGroupChatInterface;
    if (originalCreateGroupChatInterface) {
        window.createGroupChatInterface = function(group) {
            originalCreateGroupChatInterface.call(this, group);
            updateGroupChatInterfaceForAnonymous(group);
        };
    }
    
    // Переопределяем sendGroupMessage для поддержки анонимности
    const originalSendGroupMessage = window.sendGroupMessage;
    if (originalSendGroupMessage) {
        window.sendGroupMessage = function() {
            const text = document.getElementById('groupMessageInput').value.trim();
            if (!text || !currentGroupId) return;
            
            // Проверяем медленный режим для обычных пользователей
            const isAdmin = currentGroupRole === 'admin';
            
            if (!isAdmin) {
                // ИСПРАВЛЕНИЕ: Используем безопасную проверку
                if (!safeCanSendMessageInSlowMode(currentGroupId)) {
                    // ИСПРАВЛЕНИЕ: Используем безопасное получение настроек
                    const settings = getSafeSlowModeSettings(currentGroupId);
                    const userLastMessage = settings.lastMessageTimers?.[userId] || 0;
                    const timeLeft = Math.max(0, userLastMessage + settings.interval - Date.now());
                    const secondsLeft = Math.ceil(timeLeft / 1000);
                    
                    showNotification(`Подождите ${secondsLeft} секунд перед отправкой следующего сообщения`);
                    return;
                }
            }
            
            // Используем функцию отправки анонимных сообщений
            sendAnonymousGroupMessage(text);
            
            // Обновляем таймер медленного режима для обычных пользователей
            if (!isAdmin) {
                // ИСПРАВЛЕНИЕ: Используем безопасное обновление
                safeUpdateUserSlowModeTimer(currentGroupId);
                
                // Запускаем визуальный отсчет в поле ввода
                const messageInput = document.getElementById('groupMessageInput');
                const sendButton = document.getElementById('sendGroupMessageBtn');
                // ИСПРАВЛЕНИЕ: Используем безопасное получение настроек
                const settings = getSafeSlowModeSettings(currentGroupId);
                
                if (messageInput && settings) {
                    // ИСПРАВЛЕНИЕ: Используем безопасный запуск таймера
                    safeStartSlowModeTimerInInput(messageInput, sendButton, settings.interval, settings.interval);
                }
            }
        };
    }
    
    // Переопределяем addGroupMessageToChat для отображения анонимных сообщений
    const originalAddGroupMessageToChat = window.addGroupMessageToChat;
    if (originalAddGroupMessageToChat) {
        window.addGroupMessageToChat = function(message) {
            if (message.isAnonymous) {
                addAnonymousMessageToChat(message);
            } else {
                originalAddGroupMessageToChat.call(this, message);
            }
        };
    }
    
    // Переопределяем showGroupSettings для добавления настроек анонимности
    const originalShowGroupSettings = window.showGroupSettings;
    if (originalShowGroupSettings) {
        window.showGroupSettings = function() {
            if (!currentGroupId || currentGroupRole !== 'admin') return;
            
            database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    const group = snapshot.val();
                    const isOwner = group.creator === userId;
                    const anonymousEnabled = group.settings?.anonymousAdmins || false;
                    
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
                                <div class="settings-option">
                                    <span>Анонимные администраторы</span>
                                    <label class="switch">
                                        <input type="checkbox" id="editAnonymousAdminsToggle" ${anonymousEnabled ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                            </div>
                            
                            ${isOwner ? `
                            <div class="settings-section" style="margin-top: 20px;">
                                <h4 style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px; color: #ffd700;">
                                    <i class="fas fa-crown"></i> Права владельца
                                </h4>
                                <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 8px; padding: 15px;">
                                    <p style="margin-bottom: 10px; font-size: 14px;">Вы являетесь владельцем этой группы</p>
                                    <button class="modal-btn" id="openTransferOwnershipBtn" style="width: 100%; background: linear-gradient(to right, #ffd700, #ffed4e); color: #000; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                                        <i class="fas fa-crown"></i> Передать права владельца
                                    </button>
                                </div>
                            </div>
                            ` : ''}
                            
                            <div class="modal-buttons">
                                <button class="modal-btn primary" id="saveGroupSettingsBtn">Сохранить</button>
                                ${isOwner ? `
                                <button class="modal-btn danger" id="deleteGroupBtn">Удалить группу</button>
                                ` : ''}
                                <button class="modal-btn secondary" id="closeGroupSettingsBtn">Закрыть</button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(modal);
                    
                    // Обработчики для кнопок
                    document.getElementById('saveGroupSettingsBtn').addEventListener('click', () => {
                        saveAllGroupSettingsWithAnonymous(group);
                    });
                    
                    if (isOwner) {
                        document.getElementById('deleteGroupBtn').addEventListener('click', () => {
                            deleteGroup();
                        });
                        
                        document.getElementById('openTransferOwnershipBtn').addEventListener('click', () => {
                            document.body.removeChild(modal);
                            showTransferOwnershipModal();
                        });
                    }
                    
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
        };
    }
    
    // Функция сохранения всех настроек с анонимностью
    window.saveAllGroupSettingsWithAnonymous = function(group) {
        const newName = document.getElementById('editGroupName').value.trim();
        const newDescription = document.getElementById('editGroupDescription').value.trim();
        const isPublic = document.getElementById('editPublicToggle').checked;
        const approvalRequired = document.getElementById('editApprovalToggle').checked;
        const adminsOnly = document.getElementById('editAdminsOnlyToggle').checked;
        const showTyping = document.getElementById('editShowTypingToggle').checked;
        const allowReactions = document.getElementById('editAllowReactionsToggle').checked;
        const anonymousAdmins = document.getElementById('editAnonymousAdminsToggle').checked;
        
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
            'settings/allowReactions': allowReactions,
            'settings/anonymousAdmins': anonymousAdmins
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
    };
}

// CSS стили для анонимных администраторов
const anonymousAdminsStyles = `
    .anonymous-message {
        background: rgba(108, 117, 125, 0.05) !important;
        border-left: 3px solid #6c757d;
    }
    
    .anonymous-message-header {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
        font-size: 12px;
    }
    
    .group-avatar-small {
        display: inline-flex;
        align-items: center;
        gap: 5px;
    }
    
    .reveal-identity-btn {
        background: none;
        border: none;
        color: var(--text-color);
        cursor: pointer;
        font-size: 12px;
        opacity: 0.7;
        transition: all 0.2s;
    }
    
    .reveal-identity-btn:hover {
        opacity: 1;
        transform: scale(1.1);
        color: #4facfe;
    }
    
    .anonymous-user-item {
        opacity: 0.6;
        background: rgba(108, 117, 125, 0.1);
    }
    
    .anonymous-badge {
        background: #6c757d;
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 10px;
        margin-left: 8px;
    }
    
    @media (max-width: 768px) {
        .anonymous-message-header {
            font-size: 11px;
        }
        
        .anonymous-badge {
            font-size: 9px;
            padding: 1px 4px;
        }
    }
    
    @media (max-width: 480px) {
        .anonymous-message-header {
            font-size: 10px;
        }
        
        .anonymous-badge {
            font-size: 8px;
            padding: 1px 3px;
        }
    }
`;

// Добавляем стили в документ
const anonymousAdminsStyleSheet = document.createElement('style');
anonymousAdminsStyleSheet.textContent = anonymousAdminsStyles;
document.head.appendChild(anonymousAdminsStyleSheet);

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Ждем инициализации основных систем
    const checkInit = setInterval(() => {
        if (typeof database !== 'undefined' && typeof userId !== 'undefined' && userId) {
            clearInterval(checkInit);
            
            // Инициализируем систему анонимных администраторов
            setTimeout(initAnonymousAdmins, 2000);
        }
    }, 100);
});