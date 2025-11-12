// Система дат в истории сообщений с мини-календарем для навигации
class MessageDatesCalendar {
    constructor() {
        this.dateMarkers = {};
        this.availableDates = new Set();
        this.currentChatId = null;
        this.init();
    }

    init() {
        this.createCalendarUI();
        this.bindEvents();
        this.observeMessageChanges();
        console.log("Message Dates Calendar initialized");
    }

    // Создание UI мини-календаря
    createCalendarUI() {
        if (!document.getElementById('messageDatesCalendar')) {
            const calendarHTML = `
                <div class="modal" id="messageDatesCalendar">
                    <div class="modal-content" style="max-width: 320px;">
                        <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-calendar-day"></i> Навигация по датам
                        </h3>
                        
                        <div class="calendar-mini" id="calendarMini" 
                             style="max-height: 400px; overflow-y: auto; padding: 10px; background: var(--other-msg-bg); border-radius: 8px;">
                        </div>

                        <div class="modal-buttons" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
                            <button class="modal-btn secondary" id="closeMiniCalendarBtn">Закрыть</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', calendarHTML);
        }

        this.addCalendarStyles();
    }

    // Добавление стилей для дат и календаря
    addCalendarStyles() {
        if (!document.getElementById('messageDatesStyles')) {
            const styles = `
                <style id="messageDatesStyles">
                    .date-marker {
                        text-align: center;
                        margin: 20px 0;
                        position: relative;
                        z-index: 10;
                    }

                    .date-marker-content {
                        display: inline-block;
                        background: var(--system-msg-bg);
                        color: var(--text-color);
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 500;
                        border: 1px solid var(--border-color);
                        cursor: pointer;
                        transition: all 0.3s ease;
                        position: relative;
                        backdrop-filter: blur(10px);
                    }

                    .date-marker-content:hover {
                        background: var(--message-bg);
                        color: white;
                        transform: scale(1.05);
                    }

                    .date-marker-content.has-calendar::after {
                        content: '📅';
                        margin-left: 5px;
                        font-size: 10px;
                    }

                    .mini-calendar {
                        display: grid;
                        grid-template-columns: repeat(7, 1fr);
                        gap: 4px;
                        margin-bottom: 10px;
                    }

                    .mini-calendar-header {
                        text-align: center;
                        font-weight: bold;
                        font-size: 11px;
                        padding: 5px;
                        color: var(--text-color);
                        grid-column: 1 / -1;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .mini-calendar-day-header {
                        text-align: center;
                        font-size: 10px;
                        font-weight: bold;
                        padding: 4px;
                        color: var(--text-color);
                        opacity: 0.7;
                    }

                    .mini-calendar-day {
                        text-align: center;
                        padding: 6px 4px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 11px;
                        transition: all 0.2s ease;
                        border: 1px solid transparent;
                        position: relative;
                    }

                    .mini-calendar-day:hover {
                        background: rgba(79, 172, 254, 0.2);
                    }

                    .mini-calendar-day.has-messages {
                        background: rgba(79, 172, 254, 0.1);
                        border-color: #4facfe;
                    }

                    .mini-calendar-day.today {
                        background: var(--message-bg);
                        color: white;
                    }

                    .mini-calendar-day.selected {
                        background: var(--message-bg);
                        color: white;
                        transform: scale(1.1);
                    }

                    .mini-calendar-day.other-month {
                        opacity: 0.3;
                    }

                    .mini-calendar-nav {
                        display: flex;
                        gap: 5px;
                    }

                    .mini-calendar-nav-btn {
                        background: none;
                        border: none;
                        color: var(--text-color);
                        cursor: pointer;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 10px;
                        transition: background 0.2s;
                    }

                    .mini-calendar-nav-btn:hover {
                        background: rgba(255, 255, 255, 0.1);
                    }

                    .date-list {
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                        margin-top: 10px;
                    }

                    .date-list-item {
                        padding: 8px 12px;
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.2s ease;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .date-list-item:hover {
                        background: rgba(79, 172, 254, 0.2);
                    }

                    .date-message-count {
                        background: var(--message-bg);
                        color: white;
                        border-radius: 8px;
                        padding: 2px 6px;
                        font-size: 10px;
                        min-width: 20px;
                        text-align: center;
                    }

                    .calendar-section {
                        margin-bottom: 15px;
                    }

                    .calendar-section-title {
                        font-size: 12px;
                        font-weight: bold;
                        margin-bottom: 8px;
                        color: var(--text-color);
                        opacity: 0.8;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }

    // Привязка событий
    bindEvents() {
        // Закрытие мини-календаря
        document.getElementById('closeMiniCalendarBtn')?.addEventListener('click', () => {
            this.closeMiniCalendar();
        });

        // Закрытие при клике вне модального окна
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('messageDatesCalendar');
            if (e.target === modal) {
                this.closeMiniCalendar();
            }
        });

        // Обработка кликов на маркеры дат
        document.addEventListener('click', (e) => {
            if (e.target.closest('.date-marker-content')) {
                const dateMarker = e.target.closest('.date-marker-content');
                const dateStr = dateMarker.getAttribute('data-date');
                this.openMiniCalendar(new Date(dateStr));
            }
        });
    }

    // Наблюдение за изменениями сообщений
    observeMessageChanges() {
        // Слушаем изменения в контейнере сообщений
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        this.processNewMessages();
                    }
                });
            });

            observer.observe(messagesContainer, {
                childList: true,
                subtree: true
            });
        }

        // Также слушаем изменения активного чата
        if (window.currentChatId) {
            this.currentChatId = window.currentChatId;
            this.loadAvailableDates();
        }
    }

    // Обработка новых сообщений
    processNewMessages() {
        const messages = document.querySelectorAll('.message');
        let lastDate = null;

        messages.forEach((message) => {
            const timestamp = this.getMessageTimestamp(message);
            if (!timestamp) return;

            const messageDate = new Date(timestamp);
            const dateKey = this.getDateKey(messageDate);

            // Проверяем, нужно ли добавить маркер даты
            if (!lastDate || this.getDateKey(lastDate) !== dateKey) {
                this.addDateMarker(message, messageDate);
                lastDate = messageDate;
            }

            // Добавляем дату в список доступных
            this.availableDates.add(dateKey);
        });
    }

    // Получение временной метки сообщения
    getMessageTimestamp(messageElement) {
        // Пытаемся получить timestamp из данных сообщения
        if (messageElement.dataset.timestamp) {
            return parseInt(messageElement.dataset.timestamp);
        }

        // Ищем timestamp в структуре сообщения
        const timestampElement = messageElement.querySelector('.timestamp');
        if (timestampElement) {
            // Парсим время из текста (это fallback, лучше хранить в data-атрибутах)
            const timeText = timestampElement.textContent;
            const now = new Date();
            return now.getTime(); // Временное решение
        }

        return null;
    }

    // Получение ключа даты
    getDateKey(date) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // Добавление маркера даты
    addDateMarker(messageElement, date) {
        const dateKey = this.getDateKey(date);
        
        // Если маркер для этой даты уже существует, пропускаем
        if (this.dateMarkers[dateKey]) return;

        const dateMarker = document.createElement('div');
        dateMarker.className = 'date-marker';
        dateMarker.innerHTML = `
            <div class="date-marker-content has-calendar" data-date="${date.toISOString()}">
                ${this.formatDateDisplay(date)}
            </div>
        `;

        // Вставляем маркер перед сообщением
        messageElement.parentNode.insertBefore(dateMarker, messageElement);

        // Сохраняем ссылку на маркер
        this.dateMarkers[dateKey] = dateMarker;
    }

    // Форматирование даты для отображения
    formatDateDisplay(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (this.getDateKey(date) === this.getDateKey(today)) {
            return 'Сегодня';
        } else if (this.getDateKey(date) === this.getDateKey(yesterday)) {
            return 'Вчера';
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    }

    // Открытие мини-календаря
    openMiniCalendar(selectedDate = null) {
        this.selectedDate = selectedDate || new Date();
        this.renderMiniCalendar();
        
        const modal = document.getElementById('messageDatesCalendar');
        modal.classList.add('active');
    }

    // Закрытие мини-календаря
    closeMiniCalendar() {
        const modal = document.getElementById('messageDatesCalendar');
        modal.classList.remove('active');
    }

    // Отрисовка мини-календаря
    renderMiniCalendar() {
        const calendarContainer = document.getElementById('calendarMini');
        const currentDate = this.selectedDate;
        
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

        // Получаем первый день месяца и количество дней
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        let calendarHTML = `
            <div class="mini-calendar-header">
                <button class="mini-calendar-nav-btn prev-month">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span>${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}</span>
                <button class="mini-calendar-nav-btn next-month">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="mini-calendar">
        `;

        // Заголовки дней недели
        dayNames.forEach(day => {
            calendarHTML += `<div class="mini-calendar-day-header">${day}</div>`;
        });

        // Пустые ячейки перед первым днем месяца
        for (let i = 0; i < (startingDay === 0 ? 6 : startingDay - 1); i++) {
            calendarHTML += `<div class="mini-calendar-day other-month"></div>`;
        }

        // Дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateKey = this.getDateKey(date);
            const isToday = this.isToday(date);
            const isSelected = this.selectedDate && this.getDateKey(date) === this.getDateKey(this.selectedDate);
            const hasMessages = this.availableDates.has(dateKey);
            
            let dayClass = 'mini-calendar-day';
            if (isToday) dayClass += ' today';
            if (isSelected) dayClass += ' selected';
            if (hasMessages) dayClass += ' has-messages';

            calendarHTML += `
                <div class="${dayClass}" data-date="${date.toISOString()}">
                    ${day}
                </div>
            `;
        }

        calendarHTML += '</div>';

        // Список дат с сообщениями
        calendarHTML += this.renderDateList();

        calendarContainer.innerHTML = calendarHTML;

        // Привязка событий календаря
        this.bindMiniCalendarEvents(currentDate);
    }

    // Отрисовка списка дат с сообщениями
    renderDateList() {
        if (this.availableDates.size === 0) {
            return `
                <div class="date-list">
                    <div style="text-align: center; padding: 20px; opacity: 0.7; font-size: 12px;">
                        <i class="fas fa-comment-slash"></i><br>
                        Нет сообщений для отображения
                    </div>
                </div>
            `;
        }

        let dateListHTML = `
            <div class="calendar-section">
                <div class="calendar-section-title">
                    <i class="fas fa-history"></i>
                    Даты переписки
                </div>
                <div class="date-list">
        `;

        // Сортируем даты в обратном порядке (новые сверху)
        const sortedDates = Array.from(this.availableDates)
            .sort()
            .reverse()
            .slice(0, 10); // Показываем только последние 10 дат

        sortedDates.forEach(dateKey => {
            const date = new Date(dateKey + 'T00:00:00');
            const messageCount = this.getMessageCountForDate(dateKey);
            const displayText = this.formatDateDisplay(date);

            dateListHTML += `
                <div class="date-list-item" data-date="${date.toISOString()}">
                    <span>${displayText}</span>
                    <span class="date-message-count">${messageCount}</span>
                </div>
            `;
        });

        dateListHTML += '</div></div>';
        return dateListHTML;
    }

    // Получение количества сообщений для даты
    getMessageCountForDate(dateKey) {
        // В реальном приложении здесь должен быть запрос к базе данных
        // Для демонстрации возвращаем случайное число
        return Math.floor(Math.random() * 10) + 1;
    }

    // Привязка событий мини-календаря
    bindMiniCalendarEvents(currentDate) {
        // Навигация по месяцам
        document.querySelector('.prev-month')?.addEventListener('click', () => {
            const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            this.selectedDate = newDate;
            this.renderMiniCalendar();
        });

        document.querySelector('.next-month')?.addEventListener('click', () => {
            const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            this.selectedDate = newDate;
            this.renderMiniCalendar();
        });

        // Выбор даты в календаре
        document.querySelectorAll('.mini-calendar-day.has-messages').forEach(day => {
            day.addEventListener('click', (e) => {
                const dateStr = e.target.getAttribute('data-date');
                this.navigateToDate(new Date(dateStr));
            });
        });

        // Выбор даты из списка
        document.querySelectorAll('.date-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const dateStr = e.currentTarget.getAttribute('data-date');
                this.navigateToDate(new Date(dateStr));
            });
        });
    }

    // Проверка, является ли дата сегодняшней
    isToday(date) {
        const today = new Date();
        return this.getDateKey(date) === this.getDateKey(today);
    }

    // Навигация к выбранной дате
    navigateToDate(date) {
        this.closeMiniCalendar();
        
        // Находим маркер даты или первое сообщение на эту дату
        const dateKey = this.getDateKey(date);
        const dateMarker = this.dateMarkers[dateKey];
        
        if (dateMarker) {
            // Прокручиваем к маркеру даты
            dateMarker.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Добавляем анимацию выделения
            this.highlightDateMarker(dateMarker);
        } else {
            // Если маркера нет, ищем первое сообщение на эту дату
            this.findAndScrollToFirstMessage(date);
        }
    }

    // Подсветка маркера даты
    highlightDateMarker(marker) {
        const content = marker.querySelector('.date-marker-content');
        content.style.background = 'var(--message-bg)';
        content.style.color = 'white';
        content.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            content.style.background = '';
            content.style.color = '';
            content.style.transform = '';
        }, 2000);
    }

    // Поиск и прокрутка к первому сообщению на дату
    findAndScrollToFirstMessage(date) {
        const targetTimestamp = date.getTime();
        const endTimestamp = targetTimestamp + 24 * 60 * 60 * 1000; // Следующий день
        
        if (!window.database) {
            this.showNotification('База данных не доступна');
            return;
        }

        const messagesRef = window.database.ref('messages');
        messagesRef.orderByChild('timestamp')
            .startAt(targetTimestamp)
            .endAt(endTimestamp)
            .limitToFirst(1)
            .once('value', (snapshot) => {
                if (snapshot.exists()) {
                    const messageId = Object.keys(snapshot.val())[0];
                    this.scrollToMessage(messageId);
                } else {
                    this.showNotification('Сообщений на эту дату не найдено');
                }
            });
    }

    // Прокрутка к сообщению
    scrollToMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Подсветка сообщения
            this.highlightMessage(messageElement);
        } else {
            this.showNotification('Сообщение не найдено в текущем просмотре');
        }
    }

    // Подсветка сообщения
    highlightMessage(messageElement) {
        const originalBackground = messageElement.style.background;
        messageElement.style.background = 'rgba(255, 235, 59, 0.3)';
        messageElement.style.transition = 'background 0.5s ease';
        
        setTimeout(() => {
            messageElement.style.background = originalBackground;
        }, 2000);
    }

    // Загрузка доступных дат из базы данных
    loadAvailableDates() {
        if (!window.database || !this.currentChatId) return;

        const messagesRef = window.database.ref('messages');
        messagesRef.orderByChild('chatId')
            .equalTo(this.currentChatId)
            .once('value', (snapshot) => {
                if (!snapshot.exists()) return;

                const messages = snapshot.val();
                this.availableDates.clear();

                Object.keys(messages).forEach(messageId => {
                    const message = messages[messageId];
                    const date = new Date(message.timestamp);
                    const dateKey = this.getDateKey(date);
                    this.availableDates.add(dateKey);
                });

                console.log('Available dates loaded:', this.availableDates.size);
            });
    }

    // Показать уведомление
    showNotification(message) {
        if (window.showNotification) {
            window.showNotification(message);
        } else {
            console.log(message);
        }
    }
}

// Инициализация системы дат при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.messageDatesCalendar = new MessageDatesCalendar();
    }, 1000); // Даем время для загрузки основного интерфейса
});

// Интеграция с основным мессенджером
if (typeof window !== 'undefined') {
    // Перехват функции открытия чата для обновления доступных дат
    const originalOpenChat = window.openChat;
    if (originalOpenChat) {
        window.openChat = function(userId, userName, chatId) {
            originalOpenChat.apply(this, arguments);
            
            if (window.messageDatesCalendar) {
                window.messageDatesCalendar.currentChatId = chatId || window.currentChatId;
                setTimeout(() => {
                    window.messageDatesCalendar.loadAvailableDates();
                }, 500);
            }
        };
    }
}