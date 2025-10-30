// Saved Messages System for Quantum Messenger - FIXED
class SavedMessages {
    constructor() {
        this.savedMessages = new Map();
        this.savedChatId = 'saved_messages_' + userId;
        this.init();
    }

    init() {
        this.loadSavedMessages();
        this.createSavedMessagesChat();
        this.addToMenu();
        this.setupSaveButtons();
        console.log("Saved Messages system initialized");
    }

    // Create Saved Messages chat
    createSavedMessagesChat() {
        const savedChatRef = database.ref('chats/' + this.savedChatId);
        
        savedChatRef.once('value').then((snapshot) => {
            if (!snapshot.exists()) {
                savedChatRef.set({
                    id: this.savedChatId,
                    participants: {
                        [userId]: {
                            id: userId,
                            name: currentUser,
                            joinedAt: Date.now()
                        }
                    },
                    createdAt: Date.now(),
                    lastMessage: "Сохраненные сообщения",
                    lastMessageTime: Date.now(),
                    isSavedMessages: true,
                    name: "Сохраненные сообщения"
                });
            }
        });

        // Add to chats list without breaking existing functionality
        this.addSavedMessagesToChatsList();
    }

    // Add Saved Messages to chats list WITHOUT overriding functions
    addSavedMessagesToChatsList() {
        // Simply add the item when chats list loads
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const chatsList = document.getElementById('chatsList');
                    if (chatsList && !document.getElementById('saved-messages-item')) {
                        this.addSavedMessagesItem();
                    }
                }
            });
        });

        const chatsList = document.getElementById('chatsList');
        if (chatsList) {
            observer.observe(chatsList, { childList: true, subtree: true });
        }
        
        // Also try to add immediately
        setTimeout(() => {
            this.addSavedMessagesItem();
        }, 1000);
    }

    // Add Saved Messages item to chats list
    addSavedMessagesItem() {
        const chatsList = document.getElementById('chatsList');
        if (!chatsList || document.getElementById('saved-messages-item')) return;

        const savedItem = document.createElement('div');
        savedItem.className = 'chat-item saved-messages-item';
        savedItem.id = 'saved-messages-item';
        savedItem.dataset.chatId = this.savedChatId;

        const messageCount = this.savedMessages.size;
        const lastSaved = this.getLastSavedTime();

        savedItem.innerHTML = `
            <div class="chat-item-avatar" style="background: #4facfe;">
                <i class="fas fa-bookmark"></i>
            </div>
            <div class="chat-item-info">
                <div class="chat-item-header">
                    <div class="chat-item-name">Сохраненные сообщения</div>
                    <div class="chat-item-time">${lastSaved}</div>
                </div>
                <div class="chat-item-last-message">
                    ${messageCount > 0 ? `${messageCount} сохраненных сообщений` : 'Сохраняйте важные сообщения'}
                </div>
            </div>
        `;

        savedItem.addEventListener('click', () => {
            this.openSavedMessages();
        });

        // Insert at the top
        if (chatsList.firstChild) {
            chatsList.insertBefore(savedItem, chatsList.firstChild);
        } else {
            chatsList.appendChild(savedItem);
        }
    }

    // Open Saved Messages
    openSavedMessages() {
        // Create a simple chat opening without affecting existing functions
        const chatData = {
            id: this.savedChatId,
            participants: {
                [userId]: {
                    id: userId,
                    name: currentUser
                }
            },
            name: "Сохраненные сообщения"
        };

        // Use existing openChat function if available
        if (typeof openChat === 'function') {
            openChat(userId, "Сохраненные сообщения", this.savedChatId);
        } else {
            this.showSavedMessagesChat();
        }
    }

    // Show Saved Messages chat
    showSavedMessagesChat() {
        // Hide other views
        if (document.getElementById('chatWrapper')) {
            document.getElementById('chatWrapper').style.display = 'none';
        }
        if (document.getElementById('chatWindow')) {
            document.getElementById('chatWindow').style.display = 'flex';
        }

        // Set chat header
        if (document.getElementById('chatUserName')) {
            document.getElementById('chatUserName').textContent = "Сохраненные сообщения";
        }
        if (document.getElementById('chatAvatarInitial')) {
            document.getElementById('chatAvatarInitial').innerHTML = '<i class="fas fa-bookmark"></i>';
        }
        if (document.getElementById('chatUserAvatar')) {
            document.getElementById('chatUserAvatar').style.background = '#4facfe';
        }
        if (document.getElementById('chatUserStatus')) {
            document.getElementById('chatUserStatus').textContent = '';
        }

        // Load saved messages
        this.loadSavedMessagesChat();
    }

    // Load messages in Saved Messages chat
    loadSavedMessagesChat() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';

        if (this.savedMessages.size === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-bookmark" style="color: #4facfe;"></i>
                    <p>Сохраненные сообщения</p>
                    <p style="font-size: 14px; margin-top: 10px;">
                        Сохраняйте важные сообщения, медиафайлы и заметки<br>
                        Они будут доступны на всех ваших устройствах
                    </p>
                </div>
            `;
            return;
        }

        // Display saved messages
        const sortedMessages = Array.from(this.savedMessages.values())
            .sort((a, b) => b.timestamp - a.timestamp);

        sortedMessages.forEach(message => {
            this.addSavedMessageToChat(message, messagesContainer);
        });

        this.scrollToBottom();
    }

    // Add saved message to chat view
    addSavedMessageToChat(message, container) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message saved-message';
        messageElement.dataset.messageId = message.id;

        const date = new Date(message.timestamp);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageElement.innerHTML = `
            <div class="saved-message-header">
                <i class="fas fa-bookmark" style="color: #4facfe; margin-right: 5px;"></i>
                <span style="font-size: 11px; color: #a0d2eb;">
                    Сохранено ${date.toLocaleDateString()} в ${timeString}
                </span>
                <button class="unsave-btn" onclick="savedMessages.unsaveMessage('${message.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="message-content">
                ${this.formatMessageContent(message)}
            </div>
            ${message.originalChat ? `
                <div class="saved-message-source">
                    Из чата: ${message.originalChat}
                </div>
            ` : ''}
        `;

        container.appendChild(messageElement);
    }

    // Format message content for display
    formatMessageContent(message) {
        if (message.type === 'text') {
            return `<div class="message-text">${message.text}</div>`;
        } else if (message.type === 'forward') {
            return `
                <div class="forwarded-message">
                    <div class="forward-header">
                        <i class="fas fa-share"></i>
                        Переслано от ${message.originalSender}
                    </div>
                    <div class="forward-content">${message.text}</div>
                </div>
            `;
        } else if (message.type === 'media') {
            return `
                <div class="saved-media">
                    <i class="fas fa-image"></i>
                    Медиафайл: ${message.filename || 'Изображение'}
                </div>
            `;
        }
        
        return `<div class="message-text">${message.text}</div>`;
    }

    // Save a message
    saveMessage(messageData) {
        const messageId = 'saved_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const savedMessage = {
            id: messageId,
            type: messageData.type || 'text',
            text: messageData.text,
            originalSender: messageData.senderName,
            originalChat: messageData.chatName,
            timestamp: Date.now(),
            savedAt: Date.now(),
            ...messageData
        };

        this.savedMessages.set(messageId, savedMessage);
        this.saveToStorage();
        
        // Update UI
        this.updateSavedMessagesItem();
        this.showNotification('Сообщение сохранено');
        
        return messageId;
    }

    // Unsave a message
    unsaveMessage(messageId) {
        if (this.savedMessages.has(messageId)) {
            this.savedMessages.delete(messageId);
            this.saveToStorage();
            
            // Update UI
            this.updateSavedMessagesItem();
            
            // Reload chat if open
            if (document.getElementById('chatUserName') && 
                document.getElementById('chatUserName').textContent === "Сохраненные сообщения") {
                this.loadSavedMessagesChat();
            }
            
            this.showNotification('Сообщение удалено из сохраненных');
        }
    }

    // Setup save buttons without breaking existing functionality
    setupSaveButtons() {
        // Add save buttons to existing messages
        this.addSaveButtonsToExistingMessages();
        
        // Watch for new messages
        this.watchForNewMessages();
    }

    // Add save buttons to existing messages
    addSaveButtonsToExistingMessages() {
        setTimeout(() => {
            const messages = document.querySelectorAll('.message');
            messages.forEach(message => {
                this.addSaveButtonToMessageElement(message);
            });
        }, 2000);
    }

    // Watch for new messages being added
    watchForNewMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.classList && node.classList.contains('message')) {
                                this.addSaveButtonToMessageElement(node);
                            }
                        });
                    }
                });
            });

            observer.observe(messagesContainer, { childList: true, subtree: true });
        }
    }

    // Add save button to message element
    addSaveButtonToMessageElement(messageElement) {
        // Don't add to saved messages or if already has button
        if (messageElement.classList.contains('saved-message') || 
            messageElement.querySelector('.save-message-btn')) {
            return;
        }

        const messageText = messageElement.querySelector('.message-text') || 
                           messageElement.querySelector('div:not(.timestamp)');
        
        if (messageText && messageText.textContent.trim()) {
            const saveBtn = document.createElement('button');
            saveBtn.className = 'save-message-btn';
            saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
            saveBtn.title = 'Сохранить сообщение';
            saveBtn.onclick = (e) => {
                e.stopPropagation();
                this.saveMessage({
                    type: 'text',
                    text: messageText.textContent,
                    senderName: 'Вы',
                    chatName: document.getElementById('chatUserName') ? 
                              document.getElementById('chatUserName').textContent : 'Чат'
                });
            };
            
            messageElement.style.position = 'relative';
            saveBtn.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: rgba(79, 172, 254, 0.9);
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                color: white;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                z-index: 10;
            `;
            
            messageElement.appendChild(saveBtn);
            
            // Show on hover
            messageElement.addEventListener('mouseenter', () => {
                saveBtn.style.opacity = '1';
            });
            messageElement.addEventListener('mouseleave', () => {
                saveBtn.style.opacity = '0';
            });
        }
    }

    // Add to burger menu
    addToMenu() {
        const burgerMenu = document.getElementById('burgerMenuContent');
        if (burgerMenu && !document.getElementById('savedMessagesMenuBtn')) {
            const menuItem = document.createElement('div');
            menuItem.className = 'burger-menu-item';
            menuItem.id = 'savedMessagesMenuBtn';
            menuItem.innerHTML = `
                <i class="fas fa-bookmark"></i> Сохраненные сообщения
            `;
            
            menuItem.addEventListener('click', () => {
                this.openSavedMessages();
                burgerMenu.classList.remove('active');
            });
            
            // Insert after profile button
            const profileBtn = document.getElementById('profileBtn');
            if (profileBtn) {
                profileBtn.parentNode.insertBefore(menuItem, profileBtn.nextSibling);
            } else {
                burgerMenu.appendChild(menuItem);
            }
        }
    }

    // Update Saved Messages item in chats list
    updateSavedMessagesItem() {
        const savedItem = document.getElementById('saved-messages-item');
        if (savedItem) {
            const messageCount = this.savedMessages.size;
            const lastSaved = this.getLastSavedTime();
            
            const lastMessage = savedItem.querySelector('.chat-item-last-message');
            const time = savedItem.querySelector('.chat-item-time');
            
            if (lastMessage) {
                lastMessage.textContent = messageCount > 0 ? 
                    `${messageCount} сохраненных сообщений` : 
                    'Сохраняйте важные сообщения';
            }
            if (time) {
                time.textContent = lastSaved;
            }
        }
    }

    // Get last saved time
    getLastSavedTime() {
        if (this.savedMessages.size === 0) return '';

        const lastMessage = Array.from(this.savedMessages.values())
            .reduce((latest, msg) => msg.savedAt > latest.savedAt ? msg : latest);
        
        const now = new Date();
        const savedTime = new Date(lastMessage.savedAt);
        const diff = now - savedTime;

        if (diff < 60000) return 'только что';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' мин';
        if (diff < 86400000) return savedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return savedTime.toLocaleDateString();
    }

    // Scroll to bottom
    scrollToBottom() {
        setTimeout(() => {
            const container = document.getElementById('messagesContainer');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 100);
    }

    // Load from storage
    loadSavedMessages() {
        try {
            const saved = localStorage.getItem('quantumSavedMessages_' + userId);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.savedMessages = new Map(parsed);
            }
        } catch (error) {
            console.error('Error loading saved messages:', error);
            this.savedMessages = new Map();
        }
    }

    // Save to storage
    saveToStorage() {
        try {
            const toSave = Array.from(this.savedMessages.entries());
            localStorage.setItem('quantumSavedMessages_' + userId, JSON.stringify(toSave));
        } catch (error) {
            console.error('Error saving messages:', error);
        }
    }

    // Show notification
    showNotification(message) {
        if (typeof showNotification === 'function') {
            showNotification(message);
        } else {
            // Simple fallback
            console.log('Notification:', message);
        }
    }
}

// Initialize when ready - SAFE VERSION
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure everything is loaded
    setTimeout(() => {
        if (typeof userId !== 'undefined' && typeof database !== 'undefined') {
            window.savedMessages = new SavedMessages();
        }
    }, 3000);
});

// Add styles
const savedMessagesStyles = `
    .saved-messages-item {
        border-left: 3px solid #4facfe;
        background: rgba(79, 172, 254, 0.05) !important;
    }
    
    .saved-messages-item .chat-item-avatar {
        background: #4facfe !important;
    }
    
    .saved-message {
        background: rgba(79, 172, 254, 0.1) !important;
        border: 1px solid rgba(79, 172, 254, 0.2);
        margin-bottom: 10px;
    }
    
    .saved-message-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        padding-bottom: 5px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .unsave-btn {
        background: rgba(255, 71, 87, 0.2);
        border: none;
        border-radius: 3px;
        color: #ff4757;
        padding: 3px 6px;
        cursor: pointer;
        font-size: 10px;
    }
    
    .unsave-btn:hover {
        background: rgba(255, 71, 87, 0.3);
    }
    
    .saved-message-source {
        font-size: 10px;
        color: #a0d2eb;
        margin-top: 5px;
        font-style: italic;
    }
    
    .forwarded-message {
        background: rgba(160, 210, 235, 0.1);
        border-left: 2px solid #a0d2eb;
        padding: 8px;
        border-radius: 5px;
    }
    
    .forward-header {
        font-size: 11px;
        color: #a0d2eb;
        margin-bottom: 5px;
    }
    
    .save-message-btn:hover {
        background: #4facfe !important;
        transform: scale(1.1);
    }
`;

// Add styles safely
if (document.head) {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = savedMessagesStyles;
    document.head.appendChild(styleSheet);
}