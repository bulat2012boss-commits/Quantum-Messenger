// channels-polls.js - Полностью рабочая система опросов для Quantum Messenger

// Переменные состояния
let activePolls = {};
let pollListeners = {};
let pollSettings = {
    maxOptions: 10,
    minOptions: 2,
    maxQuestionLength: 200,
    maxOptionLength: 100
};

// Основная функция инициализации
function initPollsSystem() {
    console.log("✅ Улучшенная система опросов инициализирована");
    loadPollSettings();
    integratePollsIntoChannels();
    addGlobalPollHandlers();
}

// Добавление глобальных обработчиков
function addGlobalPollHandlers() {
    // Блокировка выделения текста в опросах
    document.addEventListener('mousedown', function(e) {
        if (e.target.closest('.poll-message')) {
            e.preventDefault();
        }
    });
    
    // Блокировка контекстного меню в опросах
    document.addEventListener('contextmenu', function(e) {
        const pollElement = e.target.closest('.poll-message');
        if (pollElement) {
            e.preventDefault();
            
            // Показываем наше контекстное меню только для админов
            if (userRoleInCurrentChannel === 'admin') {
                showPollContextMenu(e, pollElement);
            }
        }
    });
    
    // Блокировка перетаскивания
    document.addEventListener('dragstart', function(e) {
        if (e.target.closest('.poll-message')) {
            e.preventDefault();
        }
    });
}

// Загрузка настроек опросов
function loadPollSettings() {
    const saved = localStorage.getItem('quantumPollSettings');
    if (saved) {
        pollSettings = { ...pollSettings, ...JSON.parse(saved) };
    }
}

// Интеграция с каналами
function integratePollsIntoChannels() {
    const checkChannels = setInterval(() => {
        if (window.ChannelsSystem && window.initChannelInterface) {
            clearInterval(checkChannels);
            
            const originalInit = window.initChannelInterface;
            
            window.initChannelInterface = function(channelId, channelName, canSendMessages, allowPosts, allowFiles) {
                originalInit(channelId, channelName, canSendMessages, allowPosts, allowFiles);
                
                setTimeout(() => {
                    if (canSendMessages && allowPosts) {
                        addPollButtonToChannel(channelId);
                        loadChannelPolls(channelId);
                    }
                }, 200);
            };
            
            console.log("✅ Опросы интегрированы в каналы");
        }
    }, 500);
}

// Контекстное меню для опросов
function showPollContextMenu(e, pollElement) {
    const pollId = pollElement.dataset.pollId;
    if (!pollId) return;
    
    const contextMenu = document.createElement('div');
    contextMenu.style.cssText = `
        position: fixed;
        left: ${e.pageX}px;
        top: ${e.pageY}px;
        background: var(--header-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 8px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        min-width: 180px;
        animation: fadeIn 0.2s ease;
        user-select: none;
    `;
    
    contextMenu.innerHTML = `
        <div class="context-menu-item" data-action="close-poll" style="padding: 8px 12px; cursor: pointer; border-radius: 4px; transition: background 0.2s; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-lock"></i> Закрыть опрос
        </div>
        <div class="context-menu-item" data-action="delete-poll" style="padding: 8px 12px; cursor: pointer; border-radius: 4px; transition: background 0.2s; color: #e74c3c; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-trash"></i> Удалить опрос
        </div>
        <div class="context-menu-item" data-action="poll-stats" style="padding: 8px 12px; cursor: pointer; border-radius: 4px; transition: background 0.2s; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-chart-bar"></i> Статистика
        </div>
    `;
    
    document.body.appendChild(contextMenu);
    
    // Обработчики пунктов меню
    contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.background = 'var(--hover-color)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.background = '';
        });
        
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            handlePollContextAction(action, pollId, pollElement);
            contextMenu.remove();
        });
    });
    
    // Закрытие меню
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!contextMenu.contains(e.target)) {
                contextMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    }, 100);
}

// Обработка действий контекстного меню
function handlePollContextAction(action, pollId, pollElement) {
    switch (action) {
        case 'close-poll':
            closePoll(pollId);
            break;
        case 'delete-poll':
            deletePoll(pollId);
            break;
        case 'poll-stats':
            showPollStatistics(pollId);
            break;
    }
}

// Закрытие опроса
function closePoll(pollId) {
    if (confirm("Закрыть опрос для новых голосов?")) {
        database.ref('channelPolls/' + pollId).update({
            closed: true,
            closedAt: Date.now(),
            closedBy: userId
        }).then(() => {
            showNotification("✅ Опрос закрыт");
        });
    }
}

// Удаление опроса
function deletePoll(pollId) {
    if (confirm("Удалить опрос? Это действие нельзя отменить.")) {
        database.ref('channelPolls/' + pollId).remove()
            .then(() => {
                showNotification("✅ Опрос удален");
            })
            .catch(error => {
                console.error("Ошибка удаления опроса:", error);
                showNotification("❌ Ошибка удаления опроса");
            });
    }
}

// Статистика опроса
function showPollStatistics(pollId) {
    database.ref('channelPolls/' + pollId).once('value')
        .then(snapshot => {
            const poll = snapshot.val();
            if (!poll) return;
            
            showPollStatsModal(poll);
        });
}

// Модальное окно статистики
function showPollStatsModal(poll) {
    closeActiveModal();
    
    const totalVotes = poll.totalVotes || 0;
    const options = poll.options || {};
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10000';
    
    let statsHTML = '';
    Object.keys(options).forEach(optionKey => {
        const option = options[optionKey];
        const votes = option.votes || 0;
        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        
        statsHTML += `
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: 500;">${option.text}</span>
                    <span>${votes} голосов (${percentage}%)</span>
                </div>
                <div style="height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; background: #9b59b6; width: ${percentage}%; transition: width 0.5s ease;"></div>
                </div>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; animation: scaleIn 0.3s ease;">
            <div style="padding: 20px; border-bottom: 1px solid var(--border-color);">
                <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-chart-bar" style="color: #9b59b6;"></i>
                    Статистика опроса
                </h3>
            </div>
            
            <div style="padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px;">${poll.question}</h4>
                    <div style="background: var(--hover-color); padding: 10px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 14px;">
                            <span>Всего голосов: <strong>${totalVotes}</strong></span>
                            <span>Автор: ${poll.authorName}</span>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="margin-bottom: 15px;">Результаты:</h4>
                    ${statsHTML}
                </div>
            </div>
            
            <div style="padding: 15px 20px; border-top: 1px solid var(--border-color); text-align: right;">
                <button id="closeStatsBtn" style="padding: 10px 20px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer;">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    activeModal = modal;
    
    document.getElementById('closeStatsBtn').addEventListener('click', closeActiveModal);
    modal.addEventListener('click', (e) => e.target === modal && closeActiveModal());
}

// Добавление кнопки создания опроса
function addPollButtonToChannel(channelId) {
    const actionsContainer = document.querySelector('.input-area > div:first-child');
    if (!actionsContainer || document.getElementById('createPollBtn')) return;

    const pollBtn = document.createElement('button');
    pollBtn.id = 'createPollBtn';
    pollBtn.innerHTML = '<i class="fas fa-poll"></i> Опрос';
    pollBtn.style.cssText = `
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

    pollBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-1px)';
        this.style.background = 'rgba(155, 89, 182, 0.2)';
    });
    
    pollBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.background = 'var(--action-btn-bg)';
    });

    pollBtn.addEventListener('click', () => {
        showAdvancedPollModal(channelId);
    });

    actionsContainer.appendChild(pollBtn);
}

// Улучшенное модальное окно создания опроса
function showAdvancedPollModal(channelId) {
    closeActiveModal();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText = `
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.7);
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; width: 90vw; max-height: 85vh; overflow-y: auto; animation: scaleIn 0.3s ease;">
            <div style="padding: 20px; border-bottom: 1px solid var(--border-color);">
                <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-poll" style="color: #9b59b6;"></i>
                    Создать опрос
                </h3>
            </div>
            
            <div style="padding: 20px;">
                <!-- Вопрос опроса -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                        Вопрос опроса 
                        <span id="questionCounter" style="float: right; font-size: 12px; opacity: 0.7;">0/${pollSettings.maxQuestionLength}</span>
                    </label>
                    <textarea id="pollQuestion" placeholder="Задайте вопрос..." rows="2"
                           style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); font-size: 14px; outline: none; resize: vertical; font-family: inherit;"></textarea>
                </div>
                
                <!-- Варианты ответов -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Варианты ответов</label>
                    <div id="pollOptions">
                        <div class="poll-option-row" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
                            <input type="text" class="option-input" placeholder="Вариант 1" maxlength="${pollSettings.maxOptionLength}"
                                   style="flex: 1; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--input-color); font-size: 14px; outline: none;">
                            <button class="remove-option" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; opacity: 0.5;" disabled>×</button>
                        </div>
                        <div class="poll-option-row" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
                            <input type="text" class="option-input" placeholder="Вариант 2" maxlength="${pollSettings.maxOptionLength}"
                                   style="flex: 1; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--input-color); font-size: 14px; outline: none;">
                            <button class="remove-option" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer;">×</button>
                        </div>
                    </div>
                    <button id="addOptionBtn" style="width: 100%; padding: 10px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; margin-top: 10px;">
                        + Добавить вариант (осталось: ${pollSettings.maxOptions - 2})
                    </button>
                </div>
                
                <!-- Настройки -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Настройки опроса</label>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 12px; background: var(--hover-color); border-radius: 8px; transition: background 0.2s;">
                        <input type="checkbox" id="multipleChoice" style="transform: scale(1.2);">
                        <label for="multipleChoice" style="flex: 1; cursor: pointer;">
                            <div style="font-weight: 500;">Разрешить несколько ответов</div>
                            <div style="font-size: 12px; opacity: 0.7;">Участники смогут выбирать несколько вариантов</div>
                        </label>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 12px; background: var(--hover-color); border-radius: 8px; transition: background 0.2s;">
                        <input type="checkbox" id="anonymousPoll" style="transform: scale(1.2);">
                        <label for="anonymousPoll" style="flex: 1; cursor: pointer;">
                            <div style="font-weight: 500;">Анонимный опрос</div>
                            <div style="font-size: 12px; opacity: 0.7;">Голоса участников будут скрыты</div>
                        </label>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 12px; background: var(--hover-color); border-radius: 8px; transition: background 0.2s;">
                        <input type="checkbox" id="quizMode" style="transform: scale(1.2);">
                        <label for="quizMode" style="flex: 1; cursor: pointer;">
                            <div style="font-weight: 500;">Режим викторины</div>
                            <div style="font-size: 12px; opacity: 0.7;">С правильным ответом и объяснением</div>
                        </label>
                    </div>
                    
                    <div id="quizSettings" style="display: none; margin-top: 10px; padding: 15px; background: var(--primary-bg); border-radius: 8px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Правильный ответ</label>
                        <select id="correctAnswer" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--input-color); margin-bottom: 10px;">
                            <option value="">Выберите правильный вариант</option>
                        </select>
                        <textarea id="quizExplanation" placeholder="Объяснение ответа (необязательно)" rows="2"
                               style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--input-color); font-size: 13px; resize: vertical;"></textarea>
                    </div>
                </div>
            </div>
            
            <div style="padding: 15px 20px; border-top: 1px solid var(--border-color); display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancelPollBtn" style="padding: 10px 20px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer;">Отмена</button>
                <button id="createPollBtnModal" style="padding: 10px 20px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Создать опрос</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    activeModal = modal;

    // Инициализация обработчиков
    initAdvancedPollModalHandlers(channelId);
}

// Инициализация улучшенного модального окна
function initAdvancedPollModalHandlers(channelId) {
    const optionsContainer = document.getElementById('pollOptions');
    const addOptionBtn = document.getElementById('addOptionBtn');
    const cancelBtn = document.getElementById('cancelPollBtn');
    const createBtn = document.getElementById('createPollBtnModal');
    const questionInput = document.getElementById('pollQuestion');
    const questionCounter = document.getElementById('questionCounter');
    const quizMode = document.getElementById('quizMode');
    const quizSettings = document.getElementById('quizSettings');
    const correctAnswerSelect = document.getElementById('correctAnswer');
    const multipleChoice = document.getElementById('multipleChoice');
    
    // Счетчик символов вопроса
    questionInput.addEventListener('input', function() {
        const length = this.value.length;
        questionCounter.textContent = `${length}/${pollSettings.maxQuestionLength}`;
        
        if (length > pollSettings.maxQuestionLength * 0.9) {
            questionCounter.style.color = '#e74c3c';
        } else if (length > pollSettings.maxQuestionLength * 0.7) {
            questionCounter.style.color = '#f39c12';
        } else {
            questionCounter.style.color = '';
        }
    });
    
    // Режим викторины
    quizMode.addEventListener('change', function() {
        quizSettings.style.display = this.checked ? 'block' : 'none';
        if (this.checked) {
            updateCorrectAnswerOptions();
            // В викторине нельзя выбирать несколько ответов
            multipleChoice.checked = false;
            multipleChoice.disabled = true;
        } else {
            multipleChoice.disabled = false;
        }
    });
    
    // Взаимоисключающие настройки
    multipleChoice.addEventListener('change', function() {
        if (this.checked && quizMode.checked) {
            quizMode.checked = false;
            quizSettings.style.display = 'none';
            multipleChoice.disabled = false;
        }
    });
    
    // Добавление варианта ответа
    addOptionBtn.addEventListener('click', function() {
        const optionCount = optionsContainer.querySelectorAll('.poll-option-row').length;
        if (optionCount >= pollSettings.maxOptions) {
            showNotification(`Максимум ${pollSettings.maxOptions} вариантов`);
            return;
        }
        
        const newOption = document.createElement('div');
        newOption.className = 'poll-option-row';
        newOption.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center; animation: fadeIn 0.3s ease;';
        newOption.innerHTML = `
            <input type="text" class="option-input" placeholder="Вариант ${optionCount + 1}" maxlength="${pollSettings.maxOptionLength}"
                   style="flex: 1; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--input-color); font-size: 14px; outline: none;">
            <button class="remove-option" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer;">×</button>
        `;
        
        optionsContainer.appendChild(newOption);
        
        // Обработчик удаления
        const removeBtn = newOption.querySelector('.remove-option');
        removeBtn.addEventListener('click', function() {
            const rows = optionsContainer.querySelectorAll('.poll-option-row');
            if (rows.length > pollSettings.minOptions) {
                newOption.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    newOption.remove();
                    updateRemoveButtons();
                    updateAddButton();
                    if (quizMode.checked) updateCorrectAnswerOptions();
                }, 300);
            }
        });
        
        // Обновление викторины
        const optionInput = newOption.querySelector('.option-input');
        optionInput.addEventListener('input', function() {
            if (quizMode.checked) updateCorrectAnswerOptions();
        });
        
        // Фокус на новом поле
        setTimeout(() => optionInput.focus(), 100);
        updateRemoveButtons();
        updateAddButton();
        if (quizMode.checked) updateCorrectAnswerOptions();
    });
    
    // Обновление вариантов правильного ответа
    function updateCorrectAnswerOptions() {
        const options = Array.from(optionsContainer.querySelectorAll('.option-input'))
            .map(input => input.value.trim())
            .filter(text => text);
        
        correctAnswerSelect.innerHTML = '<option value="">Выберите правильный вариант</option>';
        options.forEach((option, index) => {
            const optionElement = document.createElement('option');
            optionElement.value = `option_${index}`;
            optionElement.textContent = option || `Вариант ${index + 1}`;
            correctAnswerSelect.appendChild(optionElement);
        });
    }
    
    // Обновление кнопки добавления
    function updateAddButton() {
        const optionCount = optionsContainer.querySelectorAll('.poll-option-row').length;
        const remaining = pollSettings.maxOptions - optionCount;
        addOptionBtn.textContent = `+ Добавить вариант (осталось: ${remaining})`;
        addOptionBtn.disabled = remaining <= 0;
    }
    
    // Обработчики удаления вариантов
    function updateRemoveButtons() {
        const removeBtns = optionsContainer.querySelectorAll('.remove-option');
        const rows = optionsContainer.querySelectorAll('.poll-option-row');
        
        removeBtns.forEach(btn => {
            if (rows.length <= pollSettings.minOptions) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        });
    }
    
    // Отмена создания
    cancelBtn.addEventListener('click', closeActiveModal);
    
    // Создание опроса
    createBtn.addEventListener('click', function() {
        createAdvancedPoll(channelId);
    });
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeActiveModal();
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeActiveModal();
    });
    
    // Фокус на поле вопроса
    setTimeout(() => questionInput.focus(), 100);
    updateRemoveButtons();
    updateAddButton();
}

// Создание улучшенного опроса
function createAdvancedPoll(channelId) {
    const question = document.getElementById('pollQuestion').value.trim();
    const optionInputs = document.querySelectorAll('.option-input');
    const multipleChoice = document.getElementById('multipleChoice').checked;
    const anonymous = document.getElementById('anonymousPoll').checked;
    const quizMode = document.getElementById('quizMode').checked;
    const correctAnswer = document.getElementById('correctAnswer').value;
    const quizExplanation = document.getElementById('quizExplanation').value.trim();
    
    // Валидация
    if (!question) {
        showNotification("Введите вопрос опроса");
        document.getElementById('pollQuestion').focus();
        return;
    }
    
    if (question.length > pollSettings.maxQuestionLength) {
        showNotification(`Вопрос слишком длинный. Максимум ${pollSettings.maxQuestionLength} символов`);
        return;
    }
    
    const options = [];
    optionInputs.forEach(input => {
        const text = input.value.trim();
        if (text) {
            if (text.length > pollSettings.maxOptionLength) {
                showNotification(`Вариант "${text.substring(0, 20)}..." слишком длинный. Максимум ${pollSettings.maxOptionLength} символов`);
                return;
            }
            options.push(text);
        }
    });
    
    if (options.length < pollSettings.minOptions) {
        showNotification(`Добавьте минимум ${pollSettings.minOptions} варианта ответа`);
        return;
    }
    
    if (quizMode && !correctAnswer) {
        showNotification("Выберите правильный ответ для викторины");
        return;
    }
    
    // Создаем опрос
    const pollId = database.ref('channelPolls').push().key;
    const timestamp = Date.now();
    
    const pollData = {
        id: pollId,
        question: question,
        options: {},
        authorId: userId,
        authorName: currentUser,
        channelId: channelId,
        timestamp: timestamp,
        multipleAnswers: multipleChoice,
        anonymous: anonymous,
        quizMode: quizMode,
        totalVotes: 0,
        voters: {},
        type: 'poll',
        settings: {
            allowChangeVote: true,
            showResults: !quizMode // В викторине результаты показываем после ответа
        }
    };
    
    // Добавляем варианты ответов
    options.forEach((option, index) => {
        const optionKey = `option_${index}`;
        pollData.options[optionKey] = {
            text: option,
            votes: 0,
            voters: {}
        };
    });
    
    // Настройки викторины
    if (quizMode) {
        pollData.quiz = {
            correctAnswer: correctAnswer,
            explanation: quizExplanation,
            showResults: false
        };
        pollData.multipleAnswers = false; // В викторине всегда один ответ
    }
    
    // Блокируем кнопку
    const createBtn = document.getElementById('createPollBtnModal');
    createBtn.disabled = true;
    createBtn.textContent = 'Создание...';
    createBtn.style.opacity = '0.7';
    
    // Сохраняем в базу
    database.ref('channelPolls/' + pollId).set(pollData)
        .then(() => {
            showNotification("✅ Опрос создан!");
            closeActiveModal();
            
            // Обновляем канал
            database.ref('channels/' + channelId).update({
                lastMessage: "📊 " + (quizMode ? "Викторина: " : "Опрос: ") + 
                           (question.length > 25 ? question.substring(0, 22) + '...' : question),
                lastMessageTime: timestamp
            });
        })
        .catch(error => {
            console.error("Ошибка создания опроса:", error);
            showNotification("❌ Ошибка создания опроса");
            createBtn.disabled = false;
            createBtn.textContent = 'Создать опрос';
            createBtn.style.opacity = '1';
        });
}

// Загрузка опросов канала
function loadChannelPolls(channelId) {
    const container = document.getElementById('channelMessagesContainer');
    if (!container) return;
    
    // Удаляем старый слушатель
    if (pollListeners[channelId]) {
        database.ref('channelPolls').off('value', pollListeners[channelId]);
    }
    
    // Слушаем опросы
    pollListeners[channelId] = database.ref('channelPolls').orderByChild('channelId').equalTo(channelId).on('value', (snapshot) => {
        if (!snapshot.exists()) return;
        
        const polls = snapshot.val();
        const pollsArray = Object.values(polls).sort((a, b) => a.timestamp - b.timestamp);
        
        // Удаляем старые опросы
        const oldPolls = container.querySelectorAll('.poll-message');
        oldPolls.forEach(poll => poll.remove());
        
        // Добавляем новые
        pollsArray.forEach(poll => {
            displayAdvancedPoll(poll, container);
        });
        
        // Прокручиваем вниз
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    });
}

// Отображение улучшенного опроса
function displayAdvancedPoll(poll, container) {
    const pollElement = document.createElement('div');
    pollElement.className = 'poll-message';
    pollElement.dataset.pollId = poll.id;
    pollElement.style.cssText = `
        background: var(--hover-color);
        border-radius: 12px;
        padding: 15px;
        margin: 10px 0;
        border-left: 4px solid ${poll.quizMode ? '#e74c3c' : '#9b59b6'};
        animation: fadeIn 0.3s ease;
        position: relative;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    `;
    
    const hasVoted = poll.voters && poll.voters[userId];
    const userVotes = hasVoted ? Object.keys(poll.voters[userId]) : [];
    const totalVotes = poll.totalVotes || 0;
    const isClosed = poll.closed;
    const canVote = !hasVoted && !isClosed;
    const canChangeVote = hasVoted && !isClosed && (poll.settings?.allowChangeVote !== false);
    
    // Бейджи
    const badges = [];
    if (poll.quizMode) badges.push('<span style="color: #e74c3c; font-size: 12px;">🎯 Викторина</span>');
    if (poll.multipleAnswers) badges.push('<span style="color: #3498db; font-size: 12px;">✓ Множественный выбор</span>');
    if (poll.anonymous) badges.push('<span style="color: #7f8c8d; font-size: 12px;">👤 Анонимный</span>');
    if (isClosed) badges.push('<span style="color: #e74c3c; font-size: 12px;">🔒 Закрыт</span>');
    
    // Создаем варианты ответов
    const optionsHTML = Object.keys(poll.options).map(optionKey => {
        const option = poll.options[optionKey];
        const votes = option.votes || 0;
        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        const isSelected = userVotes.includes(optionKey);
        const isCorrect = poll.quizMode && poll.quiz.correctAnswer === optionKey;
        const showResults = poll.quizMode ? poll.quiz.showResults : true;
        
        let optionStyle = `margin: 8px 0; padding: 12px; background: var(--primary-bg); border-radius: 8px; `;
        optionStyle += `cursor: ${(canVote || (canChangeVote && poll.multipleAnswers)) ? 'pointer' : 'default'}; `;
        optionStyle += `border: 2px solid `;
        
        if (isSelected) {
            optionStyle += isCorrect && showResults ? '#2ecc71' : '#9b59b6';
        } else if (isCorrect && showResults) {
            optionStyle += '#2ecc71';
        } else {
            optionStyle += 'var(--border-color)';
        }
        optionStyle += '; transition: all 0.3s ease;';
        
        return `
            <div class="poll-option ${isSelected ? 'selected' : ''}" 
                 data-poll-id="${poll.id}" 
                 data-option-key="${optionKey}"
                 style="${optionStyle}">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 14px; font-weight: ${isSelected ? '600' : '400'}; display: flex; align-items: center; gap: 8px;">
                        ${option.text}
                        ${isCorrect && showResults ? '✅' : ''}
                        ${isSelected && !isCorrect && poll.quizMode && showResults ? '❌' : ''}
                    </span>
                    <span style="font-size: 12px; color: ${isSelected ? (isCorrect && showResults ? '#2ecc71' : '#9b59b6') : 'var(--text-color)'}; opacity: 0.8;">
                        ${votes} (${percentage}%)
                    </span>
                </div>
                <div style="height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; background: ${isCorrect && showResults ? '#2ecc71' : '#9b59b6'}; width: ${percentage}%; transition: width 0.5s ease;"></div>
                </div>
            </div>
        `;
    }).join('');
    
    const timeString = new Date(poll.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    pollElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
            <i class="fas fa-poll" style="color: ${poll.quizMode ? '#e74c3c' : '#9b59b6'};"></i>
            <strong>${poll.authorName}</strong>
            <span style="font-size: 11px; opacity: 0.7;">создал(а) ${poll.quizMode ? 'викторину' : 'опрос'}</span>
        </div>
        
        <div style="font-weight: 600; margin-bottom: 15px; font-size: 16px; user-select: none;">${poll.question}</div>
        
        <div class="poll-options">
            ${optionsHTML}
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: 12px; opacity: 0.7;">
            <div>
                ${badges.join(' ')}
                <span style="margin-left: 10px;">Голосов: ${totalVotes}</span>
            </div>
            <span>${timeString}</span>
        </div>
        
        ${hasVoted ? `
            <div style="color: #9b59b6; font-size: 12px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span><i class="fas fa-check"></i> Вы проголосовали</span>
                ${canChangeVote ? `
                    <div style="display: flex; gap: 5px;">
                        ${poll.multipleAnswers ? '' : `<button class="change-vote-btn" data-poll-id="${poll.id}" style="background: none; border: 1px solid var(--border-color); color: var(--text-color); padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">Изменить голос</button>`}
                        <button class="reset-vote-btn" data-poll-id="${poll.id}" style="background: none; border: 1px solid var(--border-color); color: var(--text-color); padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">Отменить голос</button>
                    </div>
                ` : ''}
            </div>
        ` : ''}
        
        ${poll.quizMode && poll.quiz?.showResults && poll.quiz.explanation ? `
            <div style="margin-top: 10px; padding: 10px; background: rgba(46, 204, 113, 0.1); border-radius: 6px; border-left: 3px solid #2ecc71;">
                <div style="font-weight: 500; color: #2ecc71; margin-bottom: 5px;">Объяснение:</div>
                <div style="font-size: 13px;">${poll.quiz.explanation}</div>
            </div>
        ` : ''}
    `;
    
    container.appendChild(pollElement);
    
    // Добавляем обработчики
    addPollEventHandlers(pollElement, poll, canVote, canChangeVote);
}

// Добавление обработчиков событий для опроса
function addPollEventHandlers(pollElement, poll, canVote, canChangeVote) {
    const optionElements = pollElement.querySelectorAll('.poll-option');
    
    // Обработчики для вариантов ответа
    optionElements.forEach(optionEl => {
        const canInteract = canVote || (canChangeVote && poll.multipleAnswers);
        
        if (canInteract) {
            optionEl.addEventListener('click', function() {
                const pollId = this.getAttribute('data-poll-id');
                const optionKey = this.getAttribute('data-option-key');
                handleAdvancedVote(pollId, optionKey, poll);
            });
            
            optionEl.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            });
            
            optionEl.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        }
    });
    
    // Кнопка изменения голоса (для одиночного выбора)
    const changeVoteBtn = pollElement.querySelector('.change-vote-btn');
    if (changeVoteBtn) {
        changeVoteBtn.addEventListener('click', function() {
            const pollId = this.dataset.pollId;
            enableVoteChange(pollId);
        });
    }
    
    // Кнопка отмены голоса
    const resetVoteBtn = pollElement.querySelector('.reset-vote-btn');
    if (resetVoteBtn) {
        resetVoteBtn.addEventListener('click', function() {
            const pollId = this.dataset.pollId;
            resetUserVote(pollId);
        });
    }
}

// Включение режима изменения голоса
function enableVoteChange(pollId) {
    // Просто сбрасываем голос, чтобы пользователь мог проголосовать заново
    resetUserVote(pollId);
}

// Расширенная обработка голосования
function handleAdvancedVote(pollId, optionKey, poll) {
    if (poll.closed) {
        showNotification("❌ Опрос закрыт для голосования");
        return;
    }
    
    const hasVoted = poll.voters && poll.voters[userId];
    
    if (hasVoted) {
        if (poll.multipleAnswers) {
            // Множественный выбор - переключаем голос
            if (poll.voters[userId][optionKey]) {
                removeVote(pollId, optionKey);
            } else {
                addVote(pollId, optionKey);
            }
        } else {
            // Одиночный выбор - нужно сначала сбросить старый голос
            showNotification("Сначала отмените текущий голос");
            return;
        }
    } else {
        // Первое голосование
        addVote(pollId, optionKey);
        
        // Для викторины показываем результат
        if (poll.quizMode && !poll.multipleAnswers) {
            setTimeout(() => {
                showQuizResult(pollId, optionKey);
            }, 1000);
        }
    }
}

// Сброс голоса пользователя
function resetUserVote(pollId) {
    if (!confirm("Отменить ваш голос? Вы сможете проголосовать заново.")) {
        return;
    }
    
    database.ref('channelPolls/' + pollId).once('value')
        .then(snapshot => {
            const poll = snapshot.val();
            if (!poll || !poll.voters || !poll.voters[userId]) {
                showNotification("Вы еще не голосовали в этом опросе");
                return;
            }
            
            // Удаляем все голоса пользователя
            const updates = {};
            const userVotes = Object.keys(poll.voters[userId]);
            
            userVotes.forEach(optionKey => {
                updates[`channelPolls/${pollId}/options/${optionKey}/votes`] = firebase.database.ServerValue.increment(-1);
                updates[`channelPolls/${pollId}/options/${optionKey}/voters/${userId}`] = null;
            });
            
            updates[`channelPolls/${pollId}/voters/${userId}`] = null;
            updates[`channelPolls/${pollId}/totalVotes`] = firebase.database.ServerValue.increment(-userVotes.length);
            
            return database.ref().update(updates);
        })
        .then(() => {
            showNotification("✅ Ваш голос отменен. Можете проголосовать заново.");
        })
        .catch(error => {
            console.error("Ошибка сброса голоса:", error);
            showNotification("❌ Ошибка сброса голоса");
        });
}

// Показ результата викторины
function showQuizResult(pollId, selectedOption) {
    database.ref('channelPolls/' + pollId).once('value')
        .then(snapshot => {
            const poll = snapshot.val();
            if (!poll || !poll.quizMode) return;
            
            const isCorrect = poll.quiz.correctAnswer === selectedOption;
            const message = isCorrect ? 
                "🎉 Правильно! Отличный ответ!" : 
                "❌ Неправильно. Попробуйте в следующий раз!";
            
            showNotification(message);
            
            // Показываем правильный ответ через 2 секунды
            setTimeout(() => {
                database.ref('channelPolls/' + pollId + '/quiz/showResults').set(true);
            }, 2000);
        });
}

// Добавление голоса
function addVote(pollId, optionKey) {
    const updates = {};
    updates[`channelPolls/${pollId}/options/${optionKey}/votes`] = firebase.database.ServerValue.increment(1);
    updates[`channelPolls/${pollId}/options/${optionKey}/voters/${userId}`] = true;
    updates[`channelPolls/${pollId}/voters/${userId}/${optionKey}`] = true;
    updates[`channelPolls/${pollId}/totalVotes`] = firebase.database.ServerValue.increment(1);
    
    database.ref().update(updates)
        .then(() => {
            showNotification("✅ Голос учтен!");
        })
        .catch(error => {
            console.error("Ошибка добавления голоса:", error);
            showNotification("❌ Ошибка голосования");
        });
}

// Удаление голоса
function removeVote(pollId, optionKey) {
    const updates = {};
    updates[`channelPolls/${pollId}/options/${optionKey}/votes`] = firebase.database.ServerValue.increment(-1);
    updates[`channelPolls/${pollId}/options/${optionKey}/voters/${userId}`] = null;
    updates[`channelPolls/${pollId}/voters/${userId}/${optionKey}`] = null;
    updates[`channelPolls/${pollId}/totalVotes`] = firebase.database.ServerValue.increment(-1);
    
    database.ref().update(updates)
        .then(() => {
            showNotification("✅ Голос отменен");
        })
        .catch(error => {
            console.error("Ошибка удаления голоса:", error);
            showNotification("❌ Ошибка отмены голоса");
        });
}

// Вспомогательные функции
function showNotification(message) {
    if (window.showNotification) {
        window.showNotification(message);
    } else {
        // Простая реализация
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
    console.log("📊 Улучшенная система опросов загружается...");
    
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
        .poll-option:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        .poll-option.selected {
            background: rgba(155, 89, 182, 0.1) !important;
        }
        .context-menu-item:hover {
            background: var(--hover-color) !important;
        }
        .change-vote-btn:hover, .reset-vote-btn:hover {
            background: var(--hover-color) !important;
        }
        
        /* Блокировка выделения для опросов */
        .poll-message, .poll-message * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        /* Улучшенный внешний вид для модальных окон */
        .modal-content {
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        
        /* Адаптивность для мобильных */
        @media (max-width: 768px) {
            .poll-message {
                margin: 8px 0;
                padding: 12px;
            }
            
            .poll-option {
                padding: 10px !important;
            }
            
            .change-vote-btn, .reset-vote-btn {
                padding: 6px 10px !important;
                font-size: 10px !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Ждем готовности системы
    const initInterval = setInterval(() => {
        if (typeof database !== 'undefined' && window.ChannelsSystem) {
            clearInterval(initInterval);
            setTimeout(initPollsSystem, 1000);
        }
    }, 500);
});

// Глобальный экспорт
window.PollsSystem = {
    init: initPollsSystem,
    createPoll: showAdvancedPollModal,
    resetVote: resetUserVote,
    version: '4.0'
};

console.log("✅ Quantum Messenger Advanced Polls System v4.0 loaded!");