import apiService from '../../services/api.service.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';

let classes = [];
let currentClassId = null;
let currentDate = new Date().toISOString().split('T')[0];

export async function renderAttendanceTab(container) {
    container.innerHTML = `
        <style>
            .attendance-toolbar {
                display: flex;
                flex-wrap: wrap;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
                align-items: center;
            }

            .attendance-select {
                flex: 1;
                min-width: 200px;
            }

            .attendance-select select,
            .attendance-select input {
                width: 100%;
                padding: var(--spacing-sm) var(--spacing-md);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                font-size: var(--font-base);
                background-color: var(--color-input-bg);
            }

            .attendance-grid {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }

            .attendance-row {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                padding: var(--spacing-md);
                background-color: var(--color-card-bg);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-md);
            }

            .attendance-student {
                flex: 1;
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }

            .attendance-avatar {
                width: 40px;
                height: 40px;
                border-radius: var(--radius-full);
                background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%);
                color: var(--color-white);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: var(--font-medium);
                font-size: var(--font-sm);
                flex-shrink: 0;
            }

            .attendance-name {
                font-weight: var(--font-medium);
            }

            .attendance-buttons {
                display: flex;
                gap: var(--spacing-xs);
            }

            .attendance-btn {
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--radius-md);
                font-size: var(--font-sm);
                font-weight: var(--font-medium);
                border: 2px solid transparent;
                cursor: pointer;
                transition: all var(--transition-fast);
                min-width: 80px;
            }

            .attendance-btn.present {
                background-color: var(--color-success-light);
                color: var(--color-success);
                border-color: var(--color-success-light);
            }

            .attendance-btn.present.active {
                background-color: var(--color-success);
                color: var(--color-white);
                border-color: var(--color-success);
            }

            .attendance-btn.absent {
                background-color: var(--color-error-light);
                color: var(--color-error);
                border-color: var(--color-error-light);
            }

            .attendance-btn.absent.active {
                background-color: var(--color-error);
                color: var(--color-white);
                border-color: var(--color-error);
            }

            .attendance-btn.excuse {
                background-color: var(--color-warning-light);
                color: var(--color-warning);
                border-color: var(--color-warning-light);
            }

            .attendance-btn.excuse.active {
                background-color: var(--color-warning);
                color: var(--color-white);
                border-color: var(--color-warning);
            }

            .attendance-btn.retard {
                background-color: var(--color-warning-light);
                color: var(--color-warning-dark);
                border-color: var(--color-warning-light);
            }

            .attendance-btn.retard.active {
                background-color: var(--color-warning-dark);
                color: var(--color-white);
                border-color: var(--color-warning-dark);
            }

            .attendance-empty {
                text-align: center;
                padding: var(--spacing-2xl);
                color: var(--color-text-muted);
            }

            .save-attendance-btn {
                padding: var(--spacing-sm) var(--spacing-xl);
                background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%);
                color: var(--color-white);
                border: none;
                border-radius: var(--radius-md);
                font-weight: var(--font-medium);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .save-attendance-btn:hover {
                transform: translateY(-1px);
                box-shadow: var(--shadow-md);
            }

            .save-attendance-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }

            .attendance-summary {
                display: flex;
                gap: var(--spacing-lg);
                margin-bottom: var(--spacing-lg);
                padding: var(--spacing-md);
                background-color: var(--color-bg-secondary);
                border-radius: var(--radius-md);
            }

            .summary-item {
                text-align: center;
            }

            .summary-value {
                font-size: var(--font-xl);
                font-weight: var(--font-bold);
            }

            .summary-label {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }

            @media (max-width: 640px) {
                .attendance-row {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .attendance-buttons {
                    width: 100%;
                    justify-content: space-between;
                }

                .attendance-btn {
                    flex: 1;
                    min-width: 0;
                    padding: var(--spacing-xs);
                    font-size: var(--font-xs);
                }
            }
        </style>

        <div class="attendance-toolbar">
            <div class="attendance-select">
                <select id="class-select">
                    <option value="">-- Sélectionner une classe --</option>
                </select>
            </div>
            <div class="attendance-select" style="max-width: 180px;">
                <input type="date" id="date-select" value="${currentDate}">
            </div>
            <button class="save-attendance-btn" id="save-attendance-btn" disabled>Enregistrer</button>
        </div>

        <div class="attendance-summary" id="attendance-summary" style="display: none;">
            <div class="summary-item">
                <div class="summary-value" id="summary-present" style="color: var(--color-success);">0</div>
                <div class="summary-label">Présents</div>
            </div>
            <div class="summary-item">
                <div class="summary-value" id="summary-absent" style="color: var(--color-error);">0</div>
                <div class="summary-label">Absents</div>
            </div>
            <div class="summary-item">
                <div class="summary-value" id="summary-excuse" style="color: var(--color-warning);">0</div>
                <div class="summary-label">Excusés</div>
            </div>
            <div class="summary-item">
                <div class="summary-value" id="summary-retard" style="color: var(--color-warning-dark);">0</div>
                <div class="summary-label">Retards</div>
            </div>
        </div>

        <div class="attendance-grid" id="attendance-grid">
            <div class="attendance-empty">
                <p>Sélectionnez une classe pour prendre les présences</p>
            </div>
        </div>
    `;

    // Load classes
    await loadClasses();

    // Event handlers
    document.getElementById('class-select').addEventListener('change', (e) => {
        currentClassId = e.target.value;
        loadAttendance();
    });

    document.getElementById('date-select').addEventListener('change', (e) => {
        currentDate = e.target.value;
        loadAttendance();
    });

    document.getElementById('save-attendance-btn').addEventListener('click', saveAttendance);
}

async function loadClasses() {
    try {
        const response = await apiService.getSchoolClasses({ status: 'active' });
        if (response.success) {
            classes = response.data || [];

            const select = document.getElementById('class-select');
            select.innerHTML = '<option value="">-- Sélectionner une classe --</option>';

            classes.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = `${c.name} (${c.subject})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

async function loadAttendance() {
    const grid = document.getElementById('attendance-grid');
    const saveBtn = document.getElementById('save-attendance-btn');
    const summary = document.getElementById('attendance-summary');

    if (!currentClassId) {
        grid.innerHTML = '<div class="attendance-empty"><p>Sélectionnez une classe pour prendre les présences</p></div>';
        saveBtn.disabled = true;
        summary.style.display = 'none';
        return;
    }

    grid.innerHTML = '<div class="loading">Chargement...</div>';

    try {
        const response = await apiService.getClassAttendance(currentClassId, currentDate);

        if (response.success) {
            const students = response.data || [];

            if (students.length === 0) {
                grid.innerHTML = '<div class="attendance-empty"><p>Aucun élève inscrit dans cette classe</p></div>';
                saveBtn.disabled = true;
                summary.style.display = 'none';
                return;
            }

            summary.style.display = 'flex';
            saveBtn.disabled = false;

            grid.innerHTML = '';

            students.forEach(student => {
                const initials = (student.first_name[0] + student.last_name[0]).toUpperCase();
                const currentStatus = student.attendance_status || 'not_recorded';

                const row = document.createElement('div');
                row.className = 'attendance-row';
                row.dataset.studentId = student.id;
                row.dataset.status = currentStatus === 'not_recorded' ? 'present' : currentStatus;

                row.innerHTML = `
                    <div class="attendance-student">
                        <div class="attendance-avatar">${initials}</div>
                        <div class="attendance-name">${student.first_name} ${student.last_name}</div>
                    </div>
                    <div class="attendance-buttons">
                        <button class="attendance-btn present ${currentStatus === 'present' || currentStatus === 'not_recorded' ? 'active' : ''}" data-status="present">Présent</button>
                        <button class="attendance-btn absent ${currentStatus === 'absent' ? 'active' : ''}" data-status="absent">Absent</button>
                        <button class="attendance-btn excuse ${currentStatus === 'excuse' ? 'active' : ''}" data-status="excuse">Excusé</button>
                        <button class="attendance-btn retard ${currentStatus === 'retard' ? 'active' : ''}" data-status="retard">Retard</button>
                    </div>
                `;

                row.querySelectorAll('.attendance-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        row.querySelectorAll('.attendance-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        row.dataset.status = btn.dataset.status;
                        updateSummary();
                    });
                });

                grid.appendChild(row);
            });

            updateSummary();
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
        grid.innerHTML = '<div class="attendance-empty"><p>Erreur de chargement</p></div>';
    }
}

function updateSummary() {
    const rows = document.querySelectorAll('.attendance-row');
    let present = 0, absent = 0, excuse = 0, retard = 0;

    rows.forEach(row => {
        const status = row.dataset.status;
        if (status === 'present') present++;
        else if (status === 'absent') absent++;
        else if (status === 'excuse') excuse++;
        else if (status === 'retard') retard++;
    });

    document.getElementById('summary-present').textContent = present;
    document.getElementById('summary-absent').textContent = absent;
    document.getElementById('summary-excuse').textContent = excuse;
    document.getElementById('summary-retard').textContent = retard;
}

async function saveAttendance() {
    const rows = document.querySelectorAll('.attendance-row');
    const attendances = [];

    rows.forEach(row => {
        attendances.push({
            student_id: parseInt(row.dataset.studentId),
            status: row.dataset.status
        });
    });

    try {
        const response = await apiService.recordAttendance(currentClassId, currentDate, attendances);

        if (response.success) {
            toastSuccess('Présences enregistrées');
        } else {
            toastError(response.message || 'Erreur');
        }
    } catch (error) {
        toastError(error.message || 'Erreur');
    }
}
