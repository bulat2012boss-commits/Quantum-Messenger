// smart-replies.js - Система умных ответов для Quantum Messenger

class SmartReplies {
    constructor() {
        this.enabled = true;
        this.suggestionsCount = 3;
        this.lastMessageId = null;
        this.smartRepliesContainer = null;
        this.isProcessing = false;
        
        // Предопределенные шаблоны ответов для разных ситуаций
        this.responseTemplates = {
            greeting: [
                "Привет! Как дела?",
                "Здравствуй! Рад тебя видеть",
                "Привет! Что нового?"
            ],
            question: [
                "Хороший вопрос! Дай мне подумать...",
                "Интересно, мне нужно уточнить",
                "Сейчас проверю и отвечу"
            ],
            thanks: [
                "Пожалуйста! Обращайся",
                "Не за что! Рад помочь",
                "Всегда готов помочь!"
            ],
            meeting: [
                "Отлично! Во сколько встречаемся?",
                "Договорились! Где удобно?",
                "Супер! Жду с нетерпением"
            ],
            agreement: [
                "Полностью согласен!",
                "Точно! Ты прав",
                "Именно так и думаю"
            ],
            disagreement: [
                "Понимаю твою точку зрения",
                "Интересный взгляд, но я вижу иначе",
                "Уважаю твое мнение, хотя думаю по-другому"
            ],
            busy: [
                "Сейчас немного занят, отвечу позже",
                "На связи, но ограничен во времени",
                "Занят сейчас, но скоро освобожусь"
            ],
            default: [
                "Понял тебя!",
                "Интересно...",
                "Расскажи подробнее"
            ]
        };
        
        this.init();
    }
    
    init() {
        // Создаем контейнер для умных ответов
        this.createSmartRepliesContainer();
        
        // Слушаем новые сообщения
        this.setupMessageListener();
        
        // Добавляем стили
        this.addStyles();
        
        console.log("Smart Replies system initialized");
    }
    
    createSmartRepliesContainer() {
        this.smartRepliesContainer = document.createElement('div');
        this.smartRepliesContainer.className = 'smart-replies-container';
        this.smartRepliesContainer.innerHTML = `
            <div class="smart-replies-header">
                <span>Предлагаемые ответы</span>
                <button class="smart-replies-toggle" title="Скрыть предложения">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            <div class="smart-replies-suggestions"></div>
        `;
        
        // Вставляем контейнер перед областью ввода сообщения
        const inputArea = document.querySelector('.input-area');
        if (inputArea) {
            inputArea.parentNode.insertBefore(this.smartRepliesContainer, inputArea);
        }
        
        // Обработчик переключения видимости
        const toggleBtn = this.smartRepliesContainer.querySelector('.smart-replies-toggle');
        toggleBtn.addEventListener('click', () => this.toggleVisibility());
    }
    
    setupMessageListener() {
        // Слушаем изменения в контейнере сообщений
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        this.handleNewMessage(mutation.addedNodes);
                    }
                });
            });
            
            observer.observe(messagesContainer, {
                childList: true,
                subtree: false
            });
        }
        
        // Также слушаем клики по сообщениям для контекстных ответов
        document.addEventListener('click', (e) => {
            const messageElement = e.target.closest('.other-message');
            if (messageElement && this.enabled) {
                this.generateSmartRepliesForMessage(messageElement);
            }
        });
    }
    
    handleNewMessage(addedNodes) {
        if (this.isProcessing || !this.enabled) return;
        
        addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.classList.contains('other-message')) {
                // Ждем немного перед анализом нового сообщения
                setTimeout(() => {
                    this.generateSmartRepliesForMessage(node);
                }, 500);
            }
        });
    }
    
    generateSmartRepliesForMessage(messageElement) {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const messageText = this.extractMessageText(messageElement);
        
        if (!messageText || messageText.length < 2) {
            this.isProcessing = false;
            return;
        }
        
        // Определяем тип сообщения и генерируем подходящие ответы
        const messageType = this.analyzeMessageType(messageText);
        const suggestions = this.generateSuggestions(messageText, messageType);
        
        this.displaySuggestions(suggestions);
        this.isProcessing = false;
    }
    
    extractMessageText(messageElement) {
        // Извлекаем текст сообщения, игнорируя временные метки и имена отправителей
        const messageContent = messageElement.querySelector('div:not(.sender):not(.timestamp)');
        return messageContent ? messageContent.textContent.trim() : '';
    }
    
    analyzeMessageType(text) {
        const lowerText = text.toLowerCase();
        
        if (this.containsGreeting(lowerText)) return 'greeting';
        if (this.containsQuestion(lowerText)) return 'question';
        if (this.containsThanks(lowerText)) return 'thanks';
        if (this.containsMeeting(lowerText)) return 'meeting';
        if (this.containsAgreement(lowerText)) return 'agreement';
        if (this.containsDisagreement(lowerText)) return 'disagreement';
        if (this.containsBusy(lowerText)) return 'busy';
        
        return 'default';
    }
    
    containsGreeting(text) {
        const greetings = ['привет', 'здравствуй', 'добрый', 'hello', 'hi', 'хай', 'салют'];
        return greetings.some(greeting => text.includes(greeting));
    }
    
    containsQuestion(text) {
        return text.includes('?') || 
               text.includes('кто') || 
               text.includes('что') || 
               text.includes('где') || 
               text.includes('когда') || 
               text.includes('почему') || 
               text.includes('как');
    }
    
    containsThanks(text) {
        const thanks = ['спасибо', 'благодарю', 'thanks', 'thank you', 'мерси'];
        return thanks.some(thank => text.includes(thank));
    }
    
    containsMeeting(text) {
        const meeting = ['встреча', 'встретимся', 'увидимся', 'встретиться', 'встречаемся'];
        return meeting.some(word => text.includes(word));
    }
    
    containsAgreement(text) {
        const agreement = ['согласен', 'правильно', 'верно', 'точно', 'agree', 'yes', 'да'];
        return agreement.some(word => text.includes(word));
    }
    
    containsDisagreement(text) {
        const disagreement = ['не согласен', 'неправ', 'ошибаешься', 'disagree', 'no', 'нет'];
        return disagreement.some(word => text.includes(word));
    }
    
    containsBusy(text) {
        const busy = ['занят', 'не могу', 'позже', 'потом', 'busy', 'later'];
        return busy.some(word => text.includes(word));
    }
    
    generateSuggestions(originalText, type) {
        let suggestions = [];
        
        // Берем шаблоны для данного типа сообщения
        const templates = this.responseTemplates[type] || this.responseTemplates.default;
        
        // Выбираем случайные предложения из шаблонов
        const shuffled = [...templates].sort(() => 0.5 - Math.random());
        suggestions = shuffled.slice(0, this.suggestionsCount);
        
        // Для вопросов пытаемся сгенерировать более релевантные ответы
        if (type === 'question') {
            suggestions = this.generateQuestionResponses(originalText, suggestions);
        }
        
        return suggestions;
    }
    
    generateQuestionResponses(question, baseSuggestions) {
        // Простой анализ вопроса для более релевантных ответов
        const lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.includes('как дела') || lowerQuestion.includes('как ты')) {
            return [
                "Всё отлично, спасибо! А у тебя?",
                "Нормально, работаю. Как сам?",
                "Хорошо! Рад общению с тобой"
            ];
        }
        
        if (lowerQuestion.includes('во сколько') || lowerQuestion.includes('когда')) {
            return [
                "Давай в 18:00?",
                "Как насчет 15:30?",
                "В 20:00 удобно?"
            ];
        }
        
        if (lowerQuestion.includes('где')) {
            return [
                "Давай встретимся в центре?",
                "Предлагаю кафе на углу",
                "Может, у тебя в офисе?"
            ];
        }
        
        return baseSuggestions;
    }
    
    displaySuggestions(suggestions) {
        const suggestionsElement = this.smartRepliesContainer.querySelector('.smart-replies-suggestions');
        suggestionsElement.innerHTML = '';
        
        suggestions.forEach((suggestion, index) => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'smart-reply-suggestion';
            suggestionElement.textContent = suggestion;
            suggestionElement.addEventListener('click', () => {
                this.useSuggestion(suggestion);
            });
            
            suggestionsElement.appendChild(suggestionElement);
        });
        
        // Показываем контейнер, если он скрыт
        this.showContainer();
    }
    
    useSuggestion(suggestion) {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = suggestion;
            messageInput.focus();
            
            // Активируем кнопку отправки
            const sendBtn = document.getElementById('sendBtn');
            if (sendBtn) {
                sendBtn.disabled = false;
            }
            
            // Скрываем предложения после выбора
            this.hideContainer();
        }
    }
    
    showContainer() {
        this.smartRepliesContainer.classList.add('active');
    }
    
    hideContainer() {
        this.smartRepliesContainer.classList.remove('active');
    }
    
    toggleVisibility() {
        this.smartRepliesContainer.classList.toggle('hidden');
        const toggleIcon = this.smartRepliesContainer.querySelector('.smart-replies-toggle i');
        
        if (this.smartRepliesContainer.classList.contains('hidden')) {
            toggleIcon.className = 'fas fa-chevron-down';
        } else {
            toggleIcon.className = 'fas fa-chevron-up';
        }
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .smart-replies-container {
                background: var(--header-bg);
                border-bottom: 1px solid var(--border-color);
                padding: 8px 12px;
                transition: all 0.3s ease;
                max-height: 0;
                overflow: hidden;
                opacity: 0;
            }
            
            .smart-replies-container.active {
                max-height: 120px;
                opacity: 1;
            }
            
            .smart-replies-container.hidden {
                display: none;
            }
            
            .smart-replies-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                font-size: 12px;
                color: var(--text-color);
                opacity: 0.7;
            }
            
            .smart-replies-toggle {
                background: none;
                border: none;
                color: var(--text-color);
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background 0.2s;
            }
            
            .smart-replies-toggle:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .smart-replies-suggestions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .smart-reply-suggestion {
                background: var(--action-btn-bg);
                color: var(--action-btn-color);
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid var(--border-color);
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .smart-reply-suggestion:hover {
                background: var(--message-bg);
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }
            
            @media (max-width: 768px) {
                .smart-replies-suggestions {
                    flex-direction: column;
                    gap: 6px;
                }
                
                .smart-reply-suggestion {
                    max-width: 100%;
                    text-align: center;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Методы для управления системой
    enable() {
        this.enabled = true;
        this.showContainer();
    }
    
    disable() {
        this.enabled = false;
        this.hideContainer();
    }
    
    setSuggestionsCount(count) {
        this.suggestionsCount = Math.max(1, Math.min(5, count)); // Ограничиваем от 1 до 5
    }
}

// Инициализация системы умных ответов
let smartRepliesSystem;

function initSmartReplies() {
    smartRepliesSystem = new SmartReplies();
    
    // Добавляем настройку умных ответов в меню
    addSmartRepliesToSettings();
}

function addSmartRepliesToSettings() {
    // Добавляем пункт в бургер-меню для управления умными ответами
    const burgerMenu = document.getElementById('burgerMenuContent');
    if (burgerMenu) {
        const smartRepliesMenuItem = document.createElement('div');
        smartRepliesMenuItem.className = 'burger-menu-item';
        smartRepliesMenuItem.innerHTML = '<i class="fas fa-robot"></i> Умные ответы';
        smartRepliesMenuItem.addEventListener('click', showSmartRepliesSettings);
        
        // Вставляем перед последним пунктом (Выйти)
        burgerMenu.insertBefore(smartRepliesMenuItem, burgerMenu.lastElementChild);
    }
}

function showSmartRepliesSettings() {
    // Создаем модальное окно настроек умных ответов
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px;">Настройки умных ответов</h3>
            <div class="settings-section">
                <div class="settings-option">
                    <span>Включить умные ответы</span>
                    <label class="switch">
                        <input type="checkbox" id="smartRepliesToggle" ${smartRepliesSystem.enabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="settings-option">
                    <span>Количество предложений</span>
                    <select id="suggestionsCount" style="background: var(--input-bg); color: var(--input-color); border: 1px solid var(--border-color); padding: 5px; border-radius: 5px;">
                        <option value="1" ${smartRepliesSystem.suggestionsCount === 1 ? 'selected' : ''}>1</option>
                        <option value="2" ${smartRepliesSystem.suggestionsCount === 2 ? 'selected' : ''}>2</option>
                        <option value="3" ${smartRepliesSystem.suggestionsCount === 3 ? 'selected' : ''}>3</option>
                        <option value="4" ${smartRepliesSystem.suggestionsCount === 4 ? 'selected' : ''}>4</option>
                        <option value="5" ${smartRepliesSystem.suggestionsCount === 5 ? 'selected' : ''}>5</option>
                    </select>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn primary" id="saveSmartRepliesBtn">Сохранить</button>
                <button class="modal-btn secondary" id="closeSmartRepliesBtn">Закрыть</button>
            </div>
        </div>
    `;hehehejje
    
    document.body.appendChild(modal);
    
    // Обработчики событий
    document.getElementById('smartRepliesToggle').addEventListener('change', function() {
        if (this.checked) {
            smartRepliesSystem.enable();
        } else {
            smartRepliesSystem.disable();
        }
    });
    
    document.getElementById('suggestionsCount').addEventListener('change', function() {
        smartRepliesSystem.setSuggestionsCount(parseInt(this.value));
    });
    
    document.getElementById('saveSmartRepliesBtn').addEventListener('click', () => {
        showNotification("Настройки умных ответов сохранены");
        document.body.removeChild(modal);
    });
    
    document.getElementById('closeSmartRepliesBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Инициализируем систему при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmartReplies);
} else {
    initSmartReplies();
}