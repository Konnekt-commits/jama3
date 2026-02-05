import apiService from '../../services/api.service.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { showToast } from '../../components/toast/toast.js';

let teachers = [];
let availableIntervenants = [];
let stats = {};
let searchTerm = '';

const SUBJECT_ICONS = {
    coran: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    arabe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>',
    fiqh: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
    sira: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z"/><path d="M3 12h1m8-9v1m8 8h1m-9 8v1"/></svg>',
    doua: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    autre: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>'
};

export async function renderTeachersTab(container) {
    container.innerHTML = `
        <style>
            .teachers-container {
                padding: var(--spacing-lg);
                max-width: 1400px;
                margin: 0 auto;
            }

            .teachers-header {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
            }

            @media (min-width: 768px) {
                .teachers-header {
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                }
            }

            .teachers-header h1 {
                font-size: var(--font-2xl);
                font-weight: var(--font-bold);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }

            .teachers-actions {
                display: flex;
                gap: var(--spacing-sm);
                flex-wrap: wrap;
            }

            .teachers-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
            }

            .teacher-stat-card {
                background: var(--color-card-bg);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: var(--spacing-lg);
                text-align: center;
            }

            .teacher-stat-value {
                font-size: var(--font-2xl);
                font-weight: var(--font-bold);
                color: var(--color-primary);
            }

            .teacher-stat-label {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
                margin-top: var(--spacing-xs);
            }

            .teachers-search {
                margin-bottom: var(--spacing-lg);
            }

            .teachers-search input {
                width: 100%;
                max-width: 400px;
                padding: var(--spacing-sm) var(--spacing-md);
                padding-left: 40px;
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                background: var(--color-input-bg);
                font-size: var(--font-sm);
            }

            .search-wrapper {
                position: relative;
                display: inline-block;
                width: 100%;
                max-width: 400px;
            }

            .search-wrapper svg {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--color-text-muted);
            }

            .teachers-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: var(--spacing-md);
            }

            .teacher-card {
                background: var(--color-card-bg);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: var(--spacing-lg);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .teacher-card:hover {
                border-color: var(--color-primary);
                box-shadow: var(--shadow-md);
            }

            .teacher-card-header {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-md);
            }

            .teacher-avatar {
                width: 56px;
                height: 56px;
                border-radius: var(--radius-full);
                background: linear-gradient(135deg, var(--school-primary) 0%, var(--school-primary-dark) 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: var(--font-lg);
                font-weight: var(--font-semibold);
                flex-shrink: 0;
                overflow: hidden;
            }

            .teacher-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .teacher-info h3 {
                font-size: var(--font-lg);
                font-weight: var(--font-semibold);
                margin-bottom: var(--spacing-xs);
            }

            .teacher-specialty {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }

            .teacher-classes {
                display: flex;
                flex-wrap: wrap;
                gap: var(--spacing-xs);
                margin-top: var(--spacing-md);
            }

            .teacher-class-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 10px;
                background: var(--color-bg-secondary);
                border-radius: var(--radius-full);
                font-size: var(--font-xs);
                color: var(--color-text-secondary);
            }

            .teacher-class-badge svg {
                opacity: 0.7;
            }

            .teacher-stats-row {
                display: flex;
                gap: var(--spacing-lg);
                margin-top: var(--spacing-md);
                padding-top: var(--spacing-md);
                border-top: 1px solid var(--color-border);
            }

            .teacher-mini-stat {
                text-align: center;
            }

            .teacher-mini-stat-value {
                font-size: var(--font-lg);
                font-weight: var(--font-bold);
                color: var(--color-text-primary);
            }

            .teacher-mini-stat-label {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
            }

            .empty-teachers {
                text-align: center;
                padding: var(--spacing-3xl);
                color: var(--color-text-muted);
            }

            .empty-teachers svg {
                width: 64px;
                height: 64px;
                margin-bottom: var(--spacing-md);
                opacity: 0.5;
            }

            .empty-teachers h3 {
                font-size: var(--font-lg);
                margin-bottom: var(--spacing-sm);
                color: var(--color-text-secondary);
            }

            /* Bottom sheet styles */
            .teacher-detail-header {
                display: flex;
                align-items: center;
                gap: var(--spacing-lg);
                margin-bottom: var(--spacing-xl);
                padding-bottom: var(--spacing-lg);
                border-bottom: 1px solid var(--color-border);
            }

            .teacher-detail-avatar {
                width: 80px;
                height: 80px;
                border-radius: var(--radius-full);
                background: linear-gradient(135deg, var(--school-primary) 0%, var(--school-primary-dark) 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: var(--font-2xl);
                font-weight: var(--font-bold);
                flex-shrink: 0;
                overflow: hidden;
            }

            .teacher-detail-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .teacher-detail-info h2 {
                font-size: var(--font-xl);
                font-weight: var(--font-bold);
                margin-bottom: var(--spacing-xs);
            }

            .teacher-detail-meta {
                display: flex;
                flex-wrap: wrap;
                gap: var(--spacing-md);
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }

            .teacher-detail-meta span {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
            }

            .teacher-section {
                margin-bottom: var(--spacing-xl);
            }

            .teacher-section-title {
                font-size: var(--font-base);
                font-weight: var(--font-semibold);
                margin-bottom: var(--spacing-md);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }

            .teacher-classes-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }

            .teacher-class-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: var(--spacing-md);
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
            }

            .teacher-class-item-info {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }

            .teacher-class-item-name {
                font-weight: var(--font-medium);
            }

            .teacher-class-item-students {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }

            .teacher-students-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: var(--spacing-sm);
            }

            .teacher-student-chip {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-sm) var(--spacing-md);
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
                font-size: var(--font-sm);
            }

            .teacher-student-chip-avatar {
                width: 24px;
                height: 24px;
                border-radius: var(--radius-full);
                background: var(--color-primary-light);
                color: var(--color-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: var(--font-medium);
            }

            /* Add teacher modal */
            .add-teacher-list {
                max-height: 400px;
                overflow-y: auto;
            }

            .add-teacher-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: var(--spacing-md);
                border-bottom: 1px solid var(--color-border);
                cursor: pointer;
                transition: background var(--transition-fast);
            }

            .add-teacher-item:hover {
                background: var(--color-bg-hover);
            }

            .add-teacher-item:last-child {
                border-bottom: none;
            }

            .add-teacher-item-info {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
            }

            .add-teacher-item-avatar {
                width: 40px;
                height: 40px;
                border-radius: var(--radius-full);
                background: var(--color-bg-tertiary);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: var(--font-medium);
            }

            .add-teacher-item-name {
                font-weight: var(--font-medium);
            }

            .add-teacher-item-specialty {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }
        </style>

        <div class="teachers-container">
            <div class="teachers-header">
                <h1>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Enseignants
                </h1>
                <div class="teachers-actions">
                    <button class="btn btn-primary" id="add-teacher-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Ajouter un enseignant
                    </button>
                </div>
            </div>

            <div class="teachers-stats" id="teachers-stats">
                <div class="teacher-stat-card">
                    <div class="teacher-stat-value">-</div>
                    <div class="teacher-stat-label">Enseignants</div>
                </div>
                <div class="teacher-stat-card">
                    <div class="teacher-stat-value">-</div>
                    <div class="teacher-stat-label">Actifs</div>
                </div>
                <div class="teacher-stat-card">
                    <div class="teacher-stat-value">-</div>
                    <div class="teacher-stat-label">Classes</div>
                </div>
                <div class="teacher-stat-card">
                    <div class="teacher-stat-value">-</div>
                    <div class="teacher-stat-label">Eleves</div>
                </div>
            </div>

            <div class="teachers-search">
                <div class="search-wrapper">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="teacher-search" placeholder="Rechercher un enseignant...">
                </div>
            </div>

            <div class="teachers-grid" id="teachers-grid">
                <div class="empty-teachers">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                    <h3>Chargement...</h3>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    document.getElementById('add-teacher-btn')?.addEventListener('click', showAddTeacherModal);
    document.getElementById('teacher-search')?.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderTeachersList();
    });

    // Load data
    await loadData();
}

async function loadData() {
    try {
        const [teachersRes, statsRes, availableRes] = await Promise.all([
            apiService.getSchoolTeachers(),
            apiService.getSchoolTeachersStats(),
            apiService.getAvailableIntervenants()
        ]);

        teachers = teachersRes.success ? (teachersRes.data || []) : [];
        stats = statsRes.success ? (statsRes.data || {}) : {};
        availableIntervenants = availableRes.success ? (availableRes.data || []) : [];

        renderStats();
        renderTeachersList();
    } catch (error) {
        console.error('Error loading teachers:', error);
        showToast('Erreur lors du chargement', 'error');
    }
}

function renderStats() {
    const statsContainer = document.getElementById('teachers-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <div class="teacher-stat-card">
            <div class="teacher-stat-value">${stats.total_teachers || 0}</div>
            <div class="teacher-stat-label">Enseignants</div>
        </div>
        <div class="teacher-stat-card">
            <div class="teacher-stat-value">${stats.active_teachers || 0}</div>
            <div class="teacher-stat-label">Actifs</div>
        </div>
        <div class="teacher-stat-card">
            <div class="teacher-stat-value">${stats.total_classes || 0}</div>
            <div class="teacher-stat-label">Classes</div>
        </div>
        <div class="teacher-stat-card">
            <div class="teacher-stat-value">${stats.total_students_taught || 0}</div>
            <div class="teacher-stat-label">Eleves</div>
        </div>
    `;
}

function renderTeachersList() {
    const grid = document.getElementById('teachers-grid');
    if (!grid) return;

    const filtered = teachers.filter(t => {
        if (!searchTerm) return true;
        const fullName = `${t.first_name} ${t.last_name}`.toLowerCase();
        const specialty = (t.speciality || t.specialty || '').toLowerCase();
        return fullName.includes(searchTerm) || specialty.includes(searchTerm);
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-teachers" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <h3>${searchTerm ? 'Aucun resultat' : 'Aucun enseignant'}</h3>
                <p>${searchTerm ? 'Essayez une autre recherche' : 'Ajoutez votre premier enseignant'}</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(teacher => {
        const initials = `${(teacher.first_name || '')[0] || ''}${(teacher.last_name || '')[0] || ''}`.toUpperCase();
        const classes = (teacher.class_names || '').split(', ').filter(Boolean).slice(0, 3);
        const specialty = teacher.speciality || teacher.specialty || '';

        return `
            <div class="teacher-card" data-id="${teacher.id}">
                <div class="teacher-card-header">
                    <div class="teacher-avatar">
                        ${teacher.photo_url ? `<img src="${teacher.photo_url}" alt="${teacher.first_name}">` : initials}
                    </div>
                    <div class="teacher-info">
                        <h3>${teacher.first_name} ${teacher.last_name}</h3>
                        ${specialty ? `<div class="teacher-specialty">${specialty}</div>` : ''}
                    </div>
                </div>
                ${classes.length > 0 ? `
                    <div class="teacher-classes">
                        ${classes.map(c => `<span class="teacher-class-badge">${c}</span>`).join('')}
                        ${teacher.class_count > 3 ? `<span class="teacher-class-badge">+${teacher.class_count - 3}</span>` : ''}
                    </div>
                ` : '<div class="teacher-classes"><span class="teacher-class-badge" style="opacity: 0.6;">Aucune classe</span></div>'}
                <div class="teacher-stats-row">
                    <div class="teacher-mini-stat">
                        <div class="teacher-mini-stat-value">${teacher.class_count || 0}</div>
                        <div class="teacher-mini-stat-label">Classes</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add click handlers
    grid.querySelectorAll('.teacher-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            showTeacherDetail(id);
        });
    });
}

async function showTeacherDetail(teacherId) {
    try {
        const res = await apiService.getSchoolTeacher(teacherId);
        if (!res.success) throw new Error('Enseignant non trouve');

        const teacher = res.data;
        const initials = `${(teacher.first_name || '')[0] || ''}${(teacher.last_name || '')[0] || ''}`.toUpperCase();
        const specialty = teacher.speciality || teacher.specialty || '';

        openBottomSheet({
            title: `${teacher.first_name} ${teacher.last_name}`,
            content: `
                <div class="teacher-detail-header">
                    <div class="teacher-detail-avatar">
                        ${teacher.photo_url ? `<img src="${teacher.photo_url}" alt="${teacher.first_name}">` : initials}
                    </div>
                    <div class="teacher-detail-info">
                        <h2>${teacher.first_name} ${teacher.last_name}</h2>
                        <div class="teacher-detail-meta">
                            ${specialty ? `<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>${specialty}</span>` : ''}
                            ${teacher.email ? `<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${teacher.email}</span>` : ''}
                            ${teacher.phone ? `<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${teacher.phone}</span>` : ''}
                        </div>
                    </div>
                </div>

                <div class="teacher-section">
                    <div class="teacher-section-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Classes enseignées (${(teacher.classes || []).length})
                    </div>
                    ${teacher.classes && teacher.classes.length > 0 ? `
                        <div class="teacher-classes-list">
                            ${teacher.classes.map(c => `
                                <div class="teacher-class-item">
                                    <div class="teacher-class-item-info">
                                        ${SUBJECT_ICONS[c.subject] || SUBJECT_ICONS.autre}
                                        <span class="teacher-class-item-name">${c.name}</span>
                                    </div>
                                    <span class="teacher-class-item-students">${c.enrolled_count || 0} élèves</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--color-text-muted); text-align: center; padding: var(--spacing-md);">Aucune classe assignée</p>'}
                </div>

                <div class="teacher-section">
                    <div class="teacher-section-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Élèves (${teacher.student_count || 0})
                    </div>
                    ${teacher.students && teacher.students.length > 0 ? `
                        <div class="teacher-students-grid">
                            ${teacher.students.slice(0, 12).map(s => {
                                const sInitials = `${(s.first_name || '')[0] || ''}${(s.last_name || '')[0] || ''}`.toUpperCase();
                                return `
                                    <div class="teacher-student-chip">
                                        <div class="teacher-student-chip-avatar">${sInitials}</div>
                                        <span>${s.first_name} ${s.last_name}</span>
                                    </div>
                                `;
                            }).join('')}
                            ${teacher.students.length > 12 ? `<div class="teacher-student-chip" style="opacity: 0.7;">+${teacher.students.length - 12} autres</div>` : ''}
                        </div>
                    ` : '<p style="color: var(--color-text-muted); text-align: center; padding: var(--spacing-md);">Aucun élève</p>'}
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="window.location.href='/intervenants'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Modifier le profil
                </button>
                <button class="btn btn-danger" id="remove-teacher-btn" data-id="${teacher.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="18" y1="8" x2="23" y2="13"></line>
                        <line x1="23" y1="8" x2="18" y2="13"></line>
                    </svg>
                    Retirer enseignant
                </button>
            `
        });

        // Event listener for remove button
        document.getElementById('remove-teacher-btn')?.addEventListener('click', async () => {
            if (confirm('Retirer cet intervenant de la liste des enseignants ?')) {
                try {
                    const res = await apiService.removeTeacherStatus(teacherId);
                    if (res.success) {
                        showToast('Enseignant retire', 'success');
                        closeBottomSheet();
                        await loadData();
                    } else {
                        showToast(res.message || 'Erreur', 'error');
                    }
                } catch (error) {
                    showToast('Erreur lors de la suppression', 'error');
                }
            }
        });
    } catch (error) {
        console.error('Error loading teacher detail:', error);
        showToast('Erreur lors du chargement', 'error');
    }
}

async function showAddTeacherModal() {
    // Refresh available intervenants
    try {
        const res = await apiService.getAvailableIntervenants();
        availableIntervenants = res.success ? (res.data || []) : [];
    } catch (error) {
        console.error('Error loading available intervenants:', error);
    }

    openBottomSheet({
        title: 'Ajouter un enseignant',
        content: `
            <style>
                .add-teacher-tabs {
                    display: flex;
                    border-bottom: 1px solid var(--color-border);
                    margin-bottom: var(--spacing-lg);
                }
                .add-teacher-tab {
                    flex: 1;
                    padding: var(--spacing-sm) var(--spacing-md);
                    border: none;
                    background: none;
                    cursor: pointer;
                    font-size: var(--font-sm);
                    font-weight: var(--font-medium);
                    color: var(--color-text-muted);
                    border-bottom: 2px solid transparent;
                    transition: all var(--transition-fast);
                }
                .add-teacher-tab:hover {
                    color: var(--color-text-primary);
                }
                .add-teacher-tab.active {
                    color: var(--school-primary);
                    border-bottom-color: var(--school-primary);
                }
                .add-teacher-panel {
                    display: none;
                }
                .add-teacher-panel.active {
                    display: block;
                }
                .teacher-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-md);
                }
                .teacher-form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-md);
                }
                @media (max-width: 480px) {
                    .teacher-form-row {
                        grid-template-columns: 1fr;
                    }
                }
                .speciality-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-xs);
                    margin-top: var(--spacing-xs);
                }
                .speciality-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-full);
                    font-size: var(--font-sm);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    color: var(--color-text-secondary);
                }
                .speciality-chip:hover {
                    border-color: var(--school-primary);
                }
                .speciality-chip.selected {
                    background: var(--school-primary-light);
                    border-color: var(--school-primary);
                    color: var(--school-primary);
                }
                .speciality-chip svg {
                    flex-shrink: 0;
                }
            </style>

            <div class="add-teacher-tabs">
                <button class="add-teacher-tab active" data-tab="new">Nouveau</button>
                <button class="add-teacher-tab" data-tab="existing">Existant (${availableIntervenants.length})</button>
            </div>

            <!-- Panel: Nouveau enseignant -->
            <div class="add-teacher-panel active" id="panel-new">
                <form class="teacher-form" id="new-teacher-form">
                    <div class="teacher-form-row">
                        <div class="form-group">
                            <label class="form-label">Prénom *</label>
                            <input type="text" name="first_name" class="form-input" required placeholder="Prénom">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Nom *</label>
                            <input type="text" name="last_name" class="form-input" required placeholder="Nom">
                        </div>
                    </div>

                    <div class="teacher-form-row">
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-input" placeholder="email@exemple.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Téléphone</label>
                            <input type="tel" name="phone" class="form-input" placeholder="06 12 34 56 78">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Spécialités / Matières</label>
                        <div class="speciality-chips" id="speciality-chips">
                            <div class="speciality-chip" data-value="Coran">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                                Coran
                            </div>
                            <div class="speciality-chip" data-value="Arabe">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
                                Langue Arabe
                            </div>
                            <div class="speciality-chip" data-value="Fiqh">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"/><path d="m5 8 7-5 7 5"/><path d="M5 12h14"/><path d="m5 16 7 5 7-5"/></svg>
                                Fiqh
                            </div>
                            <div class="speciality-chip" data-value="Sira">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                                Sira
                            </div>
                            <div class="speciality-chip" data-value="Doua">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 11v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3m10-3v11a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-3"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                Invocations
                            </div>
                            <div class="speciality-chip" data-value="Education islamique">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
                                Éducation islamique
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea name="notes" class="form-textarea" rows="2" placeholder="Informations complémentaires..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary" style="margin-top: var(--spacing-sm);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Créer l'enseignant
                    </button>
                </form>
            </div>

            <!-- Panel: Intervenants existants -->
            <div class="add-teacher-panel" id="panel-existing">
                ${availableIntervenants.length > 0 ? `
                    <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-md); font-size: var(--font-sm);">
                        Sélectionnez un intervenant existant pour le marquer comme enseignant.
                    </p>
                    <div class="add-teacher-list">
                        ${availableIntervenants.map(i => {
                            const initials = `${(i.first_name || '')[0] || ''}${(i.last_name || '')[0] || ''}`.toUpperCase();
                            return `
                                <div class="add-teacher-item" data-id="${i.id}">
                                    <div class="add-teacher-item-info">
                                        <div class="add-teacher-item-avatar">${initials}</div>
                                        <div>
                                            <div class="add-teacher-item-name">${i.first_name} ${i.last_name}</div>
                                            ${i.speciality || i.specialty ? `<div class="add-teacher-item-specialty">${i.speciality || i.specialty}</div>` : ''}
                                        </div>
                                    </div>
                                    <button class="btn btn-sm btn-primary add-as-teacher-btn" data-id="${i.id}">Ajouter</button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: var(--spacing-xl); color: var(--color-text-muted);">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: var(--spacing-md); opacity: 0.5;">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                        </svg>
                        <p>Aucun intervenant disponible.</p>
                        <p style="font-size: var(--font-sm); margin-top: var(--spacing-sm);">Utilisez l'onglet "Nouveau" pour créer un enseignant.</p>
                    </div>
                `}
            </div>
        `,
        footer: `<button class="btn btn-secondary" id="close-add-teacher-btn">Fermer</button>`
    });

    // Tab switching
    document.querySelectorAll('.add-teacher-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.add-teacher-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.add-teacher-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`panel-${tab.dataset.tab}`)?.classList.add('active');
        });
    });

    // Speciality chips click handler
    document.querySelectorAll('.speciality-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('selected');
        });
    });

    // New teacher form submission
    document.getElementById('new-teacher-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Get selected specialities
        const selectedSpecialities = Array.from(document.querySelectorAll('.speciality-chip.selected'))
            .map(chip => chip.dataset.value);

        const data = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email') || null,
            phone: formData.get('phone') || null,
            speciality: selectedSpecialities.length > 0 ? selectedSpecialities.join(', ') : null,
            notes: formData.get('notes') || null,
            is_teacher: true
        };

        try {
            const res = await apiService.createTeacher(data);
            if (res.success) {
                showToast('Enseignant créé', 'success');
                closeBottomSheet();
                await loadData();
            } else {
                showToast(res.message || 'Erreur', 'error');
            }
        } catch (error) {
            console.error('Error creating teacher:', error);
            showToast('Erreur lors de la création', 'error');
        }
    });

    // Close button handler
    document.getElementById('close-add-teacher-btn')?.addEventListener('click', closeBottomSheet);

    // Add click handlers for existing intervenants
    document.querySelectorAll('.add-as-teacher-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            try {
                const res = await apiService.markAsTeacher(id);
                if (res.success) {
                    showToast('Enseignant ajouté', 'success');
                    closeBottomSheet();
                    await loadData();
                } else {
                    showToast(res.message || 'Erreur', 'error');
                }
            } catch (error) {
                showToast('Erreur lors de l\'ajout', 'error');
            }
        });
    });
}
