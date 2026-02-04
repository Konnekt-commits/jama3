const subjectIcons = {
    coran: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    arabe: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>`,
    fiqh: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    sira: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    doua: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`,
    autre: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`
};

const icons = {
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
};

const subjectColors = {
    coran: { bg: '#d1fae5', color: '#059669', gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
    arabe: { bg: '#dbeafe', color: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' },
    fiqh: { bg: '#fef3c7', color: '#d97706', gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' },
    sira: { bg: '#fce7f3', color: '#db2777', gradient: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)' },
    doua: { bg: '#e0e7ff', color: '#4f46e5', gradient: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' },
    autre: { bg: '#f3f4f6', color: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' }
};

export function initClassCardStyles() {
    if (document.getElementById('class-card-styles')) return;

    const style = document.createElement('style');
    style.id = 'class-card-styles';
    style.textContent = `
        .class-card {
            background-color: var(--color-card-bg);
            border: 1px solid var(--color-card-border);
            border-radius: var(--radius-lg);
            padding: var(--spacing-lg);
            cursor: pointer;
            transition: all var(--transition-fast);
            overflow: hidden;
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
        }

        .class-card:hover {
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
        }

        .class-card-header {
            display: flex;
            align-items: flex-start;
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-md);
        }

        .class-card-icon {
            width: 48px;
            height: 48px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
        }

        .class-card-info {
            flex: 1;
            min-width: 0;
        }

        .class-card-info h3 {
            font-weight: var(--font-semibold);
            margin-bottom: var(--spacing-xs);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .class-card-subject {
            font-size: var(--font-sm);
            color: var(--color-text-muted);
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
        }

        .class-card-subject-badge {
            padding: 2px 8px;
            border-radius: var(--radius-sm);
            font-size: var(--font-xs);
            font-weight: var(--font-medium);
        }

        .class-card-meta {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-md);
            padding-top: var(--spacing-md);
            border-top: 1px solid var(--color-border);
        }

        .class-card-meta-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-size: var(--font-sm);
            color: var(--color-text-secondary);
        }

        .class-card-meta-item svg {
            width: 16px;
            height: 16px;
            color: var(--color-text-muted);
            flex-shrink: 0;
        }

        .class-card-capacity {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
        }

        .class-card-capacity-bar {
            width: 60px;
            height: 6px;
            background-color: var(--color-bg-tertiary);
            border-radius: var(--radius-full);
            overflow: hidden;
        }

        .class-card-capacity-fill {
            height: 100%;
            border-radius: var(--radius-full);
            transition: width var(--transition-normal);
        }

        .class-card-level {
            padding: var(--spacing-xs) var(--spacing-sm);
            font-size: var(--font-xs);
            border-radius: var(--radius-full);
            font-weight: var(--font-medium);
        }

        .class-card-level.debutant {
            background-color: #d1fae5;
            color: #059669;
        }

        .class-card-level.intermediaire {
            background-color: #fef3c7;
            color: #d97706;
        }

        .class-card-level.avance {
            background-color: #dbeafe;
            color: #2563eb;
        }

        .class-card-status.inactive,
        .class-card-status.archived {
            opacity: 0.6;
        }
    `;
    document.head.appendChild(style);
}

export function createClassCard(schoolClass, options = {}) {
    const {
        onClick = null,
        showCapacity = true,
        showTeacher = true
    } = options;

    initClassCardStyles();

    const subjectLabels = {
        coran: 'Coran',
        arabe: 'Arabe',
        fiqh: 'Fiqh',
        sira: 'Sira',
        doua: "Doua",
        autre: 'Autre'
    };

    const levelLabels = {
        debutant: 'Débutant',
        intermediaire: 'Intermédiaire',
        avance: 'Avancé'
    };

    const colors = subjectColors[schoolClass.subject] || subjectColors.autre;
    const enrolled = schoolClass.enrolled_count || 0;
    const capacity = schoolClass.max_capacity || 20;
    const capacityPercent = Math.min((enrolled / capacity) * 100, 100);
    const capacityColor = capacityPercent > 90 ? '#ef4444' : capacityPercent > 70 ? '#f59e0b' : '#10b981';

    const card = document.createElement('div');
    card.className = `class-card ${schoolClass.status !== 'active' ? `class-card-status ${schoolClass.status}` : ''}`;
    card.dataset.classId = schoolClass.id;

    let scheduleText = '';
    if (schoolClass.schedule) {
        try {
            const schedule = typeof schoolClass.schedule === 'string' ? JSON.parse(schoolClass.schedule) : schoolClass.schedule;
            if (schedule.jour && schedule.heure_debut) {
                scheduleText = `${schedule.jour} ${schedule.heure_debut}${schedule.heure_fin ? '-' + schedule.heure_fin : ''}`;
            }
        } catch (e) {}
    }

    card.innerHTML = `
        <div class="class-card-header">
            <div class="class-card-icon" style="background: ${colors.gradient}">
                ${subjectIcons[schoolClass.subject] || subjectIcons.autre}
            </div>
            <div class="class-card-info">
                <h3>${schoolClass.name}</h3>
                <div class="class-card-subject">
                    <span class="class-card-subject-badge" style="background-color: ${colors.bg}; color: ${colors.color}">
                        ${subjectLabels[schoolClass.subject] || schoolClass.subject}
                    </span>
                    <span class="class-card-level ${schoolClass.level}">${levelLabels[schoolClass.level] || schoolClass.level}</span>
                </div>
            </div>
        </div>
        <div class="class-card-meta">
            ${showCapacity ? `
                <div class="class-card-meta-item class-card-capacity">
                    ${icons.users}
                    <span>${enrolled}/${capacity}</span>
                    <div class="class-card-capacity-bar">
                        <div class="class-card-capacity-fill" style="width: ${capacityPercent}%; background-color: ${capacityColor}"></div>
                    </div>
                </div>
            ` : ''}
            ${showTeacher && schoolClass.teacher_name ? `
                <span class="class-card-meta-item">
                    ${icons.user}
                    <span>${schoolClass.teacher_name}</span>
                </span>
            ` : ''}
            ${scheduleText ? `
                <span class="class-card-meta-item">
                    ${icons.clock}
                    <span>${scheduleText}</span>
                </span>
            ` : ''}
            ${schoolClass.room ? `
                <span class="class-card-meta-item">
                    ${icons.mapPin}
                    <span>${schoolClass.room}</span>
                </span>
            ` : ''}
        </div>
    `;

    if (onClick) {
        card.addEventListener('click', () => onClick(schoolClass));
    }

    return card;
}

export function createClassList(classes, options = {}) {
    const container = document.createElement('div');
    container.className = 'grid gap-md';

    classes.forEach(schoolClass => {
        container.appendChild(createClassCard(schoolClass, options));
    });

    return container;
}
