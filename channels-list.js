// channels-list.js - Управление списком каналов

function loadUserChannels() {
    if (!userId) {
        console.log("⚠️ User ID не установлен");
        channelsList.innerHTML = `
            <div class="empty-chat">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Требуется авторизация</p>
                <p style="font-size: 14px; margin-top: 10px;">Войдите в систему для доступа к каналам</p>
            </div>
        `;
        return;
    }
    
    if (!channelsList) {
        console.error("❌ channelsList не инициализирован");
        return;
    }
    
    channelsList.innerHTML = `
        <div class="empty-chat">
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <p>Загрузка каналов...</p>
        </div>
    `;
    
    if (channelsListener) {
        database.ref('channels').off('value', channelsListener);
    }
    
    channelsListener = database.ref('channels').orderByChild('lastMessageTime').on('value', (snapshot) => {
        if (!channelsList) return;
        
        channelsList.innerHTML = '';
        userChannels = [];
        
        if (!snapshot.exists()) {
            channelsList.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-broadcast-tower"></i>
                    <p>Каналы не найдены</p>
                    <p style="font-size: 14px; margin-top: 10px;">Создайте первый канал!</p>
                </div>
            `;
            return;
        }
        
        const channels = snapshot.val();
        let hasChannels = false;
        
        Object.keys(channels).forEach(channelId => {
            const channel = channels[channelId];
            if (channel.participants && channel.participants[userId]) {
                hasChannels = true;
                userChannels.push({
                    id: channelId,
                    ...channel
                });
            }
        });
        
        userChannels.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
        
        userChannels.forEach(channelData => {
            addChannelToList(channelData);
        });
        
        if (!hasChannels) {
            channelsList.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-broadcast-tower"></i>
                    <p>У вас пока нет каналов</p>
                    <p style="font-size: 14px; margin-top: 10px;">Создайте свой канал или присоединитесь к существующему</p>
                </div>
            `;
        }
    }, (error) => {
        console.error("❌ Ошибка загрузки каналов:", error);
        channelsList.innerHTML = `
            <div class="empty-chat">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Ошибка загрузки каналов</p>
                <p style="font-size: 14px; margin-top: 10px;">Попробуйте обновить страницу</p>
            </div>
        `;
    });
}

function addChannelToList(channelData) {
    const channelItem = document.createElement('div');
    channelItem.classList.add('chat-item');
    channelItem.dataset.channelId = channelData.id;
    channelItem.style.cssText = `
        cursor: pointer;
        transition: background 0.3s ease;
        border-radius: 10px;
        margin-bottom: 5px;
    `;
    
    const lastMessage = channelData.lastMessage || 'Нет сообщений';
    const lastMessageTime = channelData.lastMessageTime ? new Date(channelData.lastMessageTime) : new Date();
    const timeString = formatTime(lastMessageTime);
    const membersCount = channelData.participants ? Object.keys(channelData.participants).length : 0;
    const userRole = channelData.participants[userId]?.role || 'member';
    const roleBadge = userRole === 'admin' ? '<span class="admin-badge" title="Администратор" style="color: #ff6b6b; font-size: 12px;">👑</span>' : '';
    const readOnlyBadge = channelData.settings?.readOnly ? '<span class="readonly-badge" title="Только чтение" style="color: #3498db; font-size: 12px;">👁️</span>' : '';

    channelItem.innerHTML = `
        <div class="chat-item-avatar" style="background: #9b59b6; position: relative; border-radius: 10px;">
            <i class="fas fa-broadcast-tower"></i>
        </div>
        <div class="chat-item-info" style="flex: 1;">
            <div class="chat-item-header">
                <div class="chat-item-name">${channelData.name} ${roleBadge} ${readOnlyBadge}</div>
                <div class="chat-item-time">${timeString}</div>
            </div>
            <div class="chat-item-last-message">${lastMessage}</div>
            <div class="channel-meta-info" style="display: flex; gap: 15px; font-size: 11px; opacity: 0.7; margin-top: 2px;">
                <span class="members-count"><i class="fas fa-users"></i> ${membersCount}</span>
                <span class="channel-creator">Создатель: ${channelData.creatorName || 'Неизвестно'}</span>
            </div>
        </div>
    `;
    
    channelItem.addEventListener('mouseenter', function() {
        this.style.background = 'var(--hover-color)';
    });
    
    channelItem.addEventListener('mouseleave', function() {
        this.style.background = '';
    });
    
    channelItem.addEventListener('click', () => {
        openChannel(channelData.id, channelData.name);
    });
    
    channelItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showChannelContextMenu(e, channelData);
    });
    
    if (channelsList) {
        channelsList.appendChild(channelItem);
    }
}

function showChannelContextMenu(e, channelData) {
    const existingMenu = document.getElementById('channelContextMenu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const contextMenu = document.createElement('div');
    contextMenu.id = 'channelContextMenu';
    
    const posX = e.pageX;
    const posY = e.pageY;
    
    contextMenu.style.cssText = `
        position: fixed;
        left: ${posX}px;
        top: ${posY}px;
        background: var(--header-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 5px;
        z-index: 10000;
        box-shadow: var(--shadow);
        min-width: 150px;
        animation: fadeIn 0.2s ease;
    `;
    
    const menuItems = [
        {
            icon: 'fa-info-circle',
            text: 'Информация',
            action: () => showChannelInfo(channelData.id)
        },
        {
            icon: 'fa-users',
            text: 'Участники',
            action: () => showChannelMembers(channelData.id)
        },
        {
            icon: 'fa-sign-out-alt',
            text: 'Покинуть',
            action: () => leaveChannel(channelData.id),
            danger: true
        }
    ];
    
    const userRole = channelData.participants[userId]?.role;
    if (userRole === 'admin') {
        menuItems.splice(2, 0, {
            icon: 'fa-cog',
            text: 'Настройки',
            action: () => showChannelSettings(channelData.id)
        });
        menuItems.splice(3, 0, {
            icon: 'fa-user-shield',
            text: 'Управление участниками',
            action: () => showManageMembers(channelData.id)
        });
    }
    
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = `chat-menu-item ${item.danger ? 'danger' : ''}`;
        menuItem.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 5px;
            transition: background 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        menuItem.innerHTML = `
            <i class="fas ${item.icon}" style="width: 16px;"></i> ${item.text}
        `;
        menuItem.addEventListener('click', item.action);
        
        menuItem.addEventListener('mouseenter', function() {
            this.style.background = item.danger ? 'rgba(231, 76, 60, 0.1)' : 'var(--hover-color)';
        });
        menuItem.addEventListener('mouseleave', function() {
            this.style.background = '';
        });
        
        contextMenu.appendChild(menuItem);
    });
    
    document.body.appendChild(contextMenu);
    
    setTimeout(() => {
        const closeMenu = () => {
            contextMenu.remove();
            document.removeEventListener('click', closeMenu);
        };
        document.addEventListener('click', closeMenu);
    }, 100);
}