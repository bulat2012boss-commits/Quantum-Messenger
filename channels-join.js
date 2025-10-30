// channels-join.js - Функции присоединения к каналам

function searchChannelsToJoin() {
    const searchTerm = document.getElementById('channelSearchJoinInput').value.trim();
    const resultsContainer = document.getElementById('searchResultsContainer');
    const resultsList = document.getElementById('searchResultsList');
    
    if (!searchTerm) {
        showNotification("Введите поисковый запрос");
        return;
    }
    
    if (searchTerm.length < 3) {
        showNotification("Введите минимум 3 символа для поиска");
        return;
    }
    
    resultsList.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <p style="margin-top: 10px; opacity: 0.7;">Поиск каналов...</p>
        </div>
    `;
    
    resultsContainer.style.display = 'block';
    
    database.ref('channels').orderByChild('isPublic').equalTo(true).once('value')
        .then((snapshot) => {
            resultsList.innerHTML = '';
            
            if (!snapshot.exists()) {
                resultsList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">Каналы не найдены</p>';
                return;
            }
            
            const channels = snapshot.val();
            let foundChannels = false;
            const searchLower = searchTerm.toLowerCase();
            
            Object.keys(channels).forEach(channelId => {
                const channel = channels[channelId];
                if (channel.participants && channel.participants[userId]) {
                    return;
                }
                
                const channelName = (channel.name || '').toLowerCase();
                const channelDescription = (channel.description || '').toLowerCase();
                
                if (channelName.includes(searchLower) || channelDescription.includes(searchLower)) {
                    foundChannels = true;
                    
                    const channelElement = document.createElement('div');
                    channelElement.className = 'user-item';
                    channelElement.style.cssText = `
                        padding: 12px;
                        margin-bottom: 8px;
                        cursor: pointer;
                        border: 1px solid var(--border-color);
                        border-radius: 10px;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    `;
                    
                    const readOnlyBadge = channel.settings?.readOnly ? '<span style="color: #ff6b6b; font-size: 10px; margin-left: 5px;">👁️</span>' : '';
                    const membersCount = channel.participants ? Object.keys(channel.participants).length : 0;
                    
                    channelElement.innerHTML = `
                        <div class="user-item-avatar" style="background: #9b59b6; width: 40px; height: 40px; border-radius: 10px; font-size: 16px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-broadcast-tower"></i>
                        </div>
                        <div class="user-item-info" style="flex: 1;">
                            <div class="user-item-name" style="font-size: 14px; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                                ${channel.name} ${readOnlyBadge}
                            </div>
                            <div class="user-item-status" style="font-size: 12px; opacity: 0.8;">Участников: ${membersCount}</div>
                            <div class="user-item-status" style="font-size: 11px; opacity: 0.7;">${channel.description || 'Нет описания'}</div>
                            <div class="user-item-status" style="font-size: 10px; opacity: 0.5;">ID: ${channelId}</div>
                        </div>
                        <button class="join-search-channel-btn" data-channel-id="${channelId}" style="padding: 8px 15px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 8px; font-size: 12px; cursor: pointer; white-space: nowrap; transition: all 0.3s ease;">
                            Присоединиться
                        </button>
                    `;
                    
                    channelElement.addEventListener('mouseenter', function() {
                        this.style.transform = 'translateY(-2px)';
                        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    });
                    
                    channelElement.addEventListener('mouseleave', function() {
                        this.style.transform = 'translateY(0)';
                        this.style.boxShadow = 'none';
                    });
                    
                    resultsList.appendChild(channelElement);
                }
            });
            
            if (!foundChannels) {
                resultsList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">Каналы по вашему запросу не найдены</p>';
            }
            
            document.querySelectorAll('.join-search-channel-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const channelId = this.getAttribute('data-channel-id');
                    joinChannelFromSearch(channelId);
                });
                
                btn.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.05)';
                });
                btn.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                });
            });
            
            document.querySelectorAll('.user-item').forEach(item => {
                const joinBtn = item.querySelector('.join-search-channel-btn');
                if (joinBtn) {
                    item.addEventListener('click', function(e) {
                        if (e.target !== joinBtn && !joinBtn.contains(e.target)) {
                            const channelId = joinBtn.getAttribute('data-channel-id');
                            joinChannelFromSearch(channelId);
                        }
                    });
                }
            });
        })
        .catch((error) => {
            console.error("Ошибка поиска каналов:", error);
            resultsList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">Ошибка поиска</p>';
        });
}

function joinChannelFromSearch(channelId) {
    document.querySelectorAll('.join-search-channel-btn').forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.style.opacity = '0.7';
    });
    
    const updates = {};
    updates[`channels/${channelId}/participants/${userId}`] = {
        id: userId,
        name: currentUser,
        joinedAt: Date.now(),
        role: 'member'
    };
    
    database.ref().update(updates)
        .then(() => {
            showNotification("✅ Вы успешно присоединились к каналу!");
            closeActiveModal();
            if (channelsTab) {
                switchToChannelsTab();
            }
        })
        .catch((error) => {
            console.error("❌ Ошибка присоединения к каналу:", error);
            showNotification("❌ Ошибка присоединения к каналу");
            document.querySelectorAll('.join-search-channel-btn').forEach(btn => {
                btn.disabled = false;
                btn.innerHTML = 'Присоединиться';
                btn.style.opacity = '1';
            });
        });
}

function joinChannelById() {
    const channelIdInput = document.getElementById('channelIdInput');
    const channelId = channelIdInput.value.trim();
    
    if (!channelId) {
        showNotification("Введите ID канала");
        channelIdInput.focus();
        return;
    }
    
    const joinBtn = document.getElementById('confirmJoinChannelBtn');
    joinBtn.disabled = true;
    joinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Присоединение...';
    joinBtn.style.opacity = '0.7';
    
    database.ref('channels/' + channelId).once('value')
        .then((snapshot) => {
            if (!snapshot.exists()) {
                showNotification("❌ Канал не найден");
                joinBtn.disabled = false;
                joinBtn.innerHTML = 'Присоединиться по ID';
                joinBtn.style.opacity = '1';
                return;
            }
            
            const channel = snapshot.val();
            if (channel.participants && channel.participants[userId]) {
                showNotification("⚠️ Вы уже являетесь участником этого канала");
                joinBtn.disabled = false;
                joinBtn.innerHTML = 'Присоединиться по ID';
                joinBtn.style.opacity = '1';
                return;
            }
            
            if (!channel.isPublic) {
                showNotification("🔒 Это приватный канал. Требуется приглашение.");
                joinBtn.disabled = false;
                joinBtn.innerHTML = 'Присоединиться по ID';
                joinBtn.style.opacity = '1';
                return;
            }
            
            const updates = {};
            updates[`channels/${channelId}/participants/${userId}`] = {
                id: userId,
                name: currentUser,
                joinedAt: Date.now(),
                role: 'member'
            };
            
            return database.ref().update(updates);
        })
        .then(() => {
            showNotification("✅ Вы успешно присоединились к каналу!");
            closeActiveModal();
            if (channelsTab) {
                switchToChannelsTab();
            }
        })
        .catch((error) => {
            console.error("❌ Ошибка присоединения к каналу:", error);
            showNotification("❌ Ошибка присоединения к каналу");
            joinBtn.disabled = false;
            joinBtn.innerHTML = 'Присоединиться по ID';
            joinBtn.style.opacity = '1';
        });
}