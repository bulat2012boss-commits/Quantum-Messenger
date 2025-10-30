/**
 * Quantum Browser v0.04
 * Поддержка всех доменов без ограничений
 */

class QuantumBrowser {
    constructor() {
        this.currentUrl = '';
        this.history = [];
        this.historyIndex = -1;
        this.isActive = false;
        this.init();
    }

    init() {
        this.createBrowserUI();
        this.setupEventListeners();
        this.setupLinkDetection();
        console.log('Quantum Browser v0.04 initialized - All domains supported');
    }

    createBrowserUI() {
        const browserHTML = `
            <div id="quantumBrowser" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--primary-bg); z-index: 10000; flex-direction: column;">
                <!-- Адаптивная шапка браузера -->
                <div class="browser-header" style="padding: 12px 10px; background: var(--header-bg); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 8px; backdrop-filter: blur(10px); flex-wrap: wrap;">
                    <!-- Кнопки навигации для мобильных -->
                    <div class="browser-controls" style="display: flex; gap: 6px; flex-shrink: 0;">
                        <button id="browserBack" class="browser-btn" style="min-width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--action-btn-bg); border: none; border-radius: 18px; color: var(--text-color); cursor: pointer; transition: all 0.2s ease; font-size: 14px;">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <button id="browserForward" class="browser-btn" style="min-width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--action-btn-bg); border: none; border-radius: 18px; color: var(--text-color); cursor: pointer; transition: all 0.2s ease; font-size: 14px;">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                    
                    <!-- Адресная строка -->
                    <div class="url-container" style="flex: 1; min-width: 0; display: flex; background: var(--search-bg); border-radius: 20px; padding: 4px; border: 1px solid var(--border-color); transition: all 0.3s ease; max-width: 100%;">
                        <div style="padding: 0 10px; display: flex; align-items: center; color: var(--text-color); opacity: 0.7; flex-shrink: 0;">
                            <i class="fas fa-lock" id="securityIcon" style="font-size: 12px;"></i>
                        </div>
                        <input type="text" id="browserUrl" style="flex: 1; padding: 8px 0; background: transparent; border: none; color: var(--text-color); font-size: 14px; outline: none; min-width: 50px;" placeholder="Введите URL...">
                    </div>
                    
                    <!-- Кнопки действий -->
                    <div class="browser-actions" style="display: flex; gap: 6px; flex-shrink: 0;">
                        <button id="browserRefresh" class="browser-btn" style="min-width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--action-btn-bg); border: none; border-radius: 18px; color: var(--text-color); cursor: pointer; transition: all 0.2s ease; font-size: 14px;">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button id="browserGo" class="browser-btn" style="min-width: 60px; height: 36px; display: flex; align-items: center; justify-content: center; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 18px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; font-size: 13px; padding: 0 12px;">
                            Перейти
                        </button>
                        <button id="browserClose" class="browser-btn" style="min-width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--action-btn-bg); border: none; border-radius: 18px; color: var(--text-color); cursor: pointer; transition: all 0.2s ease; font-size: 14px;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Контент браузера -->
                <iframe id="browserContent" style="flex: 1; width: 100%; border: none; background: white;"></iframe>
                
                <!-- Мобильный статус бар -->
                <div class="browser-status" style="padding: 8px 12px; background: var(--header-bg); border-top: 1px solid var(--border-color); font-size: 11px; color: var(--text-color); display: flex; justify-content: space-between; align-items: center;">
                    <span id="statusText" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Готов</span>
                    <div style="display: flex; gap: 12px; opacity: 0.7; flex-shrink: 0;">
                        <span style="font-size: 10px;">v0.04</span>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', browserHTML);
        this.browserElement = document.getElementById('quantumBrowser');
        this.browserContent = document.getElementById('browserContent');
        this.browserUrl = document.getElementById('browserUrl');
        this.browserStatus = document.getElementById('statusText');
        this.securityIcon = document.getElementById('securityIcon');
        
        this.addBrowserStyles();
    }

    addBrowserStyles() {
        const styles = `
            <style>
                /* Адаптивные стили для мобильных */
                @media (max-width: 480px) {
                    .browser-header {
                        padding: 10px 8px !important;
                        gap: 6px !important;
                    }
                    
                    .browser-btn {
                        min-width: 32px !important;
                        height: 32px !important;
                        font-size: 12px !important;
                    }
                    
                    #browserGo {
                        min-width: 50px !important;
                        font-size: 12px !important;
                        padding: 0 10px !important;
                    }
                    
                    .url-container {
                        border-radius: 16px !important;
                        padding: 3px !important;
                    }
                    
                    #browserUrl {
                        font-size: 13px !important;
                        padding: 6px 0 !important;
                    }
                    
                    .browser-status {
                        padding: 6px 10px !important;
                        font-size: 10px !important;
                    }
                }
                
                @media (max-width: 360px) {
                    .browser-header {
                        padding: 8px 6px !important;
                    }
                    
                    .browser-controls,
                    .browser-actions {
                        gap: 4px !important;
                    }
                    
                    .browser-btn {
                        min-width: 30px !important;
                        height: 30px !important;
                    }
                }

                /* Стили для ссылок в сообщениях */
                .quantum-link {
                    background: linear-gradient(135deg, rgba(79, 172, 254, 0.15), rgba(0, 242, 254, 0.15)) !important;
                    color: #4facfe !important;
                    text-decoration: none !important;
                    padding: 4px 10px !important;
                    border-radius: 8px !important;
                    border: 1px solid rgba(79, 172, 254, 0.4) !important;
                    margin: 2px 1px !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                    display: inline-block !important;
                    font-size: 14px !important;
                    line-height: 1.4 !important;
                    cursor: pointer !important;
                    position: relative !important;
                    z-index: 5 !important;
                }
                
                .quantum-link:hover {
                    background: linear-gradient(135deg, rgba(79, 172, 254, 0.25), rgba(0, 242, 254, 0.25)) !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3) !important;
                }
                
                /* Множественные ссылки в одном сообщении */
                .multiple-links {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 8px !important;
                    margin: 8px 0 !important;
                }
                
                .link-item {
                    background: var(--other-msg-bg) !important;
                    border: 1px solid var(--border-color) !important;
                    border-radius: 12px !important;
                    padding: 12px !important;
                    cursor: pointer !important;
                    transition: all 0.3s ease !important;
                    position: relative !important;
                    z-index: 10 !important;
                }
                
                .link-item:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.1) !important;
                }
                
                .link-title {
                    font-weight: 600 !important;
                    color: var(--text-color) !important;
                    margin-bottom: 4px !important;
                    font-size: 14px !important;
                }
                
                .link-description {
                    color: var(--text-color) !important;
                    opacity: 0.8 !important;
                    font-size: 12px !important;
                    line-height: 1.4 !important;
                }
                
                .link-url {
                    color: #4facfe !important;
                    font-size: 11px !important;
                    margin-top: 6px !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 4px !important;
                }
                
                /* Предотвращение конфликта с системой ответов */
                .message {
                    position: relative !important;
                }
                
                .link-item, .quantum-link {
                    pointer-events: auto !important;
                    touch-action: manipulation !important;
                }
                
                /* Для длинных сообщений с ссылками */
                .message-text-with-links {
                    line-height: 1.5 !important;
                }
                
                /* Ховер эффекты */
                .browser-btn:hover {
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                }
                
                .url-container:focus-within {
                    border-color: #4facfe !important;
                    box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2) !important;
                }
                
                #browserGo:hover {
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4) !important;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    setupEventListeners() {
        // Кнопка закрытия
        document.getElementById('browserClose').addEventListener('click', () => {
            this.hide();
        });

        // Кнопка перехода
        document.getElementById('browserGo').addEventListener('click', () => {
            this.navigate();
        });

        // Ввод URL по Enter
        this.browserUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.navigate();
            }
        });

        // Кнопки навигации
        document.getElementById('browserBack').addEventListener('click', () => {
            this.goBack();
        });

        document.getElementById('browserForward').addEventListener('click', () => {
            this.goForward();
        });

        document.getElementById('browserRefresh').addEventListener('click', () => {
            this.refresh();
        });

        // Отслеживание загрузки страницы
        this.browserContent.addEventListener('load', () => {
            this.updateStatus('Загружено');
            this.updateUrlBar();
            this.securityIcon.className = this.currentUrl.startsWith('https://') ? 
                'fas fa-lock' : 'fas fa-lock-open';
        });

        this.browserContent.addEventListener('loadstart', () => {
            this.updateStatus('Загрузка...');
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.hide();
            }
        });

        // Адаптация при изменении размера окна
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        // Можно добавить дополнительную логику адаптации при изменении размера
        console.log('Window resized, browser is adaptive');
    }

    setupLinkDetection() {
        // Используем делегирование событий для предотвращения конфликтов
        this.handleMessageClick = (e) => {
            // Проверяем, кликнули ли мы на ссылку (предотвращаем конфликт с системой ответов)
            const linkElement = e.target.closest('.link-item, .quantum-link');
            
            if (linkElement) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const url = linkElement.getAttribute('data-url') || linkElement.textContent;
                
                if (url && this.isValidUrl(url)) {
                    this.openBrowser(this.normalizeUrl(url));
                }
                return false;
            }
            
            // Для обычного текста с URL (только если клик не на самом сообщении для ответа)
            if (e.target.classList.contains('message') || e.target.closest('.message')) {
                const messageElement = e.target.closest('.message');
                const textElement = messageElement.querySelector('div:not(.sender):not(.timestamp)');
                
                if (textElement && !textElement.querySelector('.link-item, .quantum-link')) {
                    const text = textElement.textContent || textElement.innerText;
                    const urls = this.extractAllUrlsFromText(text);
                    
                    if (urls.length === 1) {
                        // Если одна ссылка - открываем её
                        e.preventDefault();
                        e.stopPropagation();
                        this.openBrowser(this.normalizeUrl(urls[0]));
                    } else if (urls.length > 1) {
                        // Если много ссылок - обрабатываем через processMessageLinks
                        this.processMessageLinks(messageElement);
                    }
                }
            }
        };

        // Используем capture phase чтобы перехватить событие раньше системы ответов
        document.addEventListener('click', this.handleMessageClick, true);

        // Обработчик новых сообщений
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('message')) {
                        setTimeout(() => {
                            this.processMessageLinks(node);
                        }, 100);
                    }
                });
            });
        });

        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            this.observer.observe(messagesContainer, {
                childList: true,
                subtree: true
            });
        }

        // Обрабатываем существующие сообщения
        setTimeout(() => {
            const messages = document.querySelectorAll('.message');
            messages.forEach(message => this.processMessageLinks(message));
        }, 1500);
    }

    extractAllUrlsFromText(text) {
        if (!text) return [];
        
        // Улучшенное регулярное выражение для поиска URL
        const urlRegex = /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+|[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z]{2,}(?:\/[^\s<>"]*)?)/gi;
        const matches = text.match(urlRegex);
        return matches ? matches.filter(url => url.length > 4) : []; // Фильтруем слишком короткие "ссылки"
    }

    isValidUrl(string) {
        if (!string || string.length < 5) return false;
        
        // Проверяем, похоже ли на URL (более простая проверка)
        const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z]{2,}/;
        return urlPattern.test(string);
    }

    normalizeUrl(url) {
        if (!url) return '';
        
        url = url.trim();
        
        // Удаляем возможные конечные знаки препинания
        url = url.replace(/[.,;:!?)]+$/, '');
        
        if (url.startsWith('www.')) {
            return 'https://' + url;
        } else if (!url.startsWith('http')) {
            return 'https://' + url;
        }
        return url;
    }

    processMessageLinks(messageElement) {
        const messageText = messageElement.querySelector('div:not(.sender):not(.timestamp)');
        if (!messageText) return;

        const text = messageText.textContent || messageText.innerText;
        const urls = this.extractAllUrlsFromText(text);
        
        if (urls.length > 0) {
            let newContent = text;
            
            if (urls.length === 1) {
                // Одна ссылка - создаем красивую карточку
                const url = urls[0];
                const domain = this.extractDomain(url);
                const linkHTML = `
                    <div class="link-item" data-url="${url}" onclick="event.stopPropagation(); quantumBrowser.openBrowser('${this.normalizeUrl(url)}')">
                        <div class="link-title">${this.getSiteName(domain)}</div>
                        <div class="link-description">Нажмите чтобы открыть в браузере</div>
                        <div class="link-url">
                            <i class="fas fa-external-link-alt" style="font-size: 10px;"></i>
                            ${this.cleanUrlForDisplay(url)}
                        </div>
                    </div>
                `;
                newContent = linkHTML;
            } else {
                // Несколько ссылок - создаем список карточек
                const linksHTML = urls.map(url => {
                    const domain = this.extractDomain(url);
                    return `
                        <div class="link-item" data-url="${url}" onclick="event.stopPropagation(); quantumBrowser.openBrowser('${this.normalizeUrl(url)}')">
                            <div class="link-title">${this.getSiteName(domain)}</div>
                            <div class="link-url">
                                <i class="fas fa-external-link-alt" style="font-size: 10px;"></i>
                                ${this.cleanUrlForDisplay(url)}
                            </div>
                        </div>
                    `;
                }).join('');
                
                newContent = `
                    <div class="multiple-links">
                        ${linksHTML}
                    </div>
                `;
            }
            
            // Сохраняем оригинальный текст если есть другой контент
            const hasOtherContent = text.trim() !== urls.join(' ').trim();
            if (hasOtherContent) {
                const otherContent = this.removeUrlsFromText(text, urls);
                if (otherContent.trim()) {
                    newContent = `
                        <div class="message-text-with-links">
                            <div style="margin-bottom: 8px; white-space: pre-wrap;">${otherContent.trim()}</div>
                            ${newContent}
                        </div>
                    `;
                }
            }
            
            messageText.innerHTML = newContent;
        }
    }

    removeUrlsFromText(text, urls) {
        let result = text;
        urls.forEach(url => {
            result = result.replace(url, '');
        });
        return result;
    }

    cleanUrlForDisplay(url) {
        // Очищаем URL для красивого отображения
        return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    }

    extractDomain(url) {
        try {
            const normalizedUrl = this.normalizeUrl(url);
            const domain = new URL(normalizedUrl).hostname;
            return domain.replace('www.', '');
        } catch {
            // Если не удалось распарсить URL, возвращаем очищенную версию
            return this.cleanUrlForDisplay(url);
        }
    }

    getSiteName(domain) {
        // База популярных доменов для красивого отображения
        const sites = {
            // Социальные сети
            'youtube.com': 'YouTube',
            'twitter.com': 'Twitter',
            'facebook.com': 'Facebook',
            'instagram.com': 'Instagram',
            'tiktok.com': 'TikTok',
            'linkedin.com': 'LinkedIn',
            'reddit.com': 'Reddit',
            'pinterest.com': 'Pinterest',
            'telegram.org': 'Telegram',
            'discord.com': 'Discord',
            'vk.com': 'ВКонтакте',
            'ok.ru': 'Одноклассники',
            
            // Поисковики
            'google.com': 'Google',
            'yandex.ru': 'Яндекс',
            'bing.com': 'Bing',
            'duckduckgo.com': 'DuckDuckGo',
            
            // Почта
            'gmail.com': 'Gmail',
            'mail.ru': 'Mail.ru',
            'outlook.com': 'Outlook',
            'yahoo.com': 'Yahoo',
            
            // Видео
            'twitch.tv': 'Twitch',
            'vimeo.com': 'Vimeo',
            'dailymotion.com': 'Dailymotion',
            
            // Музыка
            'spotify.com': 'Spotify',
            'soundcloud.com': 'SoundCloud',
            'yandex.music': 'Yandex Music',
            
            // Облака
            'drive.google.com': 'Google Drive',
            'dropbox.com': 'Dropbox',
            'mega.nz': 'MEGA',
            'yadi.sk': 'Яндекс.Диск',
            
            // Новости
            'bbc.com': 'BBC',
            'cnn.com': 'CNN',
            'rbc.ru': 'РБК',
            'lenta.ru': 'Лента.ру',
            'ria.ru': 'РИА Новости',
            
            // IT и разработка
            'github.com': 'GitHub',
            'gitlab.com': 'GitLab',
            'stackoverflow.com': 'Stack Overflow',
            'medium.com': 'Medium',
            'habr.com': 'Habr',
            
            // Электронная коммерция
            'amazon.com': 'Amazon',
            'ebay.com': 'eBay',
            'aliexpress.com': 'AliExpress',
            'ozon.ru': 'OZON',
            'wildberries.ru': 'Wildberries',
            
            // Образование
            'wikipedia.org': 'Wikipedia',
            'coursera.org': 'Coursera',
            'udemy.com': 'Udemy',
            'stepik.org': 'Stepik',
            
            // Разное
            'netflix.com': 'Netflix',
            'imdb.com': 'IMDb',
            'weather.com': 'Weather',
            'booking.com': 'Booking.com',
            'tripadvisor.com': 'TripAdvisor'
        };
        
        // Если домен есть в базе - возвращаем красивое имя, иначе отображаем домен
        return sites[domain] || `Сайт: ${domain}`;
    }

    navigate(url = null) {
        let targetUrl = url || this.browserUrl.value.trim();
        
        if (!targetUrl) {
            this.showHomePage();
            return;
        }

        // Если это поисковый запрос, а не URL
        if (!this.looksLikeUrl(targetUrl)) {
            targetUrl = 'https://google.com/search?q=' + encodeURIComponent(targetUrl);
        } else {
            targetUrl = this.normalizeUrl(targetUrl);
        }

        this.currentUrl = targetUrl;
        
        if (this.history[this.historyIndex] !== targetUrl) {
            this.history = this.history.slice(0, this.historyIndex + 1);
            this.history.push(targetUrl);
            this.historyIndex = this.history.length - 1;
        }

        try {
            this.browserContent.src = targetUrl;
            this.updateStatus('Загрузка...');
        } catch (error) {
            this.showError('Ошибка загрузки: ' + error.message);
        }
    }

    looksLikeUrl(text) {
        // Проверяем, похоже ли на URL
        return /^((https?:\/\/)|(www\.))?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+/.test(text);
    }

    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.navigate(this.history[this.historyIndex]);
        }
    }

    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.navigate(this.history[this.historyIndex]);
        }
    }

    refresh() {
        if (this.currentUrl) {
            this.browserContent.src = this.currentUrl;
            this.updateStatus('Обновление...');
        }
    }

    updateUrlBar() {
        this.browserUrl.value = this.currentUrl;
    }

    updateStatus(message) {
        if (this.browserStatus) {
            this.browserStatus.textContent = message;
        }
    }

    showError(message) {
        this.updateStatus('Ошибка: ' + message);
        this.browserContent.srcdoc = `
            <html>
                <head><title>Ошибка</title></head>
                <body style="font-family: system-ui, sans-serif; padding: 20px; text-align: center; background: #f5f5f5; color: #333;">
                    <div style="max-width: 400px; margin: 50px auto; padding: 30px; background: white; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <div style="font-size: 48px; margin-bottom: 20px;">🌐</div>
                        <h2 style="margin-bottom: 10px; color: #e74c3c;">Ошибка загрузки</h2>
                        <p style="margin-bottom: 20px; opacity: 0.8;">${message}</p>
                        <button onclick="window.history.back()" style="padding: 10px 20px; background: #4facfe; color: white; border: none; border-radius: 20px; cursor: pointer;">
                            Назад
                        </button>
                    </div>
                </body>
            </html>
        `;
    }

    show(url = null) {
        this.browserElement.style.display = 'flex';
        this.isActive = true;
        
        if (url) {
            this.navigate(url);
        } else {
            this.showHomePage();
        }
        
        setTimeout(() => {
            this.browserUrl.focus();
        }, 100);
    }

    hide() {
        this.browserElement.style.display = 'none';
        this.isActive = false;
    }

    showHomePage() {
        this.browserContent.srcdoc = `
            <html>
                <head>
                    <title>Quantum Browser</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { 
                            font-family: system-ui, sans-serif; 
                            margin: 0; 
                            padding: 20px;
                            background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
                            color: white;
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .container { 
                            text-align: center;
                            max-width: 500px;
                            width: 100%;
                        }
                        .logo { 
                            font-size: clamp(48px, 10vw, 64px); 
                            margin-bottom: 20px;
                            background: linear-gradient(135deg, #4facfe, #00f2fe);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        }
                        h1 { 
                            margin-bottom: 10px;
                            font-size: clamp(1.5em, 5vw, 2.5em);
                            background: linear-gradient(135deg, #4facfe, #00f2fe);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        }
                        .features {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                            gap: 15px;
                            margin-top: 30px;
                        }
                        .feature {
                            background: rgba(255,255,255,0.05);
                            padding: 15px;
                            border-radius: 12px;
                            border: 1px solid rgba(255,255,255,0.1);
                            font-size: clamp(12px, 3vw, 14px);
                        }
                        @media (max-width: 480px) {
                            body { padding: 15px; }
                            .features { gap: 10px; }
                            .feature { padding: 12px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">⚛</div>
                        <h1>Quantum Browser</h1>
                        <div style="opacity: 0.8; margin-bottom: 20px; font-size: clamp(14px, 4vw, 16px);">
                            Поддержка всех доменов • v0.04
                        </div>
                        
                        <div class="features">
                            <div class="feature">
                                <div style="font-size: 20px; margin-bottom: 8px;">🌍</div>
                                <div>Все домены</div>
                            </div>
                            <div class="feature">
                                <div style="font-size: 20px; margin-bottom: 8px;">🔗</div>
                                <div>Множественные ссылки</div>
                            </div>
                            <div class="feature">
                                <div style="font-size: 20px; margin-bottom: 8px;">📱</div>
                                <div>Адаптивный дизайн</div>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }

    openBrowser(url = null) {
        this.show(url);
    }

    closeBrowser() {
        this.hide();
    }
}

// Создаем глобальный экземпляр браузера
window.quantumBrowser = new QuantumBrowser();

// Интеграция с основным приложением
function integrateBrowserWithMessenger() {
    console.log('Quantum Browser v0.04 - All domains supported');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', integrateBrowserWithMessenger);
} else {
    integrateBrowserWithMessenger();
}