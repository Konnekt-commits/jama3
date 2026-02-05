import apiService from '../../services/api.service.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';
import { refreshSchoolStats } from './school.js';

let fees = [];
let students = [];
let currentFilters = { payment_status: '' };

export async function renderFeesTab(container) {
    container.innerHTML = `
        <style>
            .fees-toolbar {
                display: flex;
                flex-wrap: wrap;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
                align-items: center;
            }

            .fees-filters {
                display: flex;
                gap: var(--spacing-xs);
                flex-wrap: wrap;
                flex: 1;
            }

            .status-filter {
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--radius-md);
                font-size: var(--font-sm);
                color: var(--color-text-secondary);
                border: 1px solid var(--color-border);
                background: var(--color-card-bg);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .status-filter:hover {
                border-color: var(--color-success);
                color: var(--color-success);
            }

            .status-filter.active {
                background-color: var(--color-success);
                color: var(--color-white);
                border-color: var(--color-success);
            }

            .fees-actions {
                display: flex;
                gap: var(--spacing-sm);
            }

            .add-fee-btn, .generate-fees-btn {
                padding: var(--spacing-sm) var(--spacing-lg);
                border: none;
                border-radius: var(--radius-md);
                font-weight: var(--font-medium);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .add-fee-btn {
                background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%);
                color: var(--color-white);
            }

            .generate-fees-btn {
                background: var(--color-bg-secondary);
                color: var(--color-text-primary);
                border: 1px solid var(--color-border);
            }

            .fees-grid {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }

            .fee-card {
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

            .fee-card:hover {
                box-shadow: var(--shadow-md);
                border-color: var(--color-success);
            }

            .fee-info {
                flex: 1;
            }

            .fee-student {
                font-weight: var(--font-medium);
                margin-bottom: var(--spacing-xs);
            }

            .fee-details {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }

            .fee-amount {
                text-align: right;
            }

            .fee-total {
                font-weight: var(--font-bold);
                font-size: var(--font-lg);
            }

            .fee-paid {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }

            .fee-status {
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--radius-full);
                font-size: var(--font-xs);
                font-weight: var(--font-medium);
            }

            .fee-status.pending {
                background-color: var(--color-warning-light);
                color: var(--color-warning);
            }

            .fee-status.partial {
                background-color: var(--color-info-light);
                color: var(--color-info-dark);
            }

            .fee-status.paid {
                background-color: var(--color-success-light);
                color: var(--color-success);
            }

            .fee-status.overdue {
                background-color: var(--color-error-light);
                color: var(--color-error);
            }

            .fees-empty {
                text-align: center;
                padding: var(--spacing-2xl);
                color: var(--color-text-muted);
            }

            .fees-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
            }

            .stat-card {
                padding: var(--spacing-md);
                background-color: var(--color-card-bg);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-md);
                text-align: center;
            }

            .stat-value {
                font-size: var(--font-xl);
                font-weight: var(--font-bold);
            }

            .stat-label {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }
        </style>

        <div class="fees-stats" id="fees-stats">
            <div class="stat-card">
                <div class="stat-value" id="stat-total-amount">-</div>
                <div class="stat-label">Total attendu</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="stat-total-paid" style="color: var(--color-success);">-</div>
                <div class="stat-label">Total payé</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="stat-pending" style="color: var(--color-warning);">-</div>
                <div class="stat-label">En attente</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="stat-overdue" style="color: var(--color-error);">-</div>
                <div class="stat-label">En retard</div>
            </div>
        </div>

        <div class="fees-toolbar">
            <div class="fees-filters">
                <button class="status-filter active" data-status="">Tous</button>
                <button class="status-filter" data-status="pending">En attente</button>
                <button class="status-filter" data-status="partial">Partiels</button>
                <button class="status-filter" data-status="paid">Payés</button>
                <button class="status-filter" data-status="overdue">En retard</button>
            </div>
            <div class="fees-actions">
                <button class="generate-fees-btn" id="generate-fees-btn">Générer frais</button>
                <button class="add-fee-btn" id="add-fee-btn">+ Nouveau frais</button>
            </div>
        </div>

        <div class="fees-grid" id="fees-grid">
            <div class="loading">Chargement...</div>
        </div>
    `;

    // Load students for forms
    loadStudents();
    loadFeeStats();

    // Event handlers
    document.querySelectorAll('.status-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.status-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilters.payment_status = btn.dataset.status;
            loadFees();
        });
    });

    document.getElementById('add-fee-btn').addEventListener('click', () => openFeeForm());
    document.getElementById('generate-fees-btn').addEventListener('click', () => openGenerateFeesForm());

    loadFees();
}

async function loadStudents() {
    try {
        const response = await apiService.getStudents({ status: 'actif', limit: 200 });
        if (response.success) {
            const data = response.data;
            students = Array.isArray(data) ? data : (Array.isArray(data?.students) ? data.students : []);
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

async function loadFeeStats() {
    try {
        const response = await apiService.getSchoolFeeStats();
        if (response.success) {
            const stats = response.data || {};
            document.getElementById('stat-total-amount').textContent = `${parseFloat(stats.total_amount || 0).toFixed(0)}€`;
            document.getElementById('stat-total-paid').textContent = `${parseFloat(stats.total_paid || 0).toFixed(0)}€`;
            document.getElementById('stat-pending').textContent = stats.pending_count || 0;
            document.getElementById('stat-overdue').textContent = stats.overdue_count || 0;
        }
    } catch (error) {
        console.error('Error loading fee stats:', error);
    }
}

async function loadFees() {
    const grid = document.getElementById('fees-grid');
    grid.innerHTML = '<div class="loading">Chargement...</div>';

    try {
        const response = await apiService.getSchoolFees(currentFilters);

        if (response.success) {
            fees = response.data || [];

            if (fees.length === 0) {
                grid.innerHTML = '<div class="fees-empty"><p>Aucun frais trouvé</p></div>';
                return;
            }

            grid.innerHTML = '';

            const statusLabels = {
                pending: 'En attente',
                partial: 'Partiel',
                paid: 'Payé',
                overdue: 'En retard'
            };

            fees.forEach(fee => {
                const card = document.createElement('div');
                card.className = 'fee-card';
                card.innerHTML = `
                    <div class="fee-info">
                        <div class="fee-student">${fee.first_name} ${fee.last_name}</div>
                        <div class="fee-details">
                            ${fee.fee_number} • ${fee.period_label || fee.period} • ${fee.academic_year}
                        </div>
                    </div>
                    <div class="fee-amount">
                        <div class="fee-total">${parseFloat(fee.amount).toFixed(0)}€</div>
                        <div class="fee-paid">Payé: ${parseFloat(fee.paid_amount || 0).toFixed(0)}€</div>
                    </div>
                    <span class="fee-status ${fee.payment_status}">${statusLabels[fee.payment_status]}</span>
                `;

                card.addEventListener('click', () => openFeeDetail(fee));
                grid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading fees:', error);
        grid.innerHTML = '<div class="fees-empty"><p>Erreur de chargement</p></div>';
    }
}

function openFeeForm(fee = null) {
    const isEdit = !!fee;

    const studentOptions = students.map(s =>
        `<option value="${s.id}" ${fee?.student_id === s.id ? 'selected' : ''}>
            ${s.first_name} ${s.last_name}
        </option>`
    ).join('');

    const currentYear = new Date().getFullYear();
    const academicYear = currentYear >= 9 ? `${currentYear}-${currentYear+1}` : `${currentYear-1}-${currentYear}`;

    openBottomSheet({
        title: isEdit ? 'Modifier frais' : 'Nouveau frais',
        content: `
            <form id="fee-form" class="form">
                <div class="form-group">
                    <label class="form-label">Élève *</label>
                    <select name="student_id" class="form-select" required ${isEdit ? 'disabled' : ''}>
                        <option value="">-- Sélectionner --</option>
                        ${studentOptions}
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Montant *</label>
                        <input type="number" name="amount" class="form-input" required value="${fee?.amount || ''}" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Période</label>
                        <select name="period" class="form-select">
                            <option value="mensuel" ${fee?.period === 'mensuel' ? 'selected' : ''}>Mensuel</option>
                            <option value="trimestriel" ${fee?.period === 'trimestriel' ? 'selected' : ''}>Trimestriel</option>
                            <option value="annuel" ${fee?.period === 'annuel' ? 'selected' : ''}>Annuel</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Libellé période</label>
                        <input type="text" name="period_label" class="form-input" value="${fee?.period_label || ''}" placeholder="Ex: Septembre 2024">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Année scolaire</label>
                        <input type="text" name="academic_year" class="form-input" value="${fee?.academic_year || academicYear}">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Date d'échéance</label>
                    <input type="date" name="due_date" class="form-input" value="${fee?.due_date?.split('T')[0] || ''}">
                </div>

                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea name="notes" class="form-textarea" rows="2">${fee?.notes || ''}</textarea>
                </div>
            </form>
        `,
        footer: `
            <button type="button" class="btn btn-secondary" id="cancel-fee">Annuler</button>
            <button type="submit" form="fee-form" class="btn btn-primary">${isEdit ? 'Modifier' : 'Créer'}</button>
        `
    });

    document.getElementById('cancel-fee').addEventListener('click', closeBottomSheet);

    document.getElementById('fee-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        Object.keys(data).forEach(key => {
            if (data[key] === '') data[key] = null;
        });

        try {
            let response;
            if (isEdit) {
                response = await apiService.updateSchoolFee(fee.id, data);
            } else {
                response = await apiService.createSchoolFee(data);
            }

            if (response.success) {
                toastSuccess(isEdit ? 'Frais modifié' : 'Frais créé');
                closeBottomSheet();
                loadFees();
                loadFeeStats();
                refreshSchoolStats();
            } else {
                toastError(response.message || 'Erreur');
            }
        } catch (error) {
            toastError(error.message || 'Erreur');
        }
    });
}

function openGenerateFeesForm() {
    const studentCheckboxes = students.map(s =>
        `<label class="checkbox-item">
            <input type="checkbox" name="student_ids" value="${s.id}">
            <span>${s.first_name} ${s.last_name}</span>
        </label>`
    ).join('');

    const currentYear = new Date().getFullYear();
    const academicYear = new Date().getMonth() >= 8 ? `${currentYear}-${currentYear+1}` : `${currentYear-1}-${currentYear}`;

    openBottomSheet({
        title: 'Générer frais en lot',
        content: `
            <form id="generate-fees-form" class="form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Montant *</label>
                        <input type="number" name="amount" class="form-input" required step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Période</label>
                        <select name="period" class="form-select">
                            <option value="mensuel">Mensuel</option>
                            <option value="trimestriel">Trimestriel</option>
                            <option value="annuel">Annuel</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Libellé période</label>
                        <input type="text" name="period_label" class="form-input" placeholder="Ex: Janvier 2025">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Année scolaire</label>
                        <input type="text" name="academic_year" class="form-input" value="${academicYear}">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Date d'échéance</label>
                    <input type="date" name="due_date" class="form-input">
                </div>

                <div class="form-divider"><span>Sélectionner les élèves</span></div>

                <div class="form-group">
                    <button type="button" class="btn btn-secondary btn-sm" id="select-all-students">Tout sélectionner</button>
                </div>

                <div class="form-group checkbox-list" style="max-height: 200px; overflow-y: auto;">
                    ${studentCheckboxes}
                </div>
            </form>
        `,
        footer: `
            <button type="button" class="btn btn-secondary" id="cancel-generate">Annuler</button>
            <button type="submit" form="generate-fees-form" class="btn btn-primary">Générer</button>
        `
    });

    document.getElementById('cancel-generate').addEventListener('click', closeBottomSheet);

    document.getElementById('select-all-students').addEventListener('click', () => {
        document.querySelectorAll('input[name="student_ids"]').forEach(cb => cb.checked = true);
    });

    document.getElementById('generate-fees-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const studentIds = formData.getAll('student_ids').map(id => parseInt(id));

        if (studentIds.length === 0) {
            toastError('Sélectionnez au moins un élève');
            return;
        }

        const data = {
            student_ids: studentIds,
            amount: parseFloat(formData.get('amount')),
            period: formData.get('period'),
            period_label: formData.get('period_label') || null,
            academic_year: formData.get('academic_year'),
            due_date: formData.get('due_date') || null
        };

        try {
            const response = await apiService.generateBatchFees(data);

            if (response.success) {
                const successCount = response.data.filter(r => r.success).length;
                toastSuccess(`${successCount} frais générés`);
                closeBottomSheet();
                loadFees();
                loadFeeStats();
                refreshSchoolStats();
            } else {
                toastError(response.message || 'Erreur');
            }
        } catch (error) {
            toastError(error.message || 'Erreur');
        }
    });
}

async function openFeeDetail(fee) {
    const statusLabels = {
        pending: 'En attente',
        partial: 'Partiel',
        paid: 'Payé',
        overdue: 'En retard'
    };

    const remaining = parseFloat(fee.amount) - parseFloat(fee.paid_amount || 0);

    openBottomSheet({
        title: `Frais ${fee.fee_number}`,
        content: `
            <div class="fee-detail">
                <div class="detail-section">
                    <h4>Informations</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Élève</span>
                            <span class="detail-value">${fee.first_name} ${fee.last_name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Montant</span>
                            <span class="detail-value">${parseFloat(fee.amount).toFixed(2)}€</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Payé</span>
                            <span class="detail-value">${parseFloat(fee.paid_amount || 0).toFixed(2)}€</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Reste à payer</span>
                            <span class="detail-value" style="color: var(${remaining > 0 ? '--color-error' : '--color-success'})">${remaining.toFixed(2)}€</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Statut</span>
                            <span class="detail-value">${statusLabels[fee.payment_status]}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Période</span>
                            <span class="detail-value">${fee.period_label || fee.period}</span>
                        </div>
                    </div>
                </div>

                ${fee.payment_status !== 'paid' ? `
                    <div class="detail-section">
                        <h4>Enregistrer un paiement</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Montant</label>
                                <input type="number" id="payment-amount" class="form-input" value="${remaining.toFixed(2)}" step="0.01" min="0" max="${remaining}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Méthode</label>
                                <select id="payment-method" class="form-select">
                                    <option value="cash">Espèces</option>
                                    <option value="cheque">Chèque</option>
                                    <option value="virement">Virement</option>
                                    <option value="carte">Carte</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn btn-primary" id="record-payment-btn" style="width: 100%;">Enregistrer le paiement</button>
                    </div>
                ` : ''}
            </div>
        `,
        footer: `
            <button type="button" class="btn btn-secondary" id="close-detail">Fermer</button>
            <button type="button" class="btn btn-danger" id="delete-fee">Supprimer</button>
        `
    });

    document.getElementById('close-detail').addEventListener('click', closeBottomSheet);

    document.getElementById('record-payment-btn')?.addEventListener('click', async () => {
        const amount = parseFloat(document.getElementById('payment-amount').value);
        const method = document.getElementById('payment-method').value;

        if (!amount || amount <= 0) {
            toastError('Montant invalide');
            return;
        }

        try {
            let response;
            if (amount >= remaining) {
                response = await apiService.markSchoolFeePaid(fee.id, method);
            } else {
                response = await apiService.recordPartialSchoolFeePayment(fee.id, amount, method);
            }

            if (response.success) {
                toastSuccess('Paiement enregistré');
                closeBottomSheet();
                loadFees();
                loadFeeStats();
                refreshSchoolStats();
            } else {
                toastError(response.message);
            }
        } catch (error) {
            toastError(error.message);
        }
    });

    document.getElementById('delete-fee').addEventListener('click', async () => {
        if (confirm('Supprimer ce frais ?')) {
            try {
                const res = await apiService.deleteSchoolFee(fee.id);
                if (res.success) {
                    toastSuccess('Frais supprimé');
                    closeBottomSheet();
                    loadFees();
                    loadFeeStats();
                    refreshSchoolStats();
                } else {
                    toastError(res.message);
                }
            } catch (error) {
                toastError(error.message);
            }
        }
    });
}
