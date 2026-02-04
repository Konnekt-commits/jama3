import apiService from '../../services/api.service.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';

const icons = {
    plus: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    file: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
    video: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`,
    link: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    audio: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`
};

const contentTypeIcons = {
    pdf: icons.file,
    video: icons.video,
    link: icons.link,
    document: icons.file,
    audio: icons.audio
};

let currentPrograms = [];
let currentClasses = [];

export async function renderProgramsTab(container) {
    container.innerHTML = `
        <style>
            .programs-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
            }

            .programs-filters {
                display: flex;
                gap: var(--spacing-sm);
                flex-wrap: wrap;
            }

            .programs-filters select {
                padding: var(--spacing-sm) var(--spacing-md);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                background-color: var(--color-input-bg);
                font-size: var(--font-sm);
                color: var(--color-text-primary);
            }

            .programs-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: var(--spacing-md);
            }

            .program-card {
                background-color: var(--color-card-bg);
                border-radius: var(--radius-lg);
                border: 1px solid var(--color-card-border);
                overflow: hidden;
                transition: all var(--transition-fast);
            }

            .program-card:hover {
                box-shadow: var(--shadow-md);
                transform: translateY(-2px);
            }

            .program-card-header {
                padding: var(--spacing-md);
                background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%);
                color: var(--color-white);
            }

            .program-card-title {
                font-size: var(--font-lg);
                font-weight: var(--font-semibold);
                margin-bottom: var(--spacing-xs);
            }

            .program-card-class {
                font-size: var(--font-sm);
                opacity: 0.9;
            }

            .program-card-body {
                padding: var(--spacing-md);
            }

            .program-objectives {
                font-size: var(--font-sm);
                color: var(--color-text-secondary);
                margin-bottom: var(--spacing-md);
            }

            .program-content-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }

            .program-content-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-sm);
                background-color: var(--color-bg-secondary);
                border-radius: var(--radius-md);
                font-size: var(--font-sm);
            }

            .program-content-item svg {
                color: var(--color-primary);
                flex-shrink: 0;
            }

            .program-content-item a {
                color: var(--color-text-primary);
                text-decoration: none;
                flex: 1;
            }

            .program-content-item a:hover {
                color: var(--color-primary);
            }

            .program-card-footer {
                padding: var(--spacing-md);
                border-top: 1px solid var(--color-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .program-status {
                font-size: var(--font-xs);
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--radius-full);
                font-weight: var(--font-medium);
            }

            .program-status.active {
                background-color: var(--color-badge-actif);
                color: var(--color-badge-actif-text);
            }

            .program-status.draft {
                background-color: var(--color-badge-pending);
                color: var(--color-badge-pending-text);
            }

            .program-actions {
                display: flex;
                gap: var(--spacing-xs);
            }

            .program-actions button {
                padding: var(--spacing-xs);
                border: none;
                background: none;
                cursor: pointer;
                color: var(--color-text-secondary);
                border-radius: var(--radius-sm);
                transition: all var(--transition-fast);
            }

            .program-actions button:hover {
                background-color: var(--color-bg-hover);
                color: var(--color-text-primary);
            }

            .program-actions button.delete:hover {
                color: var(--color-error);
            }

            .programs-empty {
                text-align: center;
                padding: var(--spacing-2xl);
                color: var(--color-text-muted);
                grid-column: 1 / -1;
            }

            .programs-empty svg {
                width: 64px;
                height: 64px;
                margin-bottom: var(--spacing-md);
                opacity: 0.3;
            }
        </style>

        <div class="programs-header">
            <div class="programs-filters">
                <select id="filter-class">
                    <option value="">Toutes les classes</option>
                </select>
                <select id="filter-status">
                    <option value="">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="draft">Brouillon</option>
                </select>
            </div>
            <button class="btn btn-primary" id="add-program-btn">
                ${icons.plus}
                <span>Nouveau programme</span>
            </button>
        </div>

        <div class="programs-grid" id="programs-list">
            <div class="loading-spinner"></div>
        </div>
    `;

    // Load data
    await loadClasses();
    await loadPrograms();

    // Event listeners
    document.getElementById('add-program-btn').addEventListener('click', () => showProgramForm());
    document.getElementById('filter-class').addEventListener('change', loadPrograms);
    document.getElementById('filter-status').addEventListener('change', loadPrograms);
}

async function loadClasses() {
    try {
        const response = await apiService.getSchoolClasses();
        if (response.success) {
            currentClasses = response.data;
            const select = document.getElementById('filter-class');
            currentClasses.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = c.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

async function loadPrograms() {
    const listContainer = document.getElementById('programs-list');
    listContainer.innerHTML = '<div class="loading-spinner"></div>';

    const filters = {
        class_id: document.getElementById('filter-class').value || undefined,
        status: document.getElementById('filter-status').value || undefined
    };

    try {
        const response = await apiService.getPrograms(filters);
        if (response.success) {
            currentPrograms = response.data;
            renderProgramsList(currentPrograms);
        }
    } catch (error) {
        console.error('Error loading programs:', error);
        listContainer.innerHTML = '<div class="programs-empty"><p>Erreur de chargement</p></div>';
    }
}

function renderProgramsList(programs) {
    const container = document.getElementById('programs-list');

    if (programs.length === 0) {
        container.innerHTML = `
            <div class="programs-empty">
                ${icons.file}
                <p>Aucun programme trouvé</p>
                <p>Créez votre premier programme pédagogique</p>
            </div>
        `;
        return;
    }

    container.innerHTML = programs.map(program => `
        <div class="program-card" data-id="${program.id}">
            <div class="program-card-header">
                <div class="program-card-title">${program.title}</div>
                <div class="program-card-class">${program.class_name || 'Classe non définie'}</div>
            </div>
            <div class="program-card-body">
                ${program.objectives ? `
                    <div class="program-objectives">
                        <strong>Objectifs:</strong> ${program.objectives.substring(0, 150)}${program.objectives.length > 150 ? '...' : ''}
                    </div>
                ` : ''}
                <div class="program-content-list">
                    ${(program.content || []).slice(0, 3).map(content => `
                        <div class="program-content-item">
                            ${contentTypeIcons[content.content_type] || icons.file}
                            <a href="${content.url || '#'}" target="_blank">${content.title}</a>
                        </div>
                    `).join('')}
                    ${(program.content || []).length > 3 ? `
                        <div class="program-content-item" style="justify-content: center; color: var(--color-text-muted);">
                            + ${(program.content || []).length - 3} autres ressources
                        </div>
                    ` : ''}
                    ${!program.content || program.content.length === 0 ? `
                        <div class="program-content-item" style="justify-content: center; color: var(--color-text-muted);">
                            Aucun contenu ajouté
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="program-card-footer">
                <span class="program-status ${program.status || 'draft'}">${program.status === 'active' ? 'Actif' : 'Brouillon'}</span>
                <div class="program-actions">
                    <button class="edit" title="Modifier" onclick="window.editProgram(${program.id})">
                        ${icons.edit}
                    </button>
                    <button class="delete" title="Supprimer" onclick="window.deleteProgram(${program.id})">
                        ${icons.trash}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function showProgramForm(program = null) {
    const isEdit = program !== null;

    const content = `
        <form class="form-group" id="program-form" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <div class="form-group">
                <label class="form-label">Titre du programme *</label>
                <input type="text" name="title" class="form-input" required value="${program?.title || ''}" placeholder="Ex: Programme Coran Niveau 1">
            </div>

            <div class="form-group">
                <label class="form-label">Classe *</label>
                <select name="class_id" class="form-select" required>
                    <option value="">Sélectionner une classe</option>
                    ${currentClasses.map(c => `
                        <option value="${c.id}" ${program?.class_id === c.id ? 'selected' : ''}>${c.name}</option>
                    `).join('')}
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Objectifs pédagogiques</label>
                <textarea name="objectives" class="form-textarea" rows="3" placeholder="Décrire les objectifs du programme...">${program?.objectives || ''}</textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea name="description" class="form-textarea" rows="3" placeholder="Description détaillée du programme...">${program?.description || ''}</textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Statut</label>
                <select name="status" class="form-select">
                    <option value="draft" ${program?.status === 'draft' ? 'selected' : ''}>Brouillon</option>
                    <option value="active" ${program?.status === 'active' ? 'selected' : ''}>Actif</option>
                </select>
            </div>

            <div style="display: flex; gap: var(--spacing-sm); justify-content: flex-end; margin-top: var(--spacing-md);">
                <button type="button" class="btn btn-secondary" onclick="window.closeBottomSheet()">Annuler</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Modifier' : 'Créer'}</button>
            </div>
        </form>
    `;

    openBottomSheet({
        title: isEdit ? 'Modifier le programme' : 'Nouveau programme',
        content
    });

    window.closeBottomSheet = closeBottomSheet;

    document.getElementById('program-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            if (isEdit) {
                await apiService.updateProgram(program.id, data);
                toastSuccess('Programme modifié');
            } else {
                await apiService.createProgram(data);
                toastSuccess('Programme créé');
            }
            closeBottomSheet();
            loadPrograms();
        } catch (error) {
            toastError(error.message || 'Erreur');
        }
    });
}

window.editProgram = async (id) => {
    try {
        const response = await apiService.getProgram(id);
        if (response.success) {
            showProgramForm(response.data);
        }
    } catch (error) {
        toastError('Erreur de chargement');
    }
};

window.deleteProgram = async (id) => {
    if (!confirm('Supprimer ce programme et tous ses contenus ?')) return;

    try {
        await apiService.deleteProgram(id);
        toastSuccess('Programme supprimé');
        loadPrograms();
    } catch (error) {
        toastError(error.message || 'Erreur');
    }
};
