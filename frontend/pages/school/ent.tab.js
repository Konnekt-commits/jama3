import apiService from '../../services/api.service.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { showToast } from '../../components/toast/toast.js';

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
let availableBadges = [];

export async function renderEntTab(container) {
    container.innerHTML = `
        <style>
            .ent-tab {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-lg);
            }

            .ent-subtabs {
                display: flex;
                gap: var(--spacing-sm);
                border-bottom: 1px solid var(--color-border);
                padding-bottom: var(--spacing-sm);
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
            }

            .ent-subtab:hover {
                background-color: var(--color-bg-secondary);
                color: var(--color-text-primary);
            }

            .ent-subtab.active {
                background-color: rgba(5, 150, 105, 0.1);
                color: #059669;
            }

            .ent-subtab svg {
                width: 20px;
                height: 20px;
            }

            .ent-content {
                min-height: 400px;
            }

            /* Announcements styles */
            .announcements-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
            }

            .announcement-card {
                background-color: var(--color-bg-primary);
                border: 1px solid var(--color-border);
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
            }

            .announcement-title {
                font-size: var(--font-lg);
                font-weight: var(--font-semibold);
            }

            .announcement-meta {
                display: flex;
                gap: var(--spacing-sm);
                align-items: center;
            }

            .announcement-date {
                font-size: var(--font-xs);
                color: var(--color-text-secondary);
            }

            .announcement-status {
                font-size: var(--font-xs);
                padding: 2px 8px;
                border-radius: var(--radius-full);
                font-weight: var(--font-medium);
            }

            .announcement-status.published {
                background-color: rgba(5, 150, 105, 0.1);
                color: #059669;
            }

            .announcement-status.draft {
                background-color: rgba(245, 158, 11, 0.1);
                color: #f59e0b;
            }

            .announcement-content {
                color: var(--color-text-secondary);
                font-size: var(--font-sm);
                line-height: 1.6;
                margin-bottom: var(--spacing-md);
            }

            .announcement-actions {
                display: flex;
                gap: var(--spacing-xs);
            }

            .announcement-actions button {
                padding: var(--spacing-xs) var(--spacing-sm);
                border: 1px solid var(--color-border);
                background: none;
                cursor: pointer;
                border-radius: var(--radius-md);
                font-size: var(--font-xs);
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                transition: all var(--transition-fast);
            }

            .announcement-actions button:hover {
                background-color: var(--color-bg-secondary);
            }

            .announcement-actions button.publish {
                color: #059669;
                border-color: #059669;
            }

            .announcement-actions button.delete {
                color: var(--color-danger);
                border-color: var(--color-danger);
            }

            /* Messages styles */
            .messages-container {
                display: grid;
                grid-template-columns: 300px 1fr;
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
                background-color: var(--color-bg-primary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .students-list-header {
                padding: var(--spacing-md);
                border-bottom: 1px solid var(--color-border);
                font-weight: var(--font-semibold);
            }

            .students-list-body {
                flex: 1;
                overflow-y: auto;
            }

            .student-msg-item {
                padding: var(--spacing-sm) var(--spacing-md);
                cursor: pointer;
                border-bottom: 1px solid var(--color-border);
                transition: all var(--transition-fast);
            }

            .student-msg-item:hover {
                background-color: var(--color-bg-secondary);
            }

            .student-msg-item.active {
                background-color: rgba(5, 150, 105, 0.1);
                border-left: 3px solid #059669;
            }

            .student-msg-name {
                font-weight: var(--font-medium);
                margin-bottom: 2px;
            }

            .student-msg-preview {
                font-size: var(--font-xs);
                color: var(--color-text-secondary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .conversation-panel {
                background-color: var(--color-bg-primary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                display: flex;
                flex-direction: column;
            }

            .conversation-header {
                padding: var(--spacing-md);
                border-bottom: 1px solid var(--color-border);
                font-weight: var(--font-semibold);
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
                background-color: #059669;
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }

            .message-bubble.received {
                background-color: var(--color-bg-secondary);
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }

            .message-time {
                font-size: var(--font-xs);
                color: var(--color-text-secondary);
                margin-top: 2px;
            }

            .message-bubble.sent .message-time {
                color: rgba(255, 255, 255, 0.7);
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
            }

            .conversation-input button {
                padding: var(--spacing-sm) var(--spacing-md);
                background-color: #059669;
                color: white;
                border: none;
                border-radius: var(--radius-md);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
            }

            /* Badges styles */
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
            }

            .badges-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: var(--spacing-md);
            }

            .badge-card {
                background-color: var(--color-bg-primary);
                border: 1px solid var(--color-border);
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
                border-color: #059669;
                background-color: rgba(5, 150, 105, 0.05);
            }

            .badge-icon {
                font-size: 48px;
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
            }

            .badge-description {
                font-size: var(--font-xs);
                color: var(--color-text-secondary);
                margin-bottom: var(--spacing-sm);
            }

            .badge-date {
                font-size: var(--font-xs);
                color: #059669;
            }

            .badge-action {
                margin-top: var(--spacing-sm);
            }

            .badge-action button {
                padding: var(--spacing-xs) var(--spacing-sm);
                border: 1px solid #059669;
                background: none;
                color: #059669;
                border-radius: var(--radius-md);
                font-size: var(--font-xs);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .badge-action button:hover {
                background-color: #059669;
                color: white;
            }

            .empty-state {
                text-align: center;
                padding: var(--spacing-2xl);
                color: var(--color-text-secondary);
            }

            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--spacing-md);
            }
        </style>

        <div class="ent-tab">
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
    await loadStudents();
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
        listContainer.innerHTML = '<div class="empty-state"><p>Erreur de chargement</p></div>';
    }
}

function renderAnnouncementsList(announcements) {
    const container = document.getElementById('announcements-list');

    if (announcements.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                ${icons.megaphone}
                <p>Aucune annonce</p>
            </div>
        `;
        return;
    }

    container.innerHTML = announcements.map(a => `
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
    `).join('');
}

function showAnnouncementForm(announcement = null) {
    const isEdit = announcement !== null;

    const content = `
        <form id="announcement-form" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <div class="form-group">
                <label>Titre *</label>
                <input type="text" name="title" required value="${announcement?.title || ''}" placeholder="Titre de l'annonce">
            </div>

            <div class="form-group">
                <label>Contenu *</label>
                <textarea name="content" required rows="6" placeholder="Contenu de l'annonce...">${announcement?.content || ''}</textarea>
            </div>

            <div class="form-group">
                <label>Public cible</label>
                <select name="target_audience">
                    <option value="all" ${announcement?.target_audience === 'all' ? 'selected' : ''}>Tous</option>
                    <option value="parents" ${announcement?.target_audience === 'parents' ? 'selected' : ''}>Parents uniquement</option>
                    <option value="students" ${announcement?.target_audience === 'students' ? 'selected' : ''}>Élèves uniquement</option>
                </select>
            </div>

            <div class="form-actions" style="display: flex; gap: var(--spacing-sm); justify-content: flex-end;">
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

    document.getElementById('announcement-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            if (isEdit) {
                await apiService.updateSchoolAnnouncement(announcement.id, data);
                showToast('Annonce modifiée', 'success');
            } else {
                await apiService.createSchoolAnnouncement(data);
                showToast('Annonce créée', 'success');
            }
            closeBottomSheet();
            loadAnnouncements();
        } catch (error) {
            showToast(error.message || 'Erreur', 'error');
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
        showToast('Erreur de chargement', 'error');
    }
};

window.deleteAnnouncement = async (id) => {
    if (!confirm('Supprimer cette annonce ?')) return;

    try {
        await apiService.deleteSchoolAnnouncement(id);
        showToast('Annonce supprimée', 'success');
        loadAnnouncements();
    } catch (error) {
        showToast(error.message || 'Erreur', 'error');
    }
};

window.publishAnnouncement = async (id) => {
    try {
        await apiService.publishSchoolAnnouncement(id);
        showToast('Annonce publiée', 'success');
        loadAnnouncements();
    } catch (error) {
        showToast(error.message || 'Erreur', 'error');
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
                    <div class="empty-state">
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
        container.innerHTML = '<div class="empty-state"><p>Erreur de chargement</p></div>';
    }
}

function renderConversation(messages) {
    const container = document.getElementById('conversation-messages');

    if (messages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
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
            recipient_id: selectedStudentId, // Will be resolved server-side
            student_id: selectedStudentId,
            content
        });
        input.value = '';
        await loadConversation(selectedStudentId);
    } catch (error) {
        showToast(error.message || 'Erreur d\'envoi', 'error');
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
                <div class="empty-state" style="grid-column: 1 / -1;">
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
            <div class="empty-state" style="grid-column: 1 / -1;">
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

    const earnedNames = studentEarnedBadges.map(b => b.milestone_name);

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
        showToast('Badge attribué', 'success');
        window.loadStudentBadges();
    } catch (error) {
        showToast(error.message || 'Erreur', 'error');
    }
};
