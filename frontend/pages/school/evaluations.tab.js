import apiService from '../../services/api.service.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';

let evaluations = [];
let classes = [];
let students = [];
let intervenants = [];
let currentFilters = {};

export async function renderEvaluationsTab(container) {
    container.innerHTML = `
        <style>
            .evaluations-toolbar {
                display: flex;
                flex-wrap: wrap;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
                align-items: center;
            }

            .evaluations-filters {
                display: flex;
                gap: var(--spacing-sm);
                flex-wrap: wrap;
                flex: 1;
            }

            .evaluations-filters select {
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--radius-md);
                font-size: var(--font-sm);
                border: 1px solid var(--color-border);
                background: var(--color-card-bg);
            }

            .add-eval-btn {
                padding: var(--spacing-sm) var(--spacing-lg);
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                color: white;
                border: none;
                border-radius: var(--radius-md);
                font-weight: var(--font-medium);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .evaluations-grid {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }

            .eval-card {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                padding: var(--spacing-md);
                background-color: var(--color-card-bg);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .eval-card:hover {
                box-shadow: var(--shadow-md);
                border-color: #059669;
            }

            .eval-info {
                flex: 1;
            }

            .eval-student {
                font-weight: var(--font-medium);
                margin-bottom: var(--spacing-xs);
            }

            .eval-details {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }

            .eval-score {
                text-align: center;
                min-width: 60px;
            }

            .eval-score-value {
                font-size: var(--font-xl);
                font-weight: var(--font-bold);
            }

            .eval-score-max {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }

            .eval-score.excellent .eval-score-value {
                color: #059669;
            }

            .eval-score.good .eval-score-value {
                color: #2563eb;
            }

            .eval-score.average .eval-score-value {
                color: #d97706;
            }

            .eval-score.poor .eval-score-value {
                color: #dc2626;
            }

            .eval-type {
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--radius-full);
                font-size: var(--font-xs);
                font-weight: var(--font-medium);
                background-color: var(--color-bg-secondary);
            }

            .eval-type.examen {
                background-color: #fee2e2;
                color: #dc2626;
            }

            .eval-type.controle {
                background-color: #dbeafe;
                color: #2563eb;
            }

            .eval-type.oral {
                background-color: #d1fae5;
                color: #059669;
            }

            .eval-type.memorisation {
                background-color: #fef3c7;
                color: #d97706;
            }

            .evaluations-empty {
                text-align: center;
                padding: var(--spacing-2xl);
                color: var(--color-text-muted);
            }
        </style>

        <div class="evaluations-toolbar">
            <div class="evaluations-filters">
                <select id="filter-class">
                    <option value="">Toutes les classes</option>
                </select>
                <select id="filter-type">
                    <option value="">Tous les types</option>
                    <option value="examen">Examen</option>
                    <option value="controle">Contrôle</option>
                    <option value="oral">Oral</option>
                    <option value="memorisation">Mémorisation</option>
                </select>
            </div>
            <button class="add-eval-btn" id="add-eval-btn">+ Nouvelle évaluation</button>
        </div>

        <div class="evaluations-grid" id="evaluations-grid">
            <div class="loading">Chargement...</div>
        </div>
    `;

    // Load data
    await Promise.all([loadClasses(), loadStudents(), loadIntervenants()]);

    // Populate class filter
    const classSelect = document.getElementById('filter-class');
    classes.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        classSelect.appendChild(option);
    });

    // Event handlers
    document.getElementById('filter-class').addEventListener('change', (e) => {
        currentFilters.class_id = e.target.value;
        loadEvaluations();
    });

    document.getElementById('filter-type').addEventListener('change', (e) => {
        currentFilters.type = e.target.value;
        loadEvaluations();
    });

    document.getElementById('add-eval-btn').addEventListener('click', () => openEvaluationForm());

    loadEvaluations();
}

async function loadClasses() {
    try {
        const response = await apiService.getSchoolClasses({ status: 'active' });
        if (response.success) {
            classes = response.data || [];
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

async function loadStudents() {
    try {
        const response = await apiService.getStudents({ status: 'actif', limit: 200 });
        if (response.success) {
            students = response.data.students || response.data || [];
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
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

async function loadEvaluations() {
    const grid = document.getElementById('evaluations-grid');
    grid.innerHTML = '<div class="loading">Chargement...</div>';

    try {
        const response = await apiService.getEvaluations(currentFilters);

        if (response.success) {
            evaluations = response.data || [];

            if (evaluations.length === 0) {
                grid.innerHTML = '<div class="evaluations-empty"><p>Aucune évaluation trouvée</p></div>';
                return;
            }

            grid.innerHTML = '';

            const typeLabels = {
                examen: 'Examen',
                controle: 'Contrôle',
                oral: 'Oral',
                memorisation: 'Mémorisation'
            };

            evaluations.forEach(evaluation => {
                const percentage = evaluation.score && evaluation.max_score
                    ? (evaluation.score / evaluation.max_score) * 100
                    : null;

                let scoreClass = '';
                if (percentage !== null) {
                    if (percentage >= 80) scoreClass = 'excellent';
                    else if (percentage >= 60) scoreClass = 'good';
                    else if (percentage >= 40) scoreClass = 'average';
                    else scoreClass = 'poor';
                }

                const card = document.createElement('div');
                card.className = 'eval-card';
                card.innerHTML = `
                    <div class="eval-info">
                        <div class="eval-student">${evaluation.first_name} ${evaluation.last_name}</div>
                        <div class="eval-details">
                            ${evaluation.class_name} • ${new Date(evaluation.evaluation_date).toLocaleDateString('fr-FR')}
                            ${evaluation.subject_detail ? `• ${evaluation.subject_detail}` : ''}
                        </div>
                    </div>
                    <span class="eval-type ${evaluation.type}">${typeLabels[evaluation.type] || evaluation.type}</span>
                    ${evaluation.score !== null ? `
                        <div class="eval-score ${scoreClass}">
                            <div class="eval-score-value">${evaluation.score}</div>
                            <div class="eval-score-max">/${evaluation.max_score}</div>
                        </div>
                    ` : ''}
                `;

                card.addEventListener('click', () => openEvaluationDetail(evaluation));
                grid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading evaluations:', error);
        grid.innerHTML = '<div class="evaluations-empty"><p>Erreur de chargement</p></div>';
    }
}

function openEvaluationForm(evaluation = null) {
    const isEdit = !!evaluation;

    const classOptions = classes.map(c =>
        `<option value="${c.id}" ${evaluation?.class_id === c.id ? 'selected' : ''}>
            ${c.name}
        </option>`
    ).join('');

    const studentOptions = students.map(s =>
        `<option value="${s.id}" ${evaluation?.student_id === s.id ? 'selected' : ''}>
            ${s.first_name} ${s.last_name}
        </option>`
    ).join('');

    const evaluatorOptions = intervenants.map(i =>
        `<option value="${i.id}" ${evaluation?.evaluated_by === i.id ? 'selected' : ''}>
            ${i.first_name} ${i.last_name}
        </option>`
    ).join('');

    openBottomSheet({
        title: isEdit ? 'Modifier évaluation' : 'Nouvelle évaluation',
        content: `
            <form id="eval-form" class="form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Classe *</label>
                        <select name="class_id" class="form-select" required>
                            <option value="">-- Sélectionner --</option>
                            ${classOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Élève *</label>
                        <select name="student_id" class="form-select" required>
                            <option value="">-- Sélectionner --</option>
                            ${studentOptions}
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date *</label>
                        <input type="date" name="evaluation_date" class="form-input" required value="${evaluation?.evaluation_date?.split('T')[0] || new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <select name="type" class="form-select">
                            <option value="controle" ${evaluation?.type === 'controle' ? 'selected' : ''}>Contrôle</option>
                            <option value="examen" ${evaluation?.type === 'examen' ? 'selected' : ''}>Examen</option>
                            <option value="oral" ${evaluation?.type === 'oral' ? 'selected' : ''}>Oral</option>
                            <option value="memorisation" ${evaluation?.type === 'memorisation' ? 'selected' : ''}>Mémorisation</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Sujet/Détail</label>
                    <input type="text" name="subject_detail" class="form-input" value="${evaluation?.subject_detail || ''}" placeholder="Ex: Sourate Al-Fatiha">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Note</label>
                        <input type="number" name="score" class="form-input" value="${evaluation?.score || ''}" step="0.5" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Note max</label>
                        <input type="number" name="max_score" class="form-input" value="${evaluation?.max_score || 20}" step="1" min="1">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Niveau atteint</label>
                    <select name="level_achieved" class="form-select">
                        <option value="">-- Non défini --</option>
                        <option value="debutant" ${evaluation?.level_achieved === 'debutant' ? 'selected' : ''}>Débutant</option>
                        <option value="intermediaire" ${evaluation?.level_achieved === 'intermediaire' ? 'selected' : ''}>Intermédiaire</option>
                        <option value="avance" ${evaluation?.level_achieved === 'avance' ? 'selected' : ''}>Avancé</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Évaluateur</label>
                    <select name="evaluated_by" class="form-select">
                        <option value="">-- Sélectionner --</option>
                        ${evaluatorOptions}
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Commentaires</label>
                    <textarea name="comments" class="form-textarea" rows="3">${evaluation?.comments || ''}</textarea>
                </div>
            </form>
        `,
        footer: `
            <button type="button" class="btn btn-secondary" id="cancel-eval">Annuler</button>
            <button type="submit" form="eval-form" class="btn btn-primary">${isEdit ? 'Modifier' : 'Créer'}</button>
        `
    });

    document.getElementById('cancel-eval').addEventListener('click', closeBottomSheet);

    document.getElementById('eval-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        Object.keys(data).forEach(key => {
            if (data[key] === '') data[key] = null;
        });

        try {
            let response;
            if (isEdit) {
                response = await apiService.updateEvaluation(evaluation.id, data);
            } else {
                response = await apiService.createEvaluation(data);
            }

            if (response.success) {
                toastSuccess(isEdit ? 'Évaluation modifiée' : 'Évaluation créée');
                closeBottomSheet();
                loadEvaluations();
            } else {
                toastError(response.message || 'Erreur');
            }
        } catch (error) {
            toastError(error.message || 'Erreur');
        }
    });
}

async function openEvaluationDetail(evaluation) {
    const typeLabels = {
        examen: 'Examen',
        controle: 'Contrôle',
        oral: 'Oral',
        memorisation: 'Mémorisation'
    };

    const levelLabels = {
        debutant: 'Débutant',
        intermediaire: 'Intermédiaire',
        avance: 'Avancé'
    };

    openBottomSheet({
        title: 'Détail évaluation',
        content: `
            <div class="eval-detail">
                <div class="detail-section">
                    <h4>Informations</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Élève</span>
                            <span class="detail-value">${evaluation.first_name} ${evaluation.last_name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Classe</span>
                            <span class="detail-value">${evaluation.class_name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Date</span>
                            <span class="detail-value">${new Date(evaluation.evaluation_date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Type</span>
                            <span class="detail-value">${typeLabels[evaluation.type] || evaluation.type}</span>
                        </div>
                        ${evaluation.subject_detail ? `
                            <div class="detail-item">
                                <span class="detail-label">Sujet</span>
                                <span class="detail-value">${evaluation.subject_detail}</span>
                            </div>
                        ` : ''}
                        ${evaluation.score !== null ? `
                            <div class="detail-item">
                                <span class="detail-label">Note</span>
                                <span class="detail-value">${evaluation.score}/${evaluation.max_score}</span>
                            </div>
                        ` : ''}
                        ${evaluation.level_achieved ? `
                            <div class="detail-item">
                                <span class="detail-label">Niveau atteint</span>
                                <span class="detail-value">${levelLabels[evaluation.level_achieved]}</span>
                            </div>
                        ` : ''}
                        ${evaluation.evaluator_name ? `
                            <div class="detail-item">
                                <span class="detail-label">Évaluateur</span>
                                <span class="detail-value">${evaluation.evaluator_name}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${evaluation.comments ? `
                    <div class="detail-section">
                        <h4>Commentaires</h4>
                        <p>${evaluation.comments}</p>
                    </div>
                ` : ''}
            </div>
        `,
        footer: `
            <button type="button" class="btn btn-secondary" id="close-detail">Fermer</button>
            <button type="button" class="btn btn-primary" id="edit-eval">Modifier</button>
            <button type="button" class="btn btn-danger" id="delete-eval">Supprimer</button>
        `
    });

    document.getElementById('close-detail').addEventListener('click', closeBottomSheet);

    document.getElementById('edit-eval').addEventListener('click', () => {
        closeBottomSheet();
        setTimeout(() => openEvaluationForm(evaluation), 300);
    });

    document.getElementById('delete-eval').addEventListener('click', async () => {
        if (confirm('Supprimer cette évaluation ?')) {
            try {
                const res = await apiService.deleteEvaluation(evaluation.id);
                if (res.success) {
                    toastSuccess('Évaluation supprimée');
                    closeBottomSheet();
                    loadEvaluations();
                } else {
                    toastError(res.message);
                }
            } catch (error) {
                toastError(error.message);
            }
        }
    });
}
