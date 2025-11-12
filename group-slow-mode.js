// channel-comments.js - Система комментариев для каналов Quantum Messenger

// Элементы DOM для комментаlриев
let commentsModal = null;
let currentPostForComments = null;
let commentsListener = null;

// Инициализация системы комментариев
function initChannelCommentsSystem() {
    console.log("Инициализация системы комментариев для каналов...");
    
    // Добавляем стили для комментариев
    addCommentsStyles();
    
    console.log("✅ Система комментариев инициализирована");
}

// Добавление кнопки комментариев к постам
function addCommentButtonToPost(postElement, postData) {
    const postActions = postElement.querySelector('.post-reactions');
    if (!postActions) return;
    
    const commentButton = document.createElement('button');
    commentButton.className = 'comment-btn';
    commentButton.innerHTML = '<i class="fas fa-comment"></i>';
    commentButton.setAttribute('data-post-id', postData.id);
    commentButton.style.cssText = `
        background: none;
        border: 1px dashed var(--border-color);
        padding: 4px 8px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 12px;
        color: var(--text-color);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 4px;
    `;
    
    // Загружаем количество комментариев
    loadCommentsCount(postData.id).then(count => {
        if (count > 0) {
            commentButton.innerHTML = `<i class="fas fa-comment"></i> ${count}`;
        }
    });
    
    // Анимация при наведении
    commentButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-1px)';
        this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        this.style.borderColor = '#4facfe';
    });
    
    commentButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
        this.style.borderColor = 'var(--border-color)';
    });
    
    // Обработчик клика
    commentButton.addEventListener('click', function() {
        const postId = this.getAttribute('data-post-id');
        showCommentsModal(postId, postData);
    });
    
    postActions.appendChild(commentButton);
}

// Загрузка количества комментариев
function loadCommentsCount(postId) {
    return new Promise((resolve) => {
        database.ref('channelComments').orderByChild('postId').equalTo(postId).once('value')
            .then((snapshot) => {
                const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
                resolve(count);
            })
            .catch(() => {
                resolve(0);
            });
    });
}

// Показ модального окна комментариев
function showCommentsModal(postId, postData) {
    closeActiveModal();
    currentPostForComments = postData;
    
    commentsModal = document.createElement('div');
    commentsModal.className = 'modal active';
    commentsModal.style.zIndex = '1002';
    commentsModal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; max-height: 80vh; display: flex; flex-direction: column; animation: scaleIn 0.3s ease;">
            <div style="padding: 20px; border-bottom: 1px solid var(--border-color); flex-shrink: 0;">
                <h3 style="margin: 0; display: flex; align-items: center; justify-content: space-between;">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-comments" style="color: #4facfe;"></i>
                        Комментарии к посту
                    </span>
                    <button id="closeCommentsBtn" style="background: none; border: none; color: var(--text-color); cursor: pointer; padding: 5px; border-radius: 5px; transition: background 0.2s ease;">
                        <i class="fas fa-times"></i>
                    </button>
                </h3>
            </div>
            
            <!-- Оригинальный пост -->
            <div class="original-post-preview" style="padding: 15px; border-bottom: 1px solid var(--border-color); background: var(--hover-color); flex-shrink: 0;">
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <div class="user-avatar" style="width: 32px; height: 32px; border-radius: 8px; background: #9b59b6; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white;">
                        <i class="fas fa-edit"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">
                            ${postData.authorName}
                            ${postData.authorRole === 'admin' ? '<span style="color: #ff6b6b; font-size: 10px; margin-left: 5px;">👑</span>' : ''}
                        </div>
                        <div style="font-size: 13px; line-height: 1.3; opacity: 0.9;">${postData.content}</div>
                        <div style="font-size: 11px; opacity: 0.6; margin-top: 5px;">
                            ${new Date(postData.timestamp).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Список комментариев -->
            <div class="comments-list" id="commentsList" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px;">
                <div class="empty-comments" style="text-align: center; padding: 40px 20px; opacity: 0.7;">
                    <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 15px; display: block; color: #4facfe;"></i>
                    <p>Пока нет комментариев</p>
                    <p style="font-size: 14px; margin-top: 10px;">Будьте первым, кто оставит комментарий!</p>
                </div>
            </div>
            
            <!-- Поле ввода комментария -->
            <div class="comment-input-area" style="padding: 15px; border-top: 1px solid var(--border-color); background: var(--header-bg); flex-shrink: 0;">
                <div style="display: flex; gap: 10px; align-items: flex-end;">
                    <div style="flex: 1; position: relative;">
                        <textarea id="commentInput" placeholder="Напишите комментарий..." style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 20px; background: var(--input-bg); color: var(--input-color); font-size: 14px; resize: none; height: 40px; min-height: 40px; max-height: 120px; transition: border-color 0.3s ease; font-family: inherit;"></textarea>
                        <div style="position: absolute; right: 10px; bottom: 10px; font-size: 11px; opacity: 0.6;">
                            <span id="commentCharCount">0</span>/500
                        </div>
                    </div>
                    <button id="sendCommentBtn" disabled style="background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 50%; width: 44px; height: 44px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(commentsModal);
    
    // Инициализация обработчиков для модального окна комментариев
    initCommentsModalHandlers(postId);
    
    // Загрузка комментариев
    loadComments(postId);
}

// Инициализация обработчиков модального окна комментариев
function initCommentsModalHandlers(postId) {
    const closeBtn = document.getElementById('closeCommentsBtn');
    const commentInput = document.getElementById('commentInput');
    const sendBtn = document.getElementById('sendCommentBtn');
    const charCount = document.getElementById('commentCharCount');
    
    // Анимация для кнопки закрытия
    closeBtn.addEventListener('mouseenter', function() {
        this.style.background = 'var(--hover-color)';
    });
    closeBtn.addEventListener('mouseleave', function() {
        this.style.background = 'none';
    });
    
    closeBtn.addEventListener('click', closeCommentsModal);
    
    // Обработчик ввода комментария
    commentInput.addEventListener('input', function() {
        const text = this.value.trim();
        sendBtn.disabled = text.length === 0 || text.length > 500;
        
        // Обновление счетчика символов
        charCount.textContent = text.length;
        if (text.length > 450) {
            charCount.style.color = '#e74c3c';
        } else if (text.length > 400) {
            charCount.style.color = '#f39c12';
        } else {
            charCount.style.color = '';
        }
        
        // Автоматическое изменение высоты текстового поля
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    commentInput.addEventListener('focus', function() {
        this.style.borderColor = '#4facfe';
    });
    
    commentInput.addEventListener('blur', function() {
        this.style.borderColor = 'var(--border-color)';
    });
    
    // Отправка по Enter (Ctrl+Enter для новой строки)
    commentInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            if (!sendBtn.disabled) {
                sendComment(postId);
            }
        }
    });
    
    // Обработчик отправки комментария
    sendBtn.addEventListener('click', function() {
        if (!this.disabled) {
            sendComment(postId);
        }
    });
    
    // Анимация кнопки отправки
    sendBtn.addEventListener('mouseenter', function() {
        if (!this.disabled) {
            this.style.transform = 'scale(1.1)';
        }
    });
    
    sendBtn.addEventListener('mouseleave', function() {
        if (!this.disabled) {
            this.style.transform = 'scale(1)';
        }
    });
    
    // Закрытие по клику вне модального окна
    commentsModal.addEventListener('click', function(e) {
        if (e.target === commentsModal) {
            closeCommentsModal();
        }
    });
    
    // Закрытие по ESC
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            closeCommentsModal();
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    // Фокус на поле ввода
    setTimeout(() => {
        commentInput.focus();
    }, 100);
}

// Загрузка комментариев
function loadComments(postId) {
    const commentsList = document.getElementById('commentsList');
    
    // Удаляем предыдущий слушатель
    if (commentsListener) {
        database.ref('channelComments').off('value', commentsListener);
    }
    
    // Слушаем комментарии в реальном времени
    commentsListener = database.ref('channelComments').orderByChild('postId').equalTo(postId).on('value', (snapshot) => {
        commentsList.innerHTML = '';
        
        if (!snapshot.exists()) {
            commentsList.innerHTML = `
                <div class="empty-comments" style="text-align: center; padding: 40px 20px; opacity: 0.7;">
                    <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 15px; display: block; color: #4facfe;"></i>
                    <p>Пока нет комментариев</p>
                    <p style="font-size: 14px; margin-top: 10px;">Будьте первым, кто оставит комментарий!</p>
                </div>
            `;
            return;
        }
        
        const comments = snapshot.val();
        const commentsArray = [];
        
        // Преобразуем в массив и сортируем по времени
        Object.keys(comments).forEach(commentId => {
            commentsArray.push(comments[commentId]);
        });
        
        commentsArray.sort((a, b) => a.timestamp - b.timestamp);
        
        // Отображаем комментарии
        commentsArray.forEach(comment => {
            addCommentToModal(comment, commentsList);
        });
        
        // Прокручиваем вниз
        setTimeout(() => {
            commentsList.scrollTop = commentsList.scrollHeight;
        }, 100);
    });
}

// Добавление комментария в модальное окно
function addCommentToModal(comment, container) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment-item';
    commentElement.style.cssText = `
        padding: 12px;
        border: 1px solid var(--border-color);
        border-radius: 10px;
        background: var(--hover-color);
        animation: fadeIn 0.3s ease;
    `;
    
    const date = new Date(comment.timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = date.toLocaleDateString();
    
    const roleBadge = comment.authorRole === 'admin' ? 
        '<span style="color: #ff6b6b; font-size: 10px; background: rgba(255, 107, 107, 0.1); padding: 2px 6px; border-radius: 8px; margin-left: 5px;">👑 Админ</span>' : '';
    
    commentElement.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 10px;">
            <div class="user-avatar" style="width: 32px; height: 32px; border-radius: 8px; background: ${generateUserColor(comment.authorName)}; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 12px; flex-shrink: 0;">
                ${comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                    <div style="font-weight: bold; font-size: 13px;">${comment.authorName}</div>
                    ${roleBadge}
                    <div style="font-size: 11px; opacity: 0.6; margin-left: auto;">
                        ${timeString} • ${dateString}
                    </div>
                </div>
                <div style="font-size: 14px; line-height: 1.4; word-wrap: break-word; white-space: pre-wrap;">${comment.text}</div>
                
                <!-- Действия с комментарием -->
                <div style="display: flex; gap: 15px; margin-top: 8px;">
                    <button class="reply-comment-btn" data-comment-id="${comment.id}" style="background: none; border: none; color: var(--text-color); cursor: pointer; font-size: 12px; opacity: 0.7; transition: opacity 0.2s ease; display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-reply"></i> Ответить
                    </button>
                    ${comment.authorId === userId ? `
                    <button class="delete-comment-btn" data-comment-id="${comment.id}" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 12px; opacity: 0.7; transition: opacity 0.2s ease; display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(commentElement);
    
    // Обработчики для кнопок комментария
    const replyBtn = commentElement.querySelector('.reply-comment-btn');
    const deleteBtn = commentElement.querySelector('.delete-comment-btn');
    
    if (replyBtn) {
        replyBtn.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
        });
        replyBtn.addEventListener('mouseleave', function() {
            this.style.opacity = '0.7';
        });
        replyBtn.addEventListener('click', function() {
            const commentId = this.getAttribute('data-comment-id');
            replyToComment(commentId, comment.authorName);
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
        });
        deleteBtn.addEventListener('mouseleave', function() {
            this.style.opacity = '0.7';
        });
        deleteBtn.addEventListener('click', function() {
            const commentId = this.getAttribute('data-comment-id');
            deleteComment(commentId);
        });
    }
}

// Ответ на комментарий
function replyToComment(commentId, authorName) {
    const commentInput = document.getElementById('commentInput');
    commentInput.value = `@${authorName} `;
    commentInput.focus();
    
    // Обновляем состояние кнопки отправки
    const sendBtn = document.getElementById('sendCommentBtn');
    sendBtn.disabled = false;
    
    // Запускаем событие input для обновления счетчика
    const event = new Event('input');
    commentInput.dispatchEvent(event);
}

// Удаление комментария
function deleteComment(commentId) {
    if (confirm("Вы уверены, что хотите удалить этот комментарий?")) {
        database.ref('channelComments/' + commentId).remove()
            .then(() => {
                showNotification("✅ Комментарий удален");
            })
            .catch((error) => {
                console.error("❌ Ошибка удаления комментария:", error);
                showNotification("❌ Ошибка удаления комментария");
            });
    }
}

// Отправка комментария
function sendComment(postId) {
    const commentInput = document.getElementById('commentInput');
    const text = commentInput.value.trim();
    
    if (!text || text.length > 500) {
        return;
    }
    
    const commentId = database.ref('channelComments').push().key;
    const timestamp = Date.now();
    
    const commentData = {
        id: commentId,
        text: text,
        authorId: userId,
        authorName: currentUser,
        authorRole: userRoleInCurrentChannel,
        postId: postId,
        channelId: currentChannel,
        timestamp: timestamp,
        parentId: null // Для вложенных комментариев
    };
    
    // Блокируем кнопку отправки
    const sendBtn = document.getElementById('sendCommentBtn');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    database.ref('channelComments/' + commentId).set(commentData)
        .then(() => {
            // Очищаем поле ввода
            commentInput.value = '';
            commentInput.style.height = '40px';
            
            // Обновляем UI
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            
            // Обновляем счетчик символов
            document.getElementById('commentCharCount').textContent = '0';
            
            // Показываем уведомление
            showNotification("💬 Комментарий добавлен");
            
            // Отправляем уведомление в группу обсуждений (если она есть)
            sendCommentToDiscussionGroup(postId, text);
            
            // Обновляем количество комментариев в основном интерфейсе
            updateCommentsCountInUI(postId);
        })
        .catch((error) => {
            console.error("❌ Ошибка отправки комментария:", error);
            showNotification("❌ Ошибка отправки комментария");
            
            // Разблокируем кнопку
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        });
}

// Отправка комментария в группу обсуждений
function sendCommentToDiscussionGroup(postId, commentText) {
    // Здесь должна быть логика для отправки комментария в связанную группу обсуждений
    // Для демонстрации просто логируем
    console.log(`💬 Комментарий к посту ${postId}: ${commentText}`);
    
    // В реальной реализации здесь будет код для:
    // 1. Поиска связанной группы обсуждений для канала
    // 2. Отправки сообщения в эту группу
    // 3. Создания ссылки на оригинальный пост
}

// Обновление счетчика комментариев в UI
function updateCommentsCountInUI(postId) {
    // Обновляем кнопку комментариев в основном интерфейсе
    const commentButton = document.querySelector(`.comment-btn[data-post-id="${postId}"]`);
    if (commentButton) {
        loadCommentsCount(postId).then(count => {
            if (count > 0) {
                commentButton.innerHTML = `<i class="fas fa-comment"></i> ${count}`;
            } else {
                commentButton.innerHTML = `<i class="fas fa-comment"></i>`;
            }
        });
    }
}

// Закрытие модального окна комментариев
function closeCommentsModal() {
    if (commentsModal) {
        commentsModal.classList.remove('active');
        setTimeout(() => {
            if (commentsModal && commentsModal.parentNode) {
                commentsModal.parentNode.removeChild(commentsModal);
            }
            commentsModal = null;
            currentPostForComments = null;
        }, 300);
    }
    
    // Удаляем слушатель комментариев
    if (commentsListener) {
        database.ref('channelComments').off('value', commentsListener);
        commentsListener = null;
    }
    
    // Удаляем обработчик ESC
    document.removeEventListener('keydown', closeCommentsModal);
}

// Добавление стилей для комментариев
function addCommentsStyles() {
    if (document.getElementById('commentsStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'commentsStyles';
    style.textContent = `
        /* Стили для системы комментариев */
        .comment-btn {
            transition: all 0.2s ease !important;
        }
        
        .comment-btn:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
        
        .comment-item {
            transition: all 0.2s ease;
        }
        
        .comment-item:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .reply-comment-btn:hover,
        .delete-comment-btn:hover {
            opacity: 1 !important;
            transform: translateY(-1px);
        }
        
        /* Анимации */
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Адаптивность для мобильных устройств */
        @media (max-width: 768px) {
            .modal-content {
                width: 95% !important;
                margin: 10px !important;
                max-height: 90vh !important;
            }
            
            .comment-input-area {
                padding: 10px !important;
            }
            
            #commentInput {
                font-size: 16px !important; /* Предотвращает масштабирование в iOS */
            }
        }
        
        /* Стили для скроллбара */
        .comments-list::-webkit-scrollbar {
            width: 6px;
        }
        
        .comments-list::-webkit-scrollbar-track {
            background: var(--hover-color);
            border-radius: 3px;
        }
        
        .comments-list::-webkit-scrollbar-thumb {
            background: #4facfe;
            border-radius: 3px;
        }
        
        .comments-list::-webkit-scrollbar-thumb:hover {
            background: #00f2fe;
        }
        
        /* Улучшения для текстового поля */
        #commentInput {
            transition: all 0.3s ease !important;
            font-family: inherit !important;
        }
        
        #commentInput:focus {
            border-color: #4facfe !important;
            box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2) !important;
        }
    `;
    
    document.head.appendChild(style);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("💬 Channel Comments System loading...");
    
    // Ждем инициализации системы каналов
    const initInterval = setInterval(() => {
        if (typeof addPostToChat !== 'undefined') {
            clearInterval(initInterval);
            
            // Переопределяем функцию addPostToChat для добавления кнопки комментариев
            const originalAddPostToChat = addPostToChat;
            window.addPostToChat = function(post, container) {
                const result = originalAddPostToChat(post, container);
                addCommentButtonToPost(container.lastChild, post);
                return result;
            };
            
            initChannelCommentsSystem();
        }
    }, 500);
});

// Глобальные функции для доступа из других модулей
window.ChannelComments = {
    showComments: showCommentsModal,
    closeComments: closeCommentsModal,
    init: initChannelCommentsSystem
};

console.log("✅ Channel Comments System loaded successfully!");
