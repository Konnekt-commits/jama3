import apiService from '../../services/api.service.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { createEventList } from '../../components/eventCard/eventCard.js';
import { toastError } from '../../components/toast/toast.js';
import router from '../../router/router.js';
import i18n from '../../services/i18n.service.js';

export async function renderDashboardPage() {
    renderNavbar(i18n.t('nav.dashboard'));

    const pageContent = document.getElementById('page-content');

    pageContent.innerHTML = `
        <style>
            .dashboard-header {
                margin-bottom: var(--spacing-xl);
                padding: var(--spacing-lg);
                background-color: var(--color-card-bg);
                border-radius: var(--radius-lg);
                border: 1px solid var(--color-card-border);
                background-image: var(--pattern-arabesque);
                position: relative;
                overflow: hidden;
            }

            .dashboard-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, var(--color-primary), var(--color-warning), var(--color-primary));
            }

            .dashboard-welcome {
                font-size: var(--font-2xl);
                font-weight: var(--font-bold);
                margin-bottom: var(--spacing-xs);
            }

            .dashboard-date {
                color: var(--color-text-muted);
            }

            .dashboard-stats {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-xl);
            }

            @media (min-width: 768px) {
                .dashboard-stats {
                    grid-template-columns: repeat(4, 1fr);
                }
            }

            .stat-card {
                background-color: var(--color-card-bg);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-lg);
                padding: var(--spacing-md);
                overflow: hidden;
                min-width: 0;
                position: relative;
            }

            .stat-card::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 10%;
                right: 10%;
                height: 2px;
                background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
                opacity: 0.5;
            }

            @media (min-width: 480px) {
                .stat-card {
                    padding: var(--spacing-lg);
                }
            }

            .stat-card-icon {
                width: 40px;
                height: 40px;
                border-radius: var(--radius-md);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: var(--spacing-md);
            }

            .stat-card-icon.blue {
                background-color: var(--color-primary-light);
                color: var(--color-primary);
            }

            .stat-card-icon.green {
                background-color: var(--color-success-light);
                color: var(--color-success);
            }

            .stat-card-icon.orange {
                background-color: var(--color-warning-light);
                color: var(--color-warning);
            }

            .stat-card-icon.purple {
                background-color: var(--color-accent-light);
                color: var(--color-accent);
            }

            .dashboard-grid {
                display: grid;
                gap: var(--spacing-lg);
            }

            @media (min-width: 1024px) {
                .dashboard-grid {
                    grid-template-columns: 1fr 1fr;
                }
            }

            .dashboard-section {
                background-color: var(--color-card-bg);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-lg);
                overflow: hidden;
                min-width: 0;
                max-width: 100%;
                position: relative;
            }

            .dashboard-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg,
                    transparent 0%,
                    var(--color-primary) 20%,
                    var(--color-warning) 50%,
                    var(--color-primary) 80%,
                    transparent 100%
                );
                opacity: 0.7;
            }

            .dashboard-section-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: var(--spacing-sm) var(--spacing-md);
                border-bottom: 1px solid var(--color-border);
                gap: var(--spacing-sm);
                flex-wrap: wrap;
            }

            @media (min-width: 480px) {
                .dashboard-section-header {
                    padding: var(--spacing-md) var(--spacing-lg);
                }
            }

            .dashboard-section-title {
                font-weight: var(--font-semibold);
                font-size: var(--font-sm);
            }

            @media (min-width: 480px) {
                .dashboard-section-title {
                    font-size: var(--font-base);
                }
            }

            .dashboard-section-body {
                padding: var(--spacing-md);
            }

            @media (min-width: 480px) {
                .dashboard-section-body {
                    padding: var(--spacing-lg);
                }
            }

            .quick-actions {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: var(--spacing-sm);
            }

            @media (min-width: 480px) {
                .quick-actions {
                    gap: var(--spacing-md);
                }
            }

            .quick-action {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--spacing-xs);
                padding: var(--spacing-md);
                background-color: var(--color-bg-secondary);
                border-radius: var(--radius-lg);
                transition: all var(--transition-fast);
                text-align: center;
                min-width: 0;
                overflow: hidden;
            }

            @media (min-width: 480px) {
                .quick-action {
                    padding: var(--spacing-lg);
                    gap: var(--spacing-sm);
                }
            }

            .quick-action:hover {
                background-color: var(--color-bg-hover);
                transform: translateY(-2px);
            }

            .quick-action-icon {
                width: 40px;
                height: 40px;
                border-radius: var(--radius-full);
                background-color: var(--color-primary-light);
                background-image: var(--pattern-arabesque);
                color: var(--color-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                position: relative;
                border: 2px solid var(--color-primary);
                opacity: 0.9;
            }

            .quick-action:hover .quick-action-icon {
                opacity: 1;
                box-shadow: 0 0 10px var(--color-primary);
            }

            @media (min-width: 480px) {
                .quick-action-icon {
                    width: 48px;
                    height: 48px;
                }
            }

            .quick-action-label {
                font-size: var(--font-xs);
                font-weight: var(--font-medium);
                word-break: break-word;
                line-height: 1.3;
            }

            @media (min-width: 480px) {
                .quick-action-label {
                    font-size: var(--font-sm);
                }
            }

            .overdue-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }

            .overdue-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: var(--spacing-sm);
                background-color: var(--color-error-light);
                border-radius: var(--radius-md);
                gap: var(--spacing-sm);
                min-width: 0;
            }

            @media (min-width: 480px) {
                .overdue-item {
                    padding: var(--spacing-sm) var(--spacing-md);
                }
            }

            .overdue-item-name {
                font-weight: var(--font-medium);
                font-size: var(--font-xs);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                min-width: 0;
                flex: 1;
            }

            @media (min-width: 480px) {
                .overdue-item-name {
                    font-size: var(--font-sm);
                }
            }

            .overdue-item-amount {
                font-weight: var(--font-semibold);
                color: var(--color-error);
                font-size: var(--font-xs);
                flex-shrink: 0;
            }

            @media (min-width: 480px) {
                .overdue-item-amount {
                    font-size: var(--font-sm);
                }
            }
        </style>

        <div class="dashboard-header">
            <h1 class="dashboard-welcome">${i18n.t('dashboard.welcome')}</h1>
            <p class="dashboard-date">${new Date().toLocaleDateString(i18n.lang === 'ar' ? 'ar-SA' : 'fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="dashboard-stats" id="stats-container">
            <div class="stat-card">
                <div class="skeleton" style="width: 40px; height: 40px; margin-bottom: 16px;"></div>
                <div class="skeleton" style="width: 60%; height: 20px; margin-bottom: 8px;"></div>
                <div class="skeleton" style="width: 40%; height: 32px;"></div>
            </div>
            <div class="stat-card">
                <div class="skeleton" style="width: 40px; height: 40px; margin-bottom: 16px;"></div>
                <div class="skeleton" style="width: 60%; height: 20px; margin-bottom: 8px;"></div>
                <div class="skeleton" style="width: 40%; height: 32px;"></div>
            </div>
            <div class="stat-card">
                <div class="skeleton" style="width: 40px; height: 40px; margin-bottom: 16px;"></div>
                <div class="skeleton" style="width: 60%; height: 20px; margin-bottom: 8px;"></div>
                <div class="skeleton" style="width: 40%; height: 32px;"></div>
            </div>
            <div class="stat-card">
                <div class="skeleton" style="width: 40px; height: 40px; margin-bottom: 16px;"></div>
                <div class="skeleton" style="width: 60%; height: 20px; margin-bottom: 8px;"></div>
                <div class="skeleton" style="width: 40%; height: 32px;"></div>
            </div>
        </div>

        <div class="dashboard-grid">
            <div class="dashboard-section">
                <div class="dashboard-section-header">
                    <h2 class="dashboard-section-title">${i18n.t('dashboard.upcomingEvents')}</h2>
                    <a href="/agenda" data-link class="btn btn-ghost btn-sm">${i18n.t('dashboard.viewAll')}</a>
                </div>
                <div class="dashboard-section-body" id="upcoming-events">
                    <div class="skeleton" style="height: 80px; margin-bottom: 8px;"></div>
                    <div class="skeleton" style="height: 80px; margin-bottom: 8px;"></div>
                    <div class="skeleton" style="height: 80px;"></div>
                </div>
            </div>

            <div class="dashboard-section">
                <div class="dashboard-section-header">
                    <h2 class="dashboard-section-title">${i18n.t('dashboard.quickActions')}</h2>
                </div>
                <div class="dashboard-section-body">
                    <div class="quick-actions">
                        <a href="/adherents?action=new" data-link class="quick-action">
                            <div class="quick-action-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                            </div>
                            <span class="quick-action-label">${i18n.t('dashboard.newMember')}</span>
                        </a>
                        <a href="/agenda?action=new" data-link class="quick-action">
                            <div class="quick-action-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="10" y1="16" x2="14" y2="16"></line></svg>
                            </div>
                            <span class="quick-action-label">${i18n.t('dashboard.newEvent')}</span>
                        </a>
                        <a href="/cotisations" data-link class="quick-action">
                            <div class="quick-action-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                            </div>
                            <span class="quick-action-label">${i18n.t('nav.cotisations')}</span>
                        </a>
                        <a href="/messages?action=new" data-link class="quick-action">
                            <div class="quick-action-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <span class="quick-action-label">${i18n.t('dashboard.sendMessage')}</span>
                        </a>
                    </div>
                </div>
            </div>

            <div class="dashboard-section">
                <div class="dashboard-section-header">
                    <h2 class="dashboard-section-title">${i18n.t('dashboard.overdueFees')}</h2>
                    <a href="/cotisations?filter=overdue" data-link class="btn btn-ghost btn-sm">${i18n.t('dashboard.viewAll')}</a>
                </div>
                <div class="dashboard-section-body" id="overdue-cotisations">
                    <div class="skeleton" style="height: 48px; margin-bottom: 8px;"></div>
                    <div class="skeleton" style="height: 48px; margin-bottom: 8px;"></div>
                    <div class="skeleton" style="height: 48px;"></div>
                </div>
            </div>
        </div>
    `;

    loadDashboardData();
}

async function loadDashboardData() {
    try {
        const [adherentsStats, cotisationsStats, eventsResponse, overdueResponse] = await Promise.all([
            apiService.getAdherentStats().catch(() => ({ success: false })),
            apiService.getCotisationStats().catch(() => ({ success: false })),
            apiService.getUpcomingEvents(5).catch(() => ({ success: false })),
            apiService.getOverdueCotisations().catch(() => ({ success: false }))
        ]);

        const stats = adherentsStats.success ? adherentsStats.data.stats : { actifs: 0, total: 0 };
        const cotStats = cotisationsStats.success ? cotisationsStats.data.stats : { total_paid: 0, total_amount: 0 };

        document.getElementById('stats-container').innerHTML = `
            <div class="stat-card">
                <div class="stat-card-icon blue">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div class="stat-card-label">${i18n.t('dashboard.activeMembers')}</div>
                <div class="stat-card-value">${stats.actifs || 0}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon green">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div class="stat-card-label">${i18n.t('dashboard.collectedFees')}</div>
                <div class="stat-card-value">${(cotStats.total_paid || 0).toLocaleString(i18n.lang === 'ar' ? 'ar-SA' : 'fr-FR')} €</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon orange">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div class="stat-card-label">${i18n.t('dashboard.eventsThisMonth')}</div>
                <div class="stat-card-value">${eventsResponse.success ? eventsResponse.data.events.length : 0}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon purple">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div class="stat-card-label">${i18n.t('dashboard.collectionRate')}</div>
                <div class="stat-card-value">${cotStats.total_amount ? Math.round(((cotStats.total_paid || 0) / cotStats.total_amount) * 100) : 0}%</div>
            </div>
        `;

        const eventsContainer = document.getElementById('upcoming-events');
        if (eventsResponse.success && eventsResponse.data.events.length > 0) {
            eventsContainer.innerHTML = '';
            eventsContainer.appendChild(createEventList(eventsResponse.data.events, {
                compact: true,
                onClick: (event) => router.navigate(`/agenda?event=${event.id}`)
            }));
        } else {
            eventsContainer.innerHTML = `
                <div class="empty-state">
                    <p class="text-muted">${i18n.t('dashboard.noEvents')}</p>
                </div>
            `;
        }

        const overdueContainer = document.getElementById('overdue-cotisations');
        if (overdueResponse.success && overdueResponse.data.cotisations.length > 0) {
            const overdueList = overdueResponse.data.cotisations.slice(0, 5);
            overdueContainer.innerHTML = `
                <div class="overdue-list">
                    ${overdueList.map(c => `
                        <div class="overdue-item">
                            <span class="overdue-item-name">${c.first_name} ${c.last_name}</span>
                            <span class="overdue-item-amount">${(c.amount - c.amount_paid).toFixed(2)} €</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            overdueContainer.innerHTML = `
                <div class="empty-state">
                    <p class="text-muted" style="color: var(--color-success);">${i18n.t('dashboard.noOverdue')}</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Dashboard data error:', error);
        toastError('Erreur lors du chargement des données');
    }
}
