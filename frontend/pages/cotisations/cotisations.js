import apiService from '../../services/api.service.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';

export async function renderCotisationsPage() {
    renderNavbar('Cotisations');

    const pageContent = document.getElementById('page-content');

    pageContent.innerHTML = `
        <style>
            /* Container principal */
            .cotisations-page {
                width: 100%;
                max-width: 100%;
                overflow-x: hidden;
                box-sizing: border-box;
            }

            .cotisations-stats {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: var(--spacing-sm);
                margin-bottom: var(--spacing-lg);
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            }

            .cotisations-stats .stat-card {
                min-width: 0;
                overflow: hidden;
            }

            .cotisations-stats .stat-card-value {
                font-size: var(--font-lg);
                word-break: break-word;
            }

            @media (min-width: 768px) {
                .cotisations-stats {
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--spacing-md);
                }

                .cotisations-stats .stat-card-value {
                    font-size: var(--font-2xl);
                }
            }

            .cotisations-header {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
                overflow: hidden;
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            }

            @media (min-width: 640px) {
                .cotisations-header {
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                }
            }

            .cotisations-filters-wrapper {
                width: 100%;
                max-width: 100%;
                overflow: hidden;
                box-sizing: border-box;
            }

            .cotisations-filters {
                display: flex;
                gap: var(--spacing-sm);
                flex-wrap: nowrap;
                overflow-x: auto;
                padding-bottom: var(--spacing-sm);
                -webkit-overflow-scrolling: touch;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .cotisations-filters::-webkit-scrollbar {
                display: none;
            }

            .filter-btn {
                padding: var(--spacing-sm) var(--spacing-md);
                font-size: var(--font-sm);
                border-radius: var(--radius-full);
                border: 1px solid var(--color-border);
                background-color: var(--color-bg-primary);
                transition: all var(--transition-fast);
                white-space: nowrap;
                flex-shrink: 0;
            }

            .filter-btn:hover {
                background-color: var(--color-bg-hover);
            }

            .filter-btn.active {
                background-color: var(--color-primary);
                color: white;
                border-color: var(--color-primary);
            }

            #cotisations-list {
                width: 100%;
                max-width: 100%;
                overflow: hidden;
                box-sizing: border-box;
            }

            .cotisation-card {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-sm) var(--spacing-md);
                background-color: var(--color-card-bg);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-lg);
                margin-bottom: var(--spacing-sm);
                cursor: pointer;
                transition: all var(--transition-fast);
                width: 100%;
                max-width: 100%;
                overflow: hidden;
                box-sizing: border-box;
            }

            @media (min-width: 768px) {
                .cotisation-card {
                    gap: var(--spacing-md);
                    padding: var(--spacing-md);
                }
            }

            .cotisation-card:hover {
                box-shadow: var(--shadow-md);
            }

            .cotisation-avatar {
                width: 40px;
                height: 40px;
                border-radius: var(--radius-full);
                background-color: var(--color-primary-light);
                color: var(--color-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: var(--font-semibold);
                flex-shrink: 0;
                font-size: var(--font-sm);
            }

            @media (min-width: 768px) {
                .cotisation-avatar {
                    width: 44px;
                    height: 44px;
                    font-size: var(--font-base);
                }
            }

            .cotisation-info {
                flex: 1;
                min-width: 0;
                overflow: hidden;
            }

            .cotisation-name {
                font-weight: var(--font-medium);
                margin-bottom: var(--spacing-xs);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .cotisation-details {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .cotisation-right {
                text-align: right;
                flex-shrink: 0;
                max-width: 100px;
            }

            @media (min-width: 768px) {
                .cotisation-right {
                    max-width: none;
                }
            }

            .cotisation-amount {
                font-weight: var(--font-semibold);
                font-size: var(--font-md);
                white-space: nowrap;
            }

            @media (min-width: 768px) {
                .cotisation-amount {
                    font-size: var(--font-lg);
                }
            }

            .cotisation-amount.paid {
                color: var(--color-success);
            }

            .cotisation-amount.partial {
                color: var(--color-warning);
            }

            .cotisation-amount.pending {
                color: var(--color-error);
            }

            .cotisation-status {
                font-size: var(--font-xs);
                margin-top: var(--spacing-xs);
            }

            .progress-bar {
                height: 4px;
                background-color: var(--color-bg-tertiary);
                border-radius: var(--radius-full);
                overflow: hidden;
                margin-top: var(--spacing-xs);
            }

            .progress-bar-fill {
                height: 100%;
                background-color: var(--color-success);
                border-radius: var(--radius-full);
                transition: width var(--transition-normal);
            }

            /* Mobile: barre de progression auto */
            .cotisation-info .progress-bar {
                max-width: 100%;
            }
        </style>

        <div class="cotisations-page">
        <div class="cotisations-stats" id="stats-container">
            <div class="stat-card card">
                <div class="skeleton" style="height: 16px; width: 60%; margin-bottom: 8px;"></div>
                <div class="skeleton" style="height: 32px; width: 80%;"></div>
            </div>
            <div class="stat-card card">
                <div class="skeleton" style="height: 16px; width: 60%; margin-bottom: 8px;"></div>
                <div class="skeleton" style="height: 32px; width: 80%;"></div>
            </div>
            <div class="stat-card card">
                <div class="skeleton" style="height: 16px; width: 60%; margin-bottom: 8px;"></div>
                <div class="skeleton" style="height: 32px; width: 80%;"></div>
            </div>
            <div class="stat-card card">
                <div class="skeleton" style="height: 16px; width: 60%; margin-bottom: 8px;"></div>
                <div class="skeleton" style="height: 32px; width: 80%;"></div>
            </div>
        </div>

        <div class="cotisations-header">
            <div class="cotisations-filters-wrapper">
                <div class="cotisations-filters">
                    <button class="filter-btn active" data-filter="all">Toutes</button>
                    <button class="filter-btn" data-filter="paid">Payées</button>
                    <button class="filter-btn" data-filter="partial">Partielles</button>
                    <button class="filter-btn" data-filter="pending">En attente</button>
                    <button class="filter-btn" data-filter="overdue">En retard</button>
                </div>
            </div>
        </div>

        <div id="cotisations-list">
            ${Array(5).fill().map(() => `
                <div class="cotisation-card">
                    <div class="skeleton" style="width: 44px; height: 44px; border-radius: 50%;"></div>
                    <div class="cotisation-info">
                        <div class="skeleton" style="width: 60%; height: 20px; margin-bottom: 8px;"></div>
                        <div class="skeleton" style="width: 40%; height: 16px;"></div>
                    </div>
                    <div class="skeleton" style="width: 80px; height: 24px;"></div>
                </div>
            `).join('')}
        </div>
        </div>
    `;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            loadCotisations(filter === 'all' ? {} : { payment_status: filter, overdue: filter === 'overdue' });
        });
    });

    loadStats();
    loadCotisations();
}

async function loadStats() {
    try {
        const response = await apiService.getCotisationStats();

        if (response.success) {
            const stats = response.data.stats;
            const collected = parseFloat(stats.total_paid) || 0;
            const total = parseFloat(stats.total_amount) || 0;
            const rate = total > 0 ? Math.round((collected / total) * 100) : 0;

            document.getElementById('stats-container').innerHTML = `
                <div class="stat-card card">
                    <div class="stat-card-label">Total attendu</div>
                    <div class="stat-card-value">${total.toLocaleString('fr-FR')} €</div>
                </div>
                <div class="stat-card card">
                    <div class="stat-card-label">Encaissé</div>
                    <div class="stat-card-value" style="color: var(--color-success);">${collected.toLocaleString('fr-FR')} €</div>
                </div>
                <div class="stat-card card">
                    <div class="stat-card-label">Reste à percevoir</div>
                    <div class="stat-card-value" style="color: var(--color-warning);">${(total - collected).toLocaleString('fr-FR')} €</div>
                </div>
                <div class="stat-card card">
                    <div class="stat-card-label">Taux de recouvrement</div>
                    <div class="stat-card-value">${rate}%</div>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${rate}%;"></div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Load stats error:', error);
    }
}

async function loadCotisations(filters = {}) {
    const listContainer = document.getElementById('cotisations-list');

    try {
        const response = await apiService.getCotisations(filters);

        if (response.success) {
            const cotisations = response.data.cotisations;

            if (cotisations.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state">
                        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                        <h3 class="empty-state-title">Aucune cotisation</h3>
                        <p class="empty-state-description">Aucune cotisation trouvée pour ces critères</p>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = cotisations.map(c => {
                const initials = (c.first_name[0] + c.last_name[0]).toUpperCase();
                const paid = parseFloat(c.amount_paid);
                const total = parseFloat(c.amount);
                const remaining = total - paid;
                const percentage = Math.round((paid / total) * 100);

                const statusLabels = {
                    paid: 'Payée',
                    partial: 'Partielle',
                    pending: 'En attente',
                    overdue: 'En retard'
                };

                return `
                    <div class="cotisation-card" data-id="${c.id}">
                        <div class="cotisation-avatar">${initials}</div>
                        <div class="cotisation-info">
                            <div class="cotisation-name">${c.first_name} ${c.last_name}</div>
                            <div class="cotisation-details">
                                Saison ${c.season} • ${c.invoice_number || 'N/A'}
                            </div>
                            ${c.payment_status !== 'paid' ? `
                                <div class="progress-bar" style="max-width: 120px;">
                                    <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="cotisation-right">
                            <div class="cotisation-amount ${c.payment_status}">
                                ${c.payment_status === 'paid' ? `${total.toFixed(2)} €` : `${remaining.toFixed(2)} €`}
                            </div>
                            <div class="cotisation-status">
                                <span class="badge badge-${c.payment_status === 'paid' ? 'paid' : c.payment_status === 'partial' ? 'pending' : 'inactif'}">
                                    ${statusLabels[c.payment_status] || c.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            document.querySelectorAll('.cotisation-card').forEach(card => {
                card.addEventListener('click', () => {
                    const id = card.dataset.id;
                    const cotisation = cotisations.find(c => c.id == id);
                    if (cotisation) {
                        openCotisationDetail(cotisation);
                    }
                });
            });
        }
    } catch (error) {
        console.error('Load cotisations error:', error);
        toastError('Erreur lors du chargement des cotisations');
    }
}

function openCotisationDetail(cotisation) {
    const paid = parseFloat(cotisation.amount_paid);
    const total = parseFloat(cotisation.amount);
    const remaining = total - paid;

    openBottomSheet({
        title: `Cotisation - ${cotisation.first_name} ${cotisation.last_name}`,
        content: `
            <div style="text-align: center; margin-bottom: var(--spacing-lg);">
                <div class="avatar avatar-lg" style="margin: 0 auto var(--spacing-md);">
                    ${(cotisation.first_name[0] + cotisation.last_name[0]).toUpperCase()}
                </div>
                <p class="text-sm">${cotisation.season}</p>
                <p class="text-sm text-muted">${cotisation.invoice_number || 'N/A'}</p>
            </div>

            <div class="card" style="margin-bottom: var(--spacing-md); padding: var(--spacing-md);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                    <span class="text-muted">Montant total</span>
                    <span class="font-semibold">${total.toFixed(2)} €</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                    <span class="text-muted">Déjà payé</span>
                    <span style="color: var(--color-success);">${paid.toFixed(2)} €</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span class="text-muted">Reste à payer</span>
                    <span style="color: var(--color-warning); font-weight: var(--font-semibold);">${remaining.toFixed(2)} €</span>
                </div>
                <div class="progress-bar" style="margin-top: var(--spacing-md);">
                    <div class="progress-bar-fill" style="width: ${Math.round((paid / total) * 100)}%;"></div>
                </div>
            </div>

            ${cotisation.payment_status !== 'paid' ? `
                <form id="payment-form">
                    <div class="form-group">
                        <label class="form-label">Enregistrer un paiement</label>
                        <div style="display: flex; gap: var(--spacing-sm);">
                            <input type="number" class="form-input" id="payment-amount" step="0.01" min="0.01" max="${remaining}" placeholder="Montant" required style="flex: 1;">
                            <select class="form-select" id="payment-method" required style="flex: 1;">
                                <option value="">Mode</option>
                                <option value="cb">CB</option>
                                <option value="cheque">Chèque</option>
                                <option value="especes">Espèces</option>
                                <option value="virement">Virement</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary w-full">Enregistrer le paiement</button>
                </form>
            ` : `
                <div class="card" style="padding: var(--spacing-md); background-color: var(--color-success-light); text-align: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto var(--spacing-sm);"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <p style="color: var(--color-success); font-weight: var(--font-medium);">Cotisation entièrement payée</p>
                </div>
            `}
        `,
        footer: `
            <button class="btn btn-secondary" id="close-btn">Fermer</button>
        `
    });

    document.getElementById('close-btn').addEventListener('click', closeBottomSheet);

    document.getElementById('payment-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const amount = parseFloat(document.getElementById('payment-amount').value);
        const method = document.getElementById('payment-method').value;

        try {
            const response = await apiService.registerPayment(cotisation.id, amount, method);

            if (response.success) {
                toastSuccess('Paiement enregistré');
                closeBottomSheet();
                loadStats();
                loadCotisations();
            }
        } catch (error) {
            toastError(error.message || 'Erreur lors de l\'enregistrement');
        }
    });
}
