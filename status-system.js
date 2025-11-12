// =============================================
// Quantum Messenger - Wikipedia Search Enhanced
// Версия: 2.0
// =============================================

class WikipediaSearchEnhanced {
    constructor() {
        this.isActive = false;
        this.currentQuery = '';
        this.searchResults = [];
        this.selectedArticle = null;
        this.init();
    }

    init() {
        this.createSearchContainer();
        this.setupEventListeners();
        console.log('Wikipedia Search Enhanced initialized');
    }

    // Создание улучшенного контейнера для поиска Wikipedia
    createSearchContainer() {
        const container = document.createElement('div');
        container.id = 'wikipediaSearchContainer';
        container.className = 'wikipedia-search-container';
        container.style.display = 'none';
        
        container.innerHTML = `
            <div class="wikipedia-header">
                <div class="wikipedia-logo">
                    <i class="fab fa-wikipedia-w"></i>
                    <span>Wikipedia Search</span>
                </div>
                <button class="close-wiki-search" id="closeWikiSearch">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="wikipedia-search-input">
                <div class="search-input-wrapper">
                    <i class="fas fa-search"></i>
                    <input type="text" id="wikiSearchInput" placeholder="Поиск в Wikipedia...">
                    <button id="performWikiSearch" class="search-btn">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
            
            <div class="wikipedia-tabs">
                <div class="wiki-tab active" data-tab="search">Поиск</div>
                <div class="wiki-tab" data-tab="history">История</div>
                <div class="wiki-tab" data-tab="saved">Сохранённые</div>
            </div>
            
            <div class="wikipedia-content">
                <div class="wiki-tab-content active" id="tab-search">
                    <div class="wikipedia-results" id="wikipediaResults">
                        <div class="wiki-placeholder">
                            <i class="fab fa-wikipedia-w"></i>
                            <p>Введите запрос для поиска в Wikipedia</p>
                            <small>Например: "Павел Дуров" </small>
                        </div>
                    </div>
                </div>
                
                <div class="wiki-tab-content" id="tab-history">
                    <div class="wiki-history-list" id="wikiHistoryList">
                        <div class="wiki-placeholder">
                            <i class="fas fa-history"></i>
                            <p>Здесь будет история ваших поисков</p>
                        </div>
                    </div>
                </div>
                
                <div class="wiki-tab-content" id="tab-saved">
                    <div class="wiki-saved-list" id="wikiSavedList">
                        <div class="wiki-placeholder">
                            <i class="fas fa-bookmark"></i>
                            <p>Сохраняйте интересные статьи для быстрого доступа</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Полноэкранный просмотр статьи -->
            <div class="wikipedia-article-view" id="wikiArticleView" style="display: none;">
                <div class="article-view-header">
                    <button class="back-to-results" id="backToResults">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="article-view-title" id="articleViewTitle">Загрузка...</div>
                    <div class="article-view-actions">
                        <button class="article-action-btn" id="saveArticleBtn" title="Сохранить">
                            <i class="far fa-bookmark"></i>
                        </button>
                        <button class="article-action-btn" id="shareArticleBtn" title="Поделиться">
                            <i class="fas fa-share"></i>
                        </button>
                    </div>
                </div>
                
                <div class="article-view-content" id="articleViewContent">
                    <div class="article-loading">
                        <div class="loading-dots">
                            <div class="loading-dot"></div>
                            <div class="loading-dot"></div>
                            <div class="loading-dot"></div>
                        </div>
                        <p>Загружаем статью...</p>
                    </div>
                </div>
                
                <div class="article-view-footer">
                    <button class="footer-btn primary" id="sendArticleBtn">
                        <i class="fas fa-paper-plane"></i>
                        <span>Отправить в чат</span>
                    </button>
                    <button class="footer-btn secondary" id="openWikipediaBtn">
                        <i class="fas fa-external-link-alt"></i>
                        <span>Открыть в Wikipedia</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(container);
        this.applyEnhancedStyles();
        this.loadSearchHistory();
        this.loadSavedArticles();
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const wikiSearchInput = document.getElementById('wikiSearchInput');
        const performSearchBtn = document.getElementById('performWikiSearch');
        const closeWikiSearch = document.getElementById('closeWikiSearch');
        const backToResults = document.getElementById('backToResults');
        const sendArticleBtn = document.getElementById('sendArticleBtn');
        const openWikipediaBtn = document.getElementById('openWikipediaBtn');
        const saveArticleBtn = document.getElementById('saveArticleBtn');
        const shareArticleBtn = document.getElementById('shareArticleBtn');

        // Обработчик ввода в поле сообщения
        messageInput.addEventListener('input', (e) => {
            this.handleMessageInput(e.target.value);
        });

        // Поиск при вводе (с задержкой)
        let searchTimeout;
        wikiSearchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (e.target.value.trim().length > 2) {
                    this.performSearch();
                }
            }, 500);
        });

        // Поиск при нажатии Enter
        wikiSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Кнопка поиска
        performSearchBtn.addEventListener('click', () => {
            this.performSearch();
        });

        // Закрытие поиска
        closeWikiSearch.addEventListener('click', () => {
            this.hideSearch();
        });

        // Назад к результатам
        backToResults.addEventListener('click', () => {
            this.hideArticleView();
        });

        // Отправка статьи в чат
        sendArticleBtn.addEventListener('click', () => {
            this.sendArticleToChat();
        });

        // Открытие полной статьи
        openWikipediaBtn.addEventListener('click', () => {
            this.openFullArticle();
        });

        // Сохранение статьи
        saveArticleBtn.addEventListener('click', () => {
            this.toggleSaveArticle();
        });

        // Поделиться статьей
        shareArticleBtn.addEventListener('click', () => {
            this.shareArticle();
        });

        // Переключение вкладок
        document.querySelectorAll('.wiki-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Закрытие по клику вне контейнера
        document.addEventListener('click', (e) => {
            const container = document.getElementById('wikipediaSearchContainer');
            if (container && !container.contains(e.target) && e.target !== messageInput) {
                this.hideSearch();
            }
        });

        // Обработка жестов на мобильных устройствах
        this.setupMobileGestures();
    }

    // Настройка жестов для мобильных устройств
    setupMobileGestures() {
        let startY = 0;
        const articleView = document.getElementById('wikiArticleView');
        
        articleView.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });
        
        articleView.addEventListener('touchmove', (e) => {
            if (!startY) return;
            
            const currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            // Свайп вниз для закрытия
            if (diff > 100 && e.cancelable) {
                e.preventDefault();
                this.hideArticleView();
            }
        });
    }

    // Переключение вкладок
    switchTab(tabName) {
        // Обновляем активные вкладки
        document.querySelectorAll('.wiki-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.wiki-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        // Загружаем контент для вкладки
        if (tabName === 'history') {
            this.loadSearchHistory();
        } else if (tabName === 'saved') {
            this.loadSavedArticles();
        }
    }

    // Обработка ввода в поле сообщения
    handleMessageInput(text) {
        const wikiMatch = text.match(/^@wiki\s+(.+)/i);
        
        if (wikiMatch && wikiMatch[1].trim().length > 0) {
            this.currentQuery = wikiMatch[1].trim();
            this.showSearch();
            this.performSearch();
        } else if (text.startsWith('@wiki') && text.trim() === '@wiki') {
            this.showSearch();
        } else if (this.isActive && !text.startsWith('@wiki')) {
            this.hideSearch();
        }
    }

    // Показать поиск Wikipedia
    showSearch() {
        this.isActive = true;
        const container = document.getElementById('wikipediaSearchContainer');
        const wikiSearchInput = document.getElementById('wikiSearchInput');
        
        container.style.display = 'flex';
        wikiSearchInput.value = this.currentQuery;
        wikiSearchInput.focus();
        
        // На мобильных - полноэкранный режим
        if (this.isMobile()) {
            container.classList.add('mobile-fullscreen');
        }
        
        if (this.currentQuery) {
            setTimeout(() => {
                wikiSearchInput.setSelectionRange(6, 6 + this.currentQuery.length);
            }, 100);
        }
    }

    // Скрыть поиск Wikipedia
    hideSearch() {
        this.isActive = false;
        const container = document.getElementById('wikipediaSearchContainer');
        const messageInput = document.getElementById('messageInput');
        
        container.style.display = 'none';
        container.classList.remove('mobile-fullscreen');
        this.hideArticleView();
        
        // Очищаем @wiki из поля ввода
        if (messageInput.value.startsWith('@wiki')) {
            messageInput.value = '';
        }
    }

    // Проверка мобильного устройства
    isMobile() {
        return window.innerWidth <= 768;
    }

    // Выполнить поиск
    async performSearch() {
        const query = document.getElementById('wikiSearchInput').value.trim();
        const resultsContainer = document.getElementById('wikipediaResults');
        
        if (!query) {
            resultsContainer.innerHTML = this.getPlaceholderHTML('search');
            return;
        }

        // Сохраняем в историю
        this.addToSearchHistory(query);

        resultsContainer.innerHTML = this.getLoadingHTML('Ищем в Wikipedia...');

        try {
            const results = await this.searchWikipedia(query);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Wikipedia search error:', error);
            resultsContainer.innerHTML = this.getErrorHTML('Ошибка поиска. Проверьте подключение к интернету.');
        }
    }

    // Поиск в Wikipedia API
    async searchWikipedia(query) {
        const searchUrl = `https://ru.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=10&format=json&origin=*`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        return data.query.search;
    }

    // Отображение результатов поиска
    displaySearchResults(results) {
        const resultsContainer = document.getElementById('wikipediaResults');
        
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = this.getPlaceholderHTML('no-results');
            return;
        }

        let resultsHTML = '<div class="wiki-results-list">';
        
        results.forEach((result, index) => {
            const isSaved = this.isArticleSaved(result.pageid);
            resultsHTML += `
                <div class="wiki-result-item" data-pageid="${result.pageid}">
                    <div class="result-number">${index + 1}</div>
                    <div class="result-content">
                        <div class="result-header">
                            <div class="result-title">${result.title}</div>
                            <button class="result-save-btn ${isSaved ? 'saved' : ''}" 
                                    data-pageid="${result.pageid}" 
                                    data-title="${result.title}">
                                <i class="${isSaved ? 'fas' : 'far'} fa-bookmark"></i>
                            </button>
                        </div>
                        <div class="result-snippet">${this.cleanSnippet(result.snippet)}...</div>
                        <div class="result-meta">
                            <span class="result-wordcount">${this.formatWordCount(result.wordcount)} слов</span>
                            <span class="result-timestamp">${this.formatTimestamp(result.timestamp)}</span>
                        </div>
                        <div class="result-actions">
                            <button class="result-action-btn preview-btn" data-pageid="${result.pageid}">
                                <i class="fas fa-eye"></i>
                                <span>Читать</span>
                            </button>
                            <button class="result-action-btn send-btn" data-pageid="${result.pageid}" data-title="${result.title}">
                                <i class="fas fa-paper-plane"></i>
                                <span>Отправить</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        resultsHTML += '</div>';
        resultsContainer.innerHTML = resultsHTML;

        // Добавляем обработчики для кнопок
        this.setupResultItemListeners();
    }

    // Очистка сниппета от HTML тегов
    cleanSnippet(snippet) {
        return snippet.replace(/<[^>]*>/g, '');
    }

    // Форматирование количества слов
    formatWordCount(wordcount) {
        return wordcount ? wordcount.toLocaleString('ru-RU') : '0';
    }

    // Форматирование временной метки
    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleDateString('ru-RU');
    }

    // Настройка обработчиков для элементов результатов
    setupResultItemListeners() {
        // Кнопки сохранения
        document.querySelectorAll('.result-save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pageId = btn.dataset.pageid;
                const title = btn.dataset.title;
                this.toggleSaveArticle(pageId, title, btn);
            });
        });

        // Кнопки чтения
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pageId = btn.dataset.pageid;
                this.showArticleView(pageId);
            });
        });

        // Кнопки отправки
        document.querySelectorAll('.send-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pageId = btn.dataset.pageid;
                const title = btn.dataset.title;
                this.sendArticleToChat(title, pageId);
            });
        });

        // Клик по всему элементу (открывает просмотр)
        document.querySelectorAll('.wiki-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.dataset.pageid;
                this.showArticleView(pageId);
            });
        });
    }

    // Показать полноэкранный просмотр статьи
    async showArticleView(pageId) {
        const articleView = document.getElementById('wikiArticleView');
        const articleContent = document.getElementById('articleViewContent');
        
        articleView.style.display = 'flex';
        articleContent.innerHTML = this.getLoadingHTML('Загружаем статью...');
        
        try {
            const article = await this.getArticleContent(pageId);
            this.displayArticleView(article);
            this.selectedArticle = article;
            
            // Обновляем кнопку сохранения
            this.updateSaveButton();
        } catch (error) {
            console.error('Error loading article:', error);
            articleContent.innerHTML = this.getErrorHTML('Не удалось загрузить статью');
        }
    }

    // Получить содержимое статьи
    async getArticleContent(pageId) {
        const articleUrl = `https://ru.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|info&exintro=true&explaintext=true&inprop=url&pithumbsize=800&pageids=${pageId}&format=json&origin=*`;
        
        const response = await fetch(articleUrl);
        const data = await response.json();
        
        const page = data.query.pages[pageId];
        return {
            title: page.title,
            extract: page.extract,
            thumbnail: page.thumbnail,
            fullurl: page.fullurl,
            pageid: pageId,
            description: this.generateDescription(page.extract)
        };
    }

    // Генерация описания из текста
    generateDescription(extract) {
        const sentences = extract.split('. ').slice(0, 3);
        return sentences.join('. ') + (sentences.length === 3 ? '...' : '');
    }

    // Отображение статьи в полноэкранном режиме
    displayArticleView(article) {
        const articleTitle = document.getElementById('articleViewTitle');
        const articleContent = document.getElementById('articleViewContent');
        
        articleTitle.textContent = article.title;
        
        let contentHTML = '';
        
        // Заголовок и изображение
        if (article.thumbnail) {
            contentHTML += `
                <div class="article-hero">
                    <div class="article-image">
                        <img src="${article.thumbnail.source}" 
                             alt="${article.title}"
                             loading="lazy"
                             onerror="this.style.display='none'">
                    </div>
                    <h1 class="article-main-title">${article.title}</h1>
                </div>
            `;
        } else {
            contentHTML += `<h1 class="article-main-title no-image">${article.title}</h1>`;
        }
        
        // Основной контент
        contentHTML += `
            <div class="article-body">
                ${this.formatArticleText(article.extract)}
            </div>
            
            <div class="article-source">
                <div class="source-info">
                    <i class="fab fa-wikipedia-w"></i>
                    <span>Источник: Wikipedia</span>
                </div>
                <a href="${article.fullurl}" target="_blank" class="source-link">
                    Читать полную статью на Wikipedia
                    <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        `;
        
        articleContent.innerHTML = contentHTML;
        
        // Добавляем обработчики для изображений
        this.setupImageZoom();
    }

    // Форматирование текста статьи
    formatArticleText(text) {
        if (!text) return '<p>Содержание статьи недоступно.</p>';
        
        const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
        let formattedHTML = '';
        
        paragraphs.forEach(paragraph => {
            if (paragraph.length > 100) {
                formattedHTML += `<p>${paragraph}</p>`;
            } else if (paragraph.trim().length > 0) {
                formattedHTML += `<p class="lead">${paragraph}</p>`;
            }
        });
        
        return formattedHTML;
    }

    // Настройка зума для изображений
    setupImageZoom() {
        document.querySelectorAll('.article-body img').forEach(img => {
            img.addEventListener('click', () => {
                this.showImageZoom(img.src, img.alt);
            });
        });
    }

    // Показ увеличенного изображения
    showImageZoom(src, alt) {
        const zoomOverlay = document.createElement('div');
        zoomOverlay.className = 'image-zoom-overlay';
        zoomOverlay.innerHTML = `
            <div class="zoom-container">
                <button class="zoom-close">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${src}" alt="${alt}">
                <div class="zoom-caption">${alt}</div>
            </div>
        `;
        
        document.body.appendChild(zoomOverlay);
        
        // Обработчики для закрытия
        zoomOverlay.addEventListener('click', (e) => {
            if (e.target === zoomOverlay || e.target.closest('.zoom-close')) {
                document.body.removeChild(zoomOverlay);
            }
        });
    }

    // Скрыть просмотр статьи
    hideArticleView() {
        const articleView = document.getElementById('wikiArticleView');
        articleView.style.display = 'none';
        this.selectedArticle = null;
    }

    // Отправить статью в чат
    sendArticleToChat(title = null, pageId = null) {
        const article = this.selectedArticle || { title: title, pageid: pageId };
        
        if (!article.title) {
            this.showNotification('Выберите статью для отправки');
            return;
        }

        const messageInput = document.getElementById('messageInput');
        const articleUrl = `https://ru.wikipedia.org/?curid=${article.pageid}`;
        
        // Формируем красивое сообщение
        const message = `📚 **${article.title}**\n${article.description || ''}\n\n🔗 ${articleUrl}`;
        
        // Вставляем в поле ввода
        messageInput.value = message;
        messageInput.focus();
        
        // Скрываем поиск
        this.hideSearch();
        
        this.showNotification(`Статья "${article.title}" готова к отправке`);
    }

    // Открыть полную статью в Wikipedia
    openFullArticle() {
        if (!this.selectedArticle) return;
        
        const articleUrl = `https://ru.wikipedia.org/?curid=${this.selectedArticle.pageid}`;
        window.open(articleUrl, '_blank');
    }

    // Управление историей поиска
    addToSearchHistory(query) {
        let history = JSON.parse(localStorage.getItem('wikiSearchHistory') || '[]');
        
        // Удаляем дубликаты
        history = history.filter(item => item.query !== query);
        
        // Добавляем в начало
        history.unshift({
            query: query,
            timestamp: Date.now(),
            date: new Date().toLocaleDateString('ru-RU')
        });
        
        // Ограничиваем историю 50 элементами
        history = history.slice(0, 50);
        
        localStorage.setItem('wikiSearchHistory', JSON.stringify(history));
    }

    // Загрузка истории поиска
    loadSearchHistory() {
        const history = JSON.parse(localStorage.getItem('wikiSearchHistory') || '[]');
        const historyList = document.getElementById('wikiHistoryList');
        
        if (history.length === 0) {
            historyList.innerHTML = this.getPlaceholderHTML('history');
            return;
        }
        
        let historyHTML = '<div class="history-list">';
        
        history.forEach(item => {
            historyHTML += `
                <div class="history-item" data-query="${item.query}">
                    <div class="history-query">${item.query}</div>
                    <div class="history-date">${item.date}</div>
                    <button class="history-search-btn" data-query="${item.query}">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            `;
        });
        
        historyHTML += '</div>';
        historyList.innerHTML = historyHTML;
        
        // Обработчики для истории
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                this.searchFromHistory(query);
            });
        });
    }

    // Поиск из истории
    searchFromHistory(query) {
        document.getElementById('wikiSearchInput').value = query;
        this.switchTab('search');
        this.performSearch();
    }

    // Управление сохраненными статьями
    toggleSaveArticle(pageId = null, title = null, button = null) {
        if (!pageId && this.selectedArticle) {
            pageId = this.selectedArticle.pageid;
            title = this.selectedArticle.title;
        }
        
        if (!pageId) return;
        
        let saved = JSON.parse(localStorage.getItem('wikiSavedArticles') || '{}');
        
        if (saved[pageId]) {
            delete saved[pageId];
            if (button) button.classList.remove('saved');
            this.showNotification('Статья удалена из сохраненных');
        } else {
            saved[pageId] = {
                title: title,
                pageid: pageId,
                savedAt: Date.now(),
                savedDate: new Date().toLocaleDateString('ru-RU')
            };
            if (button) button.classList.add('saved');
            this.showNotification('Статья добавлена в сохраненные');
        }
        
        localStorage.setItem('wikiSavedArticles', JSON.stringify(saved));
        this.updateSaveButton();
        
        // Обновляем список сохраненных, если открыта соответствующая вкладка
        if (document.querySelector('[data-tab="saved"]').classList.contains('active')) {
            this.loadSavedArticles();
        }
    }

    // Проверка, сохранена ли статья
    isArticleSaved(pageId) {
        const saved = JSON.parse(localStorage.getItem('wikiSavedArticles') || '{}');
        return !!saved[pageId];
    }

    // Обновление кнопки сохранения
    updateSaveButton() {
        const saveBtn = document.getElementById('saveArticleBtn');
        if (!saveBtn || !this.selectedArticle) return;
        
        const isSaved = this.isArticleSaved(this.selectedArticle.pageid);
        saveBtn.innerHTML = isSaved ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
        saveBtn.title = isSaved ? 'Удалить из сохраненных' : 'Сохранить статью';
    }

    // Загрузка сохраненных статей
    loadSavedArticles() {
        const saved = JSON.parse(localStorage.getItem('wikiSavedArticles') || '{}');
        const savedList = document.getElementById('wikiSavedList');
        
        const savedArray = Object.values(saved).sort((a, b) => b.savedAt - a.savedAt);
        
        if (savedArray.length === 0) {
            savedList.innerHTML = this.getPlaceholderHTML('saved');
            return;
        }
        
        let savedHTML = '<div class="saved-list">';
        
        savedArray.forEach(article => {
            savedHTML += `
                <div class="saved-item" data-pageid="${article.pageid}">
                    <div class="saved-content">
                        <div class="saved-title">${article.title}</div>
                        <div class="saved-meta">Сохранено: ${article.savedDate}</div>
                    </div>
                    <div class="saved-actions">
                        <button class="saved-action-btn view-btn" data-pageid="${article.pageid}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="saved-action-btn send-btn" data-pageid="${article.pageid}" data-title="${article.title}">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                        <button class="saved-action-btn delete-btn" data-pageid="${article.pageid}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        savedHTML += '</div>';
        savedList.innerHTML = savedHTML;
        
        // Обработчики для сохраненных статей
        this.setupSavedItemsListeners();
    }

    // Настройка обработчиков для сохраненных статей
    setupSavedItemsListeners() {
        document.querySelectorAll('.saved-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.saved-actions')) {
                    const pageId = item.dataset.pageid;
                    this.showArticleView(pageId);
                }
            });
        });
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pageId = btn.dataset.pageid;
                this.showArticleView(pageId);
            });
        });
        
        document.querySelectorAll('.send-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pageId = btn.dataset.pageid;
                const title = btn.dataset.title;
                this.sendArticleToChat(title, pageId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pageId = btn.dataset.pageid;
                this.toggleSaveArticle(pageId);
                
                // Удаляем элемент из списка
                const item = btn.closest('.saved-item');
                if (item) {
                    item.style.opacity = '0';
                    setTimeout(() => {
                        if (item.parentNode) {
                            item.parentNode.removeChild(item);
                        }
                    }, 300);
                }
            });
        });
    }

    // Поделиться статьей
    shareArticle() {
        if (!this.selectedArticle) return;
        
        const articleUrl = `https://ru.wikipedia.org/?curid=${this.selectedArticle.pageid}`;
        const shareText = `📚 ${this.selectedArticle.title}\n\n${articleUrl}`;
        
        if (navigator.share) {
            navigator.share({
                title: this.selectedArticle.title,
                text: shareText,
                url: articleUrl
            });
        } else {
            // Fallback - копирование в буфер обмена
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Ссылка скопирована в буфер обмена');
            });
        }
    }

    // Вспомогательные методы для HTML
    getPlaceholderHTML(type) {
        const placeholders = {
            search: `
                <div class="wiki-placeholder">
                    <i class="fab fa-wikipedia-w"></i>
                    <p>Введите запрос для поиска в Wikipedia</p>
                    <small>Например: "Павел Дуров", "Искусственный интеллект"</small>
                </div>
            `,
            'no-results': `
                <div class="wiki-placeholder">
                    <i class="fas fa-search"></i>
                    <p>Ничего не найдено по вашему запросу</p>
                    <small>Попробуйте изменить поисковый запрос</small>
                </div>
            `,
            history: `
                <div class="wiki-placeholder">
                    <i class="fas fa-history"></i>
                    <p>История поиска пуста</p>
                    <small>Здесь будут отображаться ваши недавние поиски</small>
                </div>
            `,
            saved: `
                <div class="wiki-placeholder">
                    <i class="fas fa-bookmark"></i>
                    <p>Нет сохраненных статей</p>
                    <small>Сохраняйте интересные статьи для быстрого доступа</small>
                </div>
            `
        };
        
        return placeholders[type] || placeholders.search;
    }

    getLoadingHTML(message) {
        return `
            <div class="wiki-loading">
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
                <p>${message}</p>
            </div>
        `;
    }

    getErrorHTML(message) {
        return `
            <div class="wiki-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    // Показать уведомление
    showNotification(message) {
        if (window.showNotification) {
            window.showNotification(message);
        } else {
            // Fallback уведомление
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    }

    // Применение улучшенных стилей
    applyEnhancedStyles() {
        const styles = `
            <style>
                .wikipedia-search-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 95%;
                    max-width: 800px;
                    max-height: 90vh;
                    background: var(--primary-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    z-index: 10000;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                /* Мобильный полноэкранный режим */
                .wikipedia-search-container.mobile-fullscreen {
                    width: 100%;
                    height: 100%;
                    max-width: none;
                    max-height: none;
                    border-radius: 0;
                    top: 0;
                    left: 0;
                    transform: none;
                }
                
                .wikipedia-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid var(--border-color);
                    background: var(--header-bg);
                    flex-shrink: 0;
                }
                
                .wikipedia-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: bold;
                    font-size: 20px;
                }
                
                .wikipedia-logo i {
                    color: #636466;
                    font-size: 28px;
                }
                
                .close-wiki-search {
                    background: none;
                    border: none;
                    color: var(--text-color);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    transition: background 0.2s;
                    font-size: 18px;
                }
                
                .close-wiki-search:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .wikipedia-search-input {
                    padding: 20px;
                    border-bottom: 1px solid var(--border-color);
                    flex-shrink: 0;
                }
                
                .search-input-wrapper {
                    display: flex;
                    align-items: center;
                    background: var(--input-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                }
                
                .search-input-wrapper i.fa-search {
                    position: absolute;
                    left: 15px;
                    color: var(--text-color);
                    opacity: 0.6;
                    z-index: 1;
                }
                
                .search-input-wrapper input {
                    flex: 1;
                    padding: 15px 15px 15px 45px;
                    background: transparent;
                    color: var(--input-color);
                    border: none;
                    font-size: 16px;
                    outline: none;
                }
                
                .search-input-wrapper input::placeholder {
                    color: var(--text-color);
                    opacity: 0.6;
                }
                
                .search-btn {
                    padding: 15px 20px;
                    background: linear-gradient(to right, #4facfe, #00f2fe);
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                
                .search-btn:hover {
                    opacity: 0.9;
                }
                
                .wikipedia-tabs {
                    display: flex;
                    border-bottom: 1px solid var(--border-color);
                    background: var(--header-bg);
                    flex-shrink: 0;
                }
                
                .wiki-tab {
                    flex: 1;
                    padding: 15px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-bottom: 3px solid transparent;
                    font-weight: 500;
                }
                
                .wiki-tab.active {
                    border-bottom-color: #4facfe;
                    background: rgba(79, 172, 254, 0.1);
                    color: #4facfe;
                }
                
                .wiki-tab:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .wikipedia-content {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                }
                
                .wiki-tab-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: none;
                }
                
                .wiki-tab-content.active {
                    display: block;
                }
                
                /* Стили для результатов поиска */
                .wiki-results-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .wiki-result-item {
                    display: flex;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    gap: 16px;
                }
                
                .wiki-result-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }
                
                .result-number {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(to right, #4facfe, #00f2fe);
                    color: white;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 14px;
                    flex-shrink: 0;
                }
                
                .result-content {
                    flex: 1;
                    min-width: 0;
                }
                
                .result-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                    gap: 10px;
                }
                
                .result-title {
                    font-weight: bold;
                    font-size: 18px;
                    color: #4facfe;
                    line-height: 1.3;
                    flex: 1;
                }
                
                .result-save-btn {
                    background: none;
                    border: none;
                    color: var(--text-color);
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 6px;
                    transition: all 0.2s;
                    opacity: 0.7;
                    flex-shrink: 0;
                }
                
                .result-save-btn:hover {
                    opacity: 1;
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .result-save-btn.saved {
                    color: #ffd700;
                    opacity: 1;
                }
                
                .result-snippet {
                    font-size: 14px;
                    opacity: 0.8;
                    margin-bottom: 12px;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .result-meta {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 12px;
                    font-size: 12px;
                    opacity: 0.6;
                }
                
                .result-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .result-action-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 500;
                }
                
                .result-action-btn.preview-btn {
                    background: rgba(79, 172, 254, 0.2);
                    color: #4facfe;
                }
                
                .result-action-btn.send-btn {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }
                
                .result-action-btn:hover {
                    transform: translateY(-1px);
                    opacity: 0.9;
                }
                
                /* Стили для полноэкранного просмотра статьи */
                .wikipedia-article-view {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: var(--primary-bg);
                    display: none;
                    flex-direction: column;
                    z-index: 2;
                }
                
                .article-view-header {
                    display: flex;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 1px solid var(--border-color);
                    background: var(--header-bg);
                    flex-shrink: 0;
                    gap: 15px;
                }
                
                .back-to-results {
                    background: none;
                    border: none;
                    color: var(--text-color);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: background 0.2s;
                    font-size: 18px;
                }
                
                .back-to-results:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .article-view-title {
                    flex: 1;
                    font-weight: bold;
                    font-size: 16px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .article-view-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .article-action-btn {
                    background: none;
                    border: none;
                    color: var(--text-color);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    opacity: 0.7;
                }
                
                .article-action-btn:hover {
                    opacity: 1;
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .article-view-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0;
                }
                
                .article-hero {
                    position: relative;
                    margin-bottom: 30px;
                }
                
                .article-image {
                    width: 100%;
                    max-height: 400px;
                    overflow: hidden;
                }
                
                .article-image img {
                    width: 100%;
                    height: auto;
                    object-fit: cover;
                }
                
                .article-main-title {
                    padding: 25px 25px 15px;
                    font-size: 28px;
                    font-weight: bold;
                    line-height: 1.2;
                    margin: 0;
                }
                
                .article-main-title.no-image {
                    padding-top: 40px;
                }
                
                .article-body {
                    padding: 0 25px 25px;
                    line-height: 1.7;
                    font-size: 16px;
                }
                
                .article-body p {
                    margin-bottom: 20px;
                }
                
                .article-body p.lead {
                    font-size: 18px;
                    font-weight: 500;
                    opacity: 0.9;
                }
                
                .article-body img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 20px 0;
                    cursor: zoom-in;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }
                
                .article-source {
                    padding: 25px;
                    border-top: 1px solid var(--border-color);
                    background: rgba(255, 255, 255, 0.02);
                }
                
                .source-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                    opacity: 0.7;
                    font-size: 14px;
                }
                
                .source-link {
                    color: #4facfe;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                }
                
                .source-link:hover {
                    text-decoration: underline;
                }
                
                .article-view-footer {
                    display: flex;
                    gap: 12px;
                    padding: 20px;
                    border-top: 1px solid var(--border-color);
                    background: var(--header-bg);
                    flex-shrink: 0;
                }
                
                .footer-btn {
                    flex: 1;
                    padding: 15px 20px;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-size: 15px;
                }
                
                .footer-btn.primary {
                    background: linear-gradient(to right, #4facfe, #00f2fe);
                    color: white;
                }
                
                .footer-btn.secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text-color);
                }
                
                .footer-btn:hover {
                    transform: translateY(-2px);
                    opacity: 0.9;
                }
                
                /* Стили для истории и сохраненных */
                .history-list, .saved-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .history-item, .saved-item {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    gap: 15px;
                }
                
                .history-item:hover, .saved-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .history-query, .saved-title {
                    flex: 1;
                    font-weight: 500;
                }
                
                .history-date, .saved-meta {
                    font-size: 12px;
                    opacity: 0.6;
                }
                
                .history-search-btn {
                    background: none;
                    border: none;
                    color: var(--text-color);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 6px;
                    opacity: 0.7;
                    transition: all 0.2s;
                }
                
                .history-search-btn:hover {
                    opacity: 1;
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .saved-actions {
                    display: flex;
                    gap: 6px;
                }
                
                .saved-action-btn {
                    background: none;
                    border: none;
                    color: var(--text-color);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 6px;
                    opacity: 0.7;
                    transition: all 0.2s;
                }
                
                .saved-action-btn:hover {
                    opacity: 1;
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .saved-action-btn.delete-btn:hover {
                    color: #ff6b6b;
                }
                
                /* Стили для зума изображений */
                .image-zoom-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                
                .zoom-container {
                    position: relative;
                    max-width: 90%;
                    max-height: 90%;
                }
                
                .zoom-container img {
                    max-width: 100%;
                    max-height: 80vh;
                    object-fit: contain;
                    border-radius: 8px;
                }
                
                .zoom-close {
                    position: absolute;
                    top: -40px;
                    right: 0;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 5px;
                }
                
                .zoom-caption {
                    color: white;
                    text-align: center;
                    margin-top: 15px;
                    opacity: 0.8;
                }
                
                /* Адаптивность для мобильных устройств */
                @media (max-width: 768px) {
                    .wikipedia-search-container {
                        border-radius: 0;
                    }
                    
                    .wikipedia-header {
                        padding: 15px;
                    }
                    
                    .wikipedia-search-input {
                        padding: 15px;
                    }
                    
                    .search-input-wrapper input {
                        padding: 12px 12px 12px 40px;
                        font-size: 16px;
                    }
                    
                    .search-btn {
                        padding: 12px 16px;
                    }
                    
                    .wiki-tab {
                        padding: 12px 8px;
                        font-size: 14px;
                    }
                    
                    .wiki-tab-content {
                        padding: 15px;
                    }
                    
                    .wiki-result-item {
                        padding: 15px;
                        flex-direction: column;
                        gap: 12px;
                    }
                    
                    .result-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                    
                    .result-actions {
                        flex-direction: column;
                    width: 100%;
                    gap: 6px;
                    margin-top: 10px;
                    align-items: stretch;
                    justify-content: stretch;
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    margin-top: 12px;
                    gap: 8px;
                    align-items: stretch;
                    justify-content: stretch;
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    margin-top: 12px;
                    gap: 8px;
                }
                
                .result-action-btn {
                    flex: 1;
                    justify-content: center;
                    padding: 12px;
                    font-size: 14px;
                }
                
                .article-view-header {
                    padding: 12px 15px;
                }
                
                .article-main-title {
                    font-size: 22px;
                    padding: 20px 15px 10px;
                }
                
                .article-body {
                    padding: 0 15px 15px;
                    font-size: 15px;
                }
                
                .article-view-footer {
                    padding: 15px;
                    flex-direction: column;
                }
                
                .footer-btn {
                    padding: 12px;
                }
                
                .history-item, .saved-item {
                    padding: 12px;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }
                
                .saved-actions {
                    align-self: stretch;
                    justify-content: space-between;
                }
                
                .saved-action-btn {
                    flex: 1;
                    text-align: center;
                }
            }
                
                @media (max-width: 480px) {
                    .wikipedia-logo span {
                        display: none;
                    }
                    
                    .result-meta {
                        flex-direction: column;
                        gap: 5px;
                    }
                    
                    .article-main-title {
                        font-size: 20px;
                    }
                    
                    .article-body p {
                        font-size: 14px;
                    }
                }
                
                /* Общие стили для состояний загрузки и ошибок */
                .wiki-placeholder, .wiki-loading, .wiki-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    text-align: center;
                    color: var(--text-color);
                }
                
                .wiki-placeholder i, .wiki-error i {
                    font-size: 64px;
                    margin-bottom: 20px;
                    opacity: 0.5;
                }
                
                .wiki-placeholder p, .wiki-loading p, .wiki-error p {
                    font-size: 16px;
                    margin-bottom: 10px;
                    opacity: 0.8;
                }
                
                .wiki-placeholder small {
                    font-size: 14px;
                    opacity: 0.6;
                }
                
                .loading-dots {
                    display: flex;
                    gap: 6px;
                    justify-content: center;
                    margin: 20px 0;
                }
                
                .loading-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #4facfe;
                    animation: loading 1.4s infinite ease-in-out both;
                }
                
                .loading-dot:nth-child(1) { animation-delay: -0.32s; }
                .loading-dot:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes loading {
                    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    window.wikipediaSearch = new WikipediaSearchEnhanced();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WikipediaSearchEnhanced;
}