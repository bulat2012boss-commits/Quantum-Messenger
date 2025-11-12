/**
 * Quantum Messenger - Mobile Turbo
 * Оптимизация для мобильных устройств
 */

class MobileTurbo {
    constructor() {
        this.isMobile = this.detectMobile();
        this.cache = new Map();
        this.init();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    init() {
        if (!this.isMobile) return;
        
        console.log('📱 Mobile Turbo activated');
        this.optimizeForMobile();
        this.setupMobileSpecificOptimizations();
    }

    // 1. ОПТИМИЗАЦИИ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ
    optimizeForMobile() {
        // Уменьшаем количество одновременно загружаемых сообщений
        this.MESSAGE_LIMIT = 30;
        this.CHAT_LIMIT = 20;
        
        // Более агрессивное кэширование
        this.setupMobileCaching();
        
        // Оптимизация анимаций
        this.reduceAnimations();
        
        // Предотвращение блокировки UI
        this.preventUIBlocking();
    }

    // 2. МОБИЛЬНОЕ КЭШИРОВАНИЕ
    setupMobileCaching() {
        // Используем более маленький кэш для мобильных
        this.MAX_CACHE_SIZE = 50;
        
        // Восстанавливаем кэш при запуске
        this.restoreMobileCache();
        
        // Автосохранение кэша
        setInterval(() => this.saveMobileCache(), 15000);
    }

    restoreMobileCache() {
        try {
            const cached = localStorage.getItem('quantum_mobile_cache');
            if (cached) {
                const data = JSON.parse(cached);
                this.cache = new Map(Object.entries(data));
                console.log('📱 Мобильный кэш восстановлен');
            }
        } catch (e) {
            console.log('📱 Новый мобильный кэш создан');
        }
    }

    saveMobileCache() {
        try {
            // Ограничиваем размер кэша
            if (this.cache.size > this.MAX_CACHE_SIZE) {
                const entries = Array.from(this.cache.entries());
                entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
                this.cache = new Map(entries.slice(0, this.MAX_CACHE_SIZE));
            }
            
            localStorage.setItem('quantum_mobile_cache', 
                JSON.stringify(Object.fromEntries(this.cache)));
        } catch (e) {
            // Игнорируем ошибки - кэш не критичен
        }
    }

    // 3. ПРЕДОТВРАЩЕНИЕ БЛОКИРОВКИ UI
    preventUIBlocking() {
        // Разбиваем тяжелые операции на части
        this.chunkProcessor = new ChunkProcessor();
        
        // Используем requestIdleCallback для фоновых задач
        this.setupBackgroundProcessing();
    }

    setupBackgroundProcessing() {
        // Фоновая предзагрузка при простое
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.preloadCriticalData();
            });
        }
    }

    // 4. ОПТИМИЗИРОВАННАЯ ЗАГРУЗКА ЧАТОВ ДЛЯ МОБИЛЬНЫХ
    async loadChatsMobile() {
        const startTime = performance.now();
        
        // Показываем скелетон сразу
        this.showSkeletonLoader();
        
        try {
            // Загружаем только базовую информацию о чатах
            const chats = await this.loadChatsBasic();
            
            // Быстро рендерим список
            this.renderChatsFast(chats);
            
            console.log(`📱 Чаты загружены за ${performance.now() - startTime}ms`);
            
            // Фоновая загрузка деталей
            this.loadChatDetailsBackground(chats);
            
        } catch (error) {
            console.error('Ошибка загрузки чатов:', error);
            this.showErrorState();
        }
    }

    async loadChatsBasic() {
        // Используем кэш если есть
        if (this.cache.has('chats_basic')) {
            const cached = this.cache.get('chats_basic');
            if (Date.now() - cached.timestamp < 30000) {
                return cached.data;
            }
        }

        // Загружаем только необходимые поля
        const snapshot = await database.ref('chats')
            .orderByChild('lastMessageTime')
            .limitToLast(this.CHAT_LIMIT)
            .once('value');

        const chats = [];
        if (snapshot.exists()) {
            snapshot.forEach(snap => {
                const chat = snap.val();
                if (chat.participants && chat.participants[window.userId]) {
                    chats.push({
                        id: snap.key,
                        lastMessage: chat.lastMessage,
                        lastMessageTime: chat.lastMessageTime,
                        participantIds: Object.keys(chat.participants)
                    });
                }
            });
        }

        // Кэшируем
        this.cache.set('chats_basic', {
            data: chats,
            timestamp: Date.now()
        });

        return chats;
    }

    // 5. БЫСТРЫЙ РЕНДЕРИНГ
    renderChatsFast(chats) {
        const fragment = document.createDocumentFragment();
        
        chats.forEach(chat => {
            const chatEl = this.createChatElementFast(chat);
            fragment.appendChild(chatEl);
        });
        
        // Одной операцией добавляем в DOM
        const container = document.getElementById('chatsList');
        container.innerHTML = '';
        container.appendChild(fragment);
    }

    createChatElementFast(chat) {
        const div = document.createElement('div');
        div.className = 'chat-item';
        div.dataset.chatId = chat.id;
        
        // Минимальный HTML для быстрого рендеринга
        div.innerHTML = `
            <div class="chat-item-avatar" style="background: #4facfe">
                <div class="skeleton-avatar"></div>
            </div>
            <div class="chat-item-info">
                <div class="chat-item-header">
                    <div class="chat-item-name skeleton-text"></div>
                    <div class="chat-item-time">${this.formatTime(chat.lastMessageTime)}</div>
                </div>
                <div class="chat-item-last-message">${this.escapeHtml(chat.lastMessage || 'Нет сообщений')}</div>
            </div>
        `;
        
        // Загружаем аватар и имя фоново
        this.loadChatDetailsLazy(chat.id, div);
        
        return div;
    }

    // 6. ЛЕНИВАЯ ЗАГРУЗКА ДЕТАЛЕЙ
    async loadChatDetailsLazy(chatId, element) {
        // Используем Intersection Observer для ленивой загрузки
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadChatDetails(chatId, element);
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '50px' });
        
        observer.observe(element);
    }

    async loadChatDetails(chatId, element) {
        try {
            // Загружаем информацию о собеседнике
            const chat = await this.getChatDetails(chatId);
            if (!chat) return;
            
            // Находим собеседника
            const otherUserId = Object.keys(chat.participants).find(id => id !== window.userId);
            if (!otherUserId) return;
            
            // Загружаем профиль
            const profile = await this.getUserProfile(otherUserId);
            if (!profile) return;
            
            // Обновляем UI
            this.updateChatElement(element, profile, chat);
            
        } catch (error) {
            console.error('Ошибка загрузки деталей чата:', error);
        }
    }

    async getChatDetails(chatId) {
        if (this.cache.has(`chat_${chatId}`)) {
            return this.cache.get(`chat_${chatId}`).data;
        }
        
        const snapshot = await database.ref(`chats/${chatId}`).once('value');
        const chat = snapshot.val();
        
        if (chat) {
            this.cache.set(`chat_${chatId}`, {
                data: chat,
                timestamp: Date.now()
            });
        }
        
        return chat;
    }

    async getUserProfile(userId) {
        if (this.cache.has(`profile_${userId}`)) {
            return this.cache.get(`profile_${userId}`).data;
        }
        
        const snapshot = await database.ref(`profiles/${userId}`).once('value');
        const profile = snapshot.val();
        
        if (profile) {
            this.cache.set(`profile_${userId}`, {
                data: profile,
                timestamp: Date.now()
            });
        }
        
        return profile;
    }

    updateChatElement(element, profile, chat) {
        const avatar = element.querySelector('.chat-item-avatar');
        const name = element.querySelector('.chat-item-name');
        
        // Убираем скелетон
        avatar.innerHTML = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';
        name.textContent = profile.username || profile.name || 'Пользователь';
        name.classList.remove('skeleton-text');
    }

    // 7. ОПТИМИЗИРОВАННАЯ ЗАГРУЗКА СООБЩЕНИЙ
    async loadMessagesMobile(chatId) {
        const startTime = performance.now();
        
        // Показываем скелетон сообщений
        this.showMessagesSkeleton();
        
        try {
            // Загружаем сообщения с лимитом
            const messages = await this.loadMessagesBasic(chatId);
            
            // Быстро рендерим
            this.renderMessagesFast(messages);
            
            console.log(`📱 Сообщения загружены за ${performance.now() - startTime}ms`);
            
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        }
    }

    async loadMessagesBasic(chatId) {
        // Проверяем кэш
        if (this.cache.has(`messages_${chatId}`)) {
            const cached = this.cache.get(`messages_${chatId}`);
            if (Date.now() - cached.timestamp < 60000) {
                return cached.data;
            }
        }

        // Загружаем с лимитом
        const snapshot = await database.ref('messages')
            .orderByChild('chatId')
            .equalTo(chatId)
            .limitToLast(this.MESSAGE_LIMIT)
            .once('value');

        const messages = [];
        if (snapshot.exists()) {
            snapshot.forEach(snap => {
                messages.push(snap.val());
            });
        }

        // Сортируем и кэшируем
        messages.sort((a, b) => a.timestamp - b.timestamp);
        this.cache.set(`messages_${chatId}`, {
            data: messages,
            timestamp: Date.now()
        });

        return messages;
    }

    renderMessagesFast(messages) {
        const fragment = document.createDocumentFragment();
        const container = document.getElementById('messagesContainer');
        
        messages.forEach(message => {
            const messageEl = this.createMessageElementFast(message);
            fragment.appendChild(messageEl);
        });
        
        container.innerHTML = '';
        container.appendChild(fragment);
        
        // Прокручиваем вниз
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }

    createMessageElementFast(message) {
        const div = document.createElement('div');
        div.className = `message ${message.senderId === window.userId ? 'my-message' : 'other-message'}`;
        
        const time = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', minute: '2-digit' 
        });
        
        div.innerHTML = `
            ${message.senderId !== window.userId ? 
                `<div class="sender">${this.escapeHtml(message.senderName)}</div>` : ''}
            <div>${this.escapeHtml(message.text)}</div>
            <div class="timestamp">${time}</div>
        `;
        
        return div;
    }

    // 8. УТИЛИТЫ
    showSkeletonLoader() {
        const container = document.getElementById('chatsList');
        container.innerHTML = `
            <div class="chat-item">
                <div class="chat-item-avatar skeleton-avatar"></div>
                <div class="chat-item-info">
                    <div class="skeleton-text" style="width: 70%"></div>
                    <div class="skeleton-text" style="width: 90%"></div>
                </div>
            </div>
            <div class="chat-item">
                <div class="chat-item-avatar skeleton-avatar"></div>
                <div class="chat-item-info">
                    <div class="skeleton-text" style="width: 60%"></div>
                    <div class="skeleton-text" style="width: 80%"></div>
                </div>
            </div>
        `;
    }

    showMessagesSkeleton() {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = `
            <div class="message other-message">
                <div class="skeleton-text" style="width: 80%"></div>
                <div class="skeleton-text" style="width: 40%"></div>
            </div>
            <div class="message my-message">
                <div class="skeleton-text" style="width: 70%"></div>
                <div class="skeleton-text" style="width: 30%"></div>
            </div>
        `;
    }

    reduceAnimations() {
        // Уменьшаем анимации для лучшей производительности
        document.documentElement.style.setProperty('--animation-duration', '0.2s');
    }

    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'только что';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' мин';
        if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Класс для обработки чанков
class ChunkProcessor {
    processInChunks(items, processFn, chunkSize = 5) {
        return new Promise((resolve) => {
            let index = 0;
            const results = [];
            
            const processChunk = () => {
                const chunk = items.slice(index, index + chunkSize);
                chunk.forEach(item => results.push(processFn(item)));
                index += chunkSize;
                
                if (index < items.length) {
                    setTimeout(processChunk, 0);
                } else {
                    resolve(results);
                }
            };
            
            processChunk();
        });
    }
}

// Инициализация
let mobileTurbo = null;

function initMobileTurbo() {
    if (!mobileTurbo) {
        mobileTurbo = new MobileTurbo();
    }
    return mobileTurbo;
}

// Переопределение стандартных функций
function setupMobileOptimizations() {
    const mobileTurbo = initMobileTurbo();
    
    // Переопределяем загрузку чатов
    window.loadChatsList = function() {
        return mobileTurbo.loadChatsMobile();
    };
    
    // Переопределяем загрузку сообщений
    const originalOpenChat = window.openChat;
    window.openChat = function(userId, userName, chatId = null) {
        if (chatId) {
            mobileTurbo.loadMessagesMobile(chatId);
        }
        return originalOpenChat.call(this, userId, userName, chatId);
    };
    
    // Переопределяем поиск
    window.performSearch = function() {
        // Упрощенный поиск для мобильных
        const query = document.getElementById('searchInput').value.trim();
        if (query) {
            mobileTurbo.searchUsersTurbo(query);
        }
    };
}

// Автоматическая инициализация
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            setupMobileOptimizations();
            console.log('📱 Мобильные оптимизации активированы');
        }, 100);
    });
}