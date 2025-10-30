// auto-login.js
// Автоматический вход для зарегистрированных пользователей

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли сохраненные данные пользователя
    const savedName = localStorage.getItem('quantumUsername');
    const savedUserId = localStorage.getItem('quantumUserId');
    
    if (savedName && savedUserId) {
        // Если пользователь уже зарегистрирован, автоматически входим в систему
        autoLogin(savedName, savedUserId);
    }
});

function autoLogin(username, userId) {
    console.log('Автоматический вход для пользователя:', username);
    
    // Скрываем контейнер авторизации
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.style.display = 'none';
    }
    
    // Скрываем квантовый экран входа, если он есть
    const quantumEntrance = document.getElementById('quantumEntrance');
    if (quantumEntrance) {
        quantumEntrance.style.display = 'none';
    }
    
    // Показываем основной интерфейс мессенджера
    const chatWrapper = document.getElementById('chatWrapper');
    if (chatWrapper) {
        chatWrapper.style.display = 'flex';
    }
    
    // Устанавливаем глобальные переменные
    if (typeof currentUser === 'undefined') {
        window.currentUser = username;
    } else {
        currentUser = username;
    }
    
    if (typeof userId === 'undefined') {
        window.userId = userId;
    } else {
        userId = userId;
    }
    
    // Генерируем цвет пользователя
    if (typeof generateUserColor === 'function' && typeof userColor === 'undefined') {
        window.userColor = generateUserColor();
    }
    
    // Инициализируем профиль пользователя
    initializeUserProfile(username, userId);
    
    // Загружаем чаты
    if (typeof loadChatsList === 'function') {
        setTimeout(() => {
            loadChatsList();
        }, 500);
    }
    
    // Показываем уведомление о успешном входе
    if (typeof showNotification === 'function') {
        showNotification(`С возвращением, ${username}!`);
    }
    
    // Обновляем статус онлайн
    updateUserOnlineStatus(userId, true);
}

function initializeUserProfile(username, userId) {
    // Используем существующую функцию setupUserProfile или создаем свою
    if (typeof setupUserProfile === 'function') {
        setupUserProfile();
    } else {
        // Альтернативная реализация, если основной функции нет
        const userProfileRef = firebase.database().ref('profiles/' + userId);
        
        userProfileRef.once('value').then((snapshot) => {
            const userStatus = localStorage.getItem('quantumStatus') || 'online';
            
            if (!snapshot.exists()) {
                // Создаем новый профиль
                userProfileRef.set({
                    name: username,
                    username: username,
                    lastOnline: Date.now(),
                    isOnline: true,
                    status: userStatus
                });
            } else {
                // Обновляем существующий профиль
                userProfileRef.update({
                    name: username,
                    lastOnline: Date.now(),
                    isOnline: true,
                    status: userStatus
                });
            }
        });
        
        // Обновляем статус при выходе
        userProfileRef.onDisconnect().update({
            isOnline: false,
            lastOnline: Date.now(),
            status: 'offline'
        });
    }
}

function updateUserOnlineStatus(userId, isOnline) {
    const status = isOnline ? (localStorage.getItem('quantumStatus') || 'online') : 'offline';
    
    const updates = {
        isOnline: isOnline,
        lastOnline: Date.now(),
        status: status
    };
    
    firebase.database().ref('profiles/' + userId).update(updates);
}

// Перехватываем стандартный вход мессенджера
function overrideAuthSystem() {
    const originalEnterChat = window.enterChat;
    
    if (originalEnterChat) {
        window.enterChat = function() {
            const name = document.getElementById('nameInput').value.trim();
            
            if (name) {
                // Сохраняем данные для автоматического входа в будущем
                localStorage.setItem('quantumUsername', name);
                
                if (!userId) {
                    userId = generateUserId();
                    localStorage.setItem('quantumUserId', userId);
                }
                
                // Вызываем оригинальную функцию
                originalEnterChat.call(this);
            }
        };
    }
}

// Генерация ID пользователя (если функция не определена)
if (typeof generateUserId === 'undefined') {
    function generateUserId() {
        return 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    }
}

// Обработка выхода из системы
function overrideLogoutSystem() {
    const originalLogout = window.logoutHandler;
    
    window.logoutHandler = function() {
        if (confirm("Вы уверены, что хотите выйти?")) {
            // Обновляем статус пользователя
            if (userId) {
                updateUserOnlineStatus(userId, false);
            }
            
            // Удаляем слушатели
            if (typeof removeAllListeners === 'function') {
                removeAllListeners();
            }
            
            // Очищаем данные для автоматического входа
            localStorage.removeItem('quantumUsername');
            localStorage.removeItem('quantumUserId');
            
            // Перезагружаем страницу
            window.location.reload();
        }
    };
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    overrideAuthSystem();
    overrideLogoutSystem();
});

// Экспортируем функцию для ручного вызова при необходимости
window.autoLogin = autoLogin;