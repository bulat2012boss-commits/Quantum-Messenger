// channels-events.js - Система событий и встреч для Quantum Messenger

// Переменные состояния событий
let activeEvents = {};
let eventListeners = {};
let eventSettings = {
    maxTitleLength: 100,
    maxDescriptionLength: 500,
    maxParticipants: 1000
};

// Основная функция инициализации
function initEventsSystem() {
    console.log("✅ Система событий инициализирована");
    integrateEventsIntoChannels();
    addGlobalEventsHandlers();
}

// Добавление глобальных обработчиков
function addGlobalEventsHandlers() {
    // Блокировка выделения текста в событиях
    document.addEventListener('mousedown', function(e) {
        if (e.target.closest('.event-message')) {
            e.preventDefault();
        }
    });
}

// Интеграция с каналами
function integrateEventsIntoChannels() {
    const checkChannels = setInterval(() => {
        if (window.ChannelsSystem && window.initChannelInterface) {
            clearInterval(checkChannels);
            
            const originalInit = window.initChannelInterface;
            
            window.initChannelInterface = function(channelId, channelName, canSendMessages, allowPosts, allowFiles) {
                originalInit(channelId, channelName, canSendMessages, allowPosts, allowFiles);
                
                setTimeout(() => {
                    if (canSendMessages && allowPosts) {
                        addEventsButtonToChannel(channelId);
                        loadChannelEvents(channelId);
                    }
                }, 200);
            };
            
            console.log("✅ События интегрированы в каналы");
        }
    }, 500);
}

// Добавление кнопки создания события
function addEventsButtonToChannel(channelId) {
    const actionsContainer = document.querySelector('.input-area > div:first-child');
    if (!actionsContainer || document.getElementById('createEventBtn')) return;

    const eventBtn = document.createElement('button');
    eventBtn.id = 'createEventBtn';
    eventBtn.innerHTML = '<i class="fas fa-calendar-plus"></i> Событие';
    eventBtn.style.cssText = `
        padding: 8px 12px;
        background: var(--action-btn-bg);
        color: var(--action-btn-color);
        border: 1px solid var(--border-color);
        border-radius: 15px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s ease;
        margin-right: 5px;
        user-select: none;
    `;

    eventBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-1px)';
        this.style.background = 'rgba(230, 126, 34, 0.2)';
    });
    
    eventBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.background = 'var(--action-btn-bg)';
    });

    eventBtn.addEventListener('click', () => {
        showCreateEventModal(channelId);
    });

    actionsContainer.appendChild(eventBtn);
}

// Модальное окно создания события
function showCreateEventModal(channelId) {
    closeActiveModal();
    
    // Устанавливаем минимальную дату (текущий день)
    const now = new Date();
    const minDate = now.toISOString().slice(0, 16);
    
    // Устанавливаем дату по умолчанию (завтра в 19:00)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0);
    const defaultDate = tomorrow.toISOString().slice(0, 16);
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10000';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; width: 90vw; max-height: 90vh; overflow-y: auto; animation: scaleIn 0.3s ease;">
            <div style="padding: 20px; border-bottom: 1px solid var(--border-color);">
                <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-calendar-plus" style="color: #e67e22;"></i>
                    Создать событие
                </h3>
            </div>
            
            <div style="padding: 20px;">
                <!-- Название события -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                        Название события *
                        <span id="titleCounter" style="float: right; font-size: 12px; opacity: 0.7;">0/${eventSettings.maxTitleLength}</span>
                    </label>
                    <input type="text" id="eventTitle" placeholder="Введите название события" maxlength="${eventSettings.maxTitleLength}"
                           style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); font-size: 14px; outline: none;">
                </div>
                
                <!-- Описание события -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                        Описание
                        <span id="descriptionCounter" style="float: right; font-size: 12px; opacity: 0.7;">0/${eventSettings.maxDescriptionLength}</span>
                    </label>
                    <textarea id="eventDescription" placeholder="Опишите ваше событие..." rows="3" maxlength="${eventSettings.maxDescriptionLength}"
                           style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); font-size: 14px; outline: none; resize: vertical; font-family: inherit;"></textarea>
                </div>
                
                <!-- Дата и время -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Дата и время начала *</label>
                        <input type="datetime-local" id="eventStart" min="${minDate}" value="${defaultDate}"
                               style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); font-size: 14px; outline: none;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Дата и время окончания</label>
                        <input type="datetime-local" id="eventEnd" 
                               style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); font-size: 14px; outline: none;">
                    </div>
                </div>
                
                <!-- Местоположение -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Местоположение</label>
                    <input type="text" id="eventLocation" placeholder="Укажите место проведения"
                           style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); font-size: 14px; outline: none;">
                </div>
                
                <!-- Настройки события -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Настройки события</label>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 12px; background: var(--hover-color); border-radius: 8px; transition: background 0.2s;">
                        <input type="checkbox" id="allowRegistration" style="transform: scale(1.2);" checked>
                        <label for="allowRegistration" style="flex: 1; cursor: pointer;">
                            <div style="font-weight: 500;">Разрешить регистрацию</div>
                            <div style="font-size: 12px; opacity: 0.7;">Участники смогут записываться на событие</div>
                        </label>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 12px; background: var(--hover-color); border-radius: 8px; transition: background 0.2s;">
                        <input type="checkbox" id="maxParticipantsToggle" style="transform: scale(1.2);">
                        <label for="maxParticipantsToggle" style="flex: 1; cursor: pointer;">
                            <div style="font-weight: 500;">Ограничить количество участников</div>
                            <div style="font-size: 12px; opacity: 0.7;">Установить максимальное число участников</div>
                        </label>
                    </div>
                    
                    <div id="maxParticipantsContainer" style="display: none; margin-top: 10px; padding: 15px; background: var(--primary-bg); border-radius: 8px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Максимальное количество участников</label>
                        <input type="number" id="maxParticipants" min="2" max="${eventSettings.maxParticipants}" value="10"
                               style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--input-color); font-size: 14px; outline: none;">
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 12px; background: var(--hover-color); border-radius: 8px; transition: background 0.2s;">
                        <input type="checkbox" id="recurringEvent" style="transform: scale(1.2);">
                        <label for="recurringEvent" style="flex: 1; cursor: pointer;">
                            <div style="font-weight: 500;">Повторяющееся событие</div>
                            <div style="font-size: 12px; opacity: 0.7;">Создать серию повторяющихся событий</div>
                        </label>
                    </div>
                    
                    <div id="recurringSettings" style="display: none; margin-top: 10px; padding: 15px; background: var(--primary-bg); border-radius: 8px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Повторение</label>
                        <select id="recurrenceType" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--input-color); margin-bottom: 10px;">
                            <option value="weekly">Еженедельно</option>
                            <option value="biweekly">Раз в две недели</option>
                            <option value="monthly">Ежемесячно</option>
                        </select>
                        <input type="number" id="recurrenceCount" min="1" max="52" value="4" 
                               style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--input-color); font-size: 14px; outline: none;"
                               placeholder="Количество повторений">
                    </div>
                </div>
                
                <!-- Уведомления -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Уведомления</label>
                    <select id="eventNotifications" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); font-size: 14px;">
                        <option value="none">Без уведомлений</option>
                        <option value="15min">За 15 минут</option>
                        <option value="1hour" selected>За 1 час</option>
                        <option value="1day">За 1 день</option>
                        <option value="1week">За 1 неделю</option>
                    </select>
                </div>
            </div>
            
            <div style="padding: 15px 20px; border-top: 1px solid var(--border-color); display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancelEventBtn" style="padding: 10px 20px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer;">Отмена</button>
                <button id="createEventBtnModal" style="padding: 10px 20px; background: linear-gradient(to right, #e67e22, #f39c12); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Создать событие</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    activeModal = modal;

    // Инициализация обработчиков
    initEventModalHandlers(channelId);
}

// Инициализация обработчиков модального окна
function initEventModalHandlers(channelId) {
    const cancelBtn = document.getElementById('cancelEventBtn');
    const createBtn = document.getElementById('createEventBtnModal');
    const titleInput = document.getElementById('eventTitle');
    const descriptionInput = document.getElementById('eventDescription');
    const titleCounter = document.getElementById('titleCounter');
    const descriptionCounter = document.getElementById('descriptionCounter');
    const maxParticipantsToggle = document.getElementById('maxParticipantsToggle');
    const maxParticipantsContainer = document.getElementById('maxParticipantsContainer');
    const recurringEvent = document.getElementById('recurringEvent');
    const recurringSettings = document.getElementById('recurringSettings');
    const eventStart = document.getElementById('eventStart');
    const eventEnd = document.getElementById('eventEnd');
    
    // Счетчики символов
    titleInput.addEventListener('input', function() {
        const length = this.value.length;
        titleCounter.textContent = `${length}/${eventSettings.maxTitleLength}`;
        updateCounterColor(titleCounter, length, eventSettings.maxTitleLength);
    });
    
    descriptionInput.addEventListener('input', function() {
        const length = this.value.length;
        descriptionCounter.textContent = `${length}/${eventSettings.maxDescriptionLength}`;
        updateCounterColor(descriptionCounter, length, eventSettings.maxDescriptionLength);
    });
    
    // Ограничение участников
    maxParticipantsToggle.addEventListener('change', function() {
        maxParticipantsContainer.style.display = this.checked ? 'block' : 'none';
    });
    
    // Повторяющееся событие
    recurringEvent.addEventListener('change', function() {
        recurringSettings.style.display = this.checked ? 'block' : 'none';
    });
    
    // Автоматическая установка времени окончания
    eventStart.addEventListener('change', function() {
        if (!eventEnd.value) {
            const startTime = new Date(this.value);
            const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // +2 часа
            eventEnd.value = endTime.toISOString().slice(0, 16);
        }
        
        // Установка минимальной даты для окончания
        eventEnd.min = this.value;
    });
    
    // Отмена создания
    cancelBtn.addEventListener('click', closeActiveModal);
    
    // Создание события
    createBtn.addEventListener('click', function() {
        createNewEvent(channelId);
    });
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeActiveModal();
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeActiveModal();
    });
    
    // Фокус на поле названия
    setTimeout(() => titleInput.focus(), 100);
}

// Обновление цвета счетчика
function updateCounterColor(counter, length, maxLength) {
    if (length > maxLength * 0.9) {
        counter.style.color = '#e74c3c';
    } else if (length > maxLength * 0.7) {
        counter.style.color = '#f39c12';
    } else {
        counter.style.color = '';
    }
}

// Создание нового события
function createNewEvent(channelId) {
    const title = document.getElementById('eventTitle').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const startTime = document.getElementById('eventStart').value;
    const endTime = document.getElementById('eventEnd').value;
    const location = document.getElementById('eventLocation').value.trim();
    const allowRegistration = document.getElementById('allowRegistration').checked;
    const maxParticipantsToggle = document.getElementById('maxParticipantsToggle').checked;
    const maxParticipants = maxParticipantsToggle ? parseInt(document.getElementById('maxParticipants').value) : null;
    const recurringEvent = document.getElementById('recurringEvent').checked;
    const recurrenceType = document.getElementById('recurrenceType').value;
    const recurrenceCount = parseInt(document.getElementById('recurrenceCount').value);
    const notifications = document.getElementById('eventNotifications').value;
    
    // Валидация
    if (!title) {
        showNotification("Введите название события");
        document.getElementById('eventTitle').focus();
        return;
    }
    
    if (!startTime) {
        showNotification("Укажите дату и время начала");
        return;
    }
    
    if (title.length > eventSettings.maxTitleLength) {
        showNotification(`Название слишком длинное. Максимум ${eventSettings.maxTitleLength} символов`);
        return;
    }
    
    if (description.length > eventSettings.maxDescriptionLength) {
        showNotification(`Описание слишком длинное. Максимум ${eventSettings.maxDescriptionLength} символов`);
        return;
    }
    
    const startDate = new Date(startTime);
    const now = new Date();
    
    if (startDate < now) {
        showNotification("Дата начала не может быть в прошлом");
        return;
    }
    
    if (endTime && new Date(endTime) <= startDate) {
        showNotification("Дата окончания должна быть после даты начала");
        return;
    }
    
    // Создаем событие
    const eventId = database.ref('channelEvents').push().key;
    const timestamp = Date.now();
    
    const eventData = {
        id: eventId,
        title: title,
        description: description,
        startTime: startDate.getTime(),
        endTime: endTime ? new Date(endTime).getTime() : null,
        location: location,
        authorId: userId,
        authorName: currentUser,
        channelId: channelId,
        timestamp: timestamp,
        allowRegistration: allowRegistration,
        maxParticipants: maxParticipants,
        participants: {},
        participantsCount: 0,
        status: 'upcoming',
        notifications: notifications,
        type: 'event'
    };
    
    // Настройки повторения
    if (recurringEvent) {
        eventData.recurring = {
            type: recurrenceType,
            count: recurrenceCount,
            originalEventId: eventId
        };
    }
    
    // Блокируем кнопку
    const createBtn = document.getElementById('createEventBtnModal');
    createBtn.disabled = true;
    createBtn.textContent = 'Создание...';
    createBtn.style.opacity = '0.7';
    
    // Сохраняем в базу
    database.ref('channelEvents/' + eventId).set(eventData)
        .then(() => {
            showNotification("✅ Событие создано!");
            closeActiveModal();
            
            // Создаем повторяющиеся события если нужно
            if (recurringEvent) {
                createRecurringEvents(eventData, recurrenceType, recurrenceCount);
            }
            
            // Обновляем канал
            database.ref('channels/' + channelId).update({
                lastMessage: "📅 Событие: " + (title.length > 25 ? title.substring(0, 22) + '...' : title),
                lastMessageTime: timestamp
            });
        })
        .catch(error => {
            console.error("Ошибка создания события:", error);
            showNotification("❌ Ошибка создания события");
            createBtn.disabled = false;
            createBtn.textContent = 'Создать событие';
            createBtn.style.opacity = '1';
        });
}

// Создание повторяющихся событий
function createRecurringEvents(originalEvent, recurrenceType, recurrenceCount) {
    const events = [];
    let currentDate = new Date(originalEvent.startTime);
    
    for (let i = 1; i < recurrenceCount; i++) {
        const nextEvent = {...originalEvent};
        const nextEventId = database.ref('channelEvents').push().key;
        
        // Вычисляем следующую дату
        switch (recurrenceType) {
            case 'weekly':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            case 'biweekly':
                currentDate.setDate(currentDate.getDate() + 14);
                break;
            case 'monthly':
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
        }
        
        nextEvent.id = nextEventId;
        nextEvent.startTime = currentDate.getTime();
        nextEvent.timestamp = Date.now() + i * 1000; // Небольшая задержка для порядка
        nextEvent.recurring = {
            type: recurrenceType,
            count: recurrenceCount - i,
            originalEventId: originalEvent.id
        };
        
        events.push(nextEvent);
    }
    
    // Сохраняем все события
    const updates = {};
    events.forEach(event => {
        updates[`channelEvents/${event.id}`] = event;
    });
    
    database.ref().update(updates)
        .then(() => {
            showNotification(`✅ Создано ${events.length} повторяющихся событий`);
        })
        .catch(error => {
            console.error("Ошибка создания повторяющихся событий:", error);
        });
}

// Загрузка событий канала
function loadChannelEvents(channelId) {
    const container = document.getElementById('channelMessagesContainer');
    if (!container) return;
    
    // Удаляем старый слушатель
    if (eventListeners[channelId]) {
        database.ref('channelEvents').off('value', eventListeners[channelId]);
    }
    
    // Слушаем события
    eventListeners[channelId] = database.ref('channelEvents').orderByChild('channelId').equalTo(channelId).on('value', (snapshot) => {
        if (!snapshot.exists()) return;
        
        const events = snapshot.val();
        const eventsArray = Object.values(events).sort((a, b) => a.startTime - b.startTime);
        
        // Удаляем старые события
        const oldEvents = container.querySelectorAll('.event-message');
        oldEvents.forEach(event => event.remove());
        
        // Добавляем новые
        eventsArray.forEach(event => {
            displayEvent(event, container);
        });
        
        // Прокручиваем вниз
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    });
}

// Отображение события в чате
function displayEvent(event, container) {
    const eventElement = document.createElement('div');
    eventElement.className = 'event-message';
    eventElement.dataset.eventId = event.id;
    eventElement.style.cssText = `
        background: var(--hover-color);
        border-radius: 12px;
        padding: 15px;
        margin: 10px 0;
        border-left: 4px solid #e67e22;
        animation: fadeIn 0.3s ease;
        position: relative;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    `;
    
    const now = Date.now();
    const startTime = new Date(event.startTime);
    const endTime = event.endTime ? new Date(event.endTime) : null;
    const isPast = event.startTime < now;
    const isRegistered = event.participants && event.participants[userId];
    const canRegister = event.allowRegistration && !isPast && !isRegistered;
    const isFull = event.maxParticipants && event.participantsCount >= event.maxParticipants;
    
    // Форматирование даты и времени
    const dateString = startTime.toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const timeString = startTime.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const endTimeString = endTime ? endTime.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    }) : null;
    
    // Статус события
    let statusBadge = '';
    if (isPast) {
        statusBadge = '<span style="color: #7f8c8d; font-size: 12px; background: rgba(127, 140, 141, 0.1); padding: 2px 8px; border-radius: 12px;">Завершено</span>';
    } else if (event.startTime - now < 24 * 60 * 60 * 1000) {
        statusBadge = '<span style="color: #e74c3c; font-size: 12px; background: rgba(231, 76, 60, 0.1); padding: 2px 8px; border-radius: 12px;">Скоро</span>';
    } else {
        statusBadge = '<span style="color: #2ecc71; font-size: 12px; background: rgba(46, 204, 113, 0.1); padding: 2px 8px; border-radius: 12px;">Предстоящее</span>';
    }
    
    // Участники
    const participantsCount = event.participantsCount || 0;
    const participantsText = event.maxParticipants ? 
        `${participantsCount}/${event.maxParticipants} участников` : 
        `${participantsCount} участников`;
    
    eventElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
            <i class="fas fa-calendar-alt" style="color: #e67e22;"></i>
            <strong>${event.authorName}</strong>
            <span style="font-size: 11px; opacity: 0.7;">создал(а) событие</span>
            ${statusBadge}
        </div>
        
        <div style="font-weight: 600; margin-bottom: 12px; font-size: 16px; color: #e67e22;">${event.title}</div>
        
        ${event.description ? `<div style="margin-bottom: 12px; font-size: 14px; line-height: 1.4;">${event.description}</div>` : ''}
        
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 15px; margin-bottom: 15px; font-size: 13px;">
            <div style="display: flex; align-items: center; gap: 6px; opacity: 0.8;">
                <i class="fas fa-clock"></i>
                <span>Дата:</span>
            </div>
            <div>${dateString}</div>
            
            <div style="display: flex; align-items: center; gap: 6px; opacity: 0.8;">
                <i class="fas fa-hourglass-start"></i>
                <span>Время:</span>
            </div>
            <div>${timeString}${endTimeString ? ` - ${endTimeString}` : ''}</div>
            
            ${event.location ? `
                <div style="display: flex; align-items: center; gap: 6px; opacity: 0.8;">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Место:</span>
                </div>
                <div>${event.location}</div>
            ` : ''}
            
            <div style="display: flex; align-items: center; gap: 6px; opacity: 0.8;">
                <i class="fas fa-users"></i>
                <span>Участники:</span>
            </div>
            <div>${participantsText}</div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
            <div style="display: flex; gap: 8px;">
                ${event.allowRegistration && !isPast ? `
                    ${!isRegistered ? `
                        <button class="register-btn" data-event-id="${event.id}" 
                                style="padding: 8px 16px; background: ${isFull ? '#95a5a6' : '#2ecc71'}; color: white; border: none; border-radius: 6px; cursor: ${isFull ? 'not-allowed' : 'pointer'}; font-size: 12px; transition: all 0.3s ease;"
                                ${isFull ? 'disabled' : ''}>
                            <i class="fas fa-user-plus"></i> ${isFull ? 'Мест нет' : 'Записаться'}
                        </button>
                    ` : `
                        <button class="unregister-btn" data-event-id="${event.id}" 
                                style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.3s ease;">
                            <i class="fas fa-user-times"></i> Отменить запись
                        </button>
                    `}
                ` : ''}
                
                <button class="event-details-btn" data-event-id="${event.id}" 
                        style="padding: 8px 16px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.3s ease;">
                    <i class="fas fa-info-circle"></i> Подробнее
                </button>
            </div>
            
            <div style="font-size: 11px; opacity: 0.7;">
                ${new Date(event.timestamp).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
            </div>
        </div>
        
        ${isRegistered ? `
            <div style="color: #2ecc71; font-size: 12px; margin-top: 8px; display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-check-circle"></i> Вы записаны на это событие
            </div>
        ` : ''}
    `;
    
    container.appendChild(eventElement);
    
    // Добавляем обработчики
    addEventEventHandlers(eventElement, event, canRegister, isRegistered);
}

// Добавление обработчиков событий
function addEventEventHandlers(eventElement, event, canRegister, isRegistered) {
    // Кнопка записи
    const registerBtn = eventElement.querySelector('.register-btn');
    if (registerBtn && canRegister) {
        registerBtn.addEventListener('click', function() {
            registerForEvent(event.id);
        });
        
        registerBtn.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-1px)';
                this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }
        });
        
        registerBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    }
    
    // Кнопка отмены записи
    const unregisterBtn = eventElement.querySelector('.unregister-btn');
    if (unregisterBtn && isRegistered) {
        unregisterBtn.addEventListener('click', function() {
            unregisterFromEvent(event.id);
        });
        
        unregisterBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
        
        unregisterBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    }
    
    // Кнопка подробнее
    const detailsBtn = eventElement.querySelector('.event-details-btn');
    if (detailsBtn) {
        detailsBtn.addEventListener('click', function() {
            showEventDetails(event.id);
        });
        
        detailsBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
        
        detailsBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    }
}

// Запись на событие
function registerForEvent(eventId) {
    database.ref('channelEvents/' + eventId).once('value')
        .then(snapshot => {
            const event = snapshot.val();
            if (!event) {
                showNotification("❌ Событие не найдено");
                return;
            }
            
            if (event.participants && event.participants[userId]) {
                showNotification("❌ Вы уже записаны на это событие");
                return;
            }
            
            if (event.maxParticipants && event.participantsCount >= event.maxParticipants) {
                showNotification("❌ На это событие нет свободных мест");
                return;
            }
            
            const now = Date.now();
            if (event.startTime < now) {
                showNotification("❌ Это событие уже завершено");
                return;
            }
            
            const updates = {};
            updates[`channelEvents/${eventId}/participants/${userId}`] = {
                userId: userId,
                userName: currentUser,
                registeredAt: now
            };
            updates[`channelEvents/${eventId}/participantsCount`] = firebase.database.ServerValue.increment(1);
            
            return database.ref().update(updates);
        })
        .then(() => {
            showNotification("✅ Вы успешно записались на событие!");
        })
        .catch(error => {
            console.error("Ошибка записи на событие:", error);
            showNotification("❌ Ошибка записи на событие");
        });
}

// Отмена записи на событие
function unregisterFromEvent(eventId) {
    if (!confirm("Отменить вашу запись на это событие?")) {
        return;
    }
    
    database.ref('channelEvents/' + eventId).once('value')
        .then(snapshot => {
            const event = snapshot.val();
            if (!event || !event.participants || !event.participants[userId]) {
                showNotification("❌ Вы не записаны на это событие");
                return;
            }
            
            const updates = {};
            updates[`channelEvents/${eventId}/participants/${userId}`] = null;
            updates[`channelEvents/${eventId}/participantsCount`] = firebase.database.ServerValue.increment(-1);
            
            return database.ref().update(updates);
        })
        .then(() => {
            showNotification("✅ Запись на событие отменена");
        })
        .catch(error => {
            console.error("Ошибка отмены записи:", error);
            showNotification("❌ Ошибка отмены записи");
        });
}

// Показать детали события
function showEventDetails(eventId) {
    database.ref('channelEvents/' + eventId).once('value')
        .then(snapshot => {
            const event = snapshot.val();
            if (!event) return;
            
            showEventDetailsModal(event);
        });
}

// Модальное окно деталей события
function showEventDetailsModal(event) {
    closeActiveModal();
    
    const startTime = new Date(event.startTime);
    const endTime = event.endTime ? new Date(event.endTime) : null;
    const now = Date.now();
    const isPast = event.startTime < now;
    const isRegistered = event.participants && event.participants[userId];
    
    // Форматирование даты
    const dateString = startTime.toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Участники
    const participants = event.participants ? Object.values(event.participants) : [];
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10000';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; animation: scaleIn 0.3s ease;">
            <div style="padding: 20px; border-bottom: 1px solid var(--border-color);">
                <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-calendar-alt" style="color: #e67e22;"></i>
                    Детали события
                </h3>
            </div>
            
            <div style="padding: 20px;">
                <div style="font-weight: 600; font-size: 18px; margin-bottom: 15px; color: #e67e22;">${event.title}</div>
                
                ${event.description ? `
                    <div style="margin-bottom: 15px; padding: 12px; background: var(--hover-color); border-radius: 8px;">
                        <div style="font-weight: 500; margin-bottom: 5px;">Описание:</div>
                        <div style="font-size: 14px; line-height: 1.4;">${event.description}</div>
                    </div>
                ` : ''}
                
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; margin-bottom: 15px; font-size: 14px;">
                    <div style="font-weight: 500; opacity: 0.8;">Дата:</div>
                    <div>${dateString}</div>
                    
                    <div style="font-weight: 500; opacity: 0.8;">Время:</div>
                    <div>${startTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}${endTime ? ` - ${endTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}` : ''}</div>
                    
                    ${event.location ? `
                        <div style="font-weight: 500; opacity: 0.8;">Место:</div>
                        <div>${event.location}</div>
                    ` : ''}
                    
                    <div style="font-weight: 500; opacity: 0.8;">Организатор:</div>
                    <div>${event.authorName}</div>
                    
                    <div style="font-weight: 500; opacity: 0.8;">Участники:</div>
                    <div>${participants.length}${event.maxParticipants ? `/${event.maxParticipants}` : ''}</div>
                </div>
                
                ${participants.length > 0 ? `
                    <div style="margin-top: 15px;">
                        <div style="font-weight: 500; margin-bottom: 10px;">Список участников:</div>
                        <div style="max-height: 150px; overflow-y: auto; background: var(--hover-color); padding: 10px; border-radius: 8px;">
                            ${participants.map(participant => `
                                <div style="display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid var(--border-color);">
                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: #2ecc71;"></div>
                                    <span>${participant.userName}</span>
                                    ${participant.userId === userId ? '<span style="color: #e67e22; font-size: 12px;">(Вы)</span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div style="padding: 15px 20px; border-top: 1px solid var(--border-color); display: flex; gap: 10px; justify-content: flex-end;">
                ${event.allowRegistration && !isPast ? `
                    ${!isRegistered ? `
                        <button id="registerInModalBtn" style="padding: 10px 20px; background: #2ecc71; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-user-plus"></i> Записаться
                        </button>
                    ` : `
                        <button id="unregisterInModalBtn" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-user-times"></i> Отменить запись
                        </button>
                    `}
                ` : ''}
                <button id="closeEventDetailsBtn" style="padding: 10px 20px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer;">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    activeModal = modal;
    
    // Обработчики для модального окна
    document.getElementById('closeEventDetailsBtn').addEventListener('click', closeActiveModal);
    
    const registerBtn = document.getElementById('registerInModalBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            registerForEvent(event.id);
            closeActiveModal();
        });
    }
    
    const unregisterBtn = document.getElementById('unregisterInModalBtn');
    if (unregisterBtn) {
        unregisterBtn.addEventListener('click', () => {
            unregisterFromEvent(event.id);
            closeActiveModal();
        });
    }
    
    modal.addEventListener('click', (e) => e.target === modal && closeActiveModal());
}

// Вспомогательные функции
function showNotification(message) {
    if (window.showNotification) {
        window.showNotification(message);
    } else {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ecc71;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
            user-select: none;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

function closeActiveModal() {
    if (window.activeModal) {
        window.activeModal.remove();
        window.activeModal = null;
    }
}

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log("📅 Система событий загружается...");
    
    // Добавляем CSS анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        .event-message {
            transition: all 0.3s ease;
        }
        
        .register-btn:hover, .unregister-btn:hover, .event-details-btn:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }
        
        /* Блокировка выделения для событий */
        .event-message, .event-message * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        /* Адаптивность для мобильных */
        @media (max-width: 768px) {
            .event-message {
                margin: 8px 0;
                padding: 12px;
            }
            
            .register-btn, .unregister-btn, .event-details-btn {
                padding: 6px 12px !important;
                font-size: 11px !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Ждем готовности системы
    const initInterval = setInterval(() => {
        if (typeof database !== 'undefined' && window.ChannelsSystem) {
            clearInterval(initInterval);
            setTimeout(initEventsSystem, 1000);
        }
    }, 500);
});

// Глобальный экспорт
window.EventsSystem = {
    init: initEventsSystem,
    createEvent: showCreateEventModal,
    version: '1.0'
};

console.log("✅ Quantum Messenger Events System v1.0 loaded!");