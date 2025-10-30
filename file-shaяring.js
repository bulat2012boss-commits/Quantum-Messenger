// photo-sharing.js
// Добавление возможности отправки фотографий

let selectedFiles = []; // Глобальный массив для хранения выбранных файлов

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initPhotoSharing, 1000);
});

function initPhotoSharing() {
    console.log('📸 Photo Sharing активирован');
    
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const inputArea = document.querySelector('.input-area');
    
    if (!messageInput || !sendBtn || !inputArea) {
        console.error('❌ Не найдены необходимые элементы DOM');
        return;
    }
    
    // Создаем кнопку для загрузки фото
    const photoBtn = document.createElement('button');
    photoBtn.id = 'photoBtn';
    photoBtn.innerHTML = '<i class="fas fa-camera"></i>';
    photoBtn.title = 'Добавить фото';
    photoBtn.style.cssText = `
        padding: 10px 12px;
        background: linear-gradient(to right, #ff6b6b, #ffa500);
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, opacity 0.2s;
        width: 42px;
        height: 42px;
    `;
    
    // Добавляем кнопку перед полем ввода
    inputArea.insertBefore(photoBtn, messageInput);
    
    // Создаем скрытый input для выбора файлов
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    fileInput.id = 'fileInput';
    document.body.appendChild(fileInput);
    
    // Создаем контейнер для превью фотографий
    const previewContainer = document.createElement('div');
    previewContainer.id = 'photoPreviewContainer';
    previewContainer.style.cssText = `
        display: none;
        padding: 10px;
        background: var(--other-msg-bg);
        border-radius: 10px;
        margin-bottom: 10px;
        border: 1px solid var(--border-color);
        max-width: 100%;
    `;
    
    // Вставляем контейнер превью перед областью ввода
    inputArea.parentNode.insertBefore(previewContainer, inputArea);
    
    // Обработчики событий
    photoBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Модифицируем обработчик отправки сообщения
    modifySendMessageHandler();
    
    // Добавляем стили
    addPhotoSharingStyles();
    
    console.log('✅ Кнопка камеры добавлена');
}

function handleFileSelect(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('photoPreviewContainer');
    
    if (files.length === 0) return;
    
    // Сохраняем выбранные файлы
    selectedFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (selectedFiles.length === 0) {
        showNotification("Выберите изображения (JPEG, PNG, GIF)");
        return;
    }
    
    previewContainer.style.display = 'block';
    previewContainer.innerHTML = `
        <div style="margin-bottom: 8px; font-size: 12px; opacity: 0.7;">
            Выбрано фото: ${selectedFiles.length}
        </div>
    `;
    
    const photosGrid = document.createElement('div');
    photosGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
        gap: 8px;
        margin-bottom: 10px;
    `;
    
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-preview-item';
            photoItem.style.cssText = `
                position: relative;
                width: 60px;
                height: 60px;
                border-radius: 8px;
                overflow: hidden;
                border: 2px solid var(--border-color);
                background: var(--input-bg);
            `;
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;
            img.dataset.fileIndex = index;
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.style.cssText = `
                position: absolute;
                top: 2px;
                right: 2px;
                background: rgba(255, 107, 107, 0.9);
                color: white;
                border: none;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
            `;
            
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Удаляем файл из массива
                selectedFiles.splice(index, 1);
                // Удаляем превью
                photoItem.remove();
                
                // Обновляем счетчик
                const counter = previewContainer.querySelector('div');
                if (counter) {
                    counter.textContent = `Выбрано фото: ${selectedFiles.length}`;
                }
                
                // Скрываем контейнер если файлов нет
                if (selectedFiles.length === 0) {
                    previewContainer.style.display = 'none';
                    previewContainer.innerHTML = '';
                }
            });
            
            photoItem.appendChild(img);
            photoItem.appendChild(removeBtn);
            photosGrid.appendChild(photoItem);
        };
        
        reader.readAsDataURL(file);
    });
    
    previewContainer.appendChild(photosGrid);
    
    // Кнопка очистки
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Очистить все';
    clearBtn.style.cssText = `
        padding: 5px 10px;
        background: rgba(255, 107, 107, 0.2);
        color: var(--text-color);
        border: 1px solid var(--border-color);
        border-radius: 15px;
        cursor: pointer;
        font-size: 12px;
        margin-top: 5px;
    `;
    
    clearBtn.addEventListener('click', () => {
        selectedFiles = [];
        previewContainer.style.display = 'none';
        previewContainer.innerHTML = '';
        document.getElementById('fileInput').value = '';
    });
    
    previewContainer.appendChild(clearBtn);
    
    showNotification(`Загружено ${selectedFiles.length} фото`);
}

function modifySendMessageHandler() {
    // Сохраняем оригинальную функцию
    const originalSendMessage = window.sendMessage;
    
    // Переопределяем функцию отправки
    window.sendMessage = function() {
        if (selectedFiles.length > 0) {
            sendMessageWithPhotos();
        } else {
            // Используем оригинальную функцию для текстовых сообщений
            if (typeof originalSendMessage === 'function') {
                originalSendMessage();
            } else {
                // Резервная функция, если оригинальная не найдена
                sendTextMessage();
            }
        }
    };
}

function sendMessageWithPhotos() {
    const messageInput = document.getElementById('messageInput');
    const text = messageInput.value.trim();
    
    if (!currentChatWith) {
        showNotification("Выберите чат для отправки сообщения");
        return;
    }
    
    if (selectedFiles.length === 0) {
        showNotification("Сначала выберите фото");
        return;
    }
    
    const messageId = database.ref('messages').push().key;
    const timestamp = Date.now();
    const chatId = currentChatId || generateChatId(currentChatWith);
    
    // Конвертируем все файлы в DataURL
    const photoPromises = selectedFiles.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    dataUrl: e.target.result
                });
            };
            reader.readAsDataURL(file);
        });
    });
    
    Promise.all(photoPromises).then(photosData => {
        const messageData = {
            id: messageId,
            text: text,
            senderId: userId,
            senderName: currentUser,
            receiverId: currentChatWith,
            receiverName: currentChatWithName,
            timestamp: timestamp,
            chatId: chatId,
            read: false,
            hasPhotos: true,
            photos: photosData.map(photo => photo.dataUrl),
            type: 'photo',
            photoCount: photosData.length
        };
        
        // Сохраняем сообщение в базе данных
        database.ref('messages/' + messageId).set(messageData)
            .then(() => {
                // Обновляем информацию о чате
                const lastMessageText = `📷 ${photosData.length} фото${text ? ' + текст' : ''}`;
                
                updateChatInfo(chatId, lastMessageText, timestamp);
                
                // Очищаем поле ввода и превью
                cleanupAfterSend();
                
                showNotification(`Отправлено ${photosData.length} фото!`);
            })
            .catch((error) => {
                console.error("Ошибка отправки фото:", error);
                showNotification("Ошибка отправки фото");
            });
    });
}

function sendTextMessage() {
    const messageInput = document.getElementById('messageInput');
    const text = messageInput.value.trim();
    
    if (!text || !currentChatWith) return;
    
    const messageId = database.ref('messages').push().key;
    const timestamp = Date.now();
    const chatId = currentChatId || generateChatId(currentChatWith);
    
    const messageData = {
        id: messageId,
        text: text,
        senderId: userId,
        senderName: currentUser,
        receiverId: currentChatWith,
        receiverName: currentChatWithName,
        timestamp: timestamp,
        chatId: chatId,
        read: false,
        type: 'text'
    };
    
    database.ref('messages/' + messageId).set(messageData)
        .then(() => {
            updateChatInfo(chatId, text, timestamp);
            cleanupAfterSend();
        })
        .catch((error) => {
            console.error("Ошибка отправки сообщения:", error);
            showNotification("Ошибка отправки сообщения");
        });
}

function cleanupAfterSend() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const previewContainer = document.getElementById('photoPreviewContainer');
    const fileInput = document.getElementById('fileInput');
    
    // Очищаем все
    messageInput.value = '';
    sendBtn.disabled = true;
    selectedFiles = [];
    
    if (previewContainer) {
        previewContainer.style.display = 'none';
        previewContainer.innerHTML = '';
    }
    
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Прокручиваем вниз
    scrollToBottom();
}

function updateChatInfo(chatId, lastMessage, timestamp) {
    const chatUpdate = {
        lastMessage: lastMessage,
        lastMessageTime: timestamp
    };
    
    database.ref('chats/' + chatId).update(chatUpdate);
}

function generateChatId(otherUserId) {
    const ids = [userId, otherUserId].sort();
    return `chat_${ids[0]}_${ids[1]}`;
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }
}

function addPhotoSharingStyles() {
    const styles = `
        #photoBtn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
        }
        
        .photo-preview-item {
            transition: transform 0.2s;
            position: relative;
        }
        
        .photo-preview-item:hover {
            transform: scale(1.05);
        }
        
        .photo-preview-item img {
            cursor: pointer;
        }
        
        /* Стили для отображения фото в чате */
        .message-with-photos {
            position: relative;
            max-width: 85%;
        }
        
        .message-photos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 8px;
            margin: 8px 0;
        }
        
        .message-photo-item {
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--border-color);
            background: var(--other-msg-bg);
        }
        
        .message-photo-item img {
            width: 100%;
            height: auto;
            display: block;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .message-photo-item img:hover {
            transform: scale(1.02);
        }
        
        .photo-count-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: linear-gradient(to right, #ff6b6b, #ffa500);
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .message-photos-grid {
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            }
            
            #photoBtn {
                width: 38px;
                height: 38px;
                padding: 8px 10px;
            }
        }
        
        @media (max-width: 480px) {
            .message-photos-grid {
                grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Функция для отображения фото в сообщениях
function displayPhotoMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add('message-with-photos');
    
    if (message.senderId === userId) {
        messageElement.classList.add('my-message');
    } else {
        messageElement.classList.add('other-message');
    }
    
    const date = new Date(message.timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let photosHTML = '';
    if (message.photos && message.photos.length > 0) {
        // Показываем только первые 4 фото, остальные как бейдж
        const displayPhotos = message.photos.slice(0, 4);
        const remainingPhotos = message.photos.length - displayPhotos.length;
        
        photosHTML = `
            <div class="message-photos-grid">
                ${displayPhotos.map((photo, index) => `
                    <div class="message-photo-item" style="position: relative;">
                        <img src="${photo}" alt="Фото" onclick="openPhotoViewer('${photo}')">
                        ${index === 0 && remainingPhotos > 0 ? 
                            `<div class="photo-count-badge">+${remainingPhotos}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    messageElement.innerHTML = `
        ${message.senderId !== userId ? `<div class="sender">${message.senderName}</div>` : ''}
        ${photosHTML}
        ${message.text ? `<div style="margin-top: ${message.photos ? '8px' : '0'}">${message.text}</div>` : ''}
        <div class="timestamp">${timeString} ${message.photos ? '📷' : ''}</div>
    `;
    
    return messageElement;
}

// Функция для просмотра фото
function openPhotoViewer(photoUrl) {
    const viewer = document.createElement('div');
    viewer.className = 'photo-viewer';
    viewer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: pointer;
    `;
    
    const imgContainer = document.createElement('div');
    imgContainer.style.cssText = `
        position: relative;
        max-width: 90%;
        max-height: 90%;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const img = document.createElement('img');
    img.src = photoUrl;
    img.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.style.cssText = `
        position: absolute;
        top: -40px;
        right: 0;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    `;
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    });
    
    imgContainer.appendChild(img);
    imgContainer.appendChild(closeBtn);
    viewer.appendChild(imgContainer);
    document.body.appendChild(viewer);
    
    function closeViewer() {
        if (viewer.parentNode) {
            document.body.removeChild(viewer);
        }
    }
    
    viewer.addEventListener('click', (e) => {
        if (e.target === viewer) {
            closeViewer();
        }
    });
    
    closeBtn.addEventListener('click', closeViewer);
    
    // Закрытие по ESC
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeViewer();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// Переопределяем функцию добавления сообщений для поддержки фото
function overrideMessageDisplay() {
    if (typeof window.addMessageToChat !== 'undefined') {
        const originalAddMessageToChat = window.addMessageToChat;
        
        window.addMessageToChat = function(message) {
            if (message.type === 'photo' && message.photos) {
                const messageElement = displayPhotoMessage(message);
                const messagesContainer = document.getElementById('messagesContainer');
                if (messagesContainer) {
                    // Убираем пустой чат если есть
                    const emptyChat = messagesContainer.querySelector('.empty-chat');
                    if (emptyChat) {
                        emptyChat.remove();
                    }
                    messagesContainer.appendChild(messageElement);
                }
            } else {
                originalAddMessageToChat(message);
            }
        };
    } else {
        console.warn('Функция addMessageToChat не найдена для переопределения');
    }
}

// Показ уведомления (если функция не определена)
if (typeof showNotification === 'undefined') {
    window.showNotification = function(message) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    };
}

// Инициализация после загрузки
setTimeout(overrideMessageDisplay, 1500);

// Экспортируем функции для глобального использования
window.openPhotoViewer = openPhotoViewer;
window.displayPhotoMessage = displayPhotoMessage;

console.log('✅ Photo Sharing Module загружен');