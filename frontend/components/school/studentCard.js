const icons = {
    user: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    book: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`
};

export function initStudentCardStyles() {
    if (document.getElementById('student-card-styles')) return;

    const style = document.createElement('style');
    style.id = 'student-card-styles';
    style.textContent = `
        .student-card {
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

        .student-card:hover {
            box-shadow: var(--shadow-md);
            border-color: #059669;
        }

        .student-card-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-md);
        }

        .student-card-avatar {
            width: 56px;
            height: 56px;
            border-radius: var(--radius-full);
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: var(--font-bold);
            font-size: var(--font-lg);
            flex-shrink: 0;
        }

        .student-card-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: var(--radius-full);
        }

        .student-card-info {
            flex: 1;
            min-width: 0;
        }

        .student-card-info h3 {
            font-weight: var(--font-semibold);
            margin-bottom: var(--spacing-xs);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .student-card-number {
            font-size: var(--font-sm);
            color: var(--color-text-muted);
        }

        .student-card-meta {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-sm);
            padding-top: var(--spacing-md);
            border-top: 1px solid var(--color-border);
        }

        .student-card-meta-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-size: var(--font-sm);
            color: var(--color-text-secondary);
            max-width: 100%;
            overflow: hidden;
        }

        .student-card-meta-item svg {
            width: 16px;
            height: 16px;
            color: var(--color-text-muted);
            flex-shrink: 0;
        }

        .student-card-meta-item span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .student-level-badge {
            padding: var(--spacing-xs) var(--spacing-sm);
            font-size: var(--font-xs);
            border-radius: var(--radius-full);
            font-weight: var(--font-medium);
        }

        .student-level-badge.debutant {
            background-color: #d1fae5;
            color: #059669;
        }

        .student-level-badge.intermediaire {
            background-color: #fef3c7;
            color: #d97706;
        }

        .student-level-badge.avance {
            background-color: #dbeafe;
            color: #2563eb;
        }

        .student-status-badge {
            padding: var(--spacing-xs) var(--spacing-sm);
            font-size: var(--font-xs);
            border-radius: var(--radius-full);
            font-weight: var(--font-medium);
        }

        .student-status-badge.actif {
            background-color: var(--color-success-light);
            color: var(--color-success);
        }

        .student-status-badge.inactif {
            background-color: var(--color-error-light);
            color: var(--color-error);
        }

        .student-status-badge.diplome {
            background-color: #dbeafe;
            color: #2563eb;
        }

        .student-status-badge.transfere {
            background-color: var(--color-bg-tertiary);
            color: var(--color-text-muted);
        }

        .student-card-compact {
            padding: var(--spacing-md);
        }

        .student-card-compact .student-card-avatar {
            width: 44px;
            height: 44px;
            font-size: var(--font-base);
        }

        .student-card-compact .student-card-header {
            margin-bottom: var(--spacing-sm);
        }

        .student-card-compact .student-card-meta {
            padding-top: var(--spacing-sm);
        }
    `;
    document.head.appendChild(style);
}

export function createStudentCard(student, options = {}) {
    const {
        compact = false,
        onClick = null,
        showLevel = true,
        showStatus = true
    } = options;

    initStudentCardStyles();

    const initials = (student.first_name[0] + student.last_name[0]).toUpperCase();

    const levelLabels = {
        debutant: 'Débutant',
        intermediaire: 'Intermédiaire',
        avance: 'Avancé'
    };

    const statusLabels = {
        actif: 'Actif',
        inactif: 'Inactif',
        diplome: 'Diplômé',
        transfere: 'Transféré'
    };

    const card = document.createElement('div');
    card.className = `student-card ${compact ? 'student-card-compact' : ''}`;
    card.dataset.studentId = student.id;

    const age = student.birth_date ? calculateAge(student.birth_date) : null;

    card.innerHTML = `
        <div class="student-card-header">
            <div class="student-card-avatar">
                ${student.photo_url ? `<img src="${student.photo_url}" alt="${student.first_name}">` : initials}
            </div>
            <div class="student-card-info">
                <h3>${student.first_name} ${student.last_name}</h3>
                <p class="student-card-number">${student.student_number || 'N° en attente'}</p>
            </div>
            <div style="display: flex; gap: var(--spacing-xs); flex-wrap: wrap;">
                ${showLevel ? `<span class="student-level-badge ${student.level}">${levelLabels[student.level] || student.level}</span>` : ''}
                ${showStatus && student.status !== 'actif' ? `<span class="student-status-badge ${student.status}">${statusLabels[student.status] || student.status}</span>` : ''}
            </div>
        </div>
        <div class="student-card-meta">
            ${age ? `
                <span class="student-card-meta-item">
                    ${icons.calendar}
                    <span>${age} ans</span>
                </span>
            ` : ''}
            ${student.parent_name ? `
                <span class="student-card-meta-item">
                    ${icons.user}
                    <span>${student.parent_name}</span>
                </span>
            ` : ''}
        </div>
    `;

    if (onClick) {
        card.addEventListener('click', () => onClick(student));
    }

    return card;
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

export function createStudentList(students, options = {}) {
    const container = document.createElement('div');
    container.className = 'grid gap-md';

    students.forEach(student => {
        container.appendChild(createStudentCard(student, options));
    });

    return container;
}
