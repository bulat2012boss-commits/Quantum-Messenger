// profile-pages.js
// Этот файл заменяет модальные окна профилей на полноэкранные страницы

document.addEventListener('DOMContentLoaded', function() {
    // Создаем контейнер для полноэкранных профилей
    const profilePagesContainer = document.createElement('div');
    profilePagesContainer.id = 'profile-pages-container';
    profilePagesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--primary-bg);
        z-index: 3000;
        overflow-y: auto;
        display: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    document.body.appendChild(profilePagesContainer);

    // Стили для полноэкранных профилей
    const style = document.createElement('style');
    style.textContent = `
        .profile-page {
            min-height: 100vh;
            padding: 20px 15px;
            background: var(--primary-bg);
            color: var(--text-color);
            display: flex;
            flex-direction: column;
        }
        
        .profile-header {
            display: flex;
            align-items: center;
            padding: 15px 0;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .profile-back-btn {
            background: none;
            border: none;
            color: var(--text-color);
            font-size: 20px;
            margin-right: 15px;
            padding: 8px;
            border-radius: 50%;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
        }
        
        .profile-back-btn:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .profile-title {
            font-size: 18px;
            font-weight: bold;
        }
        
        .profile-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .profile-avatar-large {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: linear-gradient(to right, #4facfe, #00f2fe);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 20px;
            overflow: hidden;
        }
        
        .profile-name-large {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .profile-info-section {
            width: 100%;
            max-width: 500px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid var(--border-color);
        }
        
        .profile-info-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .profile-info-item:last-child {
            border-bottom: none;
        }
        
        .profile-info-label {
            font-weight: 500;
            opacity: 0.8;
        }
        
        .profile-info-value {
            font-weight: 600;
            text-align: right;
        }
        
        .profile-actions {
            display: flex;
            gap: 10px;
            width: 100%;
            max-width: 500px;
            margin-top: 20px;
        }
        
        .profile-action-btn {
            flex: 1;
            padding: 12px;
            border-radius: 8px;
            border: none;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .profile-action-btn.primary {
            background: linear-gradient(to right, #4facfe, #00f2fe);
            color: white;
        }
        
        .profile-action-btn.secondary {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-color);
        }
        
        .profile-action-btn:hover {
            opacity: 0.9;
            transform: translateY(-2px);
        }
        
        .profile-username-input {
            background: transparent;
            border: none;
            color: var(--text-color);
            text-align: right;
            outline: none;
            font-size: 16px;
            width: 60%;
            padding: 5px;
            border-radius: 4px;
            transition: background 0.2s;
        }
        
        .profile-username-input:focus {
            background: rgba(255, 255, 255, 0.1);
        }
        
        /* Адаптация для мобильных устройств */
        @media (max-width: 480px) {
            .profile-page {
                padding: 15px 10px;
            }
            
            .profile-avatar-large {
                width: 80px;
                height: 80px;
                font-size: 28px;
            }
            
            .profile-name-large {
                font-size: 20px;
            }
            
            .profile-info-section {
                padding: 15px;
            }
            
            .profile-actions {
                flex-direction: column;
            }
        }
        
        /* Анимация появления */
        @keyframes slideInFromRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .profile-page-active {
            animation: slideInFromRight 0.3s ease forwards;
        }
    `;
    document.head.appendChild(style);

    // Функция для показа собственного профиля
    function showMyProfilePage() {
        // Скрываем модальное окно профиля, если оно открыто
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            profileModal.classList.remove('active');
        }
        
        // Скрываем бургер-меню
        const burgerMenuContent = document.getElementById('burgerMenuContent');
        if (burgerMenuContent) {
            burgerMenuContent.classList.remove('active');
        }
        
        // Создаем содержимое профиля
        profilePagesContainer.innerHTML = `
            <div class="profile-page profile-page-active">
                <div class="profile-header">
                    <button class="profile-back-btn" id="profilePageBackBtn">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="profile-title">Мой профиль</div>
                </div>
                
                <div class="profile-content">
                    <div class="profile-avatar-large" id="profilePageAvatar" style="background: ${userColor || '#4facfe'}">
                        <span id="profilePageAvatarInitial">${currentUser ? currentUser.charAt(0).toUpperCase() : 'U'}</span>
                    </div>
                    
                    <div class="profile-name-large" id="profilePageName">${currentUser || 'Пользователь'}</div>
                    
                    <div class="profile-info-section">
                        <div class="profile-info-item">
                            <span class="profile-info-label">Юзернейм:</span>
                            <input type="text" class="profile-username-input" id="profilePageUsernameInput" value="${currentUser || ''}">
                        </div>
                        <div class="profile-info-item">
                            <span class="profile-info-label">ID:</span>
                            <span class="profile-info-value" id="profilePageId">${userId || 'Неизвестно'}</span>
                        </div>
                        <div class="profile-info-item">
                            <span class="profile-info-label">Статус:</span>
                            <span class="profile-info-value" id="profilePageStatus">${userStatus === 'online' ? 'Онлайн' : 
                                                                                   userStatus === 'away' ? 'Отошёл' : 
                                                                                   userStatus === 'busy' ? 'Занят' : 'Не в сети'}</span>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="profile-action-btn primary" id="profilePageSaveBtn">
                            <i class="fas fa-save"></i> Сохранить
                        </button>
                        <button class="profile-action-btn secondary" id="profilePageEditStatusBtn">
                            <i class="fas fa-edit"></i> Изменить статус
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Показываем контейнер
        profilePagesContainer.style.display = 'block';
        setTimeout(() => {
            profilePagesContainer.style.opacity = '1';
        }, 10);
        
        // Загружаем данные профиля из базы данных
        if (userId) {
            database.ref('profiles/' + userId).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    const profile = snapshot.val();
                    const usernameInput = document.getElementById('profilePageUsernameInput');
                    if (usernameInput && profile.username) {
                        usernameInput.value = profile.username;
                    }
                }
            });
        }
        
        // Добавляем обработчики событий
        document.getElementById('profilePageBackBtn').addEventListener('click', hideProfilePage);
        document.getElementById('profilePageSaveBtn').addEventListener('click', saveProfileFromPage);
        document.getElementById('profilePageEditStatusBtn').addEventListener('click', showStatusModal);
    }

    // Функция для показа профиля другого пользователя
    function showOtherUserProfilePage(userId, userName) {
        // Создаем содержимое профиля
        profilePagesContainer.innerHTML = `
            <div class="profile-page profile-page-active">
                <div class="profile-header">
                    <button class="profile-back-btn" id="profilePageBackBtn">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="profile-title">Профиль пользователя</div>
                </div>
                
                <div class="profile-content">
                    <div class="profile-avatar-large" id="otherProfilePageAvatar" style="background: ${generateUserColor ? generateUserColor() : '#4facfe'}">
                        <span id="otherProfilePageAvatarInitial">${userName ? userName.charAt(0).toUpperCase() : 'U'}</span>
                    </div>
                    
                    <div class="profile-name-large" id="otherProfilePageName">${userName || 'Пользователь'}</div>
                    
                    <div class="profile-info-section">
                        <div class="profile-info-item">
                            <span class="profile-info-label">Имя:</span>
                            <span class="profile-info-value" id="otherProfilePageUsername">${userName || 'Неизвестно'}</span>
                        </div>
                        <div class="profile-info-item">
                            <span class="profile-info-label">Статус:</span>
                            <span class="profile-info-value" id="otherProfilePageStatus">Загрузка...</span>
                        </div>
                        <div class="profile-info-item">
                            <span class="profile-info-label">Был(а) в сети:</span>
                            <span class="profile-info-value" id="otherProfilePageLastSeen">Загрузка...</span>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="profile-action-btn primary" id="otherProfilePageMessageBtn">
                            <i class="fas fa-comment"></i> Написать сообщение
                        </button>
                        <button class="profile-action-btn secondary" id="otherProfilePageBlockBtn">
                            <i class="fas fa-ban"></i> Заблокировать
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Показываем контейнер
        profilePagesContainer.style.display = 'block';
        setTimeout(() => {
            profilePagesContainer.style.opacity = '1';
        }, 10);
        
        // Загружаем данные пользователя из базы данных
        if (userId) {
            database.ref('profiles/' + userId).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    const user = snapshot.val();
                    const statusElement = document.getElementById('otherProfilePageStatus');
                    const lastSeenElement = document.getElementById('otherProfilePageLastSeen');
                    
                    if (statusElement) {
                        statusElement.textContent = user.isOnline ? 
                            (user.status === 'online' ? 'Онлайн' : 
                             user.status === 'away' ? 'Отошёл' : 
                             user.status === 'busy' ? 'Занят' : 'Не в сети') : 'Не в сети';
                    }
                    
                    if (lastSeenElement && user.lastOnline) {
                        const lastSeenDate = new Date(user.lastOnline);
                        lastSeenElement.textContent = formatLastSeen(lastSeenDate);
                    }
                }
            });
        }
        
        // Добавляем обработчики событий
        document.getElementById('profilePageBackBtn').addEventListener('click', hideProfilePage);
        document.getElementById('otherProfilePageMessageBtn').addEventListener('click', function() {
            if (userId && userName) {
                hideProfilePage();
                openChat(userId, userName);
            }
        });
        document.getElementById('otherProfilePageBlockBtn').addEventListener('click', function() {
            if (confirm(`Вы уверены, что хотите заблокировать пользователя ${userName}?`)) {
                // Здесь должна быть логика блокировки пользователя
                showNotification(`Пользователь ${userName} заблокирован`);
                hideProfilePage();
            }
        });
    }

    // Функция для скрытия страницы профиля
    function hideProfilePage() {
        profilePagesContainer.style.opacity = '0';
        setTimeout(() => {
            profilePagesContainer.style.display = 'none';
            profilePagesContainer.innerHTML = '';
        }, 300);
    }

    // Функция для сохранения профиля из страницы
    function saveProfileFromPage() {
        const usernameInput = document.getElementById('profilePageUsernameInput');
        const newUsername = usernameInput ? usernameInput.value.trim() : '';
        
        if (newUsername && userId) {
            // Обновляем профиль в базе данных
            database.ref('profiles/' + userId).update({
                username: newUsername
            }).then(() => {
                showNotification("Профиль обновлен");
                hideProfilePage();
            }).catch((error) => {
                console.error("Ошибка обновления профиля:", error);
                showNotification("Ошибка обновления профиля");
            });
        } else {
            showNotification("Введите корректный юзернейм");
        }
    }

    // Функция для форматирования времени последнего посещения
    function formatLastSeen(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Меньше минуты
            return 'только что';
        } else if (diff < 3600000) { // Меньше часа
            return Math.floor(diff / 60000) + ' минут назад';
        } else if (diff < 86400000) { // Меньше суток
            return Math.floor(diff / 3600000) + ' часов назад';
        } else if (diff < 604800000) { // Меньше недели
            return Math.floor(diff / 86400000) + ' дней назад';
        } else {
            return date.toLocaleDateString();
        }
    }

    // Переопределяем функцию showProfile для использования полноэкранного профиля
    const originalShowProfile = window.showProfile;
    window.showProfile = function() {
        showMyProfilePage();
    };

    // Добавляем возможность открывать профили других пользователей
    function setupUserProfileClicks() {
        // Обработчики для аватаров в списке пользователей
        document.addEventListener('click', function(e) {
            // Открытие профиля при клике на аватар в списке пользователей
            if (e.target.closest('.user-item-avatar') || e.target.closest('.user-item-info')) {
                const userItem = e.target.closest('.user-item');
                if (userItem) {
                    const userId = userItem.dataset.userId;
                    const userName = userItem.querySelector('.user-item-name').textContent;
                    if (userId && userName) {
                        showOtherUserProfilePage(userId, userName);
                    }
                }
            }
            
            // Открытие профиля при клике на аватар в чате
            if (e.target.closest('#chatUserAvatar')) {
                if (currentChatWith && currentChatWithName) {
                    showOtherUserProfilePage(currentChatWith, currentChatWithName);
                }
            }
        });
    }

    // Инициализация после загрузки DOM
    setTimeout(setupUserProfileClicks, 1000);
});