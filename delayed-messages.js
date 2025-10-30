// header-manager.js
// Управление отображением хедера

let isHeaderVisible = true;
let headerElement = null;

// Инициализация управления хедером
function initHeaderManager() {
    headerElement = document.querySelector('.header');
    
    if (!headerElement) {
        console.warn('Header element not found');
        return;
    }
    
    // Начальное состояние - хедер виден
    setHeaderVisible(true);
    
    // Следим за изменениями в интерфейсе
    observeInterfaceChanges();
}

// Установка видимости хедера
function setHeaderVisible(visible) {
    if (!headerElement) return;
    
    if (visible && !isHeaderVisible) {
        // Показываем хедер
        headerElement.style.display = 'flex';
        setTimeout(() => {
            headerElement.style.opacity = '1';
            headerElement.style.transform = 'translateY(0)';
        }, 10);
        isHeaderVisible = true;
    } else if (!visible && isHeaderVisible) {
        // Скрываем хедер
        headerElement.style.opacity = '0';
        headerElement.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            headerElement.style.display = 'none';
        }, 300); // Время должно совпадать с duration анимации
        isHeaderVisible = false;
    }
}

// Наблюдение за изменениями в интерфейсе
function observeInterfaceChanges() {
    // Следим за переключением между контейнерами
    const chatWrapper = document.getElementById('chatWrapper');
    const chatWindow = document.getElementById('chatWindow');
    
    if (!chatWrapper || !chatWindow) {
        console.warn('Chat containers not found');
        return;
    }
    
    // Функция для проверки текущего состояния
    function checkCurrentState() {
        const isChatListVisible = chatWrapper.style.display !== 'none';
        const isChatOpen = chatWindow.style.display !== 'none';
        
        if (isChatListVisible) {
            // Мы в списке чатов - показываем хедер
            setHeaderVisible(true);
        } else if (isChatOpen) {
            // Мы в открытом чате - скрываем хедер
            setHeaderVisible(false);
        }
    }
    
    // Начальная проверка
    checkCurrentState();
    
    // Создаем наблюдатель за изменениями атрибутов
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                checkCurrentState();
            }
        });
    });
    
    // Начинаем наблюдение
    observer.observe(chatWrapper, { attributes: true });
    observer.observe(chatWindow, { attributes: true });
    
    // Также отслеживаем клики по кнопкам навигации
    const backToChatsBtn = document.getElementById('backToChatsBtn');
    if (backToChatsBtn) {
        backToChatsBtn.addEventListener('click', function() {
            setTimeout(checkCurrentState, 100);
        });
    }
    
    // Отслеживаем клики по элементам чатов
    document.addEventListener('click', function(e) {
        // Если кликнули по элементу чата или пользователю
        if (e.target.closest('.chat-item') || e.target.closest('.user-item')) {
            setTimeout(checkCurrentState, 100);
        }
    });
}

// Добавление CSS стилей для анимации
function addHeaderStyles() {
    if (!document.querySelector('#headerStyles')) {
        const style = document.createElement('style');
        style.id = 'headerStyles';
        style.textContent = `
            .header {
                transition: all 0.3s ease-in-out !important;
                transform: translateY(0);
                opacity: 1;
            }
            
            /* Убедимся, что анимация работает плавно */
            .app-container {
                transition: padding-top 0.3s ease-in-out;
            }
            
            /* Адаптация для мобильных устройств */
            @media (max-width: 768px) {
                .header {
                    transition: all 0.25s ease-in-out !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Функция для принудительного показа хедера (например, при выходе из чата)
function showHeader() {
    setHeaderVisible(true);
}

// Функция для принудительного скрытия хедера
function hideHeader() {
    setHeaderVisible(false);
}

// Получение текущего состояния хедера
function isHeaderCurrentlyVisible() {
    return isHeaderVisible;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем стили для анимации
    addHeaderStyles();
    
    // Ждем полной загрузки DOM
    setTimeout(() => {
        initHeaderManager();
    }, 500);
});

// Экспорт функций для использования в других модулях
window.HeaderManager = {
    show: showHeader,
    hide: hideHeader,
    isVisible: isHeaderCurrentlyVisible
};