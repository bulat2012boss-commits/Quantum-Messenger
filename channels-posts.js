// user-profiles.js

// Система просмотра профилей пользователей с био-информацией
let userProfilesInitialized = false;

// Инициализация системы профилей
function initUserProfilesSystem() {
    if (userProfilesInitialized) return;
    
    console.log("Инициализация системы просмотра профилей...");
    
    // Создаем модальное окно для просмотра профиля
    createUserProfileModal();
    
    // Добавляем обработчики для аватаров в списке пользователей
    setupUserListAvatars();
    
    // Добавляем обработчики для аватаров в списке чатов
    setupChatListAvatars();
    
    userProfilesInitialized = true;
    console.log("Система просмотра профилей инициализирована");
}

// Создание модального окна профиля
function createUserProfileModal() {
    const modalHTML = `
        <div class="modal" id="userProfileModal">
            <div class="modal-content">
                <div class="profile-modal-content">
                    <div class="profile-avatar" id="userProfileAvatar">
                        <span id="userProfileAvatarInitial">U</span>
                    </div>
                    <div class="profile-name" id="userProfileName">Пользователь</div>
                    <div class="profile-status" id="userProfileStatus" style="font-size: 14px; opacity: 0.7; margin-bottom: 15px;">
                        <i class="fas fa-circle" style="font-size: 10px; margin-right: 5px;"></i>Онлайн
                    </div>
                    
                    <!-- Блок с информацией "О себе" -->
                    <div class="profile-bio-section" id="userProfileBioSection" style="display: none;">
                        <div class="profile-bio-label" style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">О себе:</div>
                        <div class="profile-bio-text" id="userProfileBioText" style="
                            padding: 10px;
                            background: rgba(255,255,255,0.1);
                            border-radius: 8px;
                            font-size: 14px;
                            line-height: 1.4;
                            margin-bottom: 15px;
                            border-left: 3px solid #4facfe;
                        "></div>
                    </div>
                    
                    <div class="profile-info">
                        <div class="profile-info-item">
                            <span class="profile-info-label">Юзернейм:</span>
                            <span class="profile-info-value" id="userProfileUsername">user123</span>
                        </div>
                        <div class="profile-info-item">
                            <span class="profile-info-label">ID:</span>
                            <span class="profile-info-value" id="userProfileId">user-123</span>
                        </div>
                        <div class="profile-info-item">
                            <span class="profile-info-label">Зарегистрирован:</span>
                            <span class="profile-info-value" id="userProfileRegistered">Неизвестно</span>
                        </div>
                        <div class="profile-info-item">
                            <span class="profile-info-label">Последний онлайн:</span>
                            <span class="profile-info-value" id="userProfileLastOnline">Сейчас</span>
                        </div>
                    </div>
                    
                    <div class="profile-actions" id="userProfileActions">
                        <button class="profile-action-btn primary" id="startChatWithUserBtn">
                            <i class="fas fa-comments"></i> Написать сообщение
                        </button>
                        <button class="profile-action-btn secondary" id="blockUserProfileBtn">
                            <i class="fas fa-ban"></i> Заблокировать
                        </button>
                        <button class="profile-action-btn secondary" id="closeUserProfileBtn">
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Добавляем обработчики для модального окна
    document.getElementById('closeUserProfileBtn').addEventListener('click', closeUserProfile);
    document.getElementById('startChatWithUserBtn').addEventListener('click', startChatWithUser);
    document.getElementById('blockUserProfileBtn').addEventListener('click', blockUserFromProfile);
    
    // Закрытие при клике вне модального окна
    document.getElementById('userProfileModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeUserProfile();
        }
    });
}

// Настройка аватаров в списке пользователей
function setupUserListAvatars() {
    // Обработчик для делегирования событий на списке пользователей
    const usersList = document.getElementById('usersList');
    if (usersList) {
        usersList.addEventListener('click', function(e) {
            const avatar = e.target.closest('.user-item-avatar');
            if (avatar) {
                e.preventDefault();
                e.stopPropagation();
                
                const userItem = avatar.closest('.user-item');
                const userId = userItem.dataset.userId;
                showUserProfile(userId);
            }
        });
    }
}

// Настройка аватаров в списке чатов
function setupChatListAvatars() {
    // Обработчик для делегирования событий на списке чатов
    const chatsList = document.getElementById('chatsList');
    if (chatsList) {
        chatsList.addEventListener('click', function(e) {
            const avatar = e.target.closest('.chat-item-avatar');
            if (avatar) {
                e.preventDefault();
                e.stopPropagation();
                
                const chatItem = avatar.closest('.chat-item');
                const chatId = chatItem.dataset.chatId;
                
                // Получаем ID пользователя из чата
                if (typeof database !== 'undefined') {
                    database.ref('chats/' + chatId).once('value').then((snapshot) => {
                        if (snapshot.exists()) {
                            const chatData = snapshot.val();
                            let otherUserId = null;
                            
                            Object.keys(chatData.participants).forEach(participantId => {
                                if (participantId !== userId) {
                                    otherUserId = participantId;
                                }
                            });
                            
                            if (otherUserId) {
                                showUserProfile(otherUserId);
                            }
                        }
                    });
                }
            }
        });
    }
    
    // Также настраиваем аватар в заголовке активного чата
    const chatUserAvatar = document.getElementById('chatUserAvatar');
    if (chatUserAvatar) {
        // Сохраняем оригинальный обработчик если есть
        const originalOnClick = chatUserAvatar.onclick;
        
        chatUserAvatar.addEventListener('click', function(e) {
            if (currentChatWith) {
                e.preventDefault();
                e.stopPropagation();
                showUserProfile(currentChatWith);
            } else if (originalOnClick) {
                originalOnClick(e);
            }
        });
    }
}

// Показ профиля пользователя
function showUserProfile(targetUserId) {
    if (!targetUserId || targetUserId === userId) {
        console.log("Нельзя просмотреть свой профиль через эту функцию");
        return;
    }
    
    console.log("Загрузка профиля пользователя:", targetUserId);
    
    // Показываем загрузку
    const modal = document.getElementById('userProfileModal');
    const content = modal.querySelector('.profile-modal-content');
    const originalContent = content.innerHTML;
    
    content.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <p>Загрузка профиля...</p>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Загружаем данные пользователя из Firebase
    if (typeof database !== 'undefined') {
        database.ref('profiles/' + targetUserId).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                displayUserProfile(userData, targetUserId);
            } else {
                content.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                        <p>Профиль пользователя не найден</p>
                        <button class="modal-btn secondary" onclick="closeUserProfile()" style="margin-top: 20px;">Закрыть</button>
                    </div>
                `;
            }
        }).catch((error) => {
            console.error("Ошибка загрузки профиля:", error);
            content.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                    <p>Ошибка загрузки профиля</p>
                    <button class="modal-btn secondary" onclick="closeUserProfile()" style="margin-top: 20px;">Закрыть</button>
                </div>
            `;
        });
    }
}

// Отображение данных профиля
function displayUserProfile(userData, targetUserId) {
    const modal = document.getElementById('userProfileModal');
    const content = modal.querySelector('.profile-modal-content');
    
    // Основная информация
    const displayName = userData.username || userData.name || 'Пользователь';
    const userInitial = displayName.charAt(0).toUpperCase();
    const status = userData.status || 'online';
    const isOnline = userData.isOnline || false;
    
    // Загружаем био пользователя
    const userBio = userData.bio || '';
    
    // Форматируем даты
    const registeredDate = userData.registeredAt ? 
        new Date(userData.registeredAt).toLocaleDateString() : 'Неизвестно';
    
    const lastOnline = userData.lastOnline ? 
        (userData.isOnline ? 'Сейчас онлайн' : 
         `Был в сети ${formatLastSeen(userData.lastOnline)}`) : 'Неизвестно';
    
    // Статус текстом
    let statusText = 'Не в сети';
    let statusClass = 'offline';
    
    if (isOnline) {
        statusClass = status;
        switch(status) {
            case 'online':
                statusText = 'Онлайн';
                break;
            case 'away':
                statusText = 'Отошёл';
                break;
            case 'busy':
                statusText = 'Занят';
                break;
            default:
                statusText = 'Онлайн';
        }
    }
    
    // Собираем HTML
    content.innerHTML = `
        <div class="profile-avatar" id="userProfileAvatar">
            ${userData.avatar ? 
                `<img src="${userData.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Аватар">` : 
                `<span id="userProfileAvatarInitial">${userInitial}</span>`
            }
        </div>
        <div class="profile-name" id="userProfileName">${displayName}</div>
        <div class="profile-status ${statusClass}" id="userProfileStatus" style="font-size: 14px; margin-bottom: 15px;">
            <i class="fas fa-circle" style="font-size: 10px; margin-right: 5px;"></i>${statusText}
        </div>
        
        <!-- Блок с информацией "О себе" -->
        ${userBio ? `
        <div class="profile-bio-section" id="userProfileBioSection">
            <div class="profile-bio-label" style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">О себе:</div>
            <div class="profile-bio-text" id="userProfileBioText" style="
                padding: 10px;
                background: rgba(255,255,255,0.1);
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.4;
                margin-bottom: 15px;
                border-left: 3px solid #4facfe;
            ">${userBio}</div>
        </div>
        ` : ''}
        
        <div class="profile-info">
            <div class="profile-info-item">
                <span class="profile-info-label">Юзернейм:</span>
                <span class="profile-info-value" id="userProfileUsername">${displayName}</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">ID:</span>
                <span class="profile-info-value" id="userProfileId">${targetUserId}</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Зарегистрирован:</span>
                <span class="profile-info-value" id="userProfileRegistered">${registeredDate}</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Последний онлайн:</span>
                <span class="profile-info-value" id="userProfileLastOnline">${lastOnline}</span>
            </div>
        </div>
        
        <div class="profile-actions" id="userProfileActions">
            <button class="profile-action-btn primary" id="startChatWithUserBtn" data-user-id="${targetUserId}">
                <i class="fas fa-comments"></i> Написать сообщение
            </button>
            <button class="profile-action-btn secondary" id="blockUserProfileBtn" data-user-id="${targetUserId}">
                <i class="fas fa-ban"></i> Заблокировать
            </button>
            <button class="profile-action-btn secondary" id="closeUserProfileBtn">
                Закрыть
            </button>
        </div>
    `;
    
    // Обновляем обработчики
    document.getElementById('startChatWithUserBtn').addEventListener('click', startChatWithUser);
    document.getElementById('blockUserProfileBtn').addEventListener('click', blockUserFromProfile);
    document.getElementById('closeUserProfileBtn').addEventListener('click', closeUserProfile);
    
    // Сохраняем текущего пользователя для чата
    window.currentProfileUserId = targetUserId;
    window.currentProfileUserName = displayName;
}

// Запуск чата с пользователем
function startChatWithUser() {
    const targetUserId = window.currentProfileUserId;
    const targetUserName = window.currentProfileUserName;
    
    if (targetUserId && targetUserName) {
        closeUserProfile();
        
        // Если мы уже в чате, возвращаемся к списку
        if (chatWindow.style.display === 'flex') {
            backToChats();
        }
        
        // Открываем чат с пользователем
        setTimeout(() => {
            openChat(targetUserId, targetUserName);
        }, 300);
    }
}

// Блокировка пользователя из профиля
function blockUserFromProfile() {
    const targetUserId = window.currentProfileUserId;
    const targetUserName = window.currentProfileUserName;
    
    if (targetUserId && targetUserName) {
        if (confirm(`Вы уверены, что хотите заблокировать пользователя ${targetUserName}?`)) {
            // Здесь должна быть логика блокировки пользователя
            showNotification(`Пользователь ${targetUserName} заблокирован`);
            closeUserProfile();
            
            // TODO: Реализовать логику блокировки в базе данных
            console.log("Блокировка пользователя:", targetUserId);
        }
    }
}

// Закрытие профиля пользователя
function closeUserProfile() {
    const modal = document.getElementById('userProfileModal');
    modal.classList.remove('active');
    window.currentProfileUserId = null;
    window.currentProfileUserName = null;
}

// Форматирование времени последнего посещения
function formatLastSeen(timestamp) {
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diff = now - lastSeen;
    
    if (diff < 60000) { // Меньше минуты
        return 'только что';
    } else if (diff < 3600000) { // Меньше часа
        const minutes = Math.floor(diff / 60000);
        return `${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'} назад`;
    } else if (diff < 86400000) { // Меньше суток
        const hours = Math.floor(diff / 3600000);
        return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} назад`;
    } else if (diff < 604800000) { // Меньше недели
        const days = Math.floor(diff / 86400000);
        return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} назад`;
    } else {
        return lastSeen.toLocaleDateString();
    }
}

// Добавляем CSS стили для системы профилей
function addUserProfileStyles() {
    if (document.getElementById('user-profile-styles')) return;

    const styles = `
    <style id="user-profile-styles">
    .profile-status.online { color: #4CAF50; }
    .profile-status.away { color: #FF9800; }
    .profile-status.busy { color: #F44336; }
    .profile-status.offline { color: #9E9E9E; }

    .profile-status i {
        font-size: 10px;
        margin-right: 5px;
    }

    .profile-bio-section {
        animation: fadeIn 0.3s ease;
    }

    .profile-bio-text {
        word-wrap: break-word;
        white-space: pre-wrap;
    }

    .light-theme .profile-bio-text {
        background: rgba(0, 0, 0, 0.05) !important;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Адаптивность для мобильных */
    @media (max-width: 480px) {
        .profile-bio-text {
            font-size: 13px !important;
            padding: 8px !important;
        }
        
        .profile-bio-label {
            font-size: 11px !important;
        }
    }
    </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен, инициализируем систему профилей...");
    
    // Добавляем стили
    addUserProfileStyles();
    
    // Ждем полной загрузки страницы
    setTimeout(() => {
        initUserProfilesSystem();
    }, 2000);
});

// Также инициализируем когда пользователь входит в систему
const originalEnterChat = window.enterChat;
window.enterChat = function() {
    if (originalEnterChat) originalEnterChat();
    setTimeout(initUserProfilesSystem, 1000);
};

// Функция показа уведомления (если не существует)
if (typeof showNotification === 'undefined') {
    window.showNotification = function(message) {
        console.log("Уведомление:", message);
        // Создаем простое уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4facfe;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    };
}

console.log("User profiles system script loaded");