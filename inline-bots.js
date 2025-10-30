// simple-reply.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Система ответов загружена');
    
    // Создаем контейнер для ответа
    const replyDiv = document.createElement('div');
    replyDiv.id = 'reply-container';
    replyDiv.style.cssText = `
        background: #4facfe;
        color: white;
        padding: 10px;
        margin: 0;
        border-radius: 0;
        display: none;
        font-size: 14px;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10000;
    `;
    
    document.body.appendChild(replyDiv);
    
    // Добавляем обработчики на все сообщения
    function addClickHandlers() {
        const messages = document.querySelectorAll('.message');
        
        messages.forEach(function(message) {
            // Убираем старые обработчики
            message.onclick = null;
            
            // Добавляем новый обработчик
            message.onclick = function() {
                const messageText = this.querySelector('div:nth-child(2)')?.textContent || 
                                 this.textContent;
                
                // Показываем контейнер ответа
                replyDiv.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>Ответ на:</strong> ${messageText.substring(0, 40)}...
                        </div>
                        <button onclick="cancelReply()" style="
                            background: none; 
                            border: none; 
                            color: white; 
                            font-size: 20px; 
                            cursor: pointer;
                            padding: 0 10px;
                        ">✕</button>
                    </div>
                `;
                replyDiv.style.display = 'block';
                
                // Сохраняем текст для ответа
                window.replyingToMessage = messageText;
                
                // Прокручиваем к полю ввода
                const inputArea = document.querySelector('.input-area');
                if (inputArea) {
                    inputArea.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Фокусируемся на поле ввода
                setTimeout(function() {
                    const messageInput = document.getElementById('messageInput');
                    if (messageInput) {
                        messageInput.focus();
                    }
                }, 500);
            };
        });
    }
    
    // Перехватываем отправку сообщений
    function interceptSend() {
        const sendBtn = document.getElementById('sendBtn');
        const messageInput = document.getElementById('messageInput');
        
        if (sendBtn && messageInput) {
            const originalClick = sendBtn.onclick;
            
            sendBtn.onclick = function() {
                if (window.replyingToMessage) {
                    const originalText = messageInput.value.trim();
                    if (originalText) {
                        // Формируем сообщение с ответом
                        const replyMessage = `Ответ на "${window.replyingToMessage}": ${originalText}`;
                        messageInput.value = replyMessage;
                    }
                }
                
                // Вызываем оригинальную функцию
                if (originalClick) originalClick();
                
                // Сбрасываем ответ
                cancelReply();
            };
            
            // Также перехватываем Enter
            messageInput.onkeypress = function(e) {
                if (e.key === 'Enter') {
                    if (window.replyingToMessage) {
                        const originalText = messageInput.value.trim();
                        if (originalText) {
                            const replyMessage = `Ответ на "${window.replyingToMessage}": ${originalText}`;
                            messageInput.value = replyMessage;
                        }
                    }
                    
                    // Вызываем отправку
                    setTimeout(function() {
                        sendBtn.click();
                    }, 100);
                    
                    cancelReply();
                }
            };
        }
    }
    
    // Функция отмены ответа
    window.cancelReply = function() {
        const replyDiv = document.getElementById('reply-container');
        if (replyDiv) {
            replyDiv.style.display = 'none';
        }
        window.replyingToMessage = null;
    };
    
    // Запускаем систему
    addClickHandlers();
    interceptSend();
    
    // Обновляем обработчики при изменении DOM
    setInterval(addClickHandlers, 1000);
    
    console.log('Система ответов запущена! Просто нажмите на любое сообщение');
});