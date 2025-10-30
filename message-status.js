// message-status.js - Полная система отслеживания статуса сообщений (только иконки)

class MessageStatusSystem {
    constructor(database, currentUserId) {
        this.database = database;
        this.currentUserId = currentUserId;
        this.statusListeners = new Map();
    }

    // Обновление статуса сообщения
    async updateMessageStatus(messageId, status) {
        try {
            await this.database.ref('messages/' + messageId).update({
                status: status,
                statusTimestamp: Date.now()
            });
            console.log(`Статус сообщения ${messageId} обновлен на: ${status}`);
            return true;
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            return false;
        }
    }

    // Отметка сообщения как доставленного
    async markAsDelivered(messageId) {
        return await this.updateMessageStatus(messageId, 'delivered');
    }

    // Отметка сообщения как прочитанного
    async markAsRead(messageId) {
        return await this.updateMessageStatus(messageId, 'read');
    }

    // Получение HTML для отображения статуса (только иконки)
    getStatusHTML(status) {
        switch (status) {
            case 'sent':
                return `<div class="message-status status-sent">
                    <i class="fas fa-check message-status-icon"></i>
                </div>`;
            
            case 'delivered':
                return `<div class="message-status status-delivered">
                    <i class="fas fa-check-double message-status-icon"></i>
                </div>`;
            
            case 'read':
                return `<div class="message-status status-read">
                    <i class="fas fa-check-double message-status-icon"></i>
                </div>`;
            
            default:
                return `<div class="message-status status-sent">
                    <i class="fas fa-clock message-status-icon"></i>
                </div>`;
        }
    }

    // Прослушивание изменений статуса для конкретного сообщения
    listenToMessageStatus(messageId, callback) {
        const messageRef = this.database.ref('messages/' + messageId + '/status');
        
        const statusListener = messageRef.on('value', (snapshot) => {
            const status = snapshot.val();
            if (status && callback) {
                callback(status);
            }
        });

        this.statusListeners.set(messageId, statusListener);
    }

    // Остановка прослушивания статуса сообщения
    stopListeningToMessageStatus(messageId) {
        const listener = this.statusListeners.get(messageId);
        if (listener) {
            this.database.ref('messages/' + messageId + '/status').off('value', listener);
            this.statusListeners.delete(messageId);
        }
    }

    // Автоматическая отметка сообщений как прочитанных при открытии чата
    async markChatMessagesAsRead(chatId, otherUserId) {
        try {
            const messagesSnapshot = await this.database.ref('messages')
                .orderByChild('chatId')
                .equalTo(chatId)
                .once('value');

            if (!messagesSnapshot.exists()) return;

            const updates = {};
            const now = Date.now();

            messagesSnapshot.forEach((childSnapshot) => {
                const message = childSnapshot.val();
                // Отмечаем как прочитанные только сообщения от собеседника, которые еще не прочитаны
                if (message.senderId === otherUserId && 
                    message.receiverId === this.currentUserId && 
                    message.status !== 'read') {
                    updates[`${childSnapshot.key}/status`] = 'read';
                    updates[`${childSnapshot.key}/readTimestamp`] = now;
                }
            });

            if (Object.keys(updates).length > 0) {
                await this.database.ref('messages').update(updates);
                console.log(`Отмечено ${Object.keys(updates).length / 2} сообщений как прочитанные`);
            }
        } catch (error) {
            console.error('Ошибка отметки сообщений как прочитанных:', error);
        }
    }

    // Отслеживание активности пользователя для автоматической отметки прочитанного
    setupReadReceipts(chatId, otherUserId) {
        // Отмечаем сообщения как прочитанные при открытии чата
        this.markChatMessagesAsRead(chatId, otherUserId);

        // Отмечаем новые сообщения как прочитанные в реальном времени
        const messagesRef = this.database.ref('messages');
        const newMessagesListener = messagesRef
            .orderByChild('chatId')
            .equalTo(chatId)
            .on('child_added', (snapshot) => {
                const message = snapshot.val();
                
                // Если это новое сообщение от собеседника, отмечаем как прочитанное
                if (message.senderId === otherUserId && 
                    message.receiverId === this.currentUserId && 
                    message.status !== 'read') {
                    
                    setTimeout(() => {
                        this.markAsRead(snapshot.key);
                    }, 1000); // Небольшая задержка для реалистичности
                }
            });

        return newMessagesListener;
    }

    // Очистка всех слушателей
    cleanup() {
        this.statusListeners.forEach((listener, messageId) => {
            this.stopListeningToMessageStatus(messageId);
        });
        this.statusListeners.clear();
    }
}

// Интеграция с основным кодом мессенджера
let messageStatusSystem;

// Инициализация системы статусов
function initMessageStatusSystem() {
    if (database && userId) {
        messageStatusSystem = new MessageStatusSystem(database, userId);
        console.log('Система статусов сообщений инициализирована');
    }
}

// Модифицированная функция отправки сообщения с отслеживанием статуса
async function sendMessageWithStatus() {
    const text = messageInput.value.trim();
    
    if (text && currentChatWith) {
        const messageId = database.ref('messages').push().key;
        const timestamp = Date.now();
        const chatId = currentChatId || generateChatId(currentChatWith);
        
        // Создаем сообщение со статусом "sending"
        const messageData = {
            id: messageId,
            text: text,
            senderId: userId,
            senderName: currentUser,
            receiverId: currentChatWith,
            receiverName: currentChatWithName,
            timestamp: timestamp,
            chatId: chatId,
            status: 'sending', // Изначальный статус
            read: false
        };
        
        try {
            // Сохраняем сообщение в базе данных
            await database.ref('messages/' + messageId).set(messageData);
            
            // Сразу обновляем статус на "sent"
            await messageStatusSystem.updateMessageStatus(messageId, 'sent');
            
            // Обновляем информацию о чате
            updateChatInfo(chatId, text, timestamp);
            
            // Очищаем поле ввода
            messageInput.value = '';
            sendBtn.disabled = true;
            
            // Отслеживаем изменение статуса этого сообщения
            messageStatusSystem.listenToMessageStatus(messageId, (newStatus) => {
                updateMessageStatusUI(messageId, newStatus);
            });
            
            // Имитируем доставку через случайное время (1-3 секунды)
            setTimeout(async () => {
                await messageStatusSystem.markAsDelivered(messageId);
                
                // Имитируем прочтение через случайное время (2-5 секунд), если получатель онлайн
                setTimeout(async () => {
                    const recipientStatus = await checkUserOnlineStatus(currentChatWith);
                    if (recipientStatus) {
                        await messageStatusSystem.markAsRead(messageId);
                    }
                }, 2000 + Math.random() * 3000);
                
            }, 1000 + Math.random() * 2000);
            
        } catch (error) {
            console.error("Ошибка отправки сообщения:", error);
            showNotification("Ошибка отправки сообщения");
            
            // Показываем статус ошибки
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                const statusElement = messageElement.querySelector('.message-status');
                if (statusElement) {
                    statusElement.innerHTML = `<div class="message-status status-error">
                        <i class="fas fa-exclamation-triangle message-status-icon"></i>
                    </div>`;
                }
            }
        }
    }
}

// Проверка статуса онлайн пользователя
async function checkUserOnlineStatus(userId) {
    try {
        const snapshot = await database.ref('profiles/' + userId + '/isOnline').once('value');
        return snapshot.val() === true;
    } catch (error) {
        console.error('Ошибка проверки статуса онлайн:', error);
        return false;
    }
}

// Обновление UI статуса сообщения
function updateMessageStatusUI(messageId, status) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        const statusElement = messageElement.querySelector('.message-status');
        if (statusElement) {
            const newStatusHTML = messageStatusSystem.getStatusHTML(status);
            statusElement.innerHTML = newStatusHTML;
            statusElement.classList.add('updated');
            setTimeout(() => {
                statusElement.classList.remove('updated');
            }, 500);
        }
    }
}

// Модифицированная функция добавления сообщения в чат
function addMessageToChatWithStatus(message) {
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
    
    // Добавляем статус сообщения (только для своих сообщений)
    const statusHTML = message.senderId === userId ? 
        messageStatusSystem.getStatusHTML(message.status || 'sent') : '';

    messageElement.innerHTML = `
        ${message.senderId !== userId ? `<div class="sender">${message.senderName}</div>` : ''}
        <div class="message-text">${message.text}</div>
        <div class="message-footer">
            <div class="timestamp">${timeString}</div>
            ${statusHTML}
        </div>
    `;

    messagesContainer.appendChild(messageElement);

    // Начинаем отслеживать изменения статуса для этого сообщения
    if (message.senderId === userId) {
        messageStatusSystem.listenToMessageStatus(message.id, (newStatus) => {
            updateMessageStatusUI(message.id, newStatus);
        });
    }
}

// Модифицированная функция открытия чата с системой прочитанных сообщений
function openChatWithReadReceipts(userId, userName, chatId = null) {
    currentChatWith = userId;
    currentChatWithName = userName;
    
    // Обновляем интерфейс
    chatUserName.textContent = userName;
    chatAvatarInitial.textContent = userName.charAt(0).toUpperCase();
    chatUserAvatar.style.background = generateUserColor();
    
    // Загружаем статус пользователя
    database.ref('profiles/' + userId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const user = snapshot.val();
            const statusText = user.isOnline ? 
                (user.status === 'online' ? 'Онлайн' : 
                 user.status === 'away' ? 'Отошёл' : 
                 user.status === 'busy' ? 'Занят' : 'Не в сети') : 'Не в сети';
            chatUserStatus.textContent = statusText;
        }
    });
    
    // Переключаем видимость
    chatWrapper.style.display = 'none';
    chatWindow.style.display = 'flex';
    
    // Создаем или получаем ID чата
    if (!chatId) {
        chatId = generateChatId(userId);
        createChat(chatId, userId, userName);
    }
    currentChatId = chatId;
    
    // Загружаем сообщения
    loadMessagesWithStatus(chatId);
    
    // Настраиваем систему прочитанных сообщений
    if (messageStatusSystem) {
        messageStatusSystem.setupReadReceipts(chatId, userId);
    }
    
    // Фокусируемся на поле ввода
    setTimeout(() => {
        messageInput.focus();
    }, 100);
}

// Модифицированная функция загрузки сообщений
function loadMessagesWithStatus(chatId) {
    messagesContainer.innerHTML = '<div class="empty-chat"><div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div><p>Загрузка сообщений...</p></div>';
    
    if (!currentChatWith) return;
    
    // Удаляем предыдущий слушатель, если он есть
    if (messagesListener) {
        database.ref('messages').off('value', messagesListener);
    }
    
    // Получаем сообщения из базы данных
    messagesListener = database.ref('messages').orderByChild('timestamp').on('value', (snapshot) => {
        if (!snapshot.exists()) {
            messagesContainer.innerHTML = '<div class="empty-chat"><i class="fas fa-comments"></i><p>Начните общение с этим пользователем</p></div>';
            return;
        }
        
        const messages = snapshot.val();
        messagesContainer.innerHTML = '';
        let hasMessages = false;
        
        Object.keys(messages).forEach(messageId => {
            const message = messages[messageId];
            
            // Показываем только сообщения между текущим пользователем и выбранным собеседником
            if ((message.senderId === userId && message.receiverId === currentChatWith) ||
                (message.senderId === currentChatWith && message.receiverId === userId)) {
                hasMessages = true;
                addMessageToChatWithStatus(message);
            }
        });
        
        if (!hasMessages) {
            messagesContainer.innerHTML = '<div class="empty-chat"><i class="fas fa-comments"></i><p>Начните общение с этим пользователем</p></div>';
        } else {
            // Прокручиваем вниз
            scrollToBottom();
        }
    });
}

// Сохраняем оригинальные функции для возможности отката
let originalSendMessage = null;
let originalOpenChat = null;
let originalAddMessageToChat = null;
let originalBackToChats = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Ждем инициализации Firebase и затем инициализируем систему статусов
    const initInterval = setInterval(() => {
        if (typeof database !== 'undefined' && typeof userId !== 'undefined' && database && userId) {
            clearInterval(initInterval);
            initMessageStatusSystem();
            
            // Сохраняем оригинальные функции
            if (typeof sendMessage === 'function') {
                originalSendMessage = sendMessage;
                window.sendMessage = sendMessageWithStatus;
            }
            
            if (typeof openChat === 'function') {
                originalOpenChat = openChat;
                window.openChat = openChatWithReadReceipts;
            }
            
            if (typeof addMessageToChat === 'function') {
                originalAddMessageToChat = addMessageToChat;
                window.addMessageToChat = addMessageToChatWithStatus;
            }
            
            if (typeof backToChats === 'function') {
                originalBackToChats = backToChats;
                window.backToChats = function() {
                    if (messageStatusSystem) {
                        messageStatusSystem.cleanup();
                    }
                    originalBackToChats();
                };
            }
            
            console.log('Система статусов сообщений активирована (только иконки)');
        }
    }, 100);
});

// Функция для принудительной инициализации (если автоматическая не сработала)
function forceInitMessageStatus() {
    initMessageStatusSystem();
}