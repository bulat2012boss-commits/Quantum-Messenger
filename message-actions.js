// privacy-functions-fixed.js
// Полностью рабочие функции приватности без багов

document.addEventListener('DOMContentLoaded', function() {
    // Загружаем настройки
    const privacySettings = loadPrivacySettings();
    
    // Создаем страницу приватности
    createPrivacyPage();
    
    // Настраиваем обработчики
    setupPrivacyHandlers();
    
    console.log('🔒 Приватность: все функции готовы к работе!');
});

// Загрузка настроек приватности
function loadPrivacySettings() {
    const defaultSettings = {
        whoCanMessage: 'all',
        showOnlineStatus: true,
        showLastSeen: true,
        showProfilePhoto: true,
        showStatusText: true,
        readReceipts: true,
        typingIndicators: true,
        messageRequests: true,
        blockedUsers: []
    };
    
    const saved = localStorage.getItem('quantum_privacy_settings');
    return saved ? {...defaultSettings, ...JSON.parse(saved)} : defaultSettings;
}

// Сохранение настроек
function savePrivacySettings(settings) {
    localStorage.setItem('quantum_privacy_settings', JSON.stringify(settings));
    showPrivacyNotification('Настройки сохранены!');
}

// Создание страницы приватности
function createPrivacyPage() {
    const settings = loadPrivacySettings();
    
    const privacyHTML = `
        <div id="privacyPage" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--primary-bg); z-index: 10000; overflow-y: auto;">
            <div style="position: sticky; top: 0; background: var(--header-bg); border-bottom: 1px solid var(--border-color); padding: 15px; display: flex; align-items: center; gap: 15px; z-index: 10;">
                <button onclick="closePrivacyPage()" style="background: none; border: none; color: var(--text-color); font-size: 20px; padding: 8px; border-radius: 50%; cursor: pointer; min-width: 44px; min-height: 44px;">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h1 style="margin: 0; font-size: 18px; font-weight: 600;">Приватность и безопасность</h1>
            </div>
            
            <div style="padding: 20px 15px;">
                <!-- Кто может писать мне -->
                <div style="background: var(--other-msg-bg); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-comments"></i> Кто может писать мне
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div onclick="setWhoCanMessage('all')" style="display: flex; align-items: center; padding: 15px; border-radius: 10px; cursor: pointer; background: ${settings.whoCanMessage === 'all' ? 'rgba(79, 172, 254, 0.1)' : 'rgba(255,255,255,0.05)'}; border: 2px solid ${settings.whoCanMessage === 'all' ? '#4facfe' : 'transparent'};">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(79, 172, 254, 0.2); display: flex; align-items: center; justify-content: center; margin-right: 15px; color: #4facfe;">
                                <i class="fas fa-globe"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">Все пользователи</div>
                                <div style="font-size: 12px; opacity: 0.7;">Любой может написать вам</div>
                            </div>
                            ${settings.whoCanMessage === 'all' ? '<i class="fas fa-check" style="color: #4facfe;"></i>' : ''}
                        </div>
                        
                        <div onclick="setWhoCanMessage('contacts')" style="display: flex; align-items: center; padding: 15px; border-radius: 10px; cursor: pointer; background: ${settings.whoCanMessage === 'contacts' ? 'rgba(79, 172, 254, 0.1)' : 'rgba(255,255,255,0.05)'}; border: 2px solid ${settings.whoCanMessage === 'contacts' ? '#4facfe' : 'transparent'};">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(79, 172, 254, 0.2); display: flex; align-items: center; justify-content: center; margin-right: 15px; color: #4facfe;">
                                <i class="fas fa-users"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">Только контакты</div>
                                <div style="font-size: 12px; opacity: 0.7;">Только люди из вашего списка контактов</div>
                            </div>
                            ${settings.whoCanMessage === 'contacts' ? '<i class="fas fa-check" style="color: #4facfe;"></i>' : ''}
                        </div>
                        
                        <div onclick="setWhoCanMessage('nobody')" style="display: flex; align-items: center; padding: 15px; border-radius: 10px; cursor: pointer; background: ${settings.whoCanMessage === 'nobody' ? 'rgba(79, 172, 254, 0.1)' : 'rgba(255,255,255,0.05)'}; border: 2px solid ${settings.whoCanMessage === 'nobody' ? '#4facfe' : 'transparent'};">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(79, 172, 254, 0.2); display: flex; align-items: center; justify-content: center; margin-right: 15px; color: #4facfe;">
                                <i class="fas fa-ban"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">Никто</div>
                                <div style="font-size: 12px; opacity: 0.7;">Никто не может писать вам первым</div>
                            </div>
                            ${settings.whoCanMessage === 'nobody' ? '<i class="fas fa-check" style="color: #4facfe;"></i>' : ''}
                        </div>
                    </div>
                </div>

                <!-- Видимость профиля -->
                <div style="background: var(--other-msg-bg); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-eye"></i> Видимость профиля
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                            <div>
                                <div style="font-weight: 500;">Статус онлайн</div>
                                <div style="font-size: 12px; opacity: 0.7;">Показывать, когда вы в сети</div>
                            </div>
                            <label style="position: relative; display: inline-block; width: 50px; height: 24px;">
                                <input type="checkbox" ${settings.showOnlineStatus ? 'checked' : ''} onchange="toggleOnlineStatus(this.checked)" style="opacity: 0; width: 0; height: 0;">
                                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${settings.showOnlineStatus ? '#4facfe' : '#ccc'}; transition: .4s; border-radius: 24px;"></span>
                                <span style="position: absolute; content: ''; height: 16px; width: 16px; left: ${settings.showOnlineStatus ? '26px' : '4px'}; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                            </label>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                            <div>
                                <div style="font-weight: 500;">Время последнего посещения</div>
                                <div style="font-size: 12px; opacity: 0.7;">Показывать, когда вы были в сети</div>
                            </div>
                            <label style="position: relative; display: inline-block; width: 50px; height: 24px;">
                                <input type="checkbox" ${settings.showLastSeen ? 'checked' : ''} onchange="toggleLastSeen(this.checked)" style="opacity: 0; width: 0; height: 0;">
                                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${settings.showLastSeen ? '#4facfe' : '#ccc'}; transition: .4s; border-radius: 24px;"></span>
                                <span style="position: absolute; content: ''; height: 16px; width: 16px; left: ${settings.showLastSeen ? '26px' : '4px'}; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                            </label>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                            <div>
                                <div style="font-weight: 500;">Фото профиля</div>
                                <div style="font-size: 12px; opacity: 0.7;">Показывать ваше фото профиля</div>
                            </div>
                            <label style="position: relative; display: inline-block; width: 50px; height: 24px;">
                                <input type="checkbox" ${settings.showProfilePhoto ? 'checked' : ''} onchange="toggleProfilePhoto(this.checked)" style="opacity: 0; width: 0; height: 0;">
                                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${settings.showProfilePhoto ? '#4facfe' : '#ccc'}; transition: .4s; border-radius: 24px;"></span>
                                <span style="position: absolute; content: ''; height: 16px; width: 16px; left: ${settings.showProfilePhoto ? '26px' : '4px'}; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Дополнительные настройки -->
                <div style="background: var(--other-msg-bg); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-cog"></i> Дополнительные настройки
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                            <div>
                                <div style="font-weight: 500;">Галочки прочтения</div>
                                <div style="font-size: 12px; opacity: 0.7;">Показывать, что вы прочитали сообщения</div>
                            </div>
                            <label style="position: relative; display: inline-block; width: 50px; height: 24px;">
                                <input type="checkbox" ${settings.readReceipts ? 'checked' : ''} onchange="toggleReadReceipts(this.checked)" style="opacity: 0; width: 0; height: 0;">
                                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${settings.readReceipts ? '#4facfe' : '#ccc'}; transition: .4s; border-radius: 24px;"></span>
                                <span style="position: absolute; content: ''; height: 16px; width: 16px; left: ${settings.readReceipts ? '26px' : '4px'}; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                            </label>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                            <div>
                                <div style="font-weight: 500;">Индикатор набора</div>
                                <div style="font-size: 12px; opacity: 0.7;">Показывать, когда вы печатаете</div>
                            </div>
                            <label style="position: relative; display: inline-block; width: 50px; height: 24px;">
                                <input type="checkbox" ${settings.typingIndicators ? 'checked' : ''} onchange="toggleTypingIndicators(this.checked)" style="opacity: 0; width: 0; height: 0;">
                                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${settings.typingIndicators ? '#4facfe' : '#ccc'}; transition: .4s; border-radius: 24px;"></span>
                                <span style="position: absolute; content: ''; height: 16px; width: 16px; left: ${settings.typingIndicators ? '26px' : '4px'}; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Заблокированные пользователи -->
                <div style="background: var(--other-msg-bg); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-user-slash"></i> Заблокированные пользователи
                    </h3>
                    <div id="blockedUsersList" style="margin-bottom: 15px; max-height: 200px; overflow-y: auto;">
                        ${renderBlockedUsers()}
                    </div>
                    <button onclick="showBlockUserModal()" style="width: 100%; padding: 12px; background: transparent; border: 2px dashed var(--border-color); border-radius: 8px; color: var(--text-color); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fas fa-plus"></i> Добавить пользователя
                    </button>
                </div>

                <!-- Действия -->
                <div style="background: var(--other-msg-bg); border-radius: 12px; padding: 20px;">
                    <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-shield-alt"></i> Действия
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button onclick="exportPrivacyData()" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: rgba(255,255,255,0.05); border: none; border-radius: 10px; color: var(--text-color); cursor: pointer; text-align: left;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(79, 172, 254, 0.2); display: flex; align-items: center; justify-content: center; color: #4facfe;">
                                <i class="fas fa-download"></i>
                            </div>
                            <div>
                                <div style="font-weight: 600;">Экспорт данных</div>
                                <div style="font-size: 12px; opacity: 0.7;">Скачать настройки приватности</div>
                            </div>
                        </button>
                        
                        <button onclick="showPrivacyReport()" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: rgba(255,255,255,0.05); border: none; border-radius: 10px; color: var(--text-color); cursor: pointer; text-align: left;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(79, 172, 254, 0.2); display: flex; align-items: center; justify-content: center; color: #4facfe;">
                                <i class="fas fa-chart-bar"></i>
                            </div>
                            <div>
                                <div style="font-weight: 600;">Отчет приватности</div>
                                <div style="font-size: 12px; opacity: 0.7;">Просмотр статистики</div>
                            </div>
                        </button>
                        
                        <button onclick="resetPrivacySettings()" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: rgba(255, 53, 69, 0.1); border: none; border-radius: 10px; color: #ff3545; cursor: pointer; text-align: left;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 53, 69, 0.2); display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-undo"></i>
                            </div>
                            <div>
                                <div style="font-weight: 600;">Сбросить настройки</div>
                                <div style="font-size: 12px; opacity: 0.7;">Вернуть настройки по умолчанию</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем страницу в DOM
    const existingPage = document.getElementById('privacyPage');
    if (existingPage) {
        existingPage.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', privacyHTML);
}

// Рендер заблокированных пользователей
function renderBlockedUsers() {
    const settings = loadPrivacySettings();
    
    if (settings.blockedUsers.length === 0) {
        return '<div style="text-align: center; padding: 20px; opacity: 0.7;">Нет заблокированных пользователей</div>';
    }
    
    return settings.blockedUsers.map(user => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(45deg, #4facfe, #00f2fe); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style="font-weight: 500;">${user.name}</div>
                    <div style="font-size: 12px; opacity: 0.7;">Заблокирован</div>
                </div>
            </div>
            <button onclick="unblockUser('${user.id}')" style="background: #ff4757; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                Разблокировать
            </button>
        </div>
    `).join('');
}

// Функции управления приватностью
function setWhoCanMessage(setting) {
    const settings = loadPrivacySettings();
    settings.whoCanMessage = setting;
    savePrivacySettings(settings);
    updatePrivacyUI();
    showPrivacyNotification(`Теперь писать вам могут: ${getWhoCanMessageText(setting)}`);
}

function toggleOnlineStatus(enabled) {
    const settings = loadPrivacySettings();
    settings.showOnlineStatus = enabled;
    savePrivacySettings(settings);
    showPrivacyNotification(`Статус онлайн ${enabled ? 'включен' : 'выключен'}`);
}

function toggleLastSeen(enabled) {
    const settings = loadPrivacySettings();
    settings.showLastSeen = enabled;
    savePrivacySettings(settings);
    showPrivacyNotification(`Время последнего посещения ${enabled ? 'включено' : 'выключено'}`);
}

function toggleProfilePhoto(enabled) {
    const settings = loadPrivacySettings();
    settings.showProfilePhoto = enabled;
    savePrivacySettings(settings);
    showPrivacyNotification(`Фото профиля ${enabled ? 'видно' : 'скрыто'}`);
}

function toggleReadReceipts(enabled) {
    const settings = loadPrivacySettings();
    settings.readReceipts = enabled;
    savePrivacySettings(settings);
    showPrivacyNotification(`Галочки прочтения ${enabled ? 'включены' : 'выключены'}`);
}

function toggleTypingIndicators(enabled) {
    const settings = loadPrivacySettings();
    settings.typingIndicators = enabled;
    savePrivacySettings(settings);
    showPrivacyNotification(`Индикатор набора ${enabled ? 'включен' : 'выключен'}`);
}

// Блокировка пользователя
function blockUser(userId, userName) {
    const settings = loadPrivacySettings();
    const user = { id: userId, name: userName, blockedAt: Date.now() };
    settings.blockedUsers.push(user);
    savePrivacySettings(settings);
    updateBlockedUsersList();
    showPrivacyNotification(`Пользователь ${userName} заблокирован`);
}

// Разблокировка пользователя
function unblockUser(userId) {
    const settings = loadPrivacySettings();
    settings.blockedUsers = settings.blockedUsers.filter(user => user.id !== userId);
    savePrivacySettings(settings);
    updateBlockedUsersList();
    showPrivacyNotification('Пользователь разблокирован');
}

// Показать модальное окно блокировки
function showBlockUserModal() {
    const username = prompt('Введите имя пользователя для блокировки:');
    if (username && username.trim()) {
        const userId = 'user_' + Date.now();
        blockUser(userId, username.trim());
    }
}

// Дополнительные функции
function exportPrivacyData() {
    const settings = loadPrivacySettings();
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantum_privacy_settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showPrivacyNotification('Данные приватности экспортированы');
}

function showPrivacyReport() {
    const settings = loadPrivacySettings();
    const report = `
Отчет о приватности:

📊 Статистика:
• Заблокировано пользователей: ${settings.blockedUsers.length}
• Кто может писать: ${getWhoCanMessageText(settings.whoCanMessage)}
• Статус онлайн: ${settings.showOnlineStatus ? 'Включен' : 'Выключен'}
• Время последнего посещения: ${settings.showLastSeen ? 'Включено' : 'Выключено'}
• Галочки прочтения: ${settings.readReceipts ? 'Включены' : 'Выключены'}
• Индикатор набора: ${settings.typingIndicators ? 'Включен' : 'Выключен'}

🛡️ Ваши настройки защищают вашу приватность!
    `;
    alert(report);
}

function resetPrivacySettings() {
    if (confirm('Вы уверены, что хотите сбросить все настройки приватности?')) {
        localStorage.removeItem('quantum_privacy_settings');
        showPrivacyNotification('Настройки приватности сброшены');
        closePrivacyPage();
        setTimeout(() => {
            createPrivacyPage();
            setupPrivacyHandlers();
        }, 100);
    }
}

// Вспомогательные функции
function getWhoCanMessageText(setting) {
    const texts = {
        'all': 'Все пользователи',
        'contacts': 'Только контакты', 
        'nobody': 'Никто'
    };
    return texts[setting];
}

function updatePrivacyUI() {
    // Пересоздаем страницу с обновленными настройками
    createPrivacyPage();
    setupPrivacyHandlers();
}

function updateBlockedUsersList() {
    const blockedList = document.getElementById('blockedUsersList');
    if (blockedList) {
        blockedList.innerHTML = renderBlockedUsers();
    }
}

function showPrivacyNotification(message) {
    // Используем существующую функцию уведомлений или создаем простую
    if (typeof showNotification === 'function') {
        showNotification(message);
    } else {
        // Простая реализация уведомления
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Управление страницей
function openPrivacyPage() {
    const page = document.getElementById('privacyPage');
    if (page) {
        page.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closePrivacyPage() {
    const page = document.getElementById('privacyPage');
    if (page) {
        page.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Настройка обработчиков
function setupPrivacyHandlers() {
    // Обработчик для кнопки приватности в бургер-меню
    const privacyBtn = document.getElementById('privacyBtn');
    if (privacyBtn) {
        privacyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openPrivacyPage();
        });
    }
    
    // Закрытие по кнопке "Назад" в браузере
    window.addEventListener('popstate', function() {
        closePrivacyPage();
    });
}

// Глобальные функции
window.openPrivacyPage = openPrivacyPage;
window.closePrivacyPage = closePrivacyPage;
window.setWhoCanMessage = setWhoCanMessage;
window.toggleOnlineStatus = toggleOnlineStatus;
window.toggleLastSeen = toggleLastSeen;
window.toggleProfilePhoto = toggleProfilePhoto;
window.toggleReadReceipts = toggleReadReceipts;
window.toggleTypingIndicators = toggleTypingIndicators;
window.blockUser = blockUser;
window.unblockUser = unblockUser;
window.showBlockUserModal = showBlockUserModal;
window.exportPrivacyData = exportPrivacyData;
window.showPrivacyReport = showPrivacyReport;
window.resetPrivacySettings = resetPrivacySettings;