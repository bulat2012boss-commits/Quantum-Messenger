// group-transfer-ownership.js - Функция передачи прав владельца группы
// Автор: Quantum Messenger
// Версия: 1.1 (исправленная)

let transferOwnershipListeners = {};

// Инициализация функции передачи прав владельца
function initTransferOwnership() {
    console.log("Transfer Ownership system initialized");
    
    // Переопределяем функции групп для добавления возможности передачи прав
    overrideGroupFunctionsForOwnership();
    
    // Инициализируем слушатели
    initOwnershipListeners();
}

// Инициализация слушателей для передачи прав
function initOwnershipListeners() {
    // Слушаем изменения в группах для обновления интерфейса
    if (typeof database !== 'undefined') {
        database.ref('groups').on('child_changed', (snapshot) => {
            const group = snapshot.val();
            updateOwnershipUI(snapshot.key, group);
        });
    }
}

// Обновление UI при изменении владельца
function updateOwnershipUI(groupId, group) {
    if (currentGroupId === groupId) {
        // Обновляем роль текущего пользователя
        currentGroupRole = group.members[userId]?.role || 'member';
        
        // Обновляем интерфейс группового чата
        updateGroupChatInterfaceForOwnership(group);
    }
}

// Обновление интерфейса группового чата с учетом прав владельца
function updateGroupChatInterfaceForOwnership(group) {
    const isOwner = group.creator === userId;
    const isAdmin = currentGroupRole === 'admin';
    
    // Обновляем меню группы
    updateGroupMenuForOwnership(isOwner, isAdmin);
    
    // Обновляем информацию в заголовке
    updateGroupHeaderForOwnership(group, isOwner);
}

// Обновление меню группы
function updateGroupMenuForOwnership(isOwner, isAdmin) {
    const groupMenuContent = document.getElementById('groupMenuContent');
    if (!groupMenuContent) return;
    
    // Удаляем существующую кнопку передачи прав если есть
    const existingTransferBtn = document.getElementById('transferOwnershipBtn');
    if (existingTransferBtn) {
        existingTransferBtn.remove();
    }
    
    // Добавляем кнопку передачи прав если пользователь владелец
    if (isOwner) {
        const transferOwnershipItem = document.createElement('div');
        transferOwnershipItem.className = 'chat-menu-item';
        transferOwnershipItem.id = 'transferOwnershipBtn';
        transferOwnershipItem.innerHTML = '<i class="fas fa-crown"></i> Передать права владельца';
        
        // Вставляем перед кнопкой выхода из группы
        const leaveGroupBtn = document.getElementById('leaveGroupBtn');
        if (leaveGroupBtn) {
            groupMenuContent.insertBefore(transferOwnershipItem, leaveGroupBtn);
        } else {
            groupMenuContent.appendChild(transferOwnershipItem);
        }
        
        // Добавляем обработчик
        transferOwnershipItem.addEventListener('click', showTransferOwnershipModal);
    }
}

// Обновление заголовка группы
function updateGroupHeaderForOwnership(group, isOwner) {
    const groupChatInfo = document.getElementById('groupChatInfo');
    if (!groupChatInfo) return;
    
    const membersCount = Object.keys(group.members || {}).length;
    let infoText = `Групповой чат • ${membersCount} участников`;
    
    if (isOwner) {
        infoText += ' • Вы владелец';
    } else if (currentGroupRole === 'admin') {
        infoText += ' • Администратор';
    }
    
    if (!(isOwner || currentGroupRole === 'admin') && group.settings.adminsOnly) {
        infoText += ' • Только чтение';
    }
    
    groupChatInfo.textContent = infoText;
}

// Показ модального окна передачи прав владельца
function showTransferOwnershipModal() {
    if (!currentGroupId) return;
    
    database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            showNotification("Группа не найдена");
            return;
        }
        
        const group = snapshot.val();
        
        // Проверяем, является ли пользователь владельцем
        if (group.creator !== userId) {
            showNotification("Только владелец группы может передать права");
            return;
        }
        
        const admins = getGroupAdmins(group);
        
        // Нельзя передать права если нет других админов
        if (admins.length === 0) {
            showNotification("Нет других администраторов для передачи прав");
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'transferOwnershipModal';
        
        let adminsListHTML = '';
        admins.forEach(admin => {
            adminsListHTML += `
                <div class="user-item transfer-admin-item" data-user-id="${admin.id}">
                    <div class="user-item-avatar" style="background: ${generateUserColor()}">
                        ${admin.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="user-item-info">
                        <div class="user-item-name">${admin.name}</div>
                        <div class="user-item-status">Администратор</div>
                    </div>
                    <button class="select-admin-btn" data-user-id="${admin.id}" data-user-name="${admin.name}">
                        <i class="fas fa-crown"></i> Выбрать
                    </button>
                </div>
            `;
        });
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3 style="margin-bottom: 15px; text-align: center;">Передача прав владельца</h3>
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px; color: #ffd700;">
                        <i class="fas fa-crown"></i>
                    </div>
                    <p style="margin-bottom: 10px;">Вы собираетесь передать права владельца группы</p>
                    <div style="font-weight: bold; font-size: 18px; color: #ffd700;">"${currentGroupName}"</div>
                    <div style="font-size: 14px; opacity: 0.8; margin-top: 10px;">
                        После передачи вы станете обычным администратором
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px;">Выберите нового владельца:</h4>
                    <div id="adminsForTransfer" style="max-height: 300px; overflow-y: auto;">
                        ${adminsListHTML}
                    </div>
                </div>
                
                <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <h4 style="color: #ffd700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-exclamation-triangle"></i> Внимание!
                    </h4>
                    <div style="font-size: 14px; line-height: 1.4;">
                        <p>• Вы потеряете права владельца группы</p>
                        <p>• Новый владелец сможет исключить вас из группы</p>
                        <p>• Вы не сможете отменить это действие</p>
                        <p>• Группа будет принадлежать новому владельцу</p>
                    </div>
                </div>
                
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="cancelTransferBtn">Отмена</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Обработчики для выбора администратора
        modal.querySelectorAll('.select-admin-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetUserId = e.target.closest('.select-admin-btn').dataset.userId;
                const targetUserName = e.target.closest('.select-admin-btn').dataset.userName;
                confirmTransferOwnership(targetUserId, targetUserName);
            });
        });
        
        // Стили для кнопок выбора
        modal.querySelectorAll('.select-admin-btn').forEach(btn => {
            btn.style.cssText = `
                padding: 8px 15px;
                background: linear-gradient(to right, #ffd700, #ffed4e);
                color: #000;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                transition: all 0.3s;
            `;
            
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.4)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            });
        });
        
        // Обработчик отмены
        document.getElementById('cancelTransferBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Закрытие при клике вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
    }).catch((error) => {
        console.error("Ошибка загрузки данных группы:", error);
        showNotification("Ошибка загрузки информации о группе");
    });
}

// Получение списка администраторов группы (кроме текущего пользователя)
function getGroupAdmins(group) {
    const admins = [];
    const members = group.members || {};
    
    Object.keys(members).forEach(memberId => {
        const member = members[memberId];
        if (member.role === 'admin' && memberId !== userId) {
            admins.push({
                id: memberId,
                name: member.name,
                ...member
            });
        }
    });
    
    return admins;
}

// Подтверждение передачи прав владельца
function confirmTransferOwnership(newOwnerId, newOwnerName) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'confirmTransferModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; text-align: center;">Подтверждение передачи</h3>
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 64px; margin-bottom: 15px; color: #ff6b6b;">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <p style="margin-bottom: 10px; font-size: 16px;">Вы уверены, что хотите передать права владельца группы</p>
                <div style="font-weight: bold; font-size: 18px; color: #ffd700; margin: 10px 0;">"${currentGroupName}"</div>
                <p style="margin-bottom: 10px;">пользователю</p>
                <div style="font-weight: bold; font-size: 20px; color: #4facfe;">${newOwnerName}</div>
            </div>
            
            <div style="background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <div style="font-size: 14px; line-height: 1.4; text-align: center;">
                    <p style="color: #ff6b6b; font-weight: bold;">Это действие необратимо!</p>
                    <p>После передачи вы станете обычным администратором и не сможете вернуть права владельца без согласия нового владельца.</p>
                </div>
            </div>
            
            <div class="modal-buttons">
                <button class="modal-btn danger" id="finalConfirmTransferBtn">
                    <i class="fas fa-crown"></i> Да, передать права
                </button>
                <button class="modal-btn secondary" id="finalCancelTransferBtn">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчик окончательного подтверждения
    document.getElementById('finalConfirmTransferBtn').addEventListener('click', () => {
        performOwnershipTransfer(newOwnerId, newOwnerName);
        document.body.removeChild(modal);
        document.body.removeChild(document.getElementById('transferOwnershipModal'));
    });
    
    // Обработчик отмены
    document.getElementById('finalCancelTransferBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Выполнение передачи прав владельца
function performOwnershipTransfer(newOwnerId, newOwnerName) {
    if (!currentGroupId) return;
    
    const updates = {
        creator: newOwnerId,
        creatorName: newOwnerName
    };
    
    // Обновляем создателя группы
    database.ref('groups/' + currentGroupId).update(updates)
        .then(() => {
            // Отправляем системное сообщение о передаче прав
            sendOwnershipTransferMessage(newOwnerName);
            
            showNotification(`Права владельца переданы пользователю ${newOwnerName}`);
            
            // Обновляем интерфейс
            setTimeout(() => {
                if (document.getElementById('transferOwnershipModal')) {
                    document.body.removeChild(document.getElementById('transferOwnershipModal'));
                }
                
                // Перезагружаем интерфейс группы
                database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
                    if (snapshot.exists()) {
                        const group = snapshot.val();
                        updateGroupChatInterfaceForOwnership(group);
                    }
                });
            }, 1000);
            
        })
        .catch((error) => {
            console.error("Ошибка передачи прав владельца:", error);
            showNotification("Ошибка передачи прав владельца");
        });
}

// Отправка системного сообщения о передаче прав
function sendOwnershipTransferMessage(newOwnerName) {
    const messageId = database.ref('groupMessages').push().key;
    const timestamp = Date.now();
    
    const systemMessage = {
        id: messageId,
        text: `Владелец группы ${currentUser} передал права владения пользователю ${newOwnerName}`,
        senderId: 'system',
        senderName: 'Система',
        groupId: currentGroupId,
        groupName: currentGroupName,
        timestamp: timestamp,
        isSystem: true,
        isOwnershipTransfer: true,
        transferData: {
            fromUser: currentUser,
            fromUserId: userId,
            toUser: newOwnerName,
            timestamp: timestamp
        }
    };
    
    database.ref('groupMessages/' + messageId).set(systemMessage)
        .then(() => {
            // Обновляем активность группы
            database.ref('groups/' + currentGroupId).update({
                lastActivity: timestamp
            });
        })
        .catch((error) => {
            console.error("Ошибка отправки системного сообщения:", error);
        });
}

// Переопределение функций групп для добавления возможности передачи прав
function overrideGroupFunctionsForOwnership() {
    // Переопределяем createGroupChatInterface для добавления кнопки передачи прав
    const originalCreateGroupChatInterface = window.createGroupChatInterface;
    if (originalCreateGroupChatInterface) {
        window.createGroupChatInterface = function(group) {
            originalCreateGroupChatInterface.call(this, group);
            updateGroupChatInterfaceForOwnership(group);
        };
    }
    
    // Переопределяем showGroupSettings для добавления опции передачи прав
    const originalShowGroupSettings = window.showGroupSettings;
    if (originalShowGroupSettings) {
        window.showGroupSettings = function() {
            if (!currentGroupId || currentGroupRole !== 'admin') return;
            
            database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    const group = snapshot.val();
                    const isOwner = group.creator === userId;
                    
                    // Создаем модальное окно настроек
                    const modal = document.createElement('div');
                    modal.className = 'modal active';
                    modal.id = 'groupSettingsModal';
                    
                    modal.innerHTML = `
                        <div class="modal-content">
                            <h3 style="margin-bottom: 15px; text-align: center;">Настройки группы</h3>
                            <div style="margin-bottom: 15px;">
                                <input type="text" id="editGroupName" value="${group.name}" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-color);">
                                <textarea id="editGroupDescription" placeholder="Описание группы" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-color); height: 80px; resize: vertical;">${group.description || ''}</textarea>
                            </div>
                            
                            <div class="settings-section">
                                <h4 style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-cog"></i> Настройки группы
                                </h4>
                                <div class="settings-option">
                                    <span>Публичная группа</span>
                                    <label class="switch">
                                        <input type="checkbox" id="editPublicToggle" ${group.settings.public ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <div class="settings-option">
                                    <span>Требуется одобрение вступления</span>
                                    <label class="switch">
                                        <input type="checkbox" id="editApprovalToggle" ${group.settings.approvalRequired ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <div class="settings-option">
                                    <span>Только админы пишут</span>
                                    <label class="switch">
                                        <input type="checkbox" id="editAdminsOnlyToggle" ${group.settings.adminsOnly ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <div class="settings-option">
                                    <span>Показывать кто печатает</span>
                                    <label class="switch">
                                        <input type="checkbox" id="editShowTypingToggle" ${group.settings.showTyping ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <div class="settings-option">
                                    <span>Разрешить реакции</span>
                                    <label class="switch">
                                        <input type="checkbox" id="editAllowReactionsToggle" ${group.settings.allowReactions ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                            </div>
                            
                            ${isOwner ? `
                            <div class="settings-section" style="margin-top: 20px;">
                                <h4 style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px; color: #ffd700;">
                                    <i class="fas fa-crown"></i> Права владельца
                                </h4>
                                <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 8px; padding: 15px;">
                                    <p style="margin-bottom: 10px; font-size: 14px;">Вы являетесь владельцем этой группы</p>
                                    <button class="modal-btn" id="openTransferOwnershipBtn" style="width: 100%; background: linear-gradient(to right, #ffd700, #ffed4e); color: #000; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                                        <i class="fas fa-crown"></i> Передать права владельца
                                    </button>
                                </div>
                            </div>
                            ` : ''}
                            
                            <div class="modal-buttons">
                                <button class="modal-btn primary" id="saveGroupSettingsBtn">Сохранить</button>
                                ${isOwner ? `
                                <button class="modal-btn danger" id="deleteGroupBtn">Удалить группу</button>
                                ` : ''}
                                <button class="modal-btn secondary" id="closeGroupSettingsBtn">Закрыть</button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(modal);
                    
                    // Обработчики для кнопок
                    document.getElementById('saveGroupSettingsBtn').addEventListener('click', () => {
                        saveGroupSettings(group);
                    });
                    
                    if (isOwner) {
                        document.getElementById('deleteGroupBtn').addEventListener('click', () => {
                            deleteGroup();
                        });
                        
                        document.getElementById('openTransferOwnershipBtn').addEventListener('click', () => {
                            document.body.removeChild(modal);
                            showTransferOwnershipModal();
                        });
                    }
                    
                    document.getElementById('closeGroupSettingsBtn').addEventListener('click', () => {
                        document.body.removeChild(modal);
                    });
                    
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            document.body.removeChild(modal);
                        }
                    });
                }
            });
            
            document.getElementById('groupMenuContent').classList.remove('active');
        };
    }
    
    // Переопределяем kickMember для защиты владельца от исключения
    const originalKickMember = window.kickMember;
    if (originalKickMember) {
        window.kickMember = function(targetUserId, targetUserName) {
            if (!currentGroupId) return;
            
            // Проверяем, не является ли целевой пользователь владельцем
            database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    const group = snapshot.val();
                    if (group.creator === targetUserId) {
                        showNotification("Нельзя исключить владельца группы");
                        return;
                    }
                    
                    // Если все нормально, вызываем оригинальную функцию
                    originalKickMember.call(this, targetUserId, targetUserName);
                }
            });
        };
    }
    
    // Переопределяем removeAdmin для защиты владельца от снятия прав
    const originalRemoveAdmin = window.removeAdmin;
    if (originalRemoveAdmin) {
        window.removeAdmin = function(targetUserId, targetUserName) {
            if (!currentGroupId) return;
            
            // Проверяем, не является ли целевой пользователь владельцем
            database.ref('groups/' + currentGroupId).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    const group = snapshot.val();
                    if (group.creator === targetUserId) {
                        showNotification("Нельзя снять права администратора с владельца группы");
                        return;
                    }
                    
                    // Если все нормально, вызываем оригинальную функцию
                    originalRemoveAdmin.call(this, targetUserId, targetUserName);
                }
            });
        };
    }
}

// Вспомогательная функция для генерации цвета пользователя
function generateUserColor() {
    const colors = [
        'linear-gradient(to right, #ff7e5f, #feb47b)',
        'linear-gradient(to right, #4facfe, #00f2fe)',
        'linear-gradient(to right, #a8edea, #fed6e3)',
        'linear-gradient(to right, #ffecd2, #fcb69f)',
        'linear-gradient(to right, #84fab0, #8fd3f4)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// CSS стили для передачи прав владельца
const transferOwnershipStyles = `
    .transfer-admin-item {
        transition: all 0.3s;
        border: 2px solid transparent;
        border-radius: 10px;
        padding: 10px;
    }
    
    .transfer-admin-item:hover {
        background: rgba(79, 172, 254, 0.1);
        border-color: rgba(79, 172, 254, 0.3);
        transform: translateY(-2px);
    }
    
    .select-admin-btn {
        padding: 8px 15px;
        background: linear-gradient(to right, #ffd700, #ffed4e);
        color: #000;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        transition: all 0.3s;
    }
    
    .select-admin-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
    }
    
    @media (max-width: 768px) {
        .transfer-admin-item {
            padding: 8px;
        }
        
        .select-admin-btn {
            padding: 6px 12px;
            font-size: 11px;
        }
    }
    
    @media (max-width: 480px) {
        .transfer-admin-item {
            padding: 6px;
        }
        
        .select-admin-btn {
            padding: 5px 10px;
            font-size: 10px;
        }
    }
`;

// Добавляем стили в документ
const transferOwnershipStyleSheet = document.createElement('style');
transferOwnershipStyleSheet.textContent = transferOwnershipStyles;
document.head.appendChild(transferOwnershipStyleSheet);

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Ждем инициализации основных систем
    const checkInit = setInterval(() => {
        if (typeof database !== 'undefined' && typeof userId !== 'undefined' && userId) {
            clearInterval(checkInit);
            
            // Инициализируем систему передачи прав
            setTimeout(initTransferOwnership, 1500);
        }
    }, 100);
});