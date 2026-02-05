import apiService from '../../services/api.service.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';

const icons = {
    plus: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    megaphone: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>`,
    message: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    award: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
    send: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
};

let currentSubTab = 'announcements';
let currentStudents = [];
let currentClasses = [];
let availableBadges = [];

export async function renderEntTab(container) {
    container.innerHTML = `
        <style>
            .ent-subtabs {
                display: flex;
                gap: var(--spacing-sm);
                border-bottom: 1px solid var(--color-border);
                padding-bottom: var(--spacing-sm);
                margin-bottom: var(--spacing-lg);
                overflow-x: auto;
            }

            .ent-subtab {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                padding: var(--spacing-sm) var(--spacing-md);
                border: none;
                background: none;
                cursor: pointer;
                color: var(--color-text-secondary);
                font-size: var(--font-sm);
                font-weight: var(--font-medium);
                border-radius: var(--radius-md);
                transition: all var(--transition-fast);
                white-space: nowrap;
            }

            .ent-subtab:hover {
                background-color: var(--color-bg-secondary);
                color: var(--color-text-primary);
            }

            .ent-subtab.active {
                background-color: var(--color-success-light);
                color: var(--color-success);
            }

            .ent-subtab svg {
                width: 20px;
                height: 20px;
            }

            .ent-content {
                min-height: 400px;
            }

            /* Section header */
            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--spacing-lg);
                flex-wrap: wrap;
                gap: var(--spacing-md);
            }

            .section-header h3 {
                font-size: var(--font-lg);
                font-weight: var(--font-semibold);
                color: var(--color-text-primary);
            }

            /* Announcements */
            .announcements-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
            }

            .announcement-card {
                background-color: var(--color-card-bg);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-lg);
                padding: var(--spacing-md);
                transition: all var(--transition-fast);
            }

            .announcement-card:hover {
                box-shadow: var(--shadow-sm);
            }

            .announcement-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: var(--spacing-sm);
                gap: var(--spacing-sm);
            }

            .announcement-title {
                font-size: var(--font-lg);
                font-weight: var(--font-semibold);
                color: var(--color-text-primary);
            }

            .announcement-meta {
                display: flex;
                gap: var(--spacing-sm);
                align-items: center;
                flex-shrink: 0;
            }

            .announcement-date {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
            }

            .announcement-status {
                font-size: var(--font-xs);
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--radius-full);
                font-weight: var(--font-medium);
            }

            .announcement-status.published {
                background-color: var(--color-badge-actif);
                color: var(--color-badge-actif-text);
            }

            .announcement-status.draft {
                background-color: var(--color-badge-pending);
                color: var(--color-badge-pending-text);
            }

            .announcement-content {
                color: var(--color-text-secondary);
                font-size: var(--font-sm);
                line-height: 1.6;
                margin-bottom: var(--spacing-md);
            }

            .announcement-classes {
                display: flex;
                flex-wrap: wrap;
                gap: var(--spacing-xs);
                margin-bottom: var(--spacing-sm);
            }

            .class-badge {
                font-size: var(--font-xs);
                padding: 2px var(--spacing-sm);
                background: var(--color-success-light);
                color: var(--color-success);
                border-radius: var(--radius-full);
                font-weight: var(--font-medium);
            }

            .announcement-target {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
                margin-bottom: var(--spacing-sm);
                font-style: italic;
            }

            .announcement-actions {
                display: flex;
                gap: var(--spacing-xs);
                flex-wrap: wrap;
            }

            .announcement-actions button {
                padding: var(--spacing-xs) var(--spacing-sm);
                border: 1px solid var(--color-border);
                background: var(--color-bg-primary);
                cursor: pointer;
                border-radius: var(--radius-md);
                font-size: var(--font-xs);
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                transition: all var(--transition-fast);
                color: var(--color-text-secondary);
            }

            .announcement-actions button:hover {
                background-color: var(--color-bg-secondary);
            }

            .announcement-actions button.publish {
                color: var(--color-success);
                border-color: var(--color-success);
            }

            .announcement-actions button.delete {
                color: var(--color-error);
                border-color: var(--color-error);
            }

            /* Messages */
            .messages-container {
                display: grid;
                grid-template-columns: 280px 1fr;
                gap: var(--spacing-md);
                height: 500px;
            }

            @media (max-width: 768px) {
                .messages-container {
                    grid-template-columns: 1fr;
                    height: auto;
                }

                .conversation-panel {
                    display: none;
                }

                .conversation-panel.active {
                    display: flex;
                }
            }

            .students-list-panel {
                background-color: var(--color-card-bg);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-lg);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .students-list-header {
                padding: var(--spacing-md);
                border-bottom: 1px solid var(--color-border);
                font-weight: var(--font-semibold);
                color: var(--color-text-primary);
                background-color: var(--color-bg-secondary);
            }

            .students-list-body {
                flex: 1;
                overflow-y: auto;
            }

            .student-msg-item {
                padding: var(--spacing-sm) var(--spacing-md);
                cursor: pointer;
                border-bottom: 1px solid var(--color-border-light);
                transition: all var(--transition-fast);
            }

            .student-msg-item:hover {
                background-color: var(--color-bg-hover);
            }

            .student-msg-item.active {
                background-color: var(--color-success-light);
                border-left: 3px solid var(--color-success);
            }

            .student-msg-name {
                font-weight: var(--font-medium);
                margin-bottom: 2px;
                color: var(--color-text-primary);
            }

            .student-msg-preview {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .conversation-panel {
                background-color: var(--color-card-bg);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-lg);
                display: flex;
                flex-direction: column;
            }

            .conversation-header {
                padding: var(--spacing-md);
                border-bottom: 1px solid var(--color-border);
                font-weight: var(--font-semibold);
                color: var(--color-text-primary);
                background-color: var(--color-bg-secondary);
            }

            .conversation-messages {
                flex: 1;
                overflow-y: auto;
                padding: var(--spacing-md);
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }

            .message-bubble {
                max-width: 80%;
                padding: var(--spacing-sm) var(--spacing-md);
                border-radius: var(--radius-lg);
                font-size: var(--font-sm);
            }

            .message-bubble.sent {
                background-color: var(--color-success);
                color: var(--color-white);
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }

            .message-bubble.received {
                background-color: var(--color-bg-tertiary);
                color: var(--color-text-primary);
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }

            .message-time {
                font-size: var(--font-xs);
                margin-top: 4px;
                opacity: 0.7;
            }

            .conversation-input {
                padding: var(--spacing-md);
                border-top: 1px solid var(--color-border);
                display: flex;
                gap: var(--spacing-sm);
            }

            .conversation-input input {
                flex: 1;
                padding: var(--spacing-sm) var(--spacing-md);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                background-color: var(--color-input-bg);
                color: var(--color-text-primary);
            }

            .conversation-input button {
                padding: var(--spacing-sm) var(--spacing-md);
                background-color: var(--color-success);
                color: var(--color-white);
                border: none;
                border-radius: var(--radius-md);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                transition: all var(--transition-fast);
            }

            .conversation-input button:hover {
                background-color: var(--color-success-hover);
            }

            /* Badges */
            .badges-section {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-lg);
            }

            .student-badges-selector {
                display: flex;
                gap: var(--spacing-md);
                flex-wrap: wrap;
                align-items: center;
            }

            .student-badges-selector select {
                padding: var(--spacing-sm) var(--spacing-md);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                font-size: var(--font-sm);
                min-width: 200px;
                background-color: var(--color-input-bg);
                color: var(--color-text-primary);
            }

            .badges-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: var(--spacing-md);
            }

            .badge-card {
                background-color: var(--color-card-bg);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-lg);
                padding: var(--spacing-md);
                text-align: center;
                transition: all var(--transition-fast);
            }

            .badge-card:hover {
                box-shadow: var(--shadow-sm);
                transform: translateY(-2px);
            }

            .badge-card.earned {
                border-color: var(--color-success);
                background-color: var(--color-success-light);
            }

            .badge-icon {
                font-size: 40px;
                margin-bottom: var(--spacing-sm);
            }

            .badge-card.earned .badge-icon {
                filter: none;
            }

            .badge-card:not(.earned) .badge-icon {
                filter: grayscale(100%);
                opacity: 0.5;
            }

            .badge-name {
                font-weight: var(--font-semibold);
                margin-bottom: var(--spacing-xs);
                font-size: var(--font-sm);
                color: var(--color-text-primary);
            }

            .badge-description {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
                margin-bottom: var(--spacing-sm);
            }

            .badge-date {
                font-size: var(--font-xs);
                color: var(--color-success);
            }

            .badge-action {
                margin-top: var(--spacing-sm);
            }

            .badge-action button {
                padding: var(--spacing-xs) var(--spacing-sm);
                border: 1px solid var(--color-success);
                background: none;
                color: var(--color-success);
                border-radius: var(--radius-md);
                font-size: var(--font-xs);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .badge-action button:hover {
                background-color: var(--color-success);
                color: var(--color-white);
            }

            .ent-empty {
                text-align: center;
                padding: var(--spacing-2xl);
                color: var(--color-text-muted);
            }

            .ent-empty svg {
                width: 48px;
                height: 48px;
                margin-bottom: var(--spacing-md);
                opacity: 0.3;
            }
        </style>

        <div class="ent-subtabs">
            <button class="ent-subtab active" data-subtab="announcements">
                ${icons.megaphone}
                <span>Annonces</span>
            </button>
            <button class="ent-subtab" data-subtab="messages">
                ${icons.message}
                <span>Messagerie</span>
            </button>
            <button class="ent-subtab" data-subtab="badges">
                ${icons.award}
                <span>Badges & Progression</span>
            </button>
        </div>

        <div class="ent-content" id="ent-content">
            <!-- Content loaded here -->
        </div>
    `;

    // Attach subtab click handlers
    document.querySelectorAll('.ent-subtab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.ent-subtab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentSubTab = tab.dataset.subtab;
            loadSubTabContent(currentSubTab);
        });
    });

    // Load initial data
    await Promise.all([loadStudents(), loadClasses()]);
    loadSubTabContent(currentSubTab);
}

async function loadStudents() {
    try {
        const response = await apiService.getStudents();
        if (response.success) {
            currentStudents = response.data;
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

async function loadClasses() {
    try {
        const response = await apiService.getSchoolClasses();
        if (response.success) {
            currentClasses = response.data;
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

async function loadSubTabContent(subtab) {
    const container = document.getElementById('ent-content');

    switch (subtab) {
        case 'announcements':
            await renderAnnouncementsSection(container);
            break;
        case 'messages':
            await renderMessagesSection(container);
            break;
        case 'badges':
            await renderBadgesSection(container);
            break;
    }
}

// ==================== ANNOUNCEMENTS ====================

async function renderAnnouncementsSection(container) {
    container.innerHTML = `
        <div class="section-header">
            <h3>Annonces aux parents</h3>
            <button class="btn btn-primary" id="add-announcement-btn">
                ${icons.plus}
                <span>Nouvelle annonce</span>
            </button>
        </div>
        <div class="announcements-list" id="announcements-list">
            <div class="loading-spinner"></div>
        </div>
    `;

    document.getElementById('add-announcement-btn').addEventListener('click', () => showAnnouncementForm());
    await loadAnnouncements();
}

async function loadAnnouncements() {
    const listContainer = document.getElementById('announcements-list');

    try {
        const response = await apiService.getSchoolAnnouncements();
        if (response.success) {
            renderAnnouncementsList(response.data);
        }
    } catch (error) {
        console.error('Error loading announcements:', error);
        listContainer.innerHTML = '<div class="ent-empty"><p>Erreur de chargement</p></div>';
    }
}

function renderAnnouncementsList(announcements) {
    const container = document.getElementById('announcements-list');

    if (announcements.length === 0) {
        container.innerHTML = `
            <div class="ent-empty">
                ${icons.megaphone}
                <p>Aucune annonce</p>
            </div>
        `;
        return;
    }

    container.innerHTML = announcements.map(a => {
        // Determine target display
        let targetDisplay = '';
        if (a.class_names && a.class_names.length > 0) {
            targetDisplay = `<div class="announcement-classes">${a.class_names.map(name => `<span class="class-badge">${name}</span>`).join('')}</div>`;
        } else if (a.target_audience === 'parents') {
            targetDisplay = '<div class="announcement-target">Parents uniquement</div>';
        } else if (a.target_audience === 'students') {
            targetDisplay = '<div class="announcement-target">Élèves uniquement</div>';
        }

        return `
            <div class="announcement-card" data-id="${a.id}">
                <div class="announcement-header">
                    <div class="announcement-title">${a.title}</div>
                    <div class="announcement-meta">
                        <span class="announcement-status ${a.is_published ? 'published' : 'draft'}">
                            ${a.is_published ? 'Publiée' : 'Brouillon'}
                        </span>
                        <span class="announcement-date">${new Date(a.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
                ${targetDisplay}
                <div class="announcement-content">${a.content.substring(0, 200)}${a.content.length > 200 ? '...' : ''}</div>
                <div class="announcement-actions">
                    ${!a.is_published ? `
                        <button class="publish" onclick="window.publishAnnouncement(${a.id})">
                            ${icons.check} Publier
                        </button>
                    ` : ''}
                    <button onclick="window.editAnnouncement(${a.id})">
                        ${icons.edit} Modifier
                    </button>
                    <button class="delete" onclick="window.deleteAnnouncement(${a.id})">
                        ${icons.trash} Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function showAnnouncementForm(announcement = null) {
    const isEdit = announcement !== null;
    const selectedClassIds = announcement?.class_ids || [];

    const content = `
        <style>
            .class-selector-section {
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                padding: var(--spacing-md);
                margin-top: var(--spacing-xs);
            }

            .class-selector-label {
                font-size: var(--font-sm);
                color: var(--color-text-secondary);
                margin-bottom: var(--spacing-sm);
                display: block;
            }

            .class-checkboxes {
                display: flex;
                flex-wrap: wrap;
                gap: var(--spacing-sm);
                max-height: 180px;
                overflow-y: auto;
            }

            .class-checkbox-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                padding: var(--spacing-xs) var(--spacing-sm);
                background: var(--color-bg-primary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all var(--transition-fast);
                font-size: var(--font-sm);
            }

            .class-checkbox-item:hover {
                border-color: var(--color-success);
            }

            .class-checkbox-item.selected {
                background: var(--color-success-light);
                border-color: var(--color-success);
                color: var(--color-success);
            }

            .class-checkbox-item input {
                display: none;
            }

            .class-checkbox-icon {
                width: 16px;
                height: 16px;
                border: 2px solid var(--color-border);
                border-radius: 3px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all var(--transition-fast);
            }

            .class-checkbox-item.selected .class-checkbox-icon {
                background: var(--color-success);
                border-color: var(--color-success);
            }

            .class-checkbox-item.selected .class-checkbox-icon svg {
                display: block;
            }

            .class-checkbox-icon svg {
                display: none;
                width: 12px;
                height: 12px;
                stroke: white;
            }

            .select-all-classes {
                font-size: var(--font-xs);
                color: var(--color-success);
                cursor: pointer;
                margin-bottom: var(--spacing-sm);
            }

            .select-all-classes:hover {
                text-decoration: underline;
            }
        </style>
        <form id="announcement-form" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <div class="form-group">
                <label class="form-label">Titre *</label>
                <input type="text" name="title" class="form-input" required value="${announcement?.title || ''}" placeholder="Titre de l'annonce">
            </div>

            <div class="form-group">
                <label class="form-label">Contenu *</label>
                <textarea name="content" class="form-textarea" required rows="6" placeholder="Contenu de l'annonce...">${announcement?.content || ''}</textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Public cible</label>
                <select name="target_audience" class="form-select" id="target-audience-select">
                    <option value="all" ${announcement?.target_audience === 'all' ? 'selected' : ''}>Tous</option>
                    <option value="parents" ${announcement?.target_audience === 'parents' ? 'selected' : ''}>Parents uniquement</option>
                    <option value="students" ${announcement?.target_audience === 'students' ? 'selected' : ''}>Élèves uniquement</option>
                </select>
            </div>

            <div class="form-group" id="class-selector-group">
                <label class="form-label">Classes destinataires</label>
                <div class="class-selector-section">
                    ${currentClasses.length > 0 ? `
                        <span class="select-all-classes" id="toggle-all-classes">Tout sélectionner</span>
                        <div class="class-checkboxes" id="class-checkboxes">
                            ${currentClasses.map(c => `
                                <div class="class-checkbox-item ${selectedClassIds.includes(c.id) ? 'selected' : ''}" data-class-id="${c.id}">
                                    <span class="class-checkbox-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </span>
                                    <span>${c.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <span class="class-selector-label">Aucune classe disponible. L'annonce sera envoyée à tous.</span>
                    `}
                </div>
            </div>

            <div style="display: flex; gap: var(--spacing-sm); justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="window.closeBottomSheet()">Annuler</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Modifier' : 'Créer'}</button>
            </div>
        </form>
    `;

    openBottomSheet({
        title: isEdit ? 'Modifier l\'annonce' : 'Nouvelle annonce',
        content
    });

    window.closeBottomSheet = closeBottomSheet;

    // Handle class checkbox clicks - using setTimeout to ensure DOM is ready
    setTimeout(() => {
        document.querySelectorAll('.class-checkbox-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
            });
        });

        // Toggle all classes
        const toggleAllBtn = document.getElementById('toggle-all-classes');
        if (toggleAllBtn) {
            toggleAllBtn.addEventListener('click', () => {
                const items = document.querySelectorAll('.class-checkbox-item');
                const allSelected = Array.from(items).every(item => item.classList.contains('selected'));

                items.forEach(item => {
                    if (allSelected) {
                        item.classList.remove('selected');
                    } else {
                        item.classList.add('selected');
                    }
                });

                toggleAllBtn.textContent = allSelected ? 'Tout sélectionner' : 'Tout désélectionner';
            });
        }
    }, 100);

    document.getElementById('announcement-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Get all selected class IDs from data-class-id attribute
        const classIds = Array.from(document.querySelectorAll('.class-checkbox-item.selected'))
            .map(item => parseInt(item.dataset.classId));

        const data = {
            title: formData.get('title'),
            content: formData.get('content'),
            target_audience: formData.get('target_audience'),
            class_ids: classIds
        };

        try {
            if (isEdit) {
                await apiService.updateSchoolAnnouncement(announcement.id, data);
                toastSuccess('Annonce modifiée');
            } else {
                await apiService.createSchoolAnnouncement(data);
                toastSuccess('Annonce créée');
            }
            closeBottomSheet();
            loadAnnouncements();
        } catch (error) {
            toastError(error.message || 'Erreur');
        }
    });
}

window.editAnnouncement = async (id) => {
    try {
        const response = await apiService.getSchoolAnnouncement(id);
        if (response.success) {
            showAnnouncementForm(response.data);
        }
    } catch (error) {
        toastError('Erreur de chargement');
    }
};

window.deleteAnnouncement = async (id) => {
    if (!confirm('Supprimer cette annonce ?')) return;

    try {
        await apiService.deleteSchoolAnnouncement(id);
        toastSuccess('Annonce supprimée');
        loadAnnouncements();
    } catch (error) {
        toastError(error.message || 'Erreur');
    }
};

window.publishAnnouncement = async (id) => {
    try {
        await apiService.publishSchoolAnnouncement(id);
        toastSuccess('Annonce publiée');
        loadAnnouncements();
    } catch (error) {
        toastError(error.message || 'Erreur');
    }
};

// ==================== MESSAGES ====================

let selectedStudentId = null;

async function renderMessagesSection(container) {
    container.innerHTML = `
        <div class="messages-container">
            <div class="students-list-panel">
                <div class="students-list-header">Élèves</div>
                <div class="students-list-body" id="students-msg-list">
                    ${currentStudents.length === 0 ? '<div class="ent-empty"><p>Aucun élève</p></div>' : ''}
                    ${currentStudents.map(s => `
                        <div class="student-msg-item" data-student-id="${s.id}" onclick="window.selectStudent(${s.id})">
                            <div class="student-msg-name">${s.first_name} ${s.last_name}</div>
                            <div class="student-msg-preview">Cliquer pour voir la conversation</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="conversation-panel" id="conversation-panel">
                <div class="conversation-header" id="conversation-header">Sélectionnez un élève</div>
                <div class="conversation-messages" id="conversation-messages">
                    <div class="ent-empty">
                        ${icons.message}
                        <p>Sélectionnez un élève pour voir la conversation</p>
                    </div>
                </div>
                <div class="conversation-input" id="conversation-input" style="display: none;">
                    <input type="text" id="message-input" placeholder="Votre message...">
                    <button onclick="window.sendMessage()">
                        ${icons.send}
                        Envoyer
                    </button>
                </div>
            </div>
        </div>
    `;
}

window.selectStudent = async (studentId) => {
    selectedStudentId = studentId;
    const student = currentStudents.find(s => s.id === studentId);

    // Update active state
    document.querySelectorAll('.student-msg-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-student-id="${studentId}"]`)?.classList.add('active');

    // Update header
    document.getElementById('conversation-header').textContent = `Conversation - ${student.first_name} ${student.last_name}`;

    // Show input
    document.getElementById('conversation-input').style.display = 'flex';

    // Load conversation
    await loadConversation(studentId);
};

async function loadConversation(studentId) {
    const container = document.getElementById('conversation-messages');
    container.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const response = await apiService.getSchoolConversation(studentId);
        if (response.success) {
            renderConversation(response.data);
        }
    } catch (error) {
        console.error('Error loading conversation:', error);
        container.innerHTML = '<div class="ent-empty"><p>Erreur de chargement</p></div>';
    }
}

function renderConversation(messages) {
    const container = document.getElementById('conversation-messages');

    if (messages.length === 0) {
        container.innerHTML = `
            <div class="ent-empty">
                ${icons.message}
                <p>Aucun message dans cette conversation</p>
            </div>
        `;
        return;
    }

    container.innerHTML = messages.map(m => `
        <div class="message-bubble ${m.sender_type === 'parent' ? 'received' : 'sent'}">
            <div class="message-content">${m.content}</div>
            <div class="message-time">${new Date(m.created_at).toLocaleString('fr-FR')}</div>
        </div>
    `).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

window.sendMessage = async () => {
    if (!selectedStudentId) return;

    const input = document.getElementById('message-input');
    const content = input.value.trim();
    if (!content) return;

    try {
        await apiService.sendSchoolMessage({
            recipient_type: 'parent',
            recipient_id: selectedStudentId,
            student_id: selectedStudentId,
            content
        });
        input.value = '';
        await loadConversation(selectedStudentId);
    } catch (error) {
        toastError(error.message || 'Erreur d\'envoi');
    }
};

// ==================== BADGES ====================

let selectedBadgeStudentId = null;
let studentEarnedBadges = [];

async function renderBadgesSection(container) {
    // Load available badges first
    try {
        const badgesResponse = await apiService.getAvailableBadges();
        if (badgesResponse.success) {
            availableBadges = badgesResponse.data;
        }
    } catch (error) {
        console.error('Error loading badges:', error);
    }

    container.innerHTML = `
        <div class="badges-section">
            <div class="student-badges-selector">
                <select id="badge-student-select" onchange="window.loadStudentBadges()">
                    <option value="">Sélectionner un élève</option>
                    ${currentStudents.map(s => `
                        <option value="${s.id}">${s.first_name} ${s.last_name}</option>
                    `).join('')}
                </select>
            </div>

            <div class="badges-grid" id="badges-grid">
                <div class="ent-empty" style="grid-column: 1 / -1;">
                    ${icons.award}
                    <p>Sélectionnez un élève pour voir et attribuer des badges</p>
                </div>
            </div>
        </div>
    `;
}

window.loadStudentBadges = async () => {
    const select = document.getElementById('badge-student-select');
    selectedBadgeStudentId = select.value;

    if (!selectedBadgeStudentId) {
        document.getElementById('badges-grid').innerHTML = `
            <div class="ent-empty" style="grid-column: 1 / -1;">
                ${icons.award}
                <p>Sélectionnez un élève pour voir et attribuer des badges</p>
            </div>
        `;
        return;
    }

    // Load student's earned badges
    try {
        const response = await apiService.getStudentBadges(selectedBadgeStudentId);
        if (response.success) {
            studentEarnedBadges = response.data;
            renderBadgesGrid();
        }
    } catch (error) {
        console.error('Error loading student badges:', error);
        studentEarnedBadges = [];
        renderBadgesGrid();
    }
};

function renderBadgesGrid() {
    const container = document.getElementById('badges-grid');

    container.innerHTML = availableBadges.map(badge => {
        const earned = studentEarnedBadges.find(b => b.milestone_name === badge.name);
        return `
            <div class="badge-card ${earned ? 'earned' : ''}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-description">${badge.description}</div>
                ${earned ? `
                    <div class="badge-date">Obtenu le ${new Date(earned.achieved_at).toLocaleDateString('fr-FR')}</div>
                ` : `
                    <div class="badge-action">
                        <button onclick="window.awardBadge('${badge.name}', '${badge.icon}', '${badge.type}')">
                            ${icons.plus} Attribuer
                        </button>
                    </div>
                `}
            </div>
        `;
    }).join('');
}

window.awardBadge = async (name, icon, type) => {
    if (!selectedBadgeStudentId) return;

    try {
        await apiService.createStudentProgress({
            student_id: selectedBadgeStudentId,
            milestone_name: name,
            milestone_icon: icon,
            milestone_type: type
        });
        toastSuccess('Badge attribué');
        window.loadStudentBadges();
    } catch (error) {
        toastError(error.message || 'Erreur');
    }
};
