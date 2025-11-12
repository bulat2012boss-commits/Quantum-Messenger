// Файл: chat-customization.js
// Улучшенные настройки кастомизации чатов с углами сообщений

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        initChatCustomization();
        initMessageCorners();
    }, 100);
});

// ===== СИСТЕМА УГЛОВ СООБЩЕНИЙ =====
let messageCorners;

function initMessageCorners() {
    messageCorners = {
        cornerRadius: 15,
        loadSettings: function() {
            const savedRadius = localStorage.getItem('quantumMessageCornerRadius');
            if (savedRadius !== null) {
                this.cornerRadius = parseInt(savedRadius);
            }
        },
        saveSettings: function() {
            localStorage.setItem('quantumMessageCornerRadius', this.cornerRadius.toString());
        },
        applySettings: function() {
            const styleId = 'message-corners-style';
            let styleElement = document.getElementById(styleId);
            
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }

            styleElement.textContent = `
                .message {
                    border-radius: ${this.cornerRadius}px !important;
                }
                
                .my-message {
                    border-bottom-right-radius: ${Math.max(this.cornerRadius - 8, 4)}px !important;
                }
                
                .other-message {
                    border-bottom-left-radius: ${Math.max(this.cornerRadius - 8, 4)}px !important;
                }
            `;
        },
        updateCornerRadius: function(radius) {
            this.cornerRadius = radius;
            this.applySettings();
            this.saveSettings();
            this.updatePreview(radius);
        },
        resetToDefault: function() {
            this.cornerRadius = 15;
            this.applySettings();
            this.saveSettings();
            this.updatePreview(15);
            return this.cornerRadius;
        },
        updatePreview: function(radius) {
            const previewMessages = document.querySelectorAll('.preview-message');
            previewMessages.forEach(msg => {
                msg.style.borderRadius = radius + 'px';
                
                if (msg.classList.contains('my-message')) {
                    msg.style.borderBottomRightRadius = Math.max(radius - 8, 4) + 'px';
                } else {
                    msg.style.borderBottomLeftRadius = Math.max(radius - 8, 4) + 'px';
                }
            });
            
            const cornerValue = document.getElementById('cornerRadiusValue');
            if (cornerValue) {
                cornerValue.textContent = radius + 'px';
            }
        },
        getCurrentRadius: function() {
            return this.cornerRadius;
        }
    };
    
    messageCorners.loadSettings();
    messageCorners.applySettings();
}

function initChatCustomization() {
    const burgerMenuContent = document.getElementById('burgerMenuContent');
    
    if (!burgerMenuContent) {
        return;
    }
    
    const chatCustomizationItem = document.createElement('div');
    chatCustomizationItem.className = 'burger-menu-item';
    chatCustomizationItem.id = 'chatCustomizationBtn';
    chatCustomizationItem.innerHTML = '<i class="fas fa-palette"></i> Кастомизация чатов';
    
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn && themeBtn.parentNode) {
        themeBtn.parentNode.insertBefore(chatCustomizationItem, themeBtn.nextSibling);
    } else {
        burgerMenuContent.appendChild(chatCustomizationItem);
    }
    
    createChatCustomizationModal();
    loadChatCustomizationSettings();
    setupEventListeners();
}

function createChatCustomizationModal() {
    const chatCustomizationModal = document.createElement('div');
    chatCustomizationModal.className = 'modal';
    chatCustomizationModal.id = 'chatCustomizationModal';
    chatCustomizationModal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 20px; text-align: center;">
                <i class="fas fa-edit"></i> Кастомизация чатов
            </h3>
            
            <!-- Размер текста -->
            <div class="settings-section">
                <h4><i class="fas fa-font"></i> Размер текста</h4>
                
                <div class="custom-control" style="margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-weight: 500;">Размер текста:</span>
                        <span id="customSizeValue" style="font-weight: bold; color: #4facfe; font-size: 16px;">14px</span>
                    </div>
                    <input type="range" id="fontSizeSlider" min="10" max="22" value="14" step="1" 
                           style="width: 100%; height: 6px; border-radius: 3px; background: var(--search-bg); outline: none;">
                    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                        <span style="font-size: 11px; opacity: 0.7;">10px</span>
                        <span style="font-size: 11px; opacity: 0.7;">22px</span>
                    </div>
                </div>
            </div>
            
            <!-- Предпросмотр -->
            <div class="settings-section">
                <h4><i class="fas fa-eye"></i> Предпросмотр</h4>
                <div class="live-preview" style="background: var(--search-bg); padding: 15px; border-radius: 12px; margin-top: 10px;">
                    <div class="preview-messages" style="display: flex; flex-direction: column; gap: 8px;">
                        <div class="preview-message other-message" style="align-self: flex-start; max-width: 80%; padding: 10px 12px; background: var(--other-msg-bg); color: var(--text-color); border: 1px solid var(--border-color);">
                            Привет! Как дела?
                        </div>
                        <div class="preview-message my-message" style="align-self: flex-end; max-width: 80%; padding: 10px 12px; background: linear-gradient(135deg, #4facfe, #00f2fe); color: white;">
                            Отлично! Смотри как круто выглядит чат 👍
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Углы сообщений -->
            <div class="settings-section">
                <h4><i class="fas fa-shapes"></i> Углы сообщений</h4>
                
                <div class="corner-control" style="margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-weight: 500;">Скругление углов:</span>
                        <span id="cornerRadiusValue" style="font-weight: bold; color: #4facfe; font-size: 16px;">${messageCorners ? messageCorners.getCurrentRadius() + 'px' : '15px'}</span>
                    </div>
                    <input type="range" id="cornerRadiusSlider" min="0" max="30" value="${messageCorners ? messageCorners.getCurrentRadius() : 15}" step="1" 
                           style="width: 100%; height: 6px; border-radius: 3px; background: var(--search-bg); outline: none;">
                    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                        <span style="font-size: 11px; opacity: 0.7;">Острые</span>
                        <span style="font-size: 11px; opacity: 0.7;">Скругленные</span>
                    </div>
                </div>
            </div>
            
            <!-- Дополнительные опции -->
            <div class="settings-section">
                <h4><i class="fas fa-sliders-h"></i> Дополнительно</h4>
                <div class="additional-options" style="display: grid; gap: 8px; margin-top: 10px;">
                    <label class="option-toggle" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--action-btn-bg); border-radius: 8px; cursor: pointer;">
                        <span>Жирный шрифт</span>
                        <label class="switch">
                            <input type="checkbox" id="boldTextToggle">
                            <span class="slider"></span>
                        </label>
                    </label>
                    
                    <label class="option-toggle" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--action-btn-bg); border-radius: 8px; cursor: pointer;">
                        <span>Увеличить межстрочный интервал</span>
                        <label class="switch">
                            <input type="checkbox" id="lineHeightToggle">
                            <span class="slider"></span>
                        </label>
                    </label>
                </div>
            </div>
            
            <!-- Кнопки действий -->
            <div class="action-buttons" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
                <button class="action-btn secondary" id="resetChatCustomizationBtn" style="padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; background: transparent; color: var(--text-color); cursor: pointer;">
                    <i class="fas fa-undo"></i> Сброс
                </button>
                <button class="action-btn primary" id="saveChatCustomizationBtn" style="padding: 12px; border: none; border-radius: 8px; background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-check"></i> Применить
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(chatCustomizationModal);
}

function setupEventListeners() {
    document.getElementById('chatCustomizationBtn').addEventListener('click', showChatCustomizationModal);
    document.getElementById('saveChatCustomizationBtn').addEventListener('click', saveChatCustomizationSettings);
    document.getElementById('resetChatCustomizationBtn').addEventListener('click', resetChatCustomizationSettings);
    
    document.getElementById('fontSizeSlider').addEventListener('input', function() {
        updateFontSizePreview(this.value);
    });
    
    document.getElementById('cornerRadiusSlider').addEventListener('input', function() {
        const radius = parseInt(this.value);
        messageCorners.updateCornerRadius(radius);
    });
    
    document.getElementById('boldTextToggle').addEventListener('change', updatePreview);
    document.getElementById('lineHeightToggle').addEventListener('change', updatePreview);
}

function showChatCustomizationModal() {
    const modal = document.getElementById('chatCustomizationModal');
    modal.classList.add('active');
    document.getElementById('burgerMenuContent').classList.remove('active');
    
    updateAllPreviews();
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
        }
        
        if (settings.boldText !== undefined) {
            document.getElementById('boldTextToggle').checked = settings.boldText;
        }
        if (settings.lineHeight !== undefined) {
            document.getElementById('lineHeightToggle').checked = settings.lineHeight;
        }
    }
}

function saveChatCustomizationSettings() {
    const fontSize = document.getElementById('fontSizeSlider').value;
    const boldText = document.getElementById('boldTextToggle').checked;
    const lineHeight = document.getElementById('lineHeightToggle').checked;
    
    const settings = {
        fontSize: fontSize + 'px',
        boldText: boldText,
        lineHeight: lineHeight,
        cornerRadius: messageCorners.getCurrentRadius(),
        lastUpdated: Date.now()
    };
    
    localStorage.setItem('quantumChatCustomization', JSON.stringify(settings));
    applyChatCustomization(settings);
    
    showNotification("Настройки чатов применены");
    document.getElementById('chatCustomizationModal').classList.remove('active');
}

function resetChatCustomizationSettings() {
    if (confirm("Сбросить все настройки кастомизации к значениям по умолчанию?")) {
        localStorage.removeItem('quantumChatCustomization');
        document.getElementById('fontSizeSlider').value = 14;
        document.getElementById('boldTextToggle').checked = false;
        document.getElementById('lineHeightToggle').checked = false;
        
        updateFontSizePreview(14);
        removeChatCustomization();
        
        messageCorners.resetToDefault();
        document.getElementById('cornerRadiusSlider').value = 15;
        
        showNotification("Настройки сброшены");
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
            .timestamp {
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

function updateFontSizePreview(size) {
    document.getElementById('customSizeValue').textContent = size + 'px';
    
    const previewMessages = document.querySelectorAll('.preview-message');
    previewMessages.forEach(msg => {
        msg.style.fontSize = size + 'px';
    });
}

function updateAllPreviews() {
    const currentSize = document.getElementById('fontSizeSlider').value;
    updateFontSizePreview(parseInt(currentSize));
    updatePreview();
    
    messageCorners.updatePreview(messageCorners.getCurrentRadius());
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

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; 
        top: 80px; 
        right: 20px; 
        background: var(--header-bg); 
        color: var(--text-color); 
        padding: 12px 16px; 
        border-radius: 8px; 
        z-index: 10000; 
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}