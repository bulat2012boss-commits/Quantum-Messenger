// quantum-entrance.js - Обновленная версия с системой разработчика
// Подключи этот файл после основного скрипта мессенджера

document.addEventListener('DOMContentLoaded', function() {
    // Сначала проверяем, есть ли сохраненный пользователь
    const savedName = localStorage.getItem('quantumUsername');
    const savedUserId = localStorage.getItem('quantumUserId');
    const isDeveloper = localStorage.getItem('quantumDeveloperMode') === 'true';
    
    if (savedName && savedUserId) {
        // Если пользователь уже заходил, сразу запускаем мессенджер без показа экрана входа
        console.log('Автоматический вход для пользователя:', savedName);
        if (isDeveloper) {
            console.log('Режим разработчика активирован');
        }
        autoStartMessenger(savedName, savedUserId, isDeveloper);
        return; // Прерываем выполнение, чтобы не показывать экран входа
    }
    
    // Если пользователь новый, показываем экран входа
    createEntranceScreen();
});

function createEntranceScreen() {
    // Создаем контейнер для экрана входа
    const entranceContainer = document.createElement('div');
    entranceContainer.id = 'quantumEntrance';
    entranceContainer.innerHTML = `
        <div class="entrance-background">
            <div class="quantum-particles">
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
            </div>
        </div>
        <div class="entrance-content">
            <div class="logo-container">
                <div class="quantum-logo">
                    <div class="quantium-icon">⚛</div>
                    <div class="quantum-orbits">
                        <div class="orbit orbit-1"></div>
                        <div class="orbit orbit-2"></div>
                        <div class="orbit orbit-3"></div>
                    </div>
                </div>
                <h1 class="app-title">Quantum Messenger</h1>
                <p class="app-subtitle">Мессенджер будущего</p>
            </div>
            
            <div class="entrance-actions">
                <button class="start-btn" id="startMessenger">
                    <span class="btn-text">Начать общение</span>
                    <div class="btn-particles">
                        <div class="btn-particle"></div>
                        <div class="btn-particle"></div>
                        <div class="btn-particle"></div>
                    </div>
                </button>
                
                <div class="auth-container" id="entranceAuth" style="display: none;">
                    <div class="auth-form">
                        <h3>Войдите в систему</h3>
                        <input type="text" id="entranceNameInput" placeholder="Введите ваше имя" autocomplete="off">
                        <button id="entranceEnterBtn">
                            <span>Войти в чат</span>
                            <i class="fas fa-arrow-right"></i>
                        </button>
                        <p class="auth-note">Ваше имя будет сохранено для будущих посещений</p>
                    </div>
                </div>
            </div>
            
            <div class="entrance-features">
                <div class="feature">
                    <i class="fas fa-shield-alt"></i>
                    <span>Безопасность</span>
                </div>
                <div class="feature">
                    <i class="fas fa-bolt"></i>
                    <span>Скорость</span>
                </div>
                <div class="feature">
                    <i class="fas fa-infinity"></i>
                    <span>Безлимитно</span>
                </div>
            </div>
        </div>
    `;

    // Добавляем стили
    const entranceStyles = document.createElement('style');
    entranceStyles.textContent = `
        #quantumEntrance {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            overflow: hidden;
        }
        
        .entrance-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        
        .quantum-particles {
            position: absolute;
            width: 100%;
            height: 100%;
        }
        
        .particle {
            position: absolute;
            background: rgba(160, 210, 235, 0.3);
            border-radius: 50%;
            animation: float 15s infinite linear;
        }
        
        .particle:nth-child(1) {
            width: 8px;
            height: 8px;
            top: 20%;
            left: 10%;
            animation-delay: 0s;
        }
        
        .particle:nth-child(2) {
            width: 12px;
            height: 12px;
            top: 60%;
            left: 80%;
            animation-delay: -2s;
        }
        
        .particle:nth-child(3) {
            width: 6px;
            height: 6px;
            top: 80%;
            left: 20%;
            animation-delay: -4s;
        }
        
        .particle:nth-child(4) {
            width: 10px;
            height: 10px;
            top: 30%;
            left: 70%;
            animation-delay: -6s;
        }
        
        .particle:nth-child(5) {
            width: 7px;
            height: 7px;
            top: 70%;
            left: 40%;
            animation-delay: -8s;
        }
        
        .particle:nth-child(6) {
            width: 9px;
            height: 9px;
            top: 40%;
            left: 90%;
            animation-delay: -10s;
        }
        
        .particle:nth-child(7) {
            width: 5px;
            height: 5px;
            top: 90%;
            left: 60%;
            animation-delay: -12s;
        }
        
        .particle:nth-child(8) {
            width: 11px;
            height: 11px;
            top: 10%;
            left: 30%;
            animation-delay: -14s;
        }
        
        @keyframes float {
            0% {
                transform: translateY(0) translateX(0) rotate(0deg);
                opacity: 0.3;
            }
            25% {
                transform: translateY(-20px) translateX(10px) rotate(90deg);
                opacity: 0.6;
            }
            50% {
                transform: translateY(-40px) translateX(20px) rotate(180deg);
                opacity: 0.3;
            }
            75% {
                transform: translateY(-20px) translateX(10px) rotate(270deg);
                opacity: 0.6;
            }
            100% {
                transform: translateY(0) translateX(0) rotate(360deg);
                opacity: 0.3;
            }
        }
        
        .entrance-content {
            text-align: center;
            z-index: 2;
            animation: fadeInUp 1s ease-out;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .logo-container {
            margin-bottom: 40px;
        }
        
        .quantum-logo {
            position: relative;
            width: 120px;
            height: 120px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .quantum-icon {
            font-size: 50px;
            z-index: 3;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
                text-shadow: 0 0 10px rgba(160, 210, 235, 0.5);
            }
            50% {
                transform: scale(1.1);
                text-shadow: 0 0 20px rgba(160, 210, 235, 0.8);
            }
            100% {
                transform: scale(1);
                text-shadow: 0 0 10px rgba(160, 210, 235, 0.5);
            }
        }
        
        .quantum-orbits {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        
        .orbit {
            position: absolute;
            border: 2px solid rgba(160, 210, 235, 0.3);
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        
        .orbit-1 {
            width: 80px;
            height: 80px;
            animation: rotate 10s linear infinite;
        }
        
        .orbit-2 {
            width: 100px;
            height: 100px;
            animation: rotate 15s linear infinite reverse;
        }
        
        .orbit-3 {
            width: 120px;
            height: 120px;
            animation: rotate 20s linear infinite;
        }
        
        @keyframes rotate {
            from {
                transform: translate(-50%, -50%) rotate(0deg);
            }
            to {
                transform: translate(-50%, -50%) rotate(360deg);
            }
        }
        
        .app-title {
            font-size: 2.5rem;
            font-weight: 300;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #a0d2eb, #4facfe);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .app-subtitle {
            font-size: 1.1rem;
            opacity: 0.8;
            font-weight: 300;
        }
        
        .entrance-actions {
            margin-bottom: 40px;
        }
        
        .start-btn {
            background: linear-gradient(45deg, #4facfe, #00f2fe);
            border: none;
            color: white;
            padding: 15px 40px;
            font-size: 1.1rem;
            border-radius: 50px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
        }
        
        .start-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(79, 172, 254, 0.6);
        }
        
        .start-btn:active {
            transform: translateY(0);
        }
        
        .btn-particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        
        .btn-particle {
            position: absolute;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            animation: btnFloat 2s infinite linear;
        }
        
        .btn-particle:nth-child(1) {
            width: 4px;
            height: 4px;
            top: 20%;
            left: 10%;
            animation-delay: 0s;
        }
        
        .btn-particle:nth-child(2) {
            width: 3px;
            height: 3px;
            top: 60%;
            left: 80%;
            animation-delay: -0.5s;
        }
        
        .btn-particle:nth-child(3) {
            width: 2px;
            height: 2px;
            top: 80%;
            left: 20%;
            animation-delay: -1s;
        }
        
        @keyframes btnFloat {
            0% {
                transform: translateY(0) translateX(0);
                opacity: 0;
            }
            50% {
                opacity: 1;
            }
            100% {
                transform: translateY(-20px) translateX(10px);
                opacity: 0;
            }
        }
        
        .auth-container {
            margin-top: 30px;
            animation: slideDown 0.5s ease-out;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .auth-form {
            background: rgba(255, 255, 255, 0.1);
            padding: 25px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .auth-form h3 {
            margin-bottom: 20px;
            color: #a0d2eb;
            font-weight: 400;
        }
        
        .auth-form input {
            width: 100%;
            padding: 12px 15px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            color: white;
            font-size: 1rem;
            margin-bottom: 15px;
            outline: none;
            transition: all 0.3s ease;
        }
        
        .auth-form input:focus {
            border-color: #4facfe;
            box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.3);
        }
        
        .auth-form input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }
        
        .auth-form button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(45deg, #4facfe, #00f2fe);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .auth-form button:hover {
            transform: translateY(-1px);
            box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
        }
        
        .auth-note {
            font-size: 0.85rem;
            opacity: 0.7;
            margin-top: 15px;
        }
        
        .entrance-features {
            display: flex;
            justify-content: center;
            gap: 30px;
            opacity: 0.8;
        }
        
        .feature {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
        }
        
        .feature i {
            font-size: 1.2rem;
            color: #a0d2eb;
        }

        /* Стили для режима разработчика */
        .developer-auth {
            margin-top: 15px;
            padding: 15px;
            background: rgba(255, 193, 7, 0.1);
            border-radius: 10px;
            border: 1px solid #ffc107;
            animation: slideDown 0.5s ease-out;
        }

        .developer-step {
            margin-bottom: 15px;
        }

        .developer-step:last-child {
            margin-bottom: 0;
        }

        .developer-step h4 {
            color: #ffc107;
            margin-bottom: 8px;
            font-size: 14px;
        }

        .developer-auth input {
            width: 100%;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #ffc107;
            border-radius: 5px;
            color: white;
            margin-bottom: 10px;
        }

        .developer-auth button {
            width: 100%;
            padding: 10px;
            background: linear-gradient(45deg, #ffc107, #ff9800);
            border: none;
            border-radius: 5px;
            color: black;
            font-weight: bold;
            cursor: pointer;
        }

        .developer-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ffc107;
            color: black;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
        }

        @media (max-width: 768px) {
            .app-title {
                font-size: 2rem;
            }
            
            .quantum-logo {
                width: 100px;
                height: 100px;
            }
            
            .quantum-icon {
                font-size: 40px;
            }
            
            .entrance-features {
                gap: 20px;
            }
            
            .feature {
                font-size: 0.8rem;
            }
        }
        
        @media (max-width: 480px) {
            .app-title {
                font-size: 1.8rem;
            }
            
            .app-subtitle {
                font-size: 1rem;
            }
            
            .start-btn {
                padding: 12px 30px;
                font-size: 1rem;
            }
            
            .entrance-features {
                flex-direction: column;
                gap: 15px;
            }
        }
    `;

    document.head.appendChild(entranceStyles);
    document.body.appendChild(entranceContainer);

    // Функции для работы с экраном входа
    const quantumEntrance = {
        init() {
            this.bindEvents();
        },
        
        bindEvents() {
            document.getElementById('startMessenger').addEventListener('click', () => {
                this.showAuthForm();
            });
            
            document.getElementById('entranceEnterBtn').addEventListener('click', () => {
                this.enterMessenger();
            });
            
            document.getElementById('entranceNameInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.enterMessenger();
                }
            });
        },
        
        showAuthForm() {
            document.getElementById('entranceAuth').style.display = 'block';
            document.getElementById('startMessenger').style.display = 'none';
            document.getElementById('entranceNameInput').focus();
        },
        
        enterMessenger() {
            const name = document.getElementById('entranceNameInput').value.trim();
            
            if (name) {
                // Проверяем режим разработчика
                if (name === 'Бабаев Булат') {
                    this.showDeveloperAuth();
                    return;
                }
                
                // Обычный вход
                this.processNormalLogin(name);
            } else {
                this.shakeInput();
            }
        },

        showDeveloperAuth() {
            const authHTML = `
                <div class="developer-auth">
                    <div class="developer-step">
                        <h4>🔐 Шаг 1: Секретное слово</h4>
                        <input type="password" id="devSecretInput" placeholder="Введите секретное слово" autocomplete="off">
                    </div>
                    <button id="devContinueBtn">Продолжить</button>
                </div>
            `;
            
            document.getElementById('entranceAuth').insertAdjacentHTML('beforeend', authHTML);
            
            document.getElementById('devContinueBtn').addEventListener('click', () => {
                this.verifyDeveloperStep1();
            });

            document.getElementById('devSecretInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.verifyDeveloperStep1();
                }
            });
        },

        verifyDeveloperStep1() {
            const secret = document.getElementById('devSecretInput').value;
            
            if (secret === 'кутактус') {
                this.showDeveloperStep2();
            } else {
                this.shakeInput(document.getElementById('devSecretInput'));
                alert('Неверное секретное слово!');
            }
        },

        showDeveloperStep2() {
            document.querySelector('.developer-auth').innerHTML = `
                <div class="developer-step">
                    <h4>🔢 Шаг 2: Любимое число</h4>
                    <input type="number" id="devNumberInput" placeholder="Введите любимое число" autocomplete="off">
                </div>
                <button id="devFinalBtn">Войти как разработчик</button>
            `;

            document.getElementById('devFinalBtn').addEventListener('click', () => {
                this.finalDeveloperAuth();
            });

            document.getElementById('devNumberInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.finalDeveloperAuth();
                }
            });

            document.getElementById('devNumberInput').focus();
        },

        finalDeveloperAuth() {
            const number = document.getElementById('devNumberInput').value;
            
            if (number === '0515') {
                this.processDeveloperLogin('Бабаев Булат');
            } else {
                this.shakeInput(document.getElementById('devNumberInput'));
                alert('Неверное число!');
            }
        },

        processNormalLogin(name) {
            // Сохраняем имя
            localStorage.setItem('quantumUsername', name);
            localStorage.setItem('quantumDeveloperMode', 'false');
            
            // Генерируем ID пользователя если его нет
            let userId = localStorage.getItem('quantumUserId');
            if (!userId) {
                userId = this.generateUserId();
                localStorage.setItem('quantumUserId', userId);
            }
            
            // Анимация исчезновения экрана входа
            this.hideEntrance();
            
            // Запускаем основной мессенджер
            setTimeout(() => {
                startMainMessenger(name, userId, false);
            }, 1000);
        },

        processDeveloperLogin(name) {
            // Сохраняем имя и режим разработчика
            localStorage.setItem('quantumUsername', name);
            localStorage.setItem('quantumDeveloperMode', 'true');
            
            // Генерируем ID пользователя если его нет
            let userId = localStorage.getItem('quantumUserId');
            if (!userId) {
                userId = this.generateUserId();
                localStorage.setItem('quantumUserId', userId);
            }
            
            // Анимация исчезновения экрана входа
            this.hideEntrance();
            
            // Запускаем основной мессенджер
            setTimeout(() => {
                startMainMessenger(name, userId, true);
            }, 1000);
        },
        
        generateUserId() {
            return 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
        },
        
        shakeInput(inputElement = null) {
            const input = inputElement || document.getElementById('entranceNameInput');
            input.style.animation = 'shake 0.5s ease-in-out';
            input.focus();
            
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
        },
        
        hideEntrance() {
            const entrance = document.getElementById('quantumEntrance');
            entrance.style.animation = 'fadeOut 1s ease-in-out forwards';
            
            // Добавляем стиль для анимации исчезновения
            if (!document.getElementById('entranceAnimations')) {
                const style = document.createElement('style');
                style.id = 'entranceAnimations';
                style.textContent = `
                    @keyframes fadeOut {
                        from {
                            opacity: 1;
                            transform: scale(1);
                        }
                        to {
                            opacity: 0;
                            transform: scale(1.1);
                        }
                    }
                    
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Удаляем экран входа после анимации
            setTimeout(() => {
                if (entrance.parentNode) {
                    entrance.parentNode.removeChild(entrance);
                }
            }, 1000);
        }
    };

    // Запускаем экран входа
    setTimeout(() => {
        quantumEntrance.init();
    }, 500);
}

// Функция автоматического запуска мессенджера
function autoStartMessenger(name, userId, isDeveloper = false) {
    console.log('Автоматический запуск мессенджера для:', name);
    if (isDeveloper) {
        console.log('Режим разработчика активирован');
    }
    
    // Скрываем стандартный контейнер авторизации
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.style.display = 'none';
    }
    
    // Показываем основной интерфейс мессенджера
    const chatWrapper = document.getElementById('chatWrapper');
    if (chatWrapper) {
        chatWrapper.style.display = 'flex';
    }
    
    // Устанавливаем глобальные переменные
    if (typeof window.currentUser === 'undefined') {
        window.currentUser = name;
    }
    
    if (typeof window.userId === 'undefined') {
        window.userId = userId;
    }

    // Устанавливаем режим разработчика
    if (isDeveloper) {
        window.isDeveloperMode = true;
        this.setupDeveloperInterface();
    }
    
    // Инициализируем профиль пользователя
    setupUserProfile(name, userId);
    
    // Загружаем чаты
    if (typeof loadChatsList === 'function') {
        setTimeout(() => {
            loadChatsList();
        }, 500);
    }
    
    // Показываем уведомление
    if (typeof showNotification === 'function') {
        showNotification(`С возвращением, ${name}!`);
    }
}

// Функция запуска основного мессенджера
function startMainMessenger(name, userId, isDeveloper = false) {
    console.log('Запуск Quantum Messenger для пользователя:', name);
    if (isDeveloper) {
        console.log('Режим разработчика активирован');
    }
    
    // Удаляем экран входа
    const entrance = document.getElementById('quantumEntrance');
    if (entrance) {
        entrance.remove();
    }
    
    // Скрываем стандартный контейнер авторизации
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.style.display = 'none';
    }
    
    // Показываем основной интерфейс мессенджера
    const chatWrapper = document.getElementById('chatWrapper');
    if (chatWrapper) {
        chatWrapper.style.display = 'flex';
    }
    
    // Устанавливаем глобальные переменные
    if (typeof window.currentUser === 'undefined') {
        window.currentUser = name;
    }
    
    if (typeof window.userId === 'undefined') {
        window.userId = userId;
    }

    // Устанавливаем режим разработчика
    if (isDeveloper) {
        window.isDeveloperMode = true;
        this.setupDeveloperInterface();
    }
    
    // Инициализируем профиль пользователя
    setupUserProfile(name, userId);
    
    // Загружаем чаты
    if (typeof loadChatsList === 'function') {
        setTimeout(() => {
            loadChatsList();
        }, 500);
    }
    
    // Показываем уведомление
    if (typeof showNotification === 'function') {
        const message = isDeveloper ? 
            `Добро пожаловать в режим разработчика, ${name}!` : 
            `Добро пожаловать в Quantum Messenger, ${name}!`;
        showNotification(message);
    }
}

// Настройка интерфейса разработчика
function setupDeveloperInterface() {
    // Добавляем бейдж разработчика в заголовок
    const header = document.querySelector('.header');
    if (header && !document.getElementById('developerBadge')) {
        const badge = document.createElement('div');
        badge.id = 'developerBadge';
        badge.className = 'developer-badge';
        badge.textContent = 'Developer';
        header.style.position = 'relative';
        header.appendChild(badge);
    }

    // Добавляем вкладку жалоб в бургер-меню
    const burgerMenu = document.getElementById('burgerMenuContent');
    if (burgerMenu && !document.getElementById('complaintsBtn')) {
        const complaintItem = document.createElement('div');
        complaintItem.className = 'burger-menu-item';
        complaintItem.id = 'complaintsBtn';
        complaintItem.innerHTML = '<i class="fas fa-flag"></i> Жалобы';
        burgerMenu.appendChild(complaintItem);

        // Обработчик вкладки жалоб
        complaintItem.addEventListener('click', () => {
            if (typeof window.complaintSystem !== 'undefined') {
                window.complaintSystem.showComplaintsModal();
            }
        });
    }

    console.log('Интерфейс разработчика активирован');
}

// Настройка профиля пользователя
function setupUserProfile(name, userId) {
    // Используем Firebase для настройки профиля
    if (typeof firebase !== 'undefined' && firebase.database) {
        const userProfileRef = firebase.database().ref('profiles/' + userId);
        
        userProfileRef.once('value').then((snapshot) => {
            const userStatus = localStorage.getItem('quantumStatus') || 'online';
            
            if (!snapshot.exists()) {
                // Создаем новый профиль
                userProfileRef.set({
                    name: name,
                    username: name,
                    lastOnline: Date.now(),
                    isOnline: true,
                    status: userStatus
                });
            } else {
                // Обновляем существующий профиль
                userProfileRef.update({
                    name: name,
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

// Если нужно переопределить стандартный вход мессенджера
function overrideDefaultAuth() {
    const originalAuth = document.getElementById('authContainer');
    if (originalAuth) {
        originalAuth.style.display = 'none';
    }
}

// Вызываем переопределение после загрузки
document.addEventListener('DOMContentLoaded', overrideDefaultAuth);
