// channel-descriptions.js - Система описаний каналов для Quantum Messenger
// Добавляет возможность просмотра и редактирования описаний каналов

// Переменные состояния
let channelDescriptionsEnabled = true;

// Инициализация системы описаний
function initChannelDescriptions() {
    console.log("Инициализация системы описаний каналов...");
    
    // Добавляем стили
    addDescriptionStyles();
    
    // Модифицируем существующие функции
    patchChannelFunctions();
    
    console.log("✅ Система описаний каналов инициализирована");
}

// Добавление стилей для описаний
function addDescriptionStyles() {
    if (document.getElementById('channel-descriptions-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'channel-descriptions-styles';
    style.textContent = `
        .channel-description {
            background: var(--hover-color);
            padding: 12px 15px;
            margin: 10px 0;
            border-radius: 10px;
            border-left: 3px solid #9b59b6;
            animation: fadeIn 0.3s ease;
        }
        
        .channel-description-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .channel-description-title {
            font-weight: 600;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #9b59b6;
        }
        
        .channel-description-content {
            font-size: 13px;
            line-height: 1.4;
            color: var(--text-color);
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .channel-description-empty {
            font-style: italic;
            opacity: 0.7;
        }
        
        .edit-description-btn {
            background: none;
            border: none;
            color: #4facfe;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 5px;
            font-size: 12px;
            transition: all 0.2s ease;
        }
        
        .edit-description-btn:hover {
            background: rgba(79, 172, 254, 0.1);
        }
        
        .description-textarea {
            width: 100%;
            min-height: 100px;
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--input-bg);
            color: var(--input-color);
            font-size: 14px;
            resize: vertical;
            transition: border-color 0.3s ease;
        }
        
        .description-textarea:focus {
            border-color: #4facfe;
            outline: none;
        }
        
        .description-char-count {
            text-align: right;
            font-size: 12px;
            opacity: 0.7;
            margin-top: 5px;
        }
        
        .description-char-count.warning {
            color: #f39c12;
        }
        
        .description-char-count.error {
            color: #e74c3c;
        }
        
        .channel-info-description {
            margin: 15px 0;
            padding: 12px;
            background: var(--hover-color);
            border-radius: 8px;
            border-left: 3px solid #9b59b6;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Адаптивность для мобильных */
        @media (max-width: 768px) {
            .channel-description {
                padding: 10px 12px;
                margin: 8px 0;
            }
            
            .channel-description-content {
                font-size: 12px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Модификация функций каналов
function patchChannelFunctions() {
    // Патчим функцию открытия канала для добавления описания
    if (window.openChannel) {
        const originalOpenChannel = window.openChannel;
        window.openChannel = function(channelId, channelName) {
            const result = originalOpenChannel.call(this, channelId, channelName);
            
            // Добавляем описание после загрузки сообщений
            setTimeout(() => {
                addDescriptionToChannel(channelId);
            }, 1000);
            
            return result;
        };
    }
    
    // Патчим функцию информации о канале
    if (window.showChannelInfo) {
        const originalShowChannelInfo = window.showChannelInfo;
        window.showChannelInfo = function(channelId) {
            // Сначала вызываем оригинальную функцию
            const result = originalShowChannelInfo.call(this, channelId);
            
            // Затем добавляем описание в модальное окно
            setTimeout(() => {
                addDescriptionToChannelInfo(channelId);
            }, 100);
            
            return result;
        };
    }
    
    // Патчим функцию создания канала для добавления поля описания
    patchCreateChannelModal();
    
    // Патчим функцию настроек канала для редактирования описания
    patchChannelSettings();
}

// Добавление описания в интерфейс канала
function addDescriptionToChannel(channelId) {
    if (!channelId) return;
    
    // Проверяем, не добавлено ли уже описание
    const existingDescription = document.getElementById('channelDescriptionDisplay');
    if (existingDescription) {
        existingDescription.remove();
    }
    
    // Получаем информацию о канале
    database.ref('channels/' + channelId).once('value').then((snapshot) => {
        if (!snapshot.exists()) return;
        
        const channel = snapshot.val();
        const description = channel.description || '';
        
        // Если описание пустое, не показываем блок
        if (!description.trim()) return;
        
        const messagesContainer = document.getElementById('channelMessagesContainer');
        if (!messagesContainer) return;
        
        // Создаем блок описания
        const descriptionElement = document.createElement('div');
        descriptionElement.id = 'channelDescriptionDisplay';
        descriptionElement.className = 'channel-description';
        
        descriptionElement.innerHTML = `
            <div class="channel-description-header">
                <div class="channel-description-title">
                    <i class="fas fa-info-circle"></i>
                    Описание канала
                </div>
                ${userRoleInCurrentChannel === 'admin' ? `
                <button class="edit-description-btn" onclick="showEditDescriptionModal('${channelId}')">
                    <i class="fas fa-edit"></i> Редактировать
                </button>
                ` : ''}
            </div>
            <div class="channel-description-content">${escapeHtml(description)}</div>
        `;
        
        // Вставляем описание в начало контейнера сообщений
        if (messagesContainer.firstChild) {
            messagesContainer.insertBefore(descriptionElement, messagesContainer.firstChild);
        } else {
            messagesContainer.appendChild(descriptionElement);
        }
    });
}

// Добавление описания в информацию о канале
function addDescriptionToChannelInfo(channelId) {
    if (!channelId) return;
    
    database.ref('channels/' + channelId).once('value').then((snapshot) => {
        if (!snapshot.exists()) return;
        
        const channel = snapshot.val();
        const description = channel.description || '';
        
        const modal = document.querySelector('.modal.active');
        if (!modal) return;
        
        const profileInfo = modal.querySelector('.profile-info');
        if (!profileInfo) return;
        
        // Проверяем, не добавлено ли уже описание
        const existingDescription = modal.querySelector('.channel-info-description');
        if (existingDescription) {
            existingDescription.remove();
        }
        
        const descriptionElement = document.createElement('div');
        descriptionElement.className = 'channel-info-description';
        
        descriptionElement.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; color: #9b59b6;">
                <i class="fas fa-info-circle"></i>
                Описание канала
            </div>
            <div style="font-size: 13px; line-height: 1.4; white-space: pre-wrap;">
                ${description.trim() ? escapeHtml(description) : '<span style="opacity: 0.7; font-style: italic;">Описание отсутствует</span>'}
            </div>
            ${userRoleInCurrentChannel === 'admin' ? `
            <div style="margin-top: 10px; text-align: center;">
                <button class="edit-description-btn" onclick="showEditDescriptionModal('${channelId}'); closeActiveModal();" style="padding: 6px 12px;">
                    <i class="fas fa-edit"></i> Редактировать описание
                </button>
            </div>
            ` : ''}
        `;
        
        // Вставляем описание после основного блока информации
        profileInfo.parentNode.insertBefore(descriptionElement, profileInfo.nextSibling);
    });
}

// Модальное окно редактирования описания
function showEditDescriptionModal(channelId) {
    closeActiveModal();
    
    database.ref('channels/' + channelId).once('value').then((snapshot) => {
        if (!snapshot.exists()) return;
        
        const channel = snapshot.val();
        const currentDescription = channel.description || '';
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.zIndex = '1001';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; animation: scaleIn 0.3s ease;">
                <h3 style="margin-bottom: 15px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-edit" style="color: #9b59b6;"></i>
                    Редактирование описания канала
                </h3>
                
                <div style="margin-bottom: 20px;">
                    <div style="margin-bottom: 10px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-info-circle" style="color: #9b59b6;"></i>
                            Описание канала
                        </label>
                        <textarea 
                            id="channelDescriptionInput" 
                            class="description-textarea" 
                            placeholder="Добавьте описание для вашего канала... Максимум 500 символов"
                            maxlength="500"
                        >${escapeHtml(currentDescription)}</textarea>
                        <div id="descriptionCharCount" class="description-char-count">${currentDescription.length}/500</div>
                    </div>
                    
                    <div style="background: var(--info-bg, rgba(52, 152, 219, 0.1)); padding: 12px; border-radius: 8px;">
                        <div style="display: flex; align-items: flex-start; gap: 10px;">
                            <i class="fas fa-lightbulb" style="color: #f39c12; margin-top: 2px;"></i>
                            <div style="font-size: 13px; line-height: 1.4;">
                                <strong>Советы для описания:</strong><br>
                                • Кратко опишите тему канала<br>
                                • Укажите правила поведения<br>
                                • Добавьте контактную информацию<br>
                                • Максимум 500 символов
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-buttons" style="display: flex; gap: 10px;">
                    <button class="modal-btn primary" id="saveDescriptionBtn" style="flex: 1; transition: all 0.3s ease;">
                        <i class="fas fa-save"></i> Сохранить описание
                    </button>
                    <button class="modal-btn secondary" id="cancelDescriptionBtn" style="flex: 1; transition: all 0.3s ease;">Отмена</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        activeModal = modal;
        
        // Обработчик счетчика символов
        const textarea = document.getElementById('channelDescriptionInput');
        const charCount = document.getElementById('descriptionCharCount');
        
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = `${length}/500`;
            
            if (length > 450) {
                charCount.className = 'description-char-count warning';
            } else if (length >= 500) {
                charCount.className = 'description-char-count error';
            } else {
                charCount.className = 'description-char-count';
            }
        });
        
        // Фокус на текстовое поле
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }, 100);
        
        // Обработчики кнопок
        document.getElementById('saveDescriptionBtn').addEventListener('click', () => {
            saveChannelDescription(channelId);
        });
        
        document.getElementById('cancelDescriptionBtn').addEventListener('click', () => {
            closeActiveModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeActiveModal();
            }
        });
        
        // Закрытие по ESC
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                closeActiveModal();
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
    });
}

// Сохранение описания канала
function saveChannelDescription(channelId) {
    const descriptionInput = document.getElementById('channelDescriptionInput');
    const description = descriptionInput.value.trim();
    
    if (description.length > 500) {
        showNotification("❌ Описание не должно превышать 500 символов");
        return;
    }
    
    // Блокируем кнопку сохранения
    const saveBtn = document.getElementById('saveDescriptionBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
    
    database.ref('channels/' + channelId).update({
        description: description
    })
    .then(() => {
        showNotification("✅ Описание канала сохранено");
        closeActiveModal();
        
        // Обновляем отображение описания в канале
        addDescriptionToChannel(channelId);
        
        // Обновляем информацию в списке каналов если нужно
        updateChannelListDescription(channelId, description);
    })
    .catch((error) => {
        console.error("❌ Ошибка сохранения описания:", error);
        showNotification("❌ Ошибка сохранения описания");
        
        // Разблокируем кнопку
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить описание';
    });
}

// Обновление описания в списке каналов
function updateChannelListDescription(channelId, description) {
    const channelItem = document.querySelector(`[data-channel-id="${channelId}"]`);
    if (channelItem && description) {
        const metaInfo = channelItem.querySelector('.channel-meta-info');
        if (metaInfo) {
            // Добавляем или обновляем описание в списке
            let descriptionElement = metaInfo.querySelector('.channel-description-preview');
            if (!descriptionElement) {
                descriptionElement = document.createElement('div');
                descriptionElement.className = 'channel-description-preview';
                descriptionElement.style.cssText = `
                    font-size: 11px;
                    opacity: 0.8;
                    margin-top: 2px;
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                `;
                metaInfo.appendChild(descriptionElement);
            }
            descriptionElement.textContent = description;
        }
    }
}

// Патч модального окна создания канала
function patchCreateChannelModal() {
    // Перехватываем функцию показа модального окна создания канала
    if (window.showCreateChannelModal) {
        const originalShowCreateChannel = window.showCreateChannelModal;
        window.showCreateChannelModal = function() {
            // Сначала вызываем оригинальную функцию
            originalShowCreateChannel.call(this);
            
            // Затем модифицируем модальное окно
            setTimeout(() => {
                enhanceCreateChannelModal();
            }, 100);
        };
    }
}

// Улучшение модального окна создания канала
function enhanceCreateChannelModal() {
    const modal = document.querySelector('.modal.active');
    if (!modal) return;
    
    const descriptionInput = modal.querySelector('#channelDescriptionInput');
    if (descriptionInput) return; // Уже добавлено
    
    // Находим контейнер для вставки
    const nameInput = modal.querySelector('#channelNameInput');
    if (!nameInput) return;
    
    // Создаем текстовое поле для описания
    const descriptionContainer = document.createElement('div');
    descriptionContainer.style.marginBottom = '15px';
    
    descriptionContainer.innerHTML = `
        <textarea 
            id="channelDescriptionInput" 
            placeholder="Описание канала (необязательно, максимум 500 символов)" 
            style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); height: 80px; resize: vertical; font-size: 14px; transition: border-color 0.3s ease; margin-top: 10px;"
            maxlength="500"
        ></textarea>
        <div id="createDescriptionCharCount" style="text-align: right; font-size: 12px; opacity: 0.7; margin-top: 5px;">0/500</div>
    `;
    
    // Вставляем после поля названия
    nameInput.parentNode.insertBefore(descriptionContainer, nameInput.nextSibling);
    
    // Обработчик счетчика символов
    const textarea = descriptionContainer.querySelector('textarea');
    const charCount = descriptionContainer.querySelector('#createDescriptionCharCount');
    
    textarea.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/500`;
        
        if (length > 450) {
            charCount.style.color = '#f39c12';
        } else if (length >= 500) {
            charCount.style.color = '#e74c3c';
        } else {
            charCount.style.color = '';
        }
    });
    
    // Анимация фокуса
    textarea.addEventListener('focus', function() {
        this.style.borderColor = '#4facfe';
    });
    
    textarea.addEventListener('blur', function() {
        this.style.borderColor = 'var(--border-color)';
    });
}

// Патч настроек канала для добавления редактирования описания
function patchChannelSettings() {
    if (window.showChannelSettings) {
        const originalShowSettings = window.showChannelSettings;
        window.showChannelSettings = function(channelId) {
            // Сначала вызываем оригинальную функцию
            const result = originalShowSettings.call(this, channelId);
            
            // Затем добавляем секцию описания
            setTimeout(() => {
                addDescriptionToChannelSettings(channelId);
            }, 100);
            
            return result;
        };
    }
}

// Добавление редактирования описания в настройки канала
function addDescriptionToChannelSettings(channelId) {
    const modal = document.querySelector('.modal.active');
    if (!modal) return;
    
    database.ref('channels/' + channelId).once('value').then((snapshot) => {
        if (!snapshot.exists()) return;
        
        const channel = snapshot.val();
        const currentDescription = channel.description || '';
        
        const settingsSection = modal.querySelector('.settings-section');
        if (!settingsSection) return;
        
        // Проверяем, не добавлено ли уже описание
        if (modal.querySelector('.description-settings-section')) return;
        
        const descriptionSection = document.createElement('div');
        descriptionSection.className = 'description-settings-section';
        descriptionSection.style.cssText = `
            background: var(--hover-color);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            border-left: 3px solid #9b59b6;
        `;
        
        descriptionSection.innerHTML = `
            <h4 style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-info-circle" style="color: #9b59b6;"></i>
                Описание канала
            </h4>
            <div style="margin-bottom: 10px;">
                <textarea 
                    id="settingsDescriptionInput" 
                    placeholder="Добавьте описание для вашего канала..." 
                    style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); height: 100px; resize: vertical; font-size: 14px; margin-bottom: 8px;"
                    maxlength="500"
                >${escapeHtml(currentDescription)}</textarea>
                <div id="settingsCharCount" style="text-align: right; font-size: 12px; opacity: 0.7;">${currentDescription.length}/500</div>
            </div>
            <button id="updateDescriptionBtn" style="width: 100%; padding: 10px; background: #9b59b6; color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;">
                <i class="fas fa-save"></i> Обновить описание
            </button>
        `;
        
        // Вставляем в начало настроек
        settingsSection.parentNode.insertBefore(descriptionSection, settingsSection);
        
        // Обработчик счетчика символов
        const textarea = document.getElementById('settingsDescriptionInput');
        const charCount = document.getElementById('settingsCharCount');
        
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = `${length}/500`;
            
            if (length > 450) {
                charCount.style.color = '#f39c12';
            } else if (length >= 500) {
                charCount.style.color = '#e74c3c';
            } else {
                charCount.style.color = '';
            }
        });
        
        // Обработчик кнопки обновления
        document.getElementById('updateDescriptionBtn').addEventListener('click', () => {
            updateDescriptionFromSettings(channelId);
        });
        
        // Анимация кнопки
        const updateBtn = document.getElementById('updateDescriptionBtn');
        updateBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        });
        
        updateBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
}

// Обновление описания из настроек
function updateDescriptionFromSettings(channelId) {
    const descriptionInput = document.getElementById('settingsDescriptionInput');
    const description = descriptionInput.value.trim();
    
    if (description.length > 500) {
        showNotification("❌ Описание не должно превышать 500 символов");
        return;
    }
    
    const updateBtn = document.getElementById('updateDescriptionBtn');
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обновление...';
    
    database.ref('channels/' + channelId).update({
        description: description
    })
    .then(() => {
        showNotification("✅ Описание канала обновлено");
        
        // Обновляем отображение в канале
        addDescriptionToChannel(channelId);
        
        // Восстанавливаем кнопку
        setTimeout(() => {
            updateBtn.disabled = false;
            updateBtn.innerHTML = '<i class="fas fa-save"></i> Обновить описание';
        }, 1000);
    })
    .catch((error) => {
        console.error("❌ Ошибка обновления описания:", error);
        showNotification("❌ Ошибка обновления описания");
        
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="fas fa-save"></i> Обновить описание';
    });
}

// Вспомогательная функция для экранирования HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Channel Descriptions System загружается...");
    
    // Ждем загрузки системы каналов
    const initInterval = setInterval(() => {
        if (typeof database !== 'undefined' && userId) {
            clearInterval(initInterval);
            setTimeout(initChannelDescriptions, 2000);
        }
    }, 500);
    
    // Резервная инициализация
    setTimeout(() => {
        console.log("🔄 Резервная инициализация системы описаний...");
        initChannelDescriptions();
    }, 8000);
});

// Глобальные функции
window.ChannelDescriptions = {
    init: initChannelDescriptions,
    showEditModal: showEditDescriptionModal,
    version: '1.0'
};

console.log("✅ Channel Descriptions System loaded successfully!");