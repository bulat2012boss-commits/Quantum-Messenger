// group-admin-titles.js - Система титулов для администраторов групп
// Автор: Quantum Messenger
// Версия: 1.1 (исправленная)

let adminTitles = {};

function initAdminTitles() {
    console.log("Инициализация системы титулов администраторов...");
    loadAdminTitles();
    addAdminTitlesStyles();
    
    // Переопределяем функции после загрузки groups.js
    overrideGroupFunctions();
}

function loadAdminTitles() {
    const savedTitles = localStorage.getItem('quantumAdminTitles');
    if (savedTitles) {
        adminTitles = JSON.parse(savedTitles);
    } else {
        adminTitles = {};
    }
}

function saveAdminTitles() {
    localStorage.setItem('quantumAdminTitles', JSON.stringify(adminTitles));
}

function getAdminTitle(groupId, adminId) {
    if (!adminTitles[groupId]) {
        return null;
    }
    return adminTitles[groupId][adminId] || null;
}

function setAdminTitle(groupId, adminId, title) {
    if (!adminTitles[groupId]) {
        adminTitles[groupId] = {};
    }
    adminTitles[groupId][adminId] = title.trim();
    saveAdminTitles();
    updateAdminTitleDisplay(groupId, adminId, title);
}

function removeAdminTitle(groupId, adminId) {
    if (adminTitles[groupId] && adminTitles[groupId][adminId]) {
        delete adminTitles[groupId][adminId];
        // Если в группе больше нет титулов, удаляем группу из объекта
        if (Object.keys(adminTitles[groupId]).length === 0) {
            delete adminTitles[groupId];
        }
        saveAdminTitles();
        updateAdminTitleDisplay(groupId, adminId, null);
    }
}

function updateAdminTitleDisplay(groupId, adminId, title) {
    updateMemberListTitle(groupId, adminId, title);
    updateMessagesTitle(groupId, adminId, title);
}

function updateMemberListTitle(groupId, adminId, title) {
    const memberItems = document.querySelectorAll('.user-item');
    memberItems.forEach(item => {
        const buttons = item.querySelectorAll('button');
        let userBtn = null;
        buttons.forEach(btn => {
            if (btn.classList.contains('make-admin-btn') || btn.classList.contains('remove-admin-btn')) {
                userBtn = btn;
            }
        });
        
        if (userBtn && userBtn.dataset.userId === adminId) {
            let titleElement = item.querySelector('.admin-title');
            if (!titleElement) {
                titleElement = document.createElement('span');
                titleElement.className = 'admin-title';
                titleElement.style.cssText = `
                    background: linear-gradient(135deg, #ffd700, #ffed4e);
                    color: #000;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: bold;
                    margin-left: 8px;
                    display: inline-block;
                `;
                
                const userNameElement = item.querySelector('.user-item-name');
                if (userNameElement) {
                    userNameElement.appendChild(titleElement);
                }
            }
            
            if (title) {
                titleElement.textContent = title;
                titleElement.style.display = 'inline';
            } else {
                titleElement.style.display = 'none';
            }
        }
    });
}

function updateMessagesTitle(groupId, adminId, title) {
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        const senderElement = message.querySelector('.sender');
        if (senderElement && message.dataset.senderId === adminId) {
            let titleElement = senderElement.querySelector('.admin-title');
            
            if (title) {
                if (!titleElement) {
                    titleElement = document.createElement('span');
                    titleElement.className = 'admin-title';
                    titleElement.style.cssText = `
                        background: linear-gradient(135deg, #ffd700, #ffed4e);
                        color: #000;
                        padding: 1px 6px;
                        border-radius: 10px;
                        font-size: 9px;
                        font-weight: bold;
                        margin-left: 6px;
                        display: inline-block;
                    `;
                    senderElement.appendChild(titleElement);
                }
                titleElement.textContent = title;
                titleElement.style.display = 'inline';
            } else if (titleElement) {
                titleElement.style.display = 'none';
            }
        }
    });
}

function addTitleButtonToAdmin(userItem, groupId, userId, userName) {
    const buttonsContainer = userItem.querySelector('div[style*="display: flex"]');
    if (!buttonsContainer) return;
    
    // Проверяем, есть ли уже кнопка титула
    if (userItem.querySelector('.admin-title-btn')) return;
    
    const titleBtn = document.createElement('button');
    titleBtn.className = 'admin-title-btn';
    titleBtn.innerHTML = '<i class="fas fa-crown"></i>';
    titleBtn.title = 'Управление титулом';
    titleBtn.style.cssText = `
        padding: 5px 10px;
        background: linear-gradient(to right, #ffd700, #ffed4e);
        color: #000;
        border: none;
        border-radius: 15px;
        cursor: pointer;
        font-size: 12px;
        margin-left: 5px;
        transition: all 0.2s;
    `;
    
    titleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showAdminTitleModal(groupId, userId, userName);
    });
    
    buttonsContainer.appendChild(titleBtn);
    
    // Добавляем текущий титул если есть
    const currentTitle = getAdminTitle(groupId, userId);
    if (currentTitle) {
        const titleElement = document.createElement('span');
        titleElement.className = 'admin-title';
        titleElement.textContent = currentTitle;
        titleElement.style.cssText = `
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #000;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            margin-left: 8px;
            display: inline-block;
        `;
        
        const userNameElement = userItem.querySelector('.user-item-name');
        if (userNameElement && !userNameElement.querySelector('.admin-title')) {
            userNameElement.appendChild(titleElement);
        }
    }
}

function showAdminTitleModal(groupId, adminId, adminName) {
    const currentTitle = getAdminTitle(groupId, adminId) || '';
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'adminTitleModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Титул администратора</h3>
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px; color: #ffd700;">
                    <i class="fas fa-crown"></i>
                </div>
                <p>Установите титул для</p>
                <div style="font-weight: bold; margin: 10px 0; font-size: 18px;">${adminName}</div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <input type="text" id="adminTitleInput" value="${currentTitle}" 
                       placeholder="Например: Главный модератор" 
                       maxlength="20"
                       style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); 
                              background: var(--input-bg); color: var(--input-color); font-size: 14px;">
                <div style="font-size: 12px; color: var(--text-color); opacity: 0.7; margin-top: 5px; text-align: right;">
                    ${currentTitle.length}/20 символов
                </div>
                
                <div style="margin-top: 15px;">
                    <div style="font-size: 14px; color: var(--text-color); opacity: 0.8; margin-bottom: 10px;">
                        Быстрые варианты:
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        <span class="title-example" data-title="Создатель">Создатель</span>
                        <span class="title-example" data-title="Главный админ">Главный админ</span>
                        <span class="title-example" data-title="Модератор">Модератор</span>
                        <span class="title-example" data-title="Администратор">Администратор</span>
                        <span class="title-example" data-title="Заместитель">Заместитель</span>
                        <span class="title-example" data-title="Координатор">Координатор</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-buttons">
                <button class="modal-btn primary" id="saveAdminTitleBtn">
                    <i class="fas fa-save"></i> Сохранить
                </button>
                ${currentTitle ? `
                <button class="modal-btn danger" id="removeAdminTitleBtn">
                    <i class="fas fa-trash"></i> Удалить
                </button>
                ` : ''}
                <button class="modal-btn secondary" id="closeAdminTitleBtn">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обновление счетчика символов
    const titleInput = document.getElementById('adminTitleInput');
    const charCounter = modal.querySelector('div[style*="12px"]');
    
    titleInput.addEventListener('input', function() {
        charCounter.textContent = `${this.value.length}/20 символов`;
    });
    
    // Обработчики событий
    document.getElementById('saveAdminTitleBtn').addEventListener('click', () => {
        const newTitle = titleInput.value.trim();
        if (newTitle) {
            if (newTitle.length > 20) {
                showNotification("Титул не может быть длиннее 20 символов");
                return;
            }
            setAdminTitle(groupId, adminId, newTitle);
            showNotification(`Титул "${newTitle}" установлен для ${adminName}`);
            document.body.removeChild(modal);
        } else {
            showNotification("Введите титул администратора");
        }
    });
    
    if (currentTitle) {
        document.getElementById('removeAdminTitleBtn').addEventListener('click', () => {
            removeAdminTitle(groupId, adminId);
            showNotification(`Титул удален для ${adminName}`);
            document.body.removeChild(modal);
        });
    }
    
    document.getElementById('closeAdminTitleBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Обработчики для быстрых вариантов
    modal.querySelectorAll('.title-example').forEach(example => {
        example.style.cssText = `
            background: rgba(255, 215, 0, 0.2);
            border: 1px solid rgba(255, 215, 0, 0.5);
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
        `;
        
        example.addEventListener('click', () => {
            titleInput.value = example.dataset.title;
            charCounter.textContent = `${example.dataset.title.length}/20 символов`;
        });
        
        example.addEventListener('mouseenter', () => {
            example.style.background = 'rgba(255, 215, 0, 0.3)';
        });
        
        example.addEventListener('mouseleave', () => {
            example.style.background = 'rgba(255, 215, 0, 0.2)';
        });
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    setTimeout(() => {
        titleInput.focus();
        titleInput.select();
    }, 100);
}

function overrideGroupFunctions() {
    // Переопределяем showManageMembers
    const originalShowManageMembers = window.showManageMembers;
    if (originalShowManageMembers) {
        window.showManageMembers = function() {
            originalShowManageMembers.call(this);
            
            // Ждем загрузки модального окна и добавляем кнопки титулов
            setTimeout(() => {
                const modal = document.getElementById('manageMembersModal');
                if (modal && currentGroupId) {
                    const userItems = modal.querySelectorAll('.user-item');
                    userItems.forEach(item => {
                        const makeAdminBtn = item.querySelector('.make-admin-btn');
                        const removeAdminBtn = item.querySelector('.remove-admin-btn');
                        
                        let userId = null;
                        let userName = null;
                        
                        if (removeAdminBtn) {
                            userId = removeAdminBtn.dataset.userId;
                            userName = removeAdminBtn.dataset.userName;
                        } else if (makeAdminBtn) {
                            userId = makeAdminBtn.dataset.userId;
                            userName = makeAdminBtn.dataset.userName;
                        }
                        
                        if (userId && userName) {
                            addTitleButtonToAdmin(item, currentGroupId, userId, userName);
                        }
                    });
                }
            }, 300);
        };
    }
    
    // Переопределяем addGroupMessageToChat для отображения титулов в сообщениях
    const originalAddGroupMessageToChat = window.addGroupMessageToChat;
    if (originalAddGroupMessageToChat) {
        window.addGroupMessageToChat = function(message) {
            originalAddGroupMessageToChat.call(this, message);
            
            // Добавляем титул к сообщению администратора
            if (message.senderId !== userId && message.senderId !== 'system') {
                const title = getAdminTitle(message.groupId, message.senderId);
                if (title) {
                    setTimeout(() => {
                        const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
                        if (messageElement) {
                            // Добавляем data-атрибут для идентификации отправителя
                            messageElement.dataset.senderId = message.senderId;
                            
                            const senderElement = messageElement.querySelector('.sender');
                            if (senderElement && !senderElement.querySelector('.admin-title')) {
                                const titleElement = document.createElement('span');
                                titleElement.className = 'admin-title';
                                titleElement.textContent = title;
                                titleElement.style.cssText = `
                                    background: linear-gradient(135deg, #ffd700, #ffed4e);
                                    color: #000;
                                    padding: 1px 6px;
                                    border-radius: 10px;
                                    font-size: 9px;
                                    font-weight: bold;
                                    margin-left: 6px;
                                    display: inline-block;
                                `;
                                senderElement.appendChild(titleElement);
                            }
                        }
                    }, 100);
                }
            }
        };
    }
    
    // Переопределяем loadGroupMessages для добавления титулов при загрузке сообщений
    const originalLoadGroupMessages = window.loadGroupMessages;
    if (originalLoadGroupMessages) {
        window.loadGroupMessages = function(groupId) {
            originalLoadGroupMessages.call(this, groupId);
            
            // После загрузки сообщений добавляем титулы
            setTimeout(() => {
                const messages = document.querySelectorAll('.message');
                messages.forEach(message => {
                    const senderElement = message.querySelector('.sender');
                    if (senderElement) {
                        const senderName = senderElement.textContent;
                        // Находим ID пользователя по имени (это упрощенный подход)
                        // В реальном приложении нужно хранить ID отправителя в data-атрибуте
                        if (currentGroupId && senderName) {
                            // Ищем пользователя в группе по имени
                            database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
                                if (snapshot.exists()) {
                                    const group = snapshot.val();
                                    const members = group.members || {};
                                    let senderId = null;
                                    
                                    Object.keys(members).forEach(memberId => {
                                        if (members[memberId].name === senderName.replace(/👑|\.admin-title.*/, '').trim()) {
                                            senderId = memberId;
                                        }
                                    });
                                    
                                    if (senderId) {
                                        const title = getAdminTitle(currentGroupId, senderId);
                                        if (title && !senderElement.querySelector('.admin-title')) {
                                            const titleElement = document.createElement('span');
                                            titleElement.className = 'admin-title';
                                            titleElement.textContent = title;
                                            titleElement.style.cssText = `
                                                background: linear-gradient(135deg, #ffd700, #ffed4e);
                                                color: #000;
                                                padding: 1px 6px;
                                                border-radius: 10px;
                                                font-size: 9px;
                                                font-weight: bold;
                                                margin-left: 6px;
                                                display: inline-block;
                                            `;
                                            senderElement.appendChild(titleElement);
                                        }
                                    }
                                }
                            });
                        }
                    }
                });
            }, 500);
        };
    }
}

function addAdminTitlesStyles() {
    const styles = `
        .admin-title {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #000 !important;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            margin-left: 8px;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .admin-title-btn {
            padding: 5px 10px;
            background: linear-gradient(to right, #ffd700, #ffed4e);
            color: #000;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            font-size: 12px;
            margin-left: 5px;
            transition: all 0.2s;
        }
        
        .admin-title-btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        
        @media (max-width: 768px) {
            .admin-title {
                font-size: 9px;
                padding: 1px 6px;
                margin-left: 5px;
            }
            
            .admin-title-btn {
                padding: 4px 8px;
                font-size: 11px;
            }
        }
        
        @media (max-width: 480px) {
            .admin-title {
                font-size: 8px;
                padding: 1px 4px;
                margin-left: 3px;
            }
            
            .admin-title-btn {
                padding: 3px 6px;
                font-size: 10px;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Инициализация после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminTitles);
} else {
    initAdminTitles();
}