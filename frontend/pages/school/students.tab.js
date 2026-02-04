import apiService from '../../services/api.service.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';
import { createStudentCard, initStudentCardStyles } from '../../components/school/studentCard.js';
import { refreshSchoolStats } from './school.js';

let students = [];
let adherents = [];
let currentFilters = { status: 'actif' };

export async function renderStudentsTab(container) {
    container.innerHTML = `
        <style>
            .students-toolbar {
                display: flex;
                flex-wrap: wrap;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
                align-items: center;
            }

            .students-search {
                flex: 1;
                min-width: 200px;
            }

            .students-search input {
                width: 100%;
                padding: var(--spacing-sm) var(--spacing-md);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                font-size: var(--font-base);
                background-color: var(--color-input-bg);
            }

            .students-filters {
                display: flex;
                gap: var(--spacing-xs);
                flex-wrap: wrap;
            }

            .filter-btn {
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--radius-md);
                font-size: var(--font-sm);
                color: var(--color-text-secondary);
                border: 1px solid var(--color-border);
                background: var(--color-card-bg);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .filter-btn:hover {
                border-color: #059669;
                color: #059669;
            }

            .filter-btn.active {
                background-color: #059669;
                color: white;
                border-color: #059669;
            }

            .students-grid {
                display: grid;
                gap: var(--spacing-md);
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            }

            .students-empty {
                text-align: center;
                padding: var(--spacing-2xl);
                color: var(--color-text-muted);
            }

            .add-student-btn {
                padding: var(--spacing-sm) var(--spacing-lg);
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                color: white;
                border: none;
                border-radius: var(--radius-md);
                font-weight: var(--font-medium);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .add-student-btn:hover {
                transform: translateY(-1px);
                box-shadow: var(--shadow-md);
            }
        </style>

        <div class="students-toolbar">
            <div class="students-search">
                <input type="text" placeholder="Rechercher un élève..." id="student-search">
            </div>
            <div class="students-filters">
                <button class="filter-btn active" data-status="actif">Actifs</button>
                <button class="filter-btn" data-status="">Tous</button>
                <button class="filter-btn" data-status="inactif">Inactifs</button>
                <button class="filter-btn" data-status="diplome">Diplômés</button>
            </div>
            <button class="add-student-btn" id="add-student-btn">+ Nouvel élève</button>
        </div>

        <div class="students-grid" id="students-grid">
            <div class="loading">Chargement...</div>
        </div>
    `;

    // Load adherents for parent selection
    loadAdherents();

    // Event handlers
    document.getElementById('student-search').addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
        loadStudents();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilters.status = btn.dataset.status;
            loadStudents();
        });
    });

    document.getElementById('add-student-btn').addEventListener('click', () => {
        openStudentForm();
    });

    loadStudents();
}

async function loadAdherents() {
    try {
        const response = await apiService.getAdherents({ status: 'actif', limit: 200 });
        if (response.success) {
            adherents = response.data.adherents || response.data || [];
        }
    } catch (error) {
        console.error('Error loading adherents:', error);
    }
}

async function loadStudents() {
    const grid = document.getElementById('students-grid');
    grid.innerHTML = '<div class="loading">Chargement...</div>';

    try {
        const response = await apiService.getStudents(currentFilters);

        if (response.success) {
            students = response.data.students || response.data || [];

            if (students.length === 0) {
                grid.innerHTML = `
                    <div class="students-empty">
                        <p>Aucun élève trouvé</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = '';
            initStudentCardStyles();

            students.forEach(student => {
                const card = createStudentCard(student, {
                    onClick: (s) => openStudentDetail(s)
                });
                grid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading students:', error);
        grid.innerHTML = '<div class="students-empty"><p>Erreur de chargement</p></div>';
    }
}

function openStudentForm(student = null) {
    const isEdit = !!student;

    const parentOptions = adherents.map(a =>
        `<option value="${a.id}" ${student?.parent_id === a.id ? 'selected' : ''}>
            ${a.first_name} ${a.last_name}
        </option>`
    ).join('');

    openBottomSheet({
        title: isEdit ? 'Modifier élève' : 'Nouvel élève',
        content: `
            <form id="student-form" class="form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Prénom *</label>
                        <input type="text" name="first_name" class="form-input" required value="${student?.first_name || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nom *</label>
                        <input type="text" name="last_name" class="form-input" required value="${student?.last_name || ''}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date de naissance</label>
                        <input type="date" name="birth_date" class="form-input" value="${student?.birth_date?.split('T')[0] || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Genre</label>
                        <select name="gender" class="form-select">
                            <option value="M" ${student?.gender === 'M' ? 'selected' : ''}>Garçon</option>
                            <option value="F" ${student?.gender === 'F' ? 'selected' : ''}>Fille</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Niveau</label>
                    <select name="level" class="form-select">
                        <option value="debutant" ${student?.level === 'debutant' ? 'selected' : ''}>Débutant</option>
                        <option value="intermediaire" ${student?.level === 'intermediaire' ? 'selected' : ''}>Intermédiaire</option>
                        <option value="avance" ${student?.level === 'avance' ? 'selected' : ''}>Avancé</option>
                    </select>
                </div>

                <div class="form-divider"><span>Représentant légal</span></div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Parent (adhérent)</label>
                        <select name="parent_id" class="form-select">
                            <option value="">-- Sélectionner --</option>
                            ${parentOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Relation</label>
                        <select name="parent_relation" class="form-select">
                            <option value="pere" ${student?.parent_relation === 'pere' ? 'selected' : ''}>Père</option>
                            <option value="mere" ${student?.parent_relation === 'mere' ? 'selected' : ''}>Mère</option>
                            <option value="tuteur" ${student?.parent_relation === 'tuteur' ? 'selected' : ''}>Tuteur</option>
                            <option value="autre" ${student?.parent_relation === 'autre' ? 'selected' : ''}>Autre</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Contact urgence (nom)</label>
                        <input type="text" name="emergency_name" class="form-input" value="${student?.emergency_name || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Contact urgence (tél)</label>
                        <input type="tel" name="emergency_contact" class="form-input" value="${student?.emergency_contact || ''}">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea name="notes" class="form-textarea" rows="3">${student?.notes || ''}</textarea>
                </div>

                ${isEdit ? `
                    <div class="form-group">
                        <label class="form-label">Statut</label>
                        <select name="status" class="form-select">
                            <option value="actif" ${student?.status === 'actif' ? 'selected' : ''}>Actif</option>
                            <option value="inactif" ${student?.status === 'inactif' ? 'selected' : ''}>Inactif</option>
                            <option value="diplome" ${student?.status === 'diplome' ? 'selected' : ''}>Diplômé</option>
                            <option value="transfere" ${student?.status === 'transfere' ? 'selected' : ''}>Transféré</option>
                        </select>
                    </div>
                ` : ''}
            </form>
        `,
        footer: `
            <button type="button" class="btn btn-secondary" id="cancel-student">Annuler</button>
            <button type="submit" form="student-form" class="btn btn-primary">${isEdit ? 'Modifier' : 'Créer'}</button>
        `
    });

    document.getElementById('cancel-student').addEventListener('click', closeBottomSheet);

    document.getElementById('student-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Convert empty strings to null
        Object.keys(data).forEach(key => {
            if (data[key] === '') data[key] = null;
        });

        try {
            let response;
            if (isEdit) {
                response = await apiService.updateStudent(student.id, data);
            } else {
                response = await apiService.createStudent(data);
            }

            if (response.success) {
                toastSuccess(isEdit ? 'Élève modifié' : 'Élève créé');
                closeBottomSheet();
                loadStudents();
                refreshSchoolStats();
            } else {
                toastError(response.message || 'Erreur');
            }
        } catch (error) {
            toastError(error.message || 'Erreur');
        }
    });
}

async function openStudentDetail(student) {
    try {
        const response = await apiService.getStudent(student.id);
        if (!response.success) {
            toastError('Erreur chargement élève');
            return;
        }

        const fullStudent = response.data;

        const levelLabels = {
            debutant: 'Débutant',
            intermediaire: 'Intermédiaire',
            avance: 'Avancé'
        };

        const relationLabels = {
            pere: 'Père',
            mere: 'Mère',
            tuteur: 'Tuteur',
            autre: 'Autre'
        };

        openBottomSheet({
            title: `${fullStudent.first_name} ${fullStudent.last_name}`,
            content: `
                <div class="student-detail">
                    <div class="detail-section">
                        <h4>Informations</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">N° élève</span>
                                <span class="detail-value">${fullStudent.student_number}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Niveau</span>
                                <span class="detail-value">${levelLabels[fullStudent.level] || fullStudent.level}</span>
                            </div>
                            ${fullStudent.birth_date ? `
                                <div class="detail-item">
                                    <span class="detail-label">Date de naissance</span>
                                    <span class="detail-value">${new Date(fullStudent.birth_date).toLocaleDateString('fr-FR')}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    ${fullStudent.parent_name ? `
                        <div class="detail-section">
                            <h4>Représentant légal</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <span class="detail-label">${relationLabels[fullStudent.parent_relation] || 'Parent'}</span>
                                    <span class="detail-value">${fullStudent.parent_name}</span>
                                </div>
                                ${fullStudent.parent_phone ? `
                                    <div class="detail-item">
                                        <span class="detail-label">Téléphone</span>
                                        <span class="detail-value">${fullStudent.parent_phone}</span>
                                    </div>
                                ` : ''}
                                ${fullStudent.parent_email ? `
                                    <div class="detail-item">
                                        <span class="detail-label">Email</span>
                                        <span class="detail-value">${fullStudent.parent_email}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}

                    ${fullStudent.classes && fullStudent.classes.length > 0 ? `
                        <div class="detail-section">
                            <h4>Classes inscrites</h4>
                            <div class="detail-list">
                                ${fullStudent.classes.map(c => `
                                    <div class="detail-list-item">
                                        <span>${c.name}</span>
                                        <span class="text-muted">${c.subject}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${fullStudent.recentEvaluations && fullStudent.recentEvaluations.length > 0 ? `
                        <div class="detail-section">
                            <h4>Dernières évaluations</h4>
                            <div class="detail-list">
                                ${fullStudent.recentEvaluations.map(e => `
                                    <div class="detail-list-item">
                                        <span>${e.class_name} - ${e.type}</span>
                                        <span class="text-muted">${e.score}/${e.max_score}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `,
            footer: `
                <button type="button" class="btn btn-secondary" id="close-detail">Fermer</button>
                <button type="button" class="btn btn-primary" id="edit-student">Modifier</button>
                <button type="button" class="btn btn-danger" id="delete-student">Supprimer</button>
            `
        });

        document.getElementById('close-detail').addEventListener('click', closeBottomSheet);

        document.getElementById('edit-student').addEventListener('click', () => {
            closeBottomSheet();
            setTimeout(() => openStudentForm(fullStudent), 300);
        });

        document.getElementById('delete-student').addEventListener('click', async () => {
            if (confirm('Supprimer cet élève ?')) {
                try {
                    const res = await apiService.deleteStudent(fullStudent.id);
                    if (res.success) {
                        toastSuccess('Élève supprimé');
                        closeBottomSheet();
                        loadStudents();
                        refreshSchoolStats();
                    } else {
                        toastError(res.message);
                    }
                } catch (error) {
                    toastError(error.message);
                }
            }
        });

    } catch (error) {
        toastError('Erreur chargement détails');
    }
}
