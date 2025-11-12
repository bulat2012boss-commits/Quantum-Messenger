/**
 * Quantum Messenger - Система ускорения загрузки чатов
 * Версия 1.0
 */

class ChatPerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.batchSize = 20;
        this.debounceTimers = new Map();
        this.intersectionObserver = null;
        this.visibleMessages = new Set();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupMessageCaching();
        this.optimizeDatabaseQueries();
        console.log('Chat Performance Optimizer activated');
    }

    // 1. Ленивая загрузка сообщений
    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const messageId = entry.target.dataset.messageId;
                if (entry.isIntersecting) {
                    this.visibleMessages.add(messageId);
                    this.loadMessageContent(entry.target);
                } else {
                    this.visibleMessages.delete(messageId);
                    this.unloadMessageContent(entry.target);
                }
            });
        }, {
            root: document.querySelector('.messages-wrapper'),
            rootMargin: '100px',
            threshold: 0.1
        });
    }

    // 2. Кэширование сообщений
    setupMessageCaching() {
        // Кэшируем последние 100 сообщений
        this.messageCache = new Map();
        this.maxCacheSize = 100;
    }

    // 3. Оптимизация запросов к базе данных
    optimizeDatabaseQueries() {
        // Переопределяем методы загрузки для использования батчинга
        this.originalLoadMessages = window.loadMessages;
        window.loadMessages = this.optimizedLoadMessages.bind(this);
        
        this.originalLoadChatsList = window.loadChatsList;
        window.loadChatsList = this.optimizedLoadChatsList.bind(this);
    }

    // Оптимизированная загрузка сообщений
    async optimizedLoadMessages(chatId) {
        if (this.cache.has(`messages_${chatId}`)) {
            return this.getCachedMessages(chatId);
        }

        // Используем батчинг для загрузки сообщений
        const messages = await this.loadMessagesInBatches(chatId);
        this.cache.set(`messages_${chatId}`, {
            data: messages,
            timestamp: Date.now()
        });
        
        return messages;
    }

    // Загрузка сообщений батчами
    async loadMessagesInBatches(chatId) {
        const messagesRef = database.ref('messages');
        let allMessages = [];
        let lastKey = null;
        let hasMore = true;

        while (hasMore && allMessages.length < 100) { // Ограничиваем начальную загрузку
            const query = lastKey ? 
                messagesRef.orderByChild('chatId')
                    .equalTo(chatId)
                    .startAt(lastKey)
                    .limitToFirst(this.batchSize) :
                messagesRef.orderByChild('chatId')
                    .equalTo(chatId)
                    .limitToFirst(this.batchSize);

            const snapshot = await query.once('value');
            
            if (!snapshot.exists()) {
                hasMore = false;
                break;
            }

            const batchMessages = [];
            snapshot.forEach(childSnapshot => {
                const message = childSnapshot.val();
                batchMessages.push(message);
                lastKey = childSnapshot.key;
            });

            allMessages = [...allMessages, ...batchMessages];
            
            if (batchMessages.length < this.batchSize) {
                hasMore = false;
            }
        }

        return allMessages.sort((a, b) => b.timestamp - a.timestamp);
    }

    // Оптимизированная загрузка списка чатов
    async optimizedLoadChatsList() {
        if (this.cache.has('chats_list')) {
            const cached = this.cache.get('chats_list');
            if (Date.now() - cached.timestamp < 30000) { // Кэш на 30 секунд
                return cached.data;
            }
        }

        const chats = await this.loadChatsWithOptimization();
        this.cache.set('chats_list', {
            data: chats,
            timestamp: Date.now()
        });

        return chats;
    }

    async loadChatsWithOptimization() {
        return new Promise((resolve) => {
            const chatsRef = database.ref('chats');
            
            // Загружаем только необходимые поля
            chatsRef.orderByChild('lastMessageTime')
                .limitToLast(50) // Ограничиваем количество
                .once('value')
                .then(snapshot => {
                    const chats = [];
                    snapshot.forEach(childSnapshot => {
                        const chat = childSnapshot.val();
                        // Фильтруем только чаты пользователя
                        if (chat.participants && chat.participants[window.userId]) {
                            chats.push({
                                id: childSnapshot.key,
                                lastMessage: chat.lastMessage,
                                lastMessageTime: chat.lastMessageTime,
                                participants: chat.participants
                            });
                        }
                    });
                    resolve(chats);
                });
        });
    }

    // 4. Предзагрузка следующих сообщений
    preloadNextMessages(chatId, currentMessageCount) {
        if (this.debounceTimers.has('preload')) {
            clearTimeout(this.debounceTimers.get('preload'));
        }

        this.debounceTimers.set('preload', setTimeout(() => {
            this.loadNextMessageBatch(chatId, currentMessageCount);
        }, 500));
    }

    async loadNextMessageBatch(chatId, offset) {
        // Загружаем следующую партию сообщений
        const messagesRef = database.ref('messages');
        const query = messagesRef.orderByChild('chatId')
            .equalTo(chatId)
            .limitToLast(this.batchSize)
            .startAt(offset);

        const snapshot = await query.once('value');
        if (snapshot.exists()) {
            const newMessages = [];
            snapshot.forEach(childSnapshot => {
                newMessages.push(childSnapshot.val());
            });
            
            this.addMessagesToCache(chatId, newMessages);
        }
    }

    // 5. Управление кэшем
    getCachedMessages(chatId) {
        const cached = this.cache.get(`messages_${chatId}`);
        if (cached && Date.now() - cached.timestamp < 60000) { // Кэш на 1 минуту
            return Promise.resolve(cached.data);
        }
        this.cache.delete(`messages_${chatId}`);
        return null;
    }

    addMessagesToCache(chatId, messages) {
        const existing = this.cache.get(`messages_${chatId}`) || { data: [] };
        const mergedMessages = [...existing.data, ...messages]
            .filter((msg, index, self) => 
                index === self.findIndex(m => m.id === msg.id)
            )
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 100); // Держим только 100 последних сообщений

        this.cache.set(`messages_${chatId}`, {
            data: mergedMessages,
            timestamp: Date.now()
        });
    }

    // 6. Ленивая загрузка контента сообщений
    loadMessageContent(messageElement) {
        const lazyImages = messageElement.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });

        const lazyVideos = messageElement.querySelectorAll('video[data-src]');
        lazyVideos.forEach(video => {
            video.src = video.dataset.src;
            video.removeAttribute('data-src');
        });
    }

    unloadMessageContent(messageElement) {
        // При необходимости выгружаем тяжелый контент
        if (!this.isElementInViewport(messageElement)) {
            const videos = messageElement.querySelectorAll('video');
            videos.forEach(video => {
                if (!video.paused) {
                    video.pause();
                }
            });
        }
    }

    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // 7. Оптимизация рендеринга
    optimizeMessageRendering(messages) {
        const fragment = document.createDocumentFragment();
        
        messages.forEach(message => {
            const messageElement = this.createOptimizedMessageElement(message);
            fragment.appendChild(messageElement);
        });

        return fragment;
    }

    createOptimizedMessageElement(message) {
        const div = document.createElement('div');
        div.className = `message ${message.senderId === window.userId ? 'my-message' : 'other-message'}`;
        div.dataset.messageId = message.id;

        // Используем простой HTML для быстрого рендеринга
        div.innerHTML = `
            ${message.senderId !== window.userId ? 
                `<div class="sender">${this.escapeHtml(message.senderName)}</div>` : ''}
            <div>${this.escapeHtml(message.text)}</div>
            <div class="timestamp">${this.formatTime(message.timestamp)}</div>
        `;

        // Откладываем наблюдение для нового элемента
        requestAnimationFrame(() => {
            this.intersectionObserver.observe(div);
        });

        return div;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // 8. Очистка кэша
    clearCache() {
        this.cache.clear();
        this.messageCache.clear();
        console.log('Chat cache cleared');
    }

    // 9. Статистика производительности
    getPerformanceStats() {
        return {
            cacheSize: this.cache.size,
            messageCacheSize: this.messageCache.size,
            visibleMessages: this.visibleMessages.size
        };
    }
}

// Инициализация оптимизатора
let chatOptimizer = null;

function initChatPerformanceOptimizer() {
    if (!chatOptimizer) {
        chatOptimizer = new ChatPerformanceOptimizer();
    }
    return chatOptimizer;
}

// Переопределение стандартных функций для использования оптимизаций
function setupPerformanceOptimizations() {
    // Оптимизированная загрузка чатов
    const originalOpenChat = window.openChat;
    window.openChat = async function(userId, userName, chatId = null) {
        if (chatOptimizer) {
            // Предзагружаем данные чата
            await chatOptimizer.optimizedLoadMessages(chatId || chatOptimizer.generateChatId(userId));
        }
        return originalOpenChat.call(this, userId, userName, chatId);
    };

    // Оптимизированный рендеринг сообщений
    const originalAddMessageToChat = window.addMessageToChat;
    window.addMessageToChat = function(message) {
        if (chatOptimizer && document.querySelector('.messages-wrapper')) {
            const messageElement = chatOptimizer.createOptimizedMessageElement(message);
            document.querySelector('.messages-wrapper').appendChild(messageElement);
            
            // Добавляем в кэш
            chatOptimizer.addMessagesToCache(message.chatId, [message]);
        } else {
            originalAddMessageToChat.call(this, message);
        }
    };

    // Оптимизированная загрузка списка чатов
    const originalLoadChatsList = window.loadChatsList;
    window.loadChatsList = async function() {
        if (chatOptimizer) {
            return chatOptimizer.optimizedLoadChatsList();
        }
        return originalLoadChatsList.call(this);
    };
}

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initChatPerformanceOptimizer();
        setupPerformanceOptimizations();
        console.log('Chat performance optimizations loaded');
    }, 1000);
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChatPerformanceOptimizer, initChatPerformanceOptimizer };
}