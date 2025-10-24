// Quantum Messenger - Улучшенный функционал обоев для чатов
document.addEventListener('DOMContentLoaded', function() {
    // Создаем стили для обоев
    const backgroundStyles = `
        <style>
            .backgrounds-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                max-height: 350px;
                overflow-y: auto;
                padding: 8px;
                scrollbar-width: thin;
                scrollbar-color: var(--border-color) transparent;
            }

            .backgrounds-grid::-webkit-scrollbar {
                width: 6px;
            }

            .backgrounds-grid::-webkit-scrollbar-track {
                background: transparent;
            }

            .backgrounds-grid::-webkit-scrollbar-thumb {
                background: var(--border-color);
                border-radius: 3px;
            }

            .background-item {
                position: relative;
                border-radius: 12px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                border: 2px solid transparent;
                background: var(--other-msg-bg);
                transform: scale(1);
            }

            .background-item:hover {
                transform: translateY(-4px) scale(1.02);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                border-color: var(--action-btn-color);
            }

            .background-item.selected {
                border-color: #4facfe;
                box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.4), 0 8px 25px rgba(0, 0, 0, 0.15);
                transform: translateY(-2px) scale(1.01);
            }

            .background-thumbnail {
                width: 100%;
                height: 90px;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                border-radius: 8px;
                position: relative;
                overflow: hidden;
            }

            .background-thumbnail::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.3));
                border-radius: 8px;
            }

            .background-name {
                padding: 10px 6px 8px;
                font-size: 11px;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-weight: 500;
                color: var(--text-color);
            }

            .background-delete {
                position: absolute;
                top: 6px;
                right: 6px;
                background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                border: none;
                border-radius: 50%;
                width: 26px;
                height: 26px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                opacity: 0;
                transition: all 0.3s ease;
                font-size: 12px;
                color: white;
                box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
                z-index: 2;
            }

            .background-item:hover .background-delete {
                opacity: 1;
                transform: scale(1.1);
            }

            .background-delete:hover {
                transform: scale(1.2);
                box-shadow: 0 3px 12px rgba(255, 107, 107, 0.6);
            }

            .background-preview-container {
                background: var(--header-bg);
                border-radius: 16px;
                padding: 20px;
                border: 1px solid var(--border-color);
                margin-bottom: 20px;
                position: relative;
                overflow: hidden;
            }

            .background-preview-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 40px;
                background: var(--header-bg);
                border-bottom: 1px solid var(--border-color);
                border-radius: 16px 16px 0 0;
                z-index: 2;
            }

            .background-preview {
                height: 280px;
                border-radius: 12px;
                overflow: hidden;
                position: relative;
                background: var(--primary-bg);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                border: 1px solid var(--border-color);
            }

            .preview-header {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 50px;
                background: var(--header-bg);
                border-bottom: 1px solid var(--border-color);
                display: flex;
                align-items: center;
                padding: 0 15px;
                z-index: 3;
            }

            .preview-back-btn {
                background: none;
                border: none;
                color: var(--text-color);
                font-size: 16px;
                margin-right: 10px;
                cursor: pointer;
            }

            .preview-user {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .preview-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: linear-gradient(135deg, #4facfe, #00f2fe);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                color: white;
            }

            .preview-user-info {
                display: flex;
                flex-direction: column;
            }

            .preview-username {
                font-weight: 600;
                font-size: 14px;
            }

            .preview-status {
                font-size: 11px;
                opacity: 0.7;
            }

            .preview-messages {
                padding: 60px 15px 15px;
                height: 100%;
                display: flex;
                flex-direction: column;
                gap: 12px;
                position: relative;
                z-index: 1;
                overflow-y: auto;
            }

            .preview-message {
                max-width: 75%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
                animation: messageSlide 0.5s ease-out;
                position: relative;
                backdrop-filter: blur(10px);
            }

            .preview-message.other-message {
                align-self: flex-start;
                background: rgba(255, 255, 255, 0.15);
                color: var(--text-color);
                border-bottom-left-radius: 6px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .preview-message.my-message {
                align-self: flex-end;
                background: linear-gradient(135deg, rgba(79, 172, 254, 0.9), rgba(0, 242, 254, 0.9));
                color: white;
                border-bottom-right-radius: 6px;
                box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
            }

            .preview-message .sender {
                font-size: 11px;
                margin-bottom: 4px;
                opacity: 0.8;
                font-weight: 500;
            }

            .preview-message .timestamp {
                font-size: 9px;
                text-align: right;
                margin-top: 4px;
                opacity: 0.7;
            }

            .upload-area {
                border: 2px dashed var(--border-color);
                border-radius: 16px;
                padding: 40px 20px;
                cursor: pointer;
                transition: all 0.4s ease;
                text-align: center;
                background: var(--other-msg-bg);
                position: relative;
                overflow: hidden;
            }

            .upload-area::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(79, 172, 254, 0.1), transparent);
                transition: left 0.6s ease;
            }

            .upload-area:hover {
                border-color: #4facfe;
                background: rgba(79, 172, 254, 0.05);
                transform: translateY(-2px);
            }

            .upload-area:hover::before {
                left: 100%;
            }

            .upload-area i {
                font-size: 52px;
                margin-bottom: 20px;
                opacity: 0.7;
                color: var(--action-btn-color);
            }

            .messages-wrapper.with-background {
                position: relative;
                transition: background 0.8s ease;
            }

            .background-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(to bottom, rgba(0,0,0,0.1), transparent 30%, transparent 70%, rgba(0,0,0,0.1));
                pointer-events: none;
                z-index: 0;
                opacity: 0;
                animation: fadeInOverlay 0.8s ease forwards;
            }

            @keyframes fadeInOverlay {
                to { opacity: 1; }
            }

            .messages-wrapper.with-background .message {
                position: relative;
                z-index: 1;
                backdrop-filter: blur(5px);
                background: rgba(255, 255, 255, 0.1) !important;
            }

            .messages-wrapper.with-background .my-message {
                background: linear-gradient(135deg, rgba(79, 172, 254, 0.9), rgba(0, 242, 254, 0.9)) !important;
                backdrop-filter: none;
            }

            .background-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(79, 172, 254, 0.9);
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
                backdrop-filter: blur(10px);
                animation: slideInBadge 0.5s ease;
            }

            @keyframes slideInBadge {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes messageSlide {
                from { 
                    transform: translateY(20px);
                    opacity: 0;
                }
                to { 
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .background-category {
                margin-bottom: 15px;
            }

            .category-title {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 10px;
                color: var(--text-color);
                opacity: 0.8;
                padding-left: 5px;
            }

            .empty-custom {
                text-align: center;
                padding: 40px 20px;
                opacity: 0.7;
            }

            .empty-custom i {
                font-size: 64px;
                margin-bottom: 20px;
                opacity: 0.5;
                color: var(--action-btn-color);
            }

            .background-fade-in {
                animation: backgroundFadeIn 1.2s ease-out;
            }

            @keyframes backgroundFadeIn {
                from { 
                    opacity: 0;
                    transform: scale(1.1);
                }
                to { 
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @media (max-width: 768px) {
                .backgrounds-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                
                .background-preview {
                    height: 220px;
                }
                
                .background-thumbnail {
                    height: 80px;
                }
            }

            @media (max-width: 480px) {
                .backgrounds-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }
                
                .background-preview {
                    height: 200px;
                }
                
                .preview-messages {
                    padding: 50px 10px 10px;
                    gap: 8px;
                }
                
                .preview-message {
                    padding: 10px 14px;
                    font-size: 13px;
                }
            }
        </style>
    `;

    // Добавляем стили в документ
    document.head.insertAdjacentHTML('beforeend', backgroundStyles);

    class ChatBackgrounds {
        constructor() {
            this.currentChatId = null;
            this.backgroundModal = null;
            this.selectedBackground = null;
            this.customBackgrounds = JSON.parse(localStorage.getItem('quantumCustomBackgrounds') || '[]');
            this.chatBackgrounds = JSON.parse(localStorage.getItem('quantumChatBackgrounds') || '{}');
            this.uploadedImage = null;
            this.isInitialized = false;
            
            this.init();
        }
        
        init() {
            if (this.isInitialized) return;
            
            console.log('Инициализация ChatBackgrounds...');
            this.createBackgroundModal();
            this.setupGlobalListeners();
            this.applySavedBackgrounds();
            
            // Несколько попыток добавить кнопку в меню
            this.attemptAddChatMenuOption();
            
            this.isInitialized = true;
            console.log('ChatBackgrounds инициализирован');
        }

        setupGlobalListeners() {
            this.overrideOpenChat();
            this.setupMutationObserver();
            this.setupChatMenuObserver();
        }

        setupChatMenuObserver() {
            // Наблюдаем за появлением меню чата
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) {
                                // Проверяем, появилось ли меню чата
                                if (node.id === 'chatMenuContent' || 
                                    (node.classList && node.classList.contains('chat-menu-content'))) {
                                    this.addChatMenuOption();
                                }
                                
                                // Проверяем, появился ли контейнер сообщений (значит чат открыт)
                                if (node.classList && node.classList.contains('messages-wrapper')) {
                                    this.detectCurrentChat();
                                }
                            }
                        });
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        detectCurrentChat() {
            // Пытаемся определить текущий чат по URL или другим признакам
            const chatHeader = document.querySelector('.chat-header');
            if (chatHeader) {
                // Генерируем ID чата на основе имени пользователя в заголовке
                const userNameElement = chatHeader.querySelector('#chatUserName');
                if (userNameElement) {
                    const userName = userNameElement.textContent;
                    const currentUserId = localStorage.getItem('quantumUserId');
                    if (currentUserId && userName) {
                        // Создаем примерный ID чата (в реальном приложении нужно использовать настоящий ID)
                        const chatId = `chat_${currentUserId}_${userName}`;
                        this.setCurrentChat(chatId);
                    }
                }
            }
        }

        attemptAddChatMenuOption() {
            // Несколько попыток добавить кнопку с интервалами
            const attempts = [100, 500, 1000, 2000, 5000];
            
            attempts.forEach(delay => {
                setTimeout(() => {
                    if (!document.getElementById('chatBackgroundsBtn')) {
                        this.addChatMenuOption();
                    }
                }, delay);
            });
        }

        overrideOpenChat() {
            // Сохраняем оригинальную функцию если она существует
            if (window.openChat && !window.originalOpenChat) {
                window.originalOpenChat = window.openChat;
                
                // Переопределяем функцию openChat
                window.openChat = (userId, userName, chatId = null) => {
                    console.log('OpenChat called with:', userId, userName, chatId);
                    
                    // Вызываем оригинальную функцию
                    if (window.originalOpenChat) {
                        window.originalOpenChat(userId, userName, chatId);
                    }
                    
                    // Устанавливаем текущий чат
                    const newChatId = chatId || this.generateChatId(userId);
                    this.setCurrentChat(newChatId);
                    
                    // Показываем анимацию применения обоев
                    setTimeout(() => {
                        this.animateBackgroundApply();
                    }, 500);
                };
            }
        }

        animateBackgroundApply() {
            const messagesWrapper = document.querySelector('.messages-wrapper');
            if (messagesWrapper && this.chatBackgrounds[this.currentChatId]) {
                messagesWrapper.classList.add('background-fade-in');
                setTimeout(() => {
                    messagesWrapper.classList.remove('background-fade-in');
                }, 1200);
            }
        }

        generateChatId(otherUserId) {
            const currentUserId = localStorage.getItem('quantumUserId');
            if (!currentUserId) return null;
            
            const ids = [currentUserId, otherUserId].sort();
            return `chat_${ids[0]}_${ids[1]}`;
        }

        setupMutationObserver() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1 && node.classList && node.classList.contains('messages-wrapper')) {
                                setTimeout(() => {
                                    this.applyBackgroundToCurrentChat();
                                }, 100);
                            }
                        });
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        createBackgroundModal() {
            if (document.getElementById('backgroundModal')) {
                this.backgroundModal = document.getElementById('backgroundModal');
                return;
            }
            
            this.backgroundModal = document.createElement('div');
            this.backgroundModal.className = 'modal';
            this.backgroundModal.id = 'backgroundModal';
            this.backgroundModal.innerHTML = `
                <div class="modal-content" style="max-width: 600px; border-radius: 20px;">
                    <h3 style="margin-bottom: 20px; text-align: center; font-size: 22px; background: linear-gradient(135deg, #4facfe, #00f2fe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700;">🎨 Обои для чата</h3>
                    
                    <div class="background-preview-container">
                        <div class="preview-header">
                            <button class="preview-back-btn">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                            <div class="preview-user">
                                <div class="preview-avatar">U</div>
                                <div class="preview-user-info">
                                    <div class="preview-username">Собеседник</div>
                                    <div class="preview-status">в сети</div>
                                </div>
                            </div>
                        </div>
                        <div class="background-preview" id="backgroundPreview">
                            <div class="preview-messages">
                                <div class="preview-message other-message">
                                    <div class="sender">Собеседник</div>
                                    <div>Привет! Как твои дела?</div>
                                    <div class="timestamp">12:00</div>
                                </div>
                                <div class="preview-message my-message">
                                    <div>Отлично! Смотри как красиво с новыми обоями</div>
                                    <div class="timestamp">12:01</div>
                                </div>
                                <div class="preview-message other-message">
                                    <div>Вау! Это выглядит потрясающе! 🎉</div>
                                    <div class="timestamp">12:02</div>
                                </div>
                                <div class="preview-message my-message">
                                    <div>Да, теперь наш чат самый стильный! 💫</div>
                                    <div class="timestamp">12:03</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tabs" style="margin-bottom: 20px; background: var(--header-bg); border-radius: 12px; padding: 4px;">
                        <div class="tab active" data-tab="preset" style="border-radius: 8px; margin: 2px;">Готовые темы</div>
                        <div class="tab" data-tab="custom" style="border-radius: 8px; margin: 2px;">Мои обои</div>
                        <div class="tab" data-tab="upload" style="border-radius: 8px; margin: 2px;">Загрузить</div>
                    </div>
                    
                    <div class="tab-content active" id="tab-preset">
                        <div class="background-category">
                            <div class="category-title">🌈 Градиенты</div>
                            <div class="backgrounds-grid" id="gradientBackgrounds"></div>
                        </div>
                        <div class="background-category">
                            <div class="category-title">🎨 Узоры</div>
                            <div class="backgrounds-grid" id="patternBackgrounds"></div>
                        </div>
                        <div class="background-category">
                            <div class="category-title">⚪ Солидные</div>
                            <div class="backgrounds-grid" id="solidBackgrounds"></div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="tab-custom">
                        <div class="backgrounds-grid" id="customBackgrounds"></div>
                        <div class="empty-custom" id="emptyCustom" style="display: none;">
                            <i class="fas fa-image"></i>
                            <p style="font-size: 16px; margin: 10px 0 5px;">У вас пока нет своих обоев</p>
                            <p style="font-size: 14px; opacity: 0.7;">Загрузите их во вкладке "Загрузить"</p>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="tab-upload">
                        <div class="upload-container" style="text-align: center; padding: 20px;">
                            <div class="upload-area" id="uploadArea">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p style="font-size: 16px; font-weight: 600; margin-bottom: 5px;">Нажмите или перетащите изображение</p>
                                <p style="font-size: 13px; opacity: 0.7;">JPG, PNG, GIF • Максимум 5MB</p>
                            </div>
                            <input type="file" id="backgroundUpload" accept="image/*" style="display: none;">
                            <div class="upload-preview" id="uploadPreview" style="display: none; margin-top: 20px; text-align: center;">
                                <img id="previewImage" style="max-width: 100%; max-height: 200px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
                                <div style="margin-top: 15px;">
                                    <button class="modal-btn primary" id="saveCustomBg" style="padding: 10px 20px; border-radius: 25px; font-weight: 600;">
                                        <i class="fas fa-save"></i> Сохранить как обои
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-buttons" style="margin-top: 25px; display: flex; gap: 10px; justify-content: center;">
                        <button class="modal-btn secondary" id="removeBackgroundBtn" style="border-radius: 25px; padding: 10px 20px;">
                            <i class="fas fa-trash"></i> Удалить обои
                        </button>
                        <button class="modal-btn primary" id="applyBackgroundBtn" style="border-radius: 25px; padding: 12px 30px; font-weight: 600; background: linear-gradient(135deg, #4facfe, #00f2fe);">
                            <i class="fas fa-check"></i> Установить обои
                        </button>
                        <button class="modal-btn secondary" id="closeBackgroundBtn" style="border-radius: 25px; padding: 10px 20px;">
                            <i class="fas fa-times"></i> Закрыть
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.backgroundModal);
            this.initModalEvents();
            this.loadPresetBackgrounds();
            this.loadCustomBackgrounds();
        }
        
        initModalEvents() {
            // Закрытие модального окна
            document.getElementById('closeBackgroundBtn').addEventListener('click', () => {
                this.backgroundModal.classList.remove('active');
            });
            
            // Применение выбранных обоев
            document.getElementById('applyBackgroundBtn').addEventListener('click', () => {
                this.applyBackground();
            });
            
            // Удаление обоев
            document.getElementById('removeBackgroundBtn').addEventListener('click', () => {
                this.removeBackground();
            });
            
            // Вкладки
            const tabs = this.backgroundModal.querySelectorAll('.tab');
            const tabContents = this.backgroundModal.querySelectorAll('.tab-content');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.getAttribute('data-tab');
                    
                    tabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    tab.classList.add('active');
                    document.getElementById(`tab-${tabId}`).classList.add('active');
                    
                    if (tabId === 'custom') {
                        this.loadCustomBackgrounds();
                    }
                });
            });
            
            // Загрузка пользовательских обоев
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('backgroundUpload');
            const uploadPreview = document.getElementById('uploadPreview');
            const previewImage = document.getElementById('previewImage');
            const saveCustomBg = document.getElementById('saveCustomBg');
            
            uploadArea.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#4facfe';
                uploadArea.style.background = 'rgba(79, 172, 254, 0.1)';
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = 'var(--border-color)';
                uploadArea.style.background = 'var(--other-msg-bg)';
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border-color)';
                uploadArea.style.background = 'var(--other-msg-bg)';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleImageUpload(files[0]);
                }
            });
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleImageUpload(e.target.files[0]);
                }
            });
            
            saveCustomBg.addEventListener('click', () => {
                this.saveCustomBackground();
            });
        }
        
        handleImageUpload(file) {
            if (!file.type.match('image.*')) {
                this.showNotification('Пожалуйста, выберите изображение');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                this.showNotification('Размер файла не должен превышать 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const uploadPreview = document.getElementById('uploadPreview');
                const previewImage = document.getElementById('previewImage');
                
                previewImage.src = e.target.result;
                uploadPreview.style.display = 'block';
                this.uploadedImage = e.target.result;
                
                // Автоматически применяем для предпросмотра
                this.selectBackground({
                    id: 'upload_preview',
                    type: 'custom',
                    url: e.target.result
                });
            };
            reader.readAsDataURL(file);
        }
        
        saveCustomBackground() {
            if (!this.uploadedImage) {
                this.showNotification('Сначала загрузите изображение');
                return;
            }
            
            const customBg = {
                id: 'custom_' + Date.now(),
                name: 'Мои обои ' + (this.customBackgrounds.length + 1),
                url: this.uploadedImage,
                type: 'custom'
            };
            
            this.customBackgrounds.push(customBg);
            localStorage.setItem('quantumCustomBackgrounds', JSON.stringify(this.customBackgrounds));
            
            document.getElementById('uploadPreview').style.display = 'none';
            document.getElementById('backgroundUpload').value = '';
            this.uploadedImage = null;
            
            document.querySelectorAll('.tab').forEach(tab => {
                if (tab.getAttribute('data-tab') === 'custom') {
                    tab.click();
                }
            });
            
            this.showNotification('🎉 Обои успешно сохранены!');
        }
        
        loadPresetBackgrounds() {
            const gradients = [
                { id: 'gradient_blue', name: 'Синяя бездна', type: 'css', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                { id: 'gradient_sunset', name: 'Закат', type: 'css', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                { id: 'gradient_ocean', name: 'Океан', type: 'css', css: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                { id: 'gradient_forest', name: 'Лес', type: 'css', css: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
                { id: 'gradient_sunrise', name: 'Рассвет', type: 'css', css: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
                { id: 'gradient_night', name: 'Ночь', type: 'css', css: 'linear-gradient(135deg, #0c2461 0%, #1e3799 100%)' },
                { id: 'gradient_purple', name: 'Фиолетовый', type: 'css', css: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
                { id: 'gradient_emerald', name: 'Изумруд', type: 'css', css: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' }
            ];

            const patterns = [
                { id: 'pattern_dots', name: 'Точечный', type: 'css', css: 'radial-gradient(circle, var(--border-color) 1px, transparent 1px)', size: '20px 20px' },
                { id: 'pattern_lines', name: 'Линейный', type: 'css', css: 'repeating-linear-gradient(45deg, transparent, transparent 10px, var(--border-color) 10px, var(--border-color) 20px)' },
                { id: 'pattern_grid', name: 'Сетка', type: 'css', css: 'linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)', size: '20px 20px' },
                { id: 'pattern_diagonal', name: 'Диагональ', type: 'css', css: 'repeating-linear-gradient(45deg, transparent, transparent 15px, var(--border-color) 15px, var(--border-color) 30px)' }
            ];

            const solids = [
                { id: 'solid_light', name: 'Светлый', type: 'css', css: 'rgba(255, 255, 255, 0.15)' },
                { id: 'solid_dark', name: 'Тёмный', type: 'css', css: 'rgba(0, 0, 0, 0.2)' },
                { id: 'solid_blue', name: 'Голубой', type: 'css', css: 'rgba(79, 172, 254, 0.1)' },
                { id: 'solid_green', name: 'Зелёный', type: 'css', css: 'rgba(67, 233, 123, 0.1)' }
            ];

            this.renderBackgroundCategory('gradientBackgrounds', gradients);
            this.renderBackgroundCategory('patternBackgrounds', patterns);
            this.renderBackgroundCategory('solidBackgrounds', solids);
        }

        renderBackgroundCategory(containerId, backgrounds) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            container.innerHTML = '';

            backgrounds.forEach(bg => {
                const bgElement = document.createElement('div');
                bgElement.className = 'background-item';
                bgElement.dataset.backgroundId = bg.id;
                bgElement.dataset.backgroundType = bg.type;
                bgElement.dataset.backgroundCss = bg.css;
                if (bg.size) bgElement.dataset.backgroundSize = bg.size;

                bgElement.innerHTML = `
                    <div class="background-thumbnail" style="background: ${bg.css} ${bg.size ? '/' + bg.size : ''}"></div>
                    <div class="background-name">${bg.name}</div>
                `;

                bgElement.addEventListener('click', () => {
                    this.selectBackground(bg);
                });

                container.appendChild(bgElement);
            });
        }
        
        loadCustomBackgrounds() {
            const customContainer = document.getElementById('customBackgrounds');
            const emptyCustom = document.getElementById('emptyCustom');
            
            if (!customContainer) return;
            
            customContainer.innerHTML = '';
            
            if (this.customBackgrounds.length === 0) {
                if (emptyCustom) emptyCustom.style.display = 'block';
                customContainer.style.display = 'none';
                return;
            }
            
            if (emptyCustom) emptyCustom.style.display = 'none';
            customContainer.style.display = 'grid';
            
            this.customBackgrounds.forEach(bg => {
                const bgElement = document.createElement('div');
                bgElement.className = 'background-item';
                bgElement.dataset.backgroundId = bg.id;
                bgElement.dataset.backgroundType = bg.type;
                bgElement.dataset.backgroundUrl = bg.url;
                
                bgElement.innerHTML = `
                    <div class="background-thumbnail" style="background-image: url('${bg.url}')"></div>
                    <div class="background-name">${bg.name}</div>
                    <button class="background-delete" data-bg-id="${bg.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                bgElement.addEventListener('click', (e) => {
                    if (!e.target.closest('.background-delete')) {
                        this.selectBackground(bg);
                    }
                });
                
                const deleteBtn = bgElement.querySelector('.background-delete');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteCustomBackground(bg.id);
                });
                
                customContainer.appendChild(bgElement);
            });
        }
        
        selectBackground(background) {
            this.selectedBackground = background;
            
            const preview = document.getElementById('backgroundPreview');
            if (!preview) return;
            
            // Анимация смены фона
            preview.style.opacity = '0';
            
            setTimeout(() => {
                if (background.type === 'css') {
                    preview.style.background = background.css;
                    if (background.size) {
                        preview.style.backgroundSize = background.size;
                    } else {
                        preview.style.backgroundSize = 'cover';
                    }
                } else {
                    preview.style.backgroundImage = `url('${background.url}')`;
                    preview.style.backgroundSize = 'cover';
                    preview.style.backgroundPosition = 'center';
                }
                
                preview.style.opacity = '1';
            }, 300);
            
            document.querySelectorAll('.background-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            const selectedItem = document.querySelector(`[data-background-id="${background.id}"]`);
            if (selectedItem) {
                selectedItem.classList.add('selected');
            }
        }
        
        applyBackground() {
            if (!this.selectedBackground || !this.currentChatId) {
                this.showNotification('Сначала выберите обои и откройте чат');
                return;
            }
            
            this.chatBackgrounds[this.currentChatId] = this.selectedBackground;
            localStorage.setItem('quantumChatBackgrounds', JSON.stringify(this.chatBackgrounds));
            
            this.applyBackgroundToCurrentChat();
            this.backgroundModal.classList.remove('active');
            this.showNotification('🎨 Обои установлены! Чат преобразился!');
        }
        
        removeBackground() {
            if (!this.currentChatId) {
                this.showNotification('Сначала откройте чат');
                return;
            }
            
            delete this.chatBackgrounds[this.currentChatId];
            localStorage.setItem('quantumChatBackgrounds', JSON.stringify(this.chatBackgrounds));
            
            this.applyBackgroundToCurrentChat();
            this.backgroundModal.classList.remove('active');
            this.showNotification('Обои удалены из чата');
        }
        
        applyBackgroundToCurrentChat() {
            if (!this.currentChatId) return;
            
            const messagesWrapper = document.querySelector('.messages-wrapper');
            if (!messagesWrapper) return;
            
            const background = this.chatBackgrounds[this.currentChatId];
            
            messagesWrapper.classList.toggle('with-background', !!background);
            
            if (!background) {
                messagesWrapper.style.background = '';
                messagesWrapper.style.backgroundImage = '';
                const existingOverlay = messagesWrapper.querySelector('.background-overlay');
                if (existingOverlay) existingOverlay.remove();
                return;
            }
            
            // Плавное применение фона
            messagesWrapper.style.transition = 'background 0.8s ease';
            
            if (background.type === 'css') {
                messagesWrapper.style.background = background.css;
                messagesWrapper.style.backgroundSize = background.size || 'cover';
            } else {
                messagesWrapper.style.backgroundImage = `url('${background.url}')`;
                messagesWrapper.style.backgroundSize = 'cover';
                messagesWrapper.style.backgroundPosition = 'center';
            }
            
            let overlay = messagesWrapper.querySelector('.background-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'background-overlay';
                messagesWrapper.appendChild(overlay);
            }
        }
        
        applySavedBackgrounds() {
            setTimeout(() => {
                this.applyBackgroundToCurrentChat();
            }, 100);
        }
        
        addChatMenuOption() {
            const chatMenuContent = document.getElementById('chatMenuContent');
            if (!chatMenuContent) {
                console.log('Меню чата не найдено');
                return;
            }
            
            // Проверяем, не добавлена ли уже кнопка
            if (document.getElementById('chatBackgroundsBtn')) {
                console.log('Кнопка уже добавлена');
                return;
            }
            
            const backgroundsOption = document.createElement('div');
            backgroundsOption.className = 'chat-menu-item';
            backgroundsOption.id = 'chatBackgroundsBtn';
            backgroundsOption.innerHTML = '<i class="fas fa-palette"></i> Обои чата';
            backgroundsOption.style.background = 'linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.1))';
            
            backgroundsOption.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openBackgroundModal();
                chatMenuContent.classList.remove('active');
            });
            
            // Вставляем перед последним элементом (блокировка)
            const lastItem = chatMenuContent.lastElementChild;
            if (lastItem) {
                chatMenuContent.insertBefore(backgroundsOption, lastItem);
                console.log('Кнопка "Обои чата" добавлена в меню');
            } else {
                chatMenuContent.appendChild(backgroundsOption);
                console.log('Кнопка "Обои чата" добавлена в конец меню');
            }
        }
        
        openBackgroundModal() {
            if (!this.currentChatId) {
                // Пытаемся определить текущий чат
                this.detectCurrentChat();
                
                if (!this.currentChatId) {
                    this.showNotification('❌ Сначала откройте чат');
                    return;
                }
            }
            
            this.selectedBackground = null;
            
            const currentBackground = this.chatBackgrounds[this.currentChatId];
            if (currentBackground) {
                this.selectBackground(currentBackground);
            } else {
                const preview = document.getElementById('backgroundPreview');
                if (preview) {
                    preview.style.background = 'var(--primary-bg)';
                    preview.style.backgroundImage = '';
                }
                
                document.querySelectorAll('.background-item').forEach(item => {
                    item.classList.remove('selected');
                });
            }
            
            this.backgroundModal.classList.add('active');
            console.log('Модальное окно обоев открыто для чата:', this.currentChatId);
        }
        
        deleteCustomBackground(bgId) {
            if (confirm('Удалить эти обои?')) {
                this.customBackgrounds = this.customBackgrounds.filter(bg => bg.id !== bgId);
                localStorage.setItem('quantumCustomBackgrounds', JSON.stringify(this.customBackgrounds));
                
                Object.keys(this.chatBackgrounds).forEach(chatId => {
                    if (this.chatBackgrounds[chatId].id === bgId) {
                        delete this.chatBackgrounds[chatId];
                    }
                });
                localStorage.setItem('quantumChatBackgrounds', JSON.stringify(this.chatBackgrounds));
                
                this.loadCustomBackgrounds();
                this.applyBackgroundToCurrentChat();
                this.showNotification('Обои удалены');
            }
        }
        
        showNotification(message) {
            if (window.showNotification) {
                window.showNotification(message);
            } else {
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 70px;
                    right: 20px;
                    background: linear-gradient(135deg, #4facfe, #00f2fe);
                    color: white;
                    padding: 12px 18px;
                    border-radius: 25px;
                    z-index: 1000;
                    animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    font-weight: 500;
                    box-shadow: 0 4px 20px rgba(79, 172, 254, 0.3);
                    backdrop-filter: blur(10px);
                `;
                notification.textContent = message;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.style.opacity = '0';
                        notification.style.transform = 'translateX(100%)';
                        setTimeout(() => notification.remove(), 500);
                    }
                }, 3000);
            }
        }
        
        setCurrentChat(chatId) {
            this.currentChatId = chatId;
            console.log('Текущий чат установлен:', chatId);
            this.applyBackgroundToCurrentChat();
        }
    }

    // Инициализируем функционал обоев
    let chatBackgroundsInstance = null;

    // Ждем полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            chatBackgroundsInstance = new ChatBackgrounds();
            window.chatBackgrounds = chatBackgroundsInstance;
        });
    } else {
        chatBackgroundsInstance = new ChatBackgrounds();
        window.chatBackgrounds = chatBackgroundsInstance;
    }

    window.ChatBackgrounds = ChatBackgrounds;
});

// Обработчик для кнопки "Назад"
document.addEventListener('click', function(e) {
    if (e.target.closest('#backToChatsBtn') || 
        (e.target.closest('.burger-menu') && e.target.closest('#backToChatsBtn'))) {
        if (window.chatBackgrounds) {
            window.chatBackgrounds.setCurrentChat(null);
        }
    }
});

// Глобальный обработчик для меню чата
document.addEventListener('click', function(e) {
    // Обработка клика на кнопку меню чата (три точки)
    if (e.target.closest('#chatMenuBtn') || e.target.closest('.fa-ellipsis-v')) {
        // Даем время на появление меню
        setTimeout(() => {
            if (window.chatBackgrounds) {
                window.chatBackgrounds.addChatMenuOption();
            }
        }, 100);
    }
});