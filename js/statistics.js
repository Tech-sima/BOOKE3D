// Система управления статистикой с реальными данными
function getRealStatisticsData() {
    // Получаем данные зданий из localStorage
    const buildingsData = JSON.parse(localStorage.getItem('buildingsData') || '{}');

    // Эффективный доход в час = базовый доход * (1 + 0.2 * кол-во работников)
    const getHourlyIncome = (b) => {
        if (!b || !b.isOwned) return 0;
        const workers = typeof b.workers === 'number' ? b.workers : 0;
        const baseIncome = typeof b.income === 'number' ? b.income : 0;
        return baseIncome * (1 + workers * 0.2);
    };

    const libraryIncomePerHour = getHourlyIncome(buildingsData && buildingsData.library);
    const factoryIncomePerHour = getHourlyIncome(buildingsData && buildingsData.factory);
    const storageIncomePerHour = getHourlyIncome(buildingsData && buildingsData.storage);
    const printIncomePerHour = getHourlyIncome(buildingsData && buildingsData.print);

    // Переводим в доход в секунду для совместимости с остальной логикой файла
    const libraryIncomePerSec = libraryIncomePerHour / 3600;
    const factoryIncomePerSec = factoryIncomePerHour / 3600;
    const storageIncomePerSec = storageIncomePerHour / 3600;
    const printIncomePerSec = printIncomePerHour / 3600;
    
    // Рассчитываем доходы в день (24 часа * 3600 секунд)
    const libraryIncomePerDay = libraryIncomePerSec * 24 * 3600;
    const factoryIncomePerDay = factoryIncomePerSec * 24 * 3600;
    const storageIncomePerDay = storageIncomePerSec * 24 * 3600;
    const printIncomePerDay = printIncomePerSec * 24 * 3600;
    
    // Общий доход
    const totalIncomePerDay = libraryIncomePerDay + factoryIncomePerDay + storageIncomePerDay + printIncomePerDay;
    
    // Рассчитываем расходы (примерные значения)
    const salaryExpenses = Math.floor(totalIncomePerDay * 0.3); // 30% на зарплаты
    const utilityExpenses = Math.floor(totalIncomePerDay * 0.2); // 20% на коммунальные
    const taxExpenses = Math.floor(totalIncomePerDay * 0.1); // 10% на налоги
    const otherExpenses = Math.floor(totalIncomePerDay * 0.05); // 5% на прочие
    const totalExpenses = salaryExpenses + utilityExpenses + taxExpenses + otherExpenses;
    
    // Чистая прибыль
    const netProfit = totalIncomePerDay - totalExpenses;
    
    // Функция для форматирования чисел
    const formatNumber = window.formatNumber || ((num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return Math.round(num).toString();
    });
    
    return {
        income: {
            title: "Суммарный ежедневный доход",
            total: formatNumber(totalIncomePerDay),
            items: [
                {
                    name: "Библиотека",
                    value: `${formatNumber(libraryIncomePerDay)}/день`,
                    percentage: `${totalIncomePerDay > 0 ? Math.round((libraryIncomePerDay / totalIncomePerDay) * 100) : 0}% от общего`,
                    color: "#4caf50",
                    gradient: "linear-gradient(180deg, #4caf50, #45a049)"
                },
                {
                    name: "Завод",
                    value: `${formatNumber(factoryIncomePerDay)}/день`,
                    percentage: `${totalIncomePerDay > 0 ? Math.round((factoryIncomePerDay / totalIncomePerDay) * 100) : 0}% от общего`,
                    color: "#2196f3",
                    gradient: "linear-gradient(180deg, #2196f3, #1976d2)"
                },
                {
                    name: "Почта",
                    value: `${formatNumber(storageIncomePerDay)}/день`,
                    percentage: `${totalIncomePerDay > 0 ? Math.round((storageIncomePerDay / totalIncomePerDay) * 100) : 0}% от общего`,
                    color: "#ff9800",
                    gradient: "linear-gradient(180deg, #ff9800, #f57c00)"
                },
                {
                    name: "Типография",
                    value: `${formatNumber(printIncomePerDay)}/день`,
                    percentage: `${totalIncomePerDay > 0 ? Math.round((printIncomePerDay / totalIncomePerDay) * 100) : 0}% от общего`,
                    color: "#9c27b0",
                    gradient: "linear-gradient(180deg, #9c27b0, #7b1fa2)"
                }
            ]
        },
        expenses: {
            title: "Суммарные ежедневные расходы",
            total: formatNumber(totalExpenses),
            items: [
                {
                    name: "Зарплаты",
                    value: `${formatNumber(salaryExpenses)}/день`,
                    percentage: `${totalExpenses > 0 ? Math.round((salaryExpenses / totalExpenses) * 100) : 0}% от общего`,
                    color: "#f44336",
                    gradient: "linear-gradient(180deg, #f44336, #d32f2f)"
                },
                {
                    name: "Коммунальные",
                    value: `${formatNumber(utilityExpenses)}/день`,
                    percentage: `${totalExpenses > 0 ? Math.round((utilityExpenses / totalExpenses) * 100) : 0}% от общего`,
                    color: "#ff5722",
                    gradient: "linear-gradient(180deg, #ff5722, #e64a19)"
                },
                {
                    name: "Налоги",
                    value: `${formatNumber(taxExpenses)}/день`,
                    percentage: `${totalExpenses > 0 ? Math.round((taxExpenses / totalExpenses) * 100) : 0}% от общего`,
                    color: "#e91e63",
                    gradient: "linear-gradient(180deg, #e91e63, #c2185b)"
                },
                {
                    name: "Прочие",
                    value: `${formatNumber(otherExpenses)}/день`,
                    percentage: `${totalExpenses > 0 ? Math.round((otherExpenses / totalExpenses) * 100) : 0}% от общего`,
                    color: "#ad1457",
                    gradient: "linear-gradient(180deg, #ad1457, #880e4f)"
                }
            ]
        },
        balance: {
            title: "Чистая прибыль",
            total: formatNumber(netProfit),
            items: [
                {
                    name: "Библиотека",
                    value: `+${formatNumber(libraryIncomePerDay - (libraryIncomePerDay * 0.3))}/день`,
                    percentage: `${netProfit > 0 ? Math.round(((libraryIncomePerDay - (libraryIncomePerDay * 0.3)) / netProfit) * 100) : 0}% от общего`,
                    color: "#4caf50",
                    gradient: "linear-gradient(180deg, #4caf50, #45a049)"
                },
                {
                    name: "Завод",
                    value: `+${formatNumber(factoryIncomePerDay - (factoryIncomePerDay * 0.3))}/день`,
                    percentage: `${netProfit > 0 ? Math.round(((factoryIncomePerDay - (factoryIncomePerDay * 0.3)) / netProfit) * 100) : 0}% от общего`,
                    color: "#2196f3",
                    gradient: "linear-gradient(180deg, #2196f3, #1976d2)"
                },
                {
                    name: "Почта",
                    value: `+${formatNumber(storageIncomePerDay - (storageIncomePerDay * 0.3))}/день`,
                    percentage: `${netProfit > 0 ? Math.round(((storageIncomePerDay - (storageIncomePerDay * 0.3)) / netProfit) * 100) : 0}% от общего`,
                    color: "#ff9800",
                    gradient: "linear-gradient(180deg, #ff9800, #f57c00)"
                },
                {
                    name: "Типография",
                    value: `+${formatNumber(printIncomePerDay - (printIncomePerDay * 0.3))}/день`,
                    percentage: `${netProfit > 0 ? Math.round(((printIncomePerDay - (printIncomePerDay * 0.3)) / netProfit) * 100) : 0}% от общего`,
                    color: "#9c27b0",
                    gradient: "linear-gradient(180deg, #9c27b0, #7b1fa2)"
                }
            ]
        }
    };
}

// Функция для переключения категории статистики
function switchStatisticsCategory(category) {
    const realData = getRealStatisticsData();
    const data = realData[category];
    if (!data) return;

    // Обновляем заголовок
    const titleElement = document.querySelector('.stat-title');
    if (titleElement) {
        titleElement.textContent = data.title;
        titleElement.setAttribute('data-category', category);
    }

    // Обновляем общую сумму
    const totalElement = document.querySelector('.stat-total');
    if (totalElement) {
        const span = totalElement.querySelector('span');
        if (span) {
            span.textContent = data.total;
        }
    }

    // Обновляем элементы статистики
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
        const itemData = data.items[index];
        if (itemData) {
            // Обновляем цветовую линию
            const lineElement = item.querySelector('.stat-line');
            if (lineElement) {
                lineElement.style.background = itemData.gradient;
            }

            // Обновляем цветовую точку
            const dotElement = item.querySelector('.stat-dot');
            if (dotElement) {
                dotElement.style.background = itemData.color;
            }

            // Обновляем название
            const nameElement = item.querySelector('.stat-name');
            if (nameElement) {
                nameElement.textContent = itemData.name;
            }

            // Обновляем значение
            const valueElement = item.querySelector('.stat-value');
            if (valueElement) {
                valueElement.textContent = itemData.value;
            }

            // Обновляем процент
            const percentageElement = item.querySelector('.stat-percentage');
            if (percentageElement) {
                percentageElement.textContent = itemData.percentage;
            }

            // Обновляем data-атрибут
            item.setAttribute('data-category', category);
        }
    });

    // Обновляем активную кнопку
    updateActiveButton(category);
}

// Функция для обновления активной кнопки
function updateActiveButton(activeCategory) {
    const buttons = document.querySelectorAll('.stat-category-btn');
    buttons.forEach(button => {
        const category = button.getAttribute('data-category');
        if (category === activeCategory) {
            button.classList.add('active');
            button.style.background = 'linear-gradient(135deg, #666 0%, #555 100%)';
        } else {
            button.classList.remove('active');
            button.style.background = 'linear-gradient(135deg, #424242 0%, #333 100%)';
        }
    });
}

// Инициализация системы статистики
function initStatistics() {
    // Добавляем обработчики событий для кнопок
    const buttons = document.querySelectorAll('.stat-category-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            switchStatisticsCategory(category);
        });
    });

    // Устанавливаем начальную категорию (доходы)
    switchStatisticsCategory('income');
}

// Обработчики панели статистики
// Флаг для отслеживания инициализации statistics
let statisticsInitialized = false;

// Функция для генерации уникального ID пользователя (если не существует)
function generateUniqueUserId() {
    if (window.currentUserId) {
        return window.currentUserId;
    }
    
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = Date.now().toString();
        localStorage.setItem('userId', userId);
    }
    return userId;
}

document.addEventListener('DOMContentLoaded', () => {
    // Предотвращаем повторную инициализацию
    if (statisticsInitialized) {
        console.log('⚠️ Statistics already initialized, skipping...');
        return;
    }
    // Добавляем панель статистики в глобальную функцию isAnyPanelOpen
    if (window.isAnyPanelOpen) {
        const originalFunction = window.isAnyPanelOpen;
        window.isAnyPanelOpen = function() {
            const panels = [
                'shop-panel',
                'characters-panel', 
                'city-panel',
                'tasks-panel',
                'profile-panel',
                'friends-panel',
                'game-tasks-panel',
                'statistics-panel' // Добавлена панель статистики
            ];
            
            return panels.some(panelId => {
                const panel = document.getElementById(panelId);
                return panel && panel.style.display !== 'none';
            });
        };
    }
    
    // Закрытие панели статистики
    const statisticsClose = document.getElementById('statistics-close');
    const statisticsPanel = document.getElementById('statistics-panel');
    if (statisticsClose && statisticsPanel) {
        statisticsClose.addEventListener('click', () => {
            if (window.hidePanelWithAnimation) {
                window.hidePanelWithAnimation('statistics-panel', () => {
                    // Сбрасываем подсветку кнопки
                    if (window.clearActiveSideButton) {
                        window.clearActiveSideButton();
                    }
                });
            } else {
            statisticsPanel.style.display = 'none';
                // Сбрасываем подсветку кнопки
                if (window.clearActiveSideButton) {
                    window.clearActiveSideButton();
                }
            }
        });
    }
    
    // Обработчик кнопки "Статистика" (бывшая кнопка "Новости")
    const btnNews = document.getElementById('btn-news');
    if (btnNews && statisticsPanel) {
        btnNews.addEventListener('click', () => {
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
                    'game-tasks-panel',
                    'statistics-panel'
                ];
                return panels.some(id => document.getElementById(id)?.style.display === 'flex');
            };
            
            if (isAnyPanelOpen()) return;
            
            // Принудительно синхронизируем уровень и ХП перед открытием
            if (window.syncLevelAndXP) {
                window.syncLevelAndXP();
            }
            
            // Обновляем статистику и открываем панель
            updateStatistics();
            // Дополнительно синхронизируем уровень и ХП
            if (window.syncLevelAndXP) {
                window.syncLevelAndXP();
            }
            if (window.showPanelWithAnimation) {
                window.showPanelWithAnimation('statistics-panel');
            } else {
            statisticsPanel.style.display = 'flex';
            }
            
            // Принудительная синхронизация после открытия панели
            setTimeout(() => {
                if (window.syncLevelAndXP) {
                    window.syncLevelAndXP();
                }
            }, 100);
            
            // Подсвечиваем кнопку белым цветом
            if (window.setActiveSideButton) {
                window.setActiveSideButton('btn-news');
            }
        });
    }
});

// Функция для обновления статистики
function updateStatistics() {
    // Используем единую функцию синхронизации для уровня и ХП
    if (window.syncLevelAndXP) {
        window.syncLevelAndXP();
    }

    // Собираем актуальные данные зданий
    const buildingsData = JSON.parse(localStorage.getItem('buildingsData') || '{}');

    const getHourlyIncome = (b) => {
        if (!b || !b.isOwned) return 0;
        const workers = typeof b.workers === 'number' ? b.workers : 0;
        const baseIncome = typeof b.income === 'number' ? b.income : 0;
        return baseIncome * (1 + workers * 0.2);
    };

    const libraryIncomePerHour = getHourlyIncome(buildingsData && buildingsData.library);
    const factoryIncomePerHour = getHourlyIncome(buildingsData && buildingsData.factory);
    const storageIncomePerHour = getHourlyIncome(buildingsData && buildingsData.storage);

    // Переводим в секунды
    const libraryIncomePerSec = libraryIncomePerHour / 3600;
    const factoryIncomePerSec = factoryIncomePerHour / 3600;
    const storageIncomePerSec = storageIncomePerHour / 3600;

    const totalDailyIncome = (libraryIncomePerSec + factoryIncomePerSec + storageIncomePerSec + printIncomePerSec) * 3600 * 24;
    
    // Функция для форматирования чисел
    const formatNumber = window.formatNumber || ((num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return Math.round(num).toString();
    });
    
    // Обновляем общий доход
    const totalIncomeEl = document.querySelector('#statistics-panel .stat-total');
    if (totalIncomeEl) {
        const span = totalIncomeEl.querySelector('span');
        if (span) {
            span.textContent = formatNumber(totalDailyIncome);
        }
    }
    
    // Обновляем детальную статистику по направлениям
    updateIncomeBreakdown(libraryIncomePerSec, factoryIncomePerSec, storageIncomePerSec, statueIncomePerSec, totalDailyIncome);
    
    // Дополнительная синхронизация после обновления статистики
    setTimeout(() => {
        if (window.syncLevelAndXP) {
            window.syncLevelAndXP();
        }
    }, 50);
}

// Функция для обновления детальной статистики по направлениям
function updateIncomeBreakdown(libraryIncomePerSec, factoryIncomePerSec, storageIncomePerSec, printIncomePerSec, totalDailyIncome) {
    const formatNumber = window.formatNumber || ((num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return Math.round(num).toString();
    });
    
    // Рассчитываем доходы в день
    const libraryIncomePerDay = libraryIncomePerSec * 24 * 3600;
    const factoryIncomePerDay = factoryIncomePerSec * 24 * 3600;
    const storageIncomePerDay = storageIncomePerSec * 24 * 3600;
    const printIncomePerDay = printIncomePerSec * 24 * 3600;
    
    // Обновляем элементы статистики
    const statItems = document.querySelectorAll('.stat-item');
    
    // Библиотека
    if (statItems[0]) {
        const valueElement = statItems[0].querySelector('.stat-value');
        const percentageElement = statItems[0].querySelector('.stat-percentage');
        if (valueElement) {
            valueElement.textContent = `${formatNumber(libraryIncomePerDay)}/день`;
        }
        if (percentageElement) {
            percentageElement.textContent = `${totalDailyIncome > 0 ? Math.round((libraryIncomePerDay / totalDailyIncome) * 100) : 0}% от общего`;
        }
    }
    
    // Завод
    if (statItems[1]) {
        const valueElement = statItems[1].querySelector('.stat-value');
        const percentageElement = statItems[1].querySelector('.stat-percentage');
        if (valueElement) {
            valueElement.textContent = `${formatNumber(factoryIncomePerDay)}/день`;
        }
        if (percentageElement) {
            percentageElement.textContent = `${totalDailyIncome > 0 ? Math.round((factoryIncomePerDay / totalDailyIncome) * 100) : 0}% от общего`;
        }
    }
    
    // Почта
    if (statItems[2]) {
        const valueElement = statItems[2].querySelector('.stat-value');
        const percentageElement = statItems[2].querySelector('.stat-percentage');
        if (valueElement) {
            valueElement.textContent = `${formatNumber(storageIncomePerDay)}/день`;
        }
        if (percentageElement) {
            percentageElement.textContent = `${totalDailyIncome > 0 ? Math.round((storageIncomePerDay / totalDailyIncome) * 100) : 0}% от общего`;
        }
    }
    
    // Типография
    if (statItems[3]) {
        const valueElement = statItems[3].querySelector('.stat-value');
        const percentageElement = statItems[3].querySelector('.stat-percentage');
        if (valueElement) {
            valueElement.textContent = `${formatNumber(printIncomePerDay)}/день`;
        }
        if (percentageElement) {
            percentageElement.textContent = `${totalDailyIncome > 0 ? Math.round((printIncomePerDay / totalDailyIncome) * 100) : 0}% от общего`;
        }
    }
}

// Экспорт функций для использования в других файлах
window.statisticsManager = {
    switchCategory: switchStatisticsCategory,
    init: initStatistics,
    update: updateStatistics
};

// Функция для обновления статистики при изменении данных игрока
function refreshStatistics() {
    // Синхронизируем уровень и ХП
    if (window.syncLevelAndXP) {
        window.syncLevelAndXP();
    }
    
    // Обновляем статистику если панель открыта
    const statisticsPanel = document.getElementById('statistics-panel');
    if (statisticsPanel && statisticsPanel.style.display === 'flex') {
        updateStatistics();
    }
}

// Делаем функцию глобально доступной
window.refreshStatistics = refreshStatistics;

// Добавляем слушатель для обновления статистики при изменении localStorage
window.addEventListener('storage', function(e) {
    if (e.key && (e.key.includes('upCnt') || e.key.includes('f_upCnt') || e.key.includes('stor_up') || e.key === 'playerXP' || e.key === 'playerLevel' || e.key === 'buildingsData')) {
        refreshStatistics();
        // Синхронизируем уровень и ХП при изменении данных игрока
        if (window.syncLevelAndXP) {
            window.syncLevelAndXP();
        }
    }
});

// Добавляем дополнительный слушатель для изменений в текущей вкладке
let lastPlayerLevel = localStorage.getItem('playerLevel') || '1';
let lastPlayerXP = localStorage.getItem('playerXP') || '0';

setInterval(() => {
    const currentPlayerLevel = localStorage.getItem('playerLevel') || '1';
    const currentPlayerXP = localStorage.getItem('playerXP') || '0';
    
    if (currentPlayerLevel !== lastPlayerLevel || currentPlayerXP !== lastPlayerXP) {
        lastPlayerLevel = currentPlayerLevel;
        lastPlayerXP = currentPlayerXP;
        
        if (window.syncLevelAndXP) {
            window.syncLevelAndXP();
        }
    }
}, 1000);

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Предотвращаем повторную инициализацию
    if (statisticsInitialized) {
        console.log('⚠️ Statistics init already called, skipping...');
        return;
    }
    
    initStatistics();
    statisticsInitialized = true;
    console.log('✅ Statistics system initialized');
}); 