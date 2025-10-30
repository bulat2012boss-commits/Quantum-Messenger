// privacy-functions.js
// Полностью рабочие функции приватности для мобильных устройств

class PrivacyManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    // Загрузка настроек из localStorage
    loadSettings() {
        const defaultSettings = {
            // Кто может писать мне
            whoCanMessage: 'all', // all, contacts, nobody
            // Видимость профиля
            showOnlineStatus: true,
            showLastSeen: true,
            showProfilePhoto: true,
            showStatusText: true,
            // Блокировки
            blockedUsers: [],
            // Дополнительные настройки
            readReceipts: true,
            typingIndicators: true,
            groupInvites: 'everyone', // everyone, contacts, nobody
            storyVisibility: 'all', // all, contacts, close_friends
            messageRequests: true
        };

        const saved = localStorage.getItem('quantum_privacy_settings');
        return saved ? {...defaultSettings, ...JSON.parse(saved)} : defaultSettings;
    }

    // Сохранение настроек
    saveSettings() {
        localStorage.setItem('quantum_privacy_settings', JSON.stringify(this.settings));
        this.showNotification('Настройки приватности сохранены');
    }

    // Инициализация
    init() {
        this.createPrivacyPage();
        this.setupEventListeners();
        console.log('🔒 Менеджер приватности инициализирован');
    }

    // Создание страницы приватности
    createPrivacyPage() {
        // Создаем структуру страницы приватности
        const privacyHTML = `
            <div class="fullscreen-page">
                <div class="page-header">
                    <button class="back-button" onclick="privacyManager.closePage()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1 class="page-title">Приватность</h1>
                </div>
                
                <div class="page-content">
                    <!-- Кто может писать мне -->
                    <div class="privacy-section">
                        <h3><i class="fas fa-comment-dots"></i> Кто может писать мне</h3>
                        <div class="privacy-options">
                            <div class="privacy-option ${this.settings.whoCanMessage === 'all' ? 'active' : ''}" 
                                 onclick="privacyManager.setWhoCanMessage('all')">
                                <div class="option-icon">
                                    <i class="fas fa-globe"></i>
                                </div>
                                <div class="option-content">
                                    <div class="option-title">Все</div>
                                    <div class="option-description">Любой пользователь может написать вам</div>
                                </div>
                                <div class="option-check">
                                    <i class="fas fa-check"></i>
                                </div>
                            </div>
                            
                            <div class="privacy-option ${this.settings.whoCanMessage === 'contacts' ? 'active' : ''}" 
                                 onclick="privacyManager.setWhoCanMessage('contacts')">
                                <div class="option-icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="option-content">
                                    <div class="option-title">Только контакты</div>
                                    <div class="option-description">Только люди из вашего списка контактов</div>
                                </div>
                                <div class="option-check">
                                    <i class="fas fa-check"></i>
                                </div>
                            </div>
                            
                            <div class="privacy-option ${this.settings.whoCanMessage === 'nobody' ? 'active' : ''}" 
                                 onclick="privacyManager.setWhoCanMessage('nobody')">
                                <div class="option-icon">
                                    <i class="fas fa-ban"></i>
                                </div>
                                <div class="option-content">
                                    <div class="option-title">Никто</div>
                                    <div class="option-description">Никто не может писать вам первым</div>
                                </div>
                                <div class="option-check">
                                    <i class="fas fa-check"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Видимость профиля -->
                    <div class="privacy-section">
                        <h3><i class="fas fa-eye"></i> Видимость профиля</h3>
                        <div class="privacy-switches">
                            <div class="privacy-switch">
                                <div class="switch-info">
                                    <div class="switch-title">Показывать статус онлайн</div>
                                    <div class="switch-description">Другие увидят, когда вы онлайн</div>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" ${this.settings.showOnlineStatus ? 'checked' : ''} 
                                           onchange="privacyManager.toggleOnlineStatus(this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            
                            <div class="privacy-switch">
                                <div class="switch-info">
                                    <div class="switch-title">Показывать время последнего посещения</div>
                                    <div class="switch-description">Другие увидят, когда вы были в сети</div>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" ${this.settings.showLastSeen ? 'checked' : ''} 
                                           onchange="privacyManager.toggleLastSeen(this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            
                            <div class="privacy-switch">
                                <div class="switch-info">
                                    <div class="switch-title">Показывать фото профиля</div>
                                    <div class="switch-description">Другие увидят ваше фото профиля</div>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" ${this.settings.showProfilePhoto ? 'checked' : ''} 
                                           onchange="privacyManager.toggleProfilePhoto(this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            
                            <div class="privacy-switch">
                                <div class="switch-info">
                                    <div class="switch-title">Показывать статус</div>
                                    <div class="switch-description">Другие увидят ваш статус</div>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" ${this.settings.showStatusText ? 'checked' : ''} 
                                           onchange="privacyManager.toggleStatusText(this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Дополнительные настройки -->
                    <div class="privacy-section">
                        <h3><i class="fas fa-cog"></i> Дополнительные настройки</h3>
                        <div class="privacy-switches">
                            <div class="privacy-switch">
                                <div class="switch-info">
                                    <div class="switch-title">Чтение сообщений (галочки)</div>
                                    <div class="switch-description">Показывать, что вы прочитали сообщения</div>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" ${this.settings.readReceipts ? 'checked' : ''} 
                                           onchange="privacyManager.toggleReadReceipts(this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            
                            <div class="privacy-switch">
                                <div class="switch-info">
                                    <div class="switch-title">Индикатор набора</div>
                                    <div class="switch-description">Показывать, когда вы печатаете</div>
                                </div>
                                <label class="switch-info">
                                    <input type="checkbox" ${this.settings.typingIndicators ? 'checked' : ''} 
                                           onchange="privacyManager.toggleTypingIndicators(this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            
                            <div class="privacy-switch">
                                <div class="switch-info">
                                    <div class="switch-title">Принимать запросы на переписку</div>
                                    <div class="switch-description">Разрешить незнакомцам отправлять запросы</div>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" ${this.settings.messageRequests ? 'checked' : ''} 
                                           onchange="privacyManager.toggleMessageRequests(this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Управление блокировками -->
                    <div class="privacy-section">
                        <h3><i class="fas fa-user-slash"></i> Заблокированные пользователи</h3>
                        <div class="blocked-users-list" id="blockedUsersList">
                            ${this.renderBlockedUsers()}
                        </div>
                        <button class="add-blocked-btn" onclick="privacyManager.showBlockUserModal()">
                            <i class="fas fa-plus"></i> Добавить пользователя в черный список
                        </button>
                    </div>

                    <!-- Расширенные настройки -->
                    <div class="privacy-section">
                        <h3><i class="fas fa-shield-alt"></i> Расширенные настройки</h3>
                        <div class="advanced-options">
                            <div class="advanced-option" onclick="privacyManager.exportPrivacyData()">
                                <div class="option-icon">
                                    <i class="fas fa-download"></i>
                                </div>
                                <div class="option-content">
                                    <div class="option-title">Экспорт данных приватности</div>
                                    <div class="option-description">Скачайте все ваши настройки приватности</div>
                                </div>
                            </div>
                            
                            <div class="advanced-option" onclick="privacyManager.resetPrivacySettings()">
                                <div class="option-icon">
                                    <i class="fas fa-undo"></i>
                                </div>
                                <div class="option-content">
                                    <div class="option-title">Сбросить настройки приватности</div>
                                    <div class="option-description">Вернуть настройки по умолчанию</div>
                                </div>
                            </div>
                            
                            <div class="advanced-option" onclick="privacyManager.showPrivacyReport()">
                                <div class="option-icon">
                                    <i class="fas fa-flag"></i>
                                </div>
                                <div class="option-content">
                                    <div class="option-title">Отчет о приватности</div>
                                    <div class="option-description">Просмотр статистики и активности</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Создаем контейнер для страницы приватности
        this.pageContainer = document.createElement('div');
        this.pageContainer.id = 'privacy-fullscreen-page';
        this.pageContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--primary-bg);
            z-index: 10000;
            overflow-y: auto;
            display: none;
        `;
        this.pageContainer.innerHTML = privacyHTML;
        document.body.appendChild(this.pageContainer);

        // Добавляем стили
        this.addStyles();
    }

    // Добавление стилей
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .privacy-section {
                margin-bottom: 30px;
                background: var(--other-msg-bg);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid var(--border-color);
            }

            .privacy-section h3 {
                margin: 0 0 15px 0;
                font-size: 16px;
                color: var(--text-color);
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .privacy-options {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .privacy-option {
                display: flex;
                align-items: center;
                padding: 15px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid transparent;
                background: rgba(255,255,255,0.05);
            }

            .privacy-option.active {
                border-color: #4facfe;
                background: rgba(79, 172, 254, 0.1);
            }

            .privacy-option:hover {
                background: rgba(255,255,255,0.1);
            }

            .option-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(79, 172, 254, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                color: #4facfe;
                font-size: 16px;
            }

            .option-content {
                flex: 1;
            }

            .option-title {
                font-weight: 600;
                margin-bottom: 4px;
            }

            .option-description {
                font-size: 12px;
                opacity: 0.7;
                line-height: 1.4;
            }

            .option-check {
                color: #4facfe;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .privacy-option.active .option-check {
                opacity: 1;
            }

            .privacy-switches {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .privacy-switch {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 12px 0;
                border-bottom: 1px solid var(--border-color);
            }

            .privacy-switch:last-child {
                border-bottom: none;
            }

            .switch-info {
                flex: 1;
                margin-right: 15px;
            }

            .switch-title {
                font-weight: 500;
                margin-bottom: 4px;
            }

            .switch-description {
                font-size: 12px;
                opacity: 0.7;
                line-height: 1.4;
            }

            .blocked-users-list {
                margin-bottom: 15px;
                max-height: 200px;
                overflow-y: auto;
            }

            .blocked-user {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: rgba(255,255,255,0.05);
                border-radius: 8px;
                margin-bottom: 8px;
            }

            .blocked-user-info {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .blocked-user-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(45deg, #4facfe, #00f2fe);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }

            .unblock-btn {
                background: #ff4757;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
            }

            .add-blocked-btn {
                width: 100%;
                padding: 12px;
                background: transparent;
                border: 2px dashed var(--border-color);
                border-radius: 8px;
                color: var(--text-color);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.3s ease;
            }

            .add-blocked-btn:hover {
                border-color: #4facfe;
                color: #4facfe;
            }

            .advanced-options {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .advanced-option {
                display: flex;
                align-items: center;
                padding: 15px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                background: rgba(255,255,255,0.05);
            }

            .advanced-option:hover {
                background: rgba(255,255,255,0.1);
            }

            /* Адаптация для мобильных */
            @media (max-width: 480px) {
                .privacy-section {
                    padding: 15px;
                    margin-bottom: 20px;
                }
                
                .privacy-option {
                    padding: 12px;
                }
                
                .option-icon {
                    width: 35px;
                    height: 35px;
                    margin-right: 12px;
                }
            }

            /* Переключатель */
            .switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
                flex-shrink: 0;
            }

            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: .4s;
                border-radius: 24px;
            }

            .slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }

            input:checked + .slider {
                background-color: #4facfe;
            }

            input:checked + .slider:before {
                transform: translateX(26px);
            }
        `;
        document.head.appendChild(style);
    }

    // Рендер заблокированных пользователей
    renderBlockedUsers() {
        if (this.settings.blockedUsers.length === 0) {
            return '<div style="text-align: center; padding: 20px; opacity: 0.7;">Нет заблокированных пользователей</div>';
        }

        return this.settings.blockedUsers.map(user => `
            <div class="blocked-user">
                <div class="blocked-user-info">
                    <div class="blocked-user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="user-name">${user.name}</div>
                        <div class="user-id" style="font-size: 12px; opacity: 0.7;">ID: ${user.id}</div>
                    </div>
                </div>
                <button class="unblock-btn" onclick="privacyManager.unblockUser('${user.id}')">
                    Разблокировать
                </button>
            </div>
        `).join('');
    }

    // Функции управления приватностью
    setWhoCanMessage(setting) {
        this.settings.whoCanMessage = setting;
        this.saveSettings();
        this.updateUI();
        this.showNotification(`Теперь писать вам могут: ${this.getWhoCanMessageText(setting)}`);
    }

    toggleOnlineStatus(enabled) {
        this.settings.showOnlineStatus = enabled;
        this.saveSettings();
        this.showNotification(`Статус онлайн ${enabled ? 'включен' : 'выключен'}`);
    }

    toggleLastSeen(enabled) {
        this.settings.showLastSeen = enabled;
        this.saveSettings();
        this.showNotification(`Время последнего посещения ${enabled ? 'включено' : 'выключено'}`);
    }

    toggleProfilePhoto(enabled) {
        this.settings.showProfilePhoto = enabled;
        this.saveSettings();
        this.showNotification(`Фото профиля ${enabled ? 'видно' : 'скрыто'}`);
    }

    toggleStatusText(enabled) {
        this.settings.showStatusText = enabled;
        this.saveSettings();
        this.showNotification(`Статус ${enabled ? 'виден' : 'скрыт'}`);
    }

    toggleReadReceipts(enabled) {
        this.settings.readReceipts = enabled;
        this.saveSettings();
        this.showNotification(`Галочки прочтения ${enabled ? 'включены' : 'выключены'}`);
    }

    toggleTypingIndicators(enabled) {
        this.settings.typingIndicators = enabled;
        this.saveSettings();
        this.showNotification(`Индикатор набора ${enabled ? 'включен' : 'выключен'}`);
    }

    toggleMessageRequests(enabled) {
        this.settings.messageRequests = enabled;
        this.saveSettings();
        this.showNotification(`Запросы на переписку ${enabled ? 'включены' : 'выключены'}`);
    }

    // Блокировка пользователя
    blockUser(userId, userName) {
        const user = { id: userId, name: userName, blockedAt: Date.now() };
        this.settings.blockedUsers.push(user);
        this.saveSettings();
        this.updateUI();
        this.showNotification(`Пользователь ${userName} заблокирован`);
    }

    // Разблокировка пользователя
    unblockUser(userId) {
        this.settings.blockedUsers = this.settings.blockedUsers.filter(user => user.id !== userId);
        this.saveSettings();
        this.updateUI();
        this.showNotification('Пользователь разблокирован');
    }

    // Показать модальное окно блокировки
    showBlockUserModal() {
        const username = prompt('Введите имя пользователя для блокировки:');
        if (username && username.trim()) {
            const userId = 'user_' + Date.now();
            this.blockUser(userId, username.trim());
        }
    }

    // Дополнительные функции
    exportPrivacyData() {
        const data = JSON.stringify(this.settings, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quantum_privacy_settings.json';
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Данные приватности экспортированы');
    }

    resetPrivacySettings() {
        if (confirm('Вы уверены, что хотите сбросить все настройки приватности?')) {
            localStorage.removeItem('quantum_privacy_settings');
            this.settings = this.loadSettings();
            this.saveSettings();
            this.updateUI();
            this.showNotification('Настройки приватности сброшены');
        }
    }

    showPrivacyReport() {
        const report = `
            Отчет о приватности:
            - Заблокировано пользователей: ${this.settings.blockedUsers.length}
            - Кто может писать: ${this.getWhoCanMessageText(this.settings.whoCanMessage)}
            - Статус онлайн: ${this.settings.showOnlineStatus ? 'Включен' : 'Выключен'}
            - Время последнего посещения: ${this.settings.showLastSeen ? 'Включено' : 'Выключено'}
        `;
        alert(report);
    }

    // Вспомогательные методы
    getWhoCanMessageText(setting) {
        const texts = {
            'all': 'Все',
            'contacts': 'Только контакты',
            'nobody': 'Никто'
        };
        return texts[setting];
    }

    updateUI() {
        // Обновляем активные опции
        document.querySelectorAll('.privacy-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // Обновляем заблокированных пользователей
        const blockedList = document.getElementById('blockedUsersList');
        if (blockedList) {
            blockedList.innerHTML = this.renderBlockedUsers();
        }
    }

    showNotification(message) {
        if (window.showNotification) {
            window.showNotification(message);
        } else {
            alert(message);
        }
    }

    // Открытие/закрытие страницы
    openPage() {
        this.pageContainer.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closePage() {
        this.pageContainer.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Перехватываем клик по кнопке приватности в бургер-меню
        document.getElementById('privacyBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPage();
        });
    }
}

// Инициализация при загрузке страницы
let privacyManager;

document.addEventListener('DOMContentLoaded', function() {
    privacyManager = new PrivacyManager();
    console.log('🔐 Менеджер приватности готов к работе!');
});

// Глобальные функции для вызова из HTML
window.openPrivacySettings = function() {
    if (privacyManager) {
        privacyManager.openPage();
    }
};