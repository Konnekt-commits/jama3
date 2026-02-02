const icons = {
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
};

export function initEventCardStyles() {
    if (document.getElementById('event-card-styles')) return;

    const style = document.createElement('style');
    style.id = 'event-card-styles';
    style.textContent = `
        .event-card {
            display: flex;
            gap: var(--spacing-md);
            padding: var(--spacing-md);
            background-color: var(--color-card-bg);
            border: 1px solid var(--color-card-border);
            border-radius: var(--radius-lg);
            transition: all var(--transition-fast);
            cursor: pointer;
        }

        .event-card:hover {
            box-shadow: var(--shadow-md);
        }

        .event-card-date {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-width: 56px;
            padding: var(--spacing-sm);
            background-color: var(--color-bg-secondary);
            border-radius: var(--radius-md);
            text-align: center;
        }

        .event-card-date-day {
            font-size: var(--font-2xl);
            font-weight: var(--font-bold);
            line-height: 1;
        }

        .event-card-date-month {
            font-size: var(--font-xs);
            color: var(--color-text-muted);
            text-transform: uppercase;
        }

        .event-card-content {
            flex: 1;
            min-width: 0;
        }

        .event-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-sm);
        }

        .event-card-title {
            font-weight: var(--font-medium);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .event-card-type {
            flex-shrink: 0;
            padding: var(--spacing-xs) var(--spacing-sm);
            font-size: var(--font-xs);
            border-radius: var(--radius-full);
            background-color: var(--event-color, var(--color-primary));
            color: white;
        }

        .event-card-details {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-md);
            font-size: var(--font-sm);
            color: var(--color-text-secondary);
        }

        .event-card-detail {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
        }

        .event-card-detail svg {
            color: var(--color-text-muted);
        }

        .event-card-indicator {
            width: 4px;
            border-radius: var(--radius-full);
            background-color: var(--event-color, var(--color-primary));
        }

        .event-card-compact {
            padding: var(--spacing-sm) var(--spacing-md);
        }

        .event-card-compact .event-card-date {
            min-width: 44px;
            padding: var(--spacing-xs);
        }

        .event-card-compact .event-card-date-day {
            font-size: var(--font-lg);
        }

        .event-card-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
        }
    `;
    document.head.appendChild(style);
}

const eventTypeLabels = {
    cours: 'Cours',
    atelier: 'Atelier',
    reunion: 'Réunion',
    sortie: 'Sortie',
    competition: 'Compétition',
    autre: 'Autre'
};

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export function createEventCard(event, options = {}) {
    const {
        compact = false,
        onClick = null,
        showIndicator = false
    } = options;

    initEventCardStyles();

    const startDate = new Date(event.start_datetime);
    const endDate = new Date(event.end_datetime);

    const day = startDate.getDate();
    const month = months[startDate.getMonth()];
    const startTime = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const endTime = endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const card = document.createElement('div');
    card.className = `event-card ${compact ? 'event-card-compact' : ''}`;
    card.dataset.eventId = event.id;
    card.style.setProperty('--event-color', event.color || '#3B82F6');

    card.innerHTML = `
        ${showIndicator ? '<div class="event-card-indicator"></div>' : ''}
        <div class="event-card-date">
            <span class="event-card-date-day">${day}</span>
            <span class="event-card-date-month">${month}</span>
        </div>
        <div class="event-card-content">
            <div class="event-card-header">
                <span class="event-card-title">${event.title}</span>
                <span class="event-card-type">${eventTypeLabels[event.event_type] || event.event_type}</span>
            </div>
            <div class="event-card-details">
                <span class="event-card-detail">
                    ${icons.clock}
                    ${startTime} - ${endTime}
                </span>
                ${event.location ? `
                    <span class="event-card-detail">
                        ${icons.mapPin}
                        ${event.location}
                    </span>
                ` : ''}
                ${event.max_participants ? `
                    <span class="event-card-detail">
                        ${icons.users}
                        ${event.current_participants || 0}/${event.max_participants}
                    </span>
                ` : ''}
                ${event.intervenant_first_name ? `
                    <span class="event-card-detail">
                        ${icons.user}
                        ${event.intervenant_first_name} ${event.intervenant_last_name}
                    </span>
                ` : ''}
            </div>
        </div>
    `;

    if (onClick) {
        card.addEventListener('click', () => onClick(event));
    }

    return card;
}

export function createEventList(events, options = {}) {
    initEventCardStyles();

    const container = document.createElement('div');
    container.className = 'event-card-list';

    if (events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="text-muted">Aucun événement</p>
            </div>
        `;
        return container;
    }

    events.forEach(event => {
        container.appendChild(createEventCard(event, options));
    });

    return container;
}
