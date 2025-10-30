// Halloween Font Awesome Icons for Quantum Messenger
(function() {
    'use strict';
    
    // Добавляем минимальные CSS стили
    const halloweenStyles = `
        <style>
            .halloween-icon {
                margin-right: 8px;
                width: 16px;
                text-align: center;
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', halloweenStyles);

    class HalloweenFaIcons {
        constructor() {
            this.menuItemIcons = {
                // Хэллоуинские иконки для бургер-меню
                'Профиль': 'fa-ghost',
                'Статус': 'fa-wand-sparkles',
                'Тема': 'fa-palette',
                'Уведомления': 'fa-toilet-paper',
                'Приватность': 'fa-spider',
                'Хранилище': 'fa-book-skull',
                'Резервная копия': 'fa-cloud-upload-alt',
                'Безопасность': 'fa-skull',
                'Язык': 'fa-cloud-moon',
                'Очистить чаты': 'fa-trash',
                'Экспорт данных': 'fa-download',
                'О программе': 'fa-info-circle',
                'Выйти': 'fa-skull-crossbones',
                'Мой юзернейм': 'fa-mask',
                'Сохраненные сообщения': 'fa-cat'
            };

            this.iconMap = {
                // Замена основных иконок в интерфейсе
                'fa-bars': 'fa-crow', // Бургер-кнопка
                'fa-user': 'fa-ghost', // Профиль
                'fa-circle': 'fa-wand-sparkles', // Статус
                'fa-at': 'fa-mask', // Юзернейм
                'fa-bookmark': 'fa-cat', // Сохраненные сообщения
                'fa-shield-alt': 'fa-spider', // Приватность
                'fa-database': 'fa-book-skull', // Хранилище
                'fa-sign-out-alt': 'fa-skull-crossbones', // Выход
                'fa-bell': 'fa-toilet-paper', // Уведомления
                'fa-lock': 'fa-skull', // Безопасность
                'fa-globe': 'fa-cloud-moon', // Язык
                
                // Кнопка отправки остается самолетиком
                'fa-paper-plane': 'fa-paper-plane',
                
                // Сохранение оригинальных где нужно
                'fa-search': 'fa-search',
                'fa-comments': 'fa-comments',
                'fa-users': 'fa-users',
                'fa-palette': 'fa-palette',
                'fa-cloud-upload-alt': 'fa-cloud-upload-alt',
                'fa-trash': 'fa-trash',
                'fa-download': 'fa-download',
                'fa-info-circle': 'fa-info-circle',
                'fa-arrow-left': 'fa-arrow-left',
                'fa-ellipsis-v': 'fa-ellipsis-vertical',
                'fa-broom': 'fa-broom',
                'fa-ban': 'fa-ban',
                'fa-save': 'fa-floppy-disk',
                'fa-exclamation-triangle': 'fa-triangle-exclamation'
            };
            
            this.init();
        }

        init() {
            console.log('🎃 Активируем хэллоуинские иконки...');
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => this.applyAllIcons(), 1500);
                });
            } else {
                setTimeout(() => this.applyAllIcons(), 1500);
            }
        }

        applyAllIcons() {
            this.replaceBurgerButton();
            this.replaceBurgerMenuIcons();
            this.forceUpdateSpecificItems();
            
            console.log('🎃 Хэллоуинские иконки применены!');
        }

        replaceBurgerButton() {
            // Заменяем бургер-кнопку на ворона
            const burgerButtons = document.querySelectorAll('.burger-menu i, .burger-menu .fa-bars');
            burgerButtons.forEach(button => {
                if (button.classList.contains('fa-bars') || button.textContent === '' || button.tagName === 'I') {
                    button.className = 'fas fa-crow';
                }
            });

            // Альтернативный поиск бургер-кнопки
            const burgerMenu = document.getElementById('burgerMenu');
            if (burgerMenu) {
                const icons = burgerMenu.querySelectorAll('i');
                icons.forEach(icon => {
                    icon.className = 'fas fa-crow';
                });
                
                // Если нет иконки, добавляем
                if (icons.length === 0) {
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-crow';
                    burgerMenu.prepend(icon);
                }
            }
        }

        replaceBurgerMenuIcons() {
            // Заменяем иконки в бургер-меню
            const menuItems = document.querySelectorAll('.burger-menu-item');
            menuItems.forEach(item => {
                const text = item.textContent.trim();
                const iconClass = this.menuItemIcons[text];
                
                if (iconClass) {
                    // Удаляем существующие иконки
                    const existingIcons = item.querySelectorAll('i');
                    existingIcons.forEach(icon => icon.remove());
                    
                    // Добавляем новую хэллоуинскую иконку
                    const icon = document.createElement('i');
                    icon.className = `fas ${iconClass} halloween-icon`;
                    item.prepend(icon);
                }
            });
        }

        forceUpdateSpecificItems() {
            // Принудительно обновляем конкретные пункты меню по тексту
            const menuItems = document.querySelectorAll('.burger-menu-item');
            menuItems.forEach(item => {
                const text = item.textContent.trim();
                
                if (text.includes('Приватность') || text.includes('Приватность')) {
                    this.replaceIconInItem(item, 'fa-spider');
                }
                else if (text.includes('Хранилище') || text.includes('Хранилище')) {
                    this.replaceIconInItem(item, 'fa-book-skull');
                }
                else if (text.includes('Сохраненные') || text.includes('Сохраненные')) {
                    this.replaceIconInItem(item, 'fa-cat');
                }
                else if (text.includes('юзернейм') || text.includes('Юзернейм')) {
                    this.replaceIconInItem(item, 'fa-mask');
                }
                else if (text.includes('Выйти') || text.includes('Выйти')) {
                    this.replaceIconInItem(item, 'fa-skull-crossbones');
                }
                else if (text.includes('Профиль') || text.includes('Профиль')) {
                    this.replaceIconInItem(item, 'fa-ghost');
                }
                else if (text.includes('Статус') || text.includes('Статус')) {
                    this.replaceIconInItem(item, 'fa-wand-sparkles');
                }
                else if (text.includes('Уведомления') || text.includes('Уведомления')) {
                    this.replaceIconInItem(item, 'fa-toilet-paper');
                }
                else if (text.includes('Безопасность') || text.includes('Безопасность')) {
                    this.replaceIconInItem(item, 'fa-skull');
                }
                else if (text.includes('Язык') || text.includes('Язык')) {
                    this.replaceIconInItem(item, 'fa-cloud-moon');
                }
            });
        }

        replaceIconInItem(item, newIconClass) {
            const existingIcons = item.querySelectorAll('i');
            existingIcons.forEach(icon => icon.remove());
            
            const icon = document.createElement('i');
            icon.className = `fas ${newIconClass} halloween-icon`;
            item.prepend(icon);
        }

        // Принудительное обновление всех иконок
        refreshIcons() {
            this.applyAllIcons();
        }
    }

    // Автоматическая активация в октябре
    function initHalloweenIcons() {
        const today = new Date();
        const isOctober = today.getMonth() === 9;
        
        if (isOctober) {
            const halloweenIcons = new HalloweenFaIcons();
            window.halloweenIcons = halloweenIcons;
            
            // Обновление для динамического контента
            setInterval(() => {
                halloweenIcons.refreshIcons();
            }, 2000);
            
            return halloweenIcons;
        }
        return null;
    }

    // Запускаем с задержкой
    setTimeout(initHalloweenIcons, 2000);

})();