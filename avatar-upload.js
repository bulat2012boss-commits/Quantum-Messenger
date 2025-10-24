// avatar.js

// Глобальные переменные для аватара
let avatarInitialized = false;

// Инициализация системы аватаров
function initAvatarSystem() {
    if (avatarInitialized) return;
    
    console.log("Инициализация системы аватаров...");
    
    // Создаем input для выбора файла
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.id = 'avatarUploadInput';
    document.body.appendChild(fileInput);
    
    // Обработчик выбора файла
    fileInput.addEventListener('change', handleAvatarSelection);
    
    // Делаем аватар кликабельным в профиле
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        profileAvatar.style.cursor = 'pointer';
        profileAvatar.title = 'Нажмите для изменения аватара';
        profileAvatar.addEventListener('click', function() {
            console.log("Клик по аватару профиля");
            fileInput.click();
        });
    }
    
    // Делаем аватар кликабельным в чате
    const chatAvatar = document.getElementById('chatUserAvatar');
    if (chatAvatar) {
        chatAvatar.style.cursor = 'pointer';
        chatAvatar.addEventListener('click', function() {
            console.log("Клик по аватару в чате");
            fileInput.click();
        });
    }
    
    // Загружаем сохраненный аватар
    loadSavedAvatar();
    
    avatarInitialized = true;
    console.log("Система аватаров инициализирована");
}

// Обработка выбора аватара
function handleAvatarSelection(event) {
    const file = event.target.files[0];
    if (!file) {
        console.log("Файл не выбран");
        return;
    }
    
    console.log("Выбран файл:", file.name, file.type, file.size);
    
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
        showNotification('Пожалуйста, выберите изображение');
        return;
    }
    
    // Проверка размера файла
    if (file.size > 10 * 1024 * 1024) {
        showNotification('Размер файла не должен превышать 10MB');
        return;
    }
    
    showNotification('Загрузка аватара...');
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log("Файл прочитан успешно");
        const imageData = e.target.result;
        
        // Сохраняем и обновляем аватар
        saveAvatar(imageData);
        updateAllAvatars(imageData);
        showNotification('Аватар успешно обновлен!');
    };
    
    reader.onerror = function(error) {
        console.error("Ошибка чтения файла:", error);
        showNotification('Ошибка при загрузке файла');
    };
    
    reader.readAsDataURL(file);
    
    // Сбрасываем input
    event.target.value = '';
}

// Сохранение аватара
function saveAvatar(imageData) {
    try {
        // Сохраняем в localStorage
        localStorage.setItem('userAvatar', imageData);
        console.log("Аватар сохранен в localStorage");
        
        // Сохраняем в Firebase если пользователь авторизован
        if (typeof userId !== 'undefined' && userId) {
            if (typeof database !== 'undefined') {
                database.ref('profiles/' + userId).update({
                    avatar: imageData,
                    avatarUpdated: Date.now()
                }).then(() => {
                    console.log("Аватар сохранен в Firebase");
                }).catch(error => {
                    console.error("Ошибка сохранения в Firebase:", error);
                });
            }
        }
    } catch (error) {
        console.error("Ошибка сохранения аватара:", error);
    }
}

// Обновление аватаров во всем интерфейсе
function updateAllAvatars(imageData) {
    console.log("Обновление аватаров в интерфейсе");
    
    // Создаем стиль для изображения аватара
    const avatarStyle = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
    
    // Обновляем аватар в профиле
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        profileAvatar.innerHTML = `<img src="${imageData}" style="${avatarStyle}" alt="Аватар">`;
        console.log("Аватар профиля обновлен");
    }
    
    // Обновляем аватар в чате
    const chatAvatar = document.getElementById('chatUserAvatar');
    if (chatAvatar) {
        chatAvatar.innerHTML = `<img src="${imageData}" style="${avatarStyle}" alt="Аватар">`;
        console.log("Аватар в чате обновлен");
    }
    
    // Обновляем аватар в информации о чате
    const chatInfoAvatar = document.getElementById('chatInfoAvatar');
    if (chatInfoAvatar) {
        chatInfoAvatar.innerHTML = `<img src="${imageData}" style="${avatarStyle}" alt="Аватар">`;
        console.log("Аватар в информации о чате обновлен");
    }
}

// Загрузка сохраненного аватара
function loadSavedAvatar() {
    try {
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
            console.log("Найден сохраненный аватар");
            updateAllAvatars(savedAvatar);
            return true;
        } else {
            console.log("Сохраненный аватар не найден");
            return false;
        }
    } catch (error) {
        console.error("Ошибка загрузки аватара:", error);
        return false;
    }
}

// Функция для удаления аватара
function removeAvatar() {
    try {
        localStorage.removeItem('userAvatar');
        
        // Восстанавливаем стандартные аватары
        const userInitial = typeof currentUser !== 'undefined' && currentUser ? currentUser.charAt(0).toUpperCase() : 'U';
        
        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) {
            profileAvatar.innerHTML = `<span id="profileAvatarInitial">${userInitial}</span>`;
        }
        
        const chatAvatar = document.getElementById('chatUserAvatar');
        if (chatAvatar) {
            chatAvatar.innerHTML = `<span id="chatAvatarInitial">${userInitial}</span>`;
        }
        
        // Удаляем из Firebase
        if (typeof userId !== 'undefined' && userId && typeof database !== 'undefined') {
            database.ref('profiles/' + userId).update({
                avatar: null
            });
        }
        
        showNotification('Аватар удален');
        console.log("Аватар удален");
        
    } catch (error) {
        console.error("Ошибка удаления аватара:", error);
        showNotification('Ошибка при удалении аватара');
    }
}

// Добавляем кнопку удаления аватара в профиль
function addRemoveAvatarButton() {
    const profileActions = document.querySelector('.profile-actions');
    if (!profileActions) return;
    
    // Удаляем старую кнопку если есть
    const oldBtn = document.getElementById('removeAvatarBtn');
    if (oldBtn) oldBtn.remove();
    
    // Создаем новую кнопку
    const removeBtn = document.createElement('button');
    removeBtn.id = 'removeAvatarBtn';
    removeBtn.className = 'profile-action-btn secondary';
    removeBtn.innerHTML = '<i class="fas fa-trash"></i> Удалить аватар';
    removeBtn.addEventListener('click', removeAvatar);
    
    // Добавляем перед кнопкой "Закрыть"
    const closeBtn = document.getElementById('closeProfileBtn');
    if (closeBtn) {
        profileActions.insertBefore(removeBtn, closeBtn);
    } else {
        profileActions.appendChild(removeBtn);
    }
    
    console.log("Кнопка удаления аватара добавлена");
}

// Перехватываем функцию показа профиля чтобы добавить кнопку удаления
const originalShowProfile = window.showProfile;
window.showProfile = function() {
    if (originalShowProfile) originalShowProfile();
    setTimeout(addRemoveAvatarButton, 100);
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен, инициализируем аватары...");
    
    // Ждем полной загрузки страницы
    setTimeout(() => {
        initAvatarSystem();
    }, 2000);
});

// Также инициализируем когда пользователь входит в систему
const originalEnterChat = window.enterChat;
window.enterChat = function() {
    if (originalEnterChat) originalEnterChat();
    setTimeout(initAvatarSystem, 1000);
};

// Функция показа уведомления (если не существует)
if (typeof showNotification === 'undefined') {
    window.showNotification = function(message) {
        console.log("Уведомление:", message);
        alert(message);
    };
}

console.log("Avatar system script loaded");
