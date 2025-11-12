// disappearing-messages.js
// Реальная система исчезающих сообщений для Quantum Messenger

class DisappearingMessages {
    constructor() {
        this.settings = {
            globalTimer: null,
            chatTimers: {}
        };
        this.durationOptions = [
            { value: 3600000, label: '1 час', text: '1 час' },
            { value: 86400000, label: '24 часа', text: '24 часа' },
            { value: 604800000, label: '7 дней', text: '7 дней' },
            { value: 2592000000, label: '90 дней', text: '90 дней' }
        ];
        this.activeTimers = new Map();
        this.init();
    }

    init() {
        this.loadSettings();
        this.createModals();
        this.setupEventListeners();
        this.startCleanupInterval();
        this.restoreActiveTimers();
        console.log('Disappearing messages system initialized');
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('quantumDisappearingSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            this.settings = { ...this.settings, ...parsed };
        }
    }

    saveSettings() {
        localStorage.setItem('quantumDisappearingSettings', JSON.stringify(this.settings));
    }

    createModals() {
        // Модальное окно для глобальных настроек
        const globalModal = document.createElement('div');
        globalModal.className = 'modal';
        globalModal.id = 'disappearingGlobalModal';
        globalModal.innerHTML = `
            <div class="modal-content">
                <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-clock"></i> Исчезающие сообщения
                </h3>
                <p style="margin-bottom: 20px; opacity: 0.8; font-size: 14px;">
                    Настройте таймер удаления для всех новых чатов
                </p>
                
                <div class="disappearing-options">
                    <div class="disappearing-option ${!this.settings.globalTimer ? 'active' : ''}" data-duration="0">
                        <div class="option-icon">
                            <i class="fas fa-ban"></i>
                        </div>
                        <div class="option-info">
                            <div class="option-title">Выкл</div>
                            <div class="option-desc">Сообщения не исчезают</div>
                        </div>
                        <div class="option-check">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>
                    
                    ${this.durationOptions.map(option => `
                        <div class="disappearing-option ${this.settings.globalTimer === option.value ? 'active' : ''}" data-duration="${option.value}">
                            <div class="option-icon">
                                <i class="fas fa-hourglass-half"></i>
                            </div>
                            <div class="option-info">
                                <div class="option-title">${option.label}</div>
                                <div class="option-desc">Сообщения исчезнут через ${option.text}</div>
                            </div>
                            <div class="option-check">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="modal-buttons" style="margin-top: 20px;">
                    <button class="modal-btn secondary" id="closeGlobalDisappearingBtn">Закрыть</button>
                </div>
            </div>
        `;

        // Модальное окно для настроек конкретного чата
        const chatModal = document.createElement('div');
        chatModal.className = 'modal';
        chatModal.id = 'disappearingChatModal';
        chatModal.innerHTML = `
            <div class="modal-content">
                <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-clock"></i> Исчезающие сообщения
                </h3>
                <p style="margin-bottom: 20px; opacity: 0.8; font-size: 14px;">
                    Настройте таймер удаления для этого чата
                </p>
                
                <div class="disappearing-options">
                    <div class="disappearing-option" data-duration="0">
                        <div class="option-icon">
                            <i class="fas fa-ban"></i>
                        </div>
                        <div class="option-info">
                            <div class="option-title">Выкл</div>
                            <div class="option-desc">Сообщения не исчезают</div>
                        </div>
                        <div class="option-check">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>
                    
                    ${this.durationOptions.map(option => `
                        <div class="disappearing-option" data-duration="${option.value}">
                            <div class="option-icon">
                                <i class="fas fa-hourglass-half"></i>
                            </div>
                            <div class="option-info">
                                <div class="option-title">${option.label}</div>
                                <div class="option-desc">Сообщения исчезнут через ${option.text}</div>
                            </div>
                            <div class="option-check">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="modal-buttons" style="margin-top: 20px;">
                    <button class="modal-btn secondary" id="closeChatDisappearingBtn">Закрыть</button>
                </div>
            </div>
        `;

        document.body.appendChild(globalModal);
        document.body.appendChild(chatModal);

        this.addStyles();
    }

    addStyles() {
        const styles = `
            .disappearing-options {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .disappearing-option {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 15px;
                border: 2px solid var(--border-color);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                background: rgba(255, 255, 255, 0.05);
            }

            .disappearing-option:hover {
                border-color: #4facfe;
                background: rgba(79, 172, 254, 0.1);
            }

            .disappearing-option.active {
                border-color: #4facfe;
                background: rgba(79, 172, 254, 0.15);
            }

            .option-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(79, 172, 254, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #4facfe;
                font-size: 16px;
            }

            .option-info {
                flex: 1;
            }

            .option-title {
                font-weight: 600;
                margin-bottom: 2px;
            }

            .option-desc {
                font-size: 12px;
                opacity: 0.7;
            }

            .option-check {
                color: #4facfe;
                opacity: 0;
                transition: opacity 0.2s;
            }

            .disappearing-option.active .option-check {
                opacity: 1;
            }

            .disappearing-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                background: rgba(79, 172, 254, 0.2);
                color: #4facfe;
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 10px;
                margin-left: 6px;
            }

            .disappearing-notification {
                text-align: center;
                padding: 8px 12px;
                margin: 8px 0;
                background: rgba(79, 172, 254, 0.1);
                border-radius: 8px;
                border: 1px solid rgba(79, 172, 254, 0.3);
                font-size: 12px;
                color: #4facfe;
                font-style: italic;
            }

            .message-timer {
                display: inline-flex;
                align-items: center;
                gap: 2px;
                font-size: 9px;
                opacity: 0.7;
                margin-left: 6px;
            }

            .expiring-soon {
                color: #ff6b6b;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .disappearing-menu-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .disappearing-menu-item:hover {
                background: rgba(255, 255, 255, 0.1);
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    setupEventListeners() {
        // Добавляем пункт в меню настроек приватности
        this.addToPrivacyMenu();

        // Добавляем пункт в меню чата
        this.addToChatMenu();

        // Обработчики для модальных окон
        document.addEventListener('click', (e) => {
            if (e.target.closest('.disappearing-option')) {
                const option = e.target.closest('.disappearing-option');
                const duration = parseInt(option.dataset.duration);
                const modal = option.closest('.modal');
                
                if (modal.id === 'disappearingGlobalModal') {
                    this.setGlobalTimer(duration);
                } else if (modal.id === 'disappearingChatModal') {
                    this.setChatTimer(duration);
                }
            }

            if (e.target.id === 'closeGlobalDisappearingBtn') {
                this.closeGlobalModal();
            }

            if (e.target.id === 'closeChatDisappearingBtn') {
                this.closeChatModal();
            }
        });
    }

    addToPrivacyMenu() {
        // Находим меню приватности и добавляем пункт
        const privacyModal = document.getElementById('privacyModal');
        if (privacyModal) {
            let settingsSection = privacyModal.querySelector('.settings-section');
            if (!settingsSection) {
                settingsSection = document.createElement('div');
                settingsSection.className = 'settings-section';
                privacyModal.querySelector('.modal-content').appendChild(settingsSection);
            }

            const disappearingItem = document.createElement('div');
            disappearingItem.className = 'settings-option';
            disappearingItem.innerHTML = `
                <span style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-clock"></i> Исчезающие сообщения
                </span>
                <button class="modal-btn secondary" id="configureDisappearingBtn" style="padding: 6px 12px; font-size: 12px;">
                    Настроить
                </button>
            `;
            settingsSection.appendChild(disappearingItem);

            document.getElementById('configureDisappearingBtn').addEventListener('click', () => {
                this.showGlobalModal();
            });
        }
    }

    addToChatMenu() {
        // Добавляем пункт в меню чата
        const chatMenu = document.getElementById('chatMenuContent');
        if (chatMenu) {
            // Удаляем старый пункт если есть
            const oldItem = document.getElementById('chatDisappearingBtn');
            if (oldItem) oldItem.remove();

            const disappearingItem = document.createElement('div');
            disappearingItem.className = 'chat-menu-item disappearing-menu-item';
            disappearingItem.id = 'chatDisappearingBtn';
            disappearingItem.innerHTML = `
                <i class="fas fa-clock"></i> Исчезающие сообщения
            `;
            
            // Вставляем перед опасными пунктами
            const dangerItems = chatMenu.querySelector('.chat-menu-item.danger');
            if (dangerItems) {
                chatMenu.insertBefore(disappearingItem, dangerItems);
            } else {
                chatMenu.appendChild(disappearingItem);
            }

            document.getElementById('chatDisappearingBtn').addEventListener('click', () => {
                this.showChatModal();
            });
        }
    }

    showGlobalModal() {
        const modal = document.getElementById('disappearingGlobalModal');
        if (modal) {
            // Обновляем активные опции
            const options = modal.querySelectorAll('.disappearing-option');
            options.forEach(option => {
                const duration = parseInt(option.dataset.duration);
                option.classList.toggle('active', duration === this.settings.globalTimer);
            });
            
            modal.classList.add('active');
            // Закрываем предыдущее модальное окно если нужно
            const privacyModal = document.getElementById('privacyModal');
            if (privacyModal) privacyModal.classList.remove('active');
        }
    }

    showChatModal() {
        const modal = document.getElementById('disappearingChatModal');
        if (modal && window.currentChatId) {
            // Обновляем активные опции для текущего чата
            const currentTimer = this.settings.chatTimers[window.currentChatId];
            const options = modal.querySelectorAll('.disappearing-option');
            options.forEach(option => {
                const duration = parseInt(option.dataset.duration);
                option.classList.toggle('active', duration === currentTimer);
            });
            
            modal.classList.add('active');
            document.getElementById('chatMenuContent').classList.remove('active');
        } else {
            this.showNotification("Откройте чат для настройки исчезающих сообщений");
        }
    }

    closeGlobalModal() {
        document.getElementById('disappearingGlobalModal').classList.remove('active');
    }

    closeChatModal() {
        document.getElementById('disappearingChatModal').classList.remove('active');
    }

    setGlobalTimer(duration) {
        this.settings.globalTimer = duration;
        this.saveSettings();

        // Показываем уведомление
        if (duration === 0) {
            this.showNotification("Исчезающие сообщения отключены для новых чатов");
        } else {
            const option = this.durationOptions.find(opt => opt.value === duration);
            this.showNotification(`Установлен таймер ${option.text} для новых чатов`);
        }

        this.closeGlobalModal();
    }

    setChatTimer(duration) {
        if (!window.currentChatId) {
            this.showNotification("Ошибка: чат не выбран");
            return;
        }

        const previousTimer = this.settings.chatTimers[window.currentChatId];
        this.settings.chatTimers[window.currentChatId] = duration;
        this.saveSettings();

        // Отправляем уведомление в чат
        this.sendTimerNotification(window.currentChatId, duration, previousTimer);

        // Показываем уведомление пользователю
        if (duration === 0) {
            this.showNotification("Исчезающие сообщения отключены для этого чата");
        } else {
            const option = this.durationOptions.find(opt => opt.value === duration);
            this.showNotification(`Установлен таймер ${option.text} для этого чата`);
        }

        // Обновляем таймеры для существующих сообщений
        this.updateChatTimers(window.currentChatId);

        this.closeChatModal();
    }

    sendTimerNotification(chatId, newTimer, previousTimer) {
        if (!window.database || !window.userId || !window.currentChatWith) return;

        const messageId = window.database.ref('messages').push().key;
        const timestamp = Date.now();

        let notificationText = '';
        if (newTimer === 0) {
            notificationText = `${window.currentUser} отключил(а) исчезающие сообщения`;
        } else {
            const option = this.durationOptions.find(opt => opt.value === newTimer);
            if (previousTimer) {
                notificationText = `${window.currentUser} изменил(а) таймер исчезающих сообщений на ${option.text}`;
            } else {
                notificationText = `${window.currentUser} включил(а) исчезающие сообщения (${option.text})`;
            }
        }

        const notificationData = {
            id: messageId,
            text: notificationText,
            senderId: 'system',
            senderName: 'System',
            receiverId: window.currentChatWith,
            timestamp: timestamp,
            chatId: chatId,
            type: 'disappearing_notification',
            read: false,
            isSystem: true
        };

        window.database.ref('messages/' + messageId).set(notificationData);
    }

    shouldMessageDisappear(chatId) {
        const chatTimer = this.settings.chatTimers[chatId];
        const globalTimer = this.settings.globalTimer;

        return chatTimer || globalTimer;
    }

    getMessageExpiration(chatId) {
        const chatTimer = this.settings.chatTimers[chatId];
        const globalTimer = this.settings.globalTimer;
        
        return chatTimer || globalTimer || null;
    }

    scheduleMessageDeletion(messageId, chatId, timestamp) {
        const expirationDuration = this.getMessageExpiration(chatId);
        if (!expirationDuration) return;

        const expirationTime = timestamp + expirationDuration;
        const timeUntilExpiration = expirationTime - Date.now();

        if (timeUntilExpiration > 0) {
            // Сохраняем таймер
            const timerId = setTimeout(() => {
                this.deleteMessage(messageId, chatId);
                this.activeTimers.delete(messageId);
            }, timeUntilExpiration);

            this.activeTimers.set(messageId, {
                timerId: timerId,
                expiresAt: expirationTime,
                chatId: chatId
            });

            // Сохраняем в localStorage для восстановления после перезагрузки
            this.saveActiveTimers();
        } else {
            // Сообщение уже должно быть удалено
            this.deleteMessage(messageId, chatId);
        }
    }

    deleteMessage(messageId, chatId) {
        if (!window.database) return;

        console.log(`Deleting message ${messageId} from chat ${chatId}`);
        
        window.database.ref('messages/' + messageId).remove()
            .then(() => {
                console.log(`Message ${messageId} successfully deleted`);
                // Удаляем из активных таймеров
                this.activeTimers.delete(messageId);
                this.saveActiveTimers();
            })
            .catch((error) => {
                console.error('Error deleting message:', error);
            });
    }

    updateChatTimers(chatId) {
        // Обновляем таймеры для всех сообщений в чате
        if (!window.database) return;

        window.database.ref('messages').orderByChild('chatId').equalTo(chatId).once('value').then((snapshot) => {
            if (!snapshot.exists()) return;

            const messages = snapshot.val();
            const expirationDuration = this.getMessageExpiration(chatId);

            Object.keys(messages).forEach(messageId => {
                const message = messages[messageId];
                
                // Очищаем старый таймер
                const existingTimer = this.activeTimers.get(messageId);
                if (existingTimer) {
                    clearTimeout(existingTimer.timerId);
                    this.activeTimers.delete(messageId);
                }

                // Устанавливаем новый таймер если нужно
                if (expirationDuration && !message.isSystem) {
                    this.scheduleMessageDeletion(messageId, chatId, message.timestamp);
                }

                // Обновляем сообщение в базе данных
                window.database.ref('messages/' + messageId).update({
                    isDisappearing: !!expirationDuration
                });
            });

            this.saveActiveTimers();
        });
    }

    saveActiveTimers() {
        const timersData = {};
        this.activeTimers.forEach((timer, messageId) => {
            timersData[messageId] = {
                expiresAt: timer.expiresAt,
                chatId: timer.chatId
            };
        });
        localStorage.setItem('quantumActiveTimers', JSON.stringify(timersData));
    }

    restoreActiveTimers() {
        const savedTimers = localStorage.getItem('quantumActiveTimers');
        if (!savedTimers) return;

        const timersData = JSON.parse(savedTimers);
        const now = Date.now();

        Object.keys(timersData).forEach(messageId => {
            const timer = timersData[messageId];
            const timeUntilExpiration = timer.expiresAt - now;

            if (timeUntilExpiration > 0) {
                const timerId = setTimeout(() => {
                    this.deleteMessage(messageId, timer.chatId);
                    this.activeTimers.delete(messageId);
                }, timeUntilExpiration);

                this.activeTimers.set(messageId, {
                    timerId: timerId,
                    expiresAt: timer.expiresAt,
                    chatId: timer.chatId
                });
            } else {
                // Таймер истек, удаляем сообщение
                this.deleteMessage(messageId, timer.chatId);
            }
        });
    }

    startCleanupInterval() {
        // Периодическая проверка и очистка просроченных сообщений
        setInterval(() => {
            this.cleanupExpiredMessages();
        }, 30000); // Проверка каждые 30 секунд
    }

    cleanupExpiredMessages() {
        if (!window.database) return;

        const now = Date.now();
        window.database.ref('messages').once('value').then((snapshot) => {
            if (!snapshot.exists()) return;

            const messages = snapshot.val();
            const updates = {};

            Object.keys(messages).forEach(messageId => {
                const message = messages[messageId];
                const expirationDuration = this.getMessageExpiration(message.chatId);
                
                if (expirationDuration && message.timestamp && !message.isSystem) {
                    const expirationTime = message.timestamp + expirationDuration;
                    if (expirationTime <= now) {
                        updates[messageId] = null;
                        // Очищаем таймер если есть
                        const existingTimer = this.activeTimers.get(messageId);
                        if (existingTimer) {
                            clearTimeout(existingTimer.timerId);
                            this.activeTimers.delete(messageId);
                        }
                    }
                }
            });

            if (Object.keys(updates).length > 0) {
                console.log(`Cleaning up ${Object.keys(updates).length} expired messages`);
                window.database.ref('messages').update(updates);
                this.saveActiveTimers();
            }
        });
    }

    addDisappearingBadge(messageElement, message) {
        const expirationDuration = this.getMessageExpiration(message.chatId);
        if (!expirationDuration || message.isSystem) return;

        const badge = document.createElement('span');
        badge.className = 'disappearing-badge';
        badge.innerHTML = `<i class="fas fa-clock"></i>`;
        
        const timestampElement = messageElement.querySelector('.timestamp');
        if (timestampElement) {
            timestampElement.appendChild(badge);
        }

        // Добавляем таймер обратного отсчета если сообщение скоро исчезнет
        this.addCountdownTimer(messageElement, message, expirationDuration);
    }

    addCountdownTimer(messageElement, message, expirationDuration) {
        const expirationTime = message.timestamp + expirationDuration;
        const timeLeft = expirationTime - Date.now();

        if (timeLeft > 0 && timeLeft < 60000) { // Меньше минуты
            const timerElement = document.createElement('span');
            timerElement.className = 'message-timer expiring-soon';
            timerElement.innerHTML = `<i class="fas fa-bolt"></i>`;
            
            const timestampElement = messageElement.querySelector('.timestamp');
            if (timestampElement) {
                timestampElement.appendChild(timerElement);
            }
        }
    }

    showNotification(message) {
        // Используем существующую систему уведомлений
        if (window.showNotification) {
            window.showNotification(message);
        } else {
            // Простая реализация уведомления
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
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
            document.body.appendChild(notification);
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    }
}

// Интеграция с существующей системой сообщений
function integrateDisappearingMessages() {
    // Перехватываем отправку сообщений
    const originalSendMessage = window.sendMessage;
    if (originalSendMessage) {
        window.sendMessage = function() {
            const messageInput = document.getElementById('messageInput');
            const text = messageInput.value.trim();
            
            if (text && window.currentChatWith) {
                const messageId = window.database.ref('messages').push().key;
                const timestamp = Date.now();
                const chatId = window.currentChatId || generateChatId(window.currentChatWith);
                
                const isDisappearing = window.disappearingMessages.shouldMessageDisappear(chatId);

                const messageData = {
                    id: messageId,
                    text: text,
                    senderId: window.userId,
                    senderName: window.currentUser,
                    receiverId: window.currentChatWith,
                    receiverName: window.currentChatWithName,
                    timestamp: timestamp,
                    chatId: chatId,
                    read: false,
                    isDisappearing: isDisappearing
                };
                
                // Сохраняем сообщение
                window.database.ref('messages/' + messageId).set(messageData)
                    .then(() => {
                        // Планируем удаление, если нужно
                        if (isDisappearing) {
                            window.disappearingMessages.scheduleMessageDeletion(messageId, chatId, timestamp);
                        }
                        
                        // Обновляем информацию о чате
                        if (window.updateChatInfo) {
                            window.updateChatInfo(chatId, text, timestamp);
                        }
                        
                        // Очищаем поле ввода
                        messageInput.value = '';
                        if (window.sendBtn) window.sendBtn.disabled = true;
                        
                        // Прокручиваем вниз
                        if (window.scrollToBottom) {
                            window.scrollToBottom();
                        }
                    })
                    .catch((error) => {
                        console.error("Ошибка отправки сообщения:", error);
                        if (window.showNotification) {
                            window.showNotification("Ошибка отправки сообщения");
                        }
                    });
            }
        };
    }

    // Перехватываем отображение сообщений
    const originalAddMessageToChat = window.addMessageToChat;
    if (originalAddMessageToChat) {
        window.addMessageToChat = function(message) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            
            if (message.senderId === window.userId) {
                messageElement.classList.add('my-message');
            } else {
                messageElement.classList.add('other-message');
            }

            // Добавляем класс для системных сообщений
            if (message.isSystem) {
                messageElement.classList.add('system-message');
            }
            
            const date = new Date(message.timestamp);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            let messageContent = message.text;
            if (message.type === 'disappearing_notification') {
                messageContent = `<div class="disappearing-notification">${message.text}</div>`;
            }
            
            messageElement.innerHTML = `
                ${message.senderId !== window.userId && !message.isSystem ? 
                    `<div class="sender">${message.senderName}</div>` : ''}
                <div>${messageContent}</div>
                <div class="timestamp">${timeString}</div>
            `;
            
            // Добавляем бейдж исчезающих сообщений, если нужно
            if (message.isDisappearing && !message.isSystem) {
                window.disappearingMessages.addDisappearingBadge(messageElement, message);
            }
            
            if (window.messagesContainer) {
                window.messagesContainer.appendChild(messageElement);
            }

            // Прокручиваем вниз
            if (window.scrollToBottom) {
                window.scrollToBottom();
            }
        };
    }

    // Вспомогательная функция для генерации ID чата
    function generateChatId(otherUserId) {
        const ids = [window.userId, otherUserId].sort();
        return `chat_${ids[0]}_${ids[1]}`;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Ждем инициализации Firebase
    setTimeout(() => {
        window.disappearingMessages = new DisappearingMessages();
        integrateDisappearingMessages();
        
        // Перерисовываем меню чата чтобы добавить пункт
        setTimeout(() => {
            window.disappearingMessages.addToChatMenu();
        }, 1000);
        
        console.log('Disappearing messages system loaded successfully');
    }, 1000);
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DisappearingMessages;
}