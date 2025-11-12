// group-safety-tools.js - Инструменты безопасности для незнакомых групп
// Версия 2.0 - Исправлена работа с ссылками-приглашениями

let safetySettings = {
    autoMuteNewGroups: true,
    showSafetyWarnings: true,
    requireApprovalLargeGroups: true,
    largeGroupThreshold: 50,
    blockInvitesFromStrangers: false,
    safetyChecklist: {
        checkGroupSize: true,
        checkGroupActivity: true,
        checkAdminReputation: true,
        warnSuspiciousContent: true
    }
};

// Инициализация системы безопасности
function initGroupSafetyTools() {
    console.log("🛡️ Инициализация инструментов безопасности для групп...");
    
    // Загружаем настройки
    loadSafetySettings();
    
    // Добавляем стили
    addSafetyToolsStyles();
    
    // Перехватываем ВСЕ процессы вступления в группы
    overrideAllGroupJoinProcesses();
    
    console.log("✅ Инструменты безопасности инициализированы");
}

// Загрузка настроек безопасности
function loadSafetySettings() {
    const saved = localStorage.getItem('quantumSafetySettings');
    if (saved) {
        safetySettings = JSON.parse(saved);
        console.log("📁 Настройки безопасности загружены");
    } else {
        saveSafetySettings();
    }
}

// Сохранение настроек
function saveSafetySettings() {
    localStorage.setItem('quantumSafetySettings', JSON.stringify(safetySettings));
}

// Перехват ВСЕХ процессов вступления в группы
function overrideAllGroupJoinProcesses() {
    console.log("🎯 Перехватываем все процессы вступления в группы...");
    
    // 1. Перехватываем основную функцию вступления
    overrideMainJoinFunction();
    
    // 2. Перехватываем функцию вступления по ссылкам
    overrideLinkJoinFunction();
    
    // 3. Перехватываем функцию handleGroupInviteLink
    overrideInviteLinkHandler();
    
    // 4. Перехватываем стандартное модальное окно вступления
    overrideJoinModal();
}

// Перехват основной функции вступления
function overrideMainJoinFunction() {
    const originalJoinGroup = window.joinGroup;
    
    if (originalJoinGroup) {
        window.joinGroup = function(groupId, groupName) {
            console.log("🎯 Перехвачено вступление в группу через joinGroup:", groupName);
            handleSafeGroupJoin(groupId, groupName);
        };
        console.log("✅ Основная функция joinGroup перехвачена");
    } else {
        console.log("⚠️ Функция joinGroup не найдена, создаем свою");
        window.joinGroup = function(groupId, groupName) {
            handleSafeGroupJoin(groupId, groupName);
        };
    }
}

// Перехват функции вступления по ссылкам
function overrideLinkJoinFunction() {
    const originalJoinFromLink = window.showJoinGroupDialogFromLink;
    
    if (originalJoinFromLink) {
        window.showJoinGroupDialogFromLink = function(groupId) {
            console.log("🎯 Перехвачено вступление по ссылке:", groupId);
            handleLinkGroupJoin(groupId);
        };
        console.log("✅ Функция showJoinGroupDialogFromLink перехвачена");
    } else {
        console.log("⚠️ Функция showJoinGroupDialogFromLink не найдена");
    }
}

// Перехват обработчика ссылок-приглашений
function overrideInviteLinkHandler() {
    const originalHandleInvite = window.handleGroupInviteLink;
    
    if (originalHandleInvite) {
        window.handleGroupInviteLink = function(inviteLink) {
            console.log("🎯 Перехвачена обработка ссылки-приглашения:", inviteLink);
            
            // Извлекаем ID группы из ссылки
            const url = new URL(inviteLink);
            const groupId = url.searchParams.get('join_group');
            
            if (groupId) {
                handleLinkGroupJoin(groupId);
            } else {
                // Если не удалось извлечь ID, используем оригинальную функцию
                originalHandleInvite.call(this, inviteLink);
            }
        };
        console.log("✅ Функция handleGroupInviteLink перехвачена");
    }
}

// Перехват стандартного модального окна вступления
function overrideJoinModal() {
    const originalShowJoinDialog = window.showJoinGroupDialog;
    
    if (originalShowJoinDialog) {
        window.showJoinGroupDialog = function(group, groupId) {
            console.log("🎯 Перехвачено стандартное модальное окно вступления");
            showEnhancedJoinModal(groupId, group.name, 50); // Средняя безопасность по умолчанию
        };
        console.log("✅ Функция showJoinGroupDialog перехвачена");
    }
}

// Обработчик безопасного вступления в группу
async function handleSafeGroupJoin(groupId, groupName) {
    console.log("🛡️ Обработка безопасного вступления:", groupName);
    
    try {
        const safetyScore = await checkGroupSafety(groupId);
        console.log("📊 Балл безопасности группы", groupName, ":", safetyScore);
        
        if (safetyScore < 30) {
            showSafetyWarningModal(groupId, groupName, safetyScore);
        } else if (safetyScore < 70) {
            showEnhancedJoinModal(groupId, groupName, safetyScore);
        } else {
            // Безопасная группа - вступаем сразу
            performSafeGroupJoin(groupId, groupName, false);
        }
    } catch (error) {
        console.error("❌ Ошибка проверки безопасности:", error);
        // При ошибке показываем улучшенное модальное окно
        showEnhancedJoinModal(groupId, groupName, 50);
    }
}

// Обработчик вступления по ссылке
async function handleLinkGroupJoin(groupId) {
    console.log("🔗 Обработка вступления по ссылке:", groupId);
    
    try {
        // Получаем информацию о группе
        const groupSnapshot = await database.ref('groups/' + groupId).once('value');
        if (!groupSnapshot.exists()) {
            showNotification("❌ Группа не найдена или была удалена");
            return;
        }
        
        const group = groupSnapshot.val();
        const groupName = group.name || 'Неизвестная группа';
        
        // Проверяем, не состоит ли пользователь уже в группе
        if (group.members && group.members[userId]) {
            showNotification(`✅ Вы уже состоите в группе "${groupName}"`);
            if (typeof openGroupChat === 'function') {
                openGroupChat(groupId, groupName);
            }
            return;
        }
        
        // Проверяем безопасность группы
        const safetyScore = await checkGroupSafety(groupId);
        console.log("📊 Безопасность группы по ссылке:", safetyScore);
        
        if (safetyScore < 30) {
            showSafetyWarningModal(groupId, groupName, safetyScore);
        } else if (safetyScore < 70) {
            showEnhancedJoinModal(groupId, groupName, safetyScore);
        } else {
            showEnhancedJoinModal(groupId, groupName, safetyScore);
        }
        
    } catch (error) {
        console.error("❌ Ошибка обработки ссылки:", error);
        showNotification("❌ Ошибка загрузки информации о группе");
    }
}

// Проверка безопасности группы
async function checkGroupSafety(groupId) {
    console.log("🔍 Проверяем безопасность группы:", groupId);
    
    try {
        const groupSnapshot = await database.ref('groups/' + groupId).once('value');
        if (!groupSnapshot.exists()) return 50;
        
        const group = groupSnapshot.val();
        let safetyScore = 100;

        // Проверка 1: Размер группы
        const membersCount = Object.keys(group.members || {}).length;
        if (membersCount > safetySettings.largeGroupThreshold) {
            safetyScore -= 20;
        }
        if (membersCount > 200) {
            safetyScore -= 10; // Очень большие группы
        }

        // Проверка 2: Возраст группы
        const groupAge = Date.now() - (group.createdAt || Date.now());
        const daysOld = groupAge / (1000 * 60 * 60 * 24);
        if (daysOld < 1) {
            safetyScore -= 25; // Очень новая группа
        } else if (daysOld < 7) {
            safetyScore -= 15;
        } else if (daysOld > 365) {
            safetyScore += 10; // Старые группы надежнее
        }

        // Проверка 3: Активность группы
        const lastActivity = group.lastActivity || group.createdAt;
        const daysInactive = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
        if (daysInactive > 30) {
            safetyScore -= 15;
        } else if (daysInactive < 1) {
            safetyScore += 5; // Активные группы
        }

        // Проверка 4: Настройки группы
        if (group.settings) {
            if (!group.settings.public) safetyScore += 10;
            if (group.settings.approvalRequired) safetyScore += 15;
            if (group.settings.adminsOnly) safetyScore -= 5;
        }

        // Проверка 5: Репутация создателя
        const creatorId = group.creator;
        if (creatorId && creatorId !== userId) {
            const creatorSafety = await checkUserReputation(creatorId);
            safetyScore += creatorSafety;
        }

        // Проверка 6: Описание группы
        if (!group.description || group.description.length < 10) {
            safetyScore -= 5; // Группы без описания
        }

        console.log("📊 Итоговый балл безопасности:", safetyScore);
        return Math.max(0, Math.min(100, safetyScore));
        
    } catch (error) {
        console.error("❌ Ошибка проверки безопасности:", error);
        return 50;
    }
}

// Проверка репутации пользователя
async function checkUserReputation(userId) {
    try {
        const userSnapshot = await database.ref('profiles/' + userId).once('value');
        if (!userSnapshot.exists()) return 0;
        
        const user = userSnapshot.val();
        let reputationScore = 0;
        
        // Проверка возраста аккаунта
        const accountAge = Date.now() - (user.createdAt || Date.now());
        const monthsOld = accountAge / (1000 * 60 * 60 * 24 * 30);
        if (monthsOld > 6) reputationScore += 10;
        if (monthsOld > 12) reputationScore += 10;
        
        return reputationScore;
    } catch (error) {
        return 0;
    }
}

// Показ предупреждения о безопасности
function showSafetyWarningModal(groupId, groupName, safetyScore) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'safetyWarningModal';
    
    modal.innerHTML = `
        <div class="modal-content safety-warning-modal">
            <div class="safety-header danger">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Внимание: Низкий уровень безопасности</h3>
            </div>
            
            <div class="safety-warning-content">
                <div class="warning-message">
                    Группа "<strong>${groupName}</strong>" имеет низкий балл безопасности (${safetyScore}/100).
                    Рекомендуется проявить осторожность.
                </div>
                
                <div class="safety-indicators">
                    <div class="safety-score">
                        <div class="score-label">Уровень безопасности</div>
                        <div class="score-bar">
                            <div class="score-fill danger" style="width: ${safetyScore}%"></div>
                        </div>
                        <div class="score-value">${safetyScore}/100</div>
                    </div>
                </div>
                
                <div class="safety-recommendations">
                    <h4>Рекомендации по безопасности:</h4>
                    <ul>
                        <li><i class="fas fa-bell-slash"></i> Отключите уведомления</li>
                        <li><i class="fas fa-eye-slash"></i> Ограничьте видимость профиля</li>
                        <li><i class="fas fa-user-shield"></i> Будьте осторожны с личными данными</li>
                        <li><i class="fas fa-flag"></i> Сообщайте о подозрительном контенте</li>
                    </ul>
                </div>
            </div>
            
            <div class="safety-actions">
                <button class="safety-btn danger" id="joinAnywayBtn">
                    <i class="fas fa-exclamation-circle"></i> Вступить с осторожностью
                </button>
                <button class="safety-btn secondary" id="reportGroupBtn">
                    <i class="fas fa-flag"></i> Пожаловаться на группу
                </button>
                <button class="safety-btn primary" id="cancelJoinBtn">
                    <i class="fas fa-times"></i> Отмена
                </button>
            </div>
            
            <div class="safety-footer">
                <label class="safety-checkbox">
                    <input type="checkbox" id="disableSafetyWarnings">
                    <span class="checkmark"></span>
                    Больше не показывать предупреждения безопасности
                </label>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики событий
    document.getElementById('joinAnywayBtn').addEventListener('click', () => {
        if (document.getElementById('disableSafetyWarnings').checked) {
            safetySettings.showSafetyWarnings = false;
            saveSafetySettings();
        }
        performSafeGroupJoin(groupId, groupName, true);
        document.body.removeChild(modal);
    });
    
    document.getElementById('reportGroupBtn').addEventListener('click', () => {
        showGroupReportModal(groupId, groupName);
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancelJoinBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Улучшенное модальное окно вступления в группу
function showEnhancedJoinModal(groupId, groupName, safetyScore) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'enhancedJoinModal';
    
    modal.innerHTML = `
        <div class="modal-content enhanced-join-modal">
            <div class="join-header">
                <div class="safety-badge ${getSafetyBadgeClass(safetyScore)}">
                    <i class="fas fa-shield-alt"></i>
                    Безопасность: ${getSafetyLevel(safetyScore)}
                </div>
                <h3>Вступление в группу</h3>
                <div class="group-name">${groupName}</div>
            </div>
            
            <div class="enhanced-group-info">
                <div class="group-safety-overview">
                    <div class="safety-score-display">
                        <div class="score-circle ${getSafetyBadgeClass(safetyScore)}">
                            <span class="score-number">${safetyScore}</span>
                            <span class="score-label">/100</span>
                        </div>
                        <div class="safety-details">
                            <div class="safety-level">${getSafetyLevel(safetyScore)}</div>
                            <div class="safety-description">${getSafetyDescription(safetyScore)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="safety-features">
                    <h4>Автоматические настройки безопасности:</h4>
                    <div class="safety-feature">
                        <i class="fas fa-bell-slash"></i>
                        <span>Уведомления отключены</span>
                        <div class="feature-status ${safetySettings.autoMuteNewGroups ? 'muted' : 'active'}">
                            ${safetySettings.autoMuteNewGroups ? 'Выключено' : 'Включено'}
                        </div>
                    </div>
                    <div class="safety-feature">
                        <i class="fas fa-user-shield"></i>
                        <span>Ограниченная видимость профиля</span>
                        <div class="feature-status active">Активно</div>
                    </div>
                    <div class="safety-feature">
                        <i class="fas fa-clock"></i>
                        <span>Период наблюдения (7 дней)</span>
                        <div class="feature-status active">Активно</div>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <button class="quick-action-btn" id="quickMuteBtn" data-action="mute">
                    <i class="fas fa-volume-mute"></i>
                    <span>Отключить уведомления</span>
                </button>
                <button class="quick-action-btn" id="quickLeaveBtn" data-action="leave">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Быстрый выход</span>
                </button>
                <button class="quick-action-btn" id="quickReportBtn" data-action="report">
                    <i class="fas fa-flag"></i>
                    <span>Пожаловаться</span>
                </button>
            </div>
            
            <div class="join-actions">
                <button class="join-btn primary" id="safeJoinBtn">
                    <i class="fas fa-shield-alt"></i>
                    Вступить с защитой
                </button>
                <button class="join-btn secondary" id="cancelEnhancedJoin">
                    Отмена
                </button>
            </div>
            
            <div class="safety-tips">
                <div class="tip-header">
                    <i class="fas fa-lightbulb"></i>
                    <strong>Советы по безопасности</strong>
                </div>
                <div class="tip-content">
                    • Проверяйте участников перед общением<br>
                    • Не делитесь личной информацией<br>
                    • Сообщайте о подозрительных сообщениях<br>
                    • Используйте настройки конфиденциальности
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики событий
    document.getElementById('safeJoinBtn').addEventListener('click', () => {
        performSafeGroupJoin(groupId, groupName, safetyScore < 70);
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancelEnhancedJoin').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Быстрые действия
    document.getElementById('quickMuteBtn').addEventListener('click', () => {
        safetySettings.autoMuteNewGroups = !safetySettings.autoMuteNewGroups;
        const status = document.querySelector('.safety-feature .feature-status');
        status.textContent = safetySettings.autoMuteNewGroups ? 'Выключено' : 'Включено';
        status.className = `feature-status ${safetySettings.autoMuteNewGroups ? 'muted' : 'active'}`;
        showNotification(safetySettings.autoMuteNewGroups ? "🔕 Уведомления отключены" : "🔔 Уведомления включены");
        saveSafetySettings();
    });
    
    document.getElementById('quickLeaveBtn').addEventListener('click', () => {
        showQuickLeaveModal(groupId, groupName);
    });
    
    document.getElementById('quickReportBtn').addEventListener('click', () => {
        showGroupReportModal(groupId, groupName);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Безопасное вступление в группу
function performSafeGroupJoin(groupId, groupName, isRisky = false) {
    console.log("🛡️ Безопасное вступление в группу:", groupName);
    
    const memberData = {
        id: userId,
        name: currentUser,
        role: 'member',
        joinedAt: Date.now(),
        isOnline: true,
        safetySettings: {
            notificationsMuted: safetySettings.autoMuteNewGroups,
            profileVisibility: 'limited',
            monitoringPeriod: true,
            joinedAt: Date.now()
        }
    };
    
    database.ref(`groups/${groupId}/members/${userId}`).set(memberData)
        .then(() => {
            showNotification(`✅ Вы вступили в группу "${groupName}" с настройками безопасности`);
            
            // Обновляем активность группы
            database.ref(`groups/${groupId}`).update({
                lastActivity: Date.now()
            });
            
            // Применяем дополнительные меры безопасности
            applySafetyMeasures(groupId);
            
            // Показываем краткое руководство по безопасности если группа рискованная
            if (isRisky) {
                setTimeout(() => showSafetyQuickGuide(groupId), 1000);
            }
            
            // Открываем группу если не рискованная
            if (!isRisky && typeof openGroupChat === 'function') {
                setTimeout(() => openGroupChat(groupId, groupName), 500);
            }
        })
        .catch((error) => {
            console.error("❌ Ошибка вступления в группу:", error);
            showNotification("❌ Ошибка вступления в группу");
        });
}

// Применение мер безопасности
function applySafetyMeasures(groupId) {
    console.log("🔧 Применяем меры безопасности для группы:", groupId);
    
    // 1. Отключаем уведомления если включено в настройках
    if (safetySettings.autoMuteNewGroups) {
        muteGroupNotifications(groupId);
    }
    
    // 2. Устанавливаем период наблюдения
    setMonitoringPeriod(groupId);
    
    // 3. Сохраняем информацию о группе для отслеживания
    saveGroupSafetyInfo(groupId);
}

// Отключение уведомлений группы
function muteGroupNotifications(groupId) {
    const mutedGroups = JSON.parse(localStorage.getItem('mutedGroups') || '[]');
    if (!mutedGroups.includes(groupId)) {
        mutedGroups.push(groupId);
        localStorage.setItem('mutedGroups', JSON.stringify(mutedGroups));
        console.log("🔕 Уведомления группы отключены");
    }
}

// Установка периода наблюдения
function setMonitoringPeriod(groupId) {
    const monitoring = JSON.parse(localStorage.getItem('groupMonitoring') || '{}');
    monitoring[groupId] = {
        startDate: Date.now(),
        endDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 дней
        safetyChecks: 0,
        lastCheck: Date.now()
    };
    localStorage.setItem('groupMonitoring', JSON.stringify(monitoring));
}

// Сохранение информации о безопасности группы
function saveGroupSafetyInfo(groupId) {
    const safetyInfo = JSON.parse(localStorage.getItem('groupSafetyInfo') || '{}');
    safetyInfo[groupId] = {
        joinedAt: Date.now(),
        safetyMeasuresApplied: true,
        reportsMade: 0,
        lastSafetyCheck: Date.now()
    };
    localStorage.setItem('groupSafetyInfo', JSON.stringify(safetyInfo));
}

// Быстрый выход из группы
function showQuickLeaveModal(groupId, groupName) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'quickLeaveModal';
    
    modal.innerHTML = `
        <div class="modal-content quick-leave-modal">
            <div class="leave-header">
                <i class="fas fa-sign-out-alt"></i>
                <h3>Быстрый выход из группы</h3>
            </div>
            
            <div class="leave-content">
                <p>Вы уверены, что хотите покинуть группу <strong>"${groupName}"</strong>?</p>
                
                <div class="leave-options">
                    <label class="leave-option">
                        <input type="radio" name="leaveReason" value="not_interested" checked>
                        <span class="radio-checkmark"></span>
                        <span class="option-text">Не интересно</span>
                    </label>
                    
                    <label class="leave-option">
                        <input type="radio" name="leaveReason" value="suspicious">
                        <span class="radio-checkmark"></span>
                        <span class="option-text">Подозрительная группа</span>
                    </label>
                    
                    <label class="leave-option">
                        <input type="radio" name="leaveReason" value="spam">
                        <span class="radio-checkmark"></span>
                        <span class="option-text">Спам/реклама</span>
                    </label>
                    
                    <label class="leave-option">
                        <input type="radio" name="leaveReason" value="other">
                        <span class="radio-checkmark"></span>
                        <span class="option-text">Другая причина</span>
                    </label>
                </div>
                
                <div class="report-option">
                    <label>
                        <input type="checkbox" id="alsoReport">
                        <span class="checkmark"></span>
                        Также пожаловаться на группу
                    </label>
                </div>
            </div>
            
            <div class="leave-actions">
                <button class="leave-btn primary" id="confirmQuickLeave">
                    <i class="fas fa-sign-out-alt"></i>
                    Покинуть группу
                </button>
                <button class="leave-btn secondary" id="cancelQuickLeave">
                    Отмена
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('confirmQuickLeave').addEventListener('click', () => {
        const reason = document.querySelector('input[name="leaveReason"]:checked').value;
        const alsoReport = document.getElementById('alsoReport').checked;
        
        leaveGroupImmediately(groupId, groupName, reason);
        
        if (alsoReport) {
            setTimeout(() => showGroupReportModal(groupId, groupName), 500);
        }
        
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancelQuickLeave').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Немедленный выход из группы
function leaveGroupImmediately(groupId, groupName, reason) {
    database.ref(`groups/${groupId}/members/${userId}`).remove()
        .then(() => {
            showNotification(`🚪 Вы покинули группу "${groupName}"`);
            logGroupLeaveReason(groupId, reason);
        })
        .catch((error) => {
            console.error("❌ Ошибка выхода из группы:", error);
            showNotification("❌ Ошибка выхода из группы");
        });
}

// Жалоба на группу
function showGroupReportModal(groupId, groupName) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'groupReportModal';
    
    modal.innerHTML = `
        <div class="modal-content group-report-modal">
            <div class="report-header">
                <i class="fas fa-flag"></i>
                <h3>Жалоба на группу</h3>
            </div>
            
            <div class="report-content">
                <p>Пожалуйста, выберите причину жалобы на группу <strong>"${groupName}"</strong>:</p>
                
                <div class="report-options">
                    <label class="report-option">
                        <input type="radio" name="reportReason" value="spam">
                        <span class="radio-checkmark"></span>
                        <div class="option-content">
                            <div class="option-title">Спам или реклама</div>
                            <div class="option-description">Группа рассылает нежелательную рекламу</div>
                        </div>
                    </label>
                    
                    <label class="report-option">
                        <input type="radio" name="reportReason" value="harassment">
                        <span class="radio-checkmark"></span>
                        <div class="option-content">
                            <div class="option-title">Оскорбления или преследование</div>
                            <div class="option-description">Участники группы ведут себя агрессивно</div>
                        </div>
                    </label>
                    
                    <label class="report-option">
                        <input type="radio" name="reportReason" value="scam">
                        <span class="radio-checkmark"></span>
                        <div class="option-content">
                            <div class="option-title">Мошенничество или обман</div>
                            <div class="option-description">Группа занимается мошенническими действиями</div>
                        </div>
                    </label>
                    
                    <label class="report-option">
                        <input type="radio" name="reportReason" value="illegal">
                        <span class="radio-checkmark"></span>
                        <div class="option-content">
                            <div class="option-title">Незаконный контент</div>
                            <div class="option-description">Распространение запрещенного контента</div>
                        </div>
                    </label>
                    
                    <label class="report-option">
                        <input type="radio" name="reportReason" value="other">
                        <span class="radio-checkmark"></span>
                        <div class="option-content">
                            <div class="option-title">Другая причина</div>
                            <div class="option-description">Укажите подробности в комментарии</div>
                        </div>
                    </label>
                </div>
                
                <div class="report-comment">
                    <label for="reportDetails">Дополнительные details (необязательно):</label>
                    <textarea id="reportDetails" placeholder="Опишите проблему подробнее..." rows="3"></textarea>
                </div>
                
                <div class="report-notice">
                    <i class="fas fa-info-circle"></i>
                    Ваша жалоба будет анонимной. Администраторы рассмотрят ее в течение 24 часов.
                </div>
            </div>
            
            <div class="report-actions">
                <button class="report-btn primary" id="submitReportBtn">
                    <i class="fas fa-paper-plane"></i>
                    Отправить жалобу
                </button>
                <button class="report-btn secondary" id="cancelReportBtn">
                    Отмена
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('submitReportBtn').addEventListener('click', () => {
        const reason = document.querySelector('input[name="reportReason"]:checked');
        if (!reason) {
            showNotification("❌ Выберите причину жалобы");
            return;
        }
        
        const details = document.getElementById('reportDetails').value;
        submitGroupReport(groupId, groupName, reason.value, details);
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancelReportBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Отправка жалобы на группу
function submitGroupReport(groupId, groupName, reason, details = '') {
    const reportId = database.ref('groupReports').push().key;
    const reportData = {
        id: reportId,
        groupId: groupId,
        groupName: groupName,
        reporterId: userId,
        reporterName: currentUser,
        reason: reason,
        details: details,
        timestamp: Date.now(),
        status: 'pending'
    };
    
    database.ref('groupReports/' + reportId).set(reportData)
        .then(() => {
            showNotification("✅ Жалоба отправлена. Спасибо за вашу бдительность!");
            updateReportStatistics(groupId);
        })
        .catch((error) => {
            console.error("❌ Ошибка отправки жалобы:", error);
            showNotification("❌ Ошибка отправки жалобы");
        });
}

// Краткое руководство по безопасности
function showSafetyQuickGuide(groupId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'safetyQuickGuide';
    
    modal.innerHTML = `
        <div class="modal-content safety-guide-modal">
            <div class="guide-header">
                <i class="fas fa-shield-alt"></i>
                <h3>Краткое руководство по безопасности</h3>
            </div>
            
            <div class="guide-content">
                <div class="guide-section">
                    <h4>🛡️ Ваши активные защиты:</h4>
                    <ul>
                        <li>• Уведомления отключены</li>
                        <li>• Ограничена видимость профиля</li>
                        <li>• Включен период наблюдения</li>
                    </ul>
                </div>
                
                <div class="guide-section">
                    <h4>⚠️ Будьте осторожны:</h4>
                    <ul>
                        <li>• Не переходите по подозрительным ссылкам</li>
                        <li>• Не сообщайте личную информацию</li>
                        <li>• Проверяйте новых участников</li>
                        <li>• Сообщайте о нарушителях</li>
                    </ul>
                </div>
                
                <div class="guide-section">
                    <h4>🚨 Быстрые действия:</h4>
                    <div class="quick-actions-grid">
                        <button class="guide-action-btn" data-action="mute">
                            <i class="fas fa-bell-slash"></i>
                            <span>Уведомления</span>
                        </button>
                        <button class="guide-action-btn" data-action="leave">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Выйти</span>
                        </button>
                        <button class="guide-action-btn" data-action="report">
                            <i class="fas fa-flag"></i>
                            <span>Пожаловаться</span>
                        </button>
                        <button class="guide-action-btn" data-action="settings">
                            <i class="fas fa-cog"></i>
                            <span>Настройки</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="guide-actions">
                <button class="guide-btn primary" id="understandBtn">
                    Понятно
                </button>
                <label class="guide-checkbox">
                    <input type="checkbox" id="dontShowAgain">
                    <span class="checkmark"></span>
                    Больше не показывать для безопасных групп
                </label>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('understandBtn').addEventListener('click', () => {
        if (document.getElementById('dontShowAgain').checked) {
            safetySettings.showSafetyWarnings = false;
            saveSafetySettings();
        }
        document.body.removeChild(modal);
    });
    
    modal.querySelectorAll('.guide-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            handleGuideAction(action, groupId);
        });
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Вспомогательные функции
function getSafetyBadgeClass(score) {
    if (score >= 80) return 'safe';
    if (score >= 60) return 'moderate';
    if (score >= 40) return 'caution';
    return 'danger';
}

function getSafetyLevel(score) {
    if (score >= 80) return 'Высокий';
    if (score >= 60) return 'Средний';
    if (score >= 40) return 'Низкий';
    return 'Опасный';
}

function getSafetyDescription(score) {
    if (score >= 80) return 'Группа выглядит безопасной';
    if (score >= 60) return 'Обычная группа, будьте внимательны';
    if (score >= 40) return 'Проявите осторожность';
    return 'Высокий риск, рекомендуется избегать';
}

// Обработчик действий в руководстве
function handleGuideAction(action, groupId) {
    switch (action) {
        case 'mute':
            safetySettings.autoMuteNewGroups = !safetySettings.autoMuteNewGroups;
            showNotification(safetySettings.autoMuteNewGroups ? "🔕 Уведомления отключены" : "🔔 Уведомления включены");
            saveSafetySettings();
            break;
        case 'leave':
            showQuickLeaveModal(groupId, "группа");
            break;
        case 'report':
            showGroupReportModal(groupId, "группа");
            break;
        case 'settings':
            if (typeof showProfilePrivacyModal === 'function') {
                showProfilePrivacyModal();
            }
            break;
    }
}

// Логирование причины выхода
function logGroupLeaveReason(groupId, reason) {
    const leaveLog = JSON.parse(localStorage.getItem('groupLeaveLog') || '[]');
    leaveLog.push({
        groupId: groupId,
        reason: reason,
        timestamp: Date.now(),
        userId: userId
    });
    localStorage.setItem('groupLeaveLog', JSON.stringify(leaveLog));
}

// Обновление статистики отчетов
function updateReportStatistics(groupId) {
    const reportStats = JSON.parse(localStorage.getItem('reportStatistics') || '{}');
    if (!reportStats[groupId]) {
        reportStats[groupId] = { count: 0, lastReport: Date.now() };
    }
    reportStats[groupId].count++;
    reportStats[groupId].lastReport = Date.now();
    localStorage.setItem('reportStatistics', JSON.stringify(reportStats));
}

// Показ уведомления
function showNotification(message) {
    try {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message);
        } else {
            // Создаем простое уведомление
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4facfe;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 10000;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    } catch (error) {
        console.log("📢", message);
    }
}

// Добавление стилей (остается без изменений из предыдущего кода)
function addSafetyToolsStyles() {
    const styles = `
        /* Все стили из предыдущего кода остаются без изменений */
        .safety-warning-modal { max-width: 500px; }
        .safety-header { display: flex; align-items: center; gap: 12px; padding: 20px; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
        .safety-header.danger { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; }
        .safety-header i { font-size: 24px; }
        .safety-warning-content { margin-bottom: 20px; }
        .warning-message { padding: 15px; background: rgba(255, 107, 107, 0.1); border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ff6b6b; }
        .safety-indicators { margin-bottom: 20px; }
        .safety-score { text-align: center; }
        .score-label { font-size: 14px; opacity: 0.8; margin-bottom: 8px; }
        .score-bar { width: 100%; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
        .score-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
        .score-fill.danger { background: #ff6b6b; }
        .score-fill.caution { background: #ffa726; }
        .score-fill.moderate { background: #29b6f6; }
        .score-fill.safe { background: #66bb6a; }
        .score-value { font-weight: bold; font-size: 16px; }
        .safety-recommendations { background: rgba(255, 152, 0, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800; }
        .safety-recommendations h4 { margin: 0 0 10px 0; color: #ff9800; }
        .safety-recommendations ul { margin: 0; padding-left: 20px; }
        .safety-recommendations li { margin-bottom: 5px; display: flex; align-items: center; gap: 8px; }
        .safety-actions { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }
        .safety-btn { padding: 12px 20px; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .safety-btn.primary { background: #4facfe; color: white; }
        .safety-btn.secondary { background: rgba(0,0,0,0.1); color: var(--text-color); }
        .safety-btn.danger { background: #ff6b6b; color: white; }
        .safety-footer { border-top: 1px solid var(--border-color); padding-top: 15px; }
        .enhanced-join-modal { max-width: 500px; }
        .join-header { text-align: center; margin-bottom: 20px; }
        .group-name { font-size: 18px; font-weight: bold; margin-top: 10px; color: var(--text-color); }
        .safety-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-bottom: 10px; }
        .safety-badge.safe { background: #e8f5e8; color: #2e7d32; }
        .safety-badge.moderate { background: #e3f2fd; color: #1565c0; }
        .safety-badge.caution { background: #fff3e0; color: #ef6c00; }
        .safety-badge.danger { background: #ffebee; color: #c62828; }
        .enhanced-group-info { margin-bottom: 20px; }
        .group-safety-overview { display: flex; justify-content: center; margin-bottom: 20px; }
        .safety-score-display { display: flex; align-items: center; gap: 15px; }
        .score-circle { width: 60px; height: 60px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; border: 3px solid; }
        .score-circle.safe { border-color: #66bb6a; color: #66bb6a; }
        .score-circle.moderate { border-color: #29b6f6; color: #29b6f6; }
        .score-circle.caution { border-color: #ffa726; color: #ffa726; }
        .score-circle.danger { border-color: #ff6b6b; color: #ff6b6b; }
        .score-number { font-size: 18px; line-height: 1; }
        .score-label { font-size: 10px; opacity: 0.8; }
        .safety-details { text-align: left; }
        .safety-level { font-weight: bold; font-size: 16px; }
        .safety-description { font-size: 12px; opacity: 0.8; }
        .safety-features { background: var(--other-msg-bg); padding: 15px; border-radius: 8px; }
        .safety-features h4 { margin: 0 0 12px 0; font-size: 14px; }
        .safety-feature { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); }
        .safety-feature:last-child { border-bottom: none; }
        .safety-feature i { width: 20px; color: #4facfe; }
        .feature-status { font-size: 12px; padding: 2px 8px; border-radius: 10px; font-weight: 500; }
        .feature-status.active { background: #e8f5e8; color: #2e7d32; }
        .feature-status.muted { background: #f5f5f5; color: #757575; }
        .quick-actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 20px; }
        .quick-action-btn { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--other-msg-bg); cursor: pointer; transition: all 0.2s ease; font-size: 12px; }
        .quick-action-btn:hover { border-color: #4facfe; background: rgba(79, 172, 254, 0.1); }
        .quick-action-btn i { font-size: 16px; color: #4facfe; }
        .join-actions { display: flex; gap: 10px; margin-bottom: 20px; }
        .join-btn { flex: 1; padding: 12px; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .join-btn.primary { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
        .join-btn.secondary { background: rgba(0,0,0,0.1); color: var(--text-color); }
        .safety-tips { background: rgba(255, 193, 7, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; }
        .tip-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .tip-content { font-size: 13px; line-height: 1.4; }
        .quick-leave-modal { max-width: 400px; }
        .leave-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; color: #ff6b6b; }
        .leave-options { display: flex; flex-direction: column; gap: 10px; margin: 15px 0; }
        .leave-option { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: all 0.2s ease; }
        .leave-option:hover { border-color: #4facfe; background: rgba(79, 172, 254, 0.05); }
        .leave-option input[type="radio"] { display: none; }
        .radio-checkmark { width: 18px; height: 18px; border: 2px solid var(--border-color); border-radius: 50%; position: relative; transition: all 0.2s ease; }
        .leave-option input[type="radio"]:checked + .radio-checkmark { border-color: #4facfe; }
        .leave-option input[type="radio"]:checked + .radio-checkmark::after { content: ''; width: 8px; height: 8px; background: #4facfe; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .report-option { display: flex; align-items: center; gap: 8px; margin: 15px 0; }
        .leave-actions { display: flex; gap: 10px; }
        .leave-btn { flex: 1; padding: 10px; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .leave-btn.primary { background: #ff6b6b; color: white; }
        .leave-btn.secondary { background: rgba(0,0,0,0.1); color: var(--text-color); }
        .group-report-modal { max-width: 500px; }
        .report-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; color: #ff6b6b; }
        .report-options { display: flex; flex-direction: column; gap: 10px; margin: 15px 0; }
        .report-option { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: all 0.2s ease; }
        .report-option:hover { border-color: #4facfe; background: rgba(79, 172, 254, 0.05); }
        .report-option input[type="radio"] { display: none; }
        .option-content { flex: 1; }
        .option-title { font-weight: 500; margin-bottom: 2px; }
        .option-description { font-size: 12px; opacity: 0.7; }
        .report-comment { margin: 15px 0; }
        .report-comment label { display: block; margin-bottom: 5px; font-size: 14px; }
        .report-comment textarea { width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--input-bg); color: var(--input-color); resize: vertical; }
        .report-notice { display: flex; align-items: flex-start; gap: 8px; padding: 10px; background: rgba(79, 172, 254, 0.1); border-radius: 6px; font-size: 12px; margin: 15px 0; }
        .report-actions { display: flex; gap: 10px; }
        .report-btn { flex: 1; padding: 10px; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .report-btn.primary { background: #4facfe; color: white; }
        .report-btn.secondary { background: rgba(0,0,0,0.1); color: var(--text-color); }
        .safety-guide-modal { max-width: 500px; }
        .guide-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #4facfe; }
        .guide-content { margin-bottom: 20px; }
        .guide-section { margin-bottom: 20px; }
        .guide-section h4 { margin: 0 0 10px 0; font-size: 14px; }
        .guide-section ul { margin: 0; padding-left: 20px; }
        .guide-section li { margin-bottom: 5px; font-size: 13px; }
        .quick-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .guide-action-btn { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 12px 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--other-msg-bg); cursor: pointer; transition: all 0.2s ease; font-size: 12px; }
        .guide-action-btn:hover { border-color: #4facfe; background: rgba(79, 172, 254, 0.1); }
        .guide-action-btn i { font-size: 18px; color: #4facfe; }
        .guide-actions { border-top: 1px solid var(--border-color); padding-top: 15px; }
        .guide-btn { width: 100%; padding: 12px; background: #4facfe; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; margin-bottom: 10px; }
        .safety-checkbox, .guide-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }
        .safety-checkbox input, .guide-checkbox input { display: none; }
        .checkmark { width: 18px; height: 18px; border: 2px solid var(--border-color); border-radius: 3px; position: relative; transition: all 0.2s ease; }
        .safety-checkbox input:checked + .checkmark,
        .guide-checkbox input:checked + .checkmark { background: #4facfe; border-color: #4facfe; }
        .safety-checkbox input:checked + .checkmark::after,
        .guide-checkbox input:checked + .checkmark::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 12px; font-weight: bold; }
        @media (max-width: 768px) {
            .quick-actions { grid-template-columns: 1fr; }
            .safety-score-display { flex-direction: column; text-align: center; }
            .join-actions, .leave-actions, .report-actions { flex-direction: column; }
            .quick-actions-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
            .safety-actions { flex-direction: column; }
            .quick-actions-grid { grid-template-columns: 1fr; }
        }
        .light-theme .safety-features,
        .light-theme .quick-action-btn,
        .light-theme .guide-action-btn { background: rgba(255,255,255,0.9); }
    `;
    
    if (!document.getElementById('safety-tools-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'safety-tools-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        console.log("✅ Стили инструментов безопасности добавлены");
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM загружен, инициализируем инструменты безопасности...");
    setTimeout(initGroupSafetyTools, 3000);
});

// Экспорт функций
window.GroupSafetyTools = {
    init: initGroupSafetyTools,
    checkSafety: checkGroupSafety,
    reportGroup: submitGroupReport,
    getSettings: () => safetySettings
};

console.log("🛡️ group-safety-tools.js загружен успешно! Версия 2.0 - Исправлены ссылки-приглашения");