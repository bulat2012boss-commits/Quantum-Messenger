// scheduled-messages.js - Простая рабочая версия

class ScheduledMessages {
    constructor() {
        this.scheduledMessages = [];
        this.init();
    }

    init() {
        this.loadScheduledMessages();
        this.addButtonToMenu();
        this.createModal();
        this.startChecker();
    }

    addButtonToMenu() {
        // Ждем пока меню загрузится
        const checkMenu = () => {
            const chatMenu = document.getElementById('chatMenuContent');
            if (chatMenu && !document.getElementById('scheduleMessageBtn')) {
                const button = document.createElement('div');
                button.className = 'chat-menu-item';
                button.id = 'scheduleMessageBtn';
                button.innerHTML = '<i class="fas fa-clock"></i> Запланировать сообщение';
                
                const clearBtn = document.getElementById('clearChatBtn');
                if (clearBtn) {
                    chatMenu.insertBefore(button, clearBtn);
                } else {
                    chatMenu.appendChild(button);
                }

                button.addEventListener('click', () => {
                    this.showModal();
                });
            } else if (!chatMenu) {
                setTimeout(checkMenu, 100);
            }
        };
        checkMenu();
    }

    createModal() {
        if (document.getElementById('scheduleModal')) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'scheduleModal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Запланировать сообщение</h3>
                <textarea id="scheduleText" placeholder="Введите сообщение..." style="width:100%; height:80px; margin:10px 0; padding:10px;"></textarea>
                <div style="display:flex; gap:10px; margin:10px 0;">
                    <input type="datetime-local" id="scheduleTime" style="flex:1; padding:8px;">
                </div>
                <button id="confirmSchedule" style="width:100%; padding:10px; background:#4facfe; color:white; border:none; border-radius:5px;">Запланировать</button>
                <button id="closeSchedule" style="width:100%; padding:10px; background:#666; color:white; border:none; border-radius:5px; margin-top:5px;">Отмена</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('confirmSchedule').addEventListener('click', () => {
            this.scheduleMessage();
        });

        document.getElementById('closeSchedule').addEventListener('click', () => {
            this.hideModal();
        });

        // Закрытие по клику вне модалки
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    }

    showModal() {
        const modal = document.getElementById('scheduleModal');
        const now = new Date();
        now.setMinutes(now.getMinutes() + 5);
        
        document.getElementById('scheduleTime').value = now.toISOString().slice(0, 16);
        document.getElementById('scheduleText').value = '';
        
        modal.classList.add('active');
        document.getElementById('chatMenuContent').classList.remove('active');
    }

    hideModal() {
        document.getElementById('scheduleModal').classList.remove('active');
    }

    scheduleMessage() {
        const text = document.getElementById('scheduleText').value.trim();
        const time = document.getElementById('scheduleTime').value;

        if (!text) {
            alert('Введите сообщение');
            return;
        }

        if (!time) {
            alert('Выберите время');
            return;
        }

        const timestamp = new Date(time).getTime();
        if (timestamp < Date.now()) {
            alert('Выберите время в будущем');
            return;
        }

        const message = {
            id: 'sched_' + Date.now(),
            text: text,
            timestamp: timestamp,
            chatId: window.currentChatId,
            chatName: window.currentChatWithName
        };

        this.scheduledMessages.push(message);
        this.saveScheduledMessages();
        
        alert(`Сообщение запланировано на ${new Date(timestamp).toLocaleString()}`);
        this.hideModal();
    }

    loadScheduledMessages() {
        const saved = localStorage.getItem('quantumScheduled');
        if (saved) {
            this.scheduledMessages = JSON.parse(saved);
        }
    }

    saveScheduledMessages() {
        localStorage.setItem('quantumScheduled', JSON.stringify(this.scheduledMessages));
    }

    startChecker() {
        // Проверяем каждую секунду
        setInterval(() => {
            this.checkMessages();
        }, 1000);
    }

    checkMessages() {
        const now = Date.now();
        const toSend = this.scheduledMessages.filter(msg => msg.timestamp <= now);

        toSend.forEach(msg => {
            this.sendMessage(msg);
            // Удаляем отправленное сообщение
            this.scheduledMessages = this.scheduledMessages.filter(m => m.id !== msg.id);
        });

        if (toSend.length > 0) {
            this.saveScheduledMessages();
        }
    }

    sendMessage(scheduledMsg) {
        console.log('Отправка запланированного сообщения:', scheduledMsg);
        
        // Просто используем текущую систему отправки сообщений
        if (window.currentChatId === scheduledMsg.chatId) {
            // Если мы в том же чате - отправляем напрямую
            const input = document.getElementById('messageInput');
            const sendBtn = document.getElementById('sendBtn');
            
            if (input && sendBtn) {
                input.value = scheduledMsg.text;
                sendBtn.disabled = false;
                sendBtn.click();
            }
        } else {
            // Если не в том чате - отправляем через Firebase
            this.sendViaFirebase(scheduledMsg);
        }
        
        // Показываем уведомление
        this.showNotification(`Отправлено запланированное сообщение в ${scheduledMsg.chatName}`);
    }

    sendViaFirebase(scheduledMsg) {
        if (!window.database || !window.userId || !window.currentUser) return;

        try {
            const messageId = window.database.ref('messages').push().key;
            const messageData = {
                id: messageId,
                text: scheduledMsg.text,
                senderId: window.userId,
                senderName: window.currentUser,
                receiverId: this.getReceiverId(scheduledMsg.chatId),
                receiverName: scheduledMsg.chatName,
                timestamp: Date.now(),
                chatId: scheduledMsg.chatId,
                read: false
            };

            window.database.ref('messages/' + messageId).set(messageData);

            // Обновляем чат
            window.database.ref('chats/' + scheduledMsg.chatId).update({
                lastMessage: scheduledMsg.text,
                lastMessageTime: Date.now()
            });

        } catch (error) {
            console.error('Ошибка отправки:', error);
        }
    }

    getReceiverId(chatId) {
        if (!chatId || !window.userId) return null;
        const parts = chatId.split('_');
        return parts[1] === window.userId ? parts[2] : parts[1];
    }

    showNotification(message) {
        // Простое уведомление
        if (window.showNotification) {
            window.showNotification(message);
        } else {
            console.log('Notification:', message);
        }
    }
}

// Запускаем сразу
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.scheduledMessages = new ScheduledMessages();
        console.log('Scheduled messages system started');
    }, 1000);
});