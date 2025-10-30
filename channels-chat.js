// channels-chat.js - Интерфейс чата канала

function openChannel(channelId, channelName) {
    currentChannel = channelId;
    toggleMobileMenuButton(false);
    
    const mainContainer = document.querySelector('.main-container');
    const allChatWrappers = mainContainer.querySelectorAll('.chat-wrapper');
    
    allChatWrappers.forEach(wrapper => {
        wrapper.style.display = 'none';
    });
    
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.style.display = 'none';
    }
    
    database.ref('channels/' + channelId).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            showNotification("❌ Канал не найден");
            return;
        }
        
        const channel = snapshot.val();
        userRoleInCurrentChannel = channel.participants[userId]?.role || 'member';
        const isReadOnly = channel.settings?.readOnly;
        const canSendMessages = userRoleInCurrentChannel === 'admin' || !isReadOnly;
        const allowPosts = channel.settings?.allowPosts !== false;
        const allowFiles = channel.settings?.allowFiles !== false;
        
        const channelWindow = document.createElement('div');
        channelWindow.className = 'chat-wrapper';
        channelWindow.style.cssText = `
            display: flex; 
            flex-direction: column; 
            height: 100%; 
            position: absolute; 
            top: 0; 
            left: 0; 
            right: 0; 
            bottom: 0; 
            background: var(--primary-bg); 
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        channelWindow.id = 'channel-window';
        
        const readOnlyBadge = isReadOnly ? '<span style="color: #ff6b6b; font-size: 11px; margin-left: 5px;">👁️ Только чтение</span>' : '';
        const roleBadge = userRoleInCurrentChannel === 'admin' ? '<span style="color: #ff6b6b; font-size: 11px; margin-left: 5px;">👑 Админ</span>' : '';
        
        channelWindow.innerHTML = `
            <div class="chat-header" style="background: var(--header-bg); padding: 15px 20px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
                <div class="chat-header-info" style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <button class="burger-menu" id="backToChannelsBtn" style="background: none; border: none; color: var(--text-color); cursor: pointer; padding: 8px; border-radius: 5px; transition: background 0.2s ease;">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="user-avatar" style="background: #9b59b6; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-broadcast-tower"></i>
                    </div>
                    <div class="user-name" style="flex: 1;">
                        <div style="font-weight: 600; font-size: 16px;">${channelName}</div>
                        <div style="font-size: 11px; opacity: 0.7;">Канал ${readOnlyBadge} ${roleBadge}</div>
                    </div>
                </div>
                <div class="chat-header-actions" style="position: relative;">
                    <button class="chat-menu" id="channelMenuBtn" style="background: none; border: none; color: var(--text-color); cursor: pointer; padding: 8px; border-radius: 5px; transition: background 0.2s ease;">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="chat-menu-content" id="channelMenuContent" style="display: none; position: absolute; top: 100%; right: 0; background: var(--header-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 5px; z-index: 1001; min-width: 200px; box-shadow: var(--shadow);">
                        <div class="chat-menu-item" id="channelInfoBtn" style="padding: 8px 12px; cursor: pointer; border-radius: 5px; transition: background 0.2s ease;">
                            <i class="fas fa-info-circle"></i> Информация о канале
                        </div>
                        <div class="chat-menu-item" id="channelMembersBtn" style="padding: 8px 12px; cursor: pointer; border-radius: 5px; transition: background 0.2s ease;">
                            <i class="fas fa-users"></i> Участники
                        </div>
                        ${userRoleInCurrentChannel === 'admin' ? `
                        <div class="chat-menu-item" id="channelSettingsBtn" style="padding: 8px 12px; cursor: pointer; border-radius: 5px; transition: background 0.2s ease;">
                            <i class="fas fa-cog"></i> Настройки
                        </div>
                        <div class="chat-menu-item" id="manageMembersBtn" style="padding: 8px 12px; cursor: pointer; border-radius: 5px; transition: background 0.2s ease;">
                            <i class="fas fa-user-shield"></i> Управление участниками
                        </div>
                        ` : ''}
                        <div class="chat-menu-item danger" id="leaveChannelBtn" style="padding: 8px 12px; cursor: pointer; border-radius: 5px; transition: background 0.2s ease; color: #e74c3c;">
                            <i class="fas fa-sign-out-alt"></i> Покинуть канал
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="messages-wrapper" id="channelMessagesContainer" style="flex: 1; overflow-y: auto; padding: 15px; background: var(--primary-bg);">
                <div class="empty-chat">
                    <i class="fas fa-broadcast-tower" style="font-size: 48px; color: #9b59b6; margin-bottom: 15px;"></i>
                    <p>Загрузка сообщений канала...</p>
                </div>
            </div>
            
            ${canSendMessages ? `
            <div class="input-area" style="padding: 15px; border-top: 1px solid var(--border-color); background: var(--header-bg);">
                <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
                    ${allowPosts ? `
                    <button id="createPostBtn" style="padding: 8px 12px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 15px; cursor: pointer; font-size: 12px; transition: all 0.3s ease;">
                        <i class="fas fa-edit"></i> Создать пост
                    </button>
                    ` : ''}
                    ${allowFiles ? `
                    <button id="attachFileBtn" style="padding: 8px 12px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 15px; cursor: pointer; font-size: 12px; transition: all 0.3s ease;">
                        <i class="fas fa-paperclip"></i> Прикрепить файл
                    </button>
                    <input type="file" id="fileInput" multiple style="display: none;" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt">
                    ` : ''}
                </div>
                <div id="filePreviewContainer" style="margin-bottom: 10px; display: none;"></div>
                <div style="display: flex; gap: 10px; align-items: flex-end;">
                    <input type="text" id="channelMessageInput" placeholder="Введите сообщение для канала..." autocomplete="off" style="flex: 1; padding: 12px; border: 1px solid var(--border-color); border-radius: 20px; background: var(--input-bg); color: var(--input-color); font-size: 14px; transition: border-color 0.3s ease;">
                    <button id="sendChannelMessageBtn" disabled style="background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 50%; width: 44px; height: 44px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
            ` : `
            <div class="input-area" style="padding: 20px; border-top: 1px solid var(--border-color); background: rgba(255, 0, 0, 0.1); display: flex; justify-content: center; align-items: center;">
                <span style="color: #ff6b6b; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-eye"></i> Режим только для чтения. Сообщения могут отправлять только администраторы.
                </span>
            </div>
            `}
        `;
        
        mainContainer.appendChild(channelWindow);
        initChannelInterface(channelId, channelName, canSendMessages, allowPosts, allowFiles);
    });
}

function initChannelInterface(channelId, channelName, canSendMessages, allowPosts, allowFiles) {
    const backToChannelsBtn = document.getElementById('backToChannelsBtn');
    const channelMessagesContainer = document.getElementById('channelMessagesContainer');
    const channelMenuBtn = document.getElementById('channelMenuBtn');
    const channelMenuContent = document.getElementById('channelMenuContent');
    const channelInfoBtn = document.getElementById('channelInfoBtn');
    const channelMembersBtn = document.getElementById('channelMembersBtn');
    const channelSettingsBtn = document.getElementById('channelSettingsBtn');
    const manageMembersBtn = document.getElementById('manageMembersBtn');
    const leaveChannelBtn = document.getElementById('leaveChannelBtn');
    const createPostBtn = document.getElementById('createPostBtn');
    const attachFileBtn = document.getElementById('attachFileBtn');
    const fileInput = document.getElementById('fileInput');
    
    const headerButtons = [backToChannelsBtn, channelMenuBtn];
    headerButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('mouseenter', function() {
                this.style.background = 'var(--hover-color)';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.background = '';
            });
        }
    });
    
    const menuItems = channelMenuContent.querySelectorAll('.chat-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.background = this.classList.contains('danger') ? 'rgba(231, 76, 60, 0.1)' : 'var(--hover-color)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.background = '';
        });
    });
    
    backToChannelsBtn.addEventListener('click', backToChannelsList);
    
    channelMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = channelMenuContent.style.display === 'block';
        channelMenuContent.style.display = isVisible ? 'none' : 'block';
    });
    
    document.addEventListener('click', (e) => {
        if (!channelMenuBtn.contains(e.target) && !channelMenuContent.contains(e.target)) {
            channelMenuContent.style.display = 'none';
        }
    });
    
    if (createPostBtn && allowPosts) {
        createPostBtn.addEventListener('click', () => {
            showCreatePostModal(channelId);
        });
        
        createPostBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
        createPostBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    }
    
    if (attachFileBtn && allowFiles && fileInput) {
        attachFileBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        attachFileBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
        attachFileBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (canSendMessages) {
        const channelMessageInput = document.getElementById('channelMessageInput');
        const sendChannelMessageBtn = document.getElementById('sendChannelMessageBtn');
        
        channelMessageInput.addEventListener('input', () => {
            const hasText = channelMessageInput.value.trim() !== '';
            const hasFiles = document.querySelector('#filePreviewContainer .file-preview-item') !== null;
            sendChannelMessageBtn.disabled = !hasText && !hasFiles;
            
            if (!sendChannelMessageBtn.disabled) {
                sendChannelMessageBtn.style.opacity = '1';
                sendChannelMessageBtn.style.transform = 'scale(1)';
            } else {
                sendChannelMessageBtn.style.opacity = '0.7';
                sendChannelMessageBtn.style.transform = 'scale(0.95)';
            }
        });
        
        channelMessageInput.addEventListener('focus', function() {
            this.style.borderColor = '#4facfe';
        });
        
        channelMessageInput.addEventListener('blur', function() {
            this.style.borderColor = 'var(--border-color)';
        });
        
        channelMessageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChannelMessage(channelId);
            }
        });
        
        sendChannelMessageBtn.addEventListener('click', () => {
            sendChannelMessage(channelId);
        });
        
        sendChannelMessageBtn.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'scale(1.1)';
            }
        });
        
        sendChannelMessageBtn.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = this.disabled ? 'scale(0.95)' : 'scale(1)';
            }
        });
    }
    
    channelInfoBtn.addEventListener('click', () => {
        channelMenuContent.style.display = 'none';
        showChannelInfo(channelId);
    });
    
    channelMembersBtn.addEventListener('click', () => {
        channelMenuContent.style.display = 'none';
        showChannelMembers(channelId);
    });
    
    if (channelSettingsBtn) {
        channelSettingsBtn.addEventListener('click', () => {
            channelMenuContent.style.display = 'none';
            showChannelSettings(channelId);
        });
    }
    
    if (manageMembersBtn) {
        manageMembersBtn.addEventListener('click', () => {
            channelMenuContent.style.display = 'none';
            showManageMembers(channelId);
        });
    }
    
    leaveChannelBtn.addEventListener('click', () => {
        channelMenuContent.style.display = 'none';
        leaveChannel(channelId);
    });
    
    loadChannelMessages(channelId, channelMessagesContainer);
    
    if (canSendMessages) {
        setTimeout(() => {
            document.getElementById('channelMessageInput').focus();
        }, 100);
    }
}

function backToChannelsList() {
    toggleMobileMenuButton(true);
    
    if (channelMessagesListener) {
        database.ref('channelMessages').off('value', channelMessagesListener);
        channelMessagesListener = null;
    }
    
    if (channelPostsListener) {
        database.ref('channelPosts').off('value', channelPostsListener);
        channelPostsListener = null;
    }
    
    const channelWindow = document.getElementById('channel-window');
    if (channelWindow) {
        channelWindow.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            channelWindow.remove();
        }, 300);
    }
    
    const mainContainer = document.querySelector('.main-container');
    const mainChatWrapper = mainContainer.querySelector('.chat-wrapper');
    if (mainChatWrapper) {
        mainChatWrapper.style.display = 'flex';
    }
    
    currentChannel = null;
    userRoleInCurrentChannel = null;
    switchToChannelsTab();
}