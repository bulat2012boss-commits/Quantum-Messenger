// emoji-suggestions.js
class EmojiSuggestions {
    constructor() {
        this.emojiMap = this.createEmojiMap();
        this.suggestionsContainer = null;
        this.isVisible = false;
        this.currentWord = '';
        this.selectedIndex = 0;
        this.suggestions = [];
        this.init();
    }

    init() {
        this.createSuggestionsContainer();
        this.setupEventListeners();
        this.addCustomStyles();
    }

    addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .emoji-suggestions {
                backdrop-filter: blur(10px);
                border-radius: 12px !important;
                padding: 10px !important;
                gap: 8px !important;
                max-height: 180px !important;
            }
            
            .emoji-suggestion-btn {
                background: rgba(255, 255, 255, 0.1) !important;
                border: none !important;
                font-size: 22px !important;
                padding: 8px 10px !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                min-width: 40px !important;
                height: 40px !important;
            }
            
            .emoji-suggestion-btn:hover {
                background: rgba(79, 172, 254, 0.3) !important;
                transform: scale(1.1) !important;
            }
            
            .emoji-suggestion-btn:active {
                transform: scale(0.95) !important;
            }
            
            .emoji-suggestions-header {
                font-size: 12px;
                opacity: 0.7;
                margin-bottom: 5px;
                text-align: center;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }

    createEmojiMap() {
        return {
            // 😊 Эмоции и лица
            'счастлив': ['😊', '😄', '😃', '😂', '🤣', '🥲', '😁'],
            'радост': ['😊', '😄', '😃', '😁', '🥳'],
            'смех': ['😂', '🤣', '😆', '😹'],
            'грустн': ['😢', '😭', '😔', '🙁', '🥺', '😞'],
            'плач': ['😢', '😭', '🥲', '😿'],
            'злость': ['😠', '😡', '🤬', '👿'],
            'злой': ['😠', '😡', '🤬', '👿'],
            'удивл': ['😲', '😮', '🤯', '😳'],
            'шок': ['😲', '😮', '🤯', '😳'],
            'поцелуй': ['😘', '😗', '😚', '😙', '🥰'],
            'любов': ['❤️', '😍', '🥰', '💕', '💖', '💗', '😘'],
            'сердце': ['❤️', '💖', '💗', '💓', '💞', '💘', '🧡', '💛'],
            'мил': ['🥰', '😇', '🐰', '🐻', '🧸'],
            'подмиг': ['😉', '😜'],
            'язык': ['😛', '😝', '😜', '🤪'],
            
            // 👋 Жесты и люди
            'привет': ['👋', '😊', '🙏', '🤝'],
            'пока': ['👋', '👋🏻', '👋🏼', '🛫'],
            'рукопож': ['🤝', '🙌'],
            'хлопок': ['👏', '🙌'],
            'сильн': ['💪', '🔥', '👊'],
            'победа': ['✌️', '🎉', '🏆'],
            'окей': ['👌', '👍', '✅'],
            'палецвверх': ['👍', '👍🏻', '👍🏼'],
            'палецвниз': ['👎', '👎🏻', '👎🏼'],
            'указ': ['👉', '👈', '☝️'],
            'идти': ['🚶', '🏃', '👟'],
            'бег': ['🏃', '🏃‍♂️', '🏃‍♀️'],
            'танц': ['💃', '🕺', '🎵'],
            'слуш': ['🎧', '🎵', '🎶'],
            
            // 🐶 Животные и природа
            'собак': ['🐶', '🐕', '🦮', '🐩'],
            'кошк': ['🐱', '🐈', '😺', '😸'],
            'медвед': ['🐻', '🐨', '🧸'],
            'птиц': ['🐦', '🐔', '🦅', '🦉'],
            'рыб': ['🐠', '🐟', '🐡', '🦈'],
            'лев': ['🦁', '🐯', '👑'],
            'слон': ['🐘', '🦣'],
            'дерев': ['🌳', '🌲', '🎄'],
            'цвет': ['🌹', '🌸', '💐', '🌺'],
            'солнце': ['☀️', '🌞', '🔆'],
            'луна': ['🌙', '🌜', '🌛', '🌕'],
            'звезд': ['⭐', '🌟', '💫', '✨'],
            'погод': ['☀️', '🌧️', '⛈️', '🌈'],
            'дожд': ['🌧️', '☔', '⛈️'],
            'снег': ['❄️', '☃️', '⛄'],
            'радуг': ['🌈', '🎨'],
            
            // 🍕 Еда и напитки
            'еда': ['🍕', '🍔', '🍟', '🌭', '🍖', '🍗'],
            'пицц': ['🍕', '🧀'],
            'бургер': ['🍔', '🍟'],
            'картош': ['🍟', '🥔'],
            'суши': ['🍣', '🍱', '🥢'],
            'морожен': ['🍦', '🍧', '🍨'],
            'торт': ['🎂', '🍰', '🧁'],
            'конфет': ['🍬', '🍫', '🍭'],
            'кофе': ['☕', '🇨🇴', '🏪'],
            'чай': ['🍵', '🫖'],
            'пиво': ['🍺', '🍻', '🥂'],
            'вино': ['🍷', '🥂'],
            'коктейл': ['🍸', '🍹', '🥤'],
            'вода': ['💧', '🥤', '🚰'],
            'фрукт': ['🍎', '🍌', '🍇', '🍓'],
            'яблок': ['🍎', '🍏'],
            'банан': ['🍌', '🐒'],
            'апельсин': ['🍊', '🧡'],
            
            // ⚽ Спорт и активность
            'спорт': ['⚽', '🏀', '🎾', '🏈'],
            'футбол': ['⚽', '🥅', '👟'],
            'баскетбол': ['🏀', '⛹️'],
            'теннис': ['🎾', '🏸'],
            'плаван': ['🏊', '🏊‍♂️', '🏊‍♀️'],
            'велосипед': ['🚴', '🚲'],
            'бег': ['🏃', '👟'],
            'йог': ['🧘', '🧘‍♂️', '🧘‍♀️'],
            'танц': ['💃', '🕺', '🎵'],
            'музык': ['🎵', '🎶', '🎸', '🎹'],
            'гитар': ['🎸', '🎶'],
            'игр': ['🎮', '👾', '🕹️'],
            
            // 🚗 Транспорт и путешествия
            'машин': ['🚗', '🚙', '🏎️', '🚓'],
            'автомоб': ['🚗', '🚙', '🚐'],
            'автобус': ['🚌', '🚎'],
            'поезд': ['🚂', '🚄', '🚆'],
            'метро': ['🚇', 'Ⓜ️'],
            'самолет': ['✈️', '🛫', '🛬'],
            'вертолет': ['🚁', '🪂'],
            'кораб': ['🚢', '⛵', '🛳️'],
            'велосипед': ['🚲', '🚴'],
            'мотоцикл': ['🏍️', '🛵'],
            'такси': ['🚕', '🚖'],
            'скор': ['🚑', '🚨'],
            'полиц': ['🚓', '👮'],
            'огонь': ['🚒', '🔥'],
            
            // 📱 Технологии и предметы
            'телефон': ['📱', '📞', '☎️'],
            'компьютер': ['💻', '🖥️', '⌨️'],
            'ноутбук': ['💻', '🔋'],
            'планшет': ['📟', '💾'],
            'камер': ['📷', '🎥', '📹'],
            'телевизор': ['📺', '🎬'],
            'часы': ['⌚', '⏰', '🕒'],
            'будильник': ['⏰', '🔔'],
            'деньги': ['💰', '💵', '💳', '🏦'],
            'подарок': ['🎁', '🎀', '🎊'],
            'письм': ['✍️', '📝', '📄'],
            'книг': ['📖', '📚', '🔖'],
            'гамбургер': ['🍔', '📱'],
            'поиск': ['🔍', '📋'],
            
            // 🎉 События и праздники
            'праздник': ['🎉', '🎊', '🎈'],
            'деньрожден': ['🎂', '🎁', '🎉'],
            'новыйгод': ['🎄', '🎅', '⛄'],
            'рождество': ['🎄', '🎅', '🤶'],
            'хэллоуин': ['🎃', '👻', '🕷️'],
            'свадьб': ['💒', '👰', '🤵'],
            'любов': ['💑', '❤️', '💒'],
            'ночь': ['🌙', '🌠', '🌌'],
            'вечер': ['🌆', '🌃', '🍷'],
            
            // 🌍 Символы и знаки
            'вопрос': ['❓', '⁉️'],
            'восклиц': ['❗', '‼️'],
            'стоп': ['🛑', '✋'],
            'запрет': ['🚫', '⛔'],
            'доступ': ['✅', '✔️'],
            'ошибк': ['❌', '🚫'],
            'загрузк': ['⏳', '⌛'],
            'обнов': ['🔄', '♻️'],
            'настройк': ['⚙️', '🔧'],
            'безопасн': ['🔒', '🛡️'],
            'ключ': ['🔑', '🗝️'],
            'огонь': ['🔥', '🎇'],
            'вода': ['💧', '🌊'],
            'воздух': ['💨', '🌬️'],
            'земл': ['🌍', '🌎'],

            // English words
            'happy': ['😊', '😄', '😃', '😂', '🤣', '🥲'],
            'sad': ['😢', '😭', '😔', '🙁', '🥺'],
            'love': ['❤️', '😍', '🥰', '💕', '💖'],
            'heart': ['❤️', '💖', '💗', '💓', '💞'],
            'fire': ['🔥', '🎇', '🎆'],
            'ok': ['👌', '👍', '✅'],
            'hello': ['👋', '😊', '🙏'],
            'goodbye': ['👋', '🛫', '🚪'],
            'food': ['🍕', '🍔', '🍟', '🌭'],
            'pizza': ['🍕', '🧀'],
            'coffee': ['☕', '🏪'],
            'beer': ['🍺', '🍻'],
            'car': ['🚗', '🚙', '🏎️'],
            'plane': ['✈️', '🛫'],
            'train': ['🚂', '🚄'],
            'time': ['⏰', '⌚'],
            'money': ['💰', '💵'],
            'gift': ['🎁', '🎀'],
            'sport': ['⚽', '🏀'],
            'music': ['🎵', '🎶'],
            'game': ['🎮', '👾'],
            'work': ['💼', '👨‍💻'],
            'sleep': ['😴', '🛌'],
            'party': ['🎉', '🎊'],
            'celebration': ['🎉', '🎊'],
            'congratulations': ['🎉', '👏'],
            'thank': ['🙏', '😊'],
            'sorry': ['😔', '🙏'],
            'cool': ['😎', '👌'],
            'hot': ['🔥', '🥵'],
            'cold': ['❄️', '🥶'],
            'rain': ['🌧️', '☔'],
            'sun': ['☀️', '🌞'],
            'moon': ['🌙', '🌕'],
            'star': ['⭐', '🌟'],
            'cat': ['🐱', '😺'],
            'dog': ['🐶', '🐕'],
            'phone': ['📱', '📞'],
            'computer': ['💻', '🖥️'],
            'book': ['📖', '📚'],
            'movie': ['🎬', '📺'],
            'travel': ['✈️', '🧳'],
            'beach': ['🏖️', '🌊'],
            'mountain': ['⛰️', '🏔️'],
            'city': ['🏙️', '🌆'],
            'home': ['🏠', '👨‍👩‍👧‍👦'],
            'family': ['👨‍👩‍👧‍👦', '❤️'],
            'friend': ['👫', '😊'],
            'baby': ['👶', '🍼'],
            'child': ['👦', '👧'],
            'man': ['👨', '♂️'],
            'woman': ['👩', '♀️'],
            'student': ['👨‍🎓', '👩‍🎓'],
            'teacher': ['👨‍🏫', '👩‍🏫'],
            'doctor': ['👨‍⚕️', '👩‍⚕️'],
            'police': ['👮', '🚓']
        };
    }

    createSuggestionsContainer() {
        this.suggestionsContainer = document.createElement('div');
        this.suggestionsContainer.className = 'emoji-suggestions';
        this.suggestionsContainer.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 0;
            right: 0;
            background: var(--header-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 10px;
            display: none;
            flex-wrap: wrap;
            gap: 8px;
            max-height: 180px;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: var(--shadow);
            margin-bottom: 5px;
            backdrop-filter: blur(10px);
        `;
        
        const inputArea = document.querySelector('.input-area');
        inputArea.style.position = 'relative';
        inputArea.appendChild(this.suggestionsContainer);
    }

    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        
        messageInput.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });

        messageInput.addEventListener('keydown', (e) => {
            if (this.isVisible) {
                switch(e.key) {
                    case 'Tab':
                        e.preventDefault();
                        this.selectSuggestion();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.navigateSuggestions(1);
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.navigateSuggestions(-1);
                        break;
                    case 'Escape':
                        this.hideSuggestions();
                        break;
                    case 'Enter':
                        if (this.selectedIndex >= 0) {
                            e.preventDefault();
                            this.selectSuggestion();
                        }
                        break;
                }
            }
        });

        // Закрытие при клике вне области
        document.addEventListener('click', (e) => {
            if (!this.suggestionsContainer.contains(e.target) && e.target !== messageInput) {
                this.hideSuggestions();
            }
        });
    }

    handleInput(text) {
        // Поиск по формату :keyword
        const colonMatch = text.match(/:([a-zA-Zа-яА-ЯёЁ]+)$/);
        if (colonMatch) {
            this.currentWord = colonMatch[1].toLowerCase();
            this.showSuggestions(this.currentWord);
            return;
        }

        // Поиск по последнему слову
        const words = text.split(' ');
        const lastWord = words[words.length - 1].toLowerCase();
        
        if (lastWord.length >= 2) {
            this.currentWord = lastWord;
            this.showSuggestions(lastWord);
        } else {
            this.hideSuggestions();
        }
    }

    showSuggestions(word) {
        this.suggestions = this.getSuggestions(word);
        
        if (this.suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.suggestionsContainer.innerHTML = '';
        
        // Добавляем заголовок
        const header = document.createElement('div');
        header.className = 'emoji-suggestions-header';
        header.textContent = `Эмодзи для "${word}"`;
        this.suggestionsContainer.appendChild(header);
        
        this.selectedIndex = 0;
        
        this.suggestions.forEach((emoji, index) => {
            const emojiButton = document.createElement('button');
            emojiButton.className = 'emoji-suggestion-btn';
            emojiButton.textContent = emoji;
            emojiButton.dataset.index = index;
            
            if (index === this.selectedIndex) {
                emojiButton.style.background = 'rgba(79, 172, 254, 0.3) !important';
            }
            
            emojiButton.addEventListener('click', () => {
                this.selectedIndex = index;
                this.selectSuggestion();
            });
            
            emojiButton.addEventListener('mouseenter', () => {
                this.selectedIndex = index;
                this.highlightSelected();
            });
            
            this.suggestionsContainer.appendChild(emojiButton);
        });

        this.suggestionsContainer.style.display = 'flex';
        this.isVisible = true;
        this.highlightSelected();
    }

    getSuggestions(word) {
        const suggestions = [];
        const exactMatches = [];
        const partialMatches = [];
        
        // Поиск по ключевым словам
        for (const [keyword, emojis] of Object.entries(this.emojiMap)) {
            if (keyword === word) {
                exactMatches.push(...emojis);
            } else if (keyword.includes(word)) {
                partialMatches.push(...emojis);
            }
        }
        
        // Сначала точные совпадения, потом частичные
        suggestions.push(...exactMatches, ...partialMatches);
        
        // Убираем дубликаты и ограничиваем количество
        return [...new Set(suggestions)].slice(0, 12);
    }

    navigateSuggestions(direction) {
        const newIndex = this.selectedIndex + direction;
        if (newIndex >= 0 && newIndex < this.suggestions.length) {
            this.selectedIndex = newIndex;
            this.highlightSelected();
        }
    }

    highlightSelected() {
        const buttons = this.suggestionsContainer.querySelectorAll('.emoji-suggestion-btn');
        buttons.forEach((btn, index) => {
            if (index === this.selectedIndex) {
                btn.style.background = 'rgba(79, 172, 254, 0.3) !important';
                btn.style.transform = 'scale(1.1)';
            } else {
                btn.style.background = 'rgba(255, 255, 255, 0.1) !important';
                btn.style.transform = 'scale(1)';
            }
        });
    }

    selectSuggestion() {
        if (this.suggestions[this.selectedIndex]) {
            this.insertEmoji(this.suggestions[this.selectedIndex]);
        }
    }

    insertEmoji(emoji) {
        const messageInput = document.getElementById('messageInput');
        const currentText = messageInput.value;
        
        if (currentText.includes(':')) {
            // Заменяем :keyword на эмодзи
            const newText = currentText.replace(/:([a-zA-Zа-яА-ЯёЁ]+)$/, emoji + ' ');
            messageInput.value = newText;
        } else {
            // Добавляем эмодзи после последнего слова
            const words = currentText.split(' ');
            words[words.length - 1] = emoji + ' ';
            messageInput.value = words.join(' ');
        }
        
        messageInput.focus();
        this.hideSuggestions();
        
        // Обновляем состояние кнопки отправки
        const sendBtn = document.getElementById('sendBtn');
        sendBtn.disabled = messageInput.value.trim() === '';
        
        // Триггерим событие input для обновления интерфейса
        messageInput.dispatchEvent(new Event('input'));
    }

    hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
        this.isVisible = false;
        this.currentWord = '';
        this.selectedIndex = 0;
        this.suggestions = [];
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Ждем инициализации основного приложения
    setTimeout(() => {
        if (document.getElementById('messageInput')) {
            new EmojiSuggestions();
            console.log('Emoji Suggestions initialized');
        }
    }, 1000);
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmojiSuggestions;
}