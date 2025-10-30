// channels-modals.js - Модальные окна создания и присоединения к каналам

function showCreateChannelModal() {
    closeActiveModal();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '1000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; animation: scaleIn 0.3s ease;">
            <h3 style="margin-bottom: 15px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                <i class="fas fa-plus" style="color: #4facfe;"></i>
                Создание канала
            </h3>
            <div style="margin-bottom: 15px;">
                <input type="text" id="channelNameInput" placeholder="Название канала" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); font-size: 14px; transition: border-color 0.3s ease;">
                <textarea id="channelDescriptionInput" placeholder="Описание канала (необязательно)" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); height: 80px; resize: vertical; font-size: 14px; transition: border-color 0.3s ease;"></textarea>
                <div style="margin-top: 15px;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; padding: 8px; border-radius: 5px; transition: background 0.2s ease;">
                        <input type="checkbox" id="channelPublicToggle" checked>
                        <i class="fas fa-globe" style="color: #4facfe;"></i>
                        Публичный канал
                    </label>
                    <p style="font-size: 12px; opacity: 0.7; margin-top: 5px; margin-left: 24px;">
                        Публичные каналы видны всем пользователям, приватные - только по приглашению
                    </p>
                </div>
                <div style="margin-top: 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; padding: 8px; border-radius: 5px; transition: background 0.2s ease;">
                        <input type="checkbox" id="readOnlyToggle">
                        <i class="fas fa-eye" style="color: #3498db;"></i>
                        Режим только для чтения
                    </label>
                    <p style="font-size: 12px; opacity: 0.7; margin-top: 5px; margin-left: 24px;">
                        В этом режиме только администраторы могут отправлять сообщения
                    </p>
                </div>
                <div style="margin-top: 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; padding: 8px; border-radius: 5px; transition: background 0.2s ease;">
                        <input type="checkbox" id="allowPostsToggle" checked>
                        <i class="fas fa-edit" style="color: #9b59b6;"></i>
                        Разрешить посты
                    </label>
                    <p style="font-size: 12px; opacity: 0.7; margin-top: 5px; margin-left: 24px;">
                        Пользователи могут создавать посты с реакциями
                    </p>
                </div>
                <div style="margin-top: 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; padding: 8px; border-radius: 5px; transition: background 0.2s ease;">
                        <input type="checkbox" id="allowFilesToggle" checked>
                        <i class="fas fa-file-upload" style="color: #2ecc71;"></i>
                        Разрешить отправку файлов
                    </label>
                    <p style="font-size: 12px; opacity: 0.7; margin-top: 5px; margin-left: 24px;">
                        Пользователи могут отправлять файлы, изображения и медиа
                    </p>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn primary" id="confirmCreateChannelBtn" style="transition: all 0.3s ease;">
                    <i class="fas fa-plus"></i> Создать канал
                </button>
                <button class="modal-btn secondary" id="cancelCreateChannelBtn" style="transition: all 0.3s ease;">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    activeModal = modal;
    
    const inputs = modal.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#4facfe';
        });
        input.addEventListener('blur', function() {
            this.style.borderColor = 'var(--border-color)';
        });
    });
    
    const labels = modal.querySelectorAll('label');
    labels.forEach(label => {
        label.addEventListener('mouseenter', function() {
            this.style.background = 'var(--hover-color)';
        });
        label.addEventListener('mouseleave', function() {
            this.style.background = '';
        });
    });
    
    document.getElementById('confirmCreateChannelBtn').addEventListener('click', createChannel);
    document.getElementById('cancelCreateChannelBtn').addEventListener('click', () => {
        closeActiveModal();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeActiveModal();
        }
    });
    
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            closeActiveModal();
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    setTimeout(() => {
        const nameInput = document.getElementById('channelNameInput');
        if (nameInput) nameInput.focus();
    }, 100);
}

function createChannel() {
    const channelNameInput = document.getElementById('channelNameInput');
    const channelDescriptionInput = document.getElementById('channelDescriptionInput');
    const channelPublicToggle = document.getElementById('channelPublicToggle');
    const readOnlyToggle = document.getElementById('readOnlyToggle');
    const allowPostsToggle = document.getElementById('allowPostsToggle');
    const allowFilesToggle = document.getElementById('allowFilesToggle');
    
    const channelName = channelNameInput.value.trim();
    const channelDescription = channelDescriptionInput.value.trim();
    const isPublic = channelPublicToggle.checked;
    const isReadOnly = readOnlyToggle.checked;
    const allowPosts = allowPostsToggle.checked;
    const allowFiles = allowFilesToggle.checked;
    
    if (!channelName) {
        showNotification("Введите название канала");
        channelNameInput.focus();
        return;
    }
    
    const createBtn = document.getElementById('confirmCreateChannelBtn');
    createBtn.disabled = true;
    createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Создание...';
    createBtn.style.opacity = '0.7';
    
    const channelId = 'channel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    
    const channelData = {
        id: channelId,
        name: channelName,
        description: channelDescription || '',
        creatorId: userId,
        creatorName: currentUser,
        createdAt: timestamp,
        participants: {
            [userId]: {
                id: userId,
                name: currentUser,
                joinedAt: timestamp,
                role: 'admin'
            }
        },
        lastMessage: "Канал создан",
        lastMessageTime: timestamp,
        isPublic: isPublic,
        settings: {
            allowInvites: true,
            allowMessages: true,
            slowMode: false,
            readOnly: isReadOnly,
            allowPosts: allowPosts,
            allowFiles: allowFiles
        }
    };
    
    database.ref('channels/' + channelId).set(channelData)
        .then(() => {
            showNotification("✅ Канал создан успешно!");
            closeActiveModal();
            loadUserChannels();
            setTimeout(() => {
                openChannel(channelId, channelName);
            }, 500);
        })
        .catch((error) => {
            console.error("❌ Ошибка создания канала:", error);
            showNotification("❌ Ошибка создания канала");
            createBtn.disabled = false;
            createBtn.innerHTML = '<i class="fas fa-plus"></i> Создать канал';
            createBtn.style.opacity = '1';
        });
}

function showJoinChannelModal() {
    closeActiveModal();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '1000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; animation: scaleIn 0.3s ease;">
            <h3 style="margin-bottom: 15px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                <i class="fas fa-sign-in-alt" style="color: #4facfe;"></i>
                Присоединиться к каналу
            </h3>
            <div style="margin-bottom: 15px;">
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <input type="text" id="channelSearchJoinInput" placeholder="Поиск по названию канала..." style="flex: 1; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); font-size: 14px; transition: border-color 0.3s ease;">
                    <button id="searchJoinChannelBtn" style="padding: 12px 15px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <h4 style="margin-bottom: 10px; color: var(--text-color); display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-key"></i> Или введите ID канала
                    </h4>
                    <input type="text" id="channelIdInput" placeholder="ID канала" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); color: var(--input-color); font-size: 14px; transition: border-color 0.3s ease;">
                    <p style="font-size: 12px; opacity: 0.7; margin-top: 5px;">Попросите ID канала у администратора</p>
                </div>
                
                <div id="searchResultsContainer" style="display: none;">
                    <h4 style="margin-bottom: 10px; color: var(--text-color);">Результаты поиска</h4>
                    <div id="searchResultsList" style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; background: var(--input-bg);">
                    </div>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn primary" id="confirmJoinChannelBtn" style="transition: all 0.3s ease;">Присоединиться по ID</button>
                <button class="modal-btn secondary" id="cancelJoinChannelBtn" style="transition: all 0.3s ease;">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    activeModal = modal;
    
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#4facfe';
        });
        input.addEventListener('blur', function() {
            this.style.borderColor = 'var(--border-color)';
        });
    });
    
    document.getElementById('confirmJoinChannelBtn').addEventListener('click', joinChannelById);
    document.getElementById('cancelJoinChannelBtn').addEventListener('click', () => {
        closeActiveModal();
    });
    
    document.getElementById('searchJoinChannelBtn').addEventListener('click', searchChannelsToJoin);
    document.getElementById('channelSearchJoinInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchChannelsToJoin();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeActiveModal();
        }
    });
    
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            closeActiveModal();
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    setTimeout(() => {
        document.getElementById('channelSearchJoinInput').focus();
    }, 100);
}