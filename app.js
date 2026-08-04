// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Данные (LocalStorage для начала)
let dreams = JSON.parse(localStorage.getItem('somni_dreams') || '[]');
let events = JSON.parse(localStorage.getItem('somni_events') || '[]');

// API ключ OpenAI (в продакшене — через бэкенд!)
const OPENAI_KEY = 'your-api-key-here';

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    setMoonPhase();
    showDate();
    renderDreams();
    renderEvents();
});

// Создание звёзд
function createStars() {
    const container = document.getElementById('stars');
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 3 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
        star.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(star);
    }
}

// Фаза луны (реальная)
function setMoonPhase() {
    const moon = document.getElementById('moon');
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Простой расчёт фазы луны
    const c = Math.floor((year - 1900) / 100);
    const e = Math.floor((year - 1900) % 100);
    const f = Math.floor(e / 4);
    const g = Math.floor(c / 4);
    const h = (c - g) * 17;
    const i = (e - f) * 11;
    const j = month + day;
    const k = h + i + j;
    const phase = k % 30;
    
    // Смещение тени (от 0 — полнолуние, до 100 — новолуние)
    const shadowX = (phase - 15) * 3;
    moon.style.setProperty('--shadow-x', shadowX + 'px');
}

// Текущая дата
function showDate() {
    const date = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('current-date').textContent = date.toLocaleDateString('ru-RU', options);
}

// Переключение вкладок
function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
    
    if (tabName === 'flow') renderFlow();
}

// Выбор эмоции
function toggleEmotion(el) {
    el.classList.toggle('active');
}

// Расшифровка сна
async function interpretDream() {
    const text = document.getElementById('dream-text').value.trim();
    if (!text) {
        tg.showAlert('Опиши сон сначала');
        return;
    }
    
    const emotions = Array.from(document.querySelectorAll('.emotion.active'))
        .map(e => e.textContent).join(', ');
    
    document.getElementById('loading').classList.remove('hidden');
    
    try {
        // Здесь должен быть запрос к вашему бэкенду, а не прямой к OpenAI
        // Для демо — имитация
        await new Promise(r => setTimeout(r, 2000));
        
        const interpretation = generateInterpretation(text, emotions);
        
        document.getElementById('interpretation-text').innerHTML = interpretation.text;
        document.getElementById('archetypes').innerHTML = interpretation.archetypes
            .map(a => `<span class="tag">${a}</span>`).join('');
        document.getElementById('symbols').innerHTML = interpretation.symbols
            .map(s => `<span class="tag">${s}</span>`).join('');
        
        document.getElementById('result-card').classList.remove('hidden');
        
    } catch (e) {
        tg.showAlert('Ошибка. Попробуй позже.');
    } finally {
        document.getElementById('loading').classList.add('hidden');
    }
}

// Генерация расшифровки (демо — заменить на реальный AI)
function generateInterpretation(text, emotions) {
    // Здесь будет реальный запрос к OpenAI
    return {
        text: `<p>Ваш сон говорит о глубинном стремлении к свободе, которое конфликтует с чувством ответственности. Вода символизирует бессознательное, в которое вы погружаетесь, чтобы избежать давления реальности.</p><p>Душа призывает вас найти баланс между полётом и приземлением — между мечтами и обязанностями.</p>`,
        archetypes: ['Пуэр', 'Тень', 'Великая Мать'],
        symbols: ['Вода', 'Полёт', 'Город', 'Погружение']
    };
}

// Сохранение сна
function saveDream() {
    const text = document.getElementById('dream-text').value;
    const emotions = Array.from(document.querySelectorAll('.emotion.active'))
        .map(e => e.textContent);
    const interpretation = document.getElementById('interpretation-text').textContent;
    
    const dream = {
        id: Date.now(),
        date: new Date().toISOString(),
        text,
        emotions,
        interpretation,
        symbols: ['Вода', 'Полёт'] // Из реального анализа
    };
    
    dreams.unshift(dream);
    localStorage.setItem('somni_dreams', JSON.stringify(dreams));
    
    tg.showAlert('Сон сохранён в архив');
    renderDreams();
    
    // Очистка формы
    document.getElementById('dream-text').value = '';
    document.querySelectorAll('.emotion.active').forEach(e => e.classList.remove('active'));
    document.getElementById('result-card').classList.add('hidden');
}

// Рендер архива
function renderDreams() {
    const list = document.getElementById('dream-list');
    const stats = document.getElementById('dream-stats');
    
    if (dreams.length === 0) {
        list.innerHTML = '<p style="color: var(--text-dim); text-align: center;">Пока нет снов. Запиши первый!</p>';
        stats.innerHTML = '';
        return;
    }
    
    stats.innerHTML = `
        <div style="display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
            <span>🌙 Всего: ${dreams.length}</span>
            <span>💧 Вода: ${dreams.filter(d => d.symbols?.includes('Вода')).length}</span>
            <span>🔥 Огонь: ${dreams.filter(d => d.symbols?.includes('Огонь')).length}</span>
        </div>
    `;
    
    list.innerHTML = dreams.map(d => `
        <div class="dream-item">
            <div class="dream-date">${new Date(d.date).toLocaleDateString('ru-RU')}</div>
            <div>${d.text.substring(0, 100)}${d.text.length > 100 ? '...' : ''}</div>
            <div style="margin-top: 8px;">${d.emotions.map(e => `<span class="tag">${e}</span>`).join('')}</div>
        </div>
    `).join('');
}

// Добавление события
function addEvent() {
    const date = document.getElementById('event-date').value;
    const title = document.getElementById('event-title').value.trim();
    const type = document.getElementById('event-type').value;
    const intensity = document.getElementById('event-intensity').value;
    
    if (!date || !title) {
        tg.showAlert('Заполни дату и событие');
        return;
    }
    
    events.push({
        id: Date.now(),
        date,
        title,
        type,
        intensity: parseInt(intensity)
    });
    
    localStorage.setItem('somni_events', JSON.stringify(events));
    renderEvents();
    
    document.getElementById('event-title').value = '';
}

// Рендер событий
function renderEvents() {
    const list = document.getElementById('event-list');
    
    if (events.length === 0) {
        list.innerHTML = '<p style="color: var(--text-dim); text-align: center;">Нет событий. Добавь первое!</p>';
        return;
    }
    
    list.innerHTML = events.sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(e => `
            <div class="event-item" style="border-left-color: ${getEventColor(e.type)}">
                <div class="event-date">${e.date} · ${getEventTypeName(e.type)} · Интенсивность: ${e.intensity}/10</div>
                <div>${e.title}</div>
            </div>
        `).join('');
}

function getEventColor(type) {
    const colors = {
        work: '#7b68ee', relations: '#ff6b9d', health: '#4ecdc4',
        finance: '#ffe66d', other: '#95a5a6'
    };
    return colors[type] || '#95a5a6';
}

function getEventTypeName(type) {
    const names = {
        work: 'Работа', relations: 'Отношения', health: 'Здоровье',
        finance: 'Финансы', other: 'Другое'
    };
    return names[type] || type;
}

// Поток вывода
function renderFlow() {
    const timeline = document.getElementById('timeline');
    const insight = document.getElementById('insight-card');
    
    // Объединяем сны и события
    const all = [
        ...dreams.map(d => ({...d, type: 'dream'})),
        ...events.map(e => ({...e, type: 'event'}))
    ].sort((a, b) => new Date(b.date || b.date) - new Date(a.date || a.date));
    
    if (all.length === 0) {
        timeline.innerHTML = '<p style="color: var(--text-dim); text-align: center;">Недостаточно данных. Записывай сны и события!</p>';
        insight.classList.add('hidden');
        return;
    }
    
    timeline.innerHTML = all.slice(0, 10).map(item => `
        <div class="timeline-item">
            <div style="font-size: 0.8rem; color: var(--text-dim);">
                ${new Date(item.date).toLocaleDateString('ru-RU')}
                ${item.type === 'dream' ? '🌙 Сон' : '🔴 Событие'}
            </div>
            <div>${item.text?.substring(0, 60) || item.title}</div>
        </div>
    `).join('');
    
    // Генерация инсайта (демо)
    if (dreams.length >= 3) {
        document.getElementById('insight-text').textContent = 
            'За последний период наблюдается тема "погружения" и "потери контроля". ' +
            'Возможно, стоит обратить внимание на границы в отношениях и работе.';
        insight.classList.remove('hidden');
    }
}

// Обновление слайдера
document.getElementById('event-intensity')?.addEventListener('input', (e) => {
    document.getElementById('intensity-value').textContent = e.target.value;
});