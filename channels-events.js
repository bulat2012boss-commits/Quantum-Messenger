// profile-bio.js - Система расширенного профиля с био-информацией
// Версия 1.2 - Исправлено отображение поля "О себе"

class ProfileBioSystem {
    constructor() {
        this.currentUser = '';
        this.userId = '';
        this.userBio = '';
        this.bioMaxLength = 70;
        this.isInitialized = false;
        this.profileModalObserver = null;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeSystem());
        } else {
            this.initializeSystem();
        }
    }

    initializeSystem() {
        this.waitForUserAndFirebase().then(() => {
            this.setupEventListeners();
            this.loadUserBioOnStartup();
            this.setupProfileModalObserver();
            this.isInitialized = true;
            console.log('Система био профиля инициализирована для пользователя:', this.userId);
        });
    }

    waitForUserAndFirebase() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (window.firebase && window.userId && window.currentUser) {
                    this.userId = window.userId;
                    this.currentUser = window.currentUser;
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }

    setupEventListeners() {
        // Перехватываем открытие профиля
        this.interceptProfileOpening();
        
        // Обработчик сохранения профиля
        document.addEventListener('click', (e) => {
            if (e.target.id === 'saveProfileBtn' || e.target.closest('#saveProfileBtn')) {
                this.saveBio();
            }
        });

        // Слушаем изменения в Firebase
        this.setupBioListener();
    }

    interceptProfileOpening() {
        const originalShowProfile = window.showProfile;
        
        window.showProfile = () => {
            console.log('Открытие профиля перехвачено');
            if (originalShowProfile) {
                originalShowProfile();
            }
            // Ждем пока модальное окно откроется
            setTimeout(() => {
                this.addBioFieldToProfileModal();
            }, 100);
        };

        // Также перехватываем кнопку профиля в бургер-меню
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                setTimeout(() => {
                    this.addBioFieldToProfileModal();
                }, 200);
            });
        }
    }

    setupProfileModalObserver() {
        // Наблюдаем за появлением модального окна профиля
        this.profileModalObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.id === 'profileModal') {
                            console.log('Модальное окно профиля обнаружено');
                            setTimeout(() => {
                                this.addBioFieldToProfileModal();
                            }, 50);
                        }
                    });
                }
            });
        });

        this.profileModalObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupBioListener() {
        if (!this.userId) return;

        firebase.database().ref('profiles/' + this.userId + '/bio').on('value', (snapshot) => {
            const newBio = snapshot.val() || '';
            if (newBio !== this.userBio) {
                this.userBio = newBio;
                console.log('Био обновлено из Firebase:', this.userBio);
                this.updateBioInUI();
            }
        });
    }

    loadUserBioOnStartup() {
        if (!this.userId) return;

        firebase.database().ref('profiles/' + this.userId + '/bio').once('value')
            .then((snapshot) => {
                this.userBio = snapshot.val() || '';
                console.log('Био загружено при старте:', this.userBio);
            })
            .catch((error) => {
                console.error('Ошибка загрузки био при старте:', error);
            });
    }

    addBioFieldToProfileModal() {
        // Проверяем, открыто ли модальное окно профиля
        const profileModal = document.getElementById('profileModal');
        if (!profileModal || !profileModal.classList.contains('active')) {
            console.log('Модальное окно профиля не активно');
            return;
        }

        // Проверяем, есть ли уже поле био
        if (document.getElementById('profileBioField')) {
            console.log('Поле био уже существует, обновляем данные');
            this.updateBioInUI();
            return;
        }

        // Находим контейнер информации профиля
        const profileInfo = document.querySelector('.profile-info');
        if (!profileInfo) {
            console.log('Контейнер .profile-info не найден, ищем альтернативы...');
            this.findAlternativeProfileContainer();
            return;
        }

        console.log('Добавляем поле био в профиль');
        this.createBioField(profileInfo);
    }

    findAlternativeProfileContainer() {
        // Пробуем разные селекторы для поиска контейнера профиля
        const selectors = [
            '.profile-info',
            '.profile-modal-content',
            '#profileModal .modal-content',
            '.profile-info-item'
        ];

        for (const selector of selectors) {
            const container = document.querySelector(selector);
            if (container) {
                console.log('Найден контейнер через селектор:', selector);
                this.createBioField(container);
                return;
            }
        }

        // Если не нашли, пробуем через некоторое время снова
        console.log('Контейнер не найден, повторяем попытку...');
        setTimeout(() => this.addBioFieldToProfileModal(), 200);
    }

    createBioField(container) {
        // Создаем элемент для био
        const bioItem = document.createElement('div');
        bioItem.className = 'profile-info-item';
        bioItem.id = 'profileBioField';
        
        bioItem.innerHTML = `
            <span class="profile-info-label">О себе:</span>
            <div class="bio-input-container">
                <textarea 
                    id="bioInput" 
                    placeholder="Расскажите о себе (до ${this.bioMaxLength} символов)..." 
                    maxlength="${this.bioMaxLength}"
                    class="bio-input"
                >${this.userBio || ''}</textarea>
                <div class="bio-counter">
                    <span id="bioCharCount">${this.userBio ? this.userBio.length : 0}</span>/${this.bioMaxLength}
                </div>
            </div>
        `;

        // Вставляем поле био в подходящее место
        if (container.classList.contains('profile-info')) {
            // Вставляем после первого элемента (юзернейма)
            const firstItem = container.querySelector('.profile-info-item:first-child');
            if (firstItem) {
                firstItem.parentNode.insertBefore(bioItem, firstItem.nextSibling);
            } else {
                container.prepend(bioItem);
            }
        } else {
            // Для других контейнеров просто добавляем в конец
            container.appendChild(bioItem);
        }

        console.log('Поле био успешно добавлено');
        this.setupBioInputHandlers();
        this.updateCharCounter();
    }

    setupBioInputHandlers() {
        const bioInput = document.getElementById('bioInput');
        if (!bioInput) {
            console.error('Поле bioInput не найдено после создания');
            return;
        }

        bioInput.addEventListener('input', () => {
            this.updateCharCounter();
            this.updateCharCounterStyle();
        });

        bioInput.addEventListener('keydown', (e) => {
            if (bioInput.value.length >= this.bioMaxLength && 
                e.key.length === 1 && 
                !e.ctrlKey && 
                !e.metaKey) {
                e.preventDefault();
                this.showBioLimitNotification();
            }
        });

        bioInput.addEventListener('blur', () => {
            this.autoSaveBio();
        });

        console.log('Обработчики для поля био установлены');
    }

    updateCharCounter() {
        const bioInput = document.getElementById('bioInput');
        const charCount = document.getElementById('bioCharCount');
        
        if (bioInput && charCount) {
            charCount.textContent = bioInput.value.length;
        }
    }

    updateCharCounterStyle() {
        const bioInput = document.getElementById('bioInput');
        const charCount = document.getElementById('bioCharCount');
        
        if (bioInput && charCount) {
            const length = bioInput.value.length;
            if (length > this.bioMaxLength * 0.8) {
                charCount.style.color = '#ff6b6b';
                charCount.style.fontWeight = 'bold';
            } else {
                charCount.style.color = '';
                charCount.style.fontWeight = '';
            }
        }
    }

    updateBioInUI() {
        const bioInput = document.getElementById('bioInput');
        if (bioInput && bioInput.value !== this.userBio) {
            bioInput.value = this.userBio;
            this.updateCharCounter();
            this.updateCharCounterStyle();
            console.log('Био обновлено в UI:', this.userBio);
        }
    }

    async saveBio() {
        try {
            const bioInput = document.getElementById('bioInput');
            if (!bioInput) {
                console.error('Поле био не найдено при сохранении');
                return;
            }

            const newBio = bioInput.value.trim();
            
            if (newBio.length > this.bioMaxLength) {
                this.showBioLimitNotification();
                return;
            }

            console.log('Сохранение био в Firebase:', newBio);
            await firebase.database().ref('profiles/' + this.userId).update({
                bio: newBio,
                lastUpdate: Date.now()
            });

            this.userBio = newBio;
            this.showNotification("Информация о себе обновлена", "success");
            
        } catch (error) {
            console.error('Ошибка сохранения био:', error);
            this.showNotification("Ошибка сохранения информации", "error");
        }
    }

    async autoSaveBio() {
        const bioInput = document.getElementById('bioInput');
        if (!bioInput) return;

        const newBio = bioInput.value.trim();
        
        if (newBio !== this.userBio && newBio.length <= this.bioMaxLength) {
            try {
                await firebase.database().ref('profiles/' + this.userId).update({
                    bio: newBio
                });
                this.userBio = newBio;
                console.log('Био автосохранено:', newBio);
            } catch (error) {
                console.error('Ошибка автосохранения био:', error);
            }
        }
    }

    showBioLimitNotification() {
        this.showNotification(`Максимальная длина информации о себе - ${this.bioMaxLength} символов`, "warning");
    }

    showNotification(message, type = "info") {
        if (window.showNotification) {
            window.showNotification(message);
        } else {
            const notification = document.createElement('div');
            notification.className = `custom-bio-notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'error' ? '#ff6b6b' : type === 'warning' ? '#ffa726' : '#4facfe'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                max-width: 300px;
                word-wrap: break-word;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    }

    // Публичные методы для использования в других модулях
    async getUserBio(userId) {
        try {
            const snapshot = await firebase.database().ref('profiles/' + userId + '/bio').once('value');
            return snapshot.val() || '';
        } catch (error) {
            console.error('Ошибка получения био:', error);
            return '';
        }
    }

    async displayBioInChat(userId, container) {
        const bio = await this.getUserBio(userId);
        if (bio && container) {
            const oldBio = container.querySelector('.user-bio-chat');
            if (oldBio) oldBio.remove();

            const bioElement = document.createElement('div');
            bioElement.className = 'user-bio-chat';
            bioElement.textContent = bio;
            container.appendChild(bioElement);
        }
    }

    reloadUserBio() {
        if (this.userId) {
            this.loadUserBioOnStartup();
        }
    }

    // Метод для отладки
    debugInfo() {
        return {
            userId: this.userId,
            currentUser: this.currentUser,
            userBio: this.userBio,
            isInitialized: this.isInitialized,
            bioFieldExists: !!document.getElementById('profileBioField'),
            profileModalActive: document.getElementById('profileModal')?.classList.contains('active')
        };
    }
}

// Добавляем CSS стили
const addBioStyles = () => {
    if (document.getElementById('profile-bio-styles')) return;

    const bioStyles = `
    <style id="profile-bio-styles">
    .bio-input-container {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        width: 100%;
        position: relative;
    }

    .bio-input {
        width: 100%;
        min-height: 70px;
        padding: 10px 12px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--input-bg);
        color: var(--input-color);
        font-size: 14px;
        resize: vertical;
        font-family: inherit;
        transition: all 0.3s ease;
        line-height: 1.4;
    }

    .bio-input:focus {
        outline: none;
        border-color: #4facfe;
        box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
        background: var(--input-bg);
    }

    .bio-counter {
        font-size: 12px;
        opacity: 0.7;
        margin-top: 6px;
        color: var(--text-color);
        font-weight: normal;
    }

    .user-bio-chat {
        font-size: 13px;
        opacity: 0.8;
        margin-top: 8px;
        font-style: italic;
        line-height: 1.3;
        padding: 6px 10px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        border-left: 3px solid #4facfe;
    }

    .light-theme .user-bio-chat {
        background: rgba(0, 0, 0, 0.05);
    }

    .light-theme .bio-input {
        background: #ffffff;
        border-color: #ddd;
    }

    .custom-bio-notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        font-weight: 500;
    }

    /* Адаптивность */
    @media (max-width: 480px) {
        .bio-input {
            min-height: 60px;
            font-size: 13px;
            padding: 8px 10px;
        }
        
        .bio-counter {
            font-size: 11px;
            margin-top: 4px;
        }
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    </style>
    `;

    document.head.insertAdjacentHTML('beforeend', bioStyles);
    console.log('Стили для системы био добавлены');
};

// Инициализация системы
let profileBioSystem;

const initializeProfileBioSystem = () => {
    if (!profileBioSystem) {
        addBioStyles();
        profileBioSystem = new ProfileBioSystem();
        window.ProfileBioSystem = profileBioSystem;
        
        // Добавляем метод отладки в глобальную область
        window.debugBioSystem = () => {
            if (profileBioSystem) {
                console.log('Отладочная информация системы био:', profileBioSystem.debugInfo());
            }
        };
        
        console.log('✅ Система био профиля инициализирована');
    }
};

// Запускаем инициализацию
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProfileBioSystem);
} else {
    initializeProfileBioSystem();
}

// Для отладки в консоли можно использовать debugBioSystem()
