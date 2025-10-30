// usernames.js - Система юзернеймов для Quantum Messenger

// Глобальные переменные для системы юзернеймов
let userUsername = '';
let usernameLink = '';

// Инициализация системы юзернеймов
function initUsernameSystem() {
    // Загружаем сохраненный юзернейм
    loadUserUsername();
    
    // Добавляем обработчики событий
    initUsernameEventListeners();
    
    // Обновляем интерфейс
    updateUsernameUI();
    
    // Обработчик глубоких ссылок
    handleDeepLinks();
    
    // Инициализируем кликабельные юзернеймы
    initClickableUsernames();
}

// Загрузка юзернейма пользователя
function loadUserUsername() {
    const savedUsername = localStorage.getItem('quantumUsernameValue');
    if (savedUsername) {
        userUsername = savedUsername;
        usernameLink = `quantum://profile/${userUsername}`;
    }
}

// Инициализация обработчиков событий
function initUsernameEventListeners() {
    // Добавляем пункт меню для управления юзернеймом
    addUsernameMenuItem();
    
    // Добавляем обработчики для модального окна юзернейма
    document.addEventListener('click', function(e) {
        if (e.target.id === 'usernameSettingsBtn') {
            showUsernameModal();
        }
        if (e.target.id === 'saveUsernameBtn') {
            saveUsername();
        }
        if (e.target.id === 'closeUsernameBtn') {
            closeUsernameModal();
        }
        if (e.target.id === 'generateUsernameBtn') {
            generateSuggestedUsername();
        }
        if (e.target.id === 'copyUsernameLinkBtn') {
            copyUsernameLink();
        }
        if (e.target.id === 'openUsernameLinkBtn') {
            openUsernameLink();
        }
    });
}

// Добавление пункта меню для юзернейма
function addUsernameMenuItem() {
    const burgerMenuContent = document.getElementById('burgerMenuContent');
    
    // Проверяем, не добавлен ли уже пункт
    if (document.getElementById('usernameSettingsBtn')) {
        return;
    }
    
    const usernameMenuItem = document.createElement('div');
    usernameMenuItem.className = 'burger-menu-item';
    usernameMenuItem.id = 'usernameSettingsBtn';
    usernameMenuItem.innerHTML = '<i class="fas fa-at"></i> Мой юзернейм';
    
    // Вставляем после пункта "Профиль"
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn && profileBtn.nextSibling) {
        burgerMenuContent.insertBefore(usernameMenuItem, profileBtn.nextSibling);
    } else {
        burgerMenuContent.appendChild(usernameMenuItem);
    }
}

// Создание модального окна для управления юзернеймом
function createUsernameModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'usernameModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Мой юзернейм</h3>
            
            <div class="settings-section">
                <h4><i class="fas fa-at"></i> Ваш уникальный юзернейм</h4>
                <p style="margin-bottom: 10px; font-size: 14px; opacity: 0.8;">
                    Создайте юзернейм, чтобы другие пользователи могли найти вас без номера телефона
                </p>
                
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <input type="text" id="usernameInputField" placeholder="ваш_юзернейм" 
                           style="flex: 1; padding: 10px; background: rgba(255,255,255,0.1); 
                                  border: 1px solid var(--border-color); border-radius: 8px; 
                                  color: var(--text-color); outline: none;">
                    <button id="generateUsernameBtn" class="modal-btn secondary" 
                            style="white-space: nowrap;">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
                
                <div id="usernameAvailability" style="font-size: 13px; margin-bottom: 15px;"></div>
                
                <div id="usernameLinkContainer" style="${userUsername ? '' : 'display: none;'}">
                    <h4><i class="fas fa-link"></i> Ваша ссылка для профиля</h4>
                    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                        <div style="flex: 1; padding: 12px; background: rgba(255,255,255,0.1); 
                             border: 1px solid var(--border-color); border-radius: 8px; 
                             font-size: 14px; cursor: pointer; display: flex; align-items: center;" 
                             id="usernameLinkDisplay">
                            <i class="fas fa-user" style="margin-right: 10px; opacity: 0.7;"></i>
                            <span>quantum://profile/${userUsername}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <button id="copyUsernameLinkBtn" class="modal-btn primary" style="flex: 1;">
                            <i class="fas fa-copy"></i> Копировать ссылку
                        </button>
                        <button id="openUsernameLinkBtn" class="modal-btn secondary" style="flex: 1;">
                            <i class="fas fa-external-link-alt"></i> Открыть профиль
                        </button>
                    </div>
                    <p style="font-size: 12px; opacity: 0.7;">
                        Поделитесь этой ссылкой. При переходе откроется ваш профиль в Quantum Messenger
                    </p>
                </div>
            </div>
            
            <div class="settings-section">
                <h4><i class="fas fa-share-alt"></i> Альтернативные способы</h4>
                <p style="font-size: 14px; opacity: 0.8; margin-bottom: 10px;">
                    Если вы предпочитаете не использовать юзернейм, вы можете поделиться своим ID:
                </p>
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                    <input type="text" id="userIdField" readonly 
                           style="flex: 1; padding: 10px; background: rgba(255,255,255,0.1); 
                                  border: 1px solid var(--border-color); border-radius: 8px; 
                                  color: var(--text-color); font-size: 14px;">
                    <button id="copyUserIdBtn" class="modal-btn primary" 
                            style="padding: 10px 15px;">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                    <div style="flex: 1; padding: 12px; background: rgba(255,255,255,0.1); 
                         border: 1px solid var(--border-color); border-radius: 8px; 
                         font-size: 14px; display: flex; align-items: center;">
                        <i class="fas fa-user" style="margin-right: 10px; opacity: 0.7;"></i>
                        <span>quantum://user/${userId}</span>
                    </div>
                    <button id="copyUserLinkBtn" class="modal-btn primary" 
                            style="padding: 10px 15px;">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            
            <div class="modal-buttons">
                <button class="modal-btn primary" id="saveUsernameBtn">
                    <i class="fas fa-save"></i> Сохранить юзернейм
                </button>
                ${userUsername ? '<button class="modal-btn danger" id="removeUsernameBtn" style="background: #ff6b6b;"><i class="fas fa-trash"></i> Удалить юзернейм</button>' : ''}
                <button class="modal-btn secondary" id="closeUsernameBtn">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем обработчик для проверки доступности юзернейма
    const usernameInput = document.getElementById('usernameInputField');
    usernameInput.addEventListener('input', checkUsernameAvailability);
    
    // Добавляем обработчик для копирования ID
    document.getElementById('copyUserIdBtn').addEventListener('click', copyUserId);
    
    // Добавляем обработчик для копирования ссылки пользователя
    document.getElementById('copyUserLinkBtn').addEventListener('click', copyUserLink);
    
    // Добавляем обработчик для удаления юзернейма
    if (userUsername) {
        document.getElementById('removeUsernameBtn').addEventListener('click', removeUsername);
    }
    
    // Добавляем обработчик клика на отображение ссылки
    document.getElementById('usernameLinkDisplay').addEventListener('click', openUsernameLink);
}

// Показ модального окна юзернейма
function showUsernameModal() {
    if (!document.getElementById('usernameModal')) {
        createUsernameModal();
    }
    
    const modal = document.getElementById('usernameModal');
    const usernameInput = document.getElementById('usernameInputField');
    const usernameLinkDisplay = document.getElementById('usernameLinkDisplay');
    const userIdField = document.getElementById('userIdField');
    const usernameLinkContainer = document.getElementById('usernameLinkContainer');
    
    // Заполняем текущие данные
    usernameInput.value = userUsername;
    userIdField.value = userId;
    
    // Обновляем ссылку
    if (userUsername) {
        usernameLink = `quantum://profile/${userUsername}`;
        usernameLinkDisplay.innerHTML = `<i class="fas fa-user" style="margin-right: 10px; opacity: 0.7;"></i><span>${usernameLink}</span>`;
        usernameLinkContainer.style.display = 'block';
    } else {
        usernameLinkContainer.style.display = 'none';
    }
    
    // Проверяем доступность текущего юзернейма
    if (userUsername) {
        checkUsernameAvailability();
    }
    
    modal.classList.add('active');
    burgerMenuContent.classList.remove('active');
}

// Закрытие модального окна юзернейма
function closeUsernameModal() {
    const modal = document.getElementById('usernameModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Открытие ссылки юзернейма (внутри приложения)
function openUsernameLink() {
    if (!userUsername) return;
    
    // Показываем собственный профиль
    showProfile();
    showNotification('Открыт ваш профиль');
}

// Показ профиля пользователя по юзернейму
function showUserProfileByUsername(username) {
    // Ищем пользователя по юзернейму
    database.ref('usernames').once('value').then((snapshot) => {
        const usernames = snapshot.val();
        
        if (usernames && usernames[username]) {
            const userId = usernames[username];
            
            // Получаем данные пользователя
            database.ref('profiles/' + userId).once('value').then((profileSnapshot) => {
                if (profileSnapshot.exists()) {
                    const user = profileSnapshot.val();
                    showUserProfileModal(userId, user.name, user);
                } else {
                    showNotification('Пользователь не найден');
                }
            });
        } else {
            showNotification('Пользователь с таким юзернеймом не найден');
        }
    });
}

// Показ модального окна профиля пользователя
function showUserProfileModal(userId, userName, userData) {
    // Создаем модальное окно профиля пользователя
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'userProfileModal';
    
    const statusText = userData.isOnline ? 
        (userData.status === 'online' ? 'Онлайн' : 
         userData.status === 'away' ? 'Отошёл' : 
         userData.status === 'busy' ? 'Занят' : 'Не в сети') : 'Не в сети';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="profile-modal-content">
                <div class="profile-avatar" style="background: ${generateUserColor()}">
                    ${userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div class="profile-name">${userName}</div>
                ${userData.username ? `<div style="color: #4facfe; margin-bottom: 10px; font-size: 16px;">@${userData.username}</div>` : ''}
                <div style="font-size: 14px; opacity: 0.7; margin-bottom: 15px;">${statusText}</div>
                
                <div class="profile-info">
                    <div class="profile-info-item">
                        <span class="profile-info-label">ID:</span>
                        <span class="profile-info-value">${userId.substring(0, 8)}...</span>
                    </div>
                    ${userData.lastOnline ? `
                    <div class="profile-info-item">
                        <span class="profile-info-label">Был в сети:</span>
                        <span class="profile-info-value">${formatLastSeen(userData.lastOnline)}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="profile-actions">
                    <button class="profile-action-btn primary" id="startChatWithUserBtn">
                        <i class="fas fa-comment"></i> Написать сообщение
                    </button>
                    <button class="profile-action-btn secondary" id="closeUserProfileBtn">
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
    
    // Обработчики для модального окна
    document.getElementById('startChatWithUserBtn').addEventListener('click', function() {
        openChat(userId, userName);
        modal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    document.getElementById('closeUserProfileBtn').addEventListener('click', function() {
        modal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
}

// Обработчик глубоких ссылок
function handleDeepLinks() {
    // Обработка URL параметров для глубоких ссылок
    const urlParams = new URLSearchParams(window.location.search);
    const profileUsername = urlParams.get('profile');
    const userIdParam = urlParams.get('user');
    
    if (profileUsername) {
        // Открываем профиль по юзернейму
        showUserProfileByUsername(profileUsername);
    } else if (userIdParam) {
        // Открываем профиль по ID
        database.ref('profiles/' + userIdParam).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                const user = snapshot.val();
                showUserProfileModal(userIdParam, user.name, user);
            }
        });
    }
}

// Генерация глубокой ссылки
function generateDeepLink(type, value) {
    const currentUrl = window.location.origin + window.location.pathname;
    return `${currentUrl}?${type}=${value}`;
}

// Проверка доступности юзернейма
function checkUsernameAvailability() {
    const usernameInput = document.getElementById('usernameInputField');
    const availabilityDiv = document.getElementById('usernameAvailability');
    const username = usernameInput.value.trim().toLowerCase();
    
    if (username === '') {
        availabilityDiv.innerHTML = '';
        return;
    }
    
    // Проверяем формат юзернейма
    const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;
    if (!usernameRegex.test(username)) {
        availabilityDiv.innerHTML = '<span style="color: #ff6b6b;"><i class="fas fa-times-circle"></i> Юзернейм может содержать только буквы, цифры и нижнее подчеркивание (5-20 символов)</span>';
        return;
    }
    
    // Проверяем зарезервированные юзернеймы
    const reservedUsernames = ['admin', 'support', 'quantum', 'messenger', 'system', 'null', 'undefined', 'help', 'info'];
    if (reservedUsernames.includes(username)) {
        availabilityDiv.innerHTML = '<span style="color: #ff6b6b;"><i class="fas fa-times-circle"></i> Этот юзернейм зарезервирован</span>';
        return;
    }
    
    // Проверяем доступность в базе данных
    database.ref('usernames').once('value').then((snapshot) => {
        const usernames = snapshot.val();
        
        if (usernames && usernames[username]) {
            // Юзернейм занят
            if (usernames[username] === userId) {
                availabilityDiv.innerHTML = '<span style="color: #4CAF50;"><i class="fas fa-check-circle"></i> Это ваш текущий юзернейм</span>';
            } else {
                availabilityDiv.innerHTML = '<span style="color: #ff6b6b;"><i class="fas fa-times-circle"></i> Этот юзернейм уже занят</span>';
            }
        } else {
            // Юзернейм доступен
            availabilityDiv.innerHTML = '<span style="color: #4CAF50;"><i class="fas fa-check-circle"></i> Этот юзернейм доступен</span>';
        }
    });
}

// Генерация предложенного юзернейма
function generateSuggestedUsername() {
    const adjectives = ['космический', 'квантовый', 'быстрый', 'умный', 'секретный', 'невероятный', 'супер', 'мега', 'ультра', 'гипер'];
    const nouns = ['путешественник', 'исследователь', 'герой', 'новатор', 'гений', 'профи', 'мастер', 'эксперт', 'лидер', 'чемпион'];
    const numbers = Math.floor(Math.random() * 1000);
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    const suggestedUsername = `${adjective}_${noun}_${numbers}`.toLowerCase();
    
    const usernameInput = document.getElementById('usernameInputField');
    usernameInput.value = suggestedUsername;
    
    // Проверяем доступность сгенерированного юзернейма
    setTimeout(() => {
        checkUsernameAvailability();
    }, 100);
}

// Сохранение юзернейма
function saveUsername() {
    const usernameInput = document.getElementById('usernameInputField');
    const username = usernameInput.value.trim().toLowerCase();
    
    if (username === '') {
        // Удаляем юзернейм
        removeUsername();
        return;
    }
    
    // Проверяем формат
    const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;
    if (!usernameRegex.test(username)) {
        showNotification('Юзернейм может содержать только буквы, цифры и нижнее подчеркивание (5-20 символов)');
        return;
    }
    
    // Проверяем доступность
    database.ref('usernames').once('value').then((snapshot) => {
        const usernames = snapshot.val();
        
        if (usernames && usernames[username] && usernames[username] !== userId) {
            showNotification('Этот юзернейм уже занят. Попробуйте другой.');
            return;
        }
        
        // Сохраняем юзернейм
        const updates = {};
        updates['usernames/' + username] = userId;
        updates['profiles/' + userId + '/username'] = username;
        
        // Если был старый юзернейм, удаляем его
        if (userUsername && userUsername !== username) {
            updates['usernames/' + userUsername] = null;
        }
        
        database.ref().update(updates).then(() => {
            userUsername = username;
            usernameLink = `quantum://profile/${username}`;
            
            // Сохраняем в локальное хранилище
            localStorage.setItem('quantumUsernameValue', username);
            
            // Обновляем интерфейс
            updateUsernameUI();
            
            showNotification('Юзернейм успешно сохранен!');
            closeUsernameModal();
        }).catch((error) => {
            console.error('Ошибка сохранения юзернейма:', error);
            showNotification('Ошибка сохранения юзернейма');
        });
    });
}

// Удаление юзернейма
function removeUsername() {
    if (!userUsername) return;
    
    const updates = {};
    updates['usernames/' + userUsername] = null;
    updates['profiles/' + userId + '/username'] = null;
    
    database.ref().update(updates).then(() => {
        userUsername = '';
        usernameLink = '';
        
        // Удаляем из локального хранилища
        localStorage.removeItem('quantumUsernameValue');
        
        // Обновляем интерфейс
        updateUsernameUI();
        
        showNotification('Юзернейм удален');
        closeUsernameModal();
    }).catch((error) => {
        console.error('Ошибка удаления юзернейма:', error);
        showNotification('Ошибка удаления юзернейма');
    });
}

// Копирование ссылки юзернейма
function copyUsernameLink() {
    if (!usernameLink) return;
    
    const deepLink = generateDeepLink('profile', userUsername);
    const tempInput = document.createElement('input');
    tempInput.value = deepLink;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    showNotification('Ссылка скопирована в буфер обмена');
}

// Копирование ID пользователя
function copyUserId() {
    const tempInput = document.createElement('input');
    tempInput.value = userId;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    showNotification('ID пользователя скопирован в буфер обмена');
}

// Копирование ссылки пользователя
function copyUserLink() {
    const deepLink = generateDeepLink('user', userId);
    const tempInput = document.createElement('input');
    tempInput.value = deepLink;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    showNotification('Ссылка профиля скопирована в буфер обмена');
}

// Форматирование времени последнего посещения
function formatLastSeen(timestamp) {
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diff = now - lastSeen;
    
    if (diff < 60000) { // Меньше минуты
        return 'только что';
    } else if (diff < 3600000) { // Меньше часа
        return Math.floor(diff / 60000) + ' мин назад';
    } else if (diff < 86400000) { // Меньше суток
        return Math.floor(diff / 3600000) + ' ч назад';
    } else {
        return lastSeen.toLocaleDateString();
    }
}

// Обновление интерфейса
function updateUsernameUI() {
    // Обновляем поле ввода поиска
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = 'Введите юзернейм или имя пользователя...';
    }
    
    // Добавляем юзернейм в профиль, если он есть
    updateProfileWithUsername();
}

// Обновление профиля с отображением юзернейма
function updateProfileWithUsername() {
    // Обновляем модальное окно профиля, если оно открыто
    const profileModal = document.getElementById('profileModal');
    if (profileModal && profileModal.classList.contains('active')) {
        const profileInfo = document.querySelector('.profile-info');
        if (profileInfo && !document.getElementById('usernameProfileItem')) {
            const usernameItem = document.createElement('div');
            usernameItem.className = 'profile-info-item';
            usernameItem.id = 'usernameProfileItem';
            usernameItem.innerHTML = `
                <span class="profile-info-label">Юзернейм:</span>
                <span class="profile-info-value">
                    ${userUsername ? 
                        `<span style="color: #4facfe;">@${userUsername}</span>` : 
                        '<span style="opacity: 0.7;">не установлен</span>'
                    }
                </span>
            `;
            // Вставляем после первого элемента (юзернейм)
            const firstItem = profileInfo.querySelector('.profile-info-item');
            profileInfo.insertBefore(usernameItem, firstItem);
        }
    }
}

// Модификация функции поиска для поддержки юзернеймов
function modifySearchForUsernames() {
    const originalPerformSearch = window.performSearch;
    
    window.performSearch = function() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm) {
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
            
            // Ищем пользователей по юзернейму или имени
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
                    
                    // Пропускаем текущего пользователя
                    if (userKey === userId) return;
                    
                    // Проверяем совпадение по юзернейму или имени
                    const userUsername = (user.username || '').toLowerCase();
                    const userName = (user.name || '').toLowerCase();
                    
                    if (userUsername.includes(searchTerm) || userName.includes(searchTerm)) {
                        foundUsers = true;
                        addUserToList(userKey, user);
                    }
                });
                
                if (!foundUsers) {
                    usersList.innerHTML = '<div class="empty-chat"><i class="fas fa-users"></i><p>Пользователи не найдены</p></div>';
                }
            }).catch((error) => {
                console.error("Ошибка поиска:", error);
                usersList.innerHTML = '<div class="empty-chat"><i class="fas fa-exclamation-triangle"></i><p>Ошибка поиска</p></div>';
            });
        } else {
            showNotification("Введите юзернейм или имя для поиска");
        }
    };
}

// Модификация функции добавления пользователя в список для отображения юзернейма
function modifyAddUserToList() {
    const originalAddUserToList = window.addUserToList;
    
    window.addUserToList = function(userId, user) {
        const userItem = document.createElement('div');
        userItem.classList.add('user-item');
        userItem.dataset.userId = userId;
        
        const displayName = user.username || user.name;
        const statusClass = user.isOnline ? 'online' : 'offline';
        const statusText = user.isOnline ? 'Онлайн' : 'Оффлайн';
        const usernameDisplay = user.username ? `<div style="font-size: 12px; opacity: 0.7; margin-top: 2px;">@${user.username}</div>` : '';
        
        userItem.innerHTML = `
            <div class="user-item-avatar" style="background: ${generateUserColor()}">
                ${displayName ? displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div class="user-item-info">
                <div class="user-item-name">${displayName}</div>
                ${usernameDisplay}
                <div class="user-item-status ${statusClass}">${statusText}</div>
            </div>
        `;
        
        userItem.addEventListener('click', () => {
            openChat(userId, displayName);
        });
        
        usersList.appendChild(userItem);
    };
}

// Инициализация кликабельных юзернеймов в сообщениях
function initClickableUsernames() {
    // Перехватываем отображение сообщений
    const originalAddMessageToChat = window.addMessageToChat;
    
    window.addMessageToChat = function(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        if (message.senderId === userId) {
            messageElement.classList.add('my-message');
        } else {
            messageElement.classList.add('other-message');
        }
        
        const date = new Date(message.timestamp);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Обрабатываем текст для кликабельных юзернеймов
        let messageText = message.text || '';
        
        // Заменяем @юзернеймы на кликабельные ссылки
        messageText = messageText.replace(/@(\w{5,20})/g, '<span class="username-link" data-username="$1" onclick="usernameSystem.openUserProfile(\'$1\')">@$1</span>');
        
        // Заменяем quantum:// ссылки на кликабельные
        messageText = messageText.replace(/quantum:\/\/profile\/(\w{5,20})/g, '<span class="quantum-link" data-username="$1" onclick="usernameSystem.openUserProfile(\'$1\')">quantum://profile/$1</span>');
        
        // Заменяем quantum://user/ ссылки на кликабельные
        messageText = messageText.replace(/quantum:\/\/user\/([\w-]+)/g, '<span class="quantum-link" data-userid="$1" onclick="usernameSystem.openUserProfileById(\'$1\')">quantum://user/$1</span>');
        
        messageElement.innerHTML = `
            ${message.senderId !== userId ? `<div class="sender">${message.senderName}</div>` : ''}
            <div class="message-content">${messageText}</div>
            <div class="timestamp">${timeString}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
    };
}

// Открытие профиля по юзернейму
function openUserProfile(username) {
    showUserProfileByUsername(username);
}

// Открытие профиля по ID пользователя
function openUserProfileById(userId) {
    database.ref('profiles/' + userId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const user = snapshot.val();
            showUserProfileModal(userId, user.name, user);
        } else {
            showNotification('Пользователь не найден');
        }
    });
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Ждем инициализации Firebase и других систем
    setTimeout(() => {
        if (typeof firebase !== 'undefined' && userId) {
            initUsernameSystem();
            modifySearchForUsernames();
            modifyAddUserToList();
        }
    }, 1000);
});

// Экспортируем функции для использования в других модулях
window.usernameSystem = {
    init: initUsernameSystem,
    getUsername: () => userUsername,
    getUsernameLink: () => usernameLink,
    openUsernameLink: openUsernameLink,
    openUserProfile: openUserProfile,
    openUserProfileById: openUserProfileById,
    showUserProfileByUsername: showUserProfileByUsername
};