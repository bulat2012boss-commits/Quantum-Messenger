// channels-messages.js - Работа с сообщениями каналов

function loadChannelMessages(channelId, container) {
    container.innerHTML = '<div class="empty-chat"><div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div><p>Загрузка сообщений...</p></div>';
    
    if (channelMessagesListener) {
        database.ref('channelMessages').off('value', channelMessagesListener);
    }
    
    channelMessagesListener = database.ref('channelMessages').orderByChild('channelId').equalTo(channelId).on('value', (snapshot) => {
        if (!snapshot.exists()) {
            container.innerHTML = '<div class="empty-chat"><i class="fas fa-broadcast-tower"></i><p>В канале пока нет сообщений</p><p style="font-size: 14px; margin-top: 10px;">Будьте первым, кто напишет сообщение!</p></div>';
            return;
        }
        
        const messages = snapshot.val();
        container.innerHTML = '';
        
        const messagesArray = [];
        Object.keys(messages).forEach(messageId => {
            messagesArray.push(messages[messageId]);
        });
        
        messagesArray.sort((a, b) => a.timestamp - b.timestamp);
        
        messagesArray.forEach(message => {
            addChannelMessageToChat(message, container);
        });
        
        loadChannelPosts(channelId, container);
        
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
        
        if (messagesArray.length > 0 && userSettings.sound) {
            playNotificationSound();
        }
    });
}

function addChannelMessageToChat(message, container) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.style.cssText = `
        margin-bottom: 10px;
        padding: 10px 15px;
        border-radius: 10px;
        animation: fadeIn 0.3s ease;
        max-width: 80%;
    `;
    
    if (message.senderId === userId) {
        messageElement.classList.add('my-message');
        messageElement.style.cssText += `
            background: linear-gradient(to right, #4facfe, #00f2fe);
            color: white;
            margin-left: auto;
            border-bottom-right-radius: 2px;
        `;
    } else {
        messageElement.classList.add('other-message');
        messageElement.style.cssText += `
            background: var(--hover-color);
            color: var(--text-color);
            margin-right: auto;
            border-bottom-left-radius: 2px;
        `;
    }
    
    const date = new Date(message.timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const roleBadge = message.senderRole === 'admin' ? ' <span style="color: #ff6b6b; font-size: 10px;">👑</span>' : '';
    
    messageElement.innerHTML = `
        <div class="sender" style="font-weight: bold; font-size: 12px; margin-bottom: 5px; opacity: 0.9;">${message.senderName}${roleBadge}</div>
        <div style="margin-bottom: 5px; word-wrap: break-word;">${message.text}</div>
        <div class="timestamp" style="font-size: 10px; opacity: 0.7; text-align: right;">${timeString}</div>
    `;
    
    container.appendChild(messageElement);
}

function sendChannelMessage(channelId) {
    const channelMessageInput = document.getElementById('channelMessageInput');
    const text = channelMessageInput.value.trim();
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    
    if ((!text || text === '') && files.length === 0) {
        return;
    }
    
    const messageId = database.ref('channelMessages').push().key;
    const timestamp = Date.now();
    
    const messageData = {
        id: messageId,
        text: text,
        senderId: userId,
        senderName: currentUser,
        senderRole: userRoleInCurrentChannel,
        channelId: channelId,
        timestamp: timestamp
    };
    
    if (files.length > 0) {
        messageData.files = [];
        messageData.hasFiles = true;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            messageData.files.push({
                name: file.name,
                type: file.type,
                size: file.size,
                url: URL.createObjectURL(file)
            });
        }
    }
    
    database.ref('channelMessages/' + messageId).set(messageData)
        .then(() => {
            let lastMessage = text;
            if (files.length > 0) {
                if (text) {
                    lastMessage = `📎 ${text}`;
                } else {
                    lastMessage = `📎 ${files.length} файл(ов)`;
                }
            }
            
            database.ref('channels/' + channelId).update({
                lastMessage: lastMessage.length > 50 ? lastMessage.substring(0, 47) + '...' : lastMessage,
                lastMessageTime: timestamp
            });
            
            channelMessageInput.value = '';
            fileInput.value = '';
            const previewContainer = document.getElementById('filePreviewContainer');
            previewContainer.style.display = 'none';
            previewContainer.innerHTML = '';
            
            const sendBtn = document.getElementById('sendChannelMessageBtn');
            sendBtn.disabled = true;
            sendBtn.style.opacity = '0.7';
            sendBtn.style.transform = 'scale(0.95)';
        })
        .catch((error) => {
            console.error("❌ Ошибка отправки сообщения в канал:", error);
            showNotification("❌ Ошибка отправки сообщения");
        });
}

function handleFileSelect(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('filePreviewContainer');
    
    if (files.length === 0) return;
    
    previewContainer.style.display = 'block';
    previewContainer.innerHTML = '';
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileElement = document.createElement('div');
        fileElement.className = 'file-preview-item';
        fileElement.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px;
            background: var(--hover-color);
            border-radius: 8px;
            margin-bottom: 5px;
        `;
        
        const fileIcon = getFileIcon(file);
        const fileSize = formatFileSize(file.size);
        
        fileElement.innerHTML = `
            <div style="font-size: 20px; color: #4facfe;">${fileIcon}</div>
            <div style="flex: 1;">
                <div style="font-size: 12px; font-weight: bold;">${file.name}</div>
                <div style="font-size: 10px; opacity: 0.7;">${fileSize}</div>
            </div>
            <button class="remove-file-btn" data-file-index="${i}" style="background: none; border: none; color: #e74c3c; cursor: pointer; padding: 4px; border-radius: 4px;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        previewContainer.appendChild(fileElement);
    }
    
    document.querySelectorAll('.remove-file-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const fileIndex = parseInt(this.getAttribute('data-file-index'));
            removeFileFromPreview(fileIndex);
        });
    });
    
    const sendBtn = document.getElementById('sendChannelMessageBtn');
    const messageInput = document.getElementById('channelMessageInput');
    const hasText = messageInput.value.trim() !== '';
    const hasFiles = previewContainer.children.length > 0;
    sendBtn.disabled = !hasText && !hasFiles;
}

function removeFileFromPreview(fileIndex) {
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('filePreviewContainer');
    
    const dt = new DataTransfer();
    for (let i = 0; i < fileInput.files.length; i++) {
        if (i !== fileIndex) {
            dt.items.add(fileInput.files[i]);
        }
    }
    fileInput.files = dt.files;
    
    if (fileInput.files.length === 0) {
        previewContainer.style.display = 'none';
        previewContainer.innerHTML = '';
    } else {
        const event = new Event('change');
        fileInput.dispatchEvent(event);
    }
    
    const sendBtn = document.getElementById('sendChannelMessageBtn');
    const messageInput = document.getElementById('channelMessageInput');
    const hasText = messageInput.value.trim() !== '';
    const hasFiles = fileInput.files.length > 0;
    sendBtn.disabled = !hasText && !hasFiles;
}

function getFileIcon(file) {
    const type = file.type;
    const name = file.name.toLowerCase();
    
    if (type.startsWith('image/')) return '<i class="fas fa-image"></i>';
    if (type.startsWith('video/')) return '<i class="fas fa-video"></i>';
    if (type.startsWith('audio/')) return '<i class="fas fa-music"></i>';
    if (name.endsWith('.pdf')) return '<i class="fas fa-file-pdf"></i>';
    if (name.endsWith('.doc') || name.endsWith('.docx')) return '<i class="fas fa-file-word"></i>';
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return '<i class="fas fa-file-excel"></i>';
    if (name.endsWith('.ppt') || name.endsWith('.pptx')) return '<i class="fas fa-file-powerpoint"></i>';
    if (name.endsWith('.zip') || name.endsWith('.rar')) return '<i class="fas fa-file-archive"></i>';
    if (name.endsWith('.txt')) return '<i class="fas fa-file-alt"></i>';
    
    return '<i class="fas fa-file"></i>';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}