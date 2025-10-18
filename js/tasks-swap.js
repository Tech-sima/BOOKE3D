// Tasks Panel Swap - переопределяем обработчики кнопок
// Флаг для отслеживания инициализации tasks-swap
let tasksSwapInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    // Предотвращаем повторную инициализацию
    if (tasksSwapInitialized) {
        console.log('⚠️ Tasks swap already initialized, skipping...');
        return;
    }
    // Небольшая задержка чтобы убедиться что все обработчики из main.js загружены
    setTimeout(() => {
        console.log('Tasks-swap.js: Начинаем переопределение обработчиков');
        
        // Переопределяем обработчик нижней кнопки "Задания" без замены элемента
        const bottomNavButton = document.querySelector('#bottom-nav button:nth-child(4)');
        if (bottomNavButton) {
            console.log('Tasks-swap.js: Найдена нижняя кнопка "Задания"');
            
            // Удаляем все существующие обработчики
            const newButton = bottomNavButton.cloneNode(true);
            bottomNavButton.parentNode.replaceChild(newButton, bottomNavButton);
            
            // Создаем новый обработчик для нижней кнопки
            const newClickHandler = (e) => {
                console.log('Tasks-swap.js: Клик по нижней кнопке "Задания"');
                e.preventDefault();
                e.stopPropagation();
                
                // Проверяем, не открыта ли уже какая-то панель
                const isAnyPanelOpen = () => {
                    const panels = [
                        'shop-panel',
                        'characters-panel', 
                        'city-panel',
                        'tasks-panel',
                        'profile-panel',
                        'friends-panel',
                        'phone-panel',
                        'game-tasks-panel'
                    ];
                    return panels.some(id => document.getElementById(id)?.style.display === 'flex');
                };
                
                if (isAnyPanelOpen()) return;
                
                // Скрываем красный кружок при первом посещении игровых заданий
                const tasksFirstVisit = localStorage.getItem('tasksFirstVisit') === 'true';
                if (!tasksFirstVisit) {
                    localStorage.setItem('tasksFirstVisit', 'true');
                    
                    const tasksDot = document.getElementById('tasks-dot');
                    if (tasksDot) {
                        tasksDot.style.display = 'none';
                        console.log('🔴 Красный кружочек с заданий убран (игровые задания)');
                    }
                }
                
                // Устанавливаем активное состояние
                if (window.setActiveNavButton) {
                    window.setActiveNavButton(4);
                }
                
                // Открываем новую панель игровых заданий
                const gameTasksPanel = document.getElementById('game-tasks-panel');
                if (gameTasksPanel) {
                    console.log('Tasks-swap.js: Открываем game-tasks-panel');
                    // Рендерим игровые задания и открываем панель
                    if (window.renderGameTasks) {
                        window.renderGameTasks();
                    }
                    if (window.showPanelWithAnimation) {
                        window.showPanelWithAnimation('game-tasks-panel');
                    } else {
                        gameTasksPanel.style.display = 'flex';
                    }
                } else {
                    console.error('Tasks-swap.js: game-tasks-panel не найден');
                }
            };
            
            // Добавляем новый обработчик
            newButton.addEventListener('click', newClickHandler);
        } else {
            console.error('Tasks-swap.js: Нижняя кнопка "Задания" не найдена');
        }
        
        // Боковая кнопка btn-tasks теперь открывает панель с партнерскими заданиями
        const btnTasks = document.getElementById('btn-tasks');
        const tasksPanel = document.getElementById('tasks-panel');
        
        if (btnTasks && tasksPanel) {
            console.log('Tasks-swap.js: Найдена боковая кнопка btn-tasks');
            
            // Удаляем все существующие обработчики
            const newSideButton = btnTasks.cloneNode(true);
            btnTasks.parentNode.replaceChild(newSideButton, btnTasks);
            
            // Создаем новый обработчик для боковой кнопки
            const sideButtonClickHandler = () => {
                console.log('Tasks-swap.js: Клик по боковой кнопке btn-tasks');
                
                // Проверяем, не открыта ли уже какая-то панель
                const isAnyPanelOpen = () => {
                    const panels = [
                        'shop-panel',
                        'characters-panel', 
                        'city-panel',
                        'tasks-panel',
                        'profile-panel',
                        'friends-panel',
                        'phone-panel',
                        'game-tasks-panel'
                    ];
                    return panels.some(id => document.getElementById(id)?.style.display === 'flex');
                };
                
                if (isAnyPanelOpen()) return;
                
                // Скрываем красный кружок при первом посещении партнерских заданий
                const tasksFirstVisit = localStorage.getItem('tasksFirstVisit') === 'true';
                if (!tasksFirstVisit) {
                    localStorage.setItem('tasksFirstVisit', 'true');
                    
                    const tasksDot = document.getElementById('tasks-dot');
                    if (tasksDot) {
                        tasksDot.style.display = 'none';
                        console.log('🔴 Красный кружочек с заданий убран (партнерские задания)');
                    }
                }
                
                // Рендерим партнерские задания и открываем панель
                if (window.renderPartnerTasks) {
                    window.renderPartnerTasks();
                }
                console.log('Tasks-swap.js: Открываем tasks-panel');
                if (window.showPanelWithAnimation) {
                    window.showPanelWithAnimation('tasks-panel');
                } else {
                    tasksPanel.style.display = 'flex';
                }
                
                // Подсвечиваем кнопку белым цветом
                if (window.setActiveSideButton) {
                    window.setActiveSideButton('btn-tasks');
                }
            };
            
            // Добавляем новый обработчик
            newSideButton.addEventListener('click', sideButtonClickHandler);
        } else {
            console.error('Tasks-swap.js: Боковая кнопка btn-tasks или tasks-panel не найдены');
        }
        
        console.log('Tasks-swap.js: Переопределение обработчиков завершено');
    }, 200); // Увеличиваем задержку до 200мс
    
    tasksSwapInitialized = true;
    console.log('✅ Tasks swap initialized');
}); 