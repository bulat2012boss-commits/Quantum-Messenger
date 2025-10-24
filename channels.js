// channels.js - Функционал каналов для Quantum Messenger

// Переменные для работы с каналами
let channelsListener = null;
let currentChannel = null;
let userSubscriptions = {};
let channelPostsListener = null;
let currentMediaFile = null;
let channelChatListener = null;

// Инициализация каналов
function initChannels() {
    console.log("Инициализация каналов...");
    
    // Загружаем подписки пользователя
    loadUserSubscriptions();
    
    // Создаем демо-канал при первом запуске
    createDemoChannel();
    
    // Добавляем обработчики для каналов
    addChannelsEventListeners();
    
    // Модифицируем загрузку чатов для включения каналов
    modifyChatsLoading();
    
    // Модифицируем поиск для включения каналов
    modifySearchFunction();
}

// Загрузка подписок пользователя
function loadUserSubscriptions() {
    const savedSubscriptions = localStorage.getItem('quantumSubscriptions');
    if (savedSubscriptions) {
        userSubscriptions = JSON.parse(savedSubscriptions);
        console.log("Загружены подписки:", userSubscriptions);
    } else {
        userSubscriptions = {};
        saveUserSubscriptions();
    }
}

// Сохранение подписок пользователя
function saveUserSubscriptions() {
    localStorage.setItem('quantumSubscriptions', JSON.stringify(userSubscriptions));
}

// Создание демо-канала
function createDemoChannel() {
    const channelId = 'quantum_messenger_channel';
    const channelRef = database.ref('channels/' + channelId);
    
    channelRef.once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("Создаем демо-канал...");
            // Создаем демо-канал
            const channelData = {
                id: channelId,
                name: 'Quantum Messenger',
                description: 'Официальный канал мессенджера. Новости, обновления и полезная информация.',
                category: 'Технологии',
                creatorId: 'system',
                creatorName: 'Система',
                createdAt: Date.now(),
                subscribers: 0,
                isPublic: true,
                hasChat: true, // Включаем чат для демо-канала
                lastMessage: 'Добро пожаловать в официальный канал Quantum Messenger!',
                lastMessageTime: Date.now()
            };
            
            channelRef.set(channelData);
            
            // Создаем чат для демо-канала
            createChannelChat(channelId, 'Quantum Messenger');
        }
    });
}

// Модификация загрузки чатов
function modifyChatsLoading() {
    // Сохраняем оригинальную функцию
    const originalLoadChatsList = loadChatsList;
    
    // Заменяем функцию
    loadChatsList = function() {
        console.log("Загрузка чатов с каналами...");
        // Сначала вызываем оригинальную функцию для загрузки приватных чатов
        originalLoadChatsList();
        
        // Затем загружаем каналы, на которые подписан пользователь
        loadSubscribedChannels();
    };
}

// Модификация функции поиска
function modifySearchFunction() {
    // Сохраняем оригинальную функцию поиска
    const originalPerformSearch = performSearch;
    
    // Заменяем функцию
    performSearch = function() {
        const query = searchInput.value.trim();
        
        if (query) {
            // Ищем и пользователей, и каналы
            performCombinedSearch(query);
        } else {
            // Если запрос пустой, показываем пустой список
            usersList.innerHTML = '<div class="empty-chat"><i class="fas fa-search"></i><p>Введите имя пользователя или название канала для поиска</p></div>';
        }
    };
}

// Комбинированный поиск пользователей и каналов
function performCombinedSearch(query) {
    usersList.innerHTML = `
        <div class="empty-chat">
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <p>Поиск...</p>
        </div>
    `;
    
    // Ищем пользователей
    const usersPromise = database.ref('profiles').once('value');
    // Ищем каналы
    const channelsPromise = database.ref('channels').once('value');
    
    Promise.all([usersPromise, channelsPromise]).then(([usersSnapshot, channelsSnapshot]) => {
        usersList.innerHTML = '';
        
        let foundResults = false;
        
        // Обрабатываем пользователей
        if (usersSnapshot.exists()) {
            const users = usersSnapshot.val();
            Object.keys(users).forEach(userKey => {
                const user = users[userKey];
                
                // Пропускаем текущего пользователя
                if (userKey === userId) return;
                
                // Проверяем совпадение по юзернейму или имени
                const searchTerm = query.toLowerCase();
                const userUsername = (user.username || '').toLowerCase();
                const userName = (user.name || '').toLowerCase();
                
                if (userUsername.includes(searchTerm) || userName.includes(searchTerm)) {
                    foundResults = true;
                    addUserToList(userKey, user);
                }
            });
        }
        
        // Обрабатываем каналы
        if (channelsSnapshot.exists()) {
            const channels = channelsSnapshot.val();
            Object.keys(channels).forEach(channelId => {
                const channel = channels[channelId];
                
                // Проверяем совпадение по названию, описанию или категории
                const searchTerm = query.toLowerCase();
                const channelName = (channel.name || '').toLowerCase();
                const channelDesc = (channel.description || '').toLowerCase();
                const channelCategory = (channel.category || '').toLowerCase();
                
                if (channelName.includes(searchTerm) || 
                    channelDesc.includes(searchTerm) || 
                    channelCategory.includes(searchTerm)) {
                    foundResults = true;
                    addChannelToSearchList(channelId, channel);
                }
            });
        }
        
        if (!foundResults) {
            usersList.innerHTML = '<div class="empty-chat"><i class="fas fa-search"></i><p>Ничего не найдено</p></div>';
        }
    }).catch((error) => {
        console.error("Ошибка поиска:", error);
        usersList.innerHTML = '<div class="empty-chat"><i class="fas fa-exclamation-triangle"></i><p>Ошибка поиска</p></div>';
    });
}

// Добавление канала в список поиска
function addChannelToSearchList(channelId, channel) {
    const channelItem = document.createElement('div');
    channelItem.classList.add('user-item');
    channelItem.dataset.channelId = channelId;
    
    const isSubscribed = userSubscriptions[channelId];
    const isCreator = channel.creatorId === userId;
    
    channelItem.innerHTML = `
        <div class="user-item-avatar" style="background: #4facfe;">
            <i class="fas fa-broadcast-tower"></i>
        </div>
        <div class="user-item-info">
            <div class="user-item-name">
                ${channel.name}
                <span style="font-size: 10px; background: #4facfe; color: white; padding: 2px 6px; border-radius: 10px; margin-left: 8px;">КАНАЛ</span>
            </div>
            <div class="user-item-status">${channel.category} • ${channel.subscribers || 0} подписчиков</div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 4px;">${channel.description}</div>
            ${isCreator ? '<div style="font-size: 11px; color: #4facfe; margin-top: 2px;">Ваш канал</div>' : ''}
        </div>
        <button class="subscribe-btn" style="padding: 6px 12px; border-radius: 15px; border: none; background: ${isSubscribed ? 'var(--action-btn-bg)' : 'linear-gradient(to right, #4facfe, #00f2fe)'}; color: ${isSubscribed ? 'var(--action-btn-color)' : 'white'}; font-size: 12px; cursor: pointer;">
            ${isSubscribed ? 'Отписаться' : 'Подписаться'}
        </button>
    `;
    
    // Обработчик подписки/отписки
    const subscribeBtn = channelItem.querySelector('.subscribe-btn');
    subscribeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isSubscribed) {
            unsubscribeFromChannel(channelId);
        } else {
            subscribeToChannel(channelId);
        }
    });
    
    // Обработчик открытия канала
    channelItem.addEventListener('click', () => {
        if (isSubscribed || isCreator) {
            openChannel(channelId, channel.name, channel.hasChat);
        } else {
            showNotification("Сначала подпишитесь на канал");
        }
    });
    
    usersList.appendChild(channelItem);
}

// Добавление обработчиков событий для каналов
function addChannelsEventListeners() {
    console.log("Добавление обработчиков каналов...");
    
    // Добавляем кнопку создания канала в бургер-меню
    const createChannelBtn = document.createElement('div');
    createChannelBtn.className = 'burger-menu-item';
    createChannelBtn.innerHTML = '<i class="fas fa-broadcast-tower"></i> Создать канал';
    createChannelBtn.id = 'createChannelBtn';
    createChannelBtn.addEventListener('click', showCreateChannelModal);
    
    // Вставляем перед "О программе"
    aboutBtn.parentNode.insertBefore(createChannelBtn, aboutBtn);
    
    // Создаем модальные окна
    createChannelModal();
    createPostModal();
    createShareModal();
}

// Создание модального окна для каналов
function createChannelModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'createChannelModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px;">Создать новый канал</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <input type="text" id="channelNameInput" placeholder="Название канала" style="padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-color);">
                <textarea id="channelDescriptionInput" placeholder="Описание канала" style="padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-color); height: 80px; resize: vertical;"></textarea>
                <select id="channelCategoryInput" style="padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-color);">
                    <option value="Технологии">Технологии</option>
                    <option value="Образование">Образование</option>
                    <option value="Математика">Математика</option>
                    <option value="Программирование">Программирование</option>
                    <option value="Развлечения">Развлечения</option>
                    <option value="Новости">Новости</option>
                    <option value="Спорт">Спорт</option>
                    <option value="Музыка">Музыка</option>
                    <option value="Искусство">Искусство</option>
                    <option value="Наука">Наука</option>
                    <option value="Другое">Другое</option>
                </select>
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="channelPublicToggle" checked>
                    <span>Публичный канал</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="channelHasChatToggle" checked>
                    <span>Создать общий чат для подписчиков</span>
                </label>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn secondary" id="cancelCreateChannelBtn">Отмена</button>
                <button class="modal-btn primary" id="confirmCreateChannelBtn">Создать</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики для модального окна
    document.getElementById('cancelCreateChannelBtn').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    document.getElementById('confirmCreateChannelBtn').addEventListener('click', createChannel);
}

// Создание модального окна для постов
function createPostModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'createPostModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px;">Создать пост в канале</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <textarea id="postTextInput" placeholder="Текст поста..." style="padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-color); height: 120px; resize: vertical;"></textarea>
                
                <div id="postMediaPreview" style="display: none; text-align: center; margin: 10px 0;">
                    <img id="postImagePreview" style="max-width: 100%; max-height: 200px; border-radius: 8px; display: none;">
                    <video id="postVideoPreview" controls style="max-width: 100%; max-height: 200px; border-radius: 8px; display: none;"></video>
                    <div id="postFileInfo" style="display: none; padding: 10px; background: var(--other-msg-bg); border-radius: 8px;">
                        <i class="fas fa-file"></i> <span id="fileName"></span>
                    </div>
                    <button class="modal-btn secondary" id="removeMediaBtn" style="margin-top: 8px; display: none;">
                        <i class="fas fa-times"></i> Удалить
                    </button>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button class="modal-btn secondary" id="addPhotoBtn" style="flex: 1;">
                        <i class="fas fa-image"></i> Фото
                    </button>
                    <button class="modal-btn secondary" id="addVideoBtn" style="flex: 1;">
                        <i class="fas fa-video"></i> Видео
                    </button>
                    <button class="modal-btn secondary" id="addFileBtn" style="flex: 1;">
                        <i class="fas fa-file"></i> Файл
                    </button>
                </div>
                
                <input type="file" id="mediaFileInput" accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar" style="display: none;">
            </div>
            <div class="modal-buttons">
                <button class="modal-btn secondary" id="cancelPostBtn">Отмена</button>
                <button class="modal-btn primary" id="publishPostBtn">Опубликовать</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики для модального окна поста
    document.getElementById('cancelPostBtn').addEventListener('click', () => {
        modal.classList.remove('active');
        resetPostForm();
    });
    
    document.getElementById('publishPostBtn').addEventListener('click', publishPost);
    
    document.getElementById('addPhotoBtn').addEventListener('click', () => {
        document.getElementById('mediaFileInput').setAttribute('accept', 'image/*');
        document.getElementById('mediaFileInput').click();
    });
    
    document.getElementById('addVideoBtn').addEventListener('click', () => {
        document.getElementById('mediaFileInput').setAttribute('accept', 'video/*');
        document.getElementById('mediaFileInput').click();
    });
    
    document.getElementById('addFileBtn').addEventListener('click', () => {
        document.getElementById('mediaFileInput').setAttribute('accept', '.pdf,.doc,.docx,.txt,.zip,.rar');
        document.getElementById('mediaFileInput').click();
    });
    
    document.getElementById('mediaFileInput').addEventListener('change', handleMediaSelection);
    
    document.getElementById('removeMediaBtn').addEventListener('click', removeMedia);
}

// Создание модального окна для шаринга
function createShareModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'shareModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px;">Поделиться постом</h3>
            <div style="margin-bottom: 15px;">
                <p>Выберите чат для отправки:</p>
            </div>
            <div class="users-list" id="shareUsersList" style="max-height: 300px; overflow-y: auto;">
                <div class="empty-chat">
                    <i class="fas fa-users"></i>
                    <p>Загрузка контактов...</p>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn secondary" id="cancelShareBtn">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики для модального окна шаринга
    document.getElementById('cancelShareBtn').addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

// Обработка выбора медиа файла
function handleMediaSelection(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    currentMediaFile = file;
    
    const previewContainer = document.getElementById('postMediaPreview');
    const imagePreview = document.getElementById('postImagePreview');
    const videoPreview = document.getElementById('postVideoPreview');
    const fileInfo = document.getElementById('postFileInfo');
    const fileName = document.getElementById('fileName');
    const removeBtn = document.getElementById('removeMediaBtn');
    
    // Скрываем все превью
    imagePreview.style.display = 'none';
    videoPreview.style.display = 'none';
    fileInfo.style.display = 'none';
    removeBtn.style.display = 'block';
    
    // Показываем контейнер превью
    previewContainer.style.display = 'block';
    
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            videoPreview.src = e.target.result;
            videoPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        fileName.textContent = file.name + ` (${formatFileSize(file.size)})`;
        fileInfo.style.display = 'block';
    }
}

// Удаление медиа
function removeMedia() {
    currentMediaFile = null;
    document.getElementById('postMediaPreview').style.display = 'none';
    document.getElementById('mediaFileInput').value = '';
}

// Сброс формы поста
function resetPostForm() {
    document.getElementById('postTextInput').value = '';
    document.getElementById('postMediaPreview').style.display = 'none';
    document.getElementById('postImagePreview').style.display = 'none';
    document.getElementById('postVideoPreview').style.display = 'none';
    document.getElementById('postFileInfo').style.display = 'none';
    document.getElementById('mediaFileInput').value = '';
    document.getElementById('removeMediaBtn').style.display = 'none';
    currentMediaFile = null;
}

// Показ модального окна создания канала
function showCreateChannelModal() {
    document.getElementById('createChannelModal').classList.add('active');
    burgerMenuContent.classList.remove('active');
}

// Показ модального окна создания поста
function showCreatePostModal() {
    if (!currentChannel) {
        showNotification("Выберите канал для создания поста");
        return;
    }
    document.getElementById('createPostModal').classList.add('active');
}

// Создание канала
function createChannel() {
    const name = document.getElementById('channelNameInput').value.trim();
    const description = document.getElementById('channelDescriptionInput').value.trim();
    const category = document.getElementById('channelCategoryInput').value;
    const isPublic = document.getElementById('channelPublicToggle').checked;
    const hasChat = document.getElementById('channelHasChatToggle').checked;
    
    if (!name) {
        showNotification("Введите название канала");
        return;
    }
    
    const channelId = 'channel_' + generateChannelId();
    const channelData = {
        id: channelId,
        name: name,
        description: description,
        category: category,
        creatorId: userId,
        creatorName: currentUser,
        createdAt: Date.now(),
        subscribers: 1,
        isPublic: isPublic,
        hasChat: hasChat,
        lastMessage: 'Канал создан',
        lastMessageTime: Date.now()
    };
    
    // Сохраняем канал в базе данных
    database.ref('channels/' + channelId).set(channelData)
        .then(() => {
            // Подписываем создателя на канал
            subscribeToChannel(channelId);
            
            // Если включен чат, создаем его
            if (hasChat) {
                createChannelChat(channelId, name);
            }
            
            // Закрываем модальное окно
            document.getElementById('createChannelModal').classList.remove('active');
            
            // Очищаем поля
            document.getElementById('channelNameInput').value = '';
            document.getElementById('channelDescriptionInput').value = '';
            
            showNotification("Канал создан успешно!");
            
            // Переходим в созданный канал
            openChannel(channelId, name, hasChat);
        })
        .catch((error) => {
            console.error("Ошибка создания канала:", error);
            showNotification("Ошибка создания канала");
        });
}

// Создание чата для канала
function createChannelChat(channelId, channelName) {
    const chatId = `channel_chat_${channelId}`;
    const chatData = {
        id: chatId,
        participants: {},
        isChannelChat: true,
        channelId: channelId,
        channelName: channelName,
        createdAt: Date.now(),
        lastMessage: "Чат канала создан",
        lastMessageTime: Date.now()
    };
    
    database.ref('chats/' + chatId).set(chatData);
}

// Генерация ID канала
function generateChannelId() {
    return Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

// Подписка на канал
function subscribeToChannel(channelId) {
    userSubscriptions[channelId] = true;
    saveUserSubscriptions();
    
    // Обновляем счетчик подписчиков
    const channelRef = database.ref('channels/' + channelId);
    channelRef.transaction((channel) => {
        if (channel) {
            channel.subscribers = (channel.subscribers || 0) + 1;
        }
        return channel;
    });
    
    showNotification("Вы подписались на канал");
    
    // Если у канала есть чат, добавляем пользователя в участники
    channelRef.once('value').then((snapshot) => {
        const channel = snapshot.val();
        if (channel && channel.hasChat) {
            addUserToChannelChat(channelId);
        }
        
        // Добавляем канал в список "Мои чаты"
        addChannelToChatsList(channelId, channel);
        
        // Переходим в канал после подписки
        openChannel(channelId, channel.name, channel.hasChat);
    });
}

// Добавление пользователя в чат канала
function addUserToChannelChat(channelId) {
    const chatId = `channel_chat_${channelId}`;
    const userData = {
        id: userId,
        name: currentUser,
        joinedAt: Date.now()
    };
    
    database.ref('chats/' + chatId + '/participants/' + userId).set(userData);
}

// Отписка от канала
function unsubscribeFromChannel(channelId) {
    delete userSubscriptions[channelId];
    saveUserSubscriptions();
    
    // Обновляем счетчик подписчиков
    const channelRef = database.ref('channels/' + channelId);
    channelRef.transaction((channel) => {
        if (channel && channel.subscribers > 0) {
            channel.subscribers = channel.subscribers - 1;
        }
        return channel;
    });
    
    // Удаляем пользователя из чата канала, если он есть
    const chatId = `channel_chat_${channelId}`;
    database.ref('chats/' + chatId + '/participants/' + userId).remove();
    
    // Удаляем канал из списка "Мои чаты"
    removeChannelFromChatsList(channelId);
    
    showNotification("Вы отписались от канала");
    
    // Возвращаемся к списку чатов
    backToChats();
}

// Загрузка каналов, на которые подписан пользователь
function loadSubscribedChannels() {
    if (Object.keys(userSubscriptions).length === 0) return;
    
    database.ref('channels').once('value').then((snapshot) => {
        if (!snapshot.exists()) return;
        
        const channels = snapshot.val();
        
        Object.keys(userSubscriptions).forEach(channelId => {
            if (channels[channelId]) {
                addChannelToChatsList(channelId, channels[channelId]);
            }
        });
    });
}

// Добавление канала в список чатов
function addChannelToChatsList(channelId, channel) {
    // Проверяем, нет ли уже такого канала в списке
    if (document.querySelector(`[data-channel-id="${channelId}"]`)) return;
    
    const chatItem = document.createElement('div');
    chatItem.classList.add('chat-item');
    chatItem.dataset.channelId = channelId;
    
    const lastMessage = channel.lastMessage || 'Нет сообщений';
    const lastMessageTime = channel.lastMessageTime ? new Date(channel.lastMessageTime) : new Date();
    const timeString = formatTime(lastMessageTime);
    
    chatItem.innerHTML = `
        <div class="chat-item-avatar" style="background: #4facfe;">
            <i class="fas fa-broadcast-tower"></i>
        </div>
        <div class="chat-item-info">
            <div class="chat-item-header">
                <div class="chat-item-name">
                    ${channel.name}
                    <span style="font-size: 9px; background: #4facfe; color: white; padding: 1px 4px; border-radius: 8px; margin-left: 6px;">КАНАЛ</span>
                </div>
                <div class="chat-item-time">${timeString}</div>
            </div>
            <div class="chat-item-last-message">${lastMessage}</div>
        </div>
    `;
    
    chatItem.addEventListener('click', () => {
        openChannel(channelId, channel.name, channel.hasChat);
    });
    
    chatsList.appendChild(chatItem);
}

// Удаление канала из списка чатов
function removeChannelFromChatsList(channelId) {
    const channelElement = document.querySelector(`[data-channel-id="${channelId}"]`);
    if (channelElement) {
        channelElement.remove();
    }
}

// Открытие канала
function openChannel(channelId, channelName, hasChat = false) {
    console.log("Открытие канала:", channelId, channelName, "hasChat:", hasChat);
    currentChannel = channelId;
    
    // Обновляем интерфейс
    chatUserName.textContent = channelName;
    chatAvatarInitial.innerHTML = '<i class="fas fa-broadcast-tower"></i>';
    chatUserAvatar.style.background = '#4facfe';
    chatUserStatus.textContent = 'Канал';
    
    // Обновляем поле ввода для канала
    updateInputAreaForChannel(hasChat);
    
    // Загружаем контент канала (посты или чат)
    if (hasChat) {
        loadChannelChat(channelId);
    } else {
        loadChannelPosts(channelId);
    }
    
    // Обновляем меню чата для канала
    updateChatMenuForChannel(channelId, hasChat);
    
    // Переключаем видимость
    chatWrapper.style.display = 'none';
    chatWindow.style.display = 'flex';
}

// Обновление поля ввода для канала
function updateInputAreaForChannel(hasChat) {
    const inputArea = document.querySelector('.input-area');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (hasChat) {
        // Режим общего чата
        inputArea.style.display = 'flex';
        messageInput.placeholder = 'Написать сообщение в общий чат...';
        messageInput.disabled = false;
        sendBtn.disabled = true;
        
        // Обработчики для общего чата
        messageInput.addEventListener('input', function() {
            sendBtn.disabled = messageInput.value.trim() === '';
        });
        
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !sendBtn.disabled) {
                sendChannelMessage();
            }
        });
        
        sendBtn.onclick = sendChannelMessage;
    } else {
        // Режим только для постов (только для создателя)
        const isCreator = isChannelCreator(currentChannel);
        if (isCreator) {
            inputArea.style.display = 'flex';
            messageInput.placeholder = 'Написать пост для канала...';
            messageInput.disabled = false;
            sendBtn.disabled = true;
            
            // Обработчики для постов
            messageInput.addEventListener('input', function() {
                sendBtn.disabled = messageInput.value.trim() === '';
            });
            
            messageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !sendBtn.disabled) {
                    sendChannelPost();
                }
            });
            
            sendBtn.onclick = sendChannelPost;
        } else {
            // Для подписчиков скрываем поле ввода
            inputArea.style.display = 'none';
        }
    }
}

// Отправка сообщения в общий чат канала
function sendChannelMessage() {
    const text = document.getElementById('messageInput').value.trim();
    
    if (!text || !currentChannel) return;
    
    const chatId = `channel_chat_${currentChannel}`;
    const messageId = database.ref('messages').push().key;
    const timestamp = Date.now();
    
    const messageData = {
        id: messageId,
        text: text,
        senderId: userId,
        senderName: currentUser,
        timestamp: timestamp,
        chatId: chatId,
        read: false
    };
    
    // Сохраняем сообщение в базе данных
    database.ref('messages/' + messageId).set(messageData)
        .then(() => {
            // Обновляем информацию о чате
            updateChatInfo(chatId, text, timestamp);
            
            // Очищаем поле ввода
            document.getElementById('messageInput').value = '';
            document.getElementById('sendBtn').disabled = true;
        })
        .catch((error) => {
            console.error("Ошибка отправки сообщения:", error);
            showNotification("Ошибка отправки сообщения");
        });
}

// Отправка поста в канал (быстрое создание поста)
function sendChannelPost() {
    const text = document.getElementById('messageInput').value.trim();
    
    if (!text || !currentChannel) return;
    
    const postId = database.ref('channelPosts/' + currentChannel).push().key;
    const timestamp = Date.now();
    
    const postData = {
        id: postId,
        text: text,
        authorId: userId,
        authorName: currentUser,
        timestamp: timestamp,
        likes: 0,
        comments: 0
    };
    
    // Сохраняем пост в базу данных
    database.ref('channelPosts/' + currentChannel + '/' + postId).set(postData)
        .then(() => {
            // Обновляем информацию о канале
            const lastMessage = text.length > 50 ? text.substring(0, 50) + '...' : text;
            database.ref('channels/' + currentChannel).update({
                lastMessage: lastMessage,
                lastMessageTime: timestamp
            });
            
            // Очищаем поле ввода
            document.getElementById('messageInput').value = '';
            document.getElementById('sendBtn').disabled = true;
            
            showNotification("Пост опубликован!");
        })
        .catch((error) => {
            console.error("Ошибка публикации поста:", error);
            showNotification("Ошибка публикации поста");
        });
}

// Загрузка общего чата канала
function loadChannelChat(channelId) {
    const chatId = `channel_chat_${channelId}`;
    
    messagesContainer.innerHTML = '<div class="empty-chat"><div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div><p>Загрузка чата...</p></div>';
    
    // Удаляем предыдущий слушатель, если он есть
    if (channelChatListener) {
        database.ref('messages').off('value', channelChatListener);
    }
    
    // Получаем сообщения общего чата канала
    channelChatListener = database.ref('messages').orderByChild('chatId').equalTo(chatId).on('value', (snapshot) => {
        messagesContainer.innerHTML = '';
        
        if (!snapshot.exists()) {
            messagesContainer.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <h3 style="margin-bottom: 10px;">Общий чат канала</h3>
                    <p>Начните общение в общем чате</p>
                </div>
            `;
            return;
        }
        
        const messages = snapshot.val();
        let hasMessages = false;
        
        // Сортируем сообщения по времени
        const sortedMessages = Object.keys(messages).map(key => messages[key])
            .sort((a, b) => a.timestamp - b.timestamp);
        
        sortedMessages.forEach(message => {
            hasMessages = true;
            addMessageToChat(message);
        });
        
        if (!hasMessages) {
            messagesContainer.innerHTML = '<div class="empty-chat"><i class="fas fa-comments"></i><p>В чате пока нет сообщений</p></div>';
        } else {
            scrollToBottom();
        }
    });
}

// Загрузка постов канала
function loadChannelPosts(channelId) {
    messagesContainer.innerHTML = '<div class="empty-chat"><div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div><p>Загрузка постов...</p></div>';
    
    // Удаляем предыдущий слушатель, если он есть
    if (channelPostsListener) {
        database.ref('channelPosts/' + channelId).off('value', channelPostsListener);
    }
    
    // Получаем посты канала
    channelPostsListener = database.ref('channelPosts/' + channelId).orderByChild('timestamp').on('value', (snapshot) => {
        messagesContainer.innerHTML = '';
        
        if (!snapshot.exists()) {
            const isCreator = isChannelCreator(channelId);
            messagesContainer.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-broadcast-tower" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <h3 style="margin-bottom: 10px;">${document.querySelector('.chat-header-info .user-name span').textContent}</h3>
                    <p>В этом канале пока нет постов</p>
                    ${isCreator ? 
                        '<p style="font-size: 14px; margin-top: 10px;">Создайте первый пост через меню канала или напишите в поле ниже!</p>' : 
                        '<p style="font-size: 14px; margin-top: 10px;">Подписывайтесь, чтобы не пропустить новые посты</p>'
                    }
                </div>
            `;
            return;
        }
        
        const posts = snapshot.val();
        let hasPosts = false;
        
        // Сортируем посты по времени (новые сверху)
        const sortedPosts = Object.keys(posts).map(key => ({
            ...posts[key],
            id: key
        })).sort((a, b) => b.timestamp - a.timestamp);
        
        sortedPosts.forEach(post => {
            hasPosts = true;
            addPostToChannel(post);
        });
        
        if (!hasPosts) {
            messagesContainer.innerHTML = '<div class="empty-chat"><i class="fas fa-broadcast-tower"></i><p>В этом канале пока нет постов</p></div>';
        }
    });
}

// Добавление поста в канал
function addPostToChannel(post) {
    const postElement = document.createElement('div');
    postElement.classList.add('message');
    postElement.classList.add('other-message');
    postElement.style.maxWidth = '95%';
    postElement.style.marginBottom = '20px';
    postElement.style.padding = '15px';
    
    const date = new Date(post.timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = date.toLocaleDateString();
    
    let mediaContent = '';
    if (post.media) {
        if (post.media.type === 'image') {
            mediaContent = `
                <div style="margin: 10px 0;">
                    <img src="${post.media.url}" style="max-width: 100%; max-height: 400px; border-radius: 12px; cursor: pointer; border: 1px solid var(--border-color);" 
                         onclick="openMediaModal('${post.media.url}', 'image')">
                </div>
            `;
        } else if (post.media.type === 'video') {
            mediaContent = `
                <div style="margin: 10px 0;">
                    <video controls style="max-width: 100%; max-height: 400px; border-radius: 12px; cursor: pointer; border: 1px solid var(--border-color);" 
                           onclick="openMediaModal('${post.media.url}', 'video')">
                        <source src="${post.media.url}" type="video/mp4">
                        Ваш браузер не поддерживает видео.
                    </video>
                </div>
            `;
        } else if (post.media.type === 'file') {
            mediaContent = `
                <div style="background: var(--other-msg-bg); padding: 12px; border-radius: 12px; margin: 10px 0; display: flex; align-items: center; gap: 12px; border: 1px solid var(--border-color);">
                    <i class="fas fa-file" style="font-size: 24px; color: #4facfe;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 14px;">${post.media.name}</div>
                        <div style="font-size: 12px; opacity: 0.7;">${formatFileSize(post.media.size)}</div>
                    </div>
                    <a href="${post.media.url}" download="${post.media.name}" style="color: #4facfe; padding: 8px;">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            `;
        }
    }
    
    const isCreator = isChannelCreator(currentChannel);
    
    postElement.innerHTML = `
        <div class="sender">
            <i class="fas fa-broadcast-tower"></i>
            ${post.authorName}
            ${isCreator && post.authorId === userId ? 
                '<span style="font-size: 10px; background: #4facfe; color: white; padding: 2px 6px; border-radius: 8px; margin-left: 6px;">ВЛАДЕЛЕЦ</span>' : ''}
        </div>
        ${post.text ? `<div style="margin: 10px 0; line-height: 1.5; font-size: 14px;">${post.text}</div>` : ''}
        ${mediaContent}
        <div class="timestamp">${dateString} в ${timeString}</div>
        <div style="display: flex; gap: 20px; margin-top: 12px; font-size: 13px; opacity: 0.8;">
            <span style="cursor: pointer;" onclick="likePost('${post.id}')">
                <i class="far fa-heart"></i> ${post.likes || 0}
            </span>
            <span style="cursor: pointer;">
                <i class="far fa-comment"></i> ${post.comments || 0}
            </span>
            <span style="cursor: pointer;" onclick="sharePost('${post.id}')">
                <i class="fas fa-share"></i> Поделиться
            </span>
        </div>
    `;
    
    messagesContainer.appendChild(postElement);
}

// Лайк поста
function likePost(postId) {
    if (!currentChannel) return;
    
    const postRef = database.ref('channelPosts/' + currentChannel + '/' + postId);
    postRef.transaction((post) => {
        if (post) {
            post.likes = (post.likes || 0) + 1;
        }
        return post;
    });
}

// Шаринг поста
function sharePost(postId) {
    if (!currentChannel) return;

    // Получаем данные поста
    database.ref('channelPosts/' + currentChannel + '/' + postId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const post = snapshot.val();
            showShareModalWithPost(post);
        }
    });
}

// Показ модального окна шаринга с постом
function showShareModalWithPost(post) {
    const modal = document.getElementById('shareModal');
    const usersList = document.getElementById('shareUsersList');
    
    // Загружаем список контактов для шаринга
    loadContactsForSharing(usersList, post);
    
    modal.classList.add('active');
}

// Загрузка контактов для шаринга
function loadContactsForSharing(container, post) {
    container.innerHTML = '<div class="empty-chat"><div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div><p>Загрузка контактов...</p></div>';
    
    // Загружаем чаты пользователя
    database.ref('chats').once('value').then((snapshot) => {
        container.innerHTML = '';
        
        if (!snapshot.exists()) {
            container.innerHTML = '<div class="empty-chat"><i class="fas fa-users"></i><p>У вас нет чатов</p></div>';
            return;
        }
        
        const chats = snapshot.val();
        let hasChats = false;
        
        Object.keys(chats).forEach(chatId => {
            const chat = chats[chatId];
            
            // Проверяем, относится ли чат к текущему пользователю и не является ли каналом
            if (chat.participants && chat.participants[userId] && !chat.isChannelChat) {
                hasChats = true;
                addContactToShareList(container, chatId, chat, post);
            }
        });
        
        if (!hasChats) {
            container.innerHTML = '<div class="empty-chat"><i class="fas fa-users"></i><p>У вас нет чатов</p></div>';
        }
    });
}

// Добавление контакта в список шаринга
function addContactToShareList(container, chatId, chat, post) {
    // Находим собеседника
    let otherUserId = null;
    let otherUserName = '';
    Object.keys(chat.participants).forEach(participantId => {
        if (participantId !== userId) {
            otherUserId = participantId;
            otherUserName = chat.participants[participantId].name;
        }
    });
    
    if (!otherUserId) return;
    
    const contactItem = document.createElement('div');
    contactItem.classList.add('user-item');
    
    contactItem.innerHTML = `
        <div class="user-item-avatar" style="background: ${generateUserColor()}">
            ${otherUserName ? otherUserName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div class="user-item-info">
            <div class="user-item-name">${otherUserName}</div>
            <div class="user-item-status">${chat.lastMessage || 'Нет сообщений'}</div>
        </div>
    `;
    
    contactItem.addEventListener('click', () => {
        sharePostToContact(chatId, otherUserId, otherUserName, post);
        document.getElementById('shareModal').classList.remove('active');
    });
    
    container.appendChild(contactItem);
}

// Шаринг поста с контактом
function sharePostToContact(chatId, contactId, contactName, post) {
    const messageId = database.ref('messages').push().key;
    const timestamp = Date.now();
    
    let shareText = `🔗 Поделился постом из канала:\n\n${post.text || ''}`;
    
    if (post.media) {
        shareText += `\n\n📎 Прикреплено: ${post.media.type === 'image' ? 'Изображение' : post.media.type === 'video' ? 'Видео' : 'Файл'}`;
    }
    
    const messageData = {
        id: messageId,
        text: shareText,
        senderId: userId,
        senderName: currentUser,
        receiverId: contactId,
        receiverName: contactName,
        timestamp: timestamp,
        chatId: chatId,
        read: false,
        isSharedPost: true,
        originalPost: post
    };
    
    // Сохраняем сообщение в базе данных
    database.ref('messages/' + messageId).set(messageData)
        .then(() => {
            // Обновляем информацию о чате
            updateChatInfo(chatId, "🔗 Поделился постом", timestamp);
            
            showNotification(`Пост отправлен ${contactName}!`);
        })
        .catch((error) => {
            console.error("Ошибка отправки поста:", error);
            showNotification("Ошибка отправки поста");
        });
}

// Форматирование размера файла
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Публикация поста (из модального окна)
function publishPost() {
    if (!currentChannel) {
        showNotification("Ошибка: канал не выбран");
        return;
    }
    
    const text = document.getElementById('postTextInput').value.trim();
    
    if (!text && !currentMediaFile) {
        showNotification("Добавьте текст или медиа для поста");
        return;
    }
    
    const postId = database.ref('channelPosts/' + currentChannel).push().key;
    const timestamp = Date.now();
    
    let postData = {
        id: postId,
        text: text,
        authorId: userId,
        authorName: currentUser,
        timestamp: timestamp,
        likes: 0,
        comments: 0
    };
    
    // Если есть медиа файл
    if (currentMediaFile) {
        const file = currentMediaFile;
        let mediaType = 'file';
        if (file.type.startsWith('image/')) mediaType = 'image';
        else if (file.type.startsWith('video/')) mediaType = 'video';
        
        // Читаем файл как Data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            postData.media = {
                type: mediaType,
                name: file.name,
                size: file.size,
                url: e.target.result
            };
            
            savePostToDatabase(postData);
        };
        reader.onerror = function() {
            showNotification("Ошибка чтения файла");
        };
        reader.readAsDataURL(file);
    } else {
        savePostToDatabase(postData);
    }
}

// Сохранение поста в базу данных
function savePostToDatabase(postData) {
    console.log("Сохранение поста:", postData);
    
    database.ref('channelPosts/' + currentChannel + '/' + postData.id).set(postData)
        .then(() => {
            // Обновляем информацию о канале
            const lastMessage = postData.text ? 
                (postData.text.length > 50 ? postData.text.substring(0, 50) + '...' : postData.text) :
                'Медиа пост';
                
            database.ref('channels/' + currentChannel).update({
                lastMessage: lastMessage,
                lastMessageTime: postData.timestamp
            });
            
            // Закрываем модальное окно и сбрасываем форму
            document.getElementById('createPostModal').classList.remove('active');
            resetPostForm();
            
            showNotification("Пост опубликован!");
        })
        .catch((error) => {
            console.error("Ошибка публикации поста:", error);
            showNotification("Ошибка публикации поста: " + error.message);
        });
}

// Обновление меню чата для канала
function updateChatMenuForChannel(channelId, hasChat) {
    const chatMenuContent = document.getElementById('chatMenuContent');
    const isCreator = isChannelCreator(channelId);
    
    let menuHTML = '';
    
    if (isCreator) {
        menuHTML += `
            <div class="chat-menu-item" id="createPostBtn">
                <i class="fas fa-plus"></i> Создать пост
            </div>
        `;
    }
    
    menuHTML += `
        <div class="chat-menu-item" id="channelInfoBtn">
            <i class="fas fa-info-circle"></i> Информация о канале
        </div>
        <div class="chat-menu-item" id="channelSubscribersBtn">
            <i class="fas fa-users"></i> Подписчики
        </div>
    `;
    
    if (isCreator) {
        menuHTML += `
            <div class="chat-menu-item" id="channelSettingsBtn">
                <i class="fas fa-cog"></i> Управление каналом
            </div>
        `;
    }
    
    menuHTML += `
        <div class="chat-menu-item danger" id="unsubscribeChannelBtn">
            <i class="fas fa-sign-out-alt"></i> Отписаться от канала
        </div>
    `;
    
    chatMenuContent.innerHTML = menuHTML;
    
    // Добавляем обработчики для меню канала
    if (isCreator) {
        document.getElementById('createPostBtn').addEventListener('click', () => {
            showCreatePostModal();
            chatMenuContent.classList.remove('active');
        });
    }
    
    document.getElementById('channelInfoBtn').addEventListener('click', () => {
        showChannelInfo(channelId);
        chatMenuContent.classList.remove('active');
    });
    
    document.getElementById('channelSubscribersBtn').addEventListener('click', () => {
        showChannelSubscribers(channelId);
        chatMenuContent.classList.remove('active');
    });
    
    document.getElementById('unsubscribeChannelBtn').addEventListener('click', () => {
        unsubscribeFromChannel(channelId);
        chatMenuContent.classList.remove('active');
    });
    
    if (isCreator) {
        document.getElementById('channelSettingsBtn').addEventListener('click', () => {
            showChannelManagement(channelId);
            chatMenuContent.classList.remove('active');
        });
    }
}

// Проверка, является ли пользователь создателем канала
function isChannelCreator(channelId) {
    if (!channelId || !userSubscriptions[channelId]) return false;
    
    // В реальном приложении нужно проверять creatorId в базе данных
    // Для демо считаем, что если пользователь подписан и это его канал, то он создатель
    return userSubscriptions[channelId];
}

// Показ информации о канале
function showChannelInfo(channelId) {
    database.ref('channels/' + channelId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const channel = snapshot.val();
            showNotification(`Канал: ${channel.name}\nОписание: ${channel.description}\nПодписчиков: ${channel.subscribers || 0}`);
        }
    });
}

// Показ подписчиков канала
function showChannelSubscribers(channelId) {
    showNotification("Функция просмотра подписчиков в разработке");
}

// Показ управления каналом
function showChannelManagement(channelId) {
    database.ref('channels/' + channelId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            showChannelManagementModal(channelId, snapshot.val());
        }
    });
}

// Создание модального окна управления каналом
function showChannelManagementModal(channelId, channel) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'channelManagementModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Управление каналом</h3>
            <div style="text-align: center; margin-bottom: 20px;">
                <div class="user-avatar" style="width: 60px; height: 60px; margin: 0 auto 10px; background: #4facfe;">
                    <i class="fas fa-broadcast-tower" style="font-size: 24px;"></i>
                </div>
                <div class="profile-name">${channel.name}</div>
                <div style="font-size: 14px; opacity: 0.7;">${channel.subscribers || 0} подписчиков</div>
            </div>
            
            <div class="settings-section">
                <h4><i class="fas fa-cog"></i> Настройки канала</h4>
                <button class="modal-btn primary" style="width: 100%; margin-bottom: 10px;" id="editChannelBtn">
                    <i class="fas fa-edit"></i> Редактировать канал
                </button>
                <button class="modal-btn ${channel.hasChat ? 'secondary' : 'primary'}" style="width: 100%; margin-bottom: 10px;" id="toggleChannelChatBtn">
                    <i class="fas fa-comments"></i> ${channel.hasChat ? 'Отключить общий чат' : 'Включить общий чат'}
                </button>
            </div>
            
            <div class="modal-buttons">
                <button class="modal-btn secondary" id="closeChannelManagementBtn">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики для модального окна управления
    document.getElementById('closeChannelManagementBtn').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('toggleChannelChatBtn').addEventListener('click', () => {
        toggleChannelChat(channelId, !channel.hasChat);
        modal.remove();
    });
}

// Переключение общего чата канала
function toggleChannelChat(channelId, enable) {
    const updates = {
        hasChat: enable
    };
    
    database.ref('channels/' + channelId).update(updates)
        .then(() => {
            if (enable) {
                createChannelChat(channelId, document.querySelector('.profile-name').textContent);
                showNotification("Общий чат включен для канала");
            } else {
                showNotification("Общий чат отключен для канала");
            }
        })
        .catch((error) => {
            console.error("Ошибка обновления канала:", error);
            showNotification("Ошибка обновления канала");
        });
}

// Модальное окно для просмотра медиа
function openMediaModal(url, type) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.background = 'rgba(0,0,0,0.95)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.innerHTML = `
        <div style="position: relative; max-width: 90vw; max-height: 90vh;">
            <button class="modal-btn secondary" onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: -40px; right: 0; z-index: 1000; background: rgba(0,0,0,0.7);">
                <i class="fas fa-times"></i> Закрыть
            </button>
            ${type === 'image' ? 
                `<img src="${url}" style="max-width: 100%; max-height: 90vh; border-radius: 8px;">` :
                `<video controls autoplay style="max-width: 100%; max-height: 90vh; border-radius: 8px;">
                    <source src="${url}" type="video/mp4">
                </video>`
            }
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Модификация функции backToChats для работы с каналами
const originalBackToChats = backToChats;
backToChats = function() {
    originalBackToChats();
    currentChannel = null;
    
    // Удаляем слушатели
    if (channelPostsListener) {
        database.ref('channelPosts').off('value', channelPostsListener);
        channelPostsListener = null;
    }
    
    if (channelChatListener) {
        database.ref('messages').off('value', channelChatListener);
        channelChatListener = null;
    }
    
    // Восстанавливаем обычное меню чата
    const chatMenuContent = document.getElementById('chatMenuContent');
    chatMenuContent.innerHTML = `
        <div class="chat-menu-item" id="chatInfoBtn">
            <i class="fas fa-info-circle"></i> Информация о чате
        </div>
        <div class="chat-menu-item" id="clearChatBtn">
            <i class="fas fa-broom"></i> Очистить историю
        </div>
        <div class="chat-menu-item danger" id="blockUserBtn">
            <i class="fas fa-ban"></i> Заблокировать
        </div>
    `;
    
    // Восстанавливаем обработчики обычного меню
    document.getElementById('chatInfoBtn').addEventListener('click', showChatInfo);
    document.getElementById('clearChatBtn').addEventListener('click', clearChatHistory);
    document.getElementById('blockUserBtn').addEventListener('click', blockUser);
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен, инициализируем каналы...");
    // Инициализируем каналы с задержкой чтобы убедиться что все скрипты загружены
    setTimeout(initChannels, 500);
});