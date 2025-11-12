// group-slow-mode.js - Функция медленного режима для групповых чатов

let slowModeIntervals = {};
let slowModeTimers = {};
let slowModeListeners = {};

// Инициализация медленного режима
function initSlowMode() {
    console.log("Slow Mode system initialized");
    
    // Добавляем обработчики для существующих групп
    updateGroupsSlowModeSettings();
    
    // Слушаем изменения в настройках групп
    initSlowModeListeners();
}

// Обновление настроек медленного режима для всех групп
function updateGroupsSlowModeSettings() {
    if (!userId || !database) return;
    
    database.ref('groups').once('value').then((snapshot) => {
        if (!snapshot.exists()) return;
        
        const groups = snapshot.val();
        Object.keys(groups).forEach(groupId => {
            updateGroupSlowModeUI(groupId, groups[groupId]);
        });
    });
}

// Инициализация слушателей для медленного режима
function initSlowModeListeners() {
    // Слушаем изменения в настройках групп
    database.ref('groups').on('child_changed', (snapshot) => {
        const group = snapshot.val();
        updateGroupSlowModeUI(snapshot.key, group);
    });
}

// Обновление UI медленного режима для группы
function updateGroupSlowModeUI(groupId, group) {
    // Инициализируем настройки медленного режима, если их нет
    const slowModeSettings = group.slowMode || {
        enabled: false,
        interval: 0,
        lastMessageTimers: {}
    };
    
    // Сохраняем настройки в глобальной переменной
    slowModeIntervals[groupId] = slowModeSettings;
    
    // Обновляем UI если группа открыта
    if (currentGroupId === groupId) {
        updateCurrentGroupSlowModeUI(slowModeSettings);
    }
}

// Обновление UI медленного режима для текущей группы
function updateCurrentGroupSlowModeUI(settings) {
    const messageInput = document.getElementById('groupMessageInput');
    const sendButton = document.getElementById('sendGroupMessageBtn');
    
    if (!messageInput) return;
    
    const isAdmin = currentGroupRole === 'admin';
    
    // ВАЖНОЕ ИСПРАВЛЕНИЕ: Проверяем, что медленный режим действительно включен и настроен
    const slowModeEnabled = settings && settings.enabled && settings.interval > 0;
    
    // Если медленный режим включен и пользователь не админ
    if (slowModeEnabled && !isAdmin) {
        const userTimer = settings.lastMessageTimers?.[userId] || 0;
        const timeLeft = Math.max(0, userTimer + settings.interval - Date.now());
        
        // Если есть время ожидания, показываем отсчет в поле ввода
        if (timeLeft > 0) {
            startSlowModeTimerInInput(messageInput, sendButton, timeLeft, settings.interval);
        } else {
            // Разблокируем ввод
            resetInputToNormal(messageInput, sendButton);
        }
    } else {
        // Разблокируем ввод если медленный режим выключен или пользователь админ
        resetInputToNormal(messageInput, sendButton);
    }
}

// Сброс поля ввода в нормальное состояние
function resetInputToNormal(messageInput, sendButton) {
    messageInput.disabled = false;
    messageInput.placeholder = 'Введите сообщение...';
    messageInput.style.background = '';
    messageInput.style.color = '';
    messageInput.style.borderColor = '';
    
    if (sendButton) {
        sendButton.disabled = messageInput.value.trim() === '';
        sendButton.style.background = '';
    }
}

// Запуск таймера медленного режима в поле ввода
function startSlowModeTimerInInput(messageInput, sendButton, timeLeft, interval) {
    // Очищаем предыдущий таймер
    if (slowModeTimers[currentGroupId]) {
        clearTimeout(slowModeTimers[currentGroupId]);
    }
    
    const updateTimer = () => {
        const secondsLeft = Math.ceil(timeLeft / 1000);
        
        // ВАЖНОЕ ИСПРАВЛЕНИЕ: Проверяем корректность значений
        if (secondsLeft <= 0 || isNaN(secondsLeft)) {
            // Таймер закончился - разблокируем ввод
            resetInputToNormal(messageInput, sendButton);
            return;
        }
        
        // Обновляем placeholder с отсчетом
        const intervalText = formatSlowModeInterval(interval);
        messageInput.placeholder = `Медленный режим (${intervalText}) • Доступно через: ${secondsLeft}с`;
        
        // Меняем стили поля ввода
        messageInput.disabled = true;
        messageInput.style.background = 'rgba(244, 67, 54, 0.1)';
        messageInput.style.borderColor = 'rgba(244, 67, 54, 0.5)';
        messageInput.style.color = '#f44336';
        
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.style.background = 'rgba(244, 67, 54, 0.3)';
        }
        
        timeLeft -= 1000;
        
        // Сохраняем таймер для возможности его остановки
        slowModeTimers[currentGroupId] = setTimeout(updateTimer, 1000);
    };
    
    updateTimer();
}

// Форматирование интервала медленного режима
function formatSlowModeInterval(interval) {
    // ВАЖНОЕ ИСПРАВЛЕНИЕ: Проверяем корректность интервала
    if (!interval || interval <= 0) return "0с";
    
    const seconds = interval / 1000;
    
    if (seconds < 60) {
        return `${seconds}с`;
    } else if (seconds < 3600) {
        return `${Math.floor(seconds / 60)}м`;
    } else {
        return `${Math.floor(seconds / 3600)}ч`;
    }
}

// Проверка возможности отправки сообщения в медленном режиме
function canSendMessageInSlowMode(groupId) {
    if (!groupId || !slowModeIntervals[groupId]) return true;
    
    const settings = slowModeIntervals[groupId];
    const isAdmin = currentGroupRole === 'admin';
    
    // Админы не ограничены медленным режимом
    if (isAdmin) return true;
    
    // Если медленный режим выключен или не настроен
    if (!settings || !settings.enabled || settings.interval <= 0) return true;
    
    const userLastMessage = settings.lastMessageTimers?.[userId] || 0;
    const timeSinceLastMessage = Date.now() - userLastMessage;
    
    return timeSinceLastMessage >= settings.interval;
}

// Обновление времени последнего сообщения для пользователя
function updateUserSlowModeTimer(groupId) {
    if (!groupId || !slowModeIntervals[groupId]) return;
    
    const settings = slowModeIntervals[groupId];
    const isAdmin = currentGroupRole === 'admin';
    
    // Не обновляем таймер для админов или если медленный режим выключен
    if (isAdmin || !settings || !settings.enabled || settings.interval <= 0) return;
    
    // Обновляем время последнего сообщения
    database.ref(`groups/${groupId}/slowMode/lastMessageTimers/${userId}`).set(Date.now())
        .then(() => {
            console.log("Slow mode timer updated for user", userId);
        })
        .catch((error) => {
            console.error("Error updating slow mode timer:", error);
        });
}

// Модифицированная функция отправки сообщения с проверкой медленного режима
function sendGroupMessageWithSlowMode() {
    if (!currentGroupId) return;
    
    const text = document.getElementById('groupMessageInput').value.trim();
    if (!text) return;
    
    // Проверяем медленный режим только для обычных пользователей
    const isAdmin = currentGroupRole === 'admin';
    
    if (!isAdmin) {
        // Проверяем медленный режим для обычных пользователей
        if (!canSendMessageInSlowMode(currentGroupId)) {
            const settings = slowModeIntervals[currentGroupId];
            
            // ВАЖНОЕ ИСПРАВЛЕНИЕ: Проверяем, что медленный режим действительно активен
            if (settings && settings.enabled && settings.interval > 0) {
                const userLastMessage = settings.lastMessageTimers?.[userId] || 0;
                const timeLeft = Math.max(0, userLastMessage + settings.interval - Date.now());
                const secondsLeft = Math.ceil(timeLeft / 1000);
                
                if (secondsLeft > 0) {
                    showNotification(`Подождите ${secondsLeft} секунд перед отправкой следующего сообщения`);
                    return;
                }
            }
        }
    }
    
    // Отправляем сообщение используя оригинальную логику
    sendOriginalGroupMessage();
    
    // Обновляем таймер медленного режима для обычных пользователей
    if (!isAdmin) {
        updateUserSlowModeTimer(currentGroupId);
        
        // Запускаем визуальный отсчет в поле ввода только если медленный режим включен
        const messageInput = document.getElementById('groupMessageInput');
        const sendButton = document.getElementById('sendGroupMessageBtn');
        const settings = slowModeIntervals[currentGroupId];
        
        if (messageInput && settings && settings.enabled && settings.interval > 0) {
            startSlowModeTimerInInput(messageInput, sendButton, settings.interval, settings.interval);
        }
    }
}

// Оригинальная функция отправки сообщения (сохраненная копия)
function sendOriginalGroupMessage() {
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
        });
    }
}

// Добавление настроек медленного режима в интерфейс группы
function addSlowModeToGroupSettings(group) {
    const settingsSection = document.querySelector('#groupSettingsModal .settings-section');
    if (!settingsSection) return;
    
    const slowModeSettings = group.slowMode || {
        enabled: false,
        interval: 30000, // 30 секунд по умолчанию
        lastMessageTimers: {}
    };
    
    const slowModeHTML = `
        <div class="settings-section">
            <h4 style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-tachometer-alt"></i> Медленный режим
            </h4>
            <div class="settings-option">
                <span>Включить медленный режим</span>
                <label class="switch">
                    <input type="checkbox" id="slowModeToggle" ${slowModeSettings.enabled ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
            <div id="slowModeSettings" style="display: ${slowModeSettings.enabled ? 'block' : 'none'}; margin-top: 10px; padding: 10px; background: var(--other-msg-bg); border-radius: 8px;">
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Интервал между сообщениями:</label>
                    <select id="slowModeInterval" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-color);">
                        <option value="5000" ${slowModeSettings.interval === 5000 ? 'selected' : ''}>5 секунд</option>
                        <option value="10000" ${slowModeSettings.interval === 10000 ? 'selected' : ''}>10 секунд</option>
                        <option value="30000" ${slowModeSettings.interval === 30000 ? 'selected' : ''}>30 секунд</option>
                        <option value="60000" ${slowModeSettings.interval === 60000 ? 'selected' : ''}>1 минута</option>
                        <option value="300000" ${slowModeSettings.interval === 300000 ? 'selected' : ''}>5 минут</option>
                        <option value="900000" ${slowModeSettings.interval === 900000 ? 'selected' : ''}>15 минут</option>
                        <option value="1800000" ${slowModeSettings.interval === 1800000 ? 'selected' : ''}>30 минут</option>
                        <option value="3600000" ${slowModeSettings.interval === 3600000 ? 'selected' : ''}>1 час</option>
                    </select>
                </div>
                <div style="font-size: 12px; opacity: 0.7;">
                    <i class="fas fa-info-circle"></i>
                    Участники смогут отправлять сообщения только раз в указанный промежуток времени. Администраторы не ограничены.
                </div>
            </div>
        </div>
    `;
    
    // Вставляем настройки медленного режима после основных настроек
    settingsSection.insertAdjacentHTML('afterend', slowModeHTML);
    
    // Инициализируем обработчики для медленного режима
    initSlowModeSettingsHandlers();
}

// Инициализация обработчиков настроек медленного режима
function initSlowModeSettingsHandlers() {
    const slowModeToggle = document.getElementById('slowModeToggle');
    const slowModeSettings = document.getElementById('slowModeSettings');
    
    if (slowModeToggle && slowModeSettings) {
        slowModeToggle.addEventListener('change', function() {
            slowModeSettings.style.display = this.checked ? 'block' : 'none';
        });
    }
}

// Сохранение настроек медленного режима
function saveSlowModeSettings() {
    if (!currentGroupId) return;
    
    const slowModeToggle = document.getElementById('slowModeToggle');
    const slowModeInterval = document.getElementById('slowModeInterval');
    
    if (!slowModeToggle || !slowModeInterval) return;
    
    const slowModeData = {
        enabled: slowModeToggle.checked,
        interval: parseInt(slowModeInterval.value),
        lastMessageTimers: slowModeIntervals[currentGroupId]?.lastMessageTimers || {}
    };
    
    // Сохраняем настройки
    database.ref(`groups/${currentGroupId}/slowMode`).set(slowModeData)
        .then(() => {
            console.log("Slow mode settings saved");
            showNotification("Настройки медленного режима сохранены");
        })
        .catch((error) => {
            console.error("Error saving slow mode settings:", error);
            showNotification("Ошибка сохранения настроек медленного режима");
        });
}

// Переопределение оригинальных функций
function patchGroupFunctions() {
    // Сохраняем оригинальную функцию отправки сообщения
    if (typeof window.sendGroupMessage !== 'undefined') {
        window.originalSendGroupMessage = window.sendGroupMessage;
    } else {
        // Если функция не определена, создаем базовую
        window.originalSendGroupMessage = sendOriginalGroupMessage;
    }
    
    // Переопределяем функцию отправки сообщения
    window.sendGroupMessage = function() {
        // ВАЖНОЕ ИСПРАВЛЕНИЕ: Проверяем, что медленный режим действительно включен
        if (currentGroupId && slowModeIntervals[currentGroupId] && slowModeIntervals[currentGroupId].enabled) {
            sendGroupMessageWithSlowMode();
        } else {
            window.originalSendGroupMessage();
        }
    };
    
    // Сохраняем оригинальную функцию показа настроек
    if (typeof window.showGroupSettings !== 'undefined') {
        window.originalShowGroupSettings = window.showGroupSettings;
    }
    
    // Переопределяем функцию показа настроек
    window.showGroupSettings = function() {
        if (!currentGroupId || currentGroupRole !== 'admin') return;
        
        database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                const group = snapshot.val();
                
                // Создаем модальное окно настроек
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
                        
                        <!-- Slow Mode settings will be inserted here by addSlowModeToGroupSettings -->
                        
                        <div class="modal-buttons">
                            <button class="modal-btn primary" id="saveGroupSettingsBtn">Сохранить все настройки</button>
                            <button class="modal-btn danger" id="deleteGroupBtn">Удалить группу</button>
                            <button class="modal-btn secondary" id="closeGroupSettingsBtn">Закрыть</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Добавляем настройки медленного режима
                addSlowModeToGroupSettings(group);
                
                // Обработчики для кнопок
                document.getElementById('saveGroupSettingsBtn').addEventListener('click', () => {
                    saveAllGroupSettings(group);
                });
                
                document.getElementById('deleteGroupBtn').addEventListener('click', () => {
                    if (confirm("Вы уверены, что хотите удалить группу? Это действие нельзя отменить!")) {
                        deleteGroup();
                        document.body.removeChild(modal);
                    }
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
    };
    
    // Функция сохранения всех настроек
    window.saveAllGroupSettings = function(group) {
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
        
        // Сохраняем настройки медленного режима
        saveSlowModeSettings();
        
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

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Ждем инициализации основных систем
    const checkInit = setInterval(() => {
        if (typeof database !== 'undefined' && typeof userId !== 'undefined' && userId) {
            clearInterval(checkInit);
            
            // Патчим функции групп
            patchGroupFunctions();
            
            // Инициализируем медленный режим
            setTimeout(initSlowMode, 1000);
        }
    }, 100);
});

// CSS стили для медленного режима
const slowModeStyles = `
    .slow-mode-input {
        background: rgba(244, 67, 54, 0.1) !important;
        border-color: rgba(244, 67, 54, 0.5) !important;
        color: #f44336 !important;
    }

    .slow-mode-button {
        background: rgba(244, 67, 54, 0.3) !important;
    }

    @media (max-width: 768px) {
        #groupMessageInput::placeholder {
            font-size: 12px;
        }
    }

    @media (max-width: 480px) {
        #groupMessageInput::placeholder {
            font-size: 11px;
        }
    }

    @media (max-width: 360px) {
        #groupMessageInput::placeholder {
            font-size: 10px;
        }
    }
`;

// Добавляем стили в документ
const slowModeStyleSheet = document.createElement('style');
slowModeStyleSheet.textContent = slowModeStyles;
document.head.appendChild(slowModeStyleSheet);