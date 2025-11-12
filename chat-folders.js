// group-search-by-members.js - Поиск групп через общих участников
// Версия 2.0 - Исправлена проблема с перезаписью результатов

// Глобальные переменные для поиска групп
let userSearchCache = {};
let commonGroupsCache = {};
let isSearchInitialized = false;
let originalPerformSearch = null;

// Инициализация функционала поиска групп по участникам
function initGroupSearchByMembers() {
    if (isSearchInitialized) {
        console.log("Поиск групп уже инициализирован");
        return;
    }
    
    console.log("🚀 Инициализация поиска групп по участникам...");
    
    // Сохраняем оригинальную функцию поиска
    originalPerformSearch = window.performSearch;
    
    // Добавляем стили для отображения общих групп
    addCommonGroupsStyles();
    
    // Инициализируем обработчики событий
    initCommonGroupsEventListeners();
    
    // Перехватываем поиск
    overrideSearchFunctionality();
    
    isSearchInitialized = true;
    console.log("✅ Поиск групп по участникам успешно инициализирован");
}

// Перехват функционала поиска
function overrideSearchFunctionality() {
    console.log("🔄 Перехватываем функционал поиска...");
    
    // Переопределяем глобальную функцию performSearch
    window.performSearch = function() {
        const username = document.getElementById('searchInput').value.trim();
        
        console.log("🎯 Вызвана функция поиска, запрос:", username);
        
        // Сначала выполняем стандартный поиск пользователей
        if (originalPerformSearch) {
            console.log("🔍 Выполняем стандартный поиск...");
            originalPerformSearch();
        } else {
            console.log("⚠️ Оригинальная функция поиска не найдена, выполняем базовый поиск");
            performBasicUserSearch(username);
        }
        
        // Затем ищем общие группы (с задержкой чтобы дождаться результатов основного поиска)
        if (username) {
            console.log("🔍 Запускаем поиск общих групп через 1.5 секунды...");
            setTimeout(() => {
                searchCommonGroups(username);
            }, 1500);
        }
    };
    
    console.log("✅ Функционал поиска перехвачен");
}

// Базовая функция поиска пользователей (если оригинальная не найдена)
function performBasicUserSearch(username) {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    usersList.innerHTML = `
        <div class="empty-chat">
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <p>Поиск пользователей...</p>
        </div>
    `;
    
    database.ref('profiles').once('value').then((snapshot) => {
        usersList.innerHTML = '';
        
        if (!snapshot.exists()) {
            usersList.innerHTML = '<div class="empty-chat"><i class="fas fa-users"></i><p>Пользователи не найдены</p></div>';
            return;
        }
        
        const users = snapshot.val();
        let foundUsers = false;
        
        Object.keys(users).forEach(userKey => {
            const user = users[userKey];
            
            if (userKey === userId) return;
            
            const userUsername = (user.username || '').toLowerCase();
            const userName = (user.name || '').toLowerCase();
            const searchLower = username.toLowerCase();
            
            if (userUsername.includes(searchLower) || userName.includes(searchLower)) {
                foundUsers = true;
                addUserToSearchResults(userKey, user, usersList);
            }
        });
        
        if (!foundUsers) {
            usersList.innerHTML = '<div class="empty-chat"><i class="fas fa-users"></i><p>Пользователи не найдены</p></div>';
        }
    });
}

// Добавление пользователя в результаты поиска
function addUserToSearchResults(userId, user, usersList) {
    const userItem = document.createElement('div');
    userItem.classList.add('user-item');
    userItem.dataset.userId = userId;
    
    const displayName = user.username || user.name;
    const statusClass = user.isOnline ? 'online' : 'offline';
    const statusText = user.isOnline ? 'Онлайн' : 'Оффлайн';
    
    userItem.innerHTML = `
        <div class="user-item-avatar" style="background: ${generateUserColor()}">
            ${displayName ? displayName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div class="user-item-info">
            <div class="user-item-name">${displayName}</div>
            <div class="user-item-status ${statusClass}">${statusText}</div>
        </div>
    `;
    
    userItem.addEventListener('click', () => {
        if (typeof openChat === 'function') {
            openChat(userId, displayName);
        } else {
            console.log("Функция openChat не найдена");
        }
    });
    
    usersList.appendChild(userItem);
}

// Поиск общих групп с пользователем
function searchCommonGroups(searchTerm) {
    console.log("🔍 Начинаем поиск общих групп для:", searchTerm);
    
    const usersList = document.getElementById('usersList');
    if (!usersList) {
        console.log("❌ usersList не найден");
        return;
    }
    
    // Удаляем старые результаты общих групп
    removeOldCommonGroupsResults();
    
    // Показываем индикатор загрузки
    showCommonGroupsLoading(usersList);
    
    // Ищем пользователей в базе данных
    database.ref('profiles').once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("ℹ️ Нет пользователей в базе данных");
            hideCommonGroupsLoading(usersList);
            return;
        }
        
        const users = snapshot.val();
        let foundUsers = [];
        
        console.log(`📊 Всего пользователей в базе: ${Object.keys(users).length}`);
        
        // Ищем пользователей по имени или юзернейму
        Object.keys(users).forEach(userKey => {
            const user = users[userKey];
            
            // Пропускаем текущего пользователя
            if (userKey === userId) {
                return;
            }
            
            const userUsername = (user.username || '').toLowerCase();
            const userName = (user.name || '').toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            
            // Более гибкий поиск - ищем частичные совпадения
            if (userUsername.includes(searchLower) || userName.includes(searchLower)) {
                console.log("✅ Найден пользователь:", user.name || user.username);
                foundUsers.push({
                    id: userKey,
                    name: user.name || 'Без имени',
                    username: user.username || user.name || 'Без имени',
                    isOnline: user.isOnline || false,
                    status: user.status || 'offline'
                });
            }
        });
        
        console.log(`👥 Найдено пользователей: ${foundUsers.length}`);
        
        if (foundUsers.length > 0) {
            loadCommonGroupsForUsers(foundUsers, usersList);
        } else {
            console.log("ℹ️ Пользователи не найдены");
            hideCommonGroupsLoading(usersList);
        }
    }).catch((error) => {
        console.error("❌ Ошибка поиска пользователей:", error);
        hideCommonGroupsLoading(usersList);
        showErrorMessage(usersList, "Ошибка поиска пользователей");
    });
}

// Удаление старых результатов общих групп
function removeOldCommonGroupsResults() {
    const oldContainer = document.getElementById('commonGroupsContainer');
    const oldLoading = document.getElementById('commonGroupsLoading');
    const oldMessage = document.getElementById('commonGroupsMessage');
    
    if (oldContainer) oldContainer.remove();
    if (oldLoading) oldLoading.remove();
    if (oldMessage) oldMessage.remove();
}

// Загрузка общих групп для найденных пользователей
function loadCommonGroupsForUsers(users, usersList) {
    console.log(`👨‍👩‍👧‍👦 Загружаем общие группы для ${users.length} пользователей`);
    
    const cacheKey = users.map(u => u.id).join('_');
    
    // Проверяем кэш
    if (commonGroupsCache[cacheKey]) {
        console.log("💾 Используем кэшированные данные");
        displayCommonGroups(commonGroupsCache[cacheKey], usersList);
        return;
    }
    
    // Загружаем все группы из базы данных
    database.ref('groups').once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("ℹ️ Нет групп в базе данных");
            hideCommonGroupsLoading(usersList);
            showNoCommonGroupsMessage(usersList);
            return;
        }
        
        const allGroups = snapshot.val();
        const userGroups = [];
        
        console.log(`🏢 Всего групп в базе: ${Object.keys(allGroups).length}`);
        
        // Находим группы текущего пользователя
        Object.keys(allGroups).forEach(groupId => {
            const group = allGroups[groupId];
            if (group.members && group.members[userId]) {
                userGroups.push({
                    id: groupId,
                    name: group.name || 'Без названия',
                    avatar: group.avatar || '',
                    members: group.members || {},
                    description: group.description || '',
                    settings: group.settings || {}
                });
            }
        });
        
        console.log(`👤 Групп текущего пользователя: ${userGroups.length}`);
        
        // Для каждого найденного пользователя находим общие группы
        const results = [];
        
        users.forEach(user => {
            const commonGroups = [];
            
            userGroups.forEach(userGroup => {
                // Проверяем, состоит ли найденный пользователь в этой группе
                if (userGroup.members && userGroup.members[user.id]) {
                    const userRole = userGroup.members[user.id]?.role || 'member';
                    const currentUserRole = userGroup.members[userId]?.role || 'member';
                    
                    commonGroups.push({
                        id: userGroup.id,
                        name: userGroup.name,
                        avatar: userGroup.avatar,
                        membersCount: Object.keys(userGroup.members || {}).length,
                        userRole: userRole,
                        currentUserRole: currentUserRole,
                        description: userGroup.description,
                        isPublic: userGroup.settings?.public || false
                    });
                }
            });
            
            if (commonGroups.length > 0) {
                results.push({
                    user: user,
                    commonGroups: commonGroups
                });
                
                console.log(`✅ Пользователь ${user.name}: ${commonGroups.length} общих групп`);
            } else {
                console.log(`❌ Пользователь ${user.name}: НЕТ общих групп`);
            }
        });
        
        console.log(`🎯 Всего результатов с общими группами: ${results.length}`);
        
        // Сохраняем в кэш
        commonGroupsCache[cacheKey] = results;
        
        // Отображаем результаты
        displayCommonGroups(results, usersList);
        
    }).catch((error) => {
        console.error("❌ Ошибка загрузки групп:", error);
        hideCommonGroupsLoading(usersList);
        showErrorMessage(usersList, "Ошибка загрузки групп");
    });
}

// Отображение общих групп
function displayCommonGroups(results, usersList) {
    console.log("🎨 Отображаем результаты поиска");
    hideCommonGroupsLoading(usersList);
    
    if (results.length === 0) {
        console.log("ℹ️ Нет общих групп для отображения");
        showNoCommonGroupsMessage(usersList);
        return;
    }
    
    // Создаем контейнер для общих групп
    const commonGroupsContainer = document.createElement('div');
    commonGroupsContainer.id = 'commonGroupsContainer';
    commonGroupsContainer.className = 'common-groups-container';
    
    // Добавляем заголовок
    commonGroupsContainer.innerHTML = `
        <div class="common-groups-header">
            <i class="fas fa-users"></i>
            <span>Общие группы</span>
            <div class="common-groups-count">${results.length} пользователь(ей)</div>
        </div>
    `;
    
    // Добавляем карточки пользователей с общими группами
    results.forEach((result, index) => {
        const userCard = createUserCommonGroupsCard(result.user, result.commonGroups);
        commonGroupsContainer.appendChild(userCard);
    });
    
    // Вставляем контейнер ПОСЛЕ списка пользователей
    usersList.appendChild(commonGroupsContainer);
    
    console.log("✅ Общие группы успешно отображены");
}

// Создание карточки пользователя с общими группами
function createUserCommonGroupsCard(user, commonGroups) {
    const userCard = document.createElement('div');
    userCard.className = 'user-common-groups-card';
    
    const displayName = user.username || user.name;
    const groupsCount = commonGroups.length;
    const statusText = user.isOnline ? 
        (user.status === 'online' ? 'Онлайн' : 
         user.status === 'away' ? 'Отошёл' : 
         user.status === 'busy' ? 'Занят' : 'Не в сети') : 'Не в сети';
    
    userCard.innerHTML = `
        <div class="user-common-groups-header">
            <div class="user-common-groups-avatar" style="background: ${generateUserColor()}">
                ${displayName.charAt(0).toUpperCase()}
            </div>
            <div class="user-common-groups-info">
                <div class="user-common-groups-name">${displayName}</div>
                <div class="user-common-groups-status">${statusText}</div>
                <div class="user-common-groups-count">
                    <i class="fas fa-users"></i>
                    ${groupsCount} общих групп
                </div>
            </div>
        </div>
        <div class="user-common-groups-list">
            ${commonGroups.map((group, index) => createCommonGroupItem(group, index)).join('')}
        </div>
    `;
    
    return userCard;
}

// Создание элемента общей группы
function createCommonGroupItem(group, index) {
    const isCurrentUserAdmin = group.currentUserRole === 'admin';
    const isOtherUserAdmin = group.userRole === 'admin';
    
    // Добавляем задержку для анимации
    const animationDelay = index * 0.1;
    
    return `
        <div class="common-group-item" data-group-id="${group.id}" style="animation-delay: ${animationDelay}s">
            <div class="common-group-avatar" style="background: ${group.avatar ? 'transparent' : 'linear-gradient(to right, #ff7e5f, #feb47b)'}">
                ${group.avatar ? 
                    `<img src="${group.avatar}" alt="${group.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\\'fas fa-users\\'></i>'">` : 
                    `<i class="fas fa-users"></i>`
                }
            </div>
            <div class="common-group-info">
                <div class="common-group-name">
                    ${group.name}
                    ${isCurrentUserAdmin ? ' <i class="fas fa-crown admin-badge" title="Вы администратор"></i>' : ''}
                    ${group.isPublic ? ' <i class="fas fa-globe public-badge" title="Публичная группа"></i>' : ' <i class="fas fa-lock private-badge" title="Закрытая группа"></i>'}
                </div>
                <div class="common-group-details">
                    <span class="common-group-members">${group.membersCount} участников</span>
                    <span class="common-group-role">
                        • ${isOtherUserAdmin ? 'Админ' : 'Участник'}
                    </span>
                </div>
                ${group.description ? `<div class="common-group-description">${group.description}</div>` : ''}
            </div>
            <button class="common-group-join-btn" title="Перейти в группу">
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

// Показ индикатора загрузки общих групп
function showCommonGroupsLoading(usersList) {
    removeOldCommonGroupsResults();
    
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'commonGroupsLoading';
    loadingIndicator.className = 'common-groups-loading';
    loadingIndicator.innerHTML = `
        <div class="loading-spinner">
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        </div>
        <span>Ищем общие группы...</span>
    `;
    
    usersList.appendChild(loadingIndicator);
}

// Скрытие индикатора загрузки
function hideCommonGroupsLoading(usersList) {
    const loadingIndicator = document.getElementById('commonGroupsLoading');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Показ сообщения "нет общих групп"
function showNoCommonGroupsMessage(usersList) {
    const messageContainer = document.createElement('div');
    messageContainer.id = 'commonGroupsMessage';
    messageContainer.className = 'common-groups-message';
    messageContainer.innerHTML = `
        <div class="no-common-groups">
            <i class="fas fa-search"></i>
            <div class="message-title">Общих групп не найдено</div>
            <div class="message-subtitle">У вас нет общих групп с найденными пользователями</div>
        </div>
    `;
    
    usersList.appendChild(messageContainer);
}

// Показ сообщения об ошибке
function showErrorMessage(usersList, message) {
    const messageContainer = document.createElement('div');
    messageContainer.id = 'commonGroupsMessage';
    messageContainer.className = 'common-groups-message';
    messageContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="message-title">Ошибка</div>
            <div class="message-subtitle">${message}</div>
        </div>
    `;
    
    usersList.appendChild(messageContainer);
}

// Добавление стилей для общих групп
function addCommonGroupsStyles() {
    const styles = `
        .common-groups-container {
            margin-top: 20px;
            padding: 0 10px;
            width: 100%;
            border-top: 1px solid var(--border-color);
            padding-top: 20px;
        }
        
        .common-groups-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            padding: 12px 15px;
            background: rgba(79, 172, 254, 0.1);
            border-radius: 10px;
            font-weight: 600;
            color: #4facfe;
            justify-content: space-between;
        }
        
        .common-groups-count {
            font-size: 12px;
            opacity: 0.8;
            font-weight: normal;
        }
        
        .common-groups-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
            color: var(--text-color);
            opacity: 0.7;
            width: 100%;
            border-top: 1px solid var(--border-color);
            margin-top: 20px;
        }
        
        .common-groups-message {
            display: block;
            padding: 40px 20px;
            text-align: center;
            width: 100%;
            border-top: 1px solid var(--border-color);
            margin-top: 20px;
        }
        
        .loading-spinner {
            margin-bottom: 15px;
        }
        
        .loading-dots {
            display: flex;
            gap: 6px;
            justify-content: center;
        }
        
        .loading-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #4facfe;
            animation: loadingBounce 1.4s infinite ease-in-out both;
        }
        
        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes loadingBounce {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
        }
        
        .no-common-groups, .error-message {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 30px 20px;
            color: var(--text-color);
            opacity: 0.7;
        }
        
        .no-common-groups i, .error-message i {
            font-size: 48px;
            margin-bottom: 15px;
            opacity: 0.5;
        }
        
        .message-title {
            font-weight: 600;
            font-size: 16px;
        }
        
        .message-subtitle {
            font-size: 14px;
            opacity: 0.8;
            text-align: center;
            max-width: 300px;
            line-height: 1.4;
        }
        
        .user-common-groups-card {
            background: var(--other-msg-bg);
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 20px;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            width: 100%;
            animation: slideInUp 0.4s ease forwards;
        }
        
        .user-common-groups-header {
            display: flex;
            align-items: flex-start;
            margin-bottom: 18px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .user-common-groups-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            margin-right: 15px;
            flex-shrink: 0;
            font-size: 18px;
        }
        
        .user-common-groups-info {
            flex: 1;
        }
        
        .user-common-groups-name {
            font-weight: bold;
            font-size: 17px;
            margin-bottom: 5px;
        }
        
        .user-common-groups-status {
            font-size: 13px;
            opacity: 0.7;
            margin-bottom: 8px;
        }
        
        .user-common-groups-count {
            font-size: 13px;
            opacity: 0.8;
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(79, 172, 254, 0.1);
            padding: 4px 10px;
            border-radius: 12px;
            width: fit-content;
        }
        
        .user-common-groups-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .common-group-item {
            display: flex;
            align-items: center;
            padding: 15px;
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            transition: all 0.3s ease;
            cursor: pointer;
            width: 100%;
            animation: slideInUp 0.5s ease forwards;
            opacity: 0;
            transform: translateY(10px);
            border: 1px solid transparent;
        }
        
        .common-group-item:hover {
            background: rgba(255,255,255,0.1);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            border-color: rgba(79, 172, 254, 0.3);
        }
        
        .common-group-avatar {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            flex-shrink: 0;
            overflow: hidden;
        }
        
        .common-group-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .common-group-avatar i {
            color: white;
            font-size: 18px;
        }
        
        .common-group-info {
            flex: 1;
            min-width: 0;
        }
        
        .common-group-name {
            font-weight: 600;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 15px;
        }
        
        .admin-badge {
            color: gold;
            font-size: 13px;
        }
        
        .public-badge {
            color: #4CAF50;
            font-size: 11px;
        }
        
        .private-badge {
            color: #FF9800;
            font-size: 11px;
        }
        
        .common-group-details {
            font-size: 13px;
            opacity: 0.7;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 4px;
        }
        
        .common-group-description {
            font-size: 12px;
            opacity: 0.6;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 4px;
            font-style: italic;
        }
        
        .common-group-join-btn {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
            font-size: 14px;
        }
        
        .common-group-join-btn:hover {
            opacity: 0.9;
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
        }
        
        /* Анимации */
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(15px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .user-common-groups-card {
                padding: 15px;
                margin-bottom: 15px;
            }
            
            .common-group-item {
                padding: 12px;
            }
            
            .user-common-groups-avatar {
                width: 45px;
                height: 45px;
                margin-right: 12px;
            }
            
            .common-group-avatar {
                width: 40px;
                height: 40px;
                margin-right: 12px;
            }
            
            .common-group-name {
                font-size: 14px;
            }
            
            .common-group-details {
                font-size: 12px;
            }
        }
        
        @media (max-width: 480px) {
            .common-groups-container {
                padding: 0 5px;
            }
            
            .user-common-groups-card {
                padding: 12px;
            }
            
            .common-group-item {
                padding: 10px;
            }
            
            .user-common-groups-avatar {
                width: 40px;
                height: 40px;
                margin-right: 10px;
                font-size: 16px;
            }
            
            .common-group-avatar {
                width: 35px;
                height: 35px;
                margin-right: 10px;
            }
            
            .common-group-join-btn {
                width: 35px;
                height: 35px;
                font-size: 12px;
            }
            
            .common-groups-header {
                padding: 10px;
                font-size: 14px;
            }
        }
        
        .light-theme .user-common-groups-card {
            background: rgba(255,255,255,0.95);
            border: 1px solid rgba(0,0,0,0.1);
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        
        .light-theme .common-group-item {
            background: rgba(0,0,0,0.03);
        }
        
        .light-theme .common-group-item:hover {
            background: rgba(0,0,0,0.06);
            border-color: rgba(79, 172, 254, 0.2);
        }
        
        .light-theme .user-common-groups-count {
            background: rgba(79, 172, 254, 0.15);
        }
    `;
    
    // Проверяем, не добавлены ли стили уже
    if (!document.getElementById('common-groups-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'common-groups-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        console.log("✅ Стили для общих групп добавлены");
    }
}

// Инициализация обработчиков событий для общих групп
function initCommonGroupsEventListeners() {
    console.log("🔗 Инициализация обработчиков событий...");
    
    // Делегирование событий для кнопок перехода в группы
    document.addEventListener('click', function(e) {
        // Клик по кнопке перехода
        if (e.target.closest('.common-group-join-btn')) {
            const groupItem = e.target.closest('.common-group-item');
            const groupId = groupItem.dataset.groupId;
            console.log("🎯 Переход в группу по кнопке:", groupId);
            openGroupFromSearch(groupId);
            return;
        }
        
        // Клик по карточке группы (но не по кнопке)
        if (e.target.closest('.common-group-item') && !e.target.closest('.common-group-join-btn')) {
            const groupItem = e.target.closest('.common-group-item');
            const groupId = groupItem.dataset.groupId;
            console.log("🎯 Переход в группу по карточке:", groupId);
            openGroupFromSearch(groupId);
            return;
        }
    });
    
    console.log("✅ Обработчики событий инициализированы");
}

// Открытие группы из поиска
function openGroupFromSearch(groupId) {
    console.log("🚪 Открываем группу:", groupId);
    
    database.ref('groups/' + groupId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const group = snapshot.val();
            console.log("✅ Группа найдена:", group.name);
            
            // Используем существующую функцию открытия группы
            if (typeof openGroupChat === 'function') {
                openGroupChat(groupId, group.name);
                showNotification(`🎯 Открыта группа "${group.name}"`);
            } else {
                console.log("❌ Функция openGroupChat не найдена");
                showNotification(`ℹ️ Группа "${group.name}" найдена`);
                
                // Альтернативный способ - переключиться на вкладку групп
                if (typeof switchToGroupsTab === 'function') {
                    switchToGroupsTab();
                }
            }
        } else {
            console.log("❌ Группа не найдена в базе");
            showNotification("❌ Группа не найдена или была удалена");
        }
    }).catch((error) => {
        console.error("❌ Ошибка открытия группы:", error);
        showNotification("❌ Ошибка открытия группы");
    });
}

// Вспомогательная функция для генерации цвета
function generateUserColor() {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Показ уведомления (запасной вариант)
function showNotification(message) {
    try {
        // Пробуем использовать существующую функцию уведомлений
        if (typeof showNotification === 'function' && window.showNotification !== showNotification) {
            window.showNotification(message);
            return;
        }
        
        // Создаем свое уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4facfe;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    } catch (error) {
        console.log("📢", message);
    }
}

// Очистка кэша поиска
function clearGroupSearchCache() {
    userSearchCache = {};
    commonGroupsCache = {};
    console.log("🧹 Кэш поиска групп очищен");
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

// Основная инициализация
function initializeGroupSearch() {
    console.log("🔧 Запуск инициализации поиска групп...");
    
    // Ждем готовности необходимых компонентов
    const checkReady = setInterval(() => {
        const isFirebaseReady = typeof database !== 'undefined';
        const isUserIdReady = typeof userId !== 'undefined' && userId;
        const isSearchElementsReady = document.getElementById('searchBtn') && document.getElementById('searchInput');
        
        if (isFirebaseReady && isUserIdReady && isSearchElementsReady) {
            clearInterval(checkReady);
            console.log("✅ Все компоненты готовы, инициализируем поиск групп");
            initGroupSearchByMembers();
        }
    }, 500);
    
    // Таймаут на случай если что-то пошло не так
    setTimeout(() => {
        clearInterval(checkReady);
        if (!isSearchInitialized) {
            console.log("⚠️ Принудительная инициализация через 5 секунд");
            initGroupSearchByMembers();
        }
    }, 5000);
}

// Запуск при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM загружен, запускаем инициализацию поиска групп");
    setTimeout(initializeGroupSearch, 1000);
});

// Запуск при полной загрузке страницы
window.addEventListener('load', function() {
    console.log("🖼️ Страница полностью загружена");
    if (!isSearchInitialized) {
        setTimeout(initializeGroupSearch, 500);
    }
});

// ==================== ТЕСТОВЫЕ ФУНКЦИИ ====================

// Ручная инициализация для отладки
window.initGroupSearchManual = function() {
    console.log("🔧 Ручная инициализация поиска групп");
    initializeGroupSearch();
};

// Тестовая функция поиска
window.testGroupSearch = function(username = "test") {
    console.log("🧪 Тестовый поиск для:", username);
    searchCommonGroups(username);
};

// Проверка состояния
window.checkGroupSearchStatus = function() {
    return {
        initialized: isSearchInitialized,
        firebase: typeof database !== 'undefined',
        userId: typeof userId !== 'undefined' && userId,
        searchElements: {
            searchBtn: !!document.getElementById('searchBtn'),
            searchInput: !!document.getElementById('searchInput'),
            usersList: !!document.getElementById('usersList')
        },
        cache: {
            userSearch: Object.keys(userSearchCache).length,
            commonGroups: Object.keys(commonGroupsCache).length
        }
    };
};

// Принудительный сброс
window.resetGroupSearch = function() {
    isSearchInitialized = false;
    clearGroupSearchCache();
    console.log("🔄 Поиск групп сброшен");
    initializeGroupSearch();
};

// Отладочная функция для проверки общих групп с конкретным пользователем
window.debugCommonGroups = function(userIdToCheck) {
    console.log("🐛 Отладочная проверка общих групп с пользователем:", userIdToCheck);
    
    database.ref('groups').once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("❌ Нет групп в базе");
            return;
        }
        
        const allGroups = snapshot.val();
        let userGroups = [];
        let targetUserGroups = [];
        
        // Группы текущего пользователя
        Object.keys(allGroups).forEach(groupId => {
            const group = allGroups[groupId];
            if (group.members && group.members[userId]) {
                userGroups.push(groupId);
            }
            if (group.members && group.members[userIdToCheck]) {
                targetUserGroups.push(groupId);
            }
        });
        
        console.log("👤 Группы текущего пользователя:", userGroups);
        console.log("🎯 Группы целевого пользователя:", targetUserGroups);
        
        // Общие группы
        const commonGroups = userGroups.filter(groupId => targetUserGroups.includes(groupId));
        console.log("👨‍👩‍👧‍👦 ОБЩИЕ ГРУППЫ:", commonGroups);
        
        // Детальная информация об общих группах
        commonGroups.forEach(groupId => {
            const group = allGroups[groupId];
            console.log(`🏢 ${group.name} (${groupId})`);
            console.log(`   👤 Ваша роль: ${group.members[userId]?.role}`);
            console.log(`   🎯 Роль друга: ${group.members[userIdToCheck]?.role}`);
        });
        
    }).catch(console.error);
};

console.log("📦 group-search-by-members.js загружен успешно! Версия 2.0");