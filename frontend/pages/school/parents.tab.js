import apiService from '../../services/api.service.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { showToast } from '../../components/toast/toast.js';

let parents = [];
let searchTerm = '';

const icons = {
    phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    email: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    user: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    users: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    child: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="6" r="4"/><path d="M12 10v4"/><path d="M9 20l3-6 3 6"/><path d="M9 14h6"/></svg>`,
    calendar: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
    x: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    clock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    book: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    award: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
    credit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    trend: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    chevronRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`
};

export async function renderParentsTab(container) {
    container.innerHTML = `
        <style>
            .parents-container {
                padding: var(--spacing-md);
                max-width: 1200px;
                margin: 0 auto;
            }

            .parents-header {
                margin-bottom: var(--spacing-lg);
            }

            .parents-header h1 {
                font-size: var(--font-xl);
                font-weight: var(--font-bold);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                margin-bottom: var(--spacing-md);
            }

            .parents-search {
                position: relative;
                width: 100%;
            }

            .parents-search input {
                width: 100%;
                padding: var(--spacing-sm) var(--spacing-md);
                padding-left: 40px;
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                background: var(--color-input-bg);
                font-size: 16px;
            }

            .parents-search-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--color-text-muted);
            }

            .parents-stats {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: var(--spacing-sm);
                margin-bottom: var(--spacing-lg);
            }

            .parent-stat {
                background: var(--color-card-bg);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: var(--spacing-md);
                text-align: center;
            }

            .parent-stat-value {
                font-size: var(--font-xl);
                font-weight: var(--font-bold);
                color: var(--school-primary);
            }

            .parent-stat-label {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
                margin-top: 2px;
            }

            .parents-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }

            .parent-card {
                background: var(--color-card-bg);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-lg);
                padding: var(--spacing-md);
                cursor: pointer;
                transition: all var(--transition-fast);
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
            }

            .parent-card:hover {
                border-color: var(--school-primary);
                box-shadow: var(--shadow-sm);
            }

            .parent-card:active {
                transform: scale(0.98);
            }

            .parent-avatar {
                width: 52px;
                height: 52px;
                border-radius: var(--radius-full);
                background: linear-gradient(135deg, var(--school-primary) 0%, var(--school-primary-dark) 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: var(--font-lg);
                font-weight: var(--font-semibold);
                flex-shrink: 0;
            }

            .parent-info {
                flex: 1;
                min-width: 0;
            }

            .parent-name {
                font-weight: var(--font-semibold);
                font-size: var(--font-base);
                margin-bottom: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .parent-meta {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                font-size: var(--font-xs);
                color: var(--color-text-muted);
            }

            .parent-children-count {
                display: flex;
                align-items: center;
                gap: 4px;
                background: var(--school-primary-light);
                color: var(--school-primary);
                padding: 2px 8px;
                border-radius: var(--radius-full);
                font-size: var(--font-xs);
                font-weight: var(--font-medium);
            }

            .parent-card-arrow {
                color: var(--color-text-muted);
                flex-shrink: 0;
            }

            .empty-parents {
                text-align: center;
                padding: var(--spacing-3xl);
                color: var(--color-text-muted);
            }

            .empty-parents svg {
                width: 64px;
                height: 64px;
                margin-bottom: var(--spacing-md);
                opacity: 0.3;
            }

            /* Bottom Sheet Detail Styles */
            .parent-detail-header {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                padding-bottom: var(--spacing-lg);
                border-bottom: 1px solid var(--color-border);
                margin-bottom: var(--spacing-lg);
            }

            .parent-detail-avatar {
                width: 72px;
                height: 72px;
                border-radius: var(--radius-full);
                background: linear-gradient(135deg, var(--school-primary) 0%, var(--school-primary-dark) 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: var(--font-2xl);
                font-weight: var(--font-bold);
                margin-bottom: var(--spacing-sm);
            }

            .parent-detail-name {
                font-size: var(--font-lg);
                font-weight: var(--font-bold);
                margin-bottom: var(--spacing-xs);
            }

            .parent-contact-row {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-lg);
                margin-top: var(--spacing-sm);
            }

            .parent-contact-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                font-size: var(--font-sm);
                color: var(--color-text-secondary);
            }

            .parent-contact-item a {
                color: var(--school-primary);
                text-decoration: none;
            }

            /* Children Tabs */
            .children-tabs {
                display: flex;
                gap: var(--spacing-xs);
                overflow-x: auto;
                padding-bottom: var(--spacing-sm);
                margin-bottom: var(--spacing-md);
                -webkit-overflow-scrolling: touch;
            }

            .children-tabs::-webkit-scrollbar {
                display: none;
            }

            .child-tab {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                padding: var(--spacing-sm) var(--spacing-md);
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-full);
                font-size: var(--font-sm);
                font-weight: var(--font-medium);
                white-space: nowrap;
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .child-tab:hover {
                border-color: var(--school-primary);
            }

            .child-tab.active {
                background: var(--school-primary);
                border-color: var(--school-primary);
                color: white;
            }

            .child-tab-avatar {
                width: 24px;
                height: 24px;
                border-radius: var(--radius-full);
                background: var(--color-bg-tertiary);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: var(--font-bold);
            }

            .child-tab.active .child-tab-avatar {
                background: rgba(255,255,255,0.2);
            }

            /* Child Content */
            .child-content {
                display: none;
            }

            .child-content.active {
                display: block;
            }

            .child-section {
                margin-bottom: var(--spacing-lg);
            }

            .child-section-title {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                font-size: var(--font-sm);
                font-weight: var(--font-semibold);
                color: var(--color-text-secondary);
                margin-bottom: var(--spacing-sm);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            /* Stats Cards */
            .child-stats {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: var(--spacing-sm);
                margin-bottom: var(--spacing-lg);
            }

            .child-stat-card {
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
                padding: var(--spacing-md);
                text-align: center;
            }

            .child-stat-card.success {
                background: var(--color-success-light);
            }

            .child-stat-card.warning {
                background: var(--color-warning-light);
            }

            .child-stat-card.info {
                background: var(--color-info-light);
            }

            .child-stat-value {
                font-size: var(--font-xl);
                font-weight: var(--font-bold);
            }

            .child-stat-card.success .child-stat-value {
                color: var(--color-success);
            }

            .child-stat-card.warning .child-stat-value {
                color: var(--color-warning);
            }

            .child-stat-card.info .child-stat-value {
                color: var(--color-info);
            }

            .child-stat-label {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
                margin-top: 2px;
            }

            /* Classes List */
            .child-classes {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-xs);
            }

            .child-class-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: var(--spacing-sm) var(--spacing-md);
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
            }

            .child-class-info {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }

            .child-class-name {
                font-weight: var(--font-medium);
                font-size: var(--font-sm);
            }

            .child-class-teacher {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
            }

            /* Recent Activity */
            .child-activity {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-xs);
            }

            .activity-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-sm);
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
                font-size: var(--font-sm);
            }

            .activity-icon {
                width: 32px;
                height: 32px;
                border-radius: var(--radius-md);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .activity-icon.present {
                background: var(--color-success-light);
                color: var(--color-success);
            }

            .activity-icon.absent {
                background: var(--color-error-light);
                color: var(--color-error);
            }

            .activity-icon.grade {
                background: var(--color-info-light);
                color: var(--color-info);
            }

            .activity-icon.payment {
                background: var(--color-warning-light);
                color: var(--color-warning);
            }

            .activity-text {
                flex: 1;
            }

            .activity-date {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
            }

            /* Payment Status */
            .payment-status {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: var(--spacing-md);
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
            }

            .payment-status.paid {
                background: var(--color-success-light);
            }

            .payment-status.pending {
                background: var(--color-warning-light);
            }

            .payment-status.overdue {
                background: var(--color-error-light);
            }

            .payment-info {
                display: flex;
                flex-direction: column;
            }

            .payment-label {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
            }

            .payment-amount {
                font-size: var(--font-lg);
                font-weight: var(--font-bold);
            }

            .payment-status.paid .payment-amount {
                color: var(--color-success);
            }

            .payment-status.pending .payment-amount {
                color: var(--color-warning);
            }

            .payment-status.overdue .payment-amount {
                color: var(--color-error);
            }

            .payment-badge {
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--radius-full);
                font-size: var(--font-xs);
                font-weight: var(--font-medium);
            }

            .payment-status.paid .payment-badge {
                background: var(--color-success);
                color: white;
            }

            .payment-status.pending .payment-badge {
                background: var(--color-warning);
                color: white;
            }

            .payment-status.overdue .payment-badge {
                background: var(--color-error);
                color: white;
            }

            /* No data state */
            .no-data {
                text-align: center;
                padding: var(--spacing-lg);
                color: var(--color-text-muted);
                font-size: var(--font-sm);
            }

            @media (min-width: 640px) {
                .parents-search {
                    max-width: 320px;
                }

                .parents-stats {
                    grid-template-columns: repeat(4, 1fr);
                }
            }

            @media (min-width: 768px) {
                .parents-list {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-md);
                }
            }

            @media (min-width: 1024px) {
                .parents-list {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
        </style>

        <div class="parents-container">
            <div class="parents-header">
                <h1>
                    ${icons.users}
                    Parents d'eleves
                </h1>
                <div class="parents-search">
                    <span class="parents-search-icon">${icons.search}</span>
                    <input type="text" id="parents-search" placeholder="Rechercher un parent...">
                </div>
            </div>

            <div class="parents-stats" id="parents-stats">
                <div class="parent-stat">
                    <div class="parent-stat-value">-</div>
                    <div class="parent-stat-label">Parents</div>
                </div>
                <div class="parent-stat">
                    <div class="parent-stat-value">-</div>
                    <div class="parent-stat-label">Enfants</div>
                </div>
            </div>

            <div class="parents-list" id="parents-list">
                <div class="empty-parents">
                    ${icons.clock}
                    <p>Chargement...</p>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    document.getElementById('parents-search')?.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderParentsList();
    });

    // Load data
    await loadParents();
}

async function loadParents() {
    try {
        const response = await apiService.getSchoolParents();
        if (response.success) {
            parents = response.data || [];
            renderStats();
            renderParentsList();
        }
    } catch (error) {
        console.error('Error loading parents:', error);
        showToast('Erreur de chargement', 'error');
    }
}

function renderStats() {
    const statsContainer = document.getElementById('parents-stats');
    if (!statsContainer) return;

    const totalChildren = parents.reduce((sum, p) => sum + (p.children_count || 0), 0);

    statsContainer.innerHTML = `
        <div class="parent-stat">
            <div class="parent-stat-value">${parents.length}</div>
            <div class="parent-stat-label">Parents</div>
        </div>
        <div class="parent-stat">
            <div class="parent-stat-value">${totalChildren}</div>
            <div class="parent-stat-label">Enfants</div>
        </div>
    `;
}

function renderParentsList() {
    const container = document.getElementById('parents-list');
    if (!container) return;

    const filtered = parents.filter(p => {
        if (!searchTerm) return true;
        const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
        return fullName.includes(searchTerm);
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-parents" style="grid-column: 1 / -1;">
                ${icons.users}
                <h3>${searchTerm ? 'Aucun resultat' : 'Aucun parent'}</h3>
                <p>${searchTerm ? 'Essayez une autre recherche' : 'Les parents des eleves inscrits apparaitront ici'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(parent => {
        const initials = `${(parent.first_name || '')[0] || ''}${(parent.last_name || '')[0] || ''}`.toUpperCase();
        const childrenCount = parent.children_count || 0;

        return `
            <div class="parent-card" data-id="${parent.id}">
                <div class="parent-avatar">${initials}</div>
                <div class="parent-info">
                    <div class="parent-name">${parent.first_name} ${parent.last_name}</div>
                    <div class="parent-meta">
                        ${parent.phone ? `${icons.phone} ${parent.phone}` : ''}
                    </div>
                </div>
                <div class="parent-children-count">
                    ${icons.child}
                    ${childrenCount}
                </div>
                <div class="parent-card-arrow">${icons.chevronRight}</div>
            </div>
        `;
    }).join('');

    // Add click handlers
    container.querySelectorAll('.parent-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            showParentDetail(id);
        });
    });
}

async function showParentDetail(parentId) {
    const parent = parents.find(p => p.id === parentId);
    if (!parent) return;

    // Load children details
    let children = [];
    try {
        const response = await apiService.getParentChildren(parentId);
        if (response.success) {
            children = response.data || [];
        }
    } catch (error) {
        console.error('Error loading children:', error);
    }

    const initials = `${(parent.first_name || '')[0] || ''}${(parent.last_name || '')[0] || ''}`.toUpperCase();

    const content = `
        <div class="parent-detail-header">
            <div class="parent-detail-avatar">${initials}</div>
            <div class="parent-detail-name">${parent.first_name} ${parent.last_name}</div>
            <div class="parent-contact-row">
                ${parent.phone ? `
                    <div class="parent-contact-item">
                        ${icons.phone}
                        <a href="tel:${parent.phone}">${parent.phone}</a>
                    </div>
                ` : ''}
                ${parent.email ? `
                    <div class="parent-contact-item">
                        ${icons.email}
                        <a href="mailto:${parent.email}">${parent.email}</a>
                    </div>
                ` : ''}
            </div>
        </div>

        ${children.length > 0 ? `
            <div class="children-tabs" id="children-tabs">
                ${children.map((child, index) => {
                    const childInitials = `${(child.first_name || '')[0] || ''}${(child.last_name || '')[0] || ''}`.toUpperCase();
                    return `
                        <div class="child-tab ${index === 0 ? 'active' : ''}" data-child-id="${child.id}">
                            <div class="child-tab-avatar">${childInitials}</div>
                            ${child.first_name}
                        </div>
                    `;
                }).join('')}
            </div>

            ${children.map((child, index) => renderChildContent(child, index === 0)).join('')}
        ` : `
            <div class="no-data">
                ${icons.child}
                <p>Aucun enfant inscrit</p>
            </div>
        `}
    `;

    openBottomSheet({
        title: 'Suivi Famille',
        content
    });

    // Tab switching
    setTimeout(() => {
        document.querySelectorAll('.child-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.child-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.child-content').forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                const childId = tab.dataset.childId;
                document.getElementById(`child-content-${childId}`)?.classList.add('active');
            });
        });
    }, 100);
}

function renderChildContent(child, isActive) {
    const attendanceRate = child.attendance_rate || 0;
    const avgGrade = child.average_grade || '-';
    const classes = child.classes || [];
    const recentActivity = child.recent_activity || [];
    const paymentStatus = child.payment_status || 'pending';
    const pendingAmount = child.pending_amount || 0;

    return `
        <div class="child-content ${isActive ? 'active' : ''}" id="child-content-${child.id}">
            <!-- Stats -->
            <div class="child-stats">
                <div class="child-stat-card success">
                    <div class="child-stat-value">${attendanceRate}%</div>
                    <div class="child-stat-label">Presence</div>
                </div>
                <div class="child-stat-card info">
                    <div class="child-stat-value">${avgGrade}</div>
                    <div class="child-stat-label">Moyenne</div>
                </div>
            </div>

            <!-- Classes -->
            <div class="child-section">
                <div class="child-section-title">
                    ${icons.book}
                    Classes (${classes.length})
                </div>
                ${classes.length > 0 ? `
                    <div class="child-classes">
                        ${classes.map(c => `
                            <div class="child-class-item">
                                <div class="child-class-info">
                                    ${icons.book}
                                    <div>
                                        <div class="child-class-name">${c.name}</div>
                                        ${c.teacher_name ? `<div class="child-class-teacher">${c.teacher_name}</div>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="no-data">Aucune classe</div>'}
            </div>

            <!-- Payment Status -->
            <div class="child-section">
                <div class="child-section-title">
                    ${icons.credit}
                    Paiements
                </div>
                <div class="payment-status ${paymentStatus}">
                    <div class="payment-info">
                        <span class="payment-label">${paymentStatus === 'paid' ? 'Tout paye' : 'Reste a payer'}</span>
                        <span class="payment-amount">${paymentStatus === 'paid' ? 'OK' : pendingAmount + ' EUR'}</span>
                    </div>
                    <span class="payment-badge">
                        ${paymentStatus === 'paid' ? 'A jour' : paymentStatus === 'overdue' ? 'En retard' : 'En attente'}
                    </span>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="child-section">
                <div class="child-section-title">
                    ${icons.clock}
                    Activite recente
                </div>
                ${recentActivity.length > 0 ? `
                    <div class="child-activity">
                        ${recentActivity.slice(0, 5).map(activity => {
                            let iconClass = 'present';
                            let icon = icons.check;

                            if (activity.type === 'absence') {
                                iconClass = 'absent';
                                icon = icons.x;
                            } else if (activity.type === 'grade') {
                                iconClass = 'grade';
                                icon = icons.award;
                            } else if (activity.type === 'payment') {
                                iconClass = 'payment';
                                icon = icons.credit;
                            }

                            return `
                                <div class="activity-item">
                                    <div class="activity-icon ${iconClass}">${icon}</div>
                                    <div class="activity-text">${activity.description}</div>
                                    <div class="activity-date">${formatDate(activity.date)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : '<div class="no-data">Aucune activite recente</div>'}
            </div>
        </div>
    `;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Hier';
    if (diff < 7) return `Il y a ${diff}j`;

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
