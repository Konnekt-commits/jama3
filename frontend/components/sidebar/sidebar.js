import appState from '../../store/appState.store.js';
import i18n from '../../services/i18n.service.js';

const getMenuItems = () => [
    { path: '/', icon: 'dashboard', label: i18n.t('nav.dashboard') },
    { path: '/adherents', icon: 'users', label: i18n.t('nav.adherents') },
    { path: '/cotisations', icon: 'wallet', label: i18n.t('nav.cotisations') },
    { path: '/agenda', icon: 'calendar', label: i18n.t('nav.agenda') },
    { path: '/intervenants', icon: 'briefcase', label: i18n.t('nav.intervenants') },
    { path: '/messages', icon: 'message', label: i18n.t('nav.messages') }
];

const icons = {
    dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    wallet: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    briefcase: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    message: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
    chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    mosque: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-1.5 2-3 3.5-3 6 0 1.5.5 2.5 1.5 3.5L12 14l1.5-1.5c1-1 1.5-2 1.5-3.5 0-2.5-1.5-4-3-6z"/><path d="M12 14v7"/><path d="M5 21h14"/><path d="M5 21v-4c0-1 .5-2 1.5-2.5"/><path d="M19 21v-4c0-1-.5-2-1.5-2.5"/><circle cx="12" cy="6" r="1"/></svg>`
};

export function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    const isCollapsed = appState.get('sidebarCollapsed');
    const currentPath = window.location.pathname;
    const user = appState.get('user');

    sidebar.className = `sidebar ${isCollapsed ? 'collapsed' : ''}`;

    sidebar.innerHTML = `
        <style>
            .sidebar {
                position: fixed;
                left: 0;
                top: 0;
                height: 100vh;
                width: var(--sidebar-width);
                background-color: var(--color-sidebar-bg);
                background-image: var(--pattern-arabesque);
                border-right: 1px solid var(--color-sidebar-border);
                display: flex;
                flex-direction: column;
                z-index: var(--z-fixed);
                transition: width var(--transition-normal),
                            transform var(--transition-normal);
                transform: translateX(-100%);
            }

            @media (min-width: 1024px) {
                .sidebar {
                    transform: translateX(0);
                }

                .sidebar.collapsed {
                    width: var(--sidebar-collapsed-width);
                }
            }

            .sidebar.mobile-open {
                transform: translateX(0);
            }

            .sidebar-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: var(--spacing-lg);
                border-bottom: 1px solid var(--color-border);
            }

            .sidebar-logo {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                font-weight: var(--font-bold);
                font-size: var(--font-lg);
                color: var(--color-primary);
                overflow: hidden;
                white-space: nowrap;
                font-family: var(--font-arabic-decorative);
            }

            .sidebar.collapsed .sidebar-logo span {
                display: none;
            }

            .sidebar-toggle {
                padding: var(--spacing-xs);
                border-radius: var(--radius-md);
                color: var(--color-text-muted);
                transition: all var(--transition-fast);
            }

            .sidebar-toggle:hover {
                background-color: var(--color-bg-hover);
                color: var(--color-text-primary);
            }

            .sidebar.collapsed .sidebar-toggle svg {
                transform: rotate(180deg);
            }

            .sidebar-nav {
                flex: 1;
                padding: var(--spacing-md);
                overflow-y: auto;
            }

            .sidebar-nav-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                padding: var(--spacing-sm) var(--spacing-md);
                margin-bottom: var(--spacing-xs);
                border-radius: var(--radius-md);
                color: var(--color-text-secondary);
                transition: all var(--transition-fast);
                white-space: nowrap;
                overflow: hidden;
            }

            .sidebar-nav-item:hover {
                background-color: var(--color-sidebar-item-hover);
                color: var(--color-text-primary);
            }

            .sidebar-nav-item.active {
                background-color: var(--color-sidebar-item-active);
                color: var(--color-sidebar-item-active-text);
            }

            .sidebar-nav-item svg {
                flex-shrink: 0;
            }

            .sidebar.collapsed .sidebar-nav-item span {
                display: none;
            }

            .sidebar.collapsed .sidebar-nav-item {
                justify-content: center;
                padding: var(--spacing-sm);
            }

            .sidebar-footer {
                padding: var(--spacing-md);
                border-top: 1px solid var(--color-border);
            }

            .sidebar-user {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                padding: var(--spacing-sm);
                border-radius: var(--radius-md);
                overflow: hidden;
            }

            .sidebar-user-info {
                flex: 1;
                min-width: 0;
            }

            .sidebar-user-name {
                font-weight: var(--font-medium);
                font-size: var(--font-sm);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .sidebar-user-role {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
            }

            .sidebar.collapsed .sidebar-user-info,
            .sidebar.collapsed .sidebar-logout {
                display: none;
            }

            .sidebar-logout {
                padding: var(--spacing-xs);
                border-radius: var(--radius-md);
                color: var(--color-text-muted);
                transition: all var(--transition-fast);
            }

            .sidebar-logout:hover {
                background-color: var(--color-error-light);
                color: var(--color-error);
            }

            @media (max-width: 1023px) {
                .sidebar-toggle {
                    display: none;
                }
            }
        </style>

        <div class="sidebar-header">
            <div class="sidebar-logo">
                ${icons.mosque}
                <span>${i18n.t('appName')}</span>
            </div>
            <button class="sidebar-toggle" id="sidebar-toggle" title="${i18n.t('sidebar.collapse')}">
                ${icons.chevronRight}
            </button>
        </div>

        <nav class="sidebar-nav">
            ${getMenuItems().map(item => `
                <a href="${item.path}" data-link class="sidebar-nav-item ${currentPath === item.path ? 'active' : ''}">
                    ${icons[item.icon]}
                    <span>${item.label}</span>
                </a>
            `).join('')}
        </nav>

        <div class="sidebar-footer">
            <div class="sidebar-user">
                <div class="avatar">
                    ${user ? (user.first_name[0] + user.last_name[0]).toUpperCase() : 'U'}
                </div>
                <div class="sidebar-user-info">
                    <div class="sidebar-user-name">${user ? `${user.first_name} ${user.last_name}` : 'User'}</div>
                    <div class="sidebar-user-role">${user ? (user.role === 'admin' ? i18n.t('sidebar.admin') : user.role) : ''}</div>
                </div>
                <button class="sidebar-logout" id="logout-btn" title="${i18n.t('sidebar.logout')}">
                    ${icons.logout}
                </button>
            </div>
        </div>
    `;

    document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
        appState.toggleSidebar();
        renderSidebar();
        updateMainContentMargin();
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        import('../../services/auth.service.js').then(module => {
            module.default.logout();
        });
    });
}

function updateMainContentMargin() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        if (appState.get('sidebarCollapsed')) {
            mainContent.classList.add('sidebar-collapsed');
        } else {
            mainContent.classList.remove('sidebar-collapsed');
        }
    }
}

export function toggleMobileSidebar(show) {
    const sidebar = document.getElementById('sidebar');
    if (show) {
        sidebar.classList.add('mobile-open');
    } else {
        sidebar.classList.remove('mobile-open');
    }
}
