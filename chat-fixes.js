// message-reactions.js
// Полностью самодостаточный функционал реакций на сообщения

(function() {
    'use strict';
    
    // Переменные для хранения состояния реакций
    let messageReactions = {};
    let currentUserReactions = {};
    let currentUserId = '';
    let currentUserName = '';
    let currentChatId = '';
    
    // Доступные реакции (эмодзи)
    const availableReactions = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏', '🔥', '⭐'];
    
    // Инициализация функционала реакций
    function initMessageReactions() {
        console.log("🔄 Инициализация функционала реакций на сообщения");
        
        // Ждем загрузки Firebase и других компонентов
        const initInterval = setInterval(() => {
            if (window.userId && window.database) {
                clearInterval(initInterval);
                setupReactions();
            }
        }, 100);
    }
    
    // Основная настройка реакций
    function setupReactions() {
        currentUserId = window.userId;
        currentUserName = window.currentUser;
        
        // Загружаем сохраненные реакции
        loadMessageReactions();
        
        // Добавляем обработчики для отображения реакций
        addReactionHandlers();
        
        // Перехватываем функции для добавления ID сообщений
        patchMessageFunctions();
        
        console.log("✅ Функционал реакций инициализирован");
    }
    
    // Загрузка реакций из базы данных
    function loadMessageReactions() {
        if (!currentUserId) return;
        
        // Загружаем реакции для текущего пользователя
        window.database.ref('messageReactions').orderByChild('userId').equalTo(currentUserId).on('value', (snapshot) => {
            if (snapshot.exists()) {
                currentUserReactions = {};
                snapshot.forEach((childSnapshot) => {
                    const reaction = childSnapshot.val();
                    currentUserReactions[reaction.messageId] = reaction;
                });
                updateReactionsDisplay();
            }
        });
        
        // Загружаем все реакции для текущего чата
        if (currentChatId) {
            window.database.ref('messageReactions').orderByChild('chatId').equalTo(currentChatId).on('value', (snapshot) => {
                if (snapshot.exists()) {
                    messageReactions = {};
                    snapshot.forEach((childSnapshot) => {
                        const reaction = childSnapshot.val();
                        if (!messageReactions[reaction.messageId]) {
                            messageReactions[reaction.messageId] = [];
                        }
                        messageReactions[reaction.messageId].push(reaction);
                    });
                    updateReactionsDisplay();
                }
            });
        }
    }
    
    // Добавление обработчиков для отображения реакций
    function addReactionHandlers() {
        // Используем делегирование событий для обработки кликов на сообщениях
        document.addEventListener('click', handleReactionClick);
        
        // Добавляем обработчик долгого нажатия для показа реакций
        setupLongPressHandler();
        
        // Следим за изменениями в DOM для новых сообщений
        setupDOMObserver();
    }
    
    // Обработчик кликов для реакций
    function handleReactionClick(e) {
        // Обработка клика на существующую реакцию
        if (e.target.classList.contains('message-reaction') || 
            e.target.parentElement.classList.contains('message-reaction')) {
            const reactionElement = e.target.classList.contains('message-reaction') ? 
                e.target : e.target.parentElement;
            const messageElement = reactionElement.closest('.message');
            if (messageElement && messageElement.dataset.messageId) {
                showReactionPicker(messageElement.dataset.messageId, reactionElement);
            }
        }
    }
    
    // Настройка обработчика долгого нажатия
    function setupLongPressHandler() {
        let longPressTimer;
        let longPressTarget;
        
        document.addEventListener('mousedown', (e) => {
            const messageElement = e.target.closest('.message');
            if (messageElement && !e.target.classList.contains('message-reaction') && 
                messageElement.dataset.messageId) {
                longPressTarget = messageElement;
                longPressTimer = setTimeout(() => {
                    showReactionPicker(messageElement.dataset.messageId, messageElement);
                }, 500);
            }
        });
        
        document.addEventListener('mouseup', () => {
            clearTimeout(longPressTimer);
        });
        
        document.addEventListener('touchstart', (e) => {
            const messageElement = e.target.closest('.message');
            if (messageElement && !e.target.classList.contains('message-reaction') && 
                messageElement.dataset.messageId) {
                longPressTarget = messageElement;
                longPressTimer = setTimeout(() => {
                    showReactionPicker(messageElement.dataset.messageId, messageElement);
                }, 500);
            }
        });
        
        document.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });
    }
    
    // Наблюдатель за изменениями DOM
    function setupDOMObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.classList && node.classList.contains('message')) {
                            // Новое сообщение добавлено, обновляем отображение реакций
                            setTimeout(updateReactionsDisplay, 100);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Показ панели выбора реакций
    function showReactionPicker(messageId, targetElement) {
        // Удаляем существующий пикер, если есть
        closeReactionPicker();
        
        // Создаем элемент пикера реакций
        const reactionPicker = document.createElement('div');
        reactionPicker.id = 'reactionPicker';
        reactionPicker.className = 'reaction-picker';
        reactionPicker.dataset.messageId = messageId;
        
        // Добавляем стили
        addReactionPickerStyles();
        
        // Добавляем кнопки реакций
        availableReactions.forEach(reaction => {
            const reactionBtn = document.createElement('button');
            reactionBtn.className = 'reaction-option';
            reactionBtn.textContent = reaction;
            reactionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addReactionToMessage(messageId, reaction);
            });
            reactionPicker.appendChild(reactionBtn);
        });
        
        // Добавляем кнопку удаления реакции, если она есть
        if (currentUserReactions[messageId]) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'reaction-option remove-reaction';
            removeBtn.innerHTML = '✕';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeReactionFromMessage(messageId);
            });
            reactionPicker.appendChild(removeBtn);
        }
        
        // Позиционируем пикер рядом с целевым элементом
        const rect = targetElement.getBoundingClientRect();
        reactionPicker.style.position = 'fixed';
        reactionPicker.style.left = `${rect.left}px`;
        reactionPicker.style.top = `${rect.top - 50}px`;
        reactionPicker.style.zIndex = '10000';
        
        // Добавляем пикер в DOM
        document.body.appendChild(reactionPicker);
        
        // Закрытие пикера при клике вне его
        setTimeout(() => {
            document.addEventListener('click', closeReactionPicker);
        }, 10);
    }
    
    // Закрытие панели выбора реакций
    function closeReactionPicker() {
        const reactionPicker = document.getElementById('reactionPicker');
        if (reactionPicker) {
            reactionPicker.remove();
            document.removeEventListener('click', closeReactionPicker);
        }
    }
    
    // Добавление реакции к сообщению
    function addReactionToMessage(messageId, reaction) {
        if (!currentUserId || !messageId || !currentChatId) return;
        
        // Создаем ID для реакции
        const reactionId = `reaction_${currentUserId}_${messageId}`;
        
        // Данные реакции
        const reactionData = {
            id: reactionId,
            messageId: messageId,
            chatId: currentChatId,
            userId: currentUserId,
            userName: currentUserName,
            reaction: reaction,
            timestamp: Date.now()
        };
        
        // Сохраняем реакцию в базе данных
        window.database.ref(`messageReactions/${reactionId}`).set(reactionData)
            .then(() => {
                console.log(`✅ Реакция ${reaction} добавлена к сообщению ${messageId}`);
                closeReactionPicker();
                showTemporaryNotification(`Реакция ${reaction} добавлена`);
            })
            .catch((error) => {
                console.error("❌ Ошибка при добавлении реакции:", error);
            });
    }
    
    // Удаление реакции с сообщения
    function removeReactionFromMessage(messageId) {
        if (!currentUserId || !messageId) return;
        
        const reactionId = `reaction_${currentUserId}_${messageId}`;
        
        // Удаляем реакцию из базы данных
        window.database.ref(`messageReactions/${reactionId}`).remove()
            .then(() => {
                console.log(`✅ Реакция удалена с сообщения ${messageId}`);
                closeReactionPicker();
                showTemporaryNotification("Реакция удалена");
            })
            .catch((error) => {
                console.error("❌ Ошибка при удалении реакции:", error);
            });
    }
    
    // Обновление отображения реакций
    function updateReactionsDisplay() {
        // Находим все сообщения в текущем чате
        const messages = document.querySelectorAll('.message');
        
        messages.forEach(message => {
            const messageId = message.dataset.messageId;
            if (!messageId) return;
            
            // Удаляем существующие реакции
            const existingReactions = message.querySelector('.message-reactions');
            if (existingReactions) {
                existingReactions.remove();
            }
            
            // Добавляем реакции, если они есть для этого сообщения
            const reactions = messageReactions[messageId];
            if (reactions && reactions.length > 0) {
                addReactionsToMessageElement(message, reactions);
            }
        });
    }
    
    // Добавление реакций к элементу сообщения
    function addReactionsToMessageElement(messageElement, reactions) {
        // Группируем реакции по типу
        const reactionCounts = {};
        reactions.forEach(reaction => {
            if (!reactionCounts[reaction.reaction]) {
                reactionCounts[reaction.reaction] = {
                    count: 0,
                    users: []
                };
            }
            reactionCounts[reaction.reaction].count++;
            reactionCounts[reaction.reaction].users.push(reaction.userName);
        });
        
        // Создаем контейнер для реакций
        const reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'message-reactions';
        
        // Добавляем каждую реакцию с счетчиком
        Object.keys(reactionCounts).forEach(reaction => {
            const reactionElement = document.createElement('span');
            reactionElement.className = 'message-reaction';
            
            // Подсвечиваем, если это реакция текущего пользователя
            const userReaction = currentUserReactions[messageElement.dataset.messageId];
            if (userReaction && userReaction.reaction === reaction) {
                reactionElement.classList.add('user-reaction');
            }
            
            reactionElement.innerHTML = `
                <span class="reaction-emoji">${reaction}</span>
                <span class="reaction-count">${reactionCounts[reaction].count}</span>
            `;
            
            // Добавляем подсказку с именами пользователей
            reactionElement.title = reactionCounts[reaction].users.join(', ');
            
            reactionsContainer.appendChild(reactionElement);
        });
        
        // Добавляем контейнер с реакциями к сообщению
        messageElement.appendChild(reactionsContainer);
    }
    
    // Перехват функций для добавления ID сообщений
    function patchMessageFunctions() {
        // Перехватываем функцию открытия чата для обновления currentChatId
        const originalOpenChat = window.openChat;
        if (originalOpenChat) {
            window.openChat = function(userId, userName, chatId = null) {
                currentChatId = chatId || window.generateChatId(userId);
                const result = originalOpenChat.apply(this, arguments);
                
                // Перезагружаем реакции для нового чата
                setTimeout(() => {
                    loadMessageReactions();
                }, 1000);
                
                return result;
            };
        }
        
        // Перехватываем функцию добавления сообщения в чат
        const originalAddMessageToChat = window.addMessageToChat;
        if (originalAddMessageToChat) {
            window.addMessageToChat = function(message) {
                const result = originalAddMessageToChat.apply(this, arguments);
                
                // Находим последнее добавленное сообщение и добавляем data-атрибут
                const messages = document.querySelectorAll('.message');
                const lastMessage = messages[messages.length - 1];
                if (lastMessage && message.id) {
                    lastMessage.dataset.messageId = message.id;
                    
                    // Добавляем реакции, если они есть
                    if (messageReactions[message.id]) {
                        addReactionsToMessageElement(lastMessage, messageReactions[message.id]);
                    }
                }
                
                return result;
            };
        }
    }
    
    // Добавление стилей для реакций
    function addReactionPickerStyles() {
        if (document.getElementById('reaction-styles')) return;
        
        const styles = `
            <style id="reaction-styles">
                .message-reactions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    margin-top: 5px;
                    align-items: center;
                }
                
                .message-reaction {
                    display: inline-flex;
                    align-items: center;
                    gap: 2px;
                    padding: 2px 6px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                }
                
                .message-reaction:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.05);
                }
                
                .message-reaction.user-reaction {
                    background: rgba(79, 172, 254, 0.3);
                    border-color: rgba(79, 172, 254, 0.5);
                }
                
                .reaction-emoji {
                    font-size: 12px;
                }
                
                .reaction-count {
                    font-size: 10px;
                    font-weight: 600;
                }
                
                .reaction-picker {
                    display: flex;
                    gap: 5px;
                    padding: 8px;
                    background: var(--header-bg, rgba(0, 0, 0, 0.8));
                    border-radius: 24px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                    backdrop-filter: blur(10px);
                    animation: reactionPickerAppear 0.2s ease;
                }
                
                @keyframes reactionPickerAppear {
                    from {
                        opacity: 0;
                        transform: scale(0.8) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                .reaction-option {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    border-radius: 50%;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: inherit;
                }
                
                .reaction-option:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.2);
                }
                
                .reaction-option.remove-reaction {
                    color: #ff6b6b;
                    font-size: 14px;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    // Вспомогательная функция для показа уведомлений
    function showTemporaryNotification(message) {
        // Используем существующую функцию showNotification если есть
        if (window.showNotification) {
            window.showNotification(message);
        } else {
            // Создаем простое уведомление
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 2000);
        }
    }
    
    // Запуск инициализации при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMessageReactions);
    } else {
        initMessageReactions();
    }
    
    // Экспортируем функции для внешнего использования
    window.messageReactions = {
        init: initMessageReactions,
        addReaction: addReactionToMessage,
        removeReaction: removeReactionFromMessage,
        updateDisplay: updateReactionsDisplay
    };
    
})();