// birthdays.js
class Birthdays {
    constructor() {
        this.database = firebase.database();
        this.currentUser = null;
        this.userId = null;
        this.userProfile = null;
        this.contactsBirthdays = [];
        this.upcomingBirthdays = [];
        this.todayBirthdays = [];
        this.init();
    }

    init() {
        this.waitForAuth().then(() => {
            this.loadUserProfile();
            this.setupEventListeners();
            this.addStyles();
            this.integrateWithProfile();
            this.startBirthdayChecker();
            this.checkOwnBirthday();
        });
    }

    waitForAuth() {
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (window.currentUser && window.userId) {
                    this.currentUser = window.currentUser;
                    this.userId = window.userId;
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Стили для дня рождения в профиле */
            .birthday-section {
                margin: 20px 0;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                border: 1px solid var(--border-color);
            }

            .birthday-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 15px;
            }

            .birthday-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: bold;
                color: #4facfe;
            }

            .birthday-icon {
                font-size: 18px;
            }

            .birthday-display {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: rgba(79, 172, 254, 0.1);
                border-radius: 8px;
                margin-bottom: 10px;
            }

            .birthday-date {
                font-weight: bold;
                font-size: 16px;
            }

            .birthday-age {
                font-size: 12px;
                opacity: 0.7;
                background: rgba(255, 255, 255, 0.1);
                padding: 2px 6px;
                border-radius: 10px;
            }

            .birthday-setup-btn {
                background: linear-gradient(to right, #4facfe, #00f2fe);
                border: none;
                border-radius: 20px;
                padding: 10px 20px;
                color: white;
                cursor: pointer;
                font-weight: bold;
                transition: transform 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                justify-content: center;
            }

            .birthday-setup-btn:hover {
                transform: translateY(-1px);
            }

            /* Модальное окно дня рождения */
            .birthday-modal-content {
                max-width: 400px;
            }

            .birthday-form {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin: 20px 0;
            }

            .birthday-date-inputs {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 10px;
                margin-bottom: 10px;
            }

            .birthday-date-input {
                padding: 10px;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                background: var(--input-bg);
                color: var(--input-color);
                text-align: center;
            }

            .birthday-privacy-options {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin: 15px 0;
            }

            .birthday-privacy-option {
                display: flex;
                align-items: center;
                padding: 12px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .birthday-privacy-option:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            .birthday-privacy-option.selected {
                background: rgba(79, 172, 254, 0.1);
                border-color: #4facfe;
            }

            .birthday-privacy-icon {
                margin-right: 10px;
                font-size: 16px;
                width: 20px;
                text-align: center;
            }

            .birthday-privacy-info {
                flex: 1;
            }

            .birthday-privacy-title {
                font-weight: bold;
                margin-bottom: 2px;
            }

            .birthday-privacy-description {
                font-size: 12px;
                opacity: 0.7;
            }

            /* Модальное окно поздравления */
            .birthday-congrats-modal {
                text-align: center;
                background: linear-gradient(135deg, #ff9a9e, #fad0c4, #fad0c4, #a1c4fd);
                border-radius: 20px;
                overflow: hidden;
            }

            .birthday-congrats-content {
                padding: 30px;
                color: #333;
            }

            .birthday-congrats-icon {
                font-size: 80px;
                margin-bottom: 20px;
                animation: bounce 2s infinite;
            }

            .birthday-congrats-title {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #d63031;
            }

            .birthday-congrats-message {
                font-size: 16px;
                margin-bottom: 25px;
                line-height: 1.5;
            }

            .birthday-congrats-age {
                font-size: 20px;
                font-weight: bold;
                color: #e17055;
                margin-bottom: 20px;
            }

            .birthday-confetti {
                position: absolute;
                width: 10px;
                height: 10px;
                background: #ff4757;
                border-radius: 50%;
                animation: confettiFall 5s linear forwards;
            }

            /* Список дней рождения */
            .birthdays-list {
                max-height: 400px;
                overflow-y: auto;
                margin: 15px 0;
                border: 1px solid var(--border-color);
                border-radius: 8px;
            }

            .birthday-item {
                display: flex;
                align-items: center;
                padding: 12px;
                border-bottom: 1px solid var(--border-color);
                transition: background 0.2s;
            }

            .birthday-item:last-child {
                border-bottom: none;
            }

            .birthday-item:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            .birthday-item.today {
                background: rgba(255, 168, 1, 0.2);
                border-left: 3px solid #ffa801;
            }

            .birthday-item.upcoming {
                background: rgba(79, 172, 254, 0.1);
            }

            .birthday-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(to right, #4facfe, #00f2fe);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-right: 12px;
                flex-shrink: 0;
            }

            .birthday-info {
                flex: 1;
            }

            .birthday-name {
                font-weight: bold;
                margin-bottom: 2px;
            }

            .birthday-details {
                font-size: 12px;
                opacity: 0.7;
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .birthday-badge {
                background: #ff4757;
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: bold;
            }

            .birthday-badge.today {
                background: #ffa801;
            }

            .birthday-badge.upcoming {
                background: #4facfe;
            }

            /* Заголовок с днем рождения */
            .birthday-header-title {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .birthday-crown {
                color: #ffd700;
                animation: glow 2s ease-in-out infinite alternate;
            }

            /* Вкладка дней рождения */
            #tab-birthdays {
                display: none;
                flex-direction: column;
                height: 100%;
            }

            #tab-birthdays.active {
                display: flex;
            }

            .birthdays-tab-content {
                flex: 1;
                overflow-y: auto;
                padding: 0 10px;
            }

            /* Анимации */
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
                40% {transform: translateY(-10px);}
                60% {transform: translateY(-5px);}
            }

            @keyframes confettiFall {
                0% {
                    transform: translateY(-100px) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(1000px) rotate(720deg);
                    opacity: 0;
                }
            }

            @keyframes glow {
                from { transform: scale(1); }
                to { transform: scale(1.1); }
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            .birthday-pulse {
                animation: pulse 2s infinite;
            }

            /* Адаптивность */
            @media (max-width: 768px) {
                .birthday-date-inputs {
                    grid-template-columns: 1fr;
                }

                .birthday-congrats-title {
                    font-size: 24px;
                }

                .birthday-congrats-icon {
                    font-size: 60px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Слушаем открытие профиля
        document.addEventListener('click', (e) => {
            if (e.target.closest('#profileBtn') || e.target.closest('#burgerMenuContent .burger-menu-item')) {
                setTimeout(() => {
                    this.integrateBirthdayIntoProfile();
                }, 100);
            }
        });

        // Слушаем создание меню для добавления вкладки дней рождения
        this.setupBirthdaysTab();
    }

    async loadUserProfile() {
        try {
            const profileSnapshot = await this.database.ref('profiles/' + this.userId).once('value');
            if (profileSnapshot.exists()) {
                this.userProfile = profileSnapshot.val();
            }
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
        }
    }

    integrateWithProfile() {
        this.addToSettingsMenu();
        this.integrateBirthdayIntoProfile();
    }

    addToSettingsMenu() {
        const burgerMenu = document.getElementById('burgerMenuContent');
        if (burgerMenu && !burgerMenu.querySelector('.birthday-menu-item')) {
            const birthdayItem = document.createElement('div');
            birthdayItem.className = 'burger-menu-item birthday-menu-item';
            birthdayItem.innerHTML = '<i class="fas fa-birthday-cake"></i> Дни рождения';
            birthdayItem.addEventListener('click', () => {
                this.showBirthdaysTab();
                document.getElementById('burgerMenuContent').classList.remove('active');
            });
            
            const statusItem = document.getElementById('statusBtn');
            if (statusItem && statusItem.parentNode) {
                statusItem.parentNode.insertBefore(birthdayItem, statusItem.nextSibling);
            }
        }
    }

    setupBirthdaysTab() {
        // Добавляем вкладку "Дни рождения" в главное меню
        const tabsContainer = document.querySelector('.tabs');
        if (tabsContainer && !tabsContainer.querySelector('[data-tab="birthdays"]')) {
            const birthdaysTab = document.createElement('div');
            birthdaysTab.className = 'tab';
            birthdaysTab.dataset.tab = 'birthdays';
            birthdaysTab.innerHTML = '<i class="fas fa-birthday-cake"></i> Дни рождения';
            
            tabsContainer.appendChild(birthdaysTab);

            // Создаем контент для вкладки
            const tabContent = document.createElement('div');
            tabContent.className = 'tab-content';
            tabContent.id = 'tab-birthdays';
            tabContent.innerHTML = this.getBirthdaysTabContent();

            const tabChats = document.getElementById('tab-chats');
            const tabSearch = document.getElementById('tab-search');
            
            if (tabChats && tabSearch) {
                // Вставляем после вкладки поиска
                tabSearch.parentNode.insertBefore(tabContent, tabSearch.nextSibling);
            }

            // Обработчик переключения вкладок
            birthdaysTab.addEventListener('click', () => {
                this.switchToBirthdaysTab();
            });

            // Также добавляем обработчик для других вкладок
            this.setupTabsSwitching();
        }
    }

    setupTabsSwitching() {
        // Обработчики для всех вкладок
        document.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            if (tab && tab.dataset.tab !== 'birthdays') {
                this.hideBirthdaysTab();
            }
        });

        // Обработчик для стандартных вкладок чата
        const standardTabs = document.querySelectorAll('.tab[data-tab="chats"], .tab[data-tab="search"]');
        standardTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.hideBirthdaysTab();
            });
        });
    }

    switchToBirthdaysTab() {
        // Скрываем все вкладки
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Показываем вкладку дней рождения
        const birthdaysTab = document.querySelector('[data-tab="birthdays"]');
        const birthdaysContent = document.getElementById('tab-birthdays');
        
        if (birthdaysTab && birthdaysContent) {
            birthdaysTab.classList.add('active');
            birthdaysContent.classList.add('active');
            this.loadBirthdaysTabData();
        }
    }

    hideBirthdaysTab() {
        const birthdaysTab = document.querySelector('[data-tab="birthdays"]');
        const birthdaysContent = document.getElementById('tab-birthdays');
        
        if (birthdaysTab && birthdaysContent) {
            birthdaysTab.classList.remove('active');
            birthdaysContent.classList.remove('active');
        }
    }

    getBirthdaysTabContent() {
        return `
            <div class="birthdays-tab-content">
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-birthday-cake" style="font-size: 48px; color: #4facfe; margin-bottom: 15px;"></i>
                    <h3 style="margin-bottom: 10px;">Дни рождения</h3>
                    <p style="opacity: 0.7; margin-bottom: 20px;">Отслеживайте дни рождения ваших контактов</p>
                </div>
                
                <div id="todayBirthdaysSection" style="display: none;">
                    <h4 style="margin: 20px 0 10px 0; color: #ffa801;">
                        <i class="fas fa-crown birthday-crown"></i> Сегодня празднуют
                    </h4>
                    <div id="todayBirthdaysList" class="birthdays-list"></div>
                </div>

                <div id="upcomingBirthdaysSection" style="display: none;">
                    <h4 style="margin: 20px 0 10px 0; color: #4facfe;">Ближайшие дни рождения</h4>
                    <div id="upcomingBirthdaysList" class="birthdays-list"></div>
                </div>

                <div id="noBirthdaysMessage" style="text-align: center; padding: 40px 20px; opacity: 0.7;">
                    <i class="fas fa-birthday-cake" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Пока нет дней рождения для отображения</p>
                    <p style="font-size: 14px; margin-top: 10px;">Добавьте день рождения в своем профиле</p>
                </div>

                <div style="padding: 20px; text-align: center;">
                    <button class="birthday-setup-btn" onclick="birthdays.showBirthdaySetup()">
                        <i class="fas fa-user-edit"></i> Настроить мой день рождения
                    </button>
                </div>
            </div>
        `;
    }

    integrateBirthdayIntoProfile() {
        const profileModal = document.getElementById('profileModal');
        if (!profileModal) return;

        if (profileModal.querySelector('.birthday-section')) return;

        const profileInfo = profileModal.querySelector('.profile-info');
        if (profileInfo) {
            const birthdaySection = document.createElement('div');
            birthdaySection.className = 'birthday-section';

            if (this.userProfile && this.userProfile.birthday) {
                birthdaySection.innerHTML = this.getBirthdayDisplayHTML();
            } else {
                birthdaySection.innerHTML = this.getBirthdaySetupHTML();
            }

            profileInfo.parentNode.insertBefore(birthdaySection, profileInfo);

            // Добавляем обработчик для кнопки редактирования
            const editBtn = birthdaySection.querySelector('.birthday-edit-btn');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    this.showBirthdaySetup();
                });
            }

            // Добавляем обработчик для кнопки настройки
            const setupBtn = birthdaySection.querySelector('#setupBirthdayBtn');
            if (setupBtn) {
                setupBtn.addEventListener('click', () => {
                    this.showBirthdaySetup();
                });
            }
        }
    }

    getBirthdayDisplayHTML() {
        const birthday = this.userProfile.birthday;
        const age = this.calculateAge(birthday);
        const nextBirthday = this.getNextBirthday(birthday);
        const daysUntil = this.getDaysUntil(nextBirthday);
        const isToday = daysUntil === 0;

        return `
            <div class="birthday-header">
                <div class="birthday-title">
                    <i class="fas fa-birthday-cake birthday-icon ${isToday ? 'birthday-pulse' : ''}"></i>
                    <span>День рождения</span>
                    ${isToday ? '<span class="birthday-badge today">Сегодня!</span>' : ''}
                </div>
                <button class="birthday-edit-btn" style="background: none; border: none; color: #4facfe; cursor: pointer;">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <div class="birthday-display">
                <div class="birthday-date">${this.formatBirthdayDate(birthday)}</div>
                <div class="birthday-age">${age} лет</div>
            </div>
            <div class="birthday-privacy">
                <small>Видимость: ${this.getPrivacyText(birthday.privacy)}</small>
            </div>
            ${daysUntil <= 7 && daysUntil > 0 ? `
                <div class="birthday-countdown" style="margin-top: 10px; font-size: 12px; opacity: 0.7;">
                    🎉 До дня рождения: ${daysUntil} ${this.getDayText(daysUntil)}
                </div>
            ` : ''}
        `;
    }

    getBirthdaySetupHTML() {
        return `
            <div class="birthday-header">
                <div class="birthday-title">
                    <i class="fas fa-birthday-cake birthday-icon"></i>
                    <span>День рождения</span>
                </div>
            </div>
            <p style="margin-bottom: 15px; font-size: 14px; opacity: 0.8;">
                Добавьте дату рождения, чтобы друзья могли вас поздравить
            </p>
            <button class="birthday-setup-btn" id="setupBirthdayBtn">
                <i class="fas fa-plus"></i>
                Установить день рождения
            </button>
        `;
    }

    showBirthdaySetup() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content birthday-modal-content">
                <h3 style="margin-bottom: 20px; text-align: center;">
                    <i class="fas fa-birthday-cake" style="color: #ffa801; margin-right: 10px;"></i>
                    Настройка дня рождения
                </h3>
                
                <div class="birthday-form">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">Дата рождения</label>
                        <div class="birthday-date-inputs">
                            <select id="birthdayDay" class="birthday-date-input">
                                <option value="">День</option>
                                ${this.generateDayOptions()}
                            </select>
                            <select id="birthdayMonth" class="birthday-date-input">
                                <option value="">Месяц</option>
                                ${this.generateMonthOptions()}
                            </select>
                            <select id="birthdayYear" class="birthday-date-input">
                                <option value="">Год</option>
                                ${this.generateYearOptions()}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">Кто видит мой день рождения</label>
                        <div class="birthday-privacy-options">
                            <div class="birthday-privacy-option selected" data-privacy="contacts">
                                <i class="fas fa-user-friends birthday-privacy-icon"></i>
                                <div class="birthday-privacy-info">
                                    <div class="birthday-privacy-title">Только мои контакты</div>
                                    <div class="birthday-privacy-description">Люди из вашего списка контактов</div>
                                </div>
                            </div>
                            <div class="birthday-privacy-option" data-privacy="everyone">
                                <i class="fas fa-globe birthday-privacy-icon"></i>
                                <div class="birthday-privacy-info">
                                    <div class="birthday-privacy-title">Все пользователи</div>
                                    <div class="birthday-privacy-description">Все в мессенджере</div>
                                </div>
                            </div>
                            <div class="birthday-privacy-option" data-privacy="nobody">
                                <i class="fas fa-ban birthday-privacy-icon"></i>
                                <div class="birthday-privacy-info">
                                    <div class="birthday-privacy-title">Никто</div>
                                    <div class="birthday-privacy-description">Скрыть день рождения</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="cancelBirthdayBtn">Отмена</button>
                    <button class="modal-btn primary" id="saveBirthdayBtn">Сохранить</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupBirthdayModalEvents(modal);
        
        if (this.userProfile && this.userProfile.birthday) {
            this.fillCurrentBirthday(modal);
        }
    }

    setupBirthdayModalEvents(modal) {
        modal.querySelectorAll('.birthday-privacy-option').forEach(option => {
            option.addEventListener('click', () => {
                modal.querySelectorAll('.birthday-privacy-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
            });
        });

        modal.querySelector('#cancelBirthdayBtn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#saveBirthdayBtn').addEventListener('click', () => {
            this.saveBirthday(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    fillCurrentBirthday(modal) {
        const birthday = this.userProfile.birthday;
        if (birthday.date) {
            const date = new Date(birthday.date);
            modal.querySelector('#birthdayDay').value = date.getDate();
            modal.querySelector('#birthdayMonth').value = date.getMonth() + 1;
            modal.querySelector('#birthdayYear').value = date.getFullYear();
        }

        modal.querySelectorAll('.birthday-privacy-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.privacy === birthday.privacy) {
                option.classList.add('selected');
            }
        });
    }

    generateDayOptions() {
        let options = '';
        for (let day = 1; day <= 31; day++) {
            options += `<option value="${day}">${day}</option>`;
        }
        return options;
    }

    generateMonthOptions() {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        
        let options = '';
        months.forEach((month, index) => {
            options += `<option value="${index + 1}">${month}</option>`;
        });
        return options;
    }

    generateYearOptions() {
        const currentYear = new Date().getFullYear();
        let options = '';
        for (let year = currentYear; year >= currentYear - 100; year--) {
            options += `<option value="${year}">${year}</option>`;
        }
        return options;
    }

    async saveBirthday(modal) {
        const day = modal.querySelector('#birthdayDay').value;
        const month = modal.querySelector('#birthdayMonth').value;
        const year = modal.querySelector('#birthdayYear').value;
        const privacy = modal.querySelector('.birthday-privacy-option.selected').dataset.privacy;

        if (!day || !month || !year) {
            this.showNotification('Заполните все поля даты', true);
            return;
        }

        const birthdayDate = new Date(year, month - 1, day);
        
        if (birthdayDate.getDate() != day || birthdayDate.getMonth() != month - 1) {
            this.showNotification('Некорректная дата', true);
            return;
        }

        if (birthdayDate > new Date()) {
            this.showNotification('Дата рождения не может быть в будущем', true);
            return;
        }

        const birthdayData = {
            date: birthdayDate.getTime(),
            privacy: privacy,
            updatedAt: Date.now()
        };

        try {
            await this.database.ref('profiles/' + this.userId).update({
                birthday: birthdayData
            });

            this.userProfile.birthday = birthdayData;
            modal.remove();
            this.showNotification('День рождения сохранен');
            
            this.integrateBirthdayIntoProfile();
            this.loadContactsBirthdays();
            this.checkOwnBirthday();
            
        } catch (error) {
            console.error('Ошибка сохранения дня рождения:', error);
            this.showNotification('Ошибка сохранения', true);
        }
    }

    // Реальная логика дней рождения
    calculateAge(birthday) {
        if (!birthday || !birthday.date) return null;
        
        const birthDate = new Date(birthday.date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    getNextBirthday(birthday) {
        if (!birthday || !birthday.date) return null;
        
        const birthDate = new Date(birthday.date);
        const today = new Date();
        const currentYear = today.getFullYear();
        
        let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
        
        if (nextBirthday < today) {
            nextBirthday.setFullYear(currentYear + 1);
        }
        
        return nextBirthday;
    }

    getDaysUntil(date) {
        if (!date) return null;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        
        const diffTime = date - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    isBirthdayToday(birthday) {
        if (!birthday || !birthday.date) return false;
        
        const birthDate = new Date(birthday.date);
        const today = new Date();
        
        return birthDate.getDate() === today.getDate() && 
               birthDate.getMonth() === today.getMonth();
    }

    formatBirthdayDate(birthday) {
        if (!birthday || !birthday.date) return '';
        
        const date = new Date(birthday.date);
        const options = { day: 'numeric', month: 'long' };
        if (birthday.privacy !== 'nobody') {
            options.year = 'numeric';
        }
        
        return date.toLocaleDateString('ru-RU', options);
    }

    getPrivacyText(privacy) {
        const privacyMap = {
            'contacts': 'Только контакты',
            'everyone': 'Все',
            'nobody': 'Никто'
        };
        
        return privacyMap[privacy] || 'Только контакты';
    }

    getDayText(days) {
        if (days === 1) return 'день';
        if (days >= 2 && days <= 4) return 'дня';
        return 'дней';
    }

    async loadContactsBirthdays() {
        try {
            const profilesSnapshot = await this.database.ref('profiles').once('value');
            if (!profilesSnapshot.exists()) return;

            this.contactsBirthdays = [];
            this.todayBirthdays = [];
            this.upcomingBirthdays = [];
            
            profilesSnapshot.forEach((childSnapshot) => {
                const contact = childSnapshot.val();
                if (contact.id === this.userId) return;
                
                if (contact.birthday && contact.birthday.date && 
                    this.canSeeBirthday(contact.birthday)) {
                    
                    const birthdayData = {
                        id: contact.id,
                        name: contact.name || contact.username || 'Пользователь',
                        birthday: contact.birthday,
                        nextBirthday: this.getNextBirthday(contact.birthday),
                        age: this.calculateAge(contact.birthday)
                    };
                    
                    birthdayData.daysUntil = this.getDaysUntil(birthdayData.nextBirthday);
                    birthdayData.isToday = this.isBirthdayToday(contact.birthday);
                    
                    this.contactsBirthdays.push(birthdayData);
                    
                    if (birthdayData.isToday) {
                        this.todayBirthdays.push(birthdayData);
                    } else if (birthdayData.daysUntil <= 30) {
                        this.upcomingBirthdays.push(birthdayData);
                    }
                }
            });

            // Сортируем по ближайшим дням
            this.upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);
            
            this.updateBirthdaysTab();
            this.updateHeaderBirthday();
            
        } catch (error) {
            console.error('Ошибка загрузки дней рождения контактов:', error);
        }
    }

    canSeeBirthday(birthday) {
        if (birthday.privacy === 'nobody') return false;
        if (birthday.privacy === 'everyone') return true;
        if (birthday.privacy === 'contacts') {
            // В реальном приложении нужно проверять, является ли пользователь контактом
            // Здесь упрощенная логика - считаем всех пользователей контактами
            return true;
        }
        return false;
    }

    updateBirthdaysTab() {
        const todaySection = document.getElementById('todayBirthdaysSection');
        const upcomingSection = document.getElementById('upcomingBirthdaysSection');
        const noBirthdaysMessage = document.getElementById('noBirthdaysMessage');
        const todayList = document.getElementById('todayBirthdaysList');
        const upcomingList = document.getElementById('upcomingBirthdaysList');

        if (!todaySection) return;

        // Очищаем списки
        if (todayList) todayList.innerHTML = '';
        if (upcomingList) upcomingList.innerHTML = '';

        // Показываем сегодняшние дни рождения
        if (this.todayBirthdays.length > 0) {
            todaySection.style.display = 'block';
            this.todayBirthdays.forEach(contact => {
                if (todayList) {
                    todayList.appendChild(this.createBirthdayItem(contact, 'today'));
                }
            });
        } else {
            todaySection.style.display = 'none';
        }

        // Показываем ближайшие дни рождения
        if (this.upcomingBirthdays.length > 0) {
            upcomingSection.style.display = 'block';
            this.upcomingBirthdays.forEach(contact => {
                if (upcomingList) {
                    upcomingList.appendChild(this.createBirthdayItem(contact, 'upcoming'));
                }
            });
        } else {
            upcomingSection.style.display = 'none';
        }

        // Показываем сообщение если нет дней рождения
        if (noBirthdaysMessage) {
            if (this.todayBirthdays.length === 0 && this.upcomingBirthdays.length === 0) {
                noBirthdaysMessage.style.display = 'block';
            } else {
                noBirthdaysMessage.style.display = 'none';
            }
        }
    }

    createBirthdayItem(contact, type) {
        const item = document.createElement('div');
        item.className = `birthday-item ${type}`;
        
        item.innerHTML = `
            <div class="birthday-avatar">
                ${contact.name.charAt(0).toUpperCase()}
            </div>
            <div class="birthday-info">
                <div class="birthday-name">${contact.name}</div>
                <div class="birthday-details">
                    <span>${this.formatBirthdayDate(contact.birthday)}</span>
                    ${type === 'today' ? 
                        `<span class="birthday-badge today">${contact.age + 1} лет сегодня! 🎉</span>` :
                        `<span class="birthday-badge upcoming">через ${contact.daysUntil} ${this.getDayText(contact.daysUntil)}</span>`
                    }
                </div>
            </div>
            ${type === 'today' ? `
                <button class="birthday-action-btn" onclick="birthdays.sendBirthdayGreeting('${contact.id}')" 
                        style="background: #ffa801; border: none; border-radius: 15px; padding: 8px 12px; color: white; cursor: pointer; font-size: 12px;">
                    Поздравить
                </button>
            ` : ''}
        `;

        return item;
    }

    loadBirthdaysTabData() {
        this.loadContactsBirthdays();
    }

    showBirthdaysTab() {
        this.switchToBirthdaysTab();
    }

    updateHeaderBirthday() {
        const header = document.querySelector('.header');
        if (!header) return;

        // Убираем старую корону
        const oldCrown = header.querySelector('.birthday-crown');
        if (oldCrown) oldCrown.remove();

        // Проверяем день рождения текущего пользователя
        if (this.userProfile && this.userProfile.birthday && this.isBirthdayToday(this.userProfile.birthday)) {
            const logoContainer = header.querySelector('.logo');
            if (logoContainer) {
                const crown = document.createElement('span');
                crown.className = 'birthday-crown';
                crown.innerHTML = '👑';
                crown.title = 'С днем рождения!';
                crown.style.marginLeft = '10px';
                crown.style.fontSize = '20px';
                crown.style.animation = 'glow 2s ease-in-out infinite alternate';
                
                logoContainer.parentNode.insertBefore(crown, logoContainer.nextSibling);
            }
        }
    }

    checkOwnBirthday() {
        if (this.userProfile && this.userProfile.birthday && this.isBirthdayToday(this.userProfile.birthday)) {
            // Проверяем, не показывали ли уже поздравление сегодня
            const lastCongrats = localStorage.getItem('birthdayCongrats');
            const today = new Date().toDateString();
            
            if (lastCongrats !== today) {
                setTimeout(() => {
                    this.showBirthdayCongrats();
                }, 2000);
                
                localStorage.setItem('birthdayCongrats', today);
            }
        }
    }

    showBirthdayCongrats() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        const age = this.calculateAge(this.userProfile.birthday) + 1;
        
        modal.innerHTML = `
            <div class="modal-content birthday-congrats-modal">
                <div class="birthday-congrats-content">
                    <div class="birthday-congrats-icon">🎂</div>
                    <div class="birthday-congrats-title">С ДНЕМ РОЖДЕНИЯ!</div>
                    <div class="birthday-congrats-message">
                        Дорогой ${this.currentUser},<br>
                        Поздравляем с вашим днем рождения!
                    </div>
                    <div class="birthday-congrats-age">Вам исполняется ${age} лет! 🎉</div>
                    <button class="modal-btn primary" onclick="this.closest('.modal').remove(); birthdays.createConfetti();" 
                            style="background: #ffa801; border: none; padding: 12px 30px; font-size: 16px;">
                        Спасибо!
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.createConfetti();
    }

    createConfetti() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'birthday-confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.background = this.getRandomColor();
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 5000);
            }, i * 100);
        }
    }

    getRandomColor() {
        const colors = ['#ff4757', '#ffa801', '#2ed573', '#3742fa', '#ff6b81', '#ff9ff3'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    startBirthdayChecker() {
        setInterval(() => {
            this.checkBirthdays();
        }, 60 * 60 * 1000); // Проверяем каждый час
        
        setTimeout(() => {
            this.checkBirthdays();
        }, 5000);
    }

    async checkBirthdays() {
        await this.loadContactsBirthdays();
        this.checkOwnBirthday();
    }

    async sendBirthdayGreeting(contactId) {
        const contact = this.contactsBirthdays.find(c => c.id === contactId);
        if (!contact) return;

        const message = `🎉 С днем рождения, ${contact.name}! Желаю всего наилучшего в твой ${contact.age + 1}-й день рождения! 🎂`;
        
        if (typeof sendMessage === 'function') {
            const chatId = this.findChatWithUser(contactId);
            if (chatId) {
                if (typeof openChat === 'function') {
                    openChat(contactId, contact.name, chatId);
                    setTimeout(() => {
                        const messageInput = document.getElementById('messageInput');
                        if (messageInput) {
                            messageInput.value = message;
                            sendMessage();
                        }
                    }, 500);
                }
            }
        }

        this.showNotification(`Поздравление отправлено ${contact.name}`);
    }

    findChatWithUser(userId) {
        return `chat_${[this.userId, userId].sort().join('_')}`;
    }

    showNotification(message, isError = false) {
        if (typeof showNotification === 'function') {
            showNotification(message);
        } else {
            console.log(message);
        }
    }
}

// Инициализация
let birthdays = null;

function initBirthdays() {
    if (!birthdays) {
        birthdays = new Birthdays();
        console.log('Birthdays system initialized');
    }
}

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initBirthdays, 3000);
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Birthdays, initBirthdays };
}
