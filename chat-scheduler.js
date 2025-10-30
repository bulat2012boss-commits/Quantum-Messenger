// Файл: chat-customization.js
// Улучшенные настройки кастомизации чатов

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        initChatCustomization();
    }, 100);
});

function initChatCustomization() {
    const burgerMenuContent = document.getElementById('burgerMenuContent');
    
    if (!burgerMenuContent) {
        console.error('Бургер-меню не найдено!');
        return;
    }
    
    // Создаем пункт меню для кастомизации чатов
    const chatCustomizationItem = document.createElement('div');
    chatCustomizationItem.className = 'burger-menu-item';
    chatCustomizationItem.id = 'chatCustomizationBtn';
    chatCustomizationItem.innerHTML = '<i class="fas fa-palette"></i> Кастомизация чатов';
    
    // Находим элемент "Тема" и вставляем после него
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn && themeBtn.parentNode) {
        themeBtn.parentNode.insertBefore(chatCustomizationItem, themeBtn.nextSibling);
    } else {
        burgerMenuContent.appendChild(chatCustomizationItem);
    }
    
    createChatCustomizationModal();
    loadChatCustomizationSettings();
    setupEventListeners();
    adaptForMobile();
}

function createChatCustomizationModal() {
    const chatCustomizationModal = document.createElement('div');
    chatCustomizationModal.className = 'modal';
    chatCustomizationModal.id = 'chatCustomizationModal';
    chatCustomizationModal.innerHTML = `
        <div class="modal-content">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px; color: #4facfe;">
                    <i class="fas fa-edit"></i>
                </div>
                <h3 style="margin-bottom: 5px;">Кастомизация чатов</h3>
                <p style="opacity: 0.8; font-size: 14px;">
                    Настройте внешний вид сообщений под себя
                </p>
            </div>
            
            <div class="settings-section">
                <h4><i class="fas fa-font"></i> Размер текста</h4>
                
                <!-- Индикатор текущего размера -->
                <div class="size-indicator" style="text-align: center; margin: 15px 0; padding: 10px; background: var(--search-bg); border-radius: 10px;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">Текущий размер</div>
                    <div id="currentSizeDisplay" style="font-size: 24px; font-weight: bold; color: #4facfe;">14px</div>
                </div>
                
                <!-- Быстрые пресеты -->
                <div class="preset-buttons" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 20px 0;">
                    <button class="preset-btn" data-size="12" style="padding: 12px; border: 2px solid var(--border-color); border-radius: 10px; background: var(--action-btn-bg); color: var(--text-color); cursor: pointer; transition: all 0.3s;">
                        <div style="font-size: 10px;">A</div>
                        <div style="font-size: 10px; margin-top: 5px;">Маленький</div>
                    </button>
                    <button class="preset-btn" data-size="14" style="padding: 12px; border: 2px solid var(--border-color); border-radius: 10px; background: var(--action-btn-bg); color: var(--text-color); cursor: pointer; transition: all 0.3s;">
                        <div style="font-size: 12px;">A</div>
                        <div style="font-size: 10px; margin-top: 5px;">Стандарт</div>
                    </button>
                    <button class="preset-btn" data-size="16" style="padding: 12px; border: 2px solid var(--border-color); border-radius: 10px; background: var(--action-btn-bg); color: var(--text-color); cursor: pointer; transition: all 0.3s;">
                        <div style="font-size: 14px;">A</div>
                        <div style="font-size: 10px; margin-top: 5px;">Большой</div>
                    </button>
                    <button class="preset-btn" data-size="18" style="padding: 12px; border: 2px solid var(--border-color); border-radius: 10px; background: var(--action-btn-bg); color: var(--text-color); cursor: pointer; transition: all 0.3s;">
                        <div style="font-size: 16px;">A</div>
                        <div style="font-size: 10px; margin-top: 5px;">Огромный</div>
                    </button>
                </div>
                
                <!-- Точная настройка -->
                <div class="custom-control" style="margin: 25px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <span style="font-weight: 500;">Точная настройка:</span>
                        <span id="customSizeValue" style="font-weight: bold; color: #4facfe; font-size: 16px;">14px</span>
                    </div>
                    <div style="position: relative;">
                        <input type="range" id="fontSizeSlider" min="10" max="22" value="14" step="1" 
                               style="width: 100%; height: 6px; border-radius: 3px; background: var(--search-bg); outline: none;">
                        <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                            <span style="font-size: 10px; opacity: 0.7;">10px</span>
                            <span style="font-size: 10px; opacity: 0.7;">22px</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Предпросмотр в реальном времени -->
            <div class="settings-section">
                <h4><i class="fas fa-eye"></i> Предпросмотр</h4>
                <div class="live-preview" style="background: var(--search-bg); padding: 20px; border-radius: 15px; margin-top: 15px;">
                    <div class="preview-header" style="text-align: center; margin-bottom: 15px;">
                        <div class="preview-avatar" style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #4facfe, #00f2fe); margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">
                            Я
                        </div>
                        <div style="font-weight: bold;">Ваш чат</div>
                        <div style="font-size: 12px; opacity: 0.7;">сегодня</div>
                    </div>
                    
                    <div class="preview-messages" style="display: flex; flex-direction: column; gap: 10px;">
                        <div class="preview-message my-message" style="align-self: flex-end; max-width: 80%; padding: 12px 15px; border-radius: 18px; background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);">
                            Привет! Как дела?
                        </div>
                        <div class="preview-message other-message" style="align-self: flex-start; max-width: 80%; padding: 12px 15px; border-radius: 18px; background: var(--other-msg-bg); color: var(--text-color); border: 1px solid var(--border-color);">
                            Отлично! Смотри как круто выглядит чат 👍
                        </div>
                        <div class="preview-message my-message" style="align-self: flex-end; max-width: 70%; padding: 12px 15px; border-radius: 18px; background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);">
                            Да, очень удобно читать!
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Дополнительные опции -->
            <div class="settings-section">
                <h4><i class="fas fa-sliders-h"></i> Дополнительно</h4>
                <div class="additional-options" style="display: grid; gap: 10px; margin-top: 15px;">
                    <label class="option-toggle" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--action-btn-bg); border-radius: 10px; cursor: pointer;">
                        <span>Жирный шрифт в сообщениях</span>
                        <label class="switch">
                            <input type="checkbox" id="boldTextToggle">
                            <span class="slider"></span>
                        </label>
                    </label>
                    
                    <label class="option-toggle" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--action-btn-bg); border-radius: 10px; cursor: pointer;">
                        <span>Увеличить межстрочный интервал</span>
                        <label class="switch">
                            <input type="checkbox" id="lineHeightToggle">
                            <span class="slider"></span>
                        </label>
                    </label>
                    
                    <label class="option-toggle" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--action-btn-bg); border-radius: 10px; cursor: pointer;">
                        <span>Показывать размер шрифта в %</span>
                        <label class="switch">
                            <input type="checkbox" id="showPercentageToggle">
                            <span class="slider"></span>
                        </label>
                    </label>
                </div>
            </div>
            
            <!-- Статистика -->
            <div class="stats-section" style="background: var(--search-bg); padding: 15px; border-radius: 10px; margin: 20px 0; text-align: center;">
                <div style="display: flex; justify-content: space-around;">
                    <div>
                        <div style="font-size: 24px; font-weight: bold; color: #4facfe;" id="readabilityScore">95%</div>
                        <div style="font-size: 12px; opacity: 0.7;">Удобочитаемость</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold; color: #4facfe;" id="messageCount">0</div>
                        <div style="font-size: 12px; opacity: 0.7;">Сообщений/экран</div>
                    </div>
                </div>
            </div>
            
            <!-- Кнопки действий -->
            <div class="action-buttons" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
                <button class="action-btn secondary" id="testInRealChatBtn" style="padding: 12px; border: 2px solid var(--border-color); border-radius: 10px; background: transparent; color: var(--text-color); cursor: pointer; transition: all 0.3s;">
                    <i class="fas fa-comments"></i> Тест в чате
                </button>
                <button class="action-btn secondary" id="resetChatCustomizationBtn" style="padding: 12px; border: 2px solid var(--border-color); border-radius: 10px; background: transparent; color: var(--text-color); cursor: pointer; transition: all 0.3s;">
                    <i class="fas fa-undo"></i> Сброс
                </button>
                <button class="action-btn primary" id="saveChatCustomizationBtn" style="padding: 12px; border: none; border-radius: 10px; background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; cursor: pointer; font-weight: bold; grid-column: 1 / -1; transition: all 0.3s;">
                    <i class="fas fa-check"></i> Применить настройки
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(chatCustomizationModal);
}

function setupEventListeners() {
    // Основная кнопка
    document.getElementById('chatCustomizationBtn').addEventListener('click', showChatCustomizationModal);
    
    // Кнопки закрытия/сохранения
    document.getElementById('saveChatCustomizationBtn').addEventListener('click', saveChatCustomizationSettings);
    document.getElementById('resetChatCustomizationBtn').addEventListener('click', resetChatCustomizationSettings);
    document.getElementById('testInRealChatBtn').addEventListener('click', testInRealChat);
    
    // Пресеты
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const size = this.getAttribute('data-size');
            setFontSizeByPreset(size);
            highlightActivePreset(this);
        });
    });
    
    // Слайдер
    document.getElementById('fontSizeSlider').addEventListener('input', function() {
        updateFontSizePreview(this.value);
        updateReadabilityStats(this.value);
        highlightMatchingPreset(this.value);
    });
    
    // Переключатели
    document.getElementById('boldTextToggle').addEventListener('change', updatePreview);
    document.getElementById('lineHeightToggle').addEventListener('change', updatePreview);
    document.getElementById('showPercentageToggle').addEventListener('change', togglePercentageDisplay);
}

function showChatCustomizationModal() {
    const modal = document.getElementById('chatCustomizationModal');
    modal.classList.add('active');
    document.getElementById('burgerMenuContent').classList.remove('active');
    
    // Показываем текущие настройки
    updateAllPreviews();
    updateReadabilityStats(document.getElementById('fontSizeSlider').value);
}

function loadChatCustomizationSettings() {
    const savedSettings = localStorage.getItem('quantumChatCustomization');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        applyChatCustomization(settings);
        
        if (settings.fontSize) {
            const fontSizeValue = parseInt(settings.fontSize);
            document.getElementById('fontSizeSlider').value = fontSizeValue;
            updateFontSizePreview(fontSizeValue);
            highlightMatchingPreset(fontSizeValue);
        }
        
        // Загружаем дополнительные настройки
        if (settings.boldText !== undefined) {
            document.getElementById('boldTextToggle').checked = settings.boldText;
        }
        if (settings.lineHeight !== undefined) {
            document.getElementById('lineHeightToggle').checked = settings.lineHeight;
        }
        if (settings.showPercentage !== undefined) {
            document.getElementById('showPercentageToggle').checked = settings.showPercentage;
        }
    }
}

function saveChatCustomizationSettings() {
    const fontSize = document.getElementById('fontSizeSlider').value;
    const boldText = document.getElementById('boldTextToggle').checked;
    const lineHeight = document.getElementById('lineHeightToggle').checked;
    const showPercentage = document.getElementById('showPercentageToggle').checked;
    
    const settings = {
        fontSize: fontSize + 'px',
        boldText: boldText,
        lineHeight: lineHeight,
        showPercentage: showPercentage,
        lastUpdated: Date.now()
    };
    
    localStorage.setItem('quantumChatCustomization', JSON.stringify(settings));
    applyChatCustomization(settings);
    
    showAdvancedNotification("Настройки чатов применены", "success");
    document.getElementById('chatCustomizationModal').classList.remove('active');
}

function resetChatCustomizationSettings() {
    if (confirm("Сбросить все настройки кастомизации к значениям по умолчанию?")) {
        localStorage.removeItem('quantumChatCustomization');
        document.getElementById('fontSizeSlider').value = 14;
        document.getElementById('boldTextToggle').checked = false;
        document.getElementById('lineHeightToggle').checked = false;
        document.getElementById('showPercentageToggle').checked = false;
        
        updateFontSizePreview(14);
        highlightMatchingPreset(14);
        removeChatCustomization();
        
        showAdvancedNotification("Настройки сброшены", "info");
    }
}

function applyChatCustomization(settings) {
    let styleElement = document.getElementById('chat-customization-styles');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'chat-customization-styles';
        document.head.appendChild(styleElement);
    }
    
    let css = '';
    
    if (settings.fontSize) {
        css += `
            .message {
                font-size: ${settings.fontSize} !important;
            }
            .chat-item-last-message {
                font-size: ${parseInt(settings.fontSize) - 1}px !important;
            }
            .user-item-status {
                font-size: ${parseInt(settings.fontSize) - 2}px !important;
            }
            .timestamp {
                font-size: ${parseInt(settings.fontSize) - 3}px !important;
            }
            .sender {
                font-size: ${parseInt(settings.fontSize) - 3}px !important;
            }
        `;
    }
    
    if (settings.boldText) {
        css += `
            .message {
                font-weight: 600 !important;
            }
        `;
    }
    
    if (settings.lineHeight) {
        css += `
            .message {
                line-height: 1.6 !important;
            }
        `;
    }
    
    styleElement.textContent = css;
}

function removeChatCustomization() {
    const styleElement = document.getElementById('chat-customization-styles');
    if (styleElement) {
        styleElement.remove();
    }
}

function setFontSizeByPreset(size) {
    document.getElementById('fontSizeSlider').value = size;
    updateFontSizePreview(size);
    updateReadabilityStats(size);
}

function updateFontSizePreview(size) {
    document.getElementById('currentSizeDisplay').textContent = size + 'px';
    document.getElementById('customSizeValue').textContent = size + 'px';
    
    // Обновляем предпросмотр сообщений
    const previewMessages = document.querySelectorAll('.preview-message');
    previewMessages.forEach(msg => {
        msg.style.fontSize = size + 'px';
    });
    
    // Обновляем отображение в процентах если включено
    if (document.getElementById('showPercentageToggle').checked) {
        const percentage = Math.round((size / 14) * 100);
        document.getElementById('currentSizeDisplay').textContent = percentage + '%';
    }
}

function updateAllPreviews() {
    const currentSize = document.getElementById('fontSizeSlider').value;
    updateFontSizePreview(parseInt(currentSize));
    updatePreview();
}

function updatePreview() {
    const boldText = document.getElementById('boldTextToggle').checked;
    const lineHeight = document.getElementById('lineHeightToggle').checked;
    
    const previewMessages = document.querySelectorAll('.preview-message');
    previewMessages.forEach(msg => {
        msg.style.fontWeight = boldText ? '600' : '400';
        msg.style.lineHeight = lineHeight ? '1.6' : '1.4';
    });
}

function updateReadabilityStats(size) {
    const score = Math.min(100, Math.max(60, 70 + (size - 12) * 5));
    const messagesPerScreen = Math.max(3, Math.min(8, 10 - (size - 12) * 0.7));
    
    document.getElementById('readabilityScore').textContent = Math.round(score) + '%';
    document.getElementById('messageCount').textContent = Math.round(messagesPerScreen);
}

function highlightActivePreset(activeBtn) {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.style.background = 'var(--action-btn-bg)';
        btn.style.borderColor = 'var(--border-color)';
        btn.style.transform = 'scale(1)';
    });
    
    activeBtn.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';
    activeBtn.style.borderColor = '#4facfe';
    activeBtn.style.color = 'white';
    activeBtn.style.transform = 'scale(1.05)';
}

function highlightMatchingPreset(size) {
    const presets = document.querySelectorAll('.preset-btn');
    let matched = false;
    
    presets.forEach(btn => {
        if (btn.getAttribute('data-size') === size) {
            highlightActivePreset(btn);
            matched = true;
        }
    });
    
    if (!matched) {
        presets.forEach(btn => {
            btn.style.background = 'var(--action-btn-bg)';
            btn.style.borderColor = 'var(--border-color)';
            btn.style.color = 'var(--text-color)';
            btn.style.transform = 'scale(1)';
        });
    }
}

function togglePercentageDisplay() {
    const showPercentage = document.getElementById('showPercentageToggle').checked;
    const currentSize = document.getElementById('fontSizeSlider').value;
    
    if (showPercentage) {
        const percentage = Math.round((currentSize / 14) * 100);
        document.getElementById('currentSizeDisplay').textContent = percentage + '%';
    } else {
        document.getElementById('currentSizeDisplay').textContent = currentSize + 'px';
    }
}

function testInRealChat() {
    const modal = document.getElementById('chatCustomizationModal');
    modal.classList.remove('active');
    
    // Показываем уведомление с подсказкой
    showAdvancedNotification("Перейдите в любой чат чтобы протестировать настройки", "info", 4000);
    
    // Автоматически применяем настройки для теста
    const fontSize = document.getElementById('fontSizeSlider').value;
    const boldText = document.getElementById('boldTextToggle').checked;
    const lineHeight = document.getElementById('lineHeightToggle').checked;
    
    const testSettings = {
        fontSize: fontSize + 'px',
        boldText: boldText,
        lineHeight: lineHeight,
        isTest: true
    };
    
    applyChatCustomization(testSettings);
}

function showAdvancedNotification(message, type = "info", duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification advanced';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" 
               style="color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed; 
        top: 80px; 
        right: 20px; 
        background: var(--header-bg); 
        color: var(--text-color); 
        padding: 15px 20px; 
        border-radius: 12px; 
        z-index: 10000; 
        animation: slideInRight 0.4s ease;
        border-left: 4px solid ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        max-width: 350px;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.4s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }
    }, duration);
}

function adaptForMobile() {
    const modal = document.getElementById('chatCustomizationModal');
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal-content');
    if (window.innerWidth <= 768) {
        modalContent.style.width = '95%';
        modalContent.style.maxWidth = '95%';
        modalContent.style.padding = '15px';
        modalContent.style.margin = '10px auto';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflowY = 'auto';
        
        // Адаптируем пресеты для мобильных
        const presetGrid = modal.querySelector('.preset-buttons');
        if (presetGrid) {
            presetGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            presetGrid.style.gap = '6px';
        }
        
        // Адаптируем кнопки действий
        const actionButtons = modal.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.style.gridTemplateColumns = '1fr';
        }
    } else {
        modalContent.style.width = '';
        modalContent.style.maxWidth = '500px';
        modalContent.style.padding = '';
        modalContent.style.margin = '';
        modalContent.style.maxHeight = '';
        
        const presetGrid = modal.querySelector('.preset-buttons');
        if (presetGrid) {
            presetGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            presetGrid.style.gap = '8px';
        }
        
        const actionButtons = modal.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.style.gridTemplateColumns = '1fr 1fr';
        }
    }
}

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
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
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .preset-btn:hover, .action-btn:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }
    
    .action-btn.primary:hover {
        transform: translateY(-2px) scale(1.02) !important;
    }
`;
document.head.appendChild(style);

// Слушаем изменения размера окна
window.addEventListener('resize', adaptForMobile);

// Инициализация при загрузке
setTimeout(adaptForMobile, 200);