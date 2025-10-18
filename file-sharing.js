// file-sharing.js - Модуль для отправки файлов в Quantum Messenger (исправленная версия)

// Конфигурация
const FILE_SHARING_CONFIG = {
    MAX_FILE_SIZE: 1024 * 1024 * 1024, // 1 GB
    CHUNK_SIZE: 512 * 1024, // 512 KB chunks for large files
    MAX_DATA_URL_SIZE: 10 * 1024 * 1024, // 10MB max for data URLs
    ALLOWED_TYPES: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
        'video/mp4', 'video/avi', 'video/mkv', 'video/mov', 'video/webm',
        'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
        'application/pdf', 
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/html', 'text/css', 'text/javascript',
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
        'application/x-tar', 'application/gzip'
    ],
    COMPRESSION: {
        images: true,
        maxImageWidth: 1920,
        maxImageHeight: 1080,
        quality: 0.8,
        videos: false, // Сжатие видео требует сложной обработки
        maxVideoSize: 100 * 1024 * 1024 // 100MB
    }
};

// Глобальные переменные
let currentUploadingFile = null;
let uploadProgress = 0;
let isUploading = false;
let uploadCanceled = false;

// Инициализация модуля отправки файлов
function initFileSharing() {
    console.log("Initializing File Sharing module...");
    
    // Создаем элементы для загрузки файлов
    createFileUploadElements();
    
    // Добавляем обработчики событий
    addFileSharingEventListeners();
    
    // Модифицируем существующие функции
    patchExistingFunctions();
    
    console.log("File Sharing module initialized successfully");
}

// Создание элементов интерфейса для загрузки файлов
function createFileUploadElements() {
    // Создаем скрытый input для выбора файлов
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'fileInput';
    fileInput.multiple = false; // Пока только один файл за раз
    fileInput.accept = '*/*';
    fileInput.style.display = 'none';
    
    // Создаем кнопку для прикрепления файлов
    const attachButton = document.createElement('button');
    attachButton.id = 'attachButton';
    attachButton.innerHTML = '<i class="fas fa-paperclip"></i>';
    attachButton.title = 'Прикрепить файл (до 1GB)';
    attachButton.style.cssText = `
        background: var(--action-btn-bg);
        color: var(--action-btn-color);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        font-size: 16px;
    `;

    // Добавляем hover эффекты
    attachButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.background = 'rgba(79, 172, 254, 0.3)';
    });

    attachButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.background = 'var(--action-btn-bg)';
    });
    
    // Добавляем элементы в DOM
    const inputArea = document.querySelector('.input-area');
    if (inputArea) {
        inputArea.insertBefore(attachButton, inputArea.querySelector('input'));
        inputArea.appendChild(fileInput);
    }
    
    // Создаем модальные окна
    createFilePreviewModal();
    createUploadProgressModal();
    createFileManagerModal();
    createLargeFileModal();
}

// Создание модального окна для больших файлов
function createLargeFileModal() {
    const modalHTML = `
        <div class="modal" id="largeFileModal">
            <div class="modal-content" style="max-width: 500px;">
                <h3 style="margin-bottom: 15px; text-align: center;">Большой файл</h3>
                <div style="text-align: center; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #FF9800; margin-bottom: 15px;"></i>
                    <div id="largeFileName" style="font-weight: bold; margin-bottom: 10px; word-break: break-all;"></div>
                    <div id="largeFileSize" style="font-size: 14px; opacity: 0.7; margin-bottom: 15px;"></div>
                    <p style="margin-bottom: 15px;">Этот файл довольно большой. Отправка может занять некоторое время и использовать мобильный трафик.</p>
                    <p style="font-size: 14px; opacity: 0.8;">Рекомендуется использовать Wi-Fi для больших файлов.</p>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn primary" id="confirmLargeFileBtn">
                        <i class="fas fa-paper-plane"></i> Все равно отправить
                    </button>
                    <button class="modal-btn secondary" id="cancelLargeFileBtn">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Создание модального окна для предпросмотра файлов
function createFilePreviewModal() {
    const modalHTML = `
        <div class="modal" id="filePreviewModal">
            <div class="modal-content" style="max-width: 600px; max-height: 90vh;">
                <h3 style="margin-bottom: 15px; text-align: center;">Предпросмотр файла</h3>
                <div id="filePreviewContent" style="text-align: center; margin-bottom: 20px; max-height: 400px; overflow: auto;"></div>
                <div class="profile-info">
                    <div class="profile-info-item">
                        <span class="profile-info-label">Имя файла:</span>
                        <span class="profile-info-value" id="fileNamePreview" style="word-break: break-all;"></span>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-info-label">Размер:</span>
                        <span class="profile-info-value" id="fileSizePreview"></span>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-info-label">Тип:</span>
                        <span class="profile-info-value" id="fileTypePreview"></span>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-info-label">Статус:</span>
                        <span class="profile-info-value" id="fileStatusPreview">Готов к отправке</span>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn primary" id="sendFileBtn">
                        <i class="fas fa-paper-plane"></i> Отправить файл
                    </button>
                    <button class="modal-btn secondary" id="cancelFileBtn">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Создание модального окна для прогресса загрузки
function createUploadProgressModal() {
    const modalHTML = `
        <div class="modal" id="uploadProgressModal">
            <div class="modal-content" style="max-width: 500px;">
                <h3 style="margin-bottom: 15px; text-align: center;">Отправка файла</h3>
                <div style="text-align: center; margin-bottom: 20px;">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #4facfe; margin-bottom: 15px;"></i>
                    <div id="uploadFileName" style="font-weight: bold; margin-bottom: 10px; word-break: break-all;"></div>
                    <div id="uploadFileSize" style="font-size: 14px; opacity: 0.7; margin-bottom: 20px;"></div>
                    
                    <!-- Прогресс бар -->
                    <div style="background: rgba(255,255,255,0.1); border-radius: 10px; height: 20px; margin-bottom: 10px; overflow: hidden;">
                        <div id="uploadProgressBar" style="background: linear-gradient(to right, #4facfe, #00f2fe); height: 100%; width: 0%; transition: width 0.3s ease; border-radius: 10px;"></div>
                    </div>
                    <div id="uploadProgressText" style="font-size: 14px;">0%</div>
                    
                    <!-- Дополнительная информация -->
                    <div id="uploadSpeed" style="font-size: 12px; opacity: 0.7; margin-top: 10px;"></div>
                    <div id="uploadTimeLeft" style="font-size: 12px; opacity: 0.7;"></div>
                    <div id="uploadStage" style="font-size: 12px; opacity: 0.7; margin-top: 5px;"></div>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="cancelUploadBtn">
                        <i class="fas fa-times"></i> Отменить отправку
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Создание модального окна для управления файлами
function createFileManagerModal() {
    const modalHTML = `
        <div class="modal" id="fileManagerModal">
            <div class="modal-content" style="max-width: 800px; max-height: 80vh;">
                <h3 style="margin-bottom: 15px; text-align: center;">Файлы в чате</h3>
                <div style="margin-bottom: 15px;">
                    <input type="text" id="fileSearchInput" placeholder="Поиск файлов..." style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-color);">
                </div>
                <div id="fileManagerContent" style="max-height: 400px; overflow-y: auto;">
                    <div class="empty-chat">
                        <i class="fas fa-folder-open"></i>
                        <p>Файлы не найдены</p>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="closeFileManagerBtn">Закрыть</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Добавление обработчиков событий для отправки файлов
function addFileSharingEventListeners() {
    const attachButton = document.getElementById('attachButton');
    const fileInput = document.getElementById('fileInput');
    const sendFileBtn = document.getElementById('sendFileBtn');
    const cancelFileBtn = document.getElementById('cancelFileBtn');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const closeFileManagerBtn = document.getElementById('closeFileManagerBtn');
    const confirmLargeFileBtn = document.getElementById('confirmLargeFileBtn');
    const cancelLargeFileBtn = document.getElementById('cancelLargeFileBtn');
    
    if (attachButton && fileInput) {
        attachButton.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (sendFileBtn) {
        sendFileBtn.addEventListener('click', sendSelectedFile);
    }
    
    if (cancelFileBtn) {
        cancelFileBtn.addEventListener('click', () => {
            document.getElementById('filePreviewModal').classList.remove('active');
            fileInput.value = '';
            currentUploadingFile = null;
        });
    }
    
    if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', cancelUpload);
    }
    
    if (closeFileManagerBtn) {
        closeFileManagerBtn.addEventListener('click', () => {
            document.getElementById('fileManagerModal').classList.remove('active');
        });
    }
    
    if (confirmLargeFileBtn) {
        confirmLargeFileBtn.addEventListener('click', () => {
            document.getElementById('largeFileModal').classList.remove('active');
            if (currentUploadingFile) {
                startFileUpload(currentUploadingFile);
            }
        });
    }
    
    if (cancelLargeFileBtn) {
        cancelLargeFileBtn.addEventListener('click', () => {
            document.getElementById('largeFileModal').classList.remove('active');
            fileInput.value = '';
            currentUploadingFile = null;
        });
    }
    
    // Drag and drop functionality
    setupDragAndDrop();
}

// Настройка drag and drop
function setupDragAndDrop() {
    const dropArea = document.querySelector('.input-area');
    
    if (!dropArea) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.style.background = 'rgba(79, 172, 254, 0.2)';
        dropArea.style.border = '2px dashed #4facfe';
    }
    
    function unhighlight() {
        dropArea.style.background = '';
        dropArea.style.border = '';
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFiles(files);
        }
    }
}

// Обработка выбора файла
function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length === 0) return;
    
    handleFiles(files);
}

// Обработка файлов (основная функция)
function handleFiles(files) {
    const file = files[0]; // Берем первый файл
    
    // Проверяем размер файла
    if (file.size > FILE_SHARING_CONFIG.MAX_FILE_SIZE) {
        showNotification(`Файл слишком большой. Максимальный размер: ${formatFileSize(FILE_SHARING_CONFIG.MAX_FILE_SIZE)}`);
        return;
    }
    
    // Проверяем тип файла
    if (!FILE_SHARING_CONFIG.ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
        showNotification(`Тип файла "${file.type}" не поддерживается`);
        return;
    }
    
    currentUploadingFile = file;
    
    // Для больших файлов показываем предупреждение
    if (file.size > 20 * 1024 * 1024) { // Больше 20MB
        showLargeFileWarning(file);
    } else {
        // Показываем предпросмотр
        showFilePreview(file);
    }
}

// Показ предупреждения для больших файлов
function showLargeFileWarning(file) {
    const modal = document.getElementById('largeFileModal');
    const fileName = document.getElementById('largeFileName');
    const fileSize = document.getElementById('largeFileSize');
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    modal.classList.add('active');
}

// Показ предпросмотра файла
function showFilePreview(file) {
    const modal = document.getElementById('filePreviewModal');
    const content = document.getElementById('filePreviewContent');
    const fileName = document.getElementById('fileNamePreview');
    const fileSize = document.getElementById('fileSizePreview');
    const fileType = document.getElementById('fileTypePreview');
    const fileStatus = document.getElementById('fileStatusPreview');
    
    // Очищаем предыдущий предпросмотр
    content.innerHTML = '';
    
    // Устанавливаем информацию о файле
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileType.textContent = getFileType(file.type);
    
    // Показываем статус в зависимости от размера
    if (file.size > 50 * 1024 * 1024) { // Больше 50MB
        fileStatus.textContent = 'Большой файл, отправка может занять время';
        fileStatus.style.color = '#FF9800';
    } else {
        fileStatus.textContent = 'Готов к отправке';
        fileStatus.style.color = '#4CAF50';
    }
    
    // Создаем предпросмотр в зависимости от типа файла
    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = '100%';
        img.style.maxHeight = '300px';
        img.style.borderRadius = '8px';
        img.style.cursor = 'pointer';
        img.onclick = () => openFilePreview(img.src, file.name);
        content.appendChild(img);
        
        // Добавляем информацию о сжатии
        if (FILE_SHARING_CONFIG.COMPRESSION.images && file.size > 1024 * 1024) {
            const compressionInfo = document.createElement('div');
            compressionInfo.style.fontSize = '12px';
            compressionInfo.style.opacity = '0.7';
            compressionInfo.style.marginTop = '8px';
            compressionInfo.textContent = '⚠ Изображение будет оптимизировано для быстрой отправки';
            content.appendChild(compressionInfo);
        }
    } else if (file.type.startsWith('video/')) {
        const videoContainer = document.createElement('div');
        videoContainer.style.position = 'relative';
        
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '300px';
        video.style.borderRadius = '8px';
        videoContainer.appendChild(video);
        
        const durationInfo = document.createElement('div');
        durationInfo.style.fontSize = '12px';
        durationInfo.style.opacity = '0.7';
        durationInfo.style.marginTop = '8px';
        
        video.onloadedmetadata = function() {
            durationInfo.textContent = `Длительность: ${formatVideoDuration(video.duration)}`;
        };
        
        videoContainer.appendChild(durationInfo);
        content.appendChild(videoContainer);
    } else if (file.type.startsWith('audio/')) {
        const audioContainer = document.createElement('div');
        audioContainer.style.padding = '20px';
        
        const audio = document.createElement('audio');
        audio.src = URL.createObjectURL(file);
        audio.controls = true;
        audio.style.width = '100%';
        audioContainer.appendChild(audio);
        
        content.appendChild(audioContainer);
    } else {
        // Для других типов файлов показываем детальную информацию
        const fileIcon = document.createElement('div');
        fileIcon.innerHTML = `<i class="fas ${getFileIcon(file.type)}" style="font-size: 64px; color: #a0d2eb; margin-bottom: 15px;"></i>`;
        content.appendChild(fileIcon);
        
        const fileDetails = document.createElement('div');
        fileDetails.style.fontSize = '14px';
        fileDetails.style.opacity = '0.8';
        fileDetails.innerHTML = `
            <div>Расширение: .${file.name.split('.').pop()}</div>
            <div>Размер: ${formatFileSize(file.size)}</div>
        `;
        content.appendChild(fileDetails);
    }
    
    // Показываем модальное окно
    modal.classList.add('active');
}

// Отправка выбранного файла
async function sendSelectedFile() {
    const fileInput = document.getElementById('fileInput');
    const modal = document.getElementById('filePreviewModal');
    
    if (!currentUploadingFile) return;
    
    if (!currentChatWith) {
        showNotification("Сначала выберите чат для отправки файла");
        return;
    }
    
    // Закрываем модальное окно предпросмотра
    modal.classList.remove('active');
    
    // Начинаем загрузку
    await startFileUpload(currentUploadingFile);
    
    fileInput.value = '';
    currentUploadingFile = null;
}

// Начало загрузки файла
async function startFileUpload(file) {
    try {
        // Показываем прогресс загрузки
        showUploadProgress(file);
        
        // Обрабатываем файл (сжатие и т.д.)
        const processedFile = await processFile(file);
        
        // Отправляем файл
        await sendFileMessage(processedFile);
        
        // Скрываем прогресс загрузки
        hideUploadProgress();
        
        showNotification(`Файл "${file.name}" успешно отправлен!`);
        
    } catch (error) {
        console.error("Ошибка отправки файла:", error);
        hideUploadProgress();
        
        if (error.message.includes('Quota exceeded') || error.message.includes('too large')) {
            showNotification("Файл слишком большой для отправки. Попробуйте файл поменьше.");
        } else if (uploadCanceled) {
            showNotification("Отправка файла отменена");
        } else {
            showNotification("Ошибка отправки файла: " + error.message);
        }
    }
}

// Обработка файла (сжатие и т.д.)
async function processFile(file) {
    // Если это изображение и включено сжатие
    if (FILE_SHARING_CONFIG.COMPRESSION.images && file.type.startsWith('image/') && file.size > 500 * 1024) {
        updateUploadStage("Оптимизация изображения...");
        return await compressImage(file);
    }
    
    // Для больших файлов показываем этап обработки
    if (file.size > 10 * 1024 * 1024) {
        updateUploadStage("Подготовка файла к отправке...");
        // Даем время на отображение этапа
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return file;
}

// Сжатие изображения
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = function() {
            let width = img.width;
            let height = img.height;
            
            // Масштабируем изображение если оно слишком большое
            if (width > FILE_SHARING_CONFIG.COMPRESSION.maxImageWidth || height > FILE_SHARING_CONFIG.COMPRESSION.maxImageHeight) {
                const ratio = Math.min(
                    FILE_SHARING_CONFIG.COMPRESSION.maxImageWidth / width,
                    FILE_SHARING_CONFIG.COMPRESSION.maxImageHeight / height
                );
                width *= ratio;
                height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                const compressedFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now()
                });
                resolve(compressedFile);
            }, file.type, FILE_SHARING_CONFIG.COMPRESSION.quality);
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

// Показ прогресса загрузки
function showUploadProgress(file) {
    const modal = document.getElementById('uploadProgressModal');
    const fileName = document.getElementById('uploadFileName');
    const fileSize = document.getElementById('uploadFileSize');
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    // Сбрасываем прогресс
    updateUploadProgress(0, "Подготовка...");
    
    modal.classList.add('active');
    isUploading = true;
    uploadCanceled = false;
}

// Обновление прогресса загрузки
function updateUploadProgress(progress, stage = "") {
    const progressBar = document.getElementById('uploadProgressBar');
    const progressText = document.getElementById('uploadProgressText');
    const stageElement = document.getElementById('uploadStage');
    
    progressBar.style.width = progress + '%';
    progressText.textContent = progress + '%';
    
    if (stage) {
        stageElement.textContent = stage;
    }
    
    uploadProgress = progress;
}

// Обновление этапа загрузки
function updateUploadStage(stage) {
    const stageElement = document.getElementById('uploadStage');
    stageElement.textContent = stage;
}

// Обновление статистики загрузки
function updateUploadStats(progress, elapsedTime, totalSize) {
    const speedElement = document.getElementById('uploadSpeed');
    const timeLeftElement = document.getElementById('uploadTimeLeft');
    
    if (progress > 0 && elapsedTime > 0) {
        const uploadedBytes = (totalSize * progress) / 100;
        const speed = uploadedBytes / (elapsedTime / 1000);
        
        speedElement.textContent = `Скорость: ${formatFileSize(speed)}/сек`;
        
        if (progress < 100) {
            const remainingBytes = totalSize - uploadedBytes;
            const remainingTime = (remainingBytes / speed) * 1000;
            timeLeftElement.textContent = `Осталось: ${formatTimeLeft(remainingTime)}`;
        } else {
            timeLeftElement.textContent = 'Завершено';
        }
    }
}

// Скрытие прогресса загрузки
function hideUploadProgress() {
    const modal = document.getElementById('uploadProgressModal');
    modal.classList.remove('active');
    isUploading = false;
    uploadProgress = 0;
}

// Отмена загрузки
function cancelUpload() {
    isUploading = false;
    uploadCanceled = true;
    hideUploadProgress();
    showNotification("Отправка файла отменена");
}

// Отправка сообщения с файлом
function sendFileMessage(file) {
    return new Promise(async (resolve, reject) => {
        if (uploadCanceled) {
            reject(new Error("Upload canceled"));
            return;
        }

        updateUploadStage("Чтение файла...");
        
        try {
            // Для больших файлов используем chunking
            if (file.size > FILE_SHARING_CONFIG.MAX_DATA_URL_SIZE) {
                await sendLargeFile(file);
            } else {
                await sendSmallFile(file);
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// Отправка маленького файла (до 10MB)
function sendSmallFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            if (uploadCanceled) {
                reject(new Error("Upload canceled"));
                return;
            }
            
            updateUploadProgress(50, "Отправка на сервер...");
            
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
                timestamp: Date.now(),
                compressed: file.size !== currentUploadingFile?.size
            };
            
            const messageId = database.ref('messages').push().key;
            const timestamp = Date.now();
            const chatId = currentChatId || generateChatId(currentChatWith);
            
            const messageData = {
                id: messageId,
                type: 'file',
                file: fileData,
                senderId: userId,
                senderName: currentUser,
                receiverId: currentChatWith,
                receiverName: currentChatWithName,
                timestamp: timestamp,
                chatId: chatId,
                read: false
            };
            
            // Сохраняем сообщение в базе данных
            database.ref('messages/' + messageId).set(messageData)
                .then(() => {
                    updateUploadProgress(100, "Файл отправлен!");
                    
                    // Обновляем информацию о чате
                    const lastMessageText = `📎 ${file.name}`;
                    updateChatInfo(chatId, lastMessageText, timestamp);
                    
                    setTimeout(resolve, 500);
                })
                .catch(reject);
        };
        
        reader.onerror = () => {
            reject(new Error("Ошибка чтения файла"));
        };
        
        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = (event.loaded / event.total) * 50; // 50% за чтение
                updateUploadProgress(progress, "Чтение файла...");
            }
        };
        
        reader.readAsDataURL(file);
    });
}

// Отправка большого файла (более 10MB)
function sendLargeFile(file) {
    return new Promise(async (resolve, reject) => {
        try {
            updateUploadStage("Обработка большого файла...");
            
            // Для больших файлов мы не можем хранить data URL, поэтому сохраняем только метаданные
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: null, // Не храним данные для больших файлов
                timestamp: Date.now(),
                compressed: false,
                isLargeFile: true,
                chunks: Math.ceil(file.size / FILE_SHARING_CONFIG.CHUNK_SIZE)
            };
            
            const messageId = database.ref('messages').push().key;
            const timestamp = Date.now();
            const chatId = currentChatId || generateChatId(currentChatWith);
            
            const messageData = {
                id: messageId,
                type: 'file',
                file: fileData,
                senderId: userId,
                senderName: currentUser,
                receiverId: currentChatWith,
                receiverName: currentChatWithName,
                timestamp: timestamp,
                chatId: chatId,
                read: false,
                largeFileNotice: `Файл слишком большой для предпросмотра: ${file.name} (${formatFileSize(file.size)})`
            };
            
            updateUploadProgress(70, "Сохранение информации о файле...");
            
            // Сохраняем сообщение в базе данных
            await database.ref('messages/' + messageId).set(messageData);
            
            updateUploadProgress(100, "Файл зарегистрирован!");
            
            // Обновляем информацию о чате
            const lastMessageText = `📎 ${file.name}`;
            updateChatInfo(chatId, lastMessageText, timestamp);
            
            setTimeout(resolve, 500);
            
        } catch (error) {
            reject(error);
        }
    });
}

// Вспомогательные функции

// Форматирование размера файла
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Форматирование длительности видео
function formatVideoDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

// Форматирование оставшегося времени
function formatTimeLeft(milliseconds) {
    const seconds = milliseconds / 1000;
    
    if (seconds < 60) {
        return Math.round(seconds) + ' сек';
    } else if (seconds < 3600) {
        return Math.round(seconds / 60) + ' мин';
    } else {
        return Math.round(seconds / 3600) + ' ч';
    }
}

// Получение типа файла
function getFileType(mimeType) {
    const types = {
        'image/jpeg': 'JPEG Image',
        'image/png': 'PNG Image',
        'image/gif': 'GIF Image',
        'image/webp': 'WebP Image',
        'image/bmp': 'BMP Image',
        'video/mp4': 'MP4 Video',
        'video/avi': 'AVI Video',
        'video/mkv': 'MKV Video',
        'video/mov': 'MOV Video',
        'video/webm': 'WebM Video',
        'audio/mpeg': 'MP3 Audio',
        'audio/wav': 'WAV Audio',
        'audio/ogg': 'OGG Audio',
        'audio/mp4': 'MP4 Audio',
        'application/pdf': 'PDF Document',
        'application/msword': 'Word Document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
        'application/vnd.ms-excel': 'Excel Document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Document',
        'application/vnd.ms-powerpoint': 'PowerPoint Presentation',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation',
        'text/plain': 'Text File',
        'text/html': 'HTML File',
        'text/css': 'CSS File',
        'text/javascript': 'JavaScript File',
        'application/zip': 'ZIP Archive',
        'application/x-rar-compressed': 'RAR Archive',
        'application/x-7z-compressed': '7-Zip Archive',
        'application/x-tar': 'TAR Archive',
        'application/gzip': 'GZIP Archive'
    };
    
    return types[mimeType] || mimeType;
}

// Получение иконки для типа файла
function getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return 'fa-file-image';
    if (mimeType.startsWith('video/')) return 'fa-file-video';
    if (mimeType.startsWith('audio/')) return 'fa-file-audio';
    if (mimeType === 'application/pdf') return 'fa-file-pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'fa-file-word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fa-file-excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fa-file-powerpoint';
    if (mimeType === 'text/plain') return 'fa-file-alt';
    if (mimeType.includes('text/')) return 'fa-file-code';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return 'fa-file-archive';
    
    return 'fa-file';
}

// Обработка отображения файлов в сообщениях
function displayFileMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'file-message');
    
    if (message.senderId === userId) {
        messageElement.classList.add('my-message');
    } else {
        messageElement.classList.add('other-message');
    }
    
    const date = new Date(message.timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let fileContent = '';
    const file = message.file;
    
    // Проверяем, это большой файл без данных
    if (file.isLargeFile) {
        fileContent = `
            <div class="file-message-content">
                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                    <i class="fas fa-file" style="font-size: 32px; color: #a0d2eb;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: 500; margin-bottom: 4px;">${file.name}</div>
                        <div style="font-size: 12px; opacity: 0.7;">
                            ${formatFileSize(file.size)} · ${getFileType(file.type)}
                            <br><span style="color: #FF9800;">⚠ Файл слишком большой для предпросмотра</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (file.type.startsWith('image/')) {
        fileContent = `
            <div class="file-message-content">
                <div class="file-preview" onclick="openFilePreview('${file.data}', '${file.name}')">
                    <img src="${file.data}" alt="${file.name}" 
                         style="max-width: 300px; max-height: 300px; border-radius: 8px; cursor: pointer;">
                    <div class="file-overlay" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        <i class="fas fa-expand"></i>
                    </div>
                </div>
                <div class="file-info" style="margin-top: 8px;">
                    <div style="font-weight: 500;">${file.name}</div>
                    <div style="font-size: 12px; opacity: 0.7;">
                        ${formatFileSize(file.size)} 
                        ${file.compressed ? '· ⚡ Оптимизирован' : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (file.type.startsWith('video/')) {
        fileContent = `
            <div class="file-message-content">
                <div class="file-preview">
                    <video controls style="max-width: 300px; max-height: 300px; border-radius: 8px;">
                        <source src="${file.data}" type="${file.type}">
                        Ваш браузер не поддерживает видео.
                    </video>
                </div>
                <div class="file-info" style="margin-top: 8px;">
                    <div style="font-weight: 500;">${file.name}</div>
                    <div style="font-size: 12px; opacity: 0.7;">${formatFileSize(file.size)} · Видео</div>
                </div>
            </div>
        `;
    } else if (file.type.startsWith('audio/')) {
        fileContent = `
            <div class="file-message-content">
                <div class="file-preview" style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                    <audio controls style="width: 100%;">
                        <source src="${file.data}" type="${file.type}">
                        Ваш браузер не поддерживает аудио.
                    </audio>
                </div>
                <div class="file-info" style="margin-top: 8px;">
                    <div style="font-weight: 500;">${file.name}</div>
                    <div style="font-size: 12px; opacity: 0.7;">${formatFileSize(file.size)} · Аудио</div>
                </div>
            </div>
        `;
    } else {
        fileContent = `
            <div class="file-message-content" 
                 style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer;"
                 onclick="downloadFile('${file.data}', '${file.name}')">
                <i class="fas ${getFileIcon(file.type)}" style="font-size: 32px; color: #a0d2eb;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 500; margin-bottom: 4px;">${file.name}</div>
                    <div style="font-size: 12px; opacity: 0.7;">
                        ${formatFileSize(file.size)} · ${getFileType(file.type)}
                    </div>
                </div>
                <i class="fas fa-download" style="font-size: 18px; opacity: 0.7;"></i>
            </div>
        `;
    }
    
    messageElement.innerHTML = `
        ${message.senderId !== userId ? `<div class="sender">${message.senderName}</div>` : ''}
        ${fileContent}
        <div class="timestamp">${timeString}</div>
    `;
    
    return messageElement;
}

// Открытие превью файла в полном размере
function openFilePreview(src, filename) {
    const modalHTML = `
        <div class="modal" id="fullscreenPreviewModal" style="background: rgba(0,0,0,0.95);">
            <div class="modal-content" style="background: transparent; border: none; box-shadow: none; max-width: 95vw; max-height: 95vh; width: auto;">
                <div style="position: fixed; top: 20px; right: 20px; z-index: 10000;">
                    <button id="closePreviewBtn" style="background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 50%; width: 50px; height: 50px; cursor: pointer; font-size: 18px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <img src="${src}" alt="${filename}" style="max-width: 100%; max-height: 90vh; border-radius: 8px;">
                <div style="text-align: center; color: white; margin-top: 15px; font-size: 16px;">${filename}</div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('fullscreenPreviewModal');
    const closeBtn = document.getElementById('closePreviewBtn');
    
    modal.classList.add('active');
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', function closeOnEsc(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeOnEsc);
        }
    });
}

// Скачивание файла
function downloadFile(dataUrl, filename) {
    if (!dataUrl) {
        showNotification("Этот файл слишком большой и не может быть скачан напрямую");
        return;
    }
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`Файл "${filename}" скачивается`);
}

// Показ менеджера файлов
function showFileManager() {
    const modal = document.getElementById('fileManagerModal');
    const content = document.getElementById('fileManagerContent');
    
    content.innerHTML = '<div class="empty-chat"><div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div><p>Загрузка файлов...</p></div>';
    
    // Загружаем файлы текущего чата
    loadChatFiles(currentChatId).then(files => {
        displayFilesInManager(files);
    });
    
    modal.classList.add('active');
}

// Загрузка файлов чата
function loadChatFiles(chatId) {
    return new Promise((resolve) => {
        if (!chatId) {
            resolve([]);
            return;
        }
        
        database.ref('messages').orderByChild('chatId').equalTo(chatId).once('value').then((snapshot) => {
            const files = [];
            
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const message = childSnapshot.val();
                    if (message.type === 'file' && message.file) {
                        files.push({
                            ...message.file,
                            messageId: message.id,
                            timestamp: message.timestamp,
                            senderName: message.senderName
                        });
                    }
                });
            }
            
            // Сортируем по дате (новые сверху)
            files.sort((a, b) => b.timestamp - a.timestamp);
            resolve(files);
        });
    });
}

// Отображение файлов в менеджере
function displayFilesInManager(files) {
    const content = document.getElementById('fileManagerContent');
    
    if (files.length === 0) {
        content.innerHTML = '<div class="empty-chat"><i class="fas fa-folder-open"></i><p>Файлы не найдены</p></div>';
        return;
    }
    
    let html = '';
    
    files.forEach((file, index) => {
        const canDownload = !file.isLargeFile && file.data;
        const clickAction = canDownload ? `onclick="downloadFile('${file.data}', '${file.name}')"` : '';
        const cursorStyle = canDownload ? 'cursor: pointer;' : 'cursor: not-allowed;';
        const opacityStyle = canDownload ? '' : 'opacity: 0.6;';
        
        html += `
            <div class="file-manager-item" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 8px; ${cursorStyle} ${opacityStyle}"
                 ${clickAction}>
                <i class="fas ${getFileIcon(file.type)}" style="font-size: 24px; color: #a0d2eb;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 500; margin-bottom: 4px;">${file.name}</div>
                    <div style="font-size: 12px; opacity: 0.7;">
                        ${formatFileSize(file.size)} · ${getFileType(file.type)}
                        ${file.isLargeFile ? '<br><span style="color: #FF9800;">⚠ Слишком большой для скачивания</span>' : ''}
                        <br>От: ${file.senderName} · ${new Date(file.timestamp).toLocaleDateString()}
                    </div>
                </div>
                ${canDownload ? '<i class="fas fa-download" style="opacity: 0.7;"></i>' : '<i class="fas fa-ban" style="opacity: 0.5;"></i>'}
            </div>
        `;
    });
    
    content.innerHTML = html;
}

// Модификация существующих функций
function patchExistingFunctions() {
    // Патчим функцию addMessageToChat для поддержки файлов
    if (typeof window.addMessageToChat === 'function') {
        const originalAddMessageToChat = window.addMessageToChat;
        
        window.addMessageToChat = function(message) {
            if (message.type === 'file') {
                const messageElement = displayFileMessage(message);
                if (messagesContainer) {
                    messagesContainer.appendChild(messageElement);
                    scrollToBottom();
                }
            } else {
                originalAddMessageToChat(message);
            }
        };
    }
    
    // Добавляем кнопку менеджера файлов в меню чата
    addFileManagerToChatMenu();
}

// Добавление кнопки менеджера файлов в меню чата
function addFileManagerToChatMenu() {
    const chatMenuContent = document.getElementById('chatMenuContent');
    if (chatMenuContent) {
        const fileManagerItem = document.createElement('div');
        fileManagerItem.className = 'chat-menu-item';
        fileManagerItem.innerHTML = '<i class="fas fa-folder-open"></i> Файлы чата';
        fileManagerItem.addEventListener('click', showFileManager);
        
        // Вставляем перед кнопкой "Очистить историю"
        const clearChatBtn = document.getElementById('clearChatBtn');
        if (clearChatBtn) {
            chatMenuContent.insertBefore(fileManagerItem, clearChatBtn);
        } else {
            chatMenuContent.appendChild(fileManagerItem);
        }
    }
}

// Инициализация модуля при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Ждем инициализации Firebase и других модулей
    const initInterval = setInterval(() => {
        if (typeof firebase !== 'undefined' && typeof database !== 'undefined') {
            clearInterval(initInterval);
            setTimeout(initFileSharing, 500);
        }
    }, 100);
});

// Экспорт функций для глобального использования
window.openFilePreview = openFilePreview;
window.downloadFile = downloadFile;
window.showFileManager = showFileManager;
window.formatFileSize = formatFileSize;

// Глобальные функции для отладки
window.fileSharingModule = {
    init: initFileSharing,
    config: FILE_SHARING_CONFIG,
    getStatus: () => ({
        isUploading,
        uploadProgress,
        currentFile: currentUploadingFile
    })
};

console.log("File Sharing module loaded");
