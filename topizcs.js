// birthdays.js - Система дней рождения для Quantum Messenger
class Birthdays {
    constructor() {
        this.database = firebase.database();
        this.currentUser = null;
        this.userId = null;
        this.userProfile = null;
        this.init();
    }

    init() {
        this.waitForAuth().then(() => {
            this.loadUserProfile();
            this.addStyles();
            this.integrateWithProfile();
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
                gap: 15px;
                padding: 12px;
                background: rgba(79, 172, 254, 0.1);
                border-radius: 8px;
                margin-bottom: 10px;
            }

            .birthday-date {
                font-weight: bold;
                font-size: 16px;
            }

            .birthday-age {
                font-size: 14px;
                opacity: 0.8;
                background: rgba(255, 255, 255, 0.1);
                padding: 4px 8px;
                border-radius: 12px;
            }

            .birthday-setup-btn {
                background: linear-gradient(to right, #4facfe, #00f2fe);
                border: none;
                border-radius: 20px;
                padding: 12px 24px;
                color: white;
                cursor: pointer;
                font-weight: bold;
                transition: transform 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                justify-content: center;
                font-size: 14px;
            }

            .birthday-setup-btn:hover {
                transform: translateY(-2px);
                opacity: 0.9;
            }

            .birthday-edit-btn {
                background: none;
                border: none;
                color: #4facfe;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: background 0.2s;
            }

            .birthday-edit-btn:hover {
                background: rgba(79, 172, 254, 0.1);
            }

            .birthday-modal-content {
                max-width: 400px;
                width: 90vw;
            }

            .birthday-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
                margin: 20px 0;
            }

            .birthday-date-inputs {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 10px;
                margin-bottom: 10px;
            }

            .birthday-date-input {
                padding: 12px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                background: var(--input-bg);
                color: var(--input-color);
                text-align: center;
                font-size: 14px;
            }

            .birthday-privacy-options {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin: 15px 0;
            }

            .birthday-privacy-option {
                display: flex;
                align-items: center;
                padding: 15px;
                border: 1px solid var(--border-color);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .birthday-privacy-option:hover {
                background: rgba(255, 255, 255, 0.05);
                transform: translateY(-1px);
            }

            .birthday-privacy-option.selected {
                background: rgba(79, 172, 254, 0.15);
                border-color: #4facfe;
                box-shadow: 0 2px 10px rgba(79, 172, 254, 0.2);
            }

            .birthday-privacy-icon {
                margin-right: 12px;
                font-size: 18px;
                width: 24px;
                text-align: center;
            }

            .birthday-privacy-info {
                flex: 1;
            }

            .birthday-privacy-title {
                font-weight: bold;
                margin-bottom: 4px;
                font-size: 14px;
            }

            .birthday-privacy-description {
                font-size: 12px;
                opacity: 0.7;
                line-height: 1.4;
            }

            .birthday-countdown {
                margin-top: 10px;
                font-size: 13px;
                opacity: 0.8;
                padding: 8px 12px;
                background: rgba(255, 168, 1, 0.1);
                border-radius: 8px;
                border-left: 3px solid #ffa801;
            }

            .birthday-badge {
                background: #ff4757;
                color: white;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
                margin-left: 8px;
            }

            .birthday-badge.today {
                background: #ffa801;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            .light-theme .birthday-section {
                background: rgba(0, 0, 0, 0.03);
            }

            .light-theme .birthday-display {
                background: rgba(79, 172, 254, 0.08);
            }

            .light-theme .birthday-age {
                background: rgba(0, 0, 0, 0.05);
            }

            @media (max-width: 480px) {
                .birthday-date-inputs {
                    grid-template-columns: 1fr;
                }
                
                .birthday-section {
                    padding: 12px;
                    margin: 15px 0;
                }
            }
        `;
        document.head.appendChild(style);
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
        // Добавляем секцию дня рождения в профиль
        this.addBirthdaySectionToProfile();
        
        // Слушаем открытие профиля для обновления данных
        this.setupProfileListener();
    }

    addBirthdaySectionToProfile() {
        const profileModal = document.getElementById('profileModal');
        if (!profileModal) {
            setTimeout(() => this.addBirthdaySectionToProfile(), 100);
            return;
        }

        // Проверяем, не добавлена ли уже секция
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

            // Добавляем обработчики событий
            this.setupBirthdaySectionEvents(birthdaySection);
        }
    }

    setupProfileListener() {
        // Слушаем открытие модального окна профиля
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                setTimeout(() => {
                    this.addBirthdaySectionToProfile();
                }, 100);
            });
        }

        // Также слушаем клик по бургер-меню
        document.addEventListener('click', (e) => {
            if (e.target.closest('#profileBtn') || 
                (e.target.closest('.burger-menu-item') && e.target.closest('.burger-menu-item').id === 'profileBtn')) {
                setTimeout(() => {
                    this.addBirthdaySectionToProfile();
                }, 100);
            }
        });
    }

    setupBirthdaySectionEvents(section) {
        const editBtn = section.querySelector('.birthday-edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.showBirthdaySetup();
            });
        }

        const setupBtn = section.querySelector('#setupBirthdayBtn');
        if (setupBtn) {
            setupBtn.addEventListener('click', () => {
                this.showBirthdaySetup();
            });
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
                    <i class="fas fa-birthday-cake birthday-icon"></i>
                    <span>День рождения</span>
                    ${isToday ? '<span class="birthday-badge today">Сегодня!</span>' : ''}
                </div>
                <button class="birthday-edit-btn" title="Редактировать день рождения">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <div class="birthday-display">
                <div class="birthday-date">${this.formatBirthdayDate(birthday)}</div>
                <div class="birthday-age">${age} лет</div>
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                Видимость: ${this.getPrivacyText(birthday.privacy)}
            </div>
            ${daysUntil <= 7 && daysUntil > 0 ? `
                <div class="birthday-countdown">
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
            <p style="margin-bottom: 15px; font-size: 14px; opacity: 0.8; text-align: center;">
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
                <h3 style="margin-bottom: 20px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-birthday-cake" style="color: #ffa801;"></i>
                    Настройка дня рождения
                </h3>
                
                <div class="birthday-form">
                    <div>
                        <label style="display: block; margin-bottom: 10px; font-weight: bold; font-size: 14px;">Дата рождения</label>
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
                        <label style="display: block; margin-bottom: 10px; font-weight: bold; font-size: 14px;">Кто видит мой день рождения</label>
                        <div class="birthday-privacy-options">
                            <div class="birthday-privacy-option selected" data-privacy="contacts">
                                <i class="fas fa-user-friends birthday-privacy-icon" style="color: #4facfe;"></i>
                                <div class="birthday-privacy-info">
                                    <div class="birthday-privacy-title">Только мои контакты</div>
                                    <div class="birthday-privacy-description">Люди из вашего списка контактов</div>
                                </div>
                            </div>
                            <div class="birthday-privacy-option" data-privacy="everyone">
                                <i class="fas fa-globe birthday-privacy-icon" style="color: #00b894;"></i>
                                <div class="birthday-privacy-info">
                                    <div class="birthday-privacy-title">Все пользователи</div>
                                    <div class="birthday-privacy-description">Все в мессенджере</div>
                                </div>
                            </div>
                            <div class="birthday-privacy-option" data-privacy="nobody">
                                <i class="fas fa-ban birthday-privacy-icon" style="color: #ff6b6b;"></i>
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
        
        // Заполняем текущие значения, если они есть
        if (this.userProfile && this.userProfile.birthday) {
            this.fillCurrentBirthday(modal);
        }
    }

    setupBirthdayModalEvents(modal) {
        // Обработчики выбора приватности
        modal.querySelectorAll('.birthday-privacy-option').forEach(option => {
            option.addEventListener('click', () => {
                modal.querySelectorAll('.birthday-privacy-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
            });
        });

        // Кнопка отмены
        modal.querySelector('#cancelBirthdayBtn').addEventListener('click', () => {
            modal.remove();
        });

        // Кнопка сохранения
        modal.querySelector('#saveBirthdayBtn').addEventListener('click', () => {
            this.saveBirthday(modal);
        });

        // Закрытие по клику вне модального окна
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

        // Устанавливаем выбранную приватность
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
        const day = parseInt(modal.querySelector('#birthdayDay').value);
        const month = parseInt(modal.querySelector('#birthdayMonth').value);
        const year = parseInt(modal.querySelector('#birthdayYear').value);
        const privacy = modal.querySelector('.birthday-privacy-option.selected').dataset.privacy;

        // Валидация
        if (!day || !month || !year) {
            this.showNotification('Пожалуйста, заполните все поля даты', true);
            return;
        }

        // Проверка корректности даты
        const birthdayDate = new Date(year, month - 1, day);
        if (birthdayDate.getDate() !== day || birthdayDate.getMonth() !== month - 1) {
            this.showNotification('Некорректная дата рождения', true);
            return;
        }

        // Проверка что дата не в будущем
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
            // Сохраняем в базу данных
            await this.database.ref('profiles/' + this.userId).update({
                birthday: birthdayData
            });

            // Обновляем локальные данные
            this.userProfile.birthday = birthdayData;

            // Закрываем модальное окно
            modal.remove();

            // Показываем уведомление
            this.showNotification('День рождения успешно сохранен!');

            // Обновляем интерфейс профиля
            this.updateProfileBirthdaySection();

        } catch (error) {
            console.error('Ошибка сохранения дня рождения:', error);
            this.showNotification('Ошибка сохранения дня рождения', true);
        }
    }

    updateProfileBirthdaySection() {
        const birthdaySection = document.querySelector('.birthday-section');
        if (birthdaySection) {
            if (this.userProfile && this.userProfile.birthday) {
                birthdaySection.innerHTML = this.getBirthdayDisplayHTML();
            } else {
                birthdaySection.innerHTML = this.getBirthdaySetupHTML();
            }
            this.setupBirthdaySectionEvents(birthdaySection);
        }
    }

    // Вспомогательные методы
    calculateAge(birthday) {
        if (!birthday || !birthday.date) return 0;
        
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

    formatBirthdayDate(birthday) {
        if (!birthday || !birthday.date) return '';
        
        const date = new Date(birthday.date);
        const day = date.getDate();
        const month = date.toLocaleDateString('ru-RU', { month: 'long' });
        const year = date.getFullYear();
        
        if (birthday.privacy === 'nobody') {
            return `${day} ${month}`;
        } else {
            return `${day} ${month} ${year} года`;
        }
    }

    getPrivacyText(privacy) {
        const privacyMap = {
            'contacts': 'Только контакты',
            'everyone': 'Все пользователи',
            'nobody': 'Скрыто'
        };
        
        return privacyMap[privacy] || 'Только контакты';
    }

    getDayText(days) {
        if (days === 1) return 'день';
        if (days >= 2 && days <= 4) return 'дня';
        return 'дней';
    }

    showNotification(message, isError = false) {
        if (typeof showNotification === 'function') {
            showNotification(message);
        } else {
            // Fallback уведомление
            console.log(message);
            alert(message);
        }
    }
}

// Инициализация системы дней рождения
let birthdaysSystem = null;

function initBirthdaysSystem() {
    if (!birthdaysSystem) {
        birthdaysSystem = new Birthdays();
        console.log('🎂 Система дней рождения инициализирована');
    }
}

// Автоматическая инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initBirthdaysSystem, 2000);
    });
} else {
    setTimeout(initBirthdaysSystem, 2000);
}