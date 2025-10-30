/**
 * Quantum Voice Messages - Простая рабочая версия
 */

class SimpleVoiceMessages {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordingTime = 0;
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        console.log('Simple Voice Messages init');
        
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            setTimeout(() => this.setup(), 100);
        }
    }

    setup() {
        try {
            this.addButtonToUI();
            this.setupRecordingUI();
            this.setupEventListeners();
            console.log('Voice Messages setup complete');
        } catch (error) {
            console.error('Setup error:', error);
            // Пробуем еще раз через секунду
            setTimeout(() => this.setup(), 1000);
        }
    }

    addButtonToUI() {
        // Ищем поле ввода сообщения
        const inputArea = document.querySelector('.input-area');
        if (!inputArea) {
            throw new Error('Input area not found');
        }

        // Создаем кнопку микрофона
        const voiceBtn = document.createElement('button');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.id = 'voiceBtn';
        voiceBtn.style.cssText = `
            width: 40px;
            height: 40px;
            border: none;
            border-radius: 50%;
            background: var(--action-btn-bg);
            color: var(--text-color);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
            transition: all 0.3s ease;
        `;

        // Вставляем перед полем ввода
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            inputArea.insertBefore(voiceBtn, messageInput);
        } else {
            inputArea.prepend(voiceBtn);
        }
    }

    setupRecordingUI() {
        // Создаем окно записи
        const recordingHTML = `
            <div id="voiceRecording" style="
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--header-bg);
                border: 2px solid var(--border-color);
                border-radius: 20px;
                padding: 30px;
                text-align: center;
                z-index: 10000;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                backdrop-filter: blur(10px);
                min-width: 300px;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">🎤</div>
                <div id="recordingTimer" style="
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    color: var(--text-color);
                ">00:00</div>
                <div style="margin-bottom: 20px; color: var(--text-color);">
                    Идет запись...
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="stopRecording" style="
                        padding: 12px 24px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 20px;
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        <i class="fas fa-stop"></i> Стоп
                    </button>
                    <button id="cancelRecording" style="
                        padding: 12px 24px;
                        background: #ff4757;
                        color: white;
                        border: none;
                        border-radius: 20px;
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', recordingHTML);
    }

    setupEventListeners() {
        // Клик по кнопке микрофона
        document.addEventListener('click', (e) => {
            if (e.target.closest('#voiceBtn')) {
                if (!this.isRecording) {
                    this.startRecording();
                }
            }

            if (e.target.closest('#stopRecording')) {
                this.stopRecording();
            }

            if (e.target.closest('#cancelRecording')) {
                this.cancelRecording();
            }
        });

        // ESC для отмены
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isRecording) {
                this.cancelRecording();
            }
        });
    }

    async startRecording() {
        console.log('Starting recording...');
        
        try {
            // Проверяем доступ к микрофону
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                } 
            });

            this.audioChunks = [];
            this.recordingTime = 0;

            // Создаем MediaRecorder
            this.mediaRecorder = new MediaRecorder(stream);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                this.finishRecording();
            };

            // Начинаем запись
            this.mediaRecorder.start();
            this.isRecording = true;

            // Показываем окно записи
            document.getElementById('voiceRecording').style.display = 'block';

            // Запускаем таймер
            this.startTimer();

            console.log('Recording started');

        } catch (error) {
            console.error('Recording error:', error);
            alert('Не удалось начать запись. Проверьте разрешение для микрофона.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.stopTimer();
        }
    }

    cancelRecording() {
        this.stopRecording();
        this.hideRecordingUI();
        this.audioChunks = [];
        this.showNotification('Запись отменена');
    }

    finishRecording() {
        this.hideRecordingUI();
        
        if (this.audioChunks.length > 0) {
            this.sendVoiceMessage();
        }
    }

    hideRecordingUI() {
        const recordingUI = document.getElementById('voiceRecording');
        if (recordingUI) {
            recordingUI.style.display = 'none';
        }
    }

    async sendVoiceMessage() {
        try {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            const duration = this.recordingTime;
            
            // Создаем голосовое сообщение
            const messageId = 'voice_' + Date.now();
            const audioUrl = await this.blobToBase64(audioBlob);
            
            // Сохраняем локально
            this.saveMessageLocally({
                id: messageId,
                audioData: audioUrl,
                duration: duration,
                timestamp: Date.now(),
                sender: 'Вы'
            });

            // Добавляем в чат
            this.addToChat(messageId, audioUrl, duration, true);
            
            this.showNotification('Голосовое сообщение отправлено!');

        } catch (error) {
            console.error('Send error:', error);
            this.showNotification('Ошибка отправки сообщения');
        }
    }

    addToChat(messageId, audioUrl, duration, isMyMessage = true) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) {
            console.error('Messages container not found');
            return;
        }

        // Убираем "пустой чат" если есть
        const emptyChat = messagesContainer.querySelector('.empty-chat');
        if (emptyChat) {
            emptyChat.style.display = 'none';
        }

        // Создаем элемент сообщения
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isMyMessage ? 'my-message' : 'other-message'}`;
        messageDiv.style.cssText = `
            max-width: 250px;
            padding: 15px;
            border-radius: 18px;
            margin: 5px 0;
            background: ${isMyMessage ? 'linear-gradient(to right, #4facfe, #00f2fe)' : 'var(--other-msg-bg)'};
            color: ${isMyMessage ? 'white' : 'var(--text-color)'};
        `;

        const durationStr = this.formatDuration(duration);

        messageDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <button onclick="window.simpleVoice.playVoiceMessage('${messageId}')" style="
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(255,255,255,0.2);
                    color: inherit;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <i class="fas fa-play"></i>
                </button>
                <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 500;">Голосовое сообщение</div>
                    <div style="font-size: 12px; opacity: 0.8;">${durationStr}</div>
                </div>
            </div>
            <div style="font-size: 11px; text-align: right; margin-top: 8px; opacity: 0.7;">
                ${new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        
        // Прокручиваем вниз
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async playVoiceMessage(messageId) {
        try {
            const message = this.getMessageLocally(messageId);
            if (!message) {
                this.showNotification('Сообщение не найдено');
                return;
            }

            const audioBlob = await this.base64ToBlob(message.audioData, 'audio/webm');
            const audioUrl = URL.createObjectURL(audioBlob);
            
            const audio = new Audio(audioUrl);
            await audio.play();

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
            };

        } catch (error) {
            console.error('Playback error:', error);
            this.showNotification('Ошибка воспроизведения');
        }
    }

    startTimer() {
        this.recordingTime = 0;
        const timerElement = document.getElementById('recordingTimer');
        
        this.timerInterval = setInterval(() => {
            this.recordingTime++;
            const minutes = Math.floor(this.recordingTime / 60);
            const seconds = this.recordingTime % 60;
            
            if (timerElement) {
                timerElement.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            // Авто-стоп через 2 минуты
            if (this.recordingTime >= 120) {
                this.stopRecording();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Вспомогательные методы
    async blobToBase64(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    async base64ToBlob(base64, mimeType) {
        const response = await fetch(base64);
        return await response.blob();
    }

    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    saveMessageLocally(message) {
        try {
            const stored = JSON.parse(localStorage.getItem('simpleVoiceMessages') || '{}');
            stored[message.id] = message;
            localStorage.setItem('simpleVoiceMessages', JSON.stringify(stored));
        } catch (error) {
            console.error('Save error:', error);
        }
    }

    getMessageLocally(messageId) {
        try {
            const stored = JSON.parse(localStorage.getItem('simpleVoiceMessages') || '{}');
            return stored[messageId];
        } catch (error) {
            console.error('Load error:', error);
            return null;
        }
    }

    showNotification(message) {
        // Простое уведомление
        console.log('Notification:', message);
        if (window.showNotification) {
            window.showNotification(message);
        } else {
            alert(message);
        }
    }
}

// Загружаем существующие сообщения при старте
function loadExistingMessages() {
    try {
        const stored = JSON.parse(localStorage.getItem('simpleVoiceMessages') || '{}');
        console.log('Loaded voice messages:', Object.keys(stored).length);
        
        // Можно добавить логику для загрузки в текущий чат
    } catch (error) {
        console.error('Load messages error:', error);
    }
}

// Инициализация
window.simpleVoice = new SimpleVoiceMessages();

// Загружаем существующие сообщения
setTimeout(loadExistingMessages, 2000);

console.log('Simple Voice Messages loaded');