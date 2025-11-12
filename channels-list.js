// channels-list.js
class MessageSearch {
    constructor() {
        this.isInitialized = false;
        this.searchActive = false;
        this.originalChatHeader = null;
        this.calendarActive = false;
    }

    init() {
        if (this.isInitialized) return;
        
        this.injectStyles();
        this.addSearchButton();
        this.isInitialized = true;
        console.log("Message Search initialized");
    }

    injectStyles() {
        const styles = `
            .search-messages-btn {
                background: none;
                border: none;
                color: var(--text-color);
                cursor: pointer;
                font-size: 16px;
                padding: 5px;
                border-radius: 50%;
                transition: background 0.2s;
                margin-left: 5px;
            }

            .search-messages-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .message-search-header {
                position: relative;
                padding: 10px 15px;
                background: var(--header-bg);
                border-bottom: 1px solid var(--border-color);
                display: none;
                align-items: center;
                gap: 10px;
                z-index: 100;
                flex-shrink: 0;
            }

            .message-search-header.active {
                display: flex;
            }

            .search-input-wrapper {
                flex: 1;
                position: relative;
            }

            .search-input-wrapper i {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                opacity: 0.6;
            }

            .message-search-input {
                width: 100%;
                padding: 10px 10px 10px 35px;
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-color);
                border: 1px solid var(--border-color);
                border-radius: 20px;
                font-size: 14px;
                outline: none;
            }

            .message-search-input:focus {
                border-color: #4facfe;
            }

            .search-results-count {
                font-size: 12px;
                opacity: 0.7;
                white-space: nowrap;
                min-width: 80px;
                text-align: center;
            }

            .search-nav-btn {
                background: none;
                border: none;
                color: var(--text-color);
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                transition: background 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .search-nav-btn:hover:not(:disabled) {
                background: rgba(255, 255, 255, 0.1);
            }

            .search-nav-btn:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }

            .close-search-btn {
                background: none;
                border: none;
                color: var(--text-color);
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                transition: background 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .close-search-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .calendar-search-btn {
                background: none;
                border: none;
                color: var(--text-color);
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                transition: background 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .calendar-search-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .highlighted-message {
                background: rgba(255, 235, 59, 0.3) !important;
                border: 1px solid #ffd54f !important;
                animation: pulseHighlight 1s ease-in-out;
            }

            @keyframes pulseHighlight {
                0% { background-color: rgba(255, 235, 59, 0.1); }
                50% { background-color: rgba(255, 235, 59, 0.5); }
                100% { background-color: rgba(255, 235, 59, 0.3); }
            }

            .current-highlight {
                background: rgba(76, 175, 80, 0.3) !important;
                border: 1px solid #4caf50 !important;
                transform: scale(1.02);
                transition: transform 0.2s ease;
            }

            .chat-header.hidden {
                display: none !important;
            }

            /* Calendar Styles */
            .calendar-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .calendar-container {
                background: var(--header-bg);
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                min-width: 300px;
                max-width: 90vw;
            }

            .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .calendar-title {
                font-size: 16px;
                font-weight: bold;
                color: var(--text-color);
            }

            .calendar-close-btn {
                background: none;
                border: none;
                color: var(--text-color);
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
            }

            .calendar-close-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .calendar-nav-btn {
                background: none;
                border: none;
                color: var(--text-color);
                cursor: pointer;
                padding: 5px 10px;
                border-radius: 5px;
            }

            .calendar-nav-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 5px;
                margin-bottom: 10px;
            }

            .calendar-weekday {
                text-align: center;
                font-size: 12px;
                color: var(--text-color);
                opacity: 0.7;
                padding: 5px;
            }

            .calendar-day {
                text-align: center;
                padding: 8px 5px;
                border: none;
                background: none;
                color: var(--text-color);
                cursor: pointer;
                border-radius: 5px;
                font-size: 14px;
            }

            .calendar-day:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .calendar-day.other-month {
                opacity: 0.3;
            }

            .calendar-day.today {
                background: rgba(76, 175, 80, 0.3);
                font-weight: bold;
            }

            .calendar-day.selected {
                background: #4facfe;
                color: white;
            }

            .calendar-day.has-messages {
                position: relative;
            }

            .calendar-day.has-messages::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 4px;
                background: #4facfe;
                border-radius: 50%;
            }

            .calendar-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 15px;
            }

            .calendar-action-btn {
                padding: 8px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.2s;
            }

            .calendar-confirm-btn {
                background: #4facfe;
                color: white;
            }

            .calendar-confirm-btn:hover {
                background: #3a9bed;
            }

            .calendar-cancel-btn {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-color);
            }

            .calendar-cancel-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            @media (max-width: 480px) {
                .message-search-header {
                    padding: 8px 10px;
                }

                .message-search-input {
                    padding: 8px 8px 8px 30px;
                    font-size: 13px;
                }

                .search-results-count {
                    font-size: 11px;
                    min-width: 70px;
                }

                .search-nav-btn, .close-search-btn, .calendar-search-btn {
                    padding: 6px;
                }

                .calendar-container {
                    margin: 20px;
                    padding: 15px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    addSearchButton() {
        this.waitForChatHeader().then(() => {
            this.createSearchButton();
        }).catch(error => {
            console.error("Failed to add search button:", error);
        });
    }

    waitForChatHeader() {
        return new Promise((resolve, reject) => {
            const checkHeader = () => {
                const chatHeader = document.querySelector('.chat-header');
                if (chatHeader) {
                    resolve(chatHeader);
                } else {
                    setTimeout(checkHeader, 100);
                }
            };
            checkHeader();
            
            setTimeout(() => reject(new Error("Chat header not found")), 5000);
        });
    }

    createSearchButton() {
        const chatHeaderActions = document.querySelector('.chat-header-actions');
        if (!chatHeaderActions) return;

        const existingBtn = document.getElementById('messageSearchBtn');
        if (existingBtn) {
            existingBtn.remove();
        }

        const searchBtn = document.createElement('button');
        searchBtn.id = 'messageSearchBtn';
        searchBtn.className = 'search-messages-btn';
        searchBtn.innerHTML = '<i class="fas fa-search"></i>';
        searchBtn.title = 'Поиск по сообщениям';

        const menuBtn = document.getElementById('chatMenuBtn');
        if (menuBtn) {
            chatHeaderActions.insertBefore(searchBtn, menuBtn);
        } else {
            chatHeaderActions.appendChild(searchBtn);
        }

        searchBtn.addEventListener('click', () => {
            this.toggleSearch();
        });
    }

    toggleSearch() {
        if (this.searchActive) {
            this.closeSearch();
        } else {
            this.openSearch();
        }
    }

    openSearch() {
        this.createSearchHeader();
        this.hideOriginalHeader();
        this.searchActive = true;
        
        setTimeout(() => {
            const searchInput = document.getElementById('messageSearchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }, 100);
    }

    closeSearch() {
        this.removeSearchHeader();
        this.showOriginalHeader();
        this.clearHighlights();
        this.searchActive = false;
        this.closeCalendar();
    }

    createSearchHeader() {
        this.removeSearchHeader();

        const searchHeader = document.createElement('div');
        searchHeader.id = 'messageSearchHeader';
        searchHeader.className = 'message-search-header active';
        
        searchHeader.innerHTML = `
            <button class="close-search-btn" id="closeSearchBtn" title="Закрыть поиск">
                <i class="fas fa-arrow-left"></i>
            </button>
            <div class="search-input-wrapper">
                <i class="fas fa-search"></i>
                <input type="text" id="messageSearchInput" class="message-search-input" placeholder="Поиск в сообщениях...">
            </div>
            <button class="calendar-search-btn" id="calendarSearchBtn" title="Перейти к дате">
                <i class="fas fa-calendar-alt"></i>
            </button>
            <div class="search-results-count" id="searchResultsCount">Введите запрос</div>
            <button class="search-nav-btn" id="prevResultBtn" title="Предыдущий результат" disabled>
                <i class="fas fa-chevron-up"></i>
            </button>
            <button class="search-nav-btn" id="nextResultBtn" title="Следующий результат" disabled>
                <i class="fas fa-chevron-down"></i>
            </button>
        `;

        const chatWindow = document.getElementById('chatWindow');
        if (chatWindow) {
            const chatHeader = document.querySelector('.chat-header');
            if (chatHeader) {
                chatWindow.insertBefore(searchHeader, chatHeader);
            } else {
                chatWindow.insertBefore(searchHeader, chatWindow.firstChild);
            }
        }

        this.setupSearchEvents();
    }

    removeSearchHeader() {
        const searchHeader = document.getElementById('messageSearchHeader');
        if (searchHeader) {
            searchHeader.remove();
        }
    }

    hideOriginalHeader() {
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            this.originalChatHeader = chatHeader.style.display;
            chatHeader.style.display = 'none';
            chatHeader.classList.add('hidden');
        }
    }

    showOriginalHeader() {
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            chatHeader.style.display = '';
            chatHeader.classList.remove('hidden');
        }
    }

    setupSearchEvents() {
        const searchInput = document.getElementById('messageSearchInput');
        const prevBtn = document.getElementById('prevResultBtn');
        const nextBtn = document.getElementById('nextResultBtn');
        const closeBtn = document.getElementById('closeSearchBtn');
        const calendarBtn = document.getElementById('calendarSearchBtn');

        if (!searchInput) return;

        let searchTimeout;
        let currentResults = [];
        let currentIndex = -1;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentResults.length > 0) {
                    currentIndex = currentIndex > 0 ? currentIndex - 1 : currentResults.length - 1;
                    this.highlightCurrentResult(currentResults, currentIndex);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentResults.length > 0) {
                    currentIndex = currentIndex < currentResults.length - 1 ? currentIndex + 1 : 0;
                    this.highlightCurrentResult(currentResults, currentIndex);
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeSearch();
            });
        }

        if (calendarBtn) {
            calendarBtn.addEventListener('click', () => {
                this.openCalendar();
            });
        }

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearch();
            } else if (e.key === 'Enter') {
                if (currentResults.length > 0) {
                    currentIndex = currentIndex < currentResults.length - 1 ? currentIndex + 1 : 0;
                    this.highlightCurrentResult(currentResults, currentIndex);
                }
            }
        });

        this.performSearch = (searchTerm) => {
            currentResults = [];
            currentIndex = -1;
            
            this.clearHighlights();

            if (!searchTerm.trim()) {
                this.updateResultsCount(0, 0);
                this.updateNavButtons(false, false);
                return;
            }

            const messages = document.querySelectorAll('.message');
            const term = searchTerm.toLowerCase();

            messages.forEach((message, index) => {
                const text = message.textContent.toLowerCase();
                if (text.includes(term)) {
                    currentResults.push(message);
                    message.classList.add('highlighted-message');
                }
            });

            this.updateResultsCount(currentResults.length, 0);
            this.updateNavButtons(currentResults.length > 0, currentResults.length > 0);

            if (currentResults.length > 0) {
                currentIndex = 0;
                this.highlightCurrentResult(currentResults, currentIndex);
            }
        };

        this.highlightCurrentResult = (results, index) => {
            results.forEach(msg => msg.classList.remove('current-highlight'));
            
            if (results[index]) {
                results[index].classList.add('current-highlight');
                results[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
                this.updateResultsCount(results.length, index + 1);
            }
        };

        this.updateResultsCount = (total, current) => {
            const countElement = document.getElementById('searchResultsCount');
            if (countElement) {
                if (total === 0) {
                    countElement.textContent = 'Нет результатов';
                } else {
                    countElement.textContent = `${current} из ${total}`;
                }
            }
        };

        this.updateNavButtons = (hasPrev, hasNext) => {
            const prevBtn = document.getElementById('prevResultBtn');
            const nextBtn = document.getElementById('nextResultBtn');
            
            if (prevBtn) prevBtn.disabled = !hasPrev;
            if (nextBtn) nextBtn.disabled = !hasNext;
        };
    }

    openCalendar() {
        if (this.calendarActive) return;
        
        this.calendarActive = true;
        
        const overlay = document.createElement('div');
        overlay.className = 'calendar-overlay';
        overlay.id = 'calendarOverlay';
        
        const today = new Date();
        let currentMonth = today.getMonth();
        let currentYear = today.getFullYear();
        
        overlay.innerHTML = `
            <div class="calendar-container">
                <div class="calendar-header">
                    <button class="calendar-nav-btn" id="calendarPrevMonth">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="calendar-title" id="calendarTitle"></div>
                    <button class="calendar-nav-btn" id="calendarNextMonth">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <button class="calendar-close-btn" id="calendarCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="calendar-grid" id="calendarWeekdays"></div>
                <div class="calendar-grid" id="calendarDays"></div>
                <div class="calendar-actions">
                    <button class="calendar-action-btn calendar-cancel-btn" id="calendarCancelBtn">Отмена</button>
                    <button class="calendar-action-btn calendar-confirm-btn" id="calendarConfirmBtn">Перейти к дате</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        this.renderCalendar(currentMonth, currentYear);
        this.setupCalendarEvents();
    }

    closeCalendar() {
        this.calendarActive = false;
        const overlay = document.getElementById('calendarOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    renderCalendar(month, year) {
        const calendarTitle = document.getElementById('calendarTitle');
        const calendarWeekdays = document.getElementById('calendarWeekdays');
        const calendarDays = document.getElementById('calendarDays');
        
        if (!calendarTitle || !calendarWeekdays || !calendarDays) return;
        
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        
        calendarTitle.textContent = `${monthNames[month]} ${year}`;
        
        // Weekdays
        const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        calendarWeekdays.innerHTML = weekdays.map(day => 
            `<div class="calendar-weekday">${day}</div>`
        ).join('');
        
        // Days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = (firstDay.getDay() + 6) % 7; // Adjust for Monday as first day
        
        const today = new Date();
        const selectedDate = this.selectedDate || today;
        
        let calendarHTML = '';
        
        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = 0; i < startingDay; i++) {
            const day = prevMonthLastDay - startingDay + i + 1;
            calendarHTML += `<button class="calendar-day other-month" data-date="${year}-${month}-${day}">${day}</button>`;
        }
        
        // Current month days
        const datesWithMessages = this.getDatesWithMessages();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month + 1}-${day}`;
            const dateObj = new Date(year, month, day);
            
            let dayClass = 'calendar-day';
            
            // Check if today
            if (dateObj.toDateString() === today.toDateString()) {
                dayClass += ' today';
            }
            
            // Check if selected
            if (dateObj.toDateString() === selectedDate.toDateString()) {
                dayClass += ' selected';
            }
            
            // Check if has messages
            if (datesWithMessages.has(dateStr)) {
                dayClass += ' has-messages';
            }
            
            calendarHTML += `<button class="${dayClass}" data-date="${dateStr}">${day}</button>`;
        }
        
        // Next month days
        const totalCells = 42; // 6 weeks
        const remainingCells = totalCells - (startingDay + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            calendarHTML += `<button class="calendar-day other-month" data-date="${year}-${month + 2}-${day}">${day}</button>`;
        }
        
        calendarDays.innerHTML = calendarHTML;
    }

    getDatesWithMessages() {
        const dates = new Set();
        const messages = document.querySelectorAll('.message');
        
        messages.forEach(message => {
            const timestamp = message.querySelector('.message-time');
            if (timestamp) {
                const dateText = timestamp.textContent.trim();
                // Extract date from timestamp (assuming format like "12:30 15.04.2024")
                const dateMatch = dateText.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                if (dateMatch) {
                    const [, day, month, year] = dateMatch;
                    dates.add(`${year}-${month}-${day}`);
                }
            }
        });
        
        return dates;
    }

    setupCalendarEvents() {
        const prevMonthBtn = document.getElementById('calendarPrevMonth');
        const nextMonthBtn = document.getElementById('calendarNextMonth');
        const closeBtn = document.getElementById('calendarCloseBtn');
        const cancelBtn = document.getElementById('calendarCancelBtn');
        const confirmBtn = document.getElementById('calendarConfirmBtn');
        const calendarDays = document.getElementById('calendarDays');
        
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        this.selectedDate = new Date();
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                this.renderCalendar(currentMonth, currentYear);
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                this.renderCalendar(currentMonth, currentYear);
            });
        }
        
        if (calendarDays) {
            calendarDays.addEventListener('click', (e) => {
                if (e.target.classList.contains('calendar-day')) {
                    // Remove selected class from all days
                    document.querySelectorAll('.calendar-day').forEach(day => {
                        day.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked day
                    e.target.classList.add('selected');
                    
                    const dateStr = e.target.getAttribute('data-date');
                    const [year, month, day] = dateStr.split('-');
                    this.selectedDate = new Date(year, month - 1, day);
                }
            });
        }
        
        const closeCalendar = () => {
            this.closeCalendar();
        };
        
        if (closeBtn) closeBtn.addEventListener('click', closeCalendar);
        if (cancelBtn) cancelBtn.addEventListener('click', closeCalendar);
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.navigateToDate(this.selectedDate);
                this.closeCalendar();
            });
        }
        
        // Close on overlay click
        const overlay = document.getElementById('calendarOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeCalendar();
                }
            });
        }
    }

    navigateToDate(date) {
        const messages = document.querySelectorAll('.message');
        let targetMessage = null;
        
        // Find first message on or after selected date
        for (let message of messages) {
            const timestamp = message.querySelector('.message-time');
            if (timestamp) {
                const dateText = timestamp.textContent.trim();
                const dateMatch = dateText.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                if (dateMatch) {
                    const [, day, month, year] = dateMatch;
                    const messageDate = new Date(year, month - 1, day);
                    
                    if (messageDate >= date) {
                        targetMessage = message;
                        break;
                    }
                }
            }
        }
        
        if (targetMessage) {
            targetMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add temporary highlight
            targetMessage.classList.add('current-highlight');
            setTimeout(() => {
                targetMessage.classList.remove('current-highlight');
            }, 2000);
        } else {
            // If no message found, scroll to bottom (most recent)
            const chatMessages = document.querySelector('.chat-messages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    }

    clearHighlights() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => {
            msg.classList.remove('highlighted-message', 'current-highlight');
        });
    }

    setupChatChangeListener() {
        const originalBackToChats = window.backToChats;
        if (typeof originalBackToChats === 'function') {
            window.backToChats = function() {
                originalBackToChats.apply(this, arguments);
                if (window.messageSearch) {
                    window.messageSearch.closeSearch();
                }
            };
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (!window.messageSearch) {
            window.messageSearch = new MessageSearch();
            window.messageSearch.init();
            window.messageSearch.setupChatChangeListener();
        }
    }, 2000);
});