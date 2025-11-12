// pinned-messages.js - Функциональность закрепленных сообщений для групп Quantum Messenger

// Глобальные переменные для закрепленных сообщений
let currentPinnedMessages = [];
let pinnedMessagesListener = null;

// Инициализация функционала закрепленных сообщений
function initPinnedMessages() {
    console.log("Инициализация функционала закрепленных сообщений...");
    
    // Добавляем стили для закрепленных сообщений
    addPinnedMessagesStyles();
    
    // Расширяем контекстное меню сообщений
    extendMessageContextMenu();
}

// Добавление стилей для закрепленных сообщений
function addPinnedMessagesStyles() {
    const styles = `
        .pinned-messages-container {
            background: var(--header-bg);
            border-bottom: 1px solid var(--border-color);
            padding: 10px;
            max-height: 150px;
            overflow-y: auto;
            transition: all 0.3s ease;
        }
        
        .pinned-messages-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
            color: var(--text-color);
            opacity: 0.7;
        }
        
        .pinned-messages-header i {
            margin-right: 5px;
        }
        
        .pinned-message-item {
            background: var(--other-msg-bg);
            border-radius: 10px;
            padding: 8px 12px;
            margin-bottom: 5px;
            cursor: pointer;
            transition: all 0.2s;
            border-left: 3px solid #4facfe;
        }
        
        .pinned-message-item:hover {
            background: var(--message-bg);
            transform: translateX(2px);
        }
        
        .pinned-message-content {
            font-size: 13px;
            margin-bottom: 4px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .pinned-message-info {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            opacity: 0.6;
        }
        
        .pinned-message-sender {
            font-weight: bold;
        }
        
        .no-pinned-messages {
            text-align: center;
            padding: 15px;
            font-size: 13px;
            opacity: 0.6;
        }
        
        .close-pinned-btn {
            background: none;
            border: none;
            color: var(--text-color);
            cursor: pointer;
            opacity: 0.7;
            padding: 2px 5px;
            border-radius: 3px;
        }
        
        .close-pinned-btn:hover {
            opacity: 1;
            background: var(--other-msg-bg);
        }
        
        .pin-message-btn, .unpin-message-btn {
            background: none;
            border: none;
            color: var(--text-color);
            cursor: pointer;
            padding: 5px;
            border-radius: 3px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.2s;
        }
        
        .pin-message-btn:hover {
            color: #4facfe;
            background: rgba(79, 172, 254, 0.1);
        }
        
        .unpin-message-btn:hover {
            color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
        }
        
        .message-pinned-badge {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            background: rgba(79, 172, 254, 0.1);
            color: #4facfe;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 10px;
            margin-left: 5px;
        }
        
        @media (max-width: 768px) {
            .pinned-messages-container {
                padding: 8px;
                max-height: 120px;
            }
            
            .pinned-message-item {
                padding: 6px 10px;
            }
            
            .pinned-message-content {
                font-size: 12px;
                -webkit-line-clamp: 1;
            }
        }
        
        @media (max-width: 480px) {
            .pinned-messages-container {
                padding: 5px;
                max-height: 100px;
            }
            
            .pinned-message-item {
                padding: 5px 8px;
            }
            
            .pinned-message-content {
                font-size: 11px;
            }
            
            .pinned-message-info {
                font-size: 9px;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Расширение контекстного меню сообщений
function extendMessageContextMenu() {
    // Переопределяем функцию добавления сообщения в чат
    const originalAddGroupMessageToChat = window.addGroupMessageToChat;
    
    window.addGroupMessageToChat = function(message) {
        // Вызываем оригинальную функцию
        if (originalAddGroupMessageToChat) {
            originalAddGroupMessageToChat(message);
        }
        
        // Добавляем обработчики для закрепления
        addPinHandlersToMessage(message);
    };
}

// Добавление обработчиков закрепления к сообщению
function addPinHandlersToMessage(message) {
    const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (!messageElement) return;
    
    // Добавляем бейдж закрепленного сообщения
    if (message.isPinned) {
        const messageHeader = messageElement.querySelector('.message-content');
        if (messageHeader) {
            const pinBadge = document.createElement('span');
            pinBadge.className = 'message-pinned-badge';
            pinBadge.innerHTML = '<i class="fas fa-thumbtack"></i> Закреплено';
            messageHeader.appendChild(pinBadge);
        }
    }
    
    // Добавляем кнопки в меню действий сообщения
    const messageActions = messageElement.querySelector('.message-actions');
    if (messageActions) {
        let pinButton;
        
        if (message.isPinned) {
            pinButton = document.createElement('button');
            pinButton.className = 'unpin-message-btn';
            pinButton.innerHTML = '<i class="fas fa-thumbtack"></i>';
            pinButton.title = 'Открепить сообщение';
        } else {
            pinButton = document.createElement('button');
            pinButton.className = 'pin-message-btn';
            pinButton.innerHTML = '<i class="fas fa-thumbtack"></i>';
            pinButton.title = 'Закрепить сообщение';
        }
        
        pinButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (message.isPinned) {
                unpinMessage(message.id);
            } else {
                pinMessage(message.id);
            }
        });
        
        messageActions.appendChild(pinButton);
    }
}

// Показ закрепленных сообщений
function showPinnedMessages() {
    if (!currentGroupId) return;
    
    // Создаем контейнер для закрепленных сообщений
    let pinnedContainer = document.getElementById('pinnedMessagesContainer');
    if (!pinnedContainer) {
        pinnedContainer = document.createElement('div');
        pinnedContainer.className = 'pinned-messages-container';
        pinnedContainer.id = 'pinnedMessagesContainer';
        
        // Вставляем перед контейнером сообщений
        const messagesContainer = document.getElementById('groupMessagesContainer');
        if (messagesContainer && messagesContainer.parentNode) {
            messagesContainer.parentNode.insertBefore(pinnedContainer, messagesContainer);
        }
    }
    
    // Загружаем закрепленные сообщения
    loadPinnedMessages();
}

// Загрузка закрепленных сообщений
function loadPinnedMessages() {
    if (!currentGroupId) return;
    
    const pinnedContainer = document.getElementById('pinnedMessagesContainer');
    if (!pinnedContainer) return;
    
    pinnedContainer.innerHTML = `
        <div class="pinned-messages-header">
            <div>
                <i class="fas fa-thumbtack"></i>
                Закрепленные сообщения
            </div>
            <button class="close-pinned-btn" title="Скрыть">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="loading-dots">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        </div>
    `;
    
    // Обработчик закрытия
    pinnedContainer.querySelector('.close-pinned-btn').addEventListener('click', hidePinnedMessages);
    
    // Удаляем предыдущий слушатель
    if (pinnedMessagesListener) {
        database.ref('groupMessages').off('value', pinnedMessagesListener);
    }
    
    // Слушаем изменения в сообщениях
    pinnedMessagesListener = database.ref('groupMessages').on('value', (snapshot) => {
        if (!snapshot.exists()) {
            pinnedContainer.innerHTML = `
                <div class="pinned-messages-header">
                    <div>
                        <i class="fas fa-thumbtack"></i>
                        Закрепленные сообщения
                    </div>
                    <button class="close-pinned-btn" title="Скрыть">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="no-pinned-messages">
                    Нет закрепленных сообщений
                </div>
            `;
            pinnedContainer.querySelector('.close-pinned-btn').addEventListener('click', hidePinnedMessages);
            return;
        }
        
        const messages = snapshot.val();
        currentPinnedMessages = [];
        
        // Собираем закрепленные сообщения
        Object.keys(messages).forEach(messageId => {
            const message = messages[messageId];
            if (message.groupId === currentGroupId && message.isPinned) {
                currentPinnedMessages.push({...message, id: messageId});
            }
        });
        
        // Сортируем по времени закрепления (если есть) или по времени отправки
        currentPinnedMessages.sort((a, b) => (b.pinnedAt || b.timestamp) - (a.pinnedAt || a.timestamp));
        
        // Отображаем закрепленные сообщения
        displayPinnedMessages(currentPinnedMessages);
    });
}

// Отображение закрепленных сообщений
function displayPinnedMessages(pinnedMessages) {
    const pinnedContainer = document.getElementById('pinnedMessagesContainer');
    if (!pinnedContainer) return;
    
    if (pinnedMessages.length === 0) {
        pinnedContainer.innerHTML = `
            <div class="pinned-messages-header">
                <div>
                    <i class="fas fa-thumbtack"></i>
                    Закрепленные сообщения
                </div>
                <button class="close-pinned-btn" title="Скрыть">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="no-pinned-messages">
                Нет закрепленных сообщений
            </div>
        `;
    } else {
        let pinnedHTML = `
            <div class="pinned-messages-header">
                <div>
                    <i class="fas fa-thumbtack"></i>
                    Закрепленные сообщения (${pinnedMessages.length})
                </div>
                <button class="close-pinned-btn" title="Скрыть">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        pinnedMessages.forEach(message => {
            const date = new Date(message.timestamp);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const shortText = message.text.length > 100 ? message.text.substring(0, 100) + '...' : message.text;
            
            pinnedHTML += `
                <div class="pinned-message-item" data-message-id="${message.id}">
                    <div class="pinned-message-content">${shortText}</div>
                    <div class="pinned-message-info">
                        <span class="pinned-message-sender">${message.senderName}</span>
                        <span class="pinned-message-time">${timeString}</span>
                    </div>
                </div>
            `;
        });
        
        pinnedContainer.innerHTML = pinnedHTML;
        
        // Добавляем обработчики клика для прокрутки к сообщению
        pinnedContainer.querySelectorAll('.pinned-message-item').forEach(item => {
            item.addEventListener('click', () => {
                scrollToMessage(item.dataset.messageId);
            });
        });
        
        // Обработчик закрытия
        pinnedContainer.querySelector('.close-pinned-btn').addEventListener('click', hidePinnedMessages);
    }
}

// Скрытие закрепленных сообщений
function hidePinnedMessages() {
    const pinnedContainer = document.getElementById('pinnedMessagesContainer');
    if (pinnedContainer) {
        pinnedContainer.style.display = 'none';
    }
}

// Прокрутка к сообщению
function scrollToMessage(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Добавляем подсветку
        messageElement.style.backgroundColor = 'rgba(79, 172, 254, 0.1)';
        messageElement.style.transition = 'background-color 0.3s';
        
        setTimeout(() => {
            messageElement.style.backgroundColor = '';
        }, 2000);
    }
}

// Закрепление сообщения
function pinMessage(messageId) {
    if (!currentGroupId || !currentGroupRole) return;
    
    // Проверяем права (только админы могут закреплять)
    if (currentGroupRole !== 'admin') {
        showNotification("Только администраторы могут закреплять сообщения");
        return;
    }
    
    const updates = {
        isPinned: true,
        pinnedAt: Date.now(),
        pinnedBy: userId,
        pinnedByName: currentUser
    };
    
    database.ref(`groupMessages/${messageId}`).update(updates)
        .then(() => {
            showNotification("Сообщение закреплено");
            
            // Показываем закрепленные сообщения, если они скрыты
            showPinnedMessages();
        })
        .catch((error) => {
            console.error("Ошибка закрепления сообщения:", error);
            showNotification("Ошибка закрепления сообщения");
        });
}

// Открепление сообщения
function unpinMessage(messageId) {
    if (!currentGroupId || !currentGroupRole) return;
    
    // Проверяем права (только админы могут откреплять)
    if (currentGroupRole !== 'admin') {
        showNotification("Только администраторы могут откреплять сообщения");
        return;
    }
    
    const updates = {
        isPinned: false,
        pinnedAt: null,
        pinnedBy: null,
        pinnedByName: null
    };
    
    database.ref(`groupMessages/${messageId}`).update(updates)
        .then(() => {
            showNotification("Сообщение откреплено");
        })
        .catch((error) => {
            console.error("Ошибка открепления сообщения:", error);
            showNotification("Ошибка открепления сообщения");
        });
}

// Управление закрепленными сообщениями (модальное окно)
function showPinnedMessagesManager() {
    if (!currentGroupId) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'pinnedMessagesManagerModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">
                <i class="fas fa-thumbtack"></i> Управление закрепленными сообщениями
            </h3>
            <div style="margin-bottom: 15px; text-align: center; font-size: 14px; opacity: 0.7;">
                Всего закреплено: <span id="pinnedCount">0</span> сообщений
            </div>
            <div id="pinnedMessagesList" style="max-height: 400px; overflow-y: auto; margin-bottom: 15px;">
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn secondary" id="closePinnedManagerBtn">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Загружаем закрепленные сообщения
    loadPinnedMessagesForManager();
    
    document.getElementById('closePinnedManagerBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Загрузка закрепленных сообщений для менеджера
function loadPinnedMessagesForManager() {
    if (!currentGroupId) return;
    
    const pinnedList = document.getElementById('pinnedMessagesList');
    const pinnedCount = document.getElementById('pinnedCount');
    
    database.ref('groupMessages').orderByChild('isPinned').equalTo(true).once('value')
        .then((snapshot) => {
            if (!snapshot.exists()) {
                pinnedList.innerHTML = '<div class="no-pinned-messages">Нет закрепленных сообщений</div>';
                pinnedCount.textContent = '0';
                return;
            }
            
            const messages = snapshot.val();
            let pinnedMessages = [];
            
            Object.keys(messages).forEach(messageId => {
                const message = messages[messageId];
                if (message.groupId === currentGroupId) {
                    pinnedMessages.push({...message, id: messageId});
                }
            });
            
            // Сортируем по времени закрепления
            pinnedMessages.sort((a, b) => (b.pinnedAt || b.timestamp) - (a.pinnedAt || a.timestamp));
            
            pinnedCount.textContent = pinnedMessages.length.toString();
            
            if (pinnedMessages.length === 0) {
                pinnedList.innerHTML = '<div class="no-pinned-messages">Нет закрепленных сообщений</div>';
                return;
            }
            
            let messagesHTML = '';
            pinnedMessages.forEach(message => {
                const date = new Date(message.timestamp);
                const pinnedDate = new Date(message.pinnedAt || message.timestamp);
                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const pinnedTimeString = pinnedDate.toLocaleDateString() + ' ' + pinnedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                messagesHTML += `
                    <div class="pinned-message-item" style="margin-bottom: 10px; position: relative;">
                        <div class="pinned-message-content">${message.text}</div>
                        <div class="pinned-message-info">
                            <span>От: ${message.senderName}</span>
                            <span>${timeString}</span>
                        </div>
                        <div style="font-size: 10px; opacity: 0.5; margin-top: 3px;">
                            Закреплено: ${message.pinnedByName || 'администратором'} ${pinnedTimeString}
                        </div>
                        <button class="unpin-message-btn" data-message-id="${message.id}" style="position: absolute; top: 5px; right: 5px; background: rgba(255, 107, 107, 0.1);">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            });
            
            pinnedList.innerHTML = messagesHTML;
            
            // Добавляем обработчики для кнопок открепления
            pinnedList.querySelectorAll('.unpin-message-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const messageId = e.target.closest('.unpin-message-btn').dataset.messageId;
                    unpinMessage(messageId);
                    
                    // Обновляем список
                    setTimeout(loadPinnedMessagesForManager, 100);
                });
            });
        })
        .catch((error) => {
            console.error("Ошибка загрузки закрепленных сообщений:", error);
            pinnedList.innerHTML = '<div class="no-pinned-messages">Ошибка загрузки</div>';
        });
}

// Интеграция с групповым чатом
function integratePinnedMessagesWithGroupChat() {
    // Добавляем кнопку управления закрепленными сообщениями в меню группы
    const groupMenuContent = document.getElementById('groupMenuContent');
    if (groupMenuContent && !document.getElementById('pinnedMessagesBtn')) {
        const pinnedMessagesItem = document.createElement('div');
        pinnedMessagesItem.className = 'chat-menu-item';
        pinnedMessagesItem.id = 'pinnedMessagesBtn';
        pinnedMessagesItem.innerHTML = '<i class="fas fa-thumbtack"></i> Закрепленные сообщения';
        
        // Вставляем перед "Очистить историю"
        const clearChatBtn = document.getElementById('clearGroupChatBtn');
        if (clearChatBtn) {
            clearChatBtn.parentNode.insertBefore(pinnedMessagesItem, clearChatBtn);
        } else {
            groupMenuContent.appendChild(pinnedMessagesItem);
        }
        
        // Обработчик для кнопки
        pinnedMessagesItem.addEventListener('click', () => {
            showPinnedMessagesManager();
            document.getElementById('groupMenuContent').classList.remove('active');
        });
    }
    
    // Показываем закрепленные сообщения при открытии группового чата
    if (currentGroupId) {
        showPinnedMessages();
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    const checkInit = setInterval(() => {
        if (typeof database !== 'undefined' && typeof userId !== 'undefined' && userId) {
            clearInterval(checkInit);
            initPinnedMessages();
            
            // Интегрируем с групповым чатом после его создания
            const checkGroupChat = setInterval(() => {
                if (document.getElementById('groupMenuContent')) {
                    clearInterval(checkGroupChat);
                    integratePinnedMessagesWithGroupChat();
                }
            }, 500);
        }
    }, 100);
});

// Обновление функции открытия группового чата для интеграции
const originalOpenGroupChat = window.openGroupChat;
window.openGroupChat = function(groupId, groupName) {
    if (originalOpenGroupChat) {
        originalOpenGroupChat(groupId, groupName);
    }
    
    // Показываем закрепленные сообщения
    setTimeout(() => {
        showPinnedMessages();
        integratePinnedMessagesWithGroupChat();
    }, 500);
};

// Обновление функции возврата к группам
const originalBackToGroups = window.backToGroups;
window.backToGroups = function() {
    // Скрываем закрепленные сообщения
    hidePinnedMessages();
    
    // Удаляем слушатель закрепленных сообщений
    if (pinnedMessagesListener) {
        database.ref('groupMessages').off('value', pinnedMessagesListener);
        pinnedMessagesListener = null;
    }
    
    if (originalBackToGroups) {
        originalBackToGroups();
    }
};

console.log("Модуль закрепленных сообщений загружен и готов к использованию!");