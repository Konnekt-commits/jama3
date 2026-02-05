import apiService from '../../services/api.service.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';

let classes = [];
let intervenants = [];
let students = [];
let topics = [];

const DAY_NAMES_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const SUBJECT_COLORS = {
    coran: '#6B8E23',
    arabe: '#8B6914',
    fiqh: '#20B2AA',
    sira: '#8B4557',
    doua: '#CD5C5C',
    autre: '#5A4735'
};

const SUBJECT_ICONS = {
    coran: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    arabe: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path d="M12 4v16"></path></svg>',
    fiqh: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>',
    sira: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    doua: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>',
    autre: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>'
};

export async function renderClassesTab(container) {
    container.innerHTML = `
        <style>
            .classes-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--spacing-lg);
                flex-wrap: wrap;
                gap: var(--spacing-md);
            }

            .classes-title {
                font-size: var(--font-xl);
                font-weight: 600;
            }

            .add-class-btn {
                padding: 10px 20px;
                background: linear-gradient(135deg, var(--school-primary) 0%, var(--school-primary-dark) 100%);
                color: white;
                border: none;
                border-radius: var(--radius-md);
                font-weight: 500;
                cursor: pointer;
                transition: all 0.15s;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .add-class-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px var(--school-shadow);
            }

            .classes-grid {
                display: grid;
                gap: var(--spacing-md);
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            }

            .class-card {
                background: var(--color-card-bg);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: var(--spacing-lg);
                cursor: pointer;
                transition: all 0.2s;
            }

            .class-card:hover {
                border-color: var(--school-primary);
                transform: translateY(-2px);
                box-shadow: 0 8px 24px var(--school-shadow-light);
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
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .class-card-icon svg {
                width: 24px;
                height: 24px;
            }

            .class-card-title {
                font-size: var(--font-lg);
                font-weight: 600;
                margin-bottom: 4px;
            }

            .class-card-subject {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
                text-transform: capitalize;
            }

            .class-card-details {
                display: flex;
                flex-direction: column;
                gap: 8px;
                font-size: var(--font-sm);
                color: var(--color-text-secondary);
            }

            .class-card-detail {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .class-card-detail svg {
                width: 16px;
                height: 16px;
                color: var(--color-text-muted);
                flex-shrink: 0;
            }

            .class-card-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: var(--spacing-md);
                padding-top: var(--spacing-md);
                border-top: 1px solid var(--color-border);
            }

            .class-card-badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                border-radius: 100px;
                font-size: 12px;
                font-weight: 500;
                background: var(--school-primary-light);
                color: var(--school-primary);
            }

            .class-card-level {
                font-size: 12px;
                padding: 4px 8px;
                border-radius: 4px;
                background: var(--color-bg-secondary);
                color: var(--color-text-muted);
                text-transform: capitalize;
            }

            .class-card-topics {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                margin-top: var(--spacing-sm);
                padding-top: var(--spacing-sm);
                border-top: 1px solid var(--color-border);
            }

            .class-topic-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 3px 8px;
                border-radius: 100px;
                font-size: 10px;
                font-weight: 500;
                white-space: nowrap;
                background: var(--school-primary-light);
                color: var(--school-primary);
                border: 1px solid var(--school-primary);
            }

            .class-topic-badge-ar {
                font-family: var(--font-arabic);
                font-size: 9px;
            }

            .class-topic-badge-more {
                background: var(--color-bg-tertiary);
                color: var(--color-text-muted);
                border: 1px solid var(--color-border);
            }

            .classes-empty {
                text-align: center;
                padding: var(--spacing-2xl);
                color: var(--color-text-muted);
            }

            .classes-empty svg {
                width: 64px;
                height: 64px;
                margin-bottom: var(--spacing-md);
                opacity: 0.5;
            }

            /* Detail styles */
            .class-detail-header {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                padding-bottom: var(--spacing-lg);
                border-bottom: 1px solid var(--color-border);
                margin-bottom: var(--spacing-lg);
            }

            .class-detail-icon {
                width: 64px;
                height: 64px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .class-detail-icon svg {
                width: 32px;
                height: 32px;
            }

            .class-detail-title {
                font-size: var(--font-xl);
                font-weight: 700;
                margin-bottom: 4px;
            }

            .class-detail-subtitle {
                color: var(--color-text-muted);
                font-size: var(--font-sm);
            }

            .class-detail-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
            }

            .class-stat-card {
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
                padding: var(--spacing-md);
                text-align: center;
            }

            .class-stat-value {
                font-size: var(--font-xl);
                font-weight: 700;
                color: var(--school-primary);
            }

            .class-stat-label {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
            }

            .class-schedule-info {
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
                padding: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
            }

            .class-schedule-row {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                margin-bottom: var(--spacing-xs);
            }

            .class-schedule-row:last-child {
                margin-bottom: 0;
            }

            .class-schedule-row svg {
                width: 16px;
                height: 16px;
                color: var(--color-text-muted);
            }

            .students-section {
                margin-top: var(--spacing-lg);
            }

            .students-section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--spacing-md);
            }

            .students-section-title {
                font-weight: 600;
                font-size: var(--font-base);
            }

            .students-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }

            .student-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                padding: var(--spacing-sm) var(--spacing-md);
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
            }

            .student-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--school-primary) 0%, var(--school-primary-dark) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                font-size: 14px;
            }

            .student-info {
                flex: 1;
            }

            .student-name {
                font-weight: 500;
                font-size: var(--font-sm);
            }

            .student-number {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
            }

            .empty-students {
                text-align: center;
                padding: var(--spacing-lg);
                color: var(--color-text-muted);
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
            }

            @media (max-width: 768px) {
                .class-detail-stats {
                    grid-template-columns: 1fr;
                }
            }
        </style>

        <div class="classes-header">
            <h1 class="classes-title">Gestion des classes</h1>
            <button class="add-class-btn" id="add-class-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Nouvelle classe
            </button>
        </div>

        <div id="classes-content">
            <div style="text-align: center; padding: 40px; color: var(--color-text-muted);">Chargement...</div>
        </div>
    `;

    await Promise.all([
        loadIntervenants(),
        loadStudentsForEnrollment(),
        loadClasses(),
        loadTopics()
    ]);

    document.getElementById('add-class-btn').addEventListener('click', () => {
        openClassForm();
    });

    renderClassesGrid();
}

async function loadIntervenants() {
    try {
        // Load only teachers (intervenants marked as is_teacher=true)
        const response = await apiService.getSchoolTeachers();
        if (response.success) {
            intervenants = Array.isArray(response.data) ? response.data : [];
        }
    } catch (error) {
        intervenants = [];
    }
}

async function loadStudentsForEnrollment() {
    try {
        const response = await apiService.getStudents({ status: 'actif', limit: 200 });
        if (response.success) {
            const data = response.data;
            students = Array.isArray(data) ? data : (Array.isArray(data?.students) ? data.students : []);
        }
    } catch (error) {
        students = [];
    }
}

async function loadClasses() {
    try {
        const response = await apiService.getSchoolClasses({ status: 'active' });
        if (response.success) {
            classes = Array.isArray(response.data) ? response.data : [];
        }
    } catch (error) {
        classes = [];
    }
}

// Helper to get all unique topics from a class's schedules
function getClassTopicsFromSchedules(cls) {
    const schedule = parseSchedule(cls.schedule);
    const allTopicIds = new Set();
    schedule.forEach(s => {
        if (s.topic_ids && Array.isArray(s.topic_ids)) {
            s.topic_ids.forEach(id => allTopicIds.add(id));
        }
    });
    return topics.filter(t => allTopicIds.has(t.id));
}

async function loadTopics() {
    try {
        const response = await apiService.getSchoolTopics();
        if (response.success) {
            topics = Array.isArray(response.data) ? response.data : [];
        }
    } catch (error) {
        topics = [];
    }
}

function parseSchedule(schedule) {
    if (!schedule) return [];
    let parsed = schedule;
    if (typeof schedule === 'string') {
        try {
            parsed = JSON.parse(schedule);
        } catch {
            return [];
        }
    }
    // Support ancien format (objet unique) et nouveau (tableau)
    if (Array.isArray(parsed)) {
        return parsed;
    }
    // Ancien format: convertir en tableau
    if (parsed && parsed.jour) {
        return [parsed];
    }
    return [];
}

function renderClassesGrid() {
    const content = document.getElementById('classes-content');

    if (classes.length === 0) {
        content.innerHTML = `
            <div class="classes-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <h3>Aucune classe</h3>
                <p>Commencez par cr\u00e9er votre premi\u00e8re classe</p>
            </div>
        `;
        return;
    }

    let html = '<div class="classes-grid">';

    classes.forEach(cls => {
        const color = SUBJECT_COLORS[cls.subject] || SUBJECT_COLORS.autre;
        const icon = SUBJECT_ICONS[cls.subject] || SUBJECT_ICONS.autre;
        const schedule = parseSchedule(cls.schedule);
        const classTopics = getClassTopicsFromSchedules(cls);

        html += `
            <div class="class-card" data-class-id="${cls.id}">
                <div class="class-card-header">
                    <div class="class-card-icon" style="background: ${color}20; color: ${color};">
                        ${icon}
                    </div>
                    <div>
                        <div class="class-card-title">${cls.name}</div>
                        <div class="class-card-subject">${cls.subject}</div>
                    </div>
                </div>
                <div class="class-card-details">
                    ${schedule.length > 0 ? schedule.map(s => {
                        const teacherName = s.teacher_id ? intervenants.find(i => i.id === s.teacher_id) : null;
                        const slotTopicCount = s.topic_ids?.length || 0;
                        return `
                            <div class="class-card-detail">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                <span>${s.jour || ''} ${s.heure_debut || ''}-${s.heure_fin || ''}${s.room ? ` • ${s.room}` : ''}${teacherName ? ` • ${teacherName.first_name}` : ''}${slotTopicCount > 0 ? ` <span style="opacity:0.6;">(${slotTopicCount} thèmes)</span>` : ''}</span>
                            </div>
                        `;
                    }).join('') : '<div class="class-card-detail" style="color: var(--color-text-muted);">Pas d\'horaire défini</div>'}
                </div>
                <div class="class-card-footer">
                    <span class="class-card-badge">${cls.enrolled_count || 0} élèves</span>
                    <span class="class-card-level">${cls.level || 'débutant'}</span>
                </div>
                ${classTopics.length > 0 ? `
                    <div class="class-card-topics">
                        ${classTopics.slice(0, 3).map(t => `
                            <span class="class-topic-badge">
                                ${t.name_fr}${t.name_ar ? `<span class="class-topic-badge-ar">${t.name_ar}</span>` : ''}
                            </span>
                        `).join('')}
                        ${classTopics.length > 3 ? `<span class="class-topic-badge class-topic-badge-more">+${classTopics.length - 3}</span>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    });

    html += '</div>';
    content.innerHTML = html;

    content.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', () => {
            const classId = card.dataset.classId;
            openClassDetail(classId);
        });
    });
}

async function openClassDetail(classId) {
    try {
        const response = await apiService.getSchoolClass(classId);
        if (!response.success) {
            toastError('Erreur chargement classe');
            return;
        }

        const cls = response.data;
        const color = SUBJECT_COLORS[cls.subject] || SUBJECT_COLORS.autre;
        const icon = SUBJECT_ICONS[cls.subject] || SUBJECT_ICONS.autre;
        const schedule = parseSchedule(cls.schedule);
        const classStudents = cls.students || [];

        openBottomSheet({
            title: '',
            size: 'large',
            content: `
                <div class="class-detail-header">
                    <div class="class-detail-icon" style="background: ${color}20; color: ${color};">
                        ${icon}
                    </div>
                    <div>
                        <div class="class-detail-title">${cls.name}</div>
                        <div class="class-detail-subtitle">${cls.subject} - Niveau ${cls.level || 'd\u00e9butant'}</div>
                    </div>
                </div>

                <div class="class-detail-stats">
                    <div class="class-stat-card">
                        <div class="class-stat-value">${classStudents.length}</div>
                        <div class="class-stat-label">\u00c9l\u00e8ves inscrits</div>
                    </div>
                    <div class="class-stat-card">
                        <div class="class-stat-value">${cls.max_capacity || 20}</div>
                        <div class="class-stat-label">Capacit\u00e9 max</div>
                    </div>
                    <div class="class-stat-card">
                        <div class="class-stat-value">${cls.max_capacity ? Math.round((classStudents.length / cls.max_capacity) * 100) : 0}%</div>
                        <div class="class-stat-label">Remplissage</div>
                    </div>
                </div>

                <div class="class-schedule-info">
                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 12px; color: var(--color-text-secondary);">Créneaux & Thèmes</div>
                    ${schedule.length > 0 ? schedule.map((s, idx) => {
                        const teacher = s.teacher_id ? intervenants.find(i => i.id === s.teacher_id) : null;
                        const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : null;
                        const slotTopics = (s.topic_ids || []).map(id => topics.find(t => t.id === id)).filter(Boolean);
                        return `
                            <div style="background: var(--color-bg-primary); border-radius: 8px; padding: 12px; ${idx > 0 ? 'margin-top: 8px;' : ''}">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    <strong>${s.jour || '?'}</strong>
                                    <span style="color: var(--color-text-muted);">${s.heure_debut || '?'} - ${s.heure_fin || '?'}</span>
                                </div>
                                <div style="display: flex; gap: 16px; font-size: 12px; color: var(--color-text-muted); margin-bottom: ${slotTopics.length > 0 ? '8px' : '0'};">
                                    ${s.room ? `<span style="display: flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${s.room}</span>` : ''}
                                    ${teacherName ? `<span style="display: flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>${teacherName}</span>` : ''}
                                </div>
                                ${slotTopics.length > 0 ? `
                                    <div style="display: flex; flex-wrap: wrap; gap: 4px; padding-top: 8px; border-top: 1px dashed var(--color-border);">
                                        ${slotTopics.map(t => `
                                            <span style="
                                                display: inline-flex;
                                                align-items: center;
                                                gap: 4px;
                                                padding: 3px 8px;
                                                border-radius: 100px;
                                                font-size: 10px;
                                                font-weight: 500;
                                                background: var(--school-primary-light);
                                                color: var(--school-primary);
                                                border: 1px solid var(--school-primary);
                                            ">
                                                ${t.name_fr}
                                                ${t.name_ar ? `<span style="font-family: var(--font-arabic); font-size: 9px;">${t.name_ar}</span>` : ''}
                                            </span>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('') : '<div style="color: var(--color-text-muted); text-align: center; padding: 16px;">Aucun horaire défini</div>'}
                </div>

                <div class="students-section">
                    <div class="students-section-header">
                        <span class="students-section-title">\u00c9l\u00e8ves inscrits (${classStudents.length})</span>
                        <button class="btn btn-sm btn-secondary" id="add-student-btn">+ Inscrire</button>
                    </div>
                    ${classStudents.length > 0 ? `
                        <div class="students-list">
                            ${classStudents.map(s => `
                                <div class="student-item">
                                    <div class="student-avatar">${(s.first_name?.[0] || '')+(s.last_name?.[0] || '')}</div>
                                    <div class="student-info">
                                        <div class="student-name">${s.first_name} ${s.last_name}</div>
                                        <div class="student-number">${s.student_number || ''}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-students">
                            Aucun \u00e9l\u00e8ve inscrit \u00e0 cette classe
                        </div>
                    `}
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" id="edit-class-btn">Modifier</button>
                <button class="btn btn-primary" id="close-detail-btn">Fermer</button>
            `
        });

        document.getElementById('close-detail-btn')?.addEventListener('click', closeBottomSheet);
        document.getElementById('edit-class-btn')?.addEventListener('click', () => {
            closeBottomSheet();
            setTimeout(() => openClassForm(cls), 300);
        });
        document.getElementById('add-student-btn')?.addEventListener('click', () => {
            openEnrollStudentModal(cls);
        });

    } catch (error) {
        toastError('Erreur chargement d\u00e9tails');
    }
}

function openEnrollStudentModal(cls) {
    const enrolledIds = (cls.students || []).map(s => s.id);
    const availableStudents = students.filter(s => !enrolledIds.includes(s.id));

    openBottomSheet({
        title: 'Inscrire un \u00e9l\u00e8ve',
        content: `
            <div class="form-group">
                <label class="form-label">S\u00e9lectionner un \u00e9l\u00e8ve</label>
                <select class="form-select" id="student-select">
                    <option value="">-- Choisir --</option>
                    ${availableStudents.map(s => `
                        <option value="${s.id}">${s.first_name} ${s.last_name} (${s.student_number || ''})</option>
                    `).join('')}
                </select>
            </div>
        `,
        footer: `
            <button class="btn btn-secondary" id="cancel-enroll">Annuler</button>
            <button class="btn btn-primary" id="confirm-enroll">Inscrire</button>
        `
    });

    document.getElementById('cancel-enroll')?.addEventListener('click', () => {
        closeBottomSheet();
        setTimeout(() => openClassDetail(cls.id), 300);
    });

    document.getElementById('confirm-enroll')?.addEventListener('click', async () => {
        const studentId = document.getElementById('student-select').value;
        if (!studentId) {
            toastError('S\u00e9lectionnez un \u00e9l\u00e8ve');
            return;
        }

        try {
            await apiService.enrollStudentInClass(cls.id, studentId);
            toastSuccess('\u00c9l\u00e8ve inscrit');
            closeBottomSheet();
            await loadClasses();
            renderClassesGrid();
        } catch (error) {
            toastError('Erreur inscription');
        }
    });
}

function openClassForm(cls = null) {
    const isEdit = !!cls;
    const schedules = cls ? parseSchedule(cls.schedule) : [];

    const DAY_SHORTS = ['L', 'M', 'Me', 'J', 'V', 'S', 'D'];

    // Render topics for a specific schedule card
    const renderScheduleTopics = (topicIds = []) => {
        const categories = {
            langue: { label: 'Langue', topics: [] },
            religion: { label: 'Religion', topics: [] },
            activite: { label: 'Activités', topics: [] },
            autre: { label: 'Autre', topics: [] }
        };

        topics.forEach(t => {
            const cat = categories[t.category] || categories.autre;
            cat.topics.push(t);
        });

        let html = '';
        Object.entries(categories).forEach(([key, cat]) => {
            if (cat.topics.length > 0) {
                html += `<div class="slot-topics-category">${cat.label}</div>`;
                cat.topics.forEach(t => {
                    const isSelected = topicIds.includes(t.id);
                    html += `
                        <button type="button" class="slot-topic-chip ${isSelected ? 'active' : ''}"
                                data-topic-id="${t.id}" data-color="${t.color}">
                            <span class="slot-topic-name">${t.name_fr}</span>
                            ${t.name_ar ? `<span class="slot-topic-ar">${t.name_ar}</span>` : ''}
                        </button>
                    `;
                });
            }
        });

        return html || '<p class="slot-topics-empty">Aucun thème disponible</p>';
    };

    const getSelectedTopicsPreview = (topicIds = []) => {
        if (!topicIds || topicIds.length === 0) return 'Aucun thème';
        const selected = topics.filter(t => topicIds.includes(t.id));
        if (selected.length <= 2) {
            return selected.map(t => t.name_fr).join(', ');
        }
        return `${selected.slice(0, 2).map(t => t.name_fr).join(', ')} +${selected.length - 2}`;
    };

    const renderScheduleCard = (s = null, index = 0) => {
        const topicIds = s?.topic_ids || [];
        const hasDay = s?.jour;
        const hasTime = s?.heure_debut && s?.heure_fin;
        const summary = hasDay && hasTime ? `${s.jour} ${s.heure_debut}-${s.heure_fin}` : 'Nouveau créneau';

        return `
        <div class="slot-card" data-index="${index}">
            <div class="slot-header">
                <div class="slot-summary">
                    <span class="slot-badge ${hasDay ? 'filled' : ''}">${hasDay ? s.jour.substring(0, 3) : '?'}</span>
                    <span class="slot-time-preview">${hasTime ? `${s.heure_debut} - ${s.heure_fin}` : 'Horaire...'}</span>
                </div>
                <div class="slot-actions">
                    <button type="button" class="slot-expand-btn" title="Configurer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <button type="button" class="slot-remove-btn" title="Supprimer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            <div class="slot-content">
                <div class="slot-row">
                    <div class="slot-days">
                        ${DAY_NAMES_FULL.map((d, i) => `
                            <button type="button" class="slot-day ${s?.jour === d ? 'active' : ''}" data-day="${d}">${DAY_SHORTS[i]}</button>
                        `).join('')}
                    </div>
                </div>
                <div class="slot-row slot-time-row">
                    <input type="time" class="slot-time-input schedule-debut" value="${s?.heure_debut || ''}" placeholder="Début">
                    <span class="slot-time-arrow">→</span>
                    <input type="time" class="slot-time-input schedule-fin" value="${s?.heure_fin || ''}" placeholder="Fin">
                </div>
                <div class="slot-row slot-details-row">
                    <div class="slot-detail">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <input type="text" class="slot-detail-input schedule-room" placeholder="Salle" value="${s?.room || ''}">
                    </div>
                    <div class="slot-detail">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <select class="slot-detail-select schedule-teacher">
                            <option value="">Enseignant</option>
                            ${intervenants.map(i => `
                                <option value="${i.id}" ${s?.teacher_id == i.id ? 'selected' : ''}>${i.first_name} ${i.last_name}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="slot-topics-section">
                    <div class="slot-topics-header">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                        <span>Thèmes abordés</span>
                        <span class="slot-topics-count">${topicIds.length > 0 ? topicIds.length : ''}</span>
                    </div>
                    <div class="slot-topics-grid">
                        ${renderScheduleTopics(topicIds)}
                    </div>
                </div>
            </div>
        </div>
    `};


    openBottomSheet({
        title: isEdit ? 'Modifier la classe' : 'Nouvelle classe',
        size: 'large',
        content: `
            <style>
                /* Section container */
                .form-section {
                    background: var(--color-bg-secondary);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-md);
                    margin-bottom: var(--spacing-md);
                }
                .form-section-title {
                    font-weight: 600;
                    font-size: var(--font-sm);
                    color: var(--color-text-secondary);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: var(--spacing-md);
                }
                .form-section-title svg {
                    color: var(--school-primary);
                }

                /* Slot Card - Compact accordion style */
                .slot-card {
                    background: var(--color-card-bg);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    margin-bottom: var(--spacing-sm);
                    overflow: hidden;
                    transition: all 0.2s;
                }
                .slot-card:last-of-type { margin-bottom: 0; }
                .slot-card.expanded {
                    border-color: var(--school-primary);
                    box-shadow: 0 2px 8px var(--school-shadow-light);
                }

                /* Slot Header - Always visible */
                .slot-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    cursor: pointer;
                    background: var(--color-bg-tertiary);
                    border-bottom: 1px solid transparent;
                    transition: all 0.15s;
                }
                .slot-card.expanded .slot-header {
                    border-bottom-color: var(--color-border);
                    background: var(--school-primary-lighter);
                }
                .slot-summary {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 1;
                    min-width: 0;
                }
                .slot-badge {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: var(--color-bg-hover);
                    color: var(--color-text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 600;
                    flex-shrink: 0;
                }
                .slot-badge.filled {
                    background: var(--school-primary);
                    color: white;
                }
                .slot-time-preview {
                    font-size: 13px;
                    color: var(--color-text-secondary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .slot-actions {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .slot-expand-btn, .slot-remove-btn {
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: transparent;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    color: var(--color-text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                }
                .slot-expand-btn:hover { background: var(--color-bg-hover); color: var(--school-primary); }
                .slot-remove-btn:hover { background: rgba(239, 68, 68, 0.1); color: var(--color-error); }
                .slot-expand-btn svg { transition: transform 0.2s; }
                .slot-card.expanded .slot-expand-btn svg { transform: rotate(180deg); }

                /* Slot Content - Expandable */
                .slot-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.25s ease-out;
                    padding: 0 12px;
                }
                .slot-card.expanded .slot-content {
                    max-height: 600px;
                    padding: 12px;
                }

                /* Slot Rows */
                .slot-row { margin-bottom: 12px; }
                .slot-row:last-child { margin-bottom: 0; }

                /* Days selector - Compact */
                .slot-days {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                }
                .slot-day {
                    width: 32px;
                    height: 32px;
                    border: 1px solid var(--color-border);
                    border-radius: 8px;
                    background: var(--color-bg-primary);
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .slot-day:hover {
                    border-color: var(--school-primary);
                    color: var(--school-primary);
                }
                .slot-day.active {
                    background: var(--school-primary);
                    border-color: var(--school-primary);
                    color: white;
                }

                /* Time inputs */
                .slot-time-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .slot-time-input {
                    flex: 1;
                    padding: 8px 10px;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    background: var(--color-bg-primary);
                    font-size: 14px;
                    font-weight: 500;
                    text-align: center;
                    color: var(--color-text-primary);
                }
                .slot-time-input:focus {
                    outline: none;
                    border-color: var(--school-primary);
                }
                .slot-time-arrow {
                    color: var(--color-text-muted);
                    font-size: 14px;
                }

                /* Details row */
                .slot-details-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                .slot-detail {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .slot-detail svg {
                    color: var(--color-text-muted);
                    flex-shrink: 0;
                }
                .slot-detail-input, .slot-detail-select {
                    flex: 1;
                    padding: 6px 8px;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                    background: var(--color-bg-primary);
                    font-size: 12px;
                    color: var(--color-text-primary);
                    min-width: 0;
                }
                .slot-detail-input:focus, .slot-detail-select:focus {
                    outline: none;
                    border-color: var(--school-primary);
                }

                /* Topics section in slot */
                .slot-topics-section {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px dashed var(--color-border);
                }
                .slot-topics-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--color-text-muted);
                    margin-bottom: 10px;
                }
                .slot-topics-header svg { color: var(--school-primary); }
                .slot-topics-count {
                    background: var(--school-primary);
                    color: white;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 10px;
                    margin-left: auto;
                }
                .slot-topics-count:empty { display: none; }

                .slot-topics-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .slot-topics-category {
                    width: 100%;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--color-text-muted);
                    margin-top: 8px;
                    margin-bottom: 4px;
                }
                .slot-topics-category:first-child { margin-top: 0; }
                .slot-topics-empty {
                    color: var(--color-text-muted);
                    font-size: 12px;
                    font-style: italic;
                }

                /* Topic chips - Neutral by default, visible when active */
                .slot-topic-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s;
                    border: 1px solid var(--color-border);
                    background: var(--color-bg-tertiary);
                    color: var(--color-text-muted);
                }
                .slot-topic-chip:hover {
                    border-color: var(--color-text-muted);
                    color: var(--color-text-secondary);
                }
                .slot-topic-chip.active {
                    background: var(--school-primary-light);
                    border-color: var(--school-primary);
                    color: var(--school-primary);
                    font-weight: 600;
                }
                .slot-topic-ar {
                    font-family: var(--font-arabic);
                    font-size: 10px;
                    opacity: 0.8;
                }
                .slot-topic-chip.active .slot-topic-ar {
                    opacity: 1;
                }

                /* Add slot button */
                .add-slot-btn {
                    width: 100%;
                    padding: 10px;
                    border: 2px dashed var(--color-border);
                    border-radius: var(--radius-md);
                    background: transparent;
                    color: var(--color-text-muted);
                    font-size: var(--font-sm);
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.15s;
                    margin-top: var(--spacing-sm);
                }
                .add-slot-btn:hover {
                    border-color: var(--school-primary);
                    color: var(--school-primary);
                    background: var(--school-primary-lighter);
                }
            </style>
            <form id="class-form">
                <div class="form-group">
                    <label class="form-label">Nom de la classe *</label>
                    <input type="text" class="form-input" name="name" required value="${cls?.name || ''}" placeholder="Ex: Coran Niveau 1">
                </div>
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Matière *</label>
                        <select class="form-select" name="subject" required>
                            <option value="coran" ${cls?.subject === 'coran' ? 'selected' : ''}>Coran</option>
                            <option value="arabe" ${cls?.subject === 'arabe' ? 'selected' : ''}>Arabe</option>
                            <option value="fiqh" ${cls?.subject === 'fiqh' ? 'selected' : ''}>Fiqh</option>
                            <option value="sira" ${cls?.subject === 'sira' ? 'selected' : ''}>Sira</option>
                            <option value="doua" ${cls?.subject === 'doua' ? 'selected' : ''}>Doua</option>
                            <option value="autre" ${cls?.subject === 'autre' ? 'selected' : ''}>Autre</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Niveau</label>
                        <select class="form-select" name="level">
                            <option value="debutant" ${cls?.level === 'debutant' ? 'selected' : ''}>Débutant</option>
                            <option value="intermediaire" ${cls?.level === 'intermediaire' ? 'selected' : ''}>Intermédiaire</option>
                            <option value="avance" ${cls?.level === 'avance' ? 'selected' : ''}>Avancé</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Capacité max</label>
                    <input type="number" class="form-input" name="max_capacity" value="${cls?.max_capacity || 20}" min="1" style="max-width: 150px;">
                </div>
                <div class="form-section">
                    <div class="form-section-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Créneaux & Thèmes
                    </div>
                    <div id="slots-container">
                        ${schedules.length > 0
                            ? schedules.map((s, i) => renderScheduleCard(s, i)).join('')
                            : renderScheduleCard(null, 0)
                        }
                    </div>
                    <button type="button" class="add-slot-btn" id="add-slot-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Ajouter un créneau
                    </button>
                </div>
            </form>
        `,
        footer: `
            ${isEdit ? '<button class="btn btn-danger" id="delete-class-btn">Supprimer</button>' : ''}
            <button class="btn btn-secondary" id="cancel-class-btn">Annuler</button>
            <button class="btn btn-primary" id="save-class-btn">${isEdit ? 'Enregistrer' : 'Cr\u00e9er'}</button>
        `
    });

    document.getElementById('cancel-class-btn')?.addEventListener('click', closeBottomSheet);

    // Slot card management
    let slotIndex = schedules.length || 1;

    function updateSlotPreview(card) {
        const activeDay = card.querySelector('.slot-day.active');
        const debut = card.querySelector('.schedule-debut').value;
        const fin = card.querySelector('.schedule-fin').value;

        const badge = card.querySelector('.slot-badge');
        const preview = card.querySelector('.slot-time-preview');

        if (activeDay) {
            badge.textContent = activeDay.dataset.day.substring(0, 3);
            badge.classList.add('filled');
        } else {
            badge.textContent = '?';
            badge.classList.remove('filled');
        }

        preview.textContent = debut && fin ? `${debut} - ${fin}` : 'Horaire...';

        // Update topics count
        const selectedTopics = card.querySelectorAll('.slot-topic-chip.active').length;
        const countBadge = card.querySelector('.slot-topics-count');
        countBadge.textContent = selectedTopics > 0 ? selectedTopics : '';
    }

    function attachSlotListeners() {
        // Toggle expand/collapse
        document.querySelectorAll('.slot-header').forEach(header => {
            header.onclick = (e) => {
                if (e.target.closest('.slot-remove-btn')) return;
                const card = header.closest('.slot-card');
                // Close other cards
                document.querySelectorAll('.slot-card.expanded').forEach(c => {
                    if (c !== card) c.classList.remove('expanded');
                });
                card.classList.toggle('expanded');
            };
        });

        // Day selection (only one day per slot)
        document.querySelectorAll('.slot-day').forEach(chip => {
            chip.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = chip.closest('.slot-card');
                card.querySelectorAll('.slot-day').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                updateSlotPreview(card);
            };
        });

        // Time inputs update preview
        document.querySelectorAll('.slot-time-input').forEach(input => {
            input.onchange = () => {
                const card = input.closest('.slot-card');
                updateSlotPreview(card);
            };
        });

        // Topic chip selection
        document.querySelectorAll('.slot-topic-chip').forEach(chip => {
            chip.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                chip.classList.toggle('active');
                const card = chip.closest('.slot-card');
                updateSlotPreview(card);
            };
        });

        // Remove slot
        document.querySelectorAll('.slot-remove-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = btn.closest('.slot-card');
                const container = document.getElementById('slots-container');
                if (container.querySelectorAll('.slot-card').length > 1) {
                    card.remove();
                } else {
                    // Reset first card instead of removing
                    card.querySelectorAll('.slot-day').forEach(c => c.classList.remove('active'));
                    card.querySelector('.schedule-debut').value = '';
                    card.querySelector('.schedule-fin').value = '';
                    card.querySelector('.schedule-room').value = '';
                    card.querySelector('.schedule-teacher').value = '';
                    card.querySelectorAll('.slot-topic-chip').forEach(c => c.classList.remove('active'));
                    card.classList.remove('expanded');
                    updateSlotPreview(card);
                }
            };
        });
    }
    attachSlotListeners();

    // Auto-expand first card if new class
    if (!isEdit) {
        document.querySelector('.slot-card')?.classList.add('expanded');
    }

    document.getElementById('add-slot-btn')?.addEventListener('click', () => {
        const container = document.getElementById('slots-container');
        const wrapper = document.createElement('div');
        wrapper.innerHTML = renderScheduleCard(null, slotIndex);
        container.appendChild(wrapper.firstElementChild);
        slotIndex++;
        attachSlotListeners();
        // Expand the new card
        container.querySelector('.slot-card:last-child')?.classList.add('expanded');
    });

    if (isEdit) {
        document.getElementById('delete-class-btn')?.addEventListener('click', async () => {
            if (confirm('Supprimer cette classe ?')) {
                try {
                    await apiService.deleteSchoolClass(cls.id);
                    toastSuccess('Classe supprimée');
                    closeBottomSheet();
                    await loadClasses();
                    renderClassesGrid();
                } catch (error) {
                    toastError('Erreur suppression');
                }
            }
        });
    }

    document.getElementById('save-class-btn')?.addEventListener('click', async () => {
        const form = document.getElementById('class-form');
        const formData = new FormData(form);

        // Collect all slots with their topics
        const slotCards = document.querySelectorAll('.slot-card');
        const scheduleList = [];
        slotCards.forEach(card => {
            const activeDay = card.querySelector('.slot-day.active');
            const jour = activeDay ? activeDay.dataset.day : null;
            const debut = card.querySelector('.schedule-debut').value;
            const fin = card.querySelector('.schedule-fin').value;
            const room = card.querySelector('.schedule-room')?.value || '';
            const teacherId = card.querySelector('.schedule-teacher')?.value || null;

            // Collect topics for this specific slot
            const slotTopicIds = Array.from(card.querySelectorAll('.slot-topic-chip.active'))
                .map(chip => parseInt(chip.dataset.topicId));

            if (jour && debut && fin) {
                scheduleList.push({
                    jour,
                    heure_debut: debut,
                    heure_fin: fin,
                    room: room || null,
                    teacher_id: teacherId ? parseInt(teacherId) : null,
                    topic_ids: slotTopicIds
                });
            }
        });

        const data = {
            name: formData.get('name'),
            subject: formData.get('subject'),
            level: formData.get('level'),
            max_capacity: parseInt(formData.get('max_capacity')) || 20,
            schedule: scheduleList.length > 0 ? scheduleList : null
        };

        if (!data.name || !data.subject) {
            toastError('Nom et matière requis');
            return;
        }

        try {
            if (isEdit) {
                await apiService.updateSchoolClass(cls.id, data);
                toastSuccess('Classe modifiée');
            } else {
                await apiService.createSchoolClass(data);
                toastSuccess('Classe créée');
            }

            closeBottomSheet();
            await loadClasses();
            renderClassesGrid();
        } catch (error) {
            toastError('Erreur enregistrement');
        }
    });
}
