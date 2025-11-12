// contacts-system.js v1.0 - Полная система контактов для Quantum Messenger

class ContactsSystem {
    constructor() {
        this.contacts = {};
        this.init();
    }

    init() {
        this.loadContacts();
        this.addContactsMenuItem();
        this.setupEventListeners();
        this.setupChatsListObserver();
        console.log('Contacts System v1.0 initialized');
    }

    // Загрузка контактов из localStorage
    loadContacts() {
        const savedContacts = localStorage.getItem('quantumContacts');
        if (savedContacts) {
            this.contacts = JSON.parse(savedContacts);
        }
    }

    // Сохранение контактов в localStorage
    saveContacts() {
        localStorage.setItem('quantumContacts', JSON.stringify(this.contacts));
    }

    // Добавление пункта "Контакты" в меню
    addContactsMenuItem() {
        const burgerMenu = document.getElementById('burgerMenuContent');
        if (burgerMenu && !document.getElementById('contactsBtn')) {
            const contactsMenuItem = document.createElement('div');
            contactsMenuItem.className = 'burger-menu-item';
            contactsMenuItem.id = 'contactsBtn';
            contactsMenuItem.innerHTML = '<i class="fas fa-address-book"></i> Мои контакты';
            burgerMenu.insertBefore(contactsMenuItem, document.getElementById('themeBtn'));
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#contactsBtn')) {
                this.showContactsModal();
            }
            if (e.target.closest('#addToContactsBtn')) {
                this.showAddContactModal();
            }
        });
    }

    // Наблюдатель за списком чатов для обновления имен
    setupChatsListObserver() {
        const chatsList = document.getElementById('chatsList');
        if (chatsList) {
            this.observer = new MutationObserver(() => {
                this.updateChatsListNames();
            });
            this.observer.observe(chatsList, { childList: true, subtree: true });
        }
    }

    // Добавление пункта "Добавить в контакты" в меню чата
    addContactOptionToChatMenu() {
        const chatMenu = document.getElementById('chatMenuContent');
        if (chatMenu && !document.getElementById('addToContactsBtn')) {
            const addContactItem = document.createElement('div');
            addContactItem.className = 'chat-menu-item';
            addContactItem.id = 'addToContactsBtn';
            addContactItem.innerHTML = '<i class="fas fa-user-plus"></i> Добавить в контакты';
            
            const blockBtn = document.getElementById('blockUserBtn');
            if (blockBtn) {
                chatMenu.insertBefore(addContactItem, blockBtn);
            } else {
                chatMenu.appendChild(addContactItem);
            }
        }
    }

    // Показ модального окна для добавления контакта
    showAddContactModal() {
        if (!currentChatWith || !currentChatWithName) {
            showNotification("Нет активного чата для добавления в контакты");
            return;
        }

        this.createAddContactModal();
        document.getElementById('addContactModal').classList.add('active');
        document.getElementById('chatMenuContent').classList.remove('active');
    }

    // Создание модального окна добавления контакта
    createAddContactModal() {
        if (document.getElementById('addContactModal')) {
            document.getElementById('addContactModal').remove();
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'addContactModal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3 style="margin-bottom: 15px; text-align: center;">
                    <i class="fas fa-user-plus"></i> Добавить в контакты
                </h3>
                <div style="text-align: center; margin-bottom: 20px;">
                    <div class="user-avatar" style="width: 60px; height: 60px; margin: 0 auto 10px; background: ${this.generateColor(currentChatWith)}">
                        ${currentChatWithName.charAt(0).toUpperCase()}
                    </div>
                    <div style="font-size: 14px; opacity: 0.7; margin-bottom: 5px;">Оригинальное имя: ${currentChatWithName}</div>
                    <div style="font-size: 12px; opacity: 0.5;">ID: ${currentChatWith}</div>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Имя контакта:</label>
                    <input type="text" id="contactNameInput" class="auth-input" value="${currentChatWithName}" placeholder="Введите имя контакта">
                    <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                        <i class="fas fa-info-circle"></i> Можно полностью изменить имя
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn primary" id="saveContactBtn">
                        <i class="fas fa-save"></i> Сохранить контакт
                    </button>
                    <button class="modal-btn secondary" id="cancelContactBtn">Отмена</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Обработчики для модального окна
        document.getElementById('saveContactBtn').addEventListener('click', () => {
            this.saveContactFromModal();
        });

        document.getElementById('cancelContactBtn').addEventListener('click', () => {
            modal.classList.remove('active');
        });

        document.getElementById('contactNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveContactFromModal();
            }
        });

        // Фокусируемся на поле ввода
        setTimeout(() => {
            const input = document.getElementById('contactNameInput');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);

        // Закрытие при клике вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Сохранение контакта из модального окна
    saveContactFromModal() {
        const contactNameInput = document.getElementById('contactNameInput');
        if (!contactNameInput) return;

        const contactName = contactNameInput.value.trim();
        
        if (contactName === '') {
            showNotification("Имя контакта не может быть пустым");
            contactNameInput.focus();
            return;
        }

        this.addContact(currentChatWith, currentChatWithName, contactName);
        document.getElementById('addContactModal').classList.remove('active');
    }

    // Добавление контакта
    addContact(userId, originalName, contactName) {
        if (this.contacts[userId]) {
            if (confirm(`Контакт "${this.contacts[userId].name}" уже существует. Хотите обновить имя?`)) {
                this.contacts[userId].name = contactName;
                this.contacts[userId].originalName = originalName;
                this.saveContacts();
                showNotification(`✅ Контакт обновлен: ${contactName}`);
                this.updateAllDisplayNames(userId);
            }
            return;
        }

        this.contacts[userId] = {
            id: userId,
            name: contactName,
            originalName: originalName,
            addedAt: Date.now(),
            isContact: true
        };

        this.saveContacts();
        showNotification(`✅ Контакт добавлен: ${contactName}`);
        
        this.updateChatMenu();
        this.updateAllDisplayNames(userId);
    }

    // Удаление контакта
    removeContact(userId) {
        if (this.contacts[userId]) {
            const contactName = this.contacts[userId].name;
            delete this.contacts[userId];
            this.saveContacts();
            showNotification(`🗑️ Контакт удален: ${contactName}`);
            
            this.updateChatMenu();
            this.updateAllDisplayNames(userId);
            return true;
        }
        return false;
    }

    // Обновление всех отображаемых имен
    updateAllDisplayNames(userId) {
        this.updateChatDisplayName(userId);
        this.updateChatsListDisplayName(userId);
        this.updateSearchListDisplayName(userId);
    }

    // Обновление отображаемого имени в чате
    updateChatDisplayName(userId) {
        if (currentChatWith === userId) {
            const displayName = this.getDisplayName(userId);
            const chatUserName = document.getElementById('chatUserName');
            if (chatUserName) {
                chatUserName.textContent = displayName;
            }
            
            // Обновляем в модальном окне информации о чате
            const chatInfoName = document.getElementById('chatInfoName');
            if (chatInfoName && document.getElementById('chatInfoModal')?.classList.contains('active')) {
                chatInfoName.textContent = displayName;
            }
        }
    }

    // Обновление отображаемого имени в списке чатов
    updateChatsListDisplayName(userId) {
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(chatItem => {
            const chatId = chatItem.dataset.chatId;
            if (chatId && this.isUserInChat(chatId, userId)) {
                const displayName = this.getDisplayName(userId);
                const nameElement = chatItem.querySelector('.chat-item-name');
                if (nameElement && nameElement.textContent !== displayName) {
                    nameElement.textContent = displayName;
                }
            }
        });
    }

    // Обновление всех имен в списке чатов
    updateChatsListNames() {
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(chatItem => {
            const chatId = chatItem.dataset.chatId;
            if (chatId) {
                const otherUserId = this.getOtherUserIdFromChat(chatId);
                if (otherUserId && this.contacts[otherUserId]) {
                    const displayName = this.contacts[otherUserId].name;
                    const nameElement = chatItem.querySelector('.chat-item-name');
                    if (nameElement && nameElement.textContent !== displayName) {
                        nameElement.textContent = displayName;
                    }
                }
            }
        });
    }

    // Обновление отображаемого имени в списке поиска
    updateSearchListDisplayName(userId) {
        const userItems = document.querySelectorAll('.user-item');
        userItems.forEach(userItem => {
            const itemUserId = userItem.dataset.userId;
            if (itemUserId === userId) {
                const displayName = this.getDisplayName(userId);
                const nameElement = userItem.querySelector('.user-item-name');
                if (nameElement && nameElement.textContent !== displayName) {
                    nameElement.textContent = displayName;
                }
            }
        });
    }

    // Проверка, находится ли пользователь в чате
    isUserInChat(chatId, userId) {
        return chatId.includes(userId);
    }

    // Получение ID собеседника из ID чата
    getOtherUserIdFromChat(chatId) {
        const parts = chatId.split('_');
        if (parts.length === 3 && parts[0] === 'chat') {
            return parts[1] === userId ? parts[2] : parts[1];
        }
        return null;
    }

    // Получение отображаемого имени
    getDisplayName(userId) {
        return this.contacts[userId] ? this.contacts[userId].name : (currentChatWithName || '');
    }

    // Обновление меню чата
    updateChatMenu() {
        if (!currentChatWith) return;

        const addContactBtn = document.getElementById('addToContactsBtn');
        const removeContactBtn = document.getElementById('removeFromContactsBtn');
        const editContactBtn = document.getElementById('editContactBtn');

        if (this.contacts[currentChatWith]) {
            if (addContactBtn) addContactBtn.style.display = 'none';
            
            if (!removeContactBtn) {
                this.addRemoveContactOption();
            } else {
                removeContactBtn.style.display = 'flex';
            }

            if (!editContactBtn) {
                this.addEditContactOption();
            } else {
                editContactBtn.style.display = 'flex';
            }
        } else {
            if (addContactBtn) addContactBtn.style.display = 'flex';
            if (removeContactBtn) removeContactBtn.style.display = 'none';
            if (editContactBtn) editContactBtn.style.display = 'none';
        }
    }

    // Добавление пункта "Удалить из контактов"
    addRemoveContactOption() {
        const chatMenu = document.getElementById('chatMenuContent');
        if (chatMenu && !document.getElementById('removeFromContactsBtn')) {
            const removeContactItem = document.createElement('div');
            removeContactItem.className = 'chat-menu-item danger';
            removeContactItem.id = 'removeFromContactsBtn';
            removeContactItem.innerHTML = '<i class="fas fa-user-times"></i> Удалить из контактов';
            
            const blockBtn = document.getElementById('blockUserBtn');
            if (blockBtn) {
                chatMenu.insertBefore(removeContactItem, blockBtn);
            } else {
                chatMenu.appendChild(removeContactItem);
            }

            removeContactItem.addEventListener('click', () => {
                this.removeCurrentChatFromContacts();
            });
        }
    }

    // Добавление пункта "Изменить имя"
    addEditContactOption() {
        const chatMenu = document.getElementById('chatMenuContent');
        if (chatMenu && !document.getElementById('editContactBtn')) {
            const editContactItem = document.createElement('div');
            editContactItem.className = 'chat-menu-item';
            editContactItem.id = 'editContactBtn';
            editContactItem.innerHTML = '<i class="fas fa-edit"></i> Изменить имя контакта';
            
            const removeBtn = document.getElementById('removeFromContactsBtn');
            if (removeBtn) {
                chatMenu.insertBefore(editContactItem, removeBtn);
            } else {
                const blockBtn = document.getElementById('blockUserBtn');
                if (blockBtn) {
                    chatMenu.insertBefore(editContactItem, blockBtn);
                } else {
                    chatMenu.appendChild(editContactItem);
                }
            }

            editContactItem.addEventListener('click', () => {
                this.showEditContactModal();
            });
        }
    }

    // Показ модального окна для редактирования контакта
    showEditContactModal() {
        if (!currentChatWith || !this.contacts[currentChatWith]) {
            showNotification("Этот пользователь не в ваших контактах");
            return;
        }

        const currentContact = this.contacts[currentChatWith];
        this.createEditContactModal(currentContact);
        document.getElementById('editContactModal').classList.add('active');
        document.getElementById('chatMenuContent').classList.remove('active');
    }

    // Создание модального окна редактирования контакта
    createEditContactModal(contact) {
        if (document.getElementById('editContactModal')) {
            document.getElementById('editContactModal').remove();
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'editContactModal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3 style="margin-bottom: 15px; text-align: center;">
                    <i class="fas fa-edit"></i> Изменить контакт
                </h3>
                <div style="text-align: center; margin-bottom: 20px;">
                    <div class="user-avatar" style="width: 60px; height: 60px; margin: 0 auto 10px; background: ${this.generateColor(contact.id)}">
                        ${contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div style="font-size: 14px; opacity: 0.7; margin-bottom: 5px;">Оригинальное имя: ${contact.originalName}</div>
                    <div style="font-size: 12px; opacity: 0.5;">ID: ${contact.id}</div>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Имя контакта:</label>
                    <input type="text" id="editContactNameInput" class="auth-input" value="${contact.name}" placeholder="Введите имя контакта">
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn primary" id="updateContactBtn">
                        <i class="fas fa-save"></i> Сохранить изменения
                    </button>
                    <button class="modal-btn secondary" id="cancelEditContactBtn">Отмена</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('updateContactBtn').addEventListener('click', () => {
            this.updateContactFromModal(contact.id);
        });

        document.getElementById('cancelEditContactBtn').addEventListener('click', () => {
            modal.classList.remove('active');
        });

        document.getElementById('editContactNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.updateContactFromModal(contact.id);
            }
        });

        setTimeout(() => {
            const input = document.getElementById('editContactNameInput');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Обновление контакта из модального окна
    updateContactFromModal(userId) {
        const contactNameInput = document.getElementById('editContactNameInput');
        if (!contactNameInput) return;

        const newName = contactNameInput.value.trim();
        
        if (newName === '') {
            showNotification("Имя контакта не может быть пустым");
            contactNameInput.focus();
            return;
        }

        if (this.contacts[userId] && newName !== this.contacts[userId].name) {
            this.contacts[userId].name = newName;
            this.saveContacts();
            showNotification(`✅ Имя контакта изменено на: ${newName}`);
            this.updateAllDisplayNames(userId);
        }

        document.getElementById('editContactModal').classList.remove('active');
    }

    // Удаление текущего чата из контактов
    removeCurrentChatFromContacts() {
        if (!currentChatWith) {
            showNotification("Нет активного чата");
            return;
        }

        if (this.contacts[currentChatWith]) {
            const contactName = this.contacts[currentChatWith].name;
            if (confirm(`Удалить "${contactName}" из контактов?`)) {
                this.removeContact(currentChatWith);
            }
        }
    }

    // Проверка, является ли пользователь контактом
    isContact(userId) {
        return !!this.contacts[userId];
    }

    // Получение имени контакта
    getContactName(userId) {
        return this.contacts[userId] ? this.contacts[userId].name : null;
    }

    // Показ модального окна контактов
    showContactsModal() {
        this.createContactsModal();
        this.renderContactsList();
        document.getElementById('contactsModal').classList.add('active');
        document.getElementById('burgerMenuContent').classList.remove('active');
    }

    // Создание модального окна контактов
    createContactsModal() {
        if (document.getElementById('contactsModal')) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'contactsModal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3 style="margin-bottom: 15px; text-align: center;">
                    <i class="fas fa-address-book"></i> Мои контакты
                </h3>
                <div class="contacts-stats" style="text-align: center; margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <div style="font-size: 14px;">Всего контактов: <strong id="contactsCount">0</strong></div>
                </div>
                <div class="search-container" style="margin-bottom: 15px;">
                    <input type="text" id="contactsSearch" placeholder="Поиск контактов...">
                    <button id="clearContactsSearch">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="contacts-list" id="contactsList" style="max-height: 300px; overflow-y: auto;">
                    <div class="empty-chat">
                        <i class="fas fa-address-book"></i>
                        <p>У вас пока нет контактов</p>
                        <p style="font-size: 14px; margin-top: 10px;">Добавляйте пользователей через меню чата</p>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="closeContactsBtn">Закрыть</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('closeContactsBtn').addEventListener('click', () => {
            modal.classList.remove('active');
        });

        document.getElementById('contactsSearch').addEventListener('input', (e) => {
            this.filterContacts(e.target.value);
        });

        document.getElementById('clearContactsSearch').addEventListener('click', () => {
            document.getElementById('contactsSearch').value = '';
            this.filterContacts('');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Отображение списка контактов
    renderContactsList() {
        const contactsList = document.getElementById('contactsList');
        const contactsCount = document.getElementById('contactsCount');
        if (!contactsList) return;

        const contactIds = Object.keys(this.contacts);
        
        if (contactsCount) {
            contactsCount.textContent = contactIds.length;
        }
        
        if (contactIds.length === 0) {
            contactsList.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-address-book"></i>
                    <p>У вас пока нет контактов</p>
                    <p style="font-size: 14px; margin-top: 10px;">Добавляйте пользователей через меню чата</p>
                </div>
            `;
            return;
        }

        contactsList.innerHTML = '';

        const sortedContacts = contactIds.sort((a, b) => {
            return this.contacts[a].name.localeCompare(this.contacts[b].name);
        });

        sortedContacts.forEach(userId => {
            const contact = this.contacts[userId];
            const contactElement = document.createElement('div');
            contactElement.className = 'contact-item';
            contactElement.innerHTML = `
                <div class="contact-avatar" style="background: ${this.generateColor(userId)}">
                    ${contact.name.charAt(0).toUpperCase()}
                </div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-original">Исходное: ${contact.originalName}</div>
                    <div class="contact-date">Добавлен: ${new Date(contact.addedAt).toLocaleDateString()}</div>
                </div>
                <div class="contact-actions">
                    <button class="contact-action-btn chat-btn" data-userid="${userId}" title="Написать сообщение">
                        <i class="fas fa-comment"></i>
                    </button>
                    <button class="contact-action-btn edit-btn" data-userid="${userId}" title="Изменить имя">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="contact-action-btn remove-btn" data-userid="${userId}" title="Удалить из контактов">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            contactsList.appendChild(contactElement);
        });

        contactsList.querySelectorAll('.chat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.closest('.chat-btn').dataset.userid;
                this.startChatWithContact(userId);
            });
        });

        contactsList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.closest('.edit-btn').dataset.userid;
                this.editContactFromList(userId);
            });
        });

        contactsList.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.closest('.remove-btn').dataset.userid;
                this.removeContactFromList(userId);
            });
        });
    }

    // Фильтрация контактов
    filterContacts(searchTerm) {
        const contacts = document.querySelectorAll('.contact-item');
        const term = searchTerm.toLowerCase();

        contacts.forEach(contact => {
            const name = contact.querySelector('.contact-name').textContent.toLowerCase();
            const original = contact.querySelector('.contact-original').textContent.toLowerCase();
            
            if (name.includes(term) || original.includes(term)) {
                contact.style.display = 'flex';
            } else {
                contact.style.display = 'none';
            }
        });
    }

    // Начать чат с контактом
    startChatWithContact(userId) {
        const contact = this.contacts[userId];
        if (contact) {
            document.getElementById('contactsModal').classList.remove('active');
            openChat(userId, contact.originalName);
        }
    }

    // Редактирование контакта из списка
    editContactFromList(userId) {
        const contact = this.contacts[userId];
        if (contact) {
            this.createEditContactModal(contact);
            document.getElementById('editContactModal').classList.add('active');
        }
    }

    // Удаление контакта из списка
    removeContactFromList(userId) {
        const contact = this.contacts[userId];
        if (contact && confirm(`Удалить "${contact.name}" из контактов?`)) {
            this.removeContact(userId);
            this.renderContactsList();
        }
    }

    // Генерация цвета для аватара
    generateColor(userId) {
        const colors = ['#4facfe', '#00f2fe', '#a0d2eb', '#7fdbda', '#6a9bd8', '#ff6b6b', '#ffa726', '#66bb6a'];
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }
}

// Стили для системы контактов версии 1.0
const contactsStyles = `
<style>
.contact-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    margin-bottom: 8px;
    transition: all 0.3s ease;
    border: 1px solid transparent;
}

.contact-item:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.contact-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    margin-right: 12px;
    flex-shrink: 0;
    font-size: 16px;
}

.contact-info {
    flex: 1;
    min-width: 0;
}

.contact-name {
    font-weight: bold;
    margin-bottom: 4px;
    font-size: 14px;
    color: var(--text-color);
}

.contact-original {
    font-size: 11px;
    opacity: 0.7;
    margin-bottom: 2px;
}

.contact-date {
    font-size: 10px;
    opacity: 0.5;
}

.contact-actions {
    display: flex;
    gap: 5px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.contact-item:hover .contact-actions {
    opacity: 1;
}

.contact-action-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.2s ease;
}

.contact-action-btn.chat-btn {
    background: rgba(79, 172, 254, 0.2);
    color: #4facfe;
}

.contact-action-btn.edit-btn {
    background: rgba(255, 167, 38, 0.2);
    color: #ffa726;
}

.contact-action-btn.remove-btn {
    background: rgba(255, 107, 107, 0.2);
    color: #ff6b6b;
}

.contact-action-btn:hover {
    transform: scale(1.1);
    opacity: 0.9;
}

.light-theme .contact-item {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.1);
}

.light-theme .contact-item:hover {
    background: rgba(0, 0, 0, 0.08);
}

/* Стили для модальных окон контактов */
#addContactModal .modal-content,
#editContactModal .modal-content {
    max-width: 400px;
}

#contactNameInput,
#editContactNameInput {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--input-bg);
    color: var(--input-color);
    font-size: 14px;
    margin-bottom: 10px;
    transition: border-color 0.3s ease;
}

#contactNameInput:focus,
#editContactNameInput:focus {
    border-color: #4facfe;
    outline: none;
    box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
}

.contacts-stats {
    background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.1)) !important;
    border: 1px solid rgba(79, 172, 254, 0.2) !important;
}

/* Адаптивность */
@media (max-width: 480px) {
    .contact-item {
        padding: 10px;
    }
    
    .contact-avatar {
        width: 36px;
        height: 36px;
        font-size: 14px;
        margin-right: 10px;
    }
    
    .contact-name {
        font-size: 13px;
    }
    
    .contact-original {
        font-size: 10px;
    }
    
    .contact-actions {
        opacity: 1;
        flex-direction: column;
    }
    
    .contact-action-btn {
        width: 28px;
        height: 28px;
        font-size: 11px;
    }
}
</style>
`;

// Добавляем стили в документ
document.head.insertAdjacentHTML('beforeend', contactsStyles);

// Инициализация системы контактов
let contactsSystem;

document.addEventListener('DOMContentLoaded', function() {
    contactsSystem = new ContactsSystem();
    
    // Обновляем имена в списке чатов после загрузки
    setTimeout(() => {
        if (contactsSystem) {
            contactsSystem.updateChatsListNames();
        }
    }, 2000);
});

// Функция для обновления меню чата
function updateChatMenuForContacts() {
    if (contactsSystem) {
        contactsSystem.addContactOptionToChatMenu();
        contactsSystem.updateChatMenu();
        
        if (currentChatWith) {
            const displayName = contactsSystem.getDisplayName(currentChatWith);
            const chatUserName = document.getElementById('chatUserName');
            if (chatUserName && chatUserName.textContent !== displayName) {
                chatUserName.textContent = displayName;
            }
        }
    }
}

// Переопределяем функцию openChat
const originalOpenChat = window.openChat;
window.openChat = function(userId, userName, chatId) {
    originalOpenChat(userId, userName, chatId);
    setTimeout(updateChatMenuForContacts, 100);
};

// Переопределяем функцию backToChats для исправления бага с клавиатурой
const originalBackToChats = window.backToChats;
window.backToChats = function() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.blur();
    }
    
    originalBackToChats();
    
    const removeContactBtn = document.getElementById('removeFromContactsBtn');
    const editContactBtn = document.getElementById('editContactBtn');
    if (removeContactBtn) removeContactBtn.style.display = 'none';
    if (editContactBtn) editContactBtn.style.display = 'none';
};

// Функция для получения отображаемого имени
function getContactDisplayName(userId, originalName) {
    if (contactsSystem && contactsSystem.isContact(userId)) {
        return contactsSystem.getContactName(userId);
    }
    return originalName;
}

// Переопределяем функцию loadChatsList для обновления имен контактов
const originalLoadChatsList = window.loadChatsList;
window.loadChatsList = function() {
    originalLoadChatsList();
    
    // Обновляем имена контактов после загрузки списка чатов
    setTimeout(() => {
        if (contactsSystem) {
            contactsSystem.updateChatsListNames();
        }
    }, 500);
};

// Переопределяем функцию performSearch для обновления имен в поиске
const originalPerformSearch = window.performSearch;
window.performSearch = function() {
    originalPerformSearch();
    
    // Обновляем имена контактов после поиска
    setTimeout(() => {
        if (contactsSystem) {
            const userItems = document.querySelectorAll('.user-item');
            userItems.forEach(userItem => {
                const itemUserId = userItem.dataset.userId;
                if (itemUserId && contactsSystem.isContact(itemUserId)) {
                    const displayName = contactsSystem.getContactName(itemUserId);
                    const nameElement = userItem.querySelector('.user-item-name');
                    if (nameElement && nameElement.textContent !== displayName) {
                        nameElement.textContent = displayName;
                    }
                }
            });
        }
    }, 500);
};

// Глобальная функция для обновления всех имен (можно вызвать из консоли)
window.updateAllContactNames = function() {
    if (contactsSystem) {
        Object.keys(contactsSystem.contacts).forEach(userId => {
            contactsSystem.updateAllDisplayNames(userId);
        });
        contactsSystem.updateChatsListNames();
        showNotification("✅ Все имена контактов обновлены");
    }
};

console.log('✅ Contacts System v1.0 loaded successfully');