// channels-hashtags.js - Система хештегов для Quantum Messenger

let hashtagsListener = null;
let channelHashtags = {};
let activeHashtagFilter = null;
let hashtagsPanel = null;

// Инициализация системы хештегов
function initHashtagsSystem() {
    console.log("🔖 Инициализация системы хештегов...");
    addHashtagsStyles();
    integrateHashtagsWithChannels();
}

// Добавление стилей для хештегов
function addHashtagsStyles() {
    if (document.getElementById('hashtagsStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'hashtagsStyles';
    style.textContent = `
        .hashtag {
            color: #3498db;
            background: rgba(52, 152, 219, 0.1);
            padding: 2px 8px;
            border-radius: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid rgba(52, 152, 219, 0.3);
            font-size: 0.9em;
            margin: 0 2px;
            display: inline-block;
            text-decoration: none;
            user-select: none;
        }
        
        .hashtag:hover {
            background: rgba(52, 152, 219, 0.2);
            transform: translateY(-1px);
            box-shadow: 0 3px 8px rgba(52, 152, 219, 0.3);
        }
        
        .hashtag.active {
            background: #3498db;
            color: white;
            border-color: #3498db;
        }
        
        .hashtags-panel {
            background: var(--header-bg);
            border-bottom: 1px solid var(--border-color);
            padding: 12px 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            min-height: 50px;
            animation: slideDown 0.3s ease;
        }
        
        .hashtags-title {
            font-weight: 600;
            color: var(--text-color);
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .hashtags-list {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            flex: 1;
        }
        
        .hashtag-count {
            font-size: 0.8em;
            opacity: 0.7;
            margin-left: 4px;
        }
        
        .clear-hashtag-filter {
            background: none;
            border: 1px solid var(--border-color);
            color: var(--text-color);
            padding: 4px 12px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s ease;
        }
        
        .clear-hashtag-filter:hover {
            background: var(--hover-color);
        }
        
        .hashtag-filter-active {
            background: rgba(52, 152, 219, 0.05);
            border-left: 3px solid #3498db;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes highlight {
            0% {
                background: rgba(52, 152, 219, 0.3);
            }
            100% {
                background: transparent;
            }
        }
        
        .hashtag-highlight {
            animation: highlight 2s ease;
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .hashtags-panel {
                padding: 8px 10px;
            }
            
            .hashtags-title span {
                display: none;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Интеграция с системой каналов
function integrateHashtagsWithChannels() {
    // Перехватываем функцию открытия канала
    if (window.openChannel) {
        const originalOpenChannel = window.openChannel;
        
        window.openChannel = function(channelId, channelName) {
            originalOpenChannel(channelId, channelName);
            
            // Инициализируем хештеги после открытия канала
            setTimeout(() => {
                loadChannelHashtags(channelId);
                createHashtagsPanel(channelId);
            }, 500);
        };
    }
    
    // Перехватываем функцию отправки сообщения
    if (window.sendChannelMessage) {
        const originalSendMessage = window.sendChannelMessage;
        
        window.sendChannelMessage = function(channelId) {
            const messageInput = document.getElementById('channelMessageInput');
            const text = messageInput ? messageInput.value.trim() : '';
            
            // Извлекаем хештеги перед отправкой
            if (text) {
                extractHashtagsFromText(text, channelId);
            }
            
            originalSendMessage(channelId);
        };
    }
    
    // Перехватываем функцию создания поста
    if (window.createPost) {
        const originalCreatePost = window.createPost;
        
        window.createPost = function(channelId) {
            const postInput = document.getElementById('postContentInput');
            const content = postInput ? postInput.value.trim() : '';
            
            // Извлекаем хештеги из поста
            if (content) {
                extractHashtagsFromText(content, channelId);
            }
            
            originalCreatePost(channelId);
        };
    }
    
    // Перехватываем возврат к списку каналов
    if (window.backToChannelsList) {
        const originalBackToChannels = window.backToChannelsList;
        
        window.backToChannelsList = function() {
            // Очищаем хештеги при выходе из канала
            cleanupHashtagsSystem();
            originalBackToChannels();
        };
    }
}

// Загрузка хештегов канала
function loadChannelHashtags(channelId) {
    if (!channelId) return;
    
    // Удаляем предыдущий слушатель
    if (hashtagsListener) {
        database.ref('channelHashtags').off('value', hashtagsListener);
    }
    
    // Слушаем хештеги канала
    hashtagsListener = database.ref('channelHashtags').orderByChild('channelId').equalTo(channelId).on('value', (snapshot) => {
        channelHashtags = {};
        
        if (snapshot.exists()) {
            const hashtagsData = snapshot.val();
            
            Object.keys(hashtagsData).forEach(hashtagId => {
                const hashtagData = hashtagsData[hashtagId];
                if (hashtagData.channelId === channelId) {
                    channelHashtags[hashtagData.hashtag] = hashtagData;
                }
            });
            
            updateHashtagsPanel(channelId);
        } else {
            // Нет хештегов для этого канала
            if (hashtagsPanel) {
                hashtagsPanel.style.display = 'none';
            }
        }
    });
}

// Создание панели хештегов
function createHashtagsPanel(channelId) {
    const messagesContainer = document.getElementById('channelMessagesContainer');
    if (!messagesContainer) return;
    
    // Удаляем старую панель если есть
    if (hashtagsPanel) {
        hashtagsPanel.remove();
    }
    
    // Создаем новую панель
    hashtagsPanel = document.createElement('div');
    hashtagsPanel.className = 'hashtags-panel';
    hashtagsPanel.id = 'hashtagsPanel';
    
    hashtagsPanel.innerHTML = `
        <div class="hashtags-title">
            <i class="fas fa-hashtag"></i>
            <span>Популярные темы:</span>
        </div>
        <div class="hashtags-list" id="hashtagsList">
            <div style="font-size: 12px; opacity: 0.7;">Хештеги появятся здесь</div>
        </div>
        <button class="clear-hashtag-filter" id="clearHashtagFilter" style="display: none;">
            <i class="fas fa-times"></i> Сбросить фильтр
        </button>
    `;
    
    // Вставляем панель перед контейнером сообщений
    messagesContainer.parentNode.insertBefore(hashtagsPanel, messagesContainer);
    
    // Обработчик сброса фильтра
    document.getElementById('clearHashtagFilter').addEventListener('click', clearHashtagFilter);
}

// Обновление панели хештегов
function updateHashtagsPanel(channelId) {
    const hashtagsList = document.getElementById('hashtagsList');
    const clearFilterBtn = document.getElementById('clearHashtagFilter');
    
    if (!hashtagsList || !hashtagsPanel) return;
    
    hashtagsList.innerHTML = '';
    
    const hashtagsArray = Object.values(channelHashtags)
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 10); // Показываем топ-10 хештегов
    
    if (hashtagsArray.length === 0) {
        hashtagsList.innerHTML = '<div style="font-size: 12px; opacity: 0.7;">Пока нет хештегов</div>';
        hashtagsPanel.style.display = 'none';
        return;
    }
    
    hashtagsPanel.style.display = 'flex';
    
    hashtagsArray.forEach(hashtagData => {
        const hashtagElement = document.createElement('span');
        hashtagElement.className = 'hashtag';
        if (activeHashtagFilter === hashtagData.hashtag) {
            hashtagElement.classList.add('active');
        }
        
        hashtagElement.innerHTML = `
            #${hashtagData.hashtag}
            <span class="hashtag-count">${hashtagData.count || 0}</span>
        `;
        
        hashtagElement.addEventListener('click', () => {
            filterMessagesByHashtag(hashtagData.hashtag, channelId);
        });
        
        hashtagsList.appendChild(hashtagElement);
    });
    
    // Показываем/скрываем кнопку сброса фильтра
    if (activeHashtagFilter) {
        clearFilterBtn.style.display = 'block';
    } else {
        clearFilterBtn.style.display = 'none';
    }
}

// Извлечение хештегов из текста
function extractHashtagsFromText(text, channelId) {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    
    if (!matches) return;
    
    const uniqueHashtags = [...new Set(matches.map(tag => tag.toLowerCase().replace('#', '')))];
    
    uniqueHashtags.forEach(hashtag => {
        if (hashtag.length > 2 && hashtag.length < 20) { // Валидация хештега
            saveHashtag(hashtag, channelId);
        }
    });
}

// Сохранение хештега в базу
function saveHashtag(hashtag, channelId) {
    const hashtagId = `hashtag_${channelId}_${hashtag}`;
    
    database.ref('channelHashtags/' + hashtagId).once('value').then(snapshot => {
        if (snapshot.exists()) {
            // Увеличиваем счетчик существующего хештега
            database.ref('channelHashtags/' + hashtagId).update({
                count: firebase.database.ServerValue.increment(1),
                lastUsed: Date.now()
            });
        } else {
            // Создаем новый хештег
            database.ref('channelHashtags/' + hashtagId).set({
                id: hashtagId,
                hashtag: hashtag,
                channelId: channelId,
                count: 1,
                createdAt: Date.now(),
                lastUsed: Date.now(),
                createdBy: userId
            });
        }
    });
}

// Фильтрация сообщений по хештегу
function filterMessagesByHashtag(hashtag, channelId) {
    activeHashtagFilter = hashtag;
    
    // Обновляем панель хештегов
    updateHashtagsPanel(channelId);
    
    // Показываем уведомление о фильтре
    showNotification(`🔍 Показаны сообщения с хештегом #${hashtag}`);
    
    // Добавляем класс к контейнеру сообщений
    const messagesContainer = document.getElementById('channelMessagesContainer');
    if (messagesContainer) {
        messagesContainer.classList.add('hashtag-filter-active');
    }
    
    // Здесь можно добавить логику фильтрации сообщений
    // Для демонстрации просто прокручиваем к первому найденному хештегу
    highlightHashtagInMessages(hashtag);
}

// Подсветка хештегов в сообщениях
function highlightHashtagInMessages(hashtag) {
    const messagesContainer = document.getElementById('channelMessagesContainer');
    if (!messagesContainer) return;
    
    const messages = messagesContainer.querySelectorAll('.message, .post-message');
    let found = false;
    
    messages.forEach(message => {
        const text = message.textContent || message.innerText;
        if (text.toLowerCase().includes('#' + hashtag.toLowerCase())) {
            if (!found) {
                message.scrollIntoView({ behavior: 'smooth', block: 'center' });
                message.classList.add('hashtag-highlight');
                found = true;
            }
        }
    });
}

// Очистка фильтра хештегов
function clearHashtagFilter() {
    activeHashtagFilter = null;
    
    // Обновляем панель хештегов
    updateHashtagsPanel(window.currentChannel);
    
    // Убираем класс с контейнера сообщений
    const messagesContainer = document.getElementById('channelMessagesContainer');
    if (messagesContainer) {
        messagesContainer.classList.remove('hashtag-filter-active');
    }
    
    showNotification('🔍 Фильтр хештегов сброшен');
}

// Очистка системы хештегов
function cleanupHashtagsSystem() {
    if (hashtagsListener) {
        database.ref('channelHashtags').off('value', hashtagsListener);
        hashtagsListener = null;
    }
    
    if (hashtagsPanel) {
        hashtagsPanel.remove();
        hashtagsPanel = null;
    }
    
    channelHashtags = {};
    activeHashtagFilter = null;
}

// Функция для показа уведомлений
function showNotification(message) {
    if (window.showNotification) {
        window.showNotification(message);
    } else {
        // Простая реализация уведомлений
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3498db;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔖 Система хештегов загружается...");
    
    // Ждем готовности системы каналов
    const initInterval = setInterval(() => {
        if (typeof database !== 'undefined' && window.ChannelsSystem) {
            clearInterval(initInterval);
            initHashtagsSystem();
            console.log("✅ Система хештегов инициализирована");
        }
    }, 500);
});

// Глобальный экспорт
window.HashtagsSystem = {
    init: initHashtagsSystem,
    extractHashtags: extractHashtagsFromText,
    filterByHashtag: filterMessagesByHashtag,
    clearFilter: clearHashtagFilter,
    version: '1.0'
};

console.log("✅ Quantum Messenger Hashtags System v1.0 loaded!");