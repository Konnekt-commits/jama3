import { toastError } from '../../components/toast/toast.js';

export async function renderEspaceAdherentPage(token) {
    const pageContent = document.getElementById('page-content');

    // Cacher la navigation (page publique)
    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
    document.getElementById('mobile-nav').style.display = 'none';

    pageContent.innerHTML = `
        <style>
            .espace-container {
                min-height: 100vh;
                background: linear-gradient(135deg, #F5F0E6 0%, #EDE5D8 100%);
                padding: var(--spacing-md);
            }

            [data-theme="dark"] .espace-container {
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            }

            .espace-header {
                text-align: center;
                padding: var(--spacing-xl) var(--spacing-md);
                background: linear-gradient(135deg, #8B6914, #5C3D0D);
                color: white;
                border-radius: var(--radius-xl);
                margin-bottom: var(--spacing-lg);
            }

            .espace-logo {
                width: 60px;
                height: 60px;
                background: rgba(255,255,255,0.2);
                border-radius: var(--radius-full);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto var(--spacing-md);
            }

            .espace-title {
                font-size: var(--font-xl);
                font-weight: var(--font-bold);
                margin-bottom: var(--spacing-xs);
            }

            .espace-subtitle {
                opacity: 0.9;
                font-size: var(--font-sm);
            }

            .adherent-card {
                background: white;
                border-radius: var(--radius-lg);
                padding: var(--spacing-lg);
                margin-bottom: var(--spacing-md);
                box-shadow: var(--shadow-md);
            }

            [data-theme="dark"] .adherent-card {
                background: var(--color-card-bg);
            }

            .adherent-name {
                font-size: var(--font-lg);
                font-weight: var(--font-semibold);
                margin-bottom: var(--spacing-xs);
            }

            .adherent-info {
                color: var(--color-text-muted);
                font-size: var(--font-sm);
            }

            .summary-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: var(--spacing-sm);
                margin-bottom: var(--spacing-lg);
            }

            .summary-card {
                background: white;
                border-radius: var(--radius-lg);
                padding: var(--spacing-md);
                text-align: center;
                box-shadow: var(--shadow-sm);
            }

            [data-theme="dark"] .summary-card {
                background: var(--color-card-bg);
            }

            .summary-value {
                font-size: var(--font-xl);
                font-weight: var(--font-bold);
                margin-bottom: var(--spacing-xs);
            }

            .summary-value.due { color: var(--color-warning); }
            .summary-value.paid { color: var(--color-success); }
            .summary-value.balance { color: var(--color-error); }
            .summary-value.balance.ok { color: var(--color-success); }

            .summary-label {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
            }

            .cotisations-section {
                background: white;
                border-radius: var(--radius-lg);
                padding: var(--spacing-lg);
                box-shadow: var(--shadow-md);
            }

            [data-theme="dark"] .cotisations-section {
                background: var(--color-card-bg);
            }

            .section-title {
                font-size: var(--font-base);
                font-weight: var(--font-semibold);
                margin-bottom: var(--spacing-md);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }

            .cotisation-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--spacing-md);
                border-bottom: 1px solid var(--color-border);
            }

            .cotisation-item:last-child {
                border-bottom: none;
            }

            .cotisation-season {
                font-weight: var(--font-medium);
            }

            .cotisation-amount {
                text-align: right;
            }

            .cotisation-total {
                font-weight: var(--font-semibold);
            }

            .cotisation-paid {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }

            .status-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: var(--radius-full);
                font-size: var(--font-xs);
                font-weight: var(--font-medium);
            }

            .status-paid { background: var(--color-success-light); color: var(--color-success); }
            .status-partial { background: var(--color-warning-light); color: var(--color-warning); }
            .status-pending { background: var(--color-bg-secondary); color: var(--color-text-muted); }
            .status-overdue { background: var(--color-error-light); color: var(--color-error); }

            .pay-button {
                width: 100%;
                padding: var(--spacing-md);
                background: linear-gradient(135deg, #8B6914, #5C3D0D);
                color: white;
                border: none;
                border-radius: var(--radius-lg);
                font-size: var(--font-base);
                font-weight: var(--font-semibold);
                cursor: pointer;
                margin-top: var(--spacing-lg);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-sm);
            }

            .pay-button:hover {
                opacity: 0.9;
            }

            .pay-button:disabled {
                background: var(--color-bg-secondary);
                color: var(--color-text-muted);
                cursor: not-allowed;
            }

            .loading {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 50vh;
                flex-direction: column;
                gap: var(--spacing-md);
            }

            .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid var(--color-border);
                border-top-color: var(--color-primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .error-state {
                text-align: center;
                padding: var(--spacing-xl);
            }

            .error-icon {
                width: 64px;
                height: 64px;
                background: var(--color-error-light);
                border-radius: var(--radius-full);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto var(--spacing-md);
                color: var(--color-error);
            }

            .token-expiry {
                text-align: center;
                margin-top: var(--spacing-lg);
                padding: var(--spacing-sm);
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
                font-size: var(--font-xs);
                color: var(--color-text-muted);
            }

            .theme-toggle {
                position: fixed;
                top: var(--spacing-md);
                right: var(--spacing-md);
                width: 40px;
                height: 40px;
                border-radius: var(--radius-full);
                background: white;
                border: 1px solid var(--color-border);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 100;
            }

            [data-theme="dark"] .theme-toggle {
                background: var(--color-card-bg);
            }
        </style>

        <div class="espace-container">
            <button class="theme-toggle" id="theme-toggle">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            </button>

            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p>Chargement de votre espace...</p>
            </div>

            <div id="content" style="display: none;"></div>
        </div>
    `;

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Load data
    await loadAdherentData(token);
}

async function loadAdherentData(token) {
    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('content');

    try {
        const response = await fetch(`/api/adherent-space/${token}`);
        const result = await response.json();

        loadingEl.style.display = 'none';

        if (!result.success) {
            contentEl.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <h2>Lien invalide ou expiré</h2>
                    <p style="color: var(--color-text-muted); margin-top: var(--spacing-sm);">
                        Ce lien n'est plus valide. Veuillez contacter votre association pour obtenir un nouveau lien.
                    </p>
                </div>
            `;
            contentEl.style.display = 'block';
            return;
        }

        const { adherent, association, cotisations, summary, token_expires_at } = result.data;

        const statusLabels = {
            paid: 'Payé',
            partial: 'Partiel',
            pending: 'En attente',
            overdue: 'En retard'
        };

        contentEl.innerHTML = `
            <div class="espace-header">
                <div class="espace-logo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" opacity="0.3"/>
                        <circle cx="12" cy="12" r="6"/>
                        <circle cx="12" cy="12" r="2" fill="currentColor"/>
                    </svg>
                </div>
                <h1 class="espace-title">${association.name}</h1>
                <p class="espace-subtitle">Espace Adhérent</p>
            </div>

            <div class="adherent-card">
                <div class="adherent-name">${adherent.first_name} ${adherent.last_name}</div>
                <div class="adherent-info">
                    ${adherent.member_number ? `N° ${adherent.member_number} • ` : ''}
                    ${adherent.email || ''}
                    ${adherent.phone ? ` • ${adherent.phone}` : ''}
                </div>
            </div>

            <div class="summary-grid">
                <div class="summary-card">
                    <div class="summary-value due">${summary.total_due.toFixed(2)} €</div>
                    <div class="summary-label">Total dû</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value paid">${summary.total_paid.toFixed(2)} €</div>
                    <div class="summary-label">Payé</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value balance ${summary.balance <= 0 ? 'ok' : ''}">${summary.balance.toFixed(2)} €</div>
                    <div class="summary-label">Reste à payer</div>
                </div>
            </div>

            <div class="cotisations-section">
                <h3 class="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    Mes cotisations
                </h3>

                ${cotisations.length === 0 ? `
                    <p style="text-align: center; color: var(--color-text-muted); padding: var(--spacing-lg);">
                        Aucune cotisation enregistrée
                    </p>
                ` : cotisations.map(c => `
                    <div class="cotisation-item">
                        <div>
                            <div class="cotisation-season">${c.season}</div>
                            <span class="status-badge status-${c.payment_status}">${statusLabels[c.payment_status] || c.payment_status}</span>
                        </div>
                        <div class="cotisation-amount">
                            <div class="cotisation-total">${parseFloat(c.amount).toFixed(2)} €</div>
                            <div class="cotisation-paid">Payé: ${parseFloat(c.amount_paid).toFixed(2)} €</div>
                        </div>
                    </div>
                `).join('')}

                ${summary.balance > 0 ? `
                    <button class="pay-button" id="pay-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                            <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                        Payer ${summary.balance.toFixed(2)} € en ligne
                    </button>
                ` : `
                    <button class="pay-button" disabled>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Tout est payé !
                    </button>
                `}
            </div>

            <div class="token-expiry">
                Ce lien expire le ${new Date(token_expires_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </div>
        `;

        contentEl.style.display = 'block';

        // Pay button handler
        const payBtn = document.getElementById('pay-btn');
        if (payBtn) {
            payBtn.addEventListener('click', () => {
                toastError('Paiement en ligne bientôt disponible');
            });
        }

    } catch (error) {
        console.error('Load adherent data error:', error);
        loadingEl.style.display = 'none';
        contentEl.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h2>Erreur de connexion</h2>
                <p style="color: var(--color-text-muted); margin-top: var(--spacing-sm);">
                    Impossible de charger vos données. Veuillez réessayer.
                </p>
            </div>
        `;
        contentEl.style.display = 'block';
    }
}
