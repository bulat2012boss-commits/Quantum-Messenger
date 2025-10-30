// file-upload.js - Кнопка скрепки для отправки файлов

class FileUpload {
    constructor() {
        this.init();
    }

    init() {
        this.addClipButton();
    }

    addClipButton() {
        const inputArea = document.querySelector('.input-area');
        if (!inputArea) return;

        const clipBtn = document.createElement('button');
        clipBtn.innerHTML = '📎';
        clipBtn.style.cssText = `
            padding: 10px 15px;
            background: rgba(79, 172, 254, 0.2);
            color: var(--text-color);
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 16px;
            margin-right: 5px;
        `;

        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            inputArea.insertBefore(clipBtn, sendBtn);
        } else {
            inputArea.appendChild(clipBtn);
        }

        // Создаем невидимый input для файлов
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '*/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        clipBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
            fileInput.value = ''; // Сбрасываем чтобы можно было выбрать тот же файл снова
        });
    }

    handleFiles(files) {
        for (let file of files) {
            this.uploadFile(file);
        }
    }

    uploadFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const base64 = e.target.result;
            this.sendFileMessage(file, base64);
        };
        
        reader.readAsDataURL(file);
    }

    sendFileMessage(file, base64) {
        // Определяем тип файла
        let fileType = '📄';
        if (file.type.startsWith('image/')) fileType = '🖼️';
        else if (file.type.startsWith('video/')) fileType = '🎥';
        else if (file.type.startsWith('audio/')) fileType = '🎵';
        else if (file.type.includes('pdf')) fileType = '📕';
        else if (file.type.includes('word') || file.type.includes('document')) fileType = '📝';
        else if (file.type.includes('zip') || file.type.includes('rar')) fileType = '📦';

        // Формируем сообщение
        const fileInfo = `${fileType} Файл: ${file.name} (${this.formatFileSize(file.size)})`;
        
        // Создаем сообщение с файлом
        const messageData = {
            text: fileInfo,
            file: {
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64
            },
            timestamp: Date.now(),
            hasFile: true
        };

        // Отправляем через основную систему
        if (window.sendMessage) {
            window.sendMessage(JSON.stringify(messageData));
        } else {
            // Fallback
            const input = document.getElementById('messageInput');
            const sendBtn = document.getElementById('sendBtn');
            if (input && sendBtn) {
                input.value = fileInfo;
                sendBtn.disabled = false;
                sendBtn.click();
            }
        }

        this.showNotification(`Файл "${file.name}" отправлен`);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message) {
        if (window.showNotification) {
            window.showNotification(message);
        }
    }
}

// Запускаем
document.addEventListener('DOMContentLoaded', function() {
    window.fileUpload = new FileUpload();
});