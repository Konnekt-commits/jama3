import apiService from '../../services/api.service.js';
import appState from '../../store/appState.store.js';
import router from '../../router/router.js';
import { toastError, toastSuccess } from '../../components/toast/toast.js';

let associationsData = [];

export async function renderSuperadminPage() {
    const user = appState.get('user');

    if (!user || user.role !== 'super_admin') {
        toastError('Accès réservé aux super administrateurs');
        router.navigate('/login');
        return;
    }

    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
    document.getElementById('mobile-nav').style.display = 'none';

    const pageContent = document.getElementById('page-content');

    pageContent.innerHTML = `
        <style>
            * { box-sizing: border-box; }

            #page-content {
                padding: 0 !important;
                margin: 0 !important;
            }

            .sa-app {
                min-height: 100vh;
                background: #FAFAFA;
                font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
            }

            .sa-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 24px;
                padding-top: calc(16px + env(safe-area-inset-top, 0));
                background: #FAFAFA;
                border-bottom: 1px solid rgba(139, 105, 20, 0.1);
            }

            .sa-logo {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .sa-logo-text {
                font-size: 22px;
                font-weight: 700;
                color: #1a1a1a;
                letter-spacing: -0.5px;
            }

            .sa-logo-text span {
                color: #8B6914;
            }

            .sa-logo-badge {
                background: linear-gradient(135deg, #8B6914, #6B5210);
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 4px 10px;
                border-radius: 100px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .sa-header-right {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .sa-theme-toggle {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(139, 105, 20, 0.1);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #8B6914;
                transition: all 0.2s;
            }

            .sa-theme-toggle:active {
                transform: scale(0.95);
            }

            .sa-logout {
                background: rgba(139, 105, 20, 0.1);
                border: none;
                color: #8B6914;
                padding: 10px 16px;
                border-radius: 100px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
            }

            .sa-logout:hover {
                background: rgba(139, 105, 20, 0.2);
            }

            .sa-content {
                padding: 24px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .sa-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 16px;
                margin-bottom: 32px;
            }

            .sa-stat {
                background: linear-gradient(180deg, #F5F0E6 0%, #EDE6D6 100%);
                border-radius: 20px;
                padding: 24px;
            }

            .sa-stat-value {
                font-size: 36px;
                font-weight: 700;
                color: #8B6914;
            }

            .sa-stat-label {
                font-size: 14px;
                color: #6B5210;
                margin-top: 4px;
                font-weight: 500;
            }

            .sa-section-title {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 10px;
                color: #1a1a1a;
            }

            .sa-section-title svg {
                color: #8B6914;
            }

            .sa-table-container {
                background: linear-gradient(180deg, #F5F0E6 0%, #EDE6D6 100%);
                border-radius: 20px;
                overflow: hidden;
            }

            .sa-table {
                width: 100%;
                border-collapse: collapse;
            }

            .sa-table th {
                background: rgba(139, 105, 20, 0.1);
                padding: 16px;
                text-align: left;
                font-size: 12px;
                font-weight: 600;
                color: #6B5210;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .sa-table td {
                padding: 16px;
                font-size: 14px;
                border-bottom: 1px solid rgba(139, 105, 20, 0.1);
                color: #1a1a1a;
            }

            .sa-table tr:last-child td {
                border-bottom: none;
            }

            .sa-table tbody tr {
                cursor: pointer;
                transition: all 0.15s;
            }

            .sa-table tbody tr:hover td {
                background: rgba(139, 105, 20, 0.08);
            }

            .sa-table tbody tr:active td {
                background: rgba(139, 105, 20, 0.12);
            }

            .sa-asso-name {
                font-weight: 600;
                color: #1a1a1a;
            }

            .sa-asso-slug {
                font-size: 12px;
                color: #8B6914;
                margin-top: 2px;
            }

            .sa-badge {
                display: inline-block;
                padding: 6px 12px;
                border-radius: 100px;
                font-size: 12px;
                font-weight: 600;
            }

            .sa-badge-active {
                background: rgba(34, 197, 94, 0.15);
                color: #16a34a;
            }

            .sa-badge-inactive {
                background: rgba(239, 68, 68, 0.15);
                color: #dc2626;
            }

            .sa-empty {
                text-align: center;
                padding: 48px;
                color: #8B6914;
            }

            /* Modal */
            .sa-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: flex-start;
                justify-content: flex-end;
                z-index: 1000;
            }

            .sa-modal-overlay.active {
                display: flex;
            }

            .sa-modal {
                background: #FAFAFA;
                width: 100%;
                max-width: 500px;
                height: 100vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: -10px 0 40px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease;
            }

            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }

            .sa-modal-header {
                padding: 20px 24px;
                background: linear-gradient(180deg, #F5F0E6 0%, #EDE6D6 100%);
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(139, 105, 20, 0.1);
            }

            .sa-modal-title {
                font-size: 18px;
                font-weight: 600;
                color: #1a1a1a;
            }

            .sa-modal-close {
                background: rgba(139, 105, 20, 0.1);
                border: none;
                color: #8B6914;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }

            .sa-modal-close:hover {
                background: rgba(139, 105, 20, 0.2);
            }

            .sa-modal-body {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }

            /* Form Styles */
            .sa-form-section {
                margin-bottom: 24px;
            }

            .sa-form-section-title {
                font-size: 14px;
                font-weight: 600;
                color: #8B6914;
                margin-bottom: 16px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(139, 105, 20, 0.1);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .sa-form-group {
                margin-bottom: 16px;
            }

            .sa-form-label {
                display: block;
                font-size: 13px;
                font-weight: 500;
                color: #6B5210;
                margin-bottom: 6px;
            }

            .sa-form-input, .sa-form-select, .sa-form-textarea {
                width: 100%;
                padding: 12px 14px;
                border: 1px solid rgba(139, 105, 20, 0.2);
                border-radius: 12px;
                font-size: 14px;
                background: white;
                color: #1a1a1a;
                transition: all 0.2s;
            }

            .sa-form-input:focus, .sa-form-select:focus, .sa-form-textarea:focus {
                outline: none;
                border-color: #8B6914;
                box-shadow: 0 0 0 3px rgba(139, 105, 20, 0.1);
            }

            .sa-form-textarea {
                resize: vertical;
                min-height: 80px;
            }

            .sa-form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }

            .sa-form-switch {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                background: linear-gradient(180deg, #F5F0E6 0%, #EDE6D6 100%);
                border-radius: 12px;
            }

            .sa-form-switch-label {
                font-size: 14px;
                font-weight: 500;
                color: #1a1a1a;
            }

            .sa-switch {
                position: relative;
                width: 48px;
                height: 28px;
            }

            .sa-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .sa-switch-slider {
                position: absolute;
                cursor: pointer;
                inset: 0;
                background: #ccc;
                border-radius: 28px;
                transition: 0.3s;
            }

            .sa-switch-slider:before {
                position: absolute;
                content: "";
                height: 22px;
                width: 22px;
                left: 3px;
                bottom: 3px;
                background: white;
                border-radius: 50%;
                transition: 0.3s;
            }

            .sa-switch input:checked + .sa-switch-slider {
                background: #8B6914;
            }

            .sa-switch input:checked + .sa-switch-slider:before {
                transform: translateX(20px);
            }

            .sa-modal-footer {
                padding: 16px 24px;
                background: linear-gradient(180deg, #F5F0E6 0%, #EDE6D6 100%);
                display: flex;
                gap: 12px;
                border-top: 1px solid rgba(139, 105, 20, 0.1);
            }

            .sa-btn {
                padding: 12px 20px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .sa-btn-secondary {
                background: rgba(139, 105, 20, 0.1);
                border: none;
                color: #8B6914;
                flex: 1;
            }

            .sa-btn-secondary:hover {
                background: rgba(139, 105, 20, 0.2);
            }

            .sa-btn-primary {
                background: linear-gradient(135deg, #8B6914, #6B5210);
                border: none;
                color: white;
                flex: 2;
            }

            .sa-btn-primary:hover {
                opacity: 0.9;
            }

            .sa-btn-primary:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            /* DARK THEME */
            [data-theme="dark"] .sa-app {
                background: #1a1a1a;
            }

            [data-theme="dark"] .sa-header {
                background: #1a1a1a;
                border-color: #333;
            }

            [data-theme="dark"] .sa-logo-text {
                color: #fff;
            }

            [data-theme="dark"] .sa-logo-text span {
                color: #C9A227;
            }

            [data-theme="dark"] .sa-logo-badge {
                background: linear-gradient(135deg, #C9A227, #8B6914);
            }

            [data-theme="dark"] .sa-theme-toggle {
                background: rgba(201, 162, 39, 0.15);
                color: #C9A227;
            }

            [data-theme="dark"] .sa-logout {
                background: rgba(201, 162, 39, 0.15);
                color: #C9A227;
            }

            [data-theme="dark"] .sa-logout:hover {
                background: rgba(201, 162, 39, 0.25);
            }

            [data-theme="dark"] .sa-stat {
                background: linear-gradient(180deg, #2a2520 0%, #1f1b17 100%);
            }

            [data-theme="dark"] .sa-stat-value {
                color: #C9A227;
            }

            [data-theme="dark"] .sa-stat-label {
                color: #C9A227;
            }

            [data-theme="dark"] .sa-section-title {
                color: #fff;
            }

            [data-theme="dark"] .sa-section-title svg {
                color: #C9A227;
            }

            [data-theme="dark"] .sa-table-container {
                background: linear-gradient(180deg, #2a2520 0%, #1f1b17 100%);
            }

            [data-theme="dark"] .sa-table th {
                background: rgba(201, 162, 39, 0.1);
                color: #C9A227;
            }

            [data-theme="dark"] .sa-table td {
                border-color: rgba(201, 162, 39, 0.1);
                color: #fff;
            }

            [data-theme="dark"] .sa-table tbody tr:hover td {
                background: rgba(201, 162, 39, 0.08);
            }

            [data-theme="dark"] .sa-asso-name {
                color: #fff;
            }

            [data-theme="dark"] .sa-asso-slug {
                color: #C9A227;
            }

            [data-theme="dark"] .sa-empty {
                color: #C9A227;
            }

            [data-theme="dark"] .sa-modal {
                background: #1a1a1a;
            }

            [data-theme="dark"] .sa-modal-header {
                background: linear-gradient(180deg, #2a2520 0%, #1f1b17 100%);
                border-color: #333;
            }

            [data-theme="dark"] .sa-modal-title {
                color: #fff;
            }

            [data-theme="dark"] .sa-modal-close {
                background: rgba(201, 162, 39, 0.15);
                color: #C9A227;
            }

            [data-theme="dark"] .sa-form-section-title {
                color: #C9A227;
                border-color: rgba(201, 162, 39, 0.2);
            }

            [data-theme="dark"] .sa-form-label {
                color: #C9A227;
            }

            [data-theme="dark"] .sa-form-input,
            [data-theme="dark"] .sa-form-select,
            [data-theme="dark"] .sa-form-textarea {
                background: #252525;
                border-color: #333;
                color: #fff;
            }

            [data-theme="dark"] .sa-form-input:focus,
            [data-theme="dark"] .sa-form-select:focus,
            [data-theme="dark"] .sa-form-textarea:focus {
                border-color: #C9A227;
                box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.1);
            }

            [data-theme="dark"] .sa-form-switch {
                background: linear-gradient(180deg, #2a2520 0%, #1f1b17 100%);
            }

            [data-theme="dark"] .sa-form-switch-label {
                color: #fff;
            }

            [data-theme="dark"] .sa-switch input:checked + .sa-switch-slider {
                background: #C9A227;
            }

            [data-theme="dark"] .sa-modal-footer {
                background: linear-gradient(180deg, #2a2520 0%, #1f1b17 100%);
                border-color: #333;
            }

            [data-theme="dark"] .sa-btn-secondary {
                background: rgba(201, 162, 39, 0.15);
                color: #C9A227;
            }

            [data-theme="dark"] .sa-btn-secondary:hover {
                background: rgba(201, 162, 39, 0.25);
            }

            [data-theme="dark"] .sa-btn-primary {
                background: linear-gradient(135deg, #C9A227, #8B6914);
            }

            @media (max-width: 768px) {
                .sa-header {
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .sa-content {
                    padding: 16px;
                }

                .sa-table th, .sa-table td {
                    padding: 12px 8px;
                    font-size: 12px;
                }

                .sa-table th:nth-child(4),
                .sa-table td:nth-child(4),
                .sa-table th:nth-child(5),
                .sa-table td:nth-child(5) {
                    display: none;
                }

                .sa-stats {
                    grid-template-columns: repeat(2, 1fr);
                }

                .sa-modal {
                    max-width: 100%;
                }

                .sa-form-row {
                    grid-template-columns: 1fr;
                }
            }
        </style>

        <div class="sa-app">
            <header class="sa-header">
                <div class="sa-logo">
                    <span class="sa-logo-text">jama3<span>.</span></span>
                    <span class="sa-logo-badge">Super Admin</span>
                </div>
                <div class="sa-header-right">
                    <button class="sa-theme-toggle" id="theme-toggle">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    </button>
                    <button class="sa-logout" id="logout-btn">Déconnexion</button>
                </div>
            </header>

            <div class="sa-content">
                <div class="sa-stats" id="stats-container">
                    <div class="sa-stat">
                        <div class="sa-stat-value" id="stat-associations">-</div>
                        <div class="sa-stat-label">Associations</div>
                    </div>
                    <div class="sa-stat">
                        <div class="sa-stat-value" id="stat-users">-</div>
                        <div class="sa-stat-label">Utilisateurs</div>
                    </div>
                    <div class="sa-stat">
                        <div class="sa-stat-value" id="stat-adherents">-</div>
                        <div class="sa-stat-label">Adhérents</div>
                    </div>
                    <div class="sa-stat">
                        <div class="sa-stat-value" id="stat-cotisations">-</div>
                        <div class="sa-stat-label">Cotisations</div>
                    </div>
                </div>

                <h2 class="sa-section-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    Associations inscrites
                    <span style="font-size: 13px; font-weight: 400; color: #999; margin-left: 8px;">(Cliquez pour éditer)</span>
                </h2>

                <div class="sa-table-container">
                    <table class="sa-table">
                        <thead>
                            <tr>
                                <th>Association</th>
                                <th>Ville</th>
                                <th>Adhérents</th>
                                <th>Cotisations</th>
                                <th>Statut</th>
                                <th>Date création</th>
                            </tr>
                        </thead>
                        <tbody id="associations-table">
                            <tr>
                                <td colspan="6" class="sa-empty">Chargement...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="sa-modal-overlay" id="modal-overlay">
            <div class="sa-modal">
                <div class="sa-modal-header">
                    <h3 class="sa-modal-title" id="modal-title">Éditer l'association</h3>
                    <button class="sa-modal-close" id="modal-close">&times;</button>
                </div>
                <div class="sa-modal-body" id="modal-body">
                </div>
                <div class="sa-modal-footer">
                    <button class="sa-btn sa-btn-secondary" id="btn-cancel">Annuler</button>
                    <button class="sa-btn sa-btn-primary" id="btn-save">Enregistrer</button>
                </div>
            </div>
        </div>
    `;

    loadStats();
    loadAssociations();

    document.getElementById('theme-toggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        appState.set('theme', next);
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('association');
        router.navigate('/login');
    });

    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('btn-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
}

async function loadStats() {
    try {
        const response = await apiService.get('/superadmin/stats');
        if (response.success) {
            document.getElementById('stat-associations').textContent = response.data.associations;
            document.getElementById('stat-users').textContent = response.data.users;
            document.getElementById('stat-adherents').textContent = response.data.adherents;
            document.getElementById('stat-cotisations').textContent = response.data.cotisations;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadAssociations() {
    try {
        const response = await apiService.get('/superadmin/associations');
        const tbody = document.getElementById('associations-table');

        if (response.success && response.data.length > 0) {
            associationsData = response.data;
            tbody.innerHTML = response.data.map(asso => `
                <tr data-id="${asso.id}">
                    <td>
                        <div class="sa-asso-name">${asso.name}</div>
                        <div class="sa-asso-slug">${asso.slug}</div>
                    </td>
                    <td>${asso.city || '-'}</td>
                    <td>${asso.adherents_count || 0}</td>
                    <td>${asso.total_collected ? asso.total_collected + '€' : '0€'}</td>
                    <td>
                        <span class="sa-badge ${asso.is_active ? 'sa-badge-active' : 'sa-badge-inactive'}">
                            ${asso.is_active ? 'Actif' : 'Inactif'}
                        </span>
                    </td>
                    <td>${new Date(asso.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
            `).join('');

            // Add click handlers
            tbody.querySelectorAll('tr[data-id]').forEach(row => {
                row.addEventListener('click', () => {
                    const id = parseInt(row.dataset.id);
                    const asso = associationsData.find(a => a.id === id);
                    if (asso) openEditPanel(asso);
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="sa-empty">Aucune association inscrite</td></tr>';
        }
    } catch (error) {
        console.error('Error loading associations:', error);
        document.getElementById('associations-table').innerHTML =
            '<tr><td colspan="6" class="sa-empty">Erreur de chargement</td></tr>';
    }
}

function openEditPanel(asso) {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = `Éditer : ${asso.name}`;

    modalBody.innerHTML = `
        <form id="edit-form">
            <input type="hidden" id="edit-id" value="${asso.id}">

            <div class="sa-form-section">
                <div class="sa-form-section-title">Informations générales</div>

                <div class="sa-form-group">
                    <label class="sa-form-label">Nom de l'association *</label>
                    <input type="text" class="sa-form-input" id="edit-name" value="${asso.name || ''}" required>
                </div>

                <div class="sa-form-group">
                    <label class="sa-form-label">Slug (URL)</label>
                    <input type="text" class="sa-form-input" id="edit-slug" value="${asso.slug || ''}" readonly style="background: #f0f0f0;">
                </div>

                <div class="sa-form-group">
                    <label class="sa-form-label">Description</label>
                    <textarea class="sa-form-textarea" id="edit-description">${asso.description || ''}</textarea>
                </div>

                <div class="sa-form-group">
                    <label class="sa-form-label">Logo URL</label>
                    <input type="text" class="sa-form-input" id="edit-logo_url" value="${asso.logo_url || ''}" placeholder="https://...">
                </div>
            </div>

            <div class="sa-form-section">
                <div class="sa-form-section-title">Contact</div>

                <div class="sa-form-group">
                    <label class="sa-form-label">Email</label>
                    <input type="email" class="sa-form-input" id="edit-email" value="${asso.email || ''}">
                </div>

                <div class="sa-form-group">
                    <label class="sa-form-label">Téléphone</label>
                    <input type="tel" class="sa-form-input" id="edit-phone" value="${asso.phone || ''}">
                </div>

                <div class="sa-form-group">
                    <label class="sa-form-label">Site web</label>
                    <input type="url" class="sa-form-input" id="edit-website" value="${asso.website || ''}" placeholder="https://...">
                </div>
            </div>

            <div class="sa-form-section">
                <div class="sa-form-section-title">Adresse</div>

                <div class="sa-form-group">
                    <label class="sa-form-label">Adresse</label>
                    <input type="text" class="sa-form-input" id="edit-address" value="${asso.address || ''}">
                </div>

                <div class="sa-form-row">
                    <div class="sa-form-group">
                        <label class="sa-form-label">Code postal</label>
                        <input type="text" class="sa-form-input" id="edit-postal_code" value="${asso.postal_code || ''}">
                    </div>
                    <div class="sa-form-group">
                        <label class="sa-form-label">Ville</label>
                        <input type="text" class="sa-form-input" id="edit-city" value="${asso.city || ''}">
                    </div>
                </div>

                <div class="sa-form-group">
                    <label class="sa-form-label">Pays</label>
                    <input type="text" class="sa-form-input" id="edit-country" value="${asso.country || 'France'}">
                </div>
            </div>

            <div class="sa-form-section">
                <div class="sa-form-section-title">Informations légales</div>

                <div class="sa-form-row">
                    <div class="sa-form-group">
                        <label class="sa-form-label">SIRET</label>
                        <input type="text" class="sa-form-input" id="edit-siret" value="${asso.siret || ''}">
                    </div>
                    <div class="sa-form-group">
                        <label class="sa-form-label">N° RNA</label>
                        <input type="text" class="sa-form-input" id="edit-rna_number" value="${asso.rna_number || ''}">
                    </div>
                </div>
            </div>

            <div class="sa-form-section">
                <div class="sa-form-section-title">Abonnement</div>

                <div class="sa-form-group">
                    <label class="sa-form-label">Plan</label>
                    <select class="sa-form-select" id="edit-subscription_plan">
                        <option value="free" ${asso.subscription_plan === 'free' ? 'selected' : ''}>Free</option>
                        <option value="starter" ${asso.subscription_plan === 'starter' ? 'selected' : ''}>Starter</option>
                        <option value="pro" ${asso.subscription_plan === 'pro' ? 'selected' : ''}>Pro</option>
                        <option value="enterprise" ${asso.subscription_plan === 'enterprise' ? 'selected' : ''}>Enterprise</option>
                    </select>
                </div>

                <div class="sa-form-group">
                    <label class="sa-form-label">Expiration</label>
                    <input type="date" class="sa-form-input" id="edit-subscription_expires_at" value="${asso.subscription_expires_at ? asso.subscription_expires_at.split('T')[0] : ''}">
                </div>
            </div>

            <div class="sa-form-section">
                <div class="sa-form-section-title">Statut</div>

                <div class="sa-form-switch">
                    <span class="sa-form-switch-label">Association active</span>
                    <label class="sa-switch">
                        <input type="checkbox" id="edit-is_active" ${asso.is_active ? 'checked' : ''}>
                        <span class="sa-switch-slider"></span>
                    </label>
                </div>
            </div>
        </form>
    `;

    // Save button handler
    document.getElementById('btn-save').onclick = saveAssociation;

    modal.classList.add('active');
}

async function saveAssociation() {
    const btn = document.getElementById('btn-save');
    btn.disabled = true;
    btn.textContent = 'Enregistrement...';

    const id = document.getElementById('edit-id').value;

    const data = {
        name: document.getElementById('edit-name').value,
        description: document.getElementById('edit-description').value,
        logo_url: document.getElementById('edit-logo_url').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        website: document.getElementById('edit-website').value,
        address: document.getElementById('edit-address').value,
        postal_code: document.getElementById('edit-postal_code').value,
        city: document.getElementById('edit-city').value,
        country: document.getElementById('edit-country').value,
        siret: document.getElementById('edit-siret').value,
        rna_number: document.getElementById('edit-rna_number').value,
        subscription_plan: document.getElementById('edit-subscription_plan').value,
        subscription_expires_at: document.getElementById('edit-subscription_expires_at').value || null,
        is_active: document.getElementById('edit-is_active').checked
    };

    try {
        const response = await apiService.put(`/superadmin/associations/${id}`, data);

        if (response.success) {
            toastSuccess('Association mise à jour');
            closeModal();
            loadAssociations();
            loadStats();
        } else {
            toastError(response.message || 'Erreur lors de la mise à jour');
        }
    } catch (error) {
        console.error('Error saving association:', error);
        toastError('Erreur lors de la mise à jour');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Enregistrer';
    }
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}
