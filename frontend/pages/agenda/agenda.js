import apiService from '../../services/api.service.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { createEventCard, initEventCardStyles } from '../../components/eventCard/eventCard.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';
import router from '../../router/router.js';

let currentView = 'list';
let currentDate = new Date();

export async function renderAgendaPage() {
    renderNavbar('Agenda');
    initEventCardStyles();

    const pageContent = document.getElementById('page-content');

    pageContent.innerHTML = `
        <style>
            .agenda-header {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
            }

            @media (min-width: 640px) {
                .agenda-header {
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                }
            }

            .agenda-nav {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
            }

            .agenda-nav-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: none;
                background: rgba(139, 105, 20, 0.1);
                color: #8B6914;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all var(--transition-fast);
            }

            .agenda-nav-btn:hover {
                background: rgba(139, 105, 20, 0.2);
            }

            .agenda-nav-btn:active {
                transform: scale(0.95);
            }

            [data-theme="dark"] .agenda-nav-btn {
                background: rgba(201, 162, 39, 0.15);
                color: #C9A227;
            }

            [data-theme="dark"] .agenda-nav-btn:hover {
                background: rgba(201, 162, 39, 0.25);
            }

            .agenda-title {
                font-size: var(--font-lg);
                font-weight: var(--font-semibold);
                text-transform: capitalize;
            }

            #today-btn {
                background: rgba(139, 105, 20, 0.1);
                color: #8B6914;
                border: none;
                border-radius: 100px;
                padding: 8px 16px;
                font-weight: 500;
            }

            #today-btn:hover {
                background: rgba(139, 105, 20, 0.2);
            }

            [data-theme="dark"] #today-btn {
                background: rgba(201, 162, 39, 0.15);
                color: #C9A227;
            }

            [data-theme="dark"] #today-btn:hover {
                background: rgba(201, 162, 39, 0.25);
            }

            .agenda-views {
                display: flex;
                gap: 6px;
                background-color: rgba(139, 105, 20, 0.08);
                padding: 6px;
                border-radius: 100px;
            }

            .view-btn {
                padding: 10px 18px;
                font-size: var(--font-sm);
                border-radius: 100px;
                transition: all var(--transition-fast);
                color: #8B6914;
                font-weight: 500;
            }

            .view-btn.active {
                background: linear-gradient(135deg, #8B6914, #6B5210);
                color: white;
                box-shadow: none;
            }

            [data-theme="dark"] .agenda-views {
                background-color: rgba(201, 162, 39, 0.1);
            }

            [data-theme="dark"] .view-btn {
                color: #C9A227;
            }

            [data-theme="dark"] .view-btn.active {
                background: linear-gradient(135deg, #C9A227, #8B6914);
                color: #1a1a1a;
            }

            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 1px;
                background-color: rgba(139, 105, 20, 0.15);
                border: none;
                border-radius: 20px;
                overflow: hidden;
            }

            .calendar-header {
                background: linear-gradient(180deg, #F5F0E6 0%, #EDE6D6 100%);
                padding: var(--spacing-sm);
                text-align: center;
                font-size: var(--font-sm);
                font-weight: 600;
                color: #8B6914;
            }

            .calendar-day {
                background: linear-gradient(180deg, #FAFAFA 0%, #F5F2EC 100%);
                min-height: 100px;
                padding: var(--spacing-xs);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .calendar-day:hover {
                background: linear-gradient(180deg, #F5F0E6 0%, #EDE6D6 100%);
            }

            .calendar-day.other-month {
                background: #F0EDE6;
                color: #999;
            }

            .calendar-day.today {
                background: linear-gradient(180deg, #F5F0E6 0%, #EDE6D6 100%);
            }

            .calendar-day-number {
                font-size: var(--font-sm);
                font-weight: 600;
                margin-bottom: var(--spacing-xs);
                color: #1a1a1a;
            }

            .calendar-day.today .calendar-day-number {
                color: #8B6914;
                font-weight: 700;
            }

            /* Dark theme calendar */
            [data-theme="dark"] .calendar-grid {
                background-color: rgba(201, 162, 39, 0.15);
            }

            [data-theme="dark"] .calendar-header {
                background: linear-gradient(180deg, #2a2520 0%, #1f1b17 100%);
                color: #C9A227;
            }

            [data-theme="dark"] .calendar-day {
                background: linear-gradient(180deg, #1a1a1a 0%, #1f1b17 100%);
            }

            [data-theme="dark"] .calendar-day:hover {
                background: linear-gradient(180deg, #2a2520 0%, #252220 100%);
            }

            [data-theme="dark"] .calendar-day.other-month {
                background: #1a1815;
                color: #666;
            }

            [data-theme="dark"] .calendar-day.today {
                background: linear-gradient(180deg, #2a2520 0%, #252220 100%);
            }

            [data-theme="dark"] .calendar-day-number {
                color: #fff;
            }

            [data-theme="dark"] .calendar-day.today .calendar-day-number {
                color: #C9A227;
            }

            .calendar-event {
                font-size: var(--font-xs);
                padding: 4px 8px;
                border-radius: 6px;
                margin-bottom: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: white;
                font-weight: 500;
            }

            .events-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
            }

            .events-day-group {
                margin-bottom: var(--spacing-lg);
            }

            .events-day-header {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-md);
            }

            .events-day-date {
                width: 48px;
                height: 48px;
                background: linear-gradient(145deg, #8B6914, #6B5210);
                color: white;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            [data-theme="dark"] .events-day-date {
                background: linear-gradient(145deg, #C9A227, #8B6914);
                color: #1a1a1a;
            }

            .events-day-date-num {
                font-size: var(--font-xl);
                font-weight: var(--font-bold);
                line-height: 1;
            }

            .events-day-date-day {
                font-size: var(--font-xs);
                text-transform: uppercase;
            }

            .events-day-title {
                font-weight: var(--font-medium);
            }

            .add-btn {
                position: fixed;
                bottom: calc(var(--mobile-nav-height) + var(--spacing-lg));
                right: var(--spacing-lg);
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #8B6914, #6B5210);
                color: white;
                box-shadow: 0 4px 24px rgba(139, 105, 20, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all var(--transition-fast);
                z-index: var(--z-fixed);
            }

            .add-btn:hover {
                background: linear-gradient(135deg, #9B7924, #7B6220);
                transform: scale(1.05);
            }

            .add-btn:active {
                transform: scale(0.95);
            }

            [data-theme="dark"] .add-btn {
                background: linear-gradient(135deg, #C9A227, #8B6914);
                box-shadow: 0 4px 24px rgba(201, 162, 39, 0.3);
            }

            @media (min-width: 1024px) {
                .add-btn {
                    bottom: var(--spacing-xl);
                }
            }

            @media (max-width: 767px) {
                .calendar-day {
                    min-height: 60px;
                }

                .calendar-event {
                    display: none;
                }

                .calendar-day.has-events::after {
                    content: '';
                    display: block;
                    width: 6px;
                    height: 6px;
                    background-color: #8B6914;
                    border-radius: 50%;
                    margin: var(--spacing-xs) auto 0;
                }

                [data-theme="dark"] .calendar-day.has-events::after {
                    background-color: #C9A227;
                }
            }
        </style>

        <div class="agenda-header">
            <div class="agenda-nav">
                <button class="agenda-nav-btn" id="prev-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h2 class="agenda-title" id="agenda-title"></h2>
                <button class="agenda-nav-btn" id="next-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                <button class="btn btn-ghost btn-sm" id="today-btn">Aujourd'hui</button>
            </div>
            <div class="agenda-views">
                <button class="view-btn active" data-view="list">Liste</button>
                <button class="view-btn" data-view="calendar">Calendrier</button>
            </div>
        </div>

        <div id="agenda-content">
            <div class="skeleton" style="height: 400px;"></div>
        </div>

        <button class="add-btn" id="add-event-btn" title="Ajouter un événement">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
    `;

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderView();
        });
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderView();
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderView();
    });

    document.getElementById('today-btn').addEventListener('click', () => {
        currentDate = new Date();
        renderView();
    });

    document.getElementById('add-event-btn').addEventListener('click', () => {
        openEventForm();
    });

    renderView();

    const params = router.getQueryParams();
    if (params.action === 'new') {
        openEventForm();
    }
}

async function renderView() {
    const title = document.getElementById('agenda-title');
    const content = document.getElementById('agenda-content');

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    title.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    if (currentView === 'calendar') {
        renderCalendar(content);
    } else {
        await renderList(content);
    }
}

async function renderList(container) {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    try {
        const response = await apiService.getEvents({
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
        });

        if (response.success) {
            const events = response.data.events;

            if (events.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <h3 class="empty-state-title">Aucun événement</h3>
                        <p class="empty-state-description">Aucun événement prévu ce mois-ci</p>
                    </div>
                `;
                return;
            }

            const eventsByDate = events.reduce((acc, event) => {
                const date = event.start_datetime.split('T')[0];
                if (!acc[date]) acc[date] = [];
                acc[date].push(event);
                return acc;
            }, {});

            const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

            container.innerHTML = Object.entries(eventsByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, dayEvents]) => {
                    const d = new Date(date);
                    return `
                        <div class="events-day-group">
                            <div class="events-day-header">
                                <div class="events-day-date">
                                    <span class="events-day-date-num">${d.getDate()}</span>
                                    <span class="events-day-date-day">${dayNames[d.getDay()]}</span>
                                </div>
                                <div class="events-day-title">${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                            </div>
                            <div class="events-list" id="events-${date}"></div>
                        </div>
                    `;
                }).join('');

            Object.entries(eventsByDate).forEach(([date, dayEvents]) => {
                const listEl = document.getElementById(`events-${date}`);
                dayEvents.forEach(event => {
                    const card = createEventCard(event, {
                        onClick: (e) => openEventDetail(e)
                    });
                    listEl.appendChild(card);
                });
            });
        }
    } catch (error) {
        console.error('Load events error:', error);
        toastError('Erreur lors du chargement des événements');
    }
}

async function renderCalendar(container) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const today = new Date();

    let response;
    try {
        response = await apiService.getEvents({
            start_date: new Date(year, month, 1 - startOffset).toISOString().split('T')[0],
            end_date: new Date(year, month + 1, 7).toISOString().split('T')[0]
        });
    } catch (e) {
        response = { success: false };
    }

    const eventsByDate = {};
    if (response.success) {
        response.data.events.forEach(event => {
            const date = event.start_datetime.split('T')[0];
            if (!eventsByDate[date]) eventsByDate[date] = [];
            eventsByDate[date].push(event);
        });
    }

    let calendarHTML = '<div class="calendar-grid">';

    dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-header">${day}</div>`;
    });

    for (let i = 0; i < startOffset; i++) {
        const day = prevMonthLastDay - startOffset + 1 + i;
        calendarHTML += `<div class="calendar-day other-month"><span class="calendar-day-number">${day}</span></div>`;
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
        const dayEvents = eventsByDate[dateStr] || [];
        const hasEvents = dayEvents.length > 0;

        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}" data-date="${dateStr}">
                <span class="calendar-day-number">${day}</span>
                ${dayEvents.slice(0, 3).map(e => `
                    <div class="calendar-event" style="background-color: ${e.color || '#3B82F6'};">${e.title}</div>
                `).join('')}
                ${dayEvents.length > 3 ? `<div class="text-xs text-muted">+${dayEvents.length - 3} autres</div>` : ''}
            </div>
        `;
    }

    const totalCells = startOffset + lastDay.getDate();
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
        calendarHTML += `<div class="calendar-day other-month"><span class="calendar-day-number">${i}</span></div>`;
    }

    calendarHTML += '</div>';
    container.innerHTML = calendarHTML;

    container.querySelectorAll('.calendar-day:not(.other-month)').forEach(dayEl => {
        dayEl.addEventListener('click', () => {
            const date = dayEl.dataset.date;
            console.log('Selected date:', date);
        });
    });
}

function openEventForm(event = null) {
    const isEdit = !!event;

    openBottomSheet({
        title: isEdit ? 'Modifier l\'événement' : 'Nouvel événement',
        content: `
            <form id="event-form">
                <div class="form-group">
                    <label class="form-label" for="title">Titre *</label>
                    <input type="text" class="form-input" id="title" name="title" required value="${event?.title || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="event_type">Type</label>
                    <select class="form-select" id="event_type" name="event_type">
                        <option value="cours" ${event?.event_type === 'cours' ? 'selected' : ''}>Cours</option>
                        <option value="atelier" ${event?.event_type === 'atelier' ? 'selected' : ''}>Atelier</option>
                        <option value="reunion" ${event?.event_type === 'reunion' ? 'selected' : ''}>Réunion</option>
                        <option value="sortie" ${event?.event_type === 'sortie' ? 'selected' : ''}>Sortie</option>
                        <option value="competition" ${event?.event_type === 'competition' ? 'selected' : ''}>Compétition</option>
                        <option value="autre" ${event?.event_type === 'autre' ? 'selected' : ''}>Autre</option>
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-md">
                    <div class="form-group">
                        <label class="form-label" for="start_datetime">Début *</label>
                        <input type="datetime-local" class="form-input" id="start_datetime" name="start_datetime" required value="${event?.start_datetime ? event.start_datetime.slice(0, 16) : ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="end_datetime">Fin *</label>
                        <input type="datetime-local" class="form-input" id="end_datetime" name="end_datetime" required value="${event?.end_datetime ? event.end_datetime.slice(0, 16) : ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="location">Lieu</label>
                    <input type="text" class="form-input" id="location" name="location" value="${event?.location || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="max_participants">Places max</label>
                    <input type="number" class="form-input" id="max_participants" name="max_participants" min="1" value="${event?.max_participants || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="description">Description</label>
                    <textarea class="form-textarea" id="description" name="description" rows="3">${event?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="color">Couleur</label>
                    <input type="color" class="form-input" id="color" name="color" value="${event?.color || '#3B82F6'}" style="height: 44px; padding: 4px;">
                </div>
            </form>
        `,
        footer: `
            <button type="button" class="btn btn-secondary" id="cancel-btn">Annuler</button>
            <button type="submit" form="event-form" class="btn btn-primary" id="save-btn">${isEdit ? 'Enregistrer' : 'Créer'}</button>
        `
    });

    document.getElementById('cancel-btn').addEventListener('click', closeBottomSheet);

    document.getElementById('event-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const saveBtn = document.getElementById('save-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Enregistrement...';

        try {
            let response;
            if (isEdit) {
                response = await apiService.updateEvent(event.id, data);
            } else {
                response = await apiService.createEvent(data);
            }

            if (response.success) {
                toastSuccess(isEdit ? 'Événement modifié' : 'Événement créé');
                closeBottomSheet();
                renderView();
            }
        } catch (error) {
            toastError(error.message || 'Erreur lors de l\'enregistrement');
            saveBtn.disabled = false;
            saveBtn.textContent = isEdit ? 'Enregistrer' : 'Créer';
        }
    });
}

function openEventDetail(event) {
    const startDate = new Date(event.start_datetime);
    const endDate = new Date(event.end_datetime);

    openBottomSheet({
        title: event.title,
        content: `
            <div style="margin-bottom: var(--spacing-lg);">
                <span class="badge" style="background-color: ${event.color || '#3B82F6'}; color: white;">${event.event_type}</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                <div class="flex items-center gap-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <div>
                        <div>${startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div class="text-sm text-muted">${startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>

                ${event.location ? `
                    <div class="flex items-center gap-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span>${event.location}</span>
                    </div>
                ` : ''}

                ${event.max_participants ? `
                    <div class="flex items-center gap-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>${event.current_participants || 0} / ${event.max_participants} participants</span>
                    </div>
                ` : ''}

                ${event.intervenant_first_name ? `
                    <div class="flex items-center gap-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span>${event.intervenant_first_name} ${event.intervenant_last_name}</span>
                    </div>
                ` : ''}
            </div>

            ${event.description ? `
                <div style="margin-top: var(--spacing-lg); padding-top: var(--spacing-lg); border-top: 1px solid var(--color-border);">
                    <p class="text-sm text-muted" style="margin-bottom: var(--spacing-xs);">Description</p>
                    <p>${event.description}</p>
                </div>
            ` : ''}
        `,
        footer: `
            <button class="btn btn-secondary" id="edit-event-btn">Modifier</button>
            <button class="btn btn-primary" id="close-detail-btn">Fermer</button>
        `
    });

    document.getElementById('edit-event-btn').addEventListener('click', () => {
        closeBottomSheet();
        setTimeout(() => openEventForm(event), 300);
    });

    document.getElementById('close-detail-btn').addEventListener('click', closeBottomSheet);
}
