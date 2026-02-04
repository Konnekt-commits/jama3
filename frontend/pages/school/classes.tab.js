import apiService from '../../services/api.service.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';
import { createClassCard, initClassCardStyles } from '../../components/school/classCard.js';
import { refreshSchoolStats } from './school.js';

let classes = [];
let intervenants = [];
let students = [];
let currentFilters = { status: 'active' };

export async function renderClassesTab(container) {
    container.innerHTML = `
        <style>
            .classes-toolbar {
                display: flex;
                flex-wrap: wrap;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
                align-items: center;
            }

            .classes-filters {
                display: flex;
                gap: var(--spacing-xs);
                flex-wrap: wrap;
                flex: 1;
            }

            .subject-filter {
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--radius-md);
                font-size: var(--font-sm);
                color: var(--color-text-secondary);
                border: 1px solid var(--color-border);
                background: var(--color-card-bg);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .subject-filter:hover {
                border-color: #059669;
                color: #059669;
            }

            .subject-filter.active {
                background-color: #059669;
                color: white;
                border-color: #059669;
            }

            .classes-grid {
                display: grid;
                gap: var(--spacing-md);
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            }

            .classes-empty {
                text-align: center;
                padding: var(--spacing-2xl);
                color: var(--color-text-muted);
            }

            .add-class-btn {
                padding: var(--spacing-sm) var(--spacing-lg);
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                color: white;
                border: none;
                border-radius: var(--radius-md);
                font-weight: var(--font-medium);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .add-class-btn:hover {
                transform: translateY(-1px);
                box-shadow: var(--shadow-md);
            }
        </style>

        <div class="classes-toolbar">
            <div class="classes-filters">
                <button class="subject-filter active" data-subject="">Toutes</button>
                <button class="subject-filter" data-subject="coran">Coran</button>
                <button class="subject-filter" data-subject="arabe">Arabe</button>
                <button class="subject-filter" data-subject="fiqh">Fiqh</button>
                <button class="subject-filter" data-subject="sira">Sira</button>
                <button class="subject-filter" data-subject="doua">Doua</button>
            </div>
            <button class="add-class-btn" id="add-class-btn">+ Nouvelle classe</button>
        </div>

        <div class="classes-grid" id="classes-grid">
            <div class="loading">Chargement...</div>
        </div>
    `;

    // Load intervenants and students for forms
    loadIntervenants();
    loadStudentsForEnrollment();

    // Event handlers
    document.querySelectorAll('.subject-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.subject-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilters.subject = btn.dataset.subject;
            loadClasses();
        });
    });

    document.getElementById('add-class-btn').addEventListener('click', () => {
        openClassForm();
    });

    loadClasses();
}

async function loadIntervenants() {
    try {
        const response = await apiService.getIntervenants({ is_active: true });
        if (response.success) {
            intervenants = response.data || [];
        }
    } catch (error) {
        console.error('Error loading intervenants:', error);
    }
}

async function loadStudentsForEnrollment() {
    try {
        const response = await apiService.getStudents({ status: 'actif', limit: 200 });
        if (response.success) {
            students = response.data.students || response.data || [];
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

async function loadClasses() {
    const grid = document.getElementById('classes-grid');
    grid.innerHTML = '<div class="loading">Chargement...</div>';

    try {
        const response = await apiService.getSchoolClasses(currentFilters);

        if (response.success) {
            classes = response.data || [];

            if (classes.length === 0) {
                grid.innerHTML = `
                    <div class="classes-empty">
                        <p>Aucune classe trouvée</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = '';
            initClassCardStyles();

            classes.forEach(schoolClass => {
                const card = createClassCard(schoolClass, {
                    onClick: (c) => openClassDetail(c)
                });
                grid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading classes:', error);
        grid.innerHTML = '<div class="classes-empty"><p>Erreur de chargement</p></div>';
    }
}

function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    if (month >= 9) {
        return `${year}-${year + 1}`;
    }
    return `${year - 1}-${year}`;
}

function openClassForm(schoolClass = null) {
    const isEdit = !!schoolClass;

    const teacherOptions = intervenants.map(i =>
        `<option value="${i.id}" ${schoolClass?.teacher_id === i.id ? 'selected' : ''}>
            ${i.first_name} ${i.last_name}
        </option>`
    ).join('');

    let schedule = { jour: '', heure_debut: '', heure_fin: '' };
    if (schoolClass?.schedule) {
        try {
            schedule = typeof schoolClass.schedule === 'string' ? JSON.parse(schoolClass.schedule) : schoolClass.schedule;
        } catch (e) {}
    }

    openBottomSheet({
        title: isEdit ? 'Modifier classe' : 'Nouvelle classe',
        content: `
            <form id="class-form" class="form">
                <div class="form-group">
                    <label class="form-label">Nom de la classe *</label>
                    <input type="text" name="name" class="form-input" required value="${schoolClass?.name || ''}" placeholder="Ex: Classe Coran Niveau 1">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Matière *</label>
                        <select name="subject" class="form-select" required>
                            <option value="">-- Sélectionner --</option>
                            <option value="coran" ${schoolClass?.subject === 'coran' ? 'selected' : ''}>Coran</option>
                            <option value="arabe" ${schoolClass?.subject === 'arabe' ? 'selected' : ''}>Arabe</option>
                            <option value="fiqh" ${schoolClass?.subject === 'fiqh' ? 'selected' : ''}>Fiqh</option>
                            <option value="sira" ${schoolClass?.subject === 'sira' ? 'selected' : ''}>Sira</option>
                            <option value="doua" ${schoolClass?.subject === 'doua' ? 'selected' : ''}>Doua</option>
                            <option value="autre" ${schoolClass?.subject === 'autre' ? 'selected' : ''}>Autre</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Niveau</label>
                        <select name="level" class="form-select">
                            <option value="debutant" ${schoolClass?.level === 'debutant' ? 'selected' : ''}>Débutant</option>
                            <option value="intermediaire" ${schoolClass?.level === 'intermediaire' ? 'selected' : ''}>Intermédiaire</option>
                            <option value="avance" ${schoolClass?.level === 'avance' ? 'selected' : ''}>Avancé</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Enseignant</label>
                    <select name="teacher_id" class="form-select">
                        <option value="">-- Sélectionner --</option>
                        ${teacherOptions}
                    </select>
                </div>

                <div class="form-divider"><span>Horaires</span></div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Jour</label>
                        <select name="schedule_jour" class="form-select">
                            <option value="">-- Sélectionner --</option>
                            <option value="Lundi" ${schedule.jour === 'Lundi' ? 'selected' : ''}>Lundi</option>
                            <option value="Mardi" ${schedule.jour === 'Mardi' ? 'selected' : ''}>Mardi</option>
                            <option value="Mercredi" ${schedule.jour === 'Mercredi' ? 'selected' : ''}>Mercredi</option>
                            <option value="Jeudi" ${schedule.jour === 'Jeudi' ? 'selected' : ''}>Jeudi</option>
                            <option value="Vendredi" ${schedule.jour === 'Vendredi' ? 'selected' : ''}>Vendredi</option>
                            <option value="Samedi" ${schedule.jour === 'Samedi' ? 'selected' : ''}>Samedi</option>
                            <option value="Dimanche" ${schedule.jour === 'Dimanche' ? 'selected' : ''}>Dimanche</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Heure début</label>
                        <input type="time" name="schedule_heure_debut" class="form-input" value="${schedule.heure_debut || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Heure fin</label>
                        <input type="time" name="schedule_heure_fin" class="form-input" value="${schedule.heure_fin || ''}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Salle</label>
                        <input type="text" name="room" class="form-input" value="${schoolClass?.room || ''}" placeholder="Ex: Salle 1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Capacité max</label>
                        <input type="number" name="max_capacity" class="form-input" value="${schoolClass?.max_capacity || 20}" min="1">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Année scolaire</label>
                    <input type="text" name="academic_year" class="form-input" value="${schoolClass?.academic_year || getCurrentAcademicYear()}" placeholder="2024-2025">
                </div>

                ${isEdit ? `
                    <div class="form-group">
                        <label class="form-label">Statut</label>
                        <select name="status" class="form-select">
                            <option value="active" ${schoolClass?.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${schoolClass?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                            <option value="archived" ${schoolClass?.status === 'archived' ? 'selected' : ''}>Archivée</option>
                        </select>
                    </div>
                ` : ''}
            </form>
        `,
        footer: `
            <button type="button" class="btn btn-secondary" id="cancel-class">Annuler</button>
            <button type="submit" form="class-form" class="btn btn-primary">${isEdit ? 'Modifier' : 'Créer'}</button>
        `
    });

    document.getElementById('cancel-class').addEventListener('click', closeBottomSheet);

    document.getElementById('class-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Build schedule object
        data.schedule = {
            jour: data.schedule_jour,
            heure_debut: data.schedule_heure_debut,
            heure_fin: data.schedule_heure_fin
        };
        delete data.schedule_jour;
        delete data.schedule_heure_debut;
        delete data.schedule_heure_fin;

        // Convert empty strings to null
        Object.keys(data).forEach(key => {
            if (data[key] === '' && key !== 'schedule') data[key] = null;
        });

        try {
            let response;
            if (isEdit) {
                response = await apiService.updateSchoolClass(schoolClass.id, data);
            } else {
                response = await apiService.createSchoolClass(data);
            }

            if (response.success) {
                toastSuccess(isEdit ? 'Classe modifiée' : 'Classe créée');
                closeBottomSheet();
                loadClasses();
                refreshSchoolStats();
            } else {
                toastError(response.message || 'Erreur');
            }
        } catch (error) {
            toastError(error.message || 'Erreur');
        }
    });
}

async function openClassDetail(schoolClass) {
    try {
        const response = await apiService.getSchoolClass(schoolClass.id);
        if (!response.success) {
            toastError('Erreur chargement classe');
            return;
        }

        const fullClass = response.data;

        const subjectLabels = {
            coran: 'Coran', arabe: 'Arabe', fiqh: 'Fiqh',
            sira: 'Sira', doua: 'Doua', autre: 'Autre'
        };

        const levelLabels = {
            debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé'
        };

        let scheduleText = '';
        if (fullClass.schedule) {
            try {
                const schedule = typeof fullClass.schedule === 'string' ? JSON.parse(fullClass.schedule) : fullClass.schedule;
                if (schedule.jour) {
                    scheduleText = `${schedule.jour} ${schedule.heure_debut || ''}${schedule.heure_fin ? '-' + schedule.heure_fin : ''}`;
                }
            } catch (e) {}
        }

        const enrolledStudents = fullClass.students || [];
        const notEnrolledStudents = students.filter(s => !enrolledStudents.find(e => e.id === s.id));

        openBottomSheet({
            title: fullClass.name,
            content: `
                <div class="class-detail">
                    <div class="detail-section">
                        <h4>Informations</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Matière</span>
                                <span class="detail-value">${subjectLabels[fullClass.subject] || fullClass.subject}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Niveau</span>
                                <span class="detail-value">${levelLabels[fullClass.level] || fullClass.level}</span>
                            </div>
                            ${fullClass.teacher_name ? `
                                <div class="detail-item">
                                    <span class="detail-label">Enseignant</span>
                                    <span class="detail-value">${fullClass.teacher_name}</span>
                                </div>
                            ` : ''}
                            ${scheduleText ? `
                                <div class="detail-item">
                                    <span class="detail-label">Horaire</span>
                                    <span class="detail-value">${scheduleText}</span>
                                </div>
                            ` : ''}
                            ${fullClass.room ? `
                                <div class="detail-item">
                                    <span class="detail-label">Salle</span>
                                    <span class="detail-value">${fullClass.room}</span>
                                </div>
                            ` : ''}
                            <div class="detail-item">
                                <span class="detail-label">Effectif</span>
                                <span class="detail-value">${enrolledStudents.length}/${fullClass.max_capacity || 20}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Élèves inscrits (${enrolledStudents.length})</h4>
                        ${enrolledStudents.length > 0 ? `
                            <div class="detail-list">
                                ${enrolledStudents.map(s => `
                                    <div class="detail-list-item" style="display: flex; justify-content: space-between; align-items: center;">
                                        <span>${s.first_name} ${s.last_name}</span>
                                        <button class="btn btn-sm btn-danger unenroll-btn" data-student-id="${s.id}">Retirer</button>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-muted">Aucun élève inscrit</p>'}
                    </div>

                    ${notEnrolledStudents.length > 0 ? `
                        <div class="detail-section">
                            <h4>Inscrire un élève</h4>
                            <div style="display: flex; gap: var(--spacing-sm);">
                                <select id="enroll-student-select" class="form-select" style="flex: 1;">
                                    <option value="">-- Sélectionner --</option>
                                    ${notEnrolledStudents.map(s => `
                                        <option value="${s.id}">${s.first_name} ${s.last_name}</option>
                                    `).join('')}
                                </select>
                                <button class="btn btn-primary" id="enroll-student-btn">Inscrire</button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `,
            footer: `
                <button type="button" class="btn btn-secondary" id="close-detail">Fermer</button>
                <button type="button" class="btn btn-primary" id="edit-class">Modifier</button>
                <button type="button" class="btn btn-danger" id="delete-class">Supprimer</button>
            `
        });

        document.getElementById('close-detail').addEventListener('click', closeBottomSheet);

        document.getElementById('edit-class').addEventListener('click', () => {
            closeBottomSheet();
            setTimeout(() => openClassForm(fullClass), 300);
        });

        document.getElementById('delete-class').addEventListener('click', async () => {
            if (confirm('Supprimer cette classe ?')) {
                try {
                    const res = await apiService.deleteSchoolClass(fullClass.id);
                    if (res.success) {
                        toastSuccess('Classe supprimée');
                        closeBottomSheet();
                        loadClasses();
                        refreshSchoolStats();
                    } else {
                        toastError(res.message);
                    }
                } catch (error) {
                    toastError(error.message);
                }
            }
        });

        // Enroll student
        document.getElementById('enroll-student-btn')?.addEventListener('click', async () => {
            const studentId = document.getElementById('enroll-student-select').value;
            if (!studentId) {
                toastError('Sélectionnez un élève');
                return;
            }
            try {
                const res = await apiService.enrollStudentInClass(fullClass.id, studentId);
                if (res.success) {
                    toastSuccess('Élève inscrit');
                    closeBottomSheet();
                    loadClasses();
                    setTimeout(() => openClassDetail(fullClass), 300);
                } else {
                    toastError(res.message);
                }
            } catch (error) {
                toastError(error.message);
            }
        });

        // Unenroll students
        document.querySelectorAll('.unenroll-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const studentId = btn.dataset.studentId;
                if (confirm('Retirer cet élève de la classe ?')) {
                    try {
                        const res = await apiService.unenrollStudentFromClass(fullClass.id, studentId);
                        if (res.success) {
                            toastSuccess('Élève retiré');
                            closeBottomSheet();
                            loadClasses();
                            setTimeout(() => openClassDetail(fullClass), 300);
                        } else {
                            toastError(res.message);
                        }
                    } catch (error) {
                        toastError(error.message);
                    }
                }
            });
        });

    } catch (error) {
        toastError('Erreur chargement détails');
    }
}
