// group-avatars.js - Система плавающих аватарок для групповых чатов

// Глобальные переменные
let lastSenderId = null;
let messageGroupCount = 0;
let avatarTimeout = null;

// Инициализация системы плавающих аватарок
function initGroupAvatars() {
    console.log("Инициализация системы плавающих аватарок...");
    
    // Добавляем CSS стили
    addGroupAvatarsStyles();
    
    // Перехватываем функцию добавления сообщений в групповой чат
    overrideGroupMessageFunction();
}

// Переопределение функции добавления сообщений в групповой чат
function overrideGroupMessageFunction() {
    if (typeof addGroupMessageToChat === 'function') {
        const originalAddGroupMessageToChat = addGroupMessageToChat;
        
        window.addGroupMessageToChat = function(message) {
            // Вызываем оригинальную функцию
            const result = originalAddGroupMessageToChat.apply(this, arguments);
            
            // Применяем систему плавающих аватарок
            applyFloatingAvatarSystem(message);
            
            return result;
        };
    } else {
        // Если функция еще не загружена, ждем
        setTimeout(overrideGroupMessageFunction, 100);
    }
}

// Применение системы плавающих аватарок к сообщению
function applyFloatingAvatarSystem(message) {
    const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (!messageElement) return;
    
    // Пропускаем системные сообщения и свои сообщения
    if (message.senderId === 'system' || message.senderId === userId) {
        resetAvatarGroup();
        return;
    }
    
    // Пропускаем сообщения-приглашения в группы
    if (message.isGroupInvite) {
        resetAvatarGroup();
        return;
    }
    
    const isSameSender = message.senderId === lastSenderId;
    const isConsecutive = isSameSender && messageGroupCount > 0;
    
    if (isConsecutive) {
        // Последовательное сообщение от того же отправителя
        messageGroupCount++;
        hideAvatarForMessage(messageElement);
        markAsConsecutiveMessage(messageElement);
    } else {
        // Новый отправитель или разрыв в последовательности
        resetAvatarGroup();
        lastSenderId = message.senderId;
        messageGroupCount = 1;
        showAvatarForMessage(messageElement, message);
        markAsFirstInGroup(messageElement);
    }
    
    // Обновляем группировку для предыдущих сообщений
    updateMessageGrouping();
    
    // Сбрасываем таймер группировки
    resetAvatarTimeout();
}

// Сброс группировки аватарок
function resetAvatarGroup() {
    lastSenderId = null;
    messageGroupCount = 0;
}

// Сброс таймера группировки
function resetAvatarTimeout() {
    if (avatarTimeout) {
        clearTimeout(avatarTimeout);
    }
    
    // Сбрасываем группировку через 5 минут неактивности
    avatarTimeout = setTimeout(() => {
        resetAvatarGroup();
    }, 5 * 60 * 1000); // 5 минут
}

// Скрытие аватарки для сообщения
function hideAvatarForMessage(messageElement) {
    const avatar = messageElement.querySelector('.group-message-avatar');
    if (avatar) {
        avatar.style.opacity = '0';
        avatar.style.visibility = 'hidden';
    }
    
    // Убираем отступ для аватарки
    messageElement.style.paddingLeft = '10px';
}

// Показ аватарки для сообщения
function showAvatarForMessage(messageElement, message) {
    let avatar = messageElement.querySelector('.group-message-avatar');
    
    if (!avatar) {
        // Создаем аватарку если ее нет
        avatar = createMessageAvatar(message);
        messageElement.appendChild(avatar);
    }
    
    // Обновляем аватарку
    updateMessageAvatar(avatar, message);
    
    // Показываем аватарку
    avatar.style.opacity = '1';
    avatar.style.visibility = 'visible';
    
    // Добавляем отступ для аватарки
    messageElement.style.paddingLeft = '50px';
}

// Создание аватарки для сообщения
function createMessageAvatar(message) {
    const avatar = document.createElement('div');
    avatar.className = 'group-message-avatar';
    avatar.style.cssText = `
        position: absolute;
        left: 10px;
        bottom: 5px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: linear-gradient(to right, #4facfe, #00f2fe);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
        transition: all 0.2s ease;
        z-index: 5;
        overflow: hidden;
        border: 2px solid var(--header-bg);
    `;
    
    updateMessageAvatar(avatar, message);
    return avatar;
}

// Обновление аватарки сообщения
function updateMessageAvatar(avatar, message) {
    const senderName = message.senderName || 'U';
    const initial = senderName.charAt(0).toUpperCase();
    
    // Очищаем содержимое
    avatar.innerHTML = '';
    
    // Проверяем есть ли аватар у пользователя
    const userAvatar = getUserAvatar(message.senderId);
    if (userAvatar) {
        avatar.innerHTML = `<img src="${userAvatar}" style="width: 100%; height: 100%; object-fit: cover;">`;
        avatar.style.background = 'transparent';
    } else {
        avatar.textContent = initial;
        avatar.style.background = generateAvatarColor(message.senderId);
    }
}

// Получение аватарки пользователя (заглушка - нужно интегрировать с вашей системой)
function getUserAvatar(userId) {
    // Здесь должна быть логика получения аватарки пользователя из вашей системы
    // Пока возвращаем null для использования цветных аватарок
    return null;
}

// Генерация цвета для аватарки на основе ID пользователя
function generateAvatarColor(userId) {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
    ];
    
    // Генерируем индекс на основе ID пользователя
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    
    return colors[index];
}

// Пометка сообщения как первого в группе
function markAsFirstInGroup(messageElement) {
    messageElement.classList.add('first-in-group');
    messageElement.classList.remove('consecutive-message');
    
    // Добавляем скругление сверху
    messageElement.style.borderTopLeftRadius = '15px';
    messageElement.style.borderTopRightRadius = '15px';
    messageElement.style.borderBottomLeftRadius = '4px';
    messageElement.style.borderBottomRightRadius = '15px';
}

// Пометка сообщения как последовательного
function markAsConsecutiveMessage(messageElement) {
    messageElement.classList.add('consecutive-message');
    messageElement.classList.remove('first-in-group');
    
    // Убираем скругление сверху для промежуточных сообщений
    messageElement.style.borderTopLeftRadius = '4px';
    messageElement.style.borderTopRightRadius = '4px';
    messageElement.style.borderBottomLeftRadius = '4px';
    messageElement.style.borderBottomRightRadius = '15px';
}

// Обновление группировки для всех сообщений
function updateMessageGrouping() {
    const messages = document.querySelectorAll('#groupMessagesContainer .message.other-message');
    let currentGroup = [];
    let currentSender = null;
    
    messages.forEach((message, index) => {
        const messageId = message.dataset.messageId;
        // Здесь нужно получить информацию о сообщении из вашей системы
        // Для демонстрации используем атрибуты данных
        
        const senderId = message.dataset.senderId || getSenderIdFromMessage(message);
        
        if (senderId === currentSender) {
            currentGroup.push(message);
        } else {
            // Обрабатываем предыдущую группу
            if (currentGroup.length > 0) {
                processMessageGroup(currentGroup);
            }
            
            // Начинаем новую группу
            currentGroup = [message];
            currentSender = senderId;
        }
        
        // Обрабатываем последнюю группу
        if (index === messages.length - 1 && currentGroup.length > 0) {
            processMessageGroup(currentGroup);
        }
    });
}

// Обработка группы сообщений
function processMessageGroup(messages) {
    if (messages.length === 0) return;
    
    // Первое сообщение в группе
    const firstMessage = messages[0];
    markAsFirstInGroup(firstMessage);
    showAvatarForMessage(firstMessage, getMessageData(firstMessage));
    
    // Промежуточные сообщения
    for (let i = 1; i < messages.length - 1; i++) {
        markAsConsecutiveMessage(messages[i]);
        hideAvatarForMessage(messages[i]);
    }
    
    // Последнее сообщение в группе
    if (messages.length > 1) {
        const lastMessage = messages[messages.length - 1];
        markAsConsecutiveMessage(lastMessage);
        hideAvatarForMessage(lastMessage);
        
        // Для последнего сообщения добавляем нормальное скругление снизу
        lastMessage.style.borderBottomLeftRadius = '4px';
        lastMessage.style.borderBottomRightRadius = '15px';
    }
}

// Получение ID отправителя из элемента сообщения
function getSenderIdFromMessage(messageElement) {
    // Пытаемся получить из data-атрибута
    if (messageElement.dataset.senderId) {
        return messageElement.dataset.senderId;
    }
    
    // Пытаемся получить из текста сообщения
    const senderElement = messageElement.querySelector('.sender');
    if (senderElement) {
        // Здесь должна быть логика сопоставления имени с ID
        // Для демонстрации возвращаем хэш имени
        const senderName = senderElement.textContent.trim();
        return 'user_' + hashCode(senderName);
    }
    
    return null;
}

// Получение данных сообщения
function getMessageData(messageElement) {
    // Здесь должна быть логика получения данных сообщения из вашей системы
    // Для демонстрации создаем объект с базовой информацией
    return {
        senderId: getSenderIdFromMessage(messageElement),
        senderName: messageElement.querySelector('.sender')?.textContent.trim() || 'User'
    };
}

// Хэш-функция для генерации ID из строки
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// Добавление CSS стилей для системы аватарок
function addGroupAvatarsStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        /* Стили для групповых сообщений с аватарками */
        #groupMessagesContainer .message.other-message {
            position: relative;
            padding-left: 50px;
            transition: all 0.2s ease;
            margin-bottom: 2px;
        }
        
        #groupMessagesContainer .message.other-message.first-in-group {
            margin-top: 8px;
        }
        
        #groupMessagesContainer .message.other-message.consecutive-message {
            margin-top: 1px;
        }
        
        .group-message-avatar {
            position: absolute;
            left: 10px;
            bottom: 5px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(to right, #4facfe, #00f2fe);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: white;
            transition: all 0.2s ease;
            z-index: 5;
            overflow: hidden;
            border: 2px solid var(--header-bg);
            opacity: 1;
            visibility: visible;
        }
        
        .group-message-avatar.hidden {
            opacity: 0;
            visibility: hidden;
        }
        
        /* Анимация появления аватарки */
        @keyframes avatarAppear {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        .group-message-avatar:not(.hidden) {
            animation: avatarAppear 0.2s ease;
        }
        
        /* Стили для имени отправителя */
        #groupMessagesContainer .message.other-message .sender {
            font-size: 12px;
            margin-bottom: 2px;
            color: #4facfe;
            font-weight: 500;
            display: none; /* Скрываем имя для последовательных сообщений */
        }
        
        #groupMessagesContainer .message.other-message.first-in-group .sender {
            display: block; /* Показываем имя только для первого сообщения в группе */
        }
        
        /* Улучшенные стили для группировки сообщений */
        #groupMessagesContainer .message.other-message.first-in-group {
            border-top-left-radius: 15px !important;
            border-top-right-radius: 15px !important;
            border-bottom-left-radius: 4px !important;
            border-bottom-right-radius: 15px !important;
        }
        
        #groupMessagesContainer .message.other-message.consecutive-message {
            border-radius: 4px 15px 15px 4px !important;
        }
        
        #groupMessagesContainer .message.other-message:last-of-type.consecutive-message {
            border-bottom-left-radius: 4px !important;
            border-bottom-right-radius: 15px !important;
        }
        
        /* Эффект при наведении на группу сообщений */
        #groupMessagesContainer .message.other-message:hover {
            background: rgba(255, 255, 255, 0.08) !important;
        }
        
        #groupMessagesContainer .message.other-message:hover .group-message-avatar {
            transform: scale(1.1);
            border-color: rgba(79, 172, 254, 0.5);
        }
        
        /* Адаптивность для мобильных устройств */
        @media (max-width: 768px) {
            #groupMessagesContainer .message.other-message {
                padding-left: 45px;
            }
            
            .group-message-avatar {
                width: 22px;
                height: 22px;
                left: 8px;
                bottom: 4px;
                font-size: 9px;
            }
            
            #groupMessagesContainer .message.other-message.first-in-group {
                margin-top: 6px;
            }
        }
        
        @media (max-width: 480px) {
            #groupMessagesContainer .message.other-message {
                padding-left: 40px;
                margin-bottom: 1px;
            }
            
            .group-message-avatar {
                width: 20px;
                height: 20px;
                left: 6px;
                bottom: 3px;
                font-size: 8px;
                border-width: 1px;
            }
            
            #groupMessagesContainer .message.other-message .sender {
                font-size: 11px;
            }
        }
        
        /* Стили для темной темы */
        .light-theme #groupMessagesContainer .message.other-message:hover {
            background: rgba(0, 0, 0, 0.03) !important;
        }
        
        .light-theme .group-message-avatar {
            border-color: #ffffff;
        }
        
        /* Плавные переходы */
        #groupMessagesContainer .message.other-message,
        .group-message-avatar {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
    `;
    document.head.appendChild(styleSheet);
}

// Функция для принудительного обновления всех сообщений
function refreshAllGroupAvatars() {
    const messages = document.querySelectorAll('#groupMessagesContainer .message.other-message');
    messages.forEach(message => {
        const senderId = getSenderIdFromMessage(message);
        if (senderId) {
            const messageData = getMessageData(message);
            applyFloatingAvatarSystem({
                id: message.dataset.messageId,
                senderId: senderId,
                senderName: messageData.senderName
            });
        }
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Ждем загрузки системы групп
    const checkInit = setInterval(() => {
        if (typeof addGroupMessageToChat !== 'undefined') {
            clearInterval(checkInit);
            setTimeout(initGroupAvatars, 500);
        }
    }, 100);
});

// Экспорт функций для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initGroupAvatars,
        refreshAllGroupAvatars,
        applyFloatingAvatarSystem
    };
}