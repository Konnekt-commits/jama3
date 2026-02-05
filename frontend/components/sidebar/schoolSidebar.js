import appState from '../../store/appState.store.js';

const getSchoolMenuItems = () => [
    { path: '/school/dashboard', icon: 'dashboard', label: 'Tableau de bord' },
    { path: '/school/students', icon: 'users', label: 'Élèves' },
    { path: '/school/teachers', icon: 'teacher', label: 'Enseignants' },
    { path: '/school/parents', icon: 'parents', label: 'Parents' },
    { path: '/school/classes', icon: 'book', label: 'Classes' },
    { path: '/school/schedule', icon: 'calendar', label: 'Emploi du temps' },
    { path: '/school/attendance', icon: 'checkSquare', label: 'Présences' },
    { path: '/school/fees', icon: 'wallet', label: 'Paiements' },
    { path: '/school/evaluations', icon: 'star', label: 'Évaluations' },
    { path: '/school/programs', icon: 'clipboard', label: 'Programmes' },
    { path: '/school/ent', icon: 'home', label: 'Espace ENT' },
];

const icons = {
    dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    teacher: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    parents: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    book: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    checkSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
    wallet: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    clipboard: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
    home: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
    chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    store: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    schoolLogo: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M8 7h8" opacity="0.5"></path><path d="M8 11h8" opacity="0.5"></path></svg>`
};

export function renderSchoolSidebar() {
    const sidebar = document.getElementById('sidebar');
    const isCollapsed = appState.get('sidebarCollapsed');
    const currentPath = window.location.pathname;
    const user = appState.get('user');

    sidebar.className = `sidebar school-sidebar ${isCollapsed ? 'collapsed' : ''}`;

    // Détecter le thème
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Couleurs adaptées au thème
    const oliveMain = isDark ? '#8B9A6B' : '#6B8E23';
    const oliveDark = isDark ? '#6B7A4B' : '#4A6318';
    const oliveHover = isDark ? '#7A8A5B' : '#556B2F';
    const goldAccent = '#D4A84B';

    // Couleurs de fond
    const bgColor = isDark ? '#1E1812' : '#1a2314';
    const bgGradient1 = isDark ? 'rgba(212, 168, 75, 0.08)' : 'rgba(107, 142, 35, 0.1)';
    const bgGradient2 = isDark ? 'rgba(212, 168, 75, 0.05)' : 'rgba(107, 142, 35, 0.08)';
    const borderColor = isDark ? 'rgba(212, 168, 75, 0.15)' : 'rgba(107, 142, 35, 0.2)';

    // Couleurs d'interaction
    const hoverBg = isDark ? 'rgba(212, 168, 75, 0.1)' : 'rgba(107, 142, 35, 0.1)';
    const hoverBgStrong = isDark ? 'rgba(212, 168, 75, 0.15)' : 'rgba(107, 142, 35, 0.15)';
    const activeBg = isDark
        ? `linear-gradient(135deg, rgba(212, 168, 75, 0.25) 0%, rgba(168, 128, 60, 0.15) 100%)`
        : `linear-gradient(135deg, rgba(107, 142, 35, 0.3) 0%, rgba(74, 99, 24, 0.2) 100%)`;
    const activeBorder = isDark ? 'rgba(212, 168, 75, 0.3)' : 'rgba(107, 142, 35, 0.3)';
    const dividerColor = isDark ? 'rgba(212, 168, 75, 0.15)' : 'rgba(107, 142, 35, 0.15)';

    sidebar.innerHTML = `
        <style>
            .sidebar.school-sidebar {
                position: fixed;
                left: 0;
                top: 0;
                height: 100vh;
                width: var(--sidebar-width);
                background-color: ${bgColor};
                background-image:
                    radial-gradient(circle at 20% 80%, ${bgGradient1} 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, ${bgGradient2} 0%, transparent 50%);
                border-right: 1px solid ${borderColor};
                display: flex;
                flex-direction: column;
                z-index: var(--z-fixed);
                transition: width var(--transition-normal),
                            transform var(--transition-normal);
                transform: translateX(-100%);
            }

            @media (min-width: 1024px) {
                .sidebar.school-sidebar {
                    transform: translateX(0);
                }

                .sidebar.school-sidebar.collapsed {
                    width: var(--sidebar-collapsed-width);
                }
            }

            .sidebar.school-sidebar.mobile-open {
                transform: translateX(0);
            }

            .school-sidebar .sidebar-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: var(--spacing-lg);
                border-bottom: 1px solid ${borderColor};
            }

            .school-sidebar .sidebar-logo {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                font-weight: var(--font-bold);
                font-size: var(--font-lg);
                color: ${oliveMain};
                overflow: hidden;
                white-space: nowrap;
            }

            .school-sidebar .sidebar-logo .logo-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, ${oliveMain} 0%, ${oliveDark} 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }

            .school-sidebar.collapsed .sidebar-logo span {
                display: none;
            }

            .school-sidebar .sidebar-toggle {
                padding: var(--spacing-xs);
                border-radius: var(--radius-md);
                color: rgba(255, 255, 255, 0.5);
                transition: all var(--transition-fast);
                background: none;
                border: none;
                cursor: pointer;
            }

            .school-sidebar .sidebar-toggle:hover {
                background-color: ${hoverBg};
                color: ${isDark ? goldAccent : oliveMain};
            }

            .school-sidebar.collapsed .sidebar-toggle svg {
                transform: rotate(180deg);
            }

            .school-sidebar .sidebar-nav {
                flex: 1;
                padding: var(--spacing-md);
                overflow-y: auto;
            }

            .school-sidebar .sidebar-nav-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                padding: var(--spacing-sm) var(--spacing-md);
                margin-bottom: var(--spacing-xs);
                border-radius: var(--radius-md);
                color: rgba(255, 255, 255, 0.7);
                transition: all var(--transition-fast);
                white-space: nowrap;
                overflow: hidden;
                text-decoration: none;
            }

            .school-sidebar .sidebar-nav-item:hover {
                background-color: ${hoverBgStrong};
                color: white;
            }

            .school-sidebar .sidebar-nav-item.active {
                background: ${activeBg};
                color: ${isDark ? goldAccent : oliveMain};
                border: 1px solid ${activeBorder};
            }

            .school-sidebar .sidebar-nav-item svg {
                flex-shrink: 0;
            }

            .school-sidebar.collapsed .sidebar-nav-item span {
                display: none;
            }

            .school-sidebar.collapsed .sidebar-nav-item {
                justify-content: center;
                padding: var(--spacing-sm);
            }

            .school-sidebar .sidebar-divider {
                height: 1px;
                background: ${dividerColor};
                margin: var(--spacing-md) 0;
            }

            .school-sidebar .sidebar-back-link {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                padding: var(--spacing-sm) var(--spacing-md);
                border-radius: var(--radius-md);
                color: rgba(255, 255, 255, 0.5);
                transition: all var(--transition-fast);
                text-decoration: none;
                font-size: var(--font-sm);
            }

            .school-sidebar .sidebar-back-link:hover {
                background-color: rgba(255, 255, 255, 0.05);
                color: rgba(255, 255, 255, 0.8);
            }

            .school-sidebar .sidebar-footer {
                padding: var(--spacing-md);
                border-top: 1px solid ${borderColor};
            }

            .school-sidebar .sidebar-user {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                padding: var(--spacing-sm);
                border-radius: var(--radius-md);
                overflow: hidden;
            }

            .school-sidebar .sidebar-user .avatar {
                width: 36px;
                height: 36px;
                border-radius: 10px;
                background: linear-gradient(135deg, ${oliveMain} 0%, ${oliveDark} 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                font-size: 14px;
            }

            .school-sidebar .sidebar-user-info {
                flex: 1;
                min-width: 0;
            }

            .school-sidebar .sidebar-user-name {
                font-weight: var(--font-medium);
                font-size: var(--font-sm);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: white;
            }

            .school-sidebar .sidebar-user-role {
                font-size: var(--font-xs);
                color: rgba(255, 255, 255, 0.5);
            }

            .school-sidebar.collapsed .sidebar-user-info,
            .school-sidebar.collapsed .sidebar-logout {
                display: none;
            }

            .school-sidebar .sidebar-logout {
                padding: var(--spacing-xs);
                border-radius: var(--radius-md);
                color: rgba(255, 255, 255, 0.5);
                transition: all var(--transition-fast);
                background: none;
                border: none;
                cursor: pointer;
            }

            .school-sidebar .sidebar-logout:hover {
                background-color: rgba(205, 92, 92, 0.2);
                color: #CD5C5C;
            }

            @media (max-width: 1023px) {
                .school-sidebar .sidebar-toggle {
                    display: none;
                }
            }
        </style>

        <div class="sidebar-header">
            <div class="sidebar-logo">
                <div class="logo-icon">
                    ${icons.schoolLogo}
                </div>
                <span>École Arabe</span>
            </div>
            <button class="sidebar-toggle" id="school-sidebar-toggle">
                ${icons.chevronRight}
            </button>
        </div>

        <nav class="sidebar-nav">
            ${getSchoolMenuItems().map(item => `
                <a href="${item.path}" data-link class="sidebar-nav-item ${currentPath === item.path || (currentPath === '/school' && item.path === '/school/dashboard') ? 'active' : ''}">
                    ${icons[item.icon]}
                    <span>${item.label}</span>
                </a>
            `).join('')}

            <div class="sidebar-divider"></div>

            <a href="/store" data-link class="sidebar-back-link">
                ${icons.store}
                <span>Retour au Store</span>
            </a>
        </nav>

        <div class="sidebar-footer">
            <div class="sidebar-user">
                <div class="avatar">
                    ${user ? (user.first_name[0] + user.last_name[0]).toUpperCase() : 'U'}
                </div>
                <div class="sidebar-user-info">
                    <div class="sidebar-user-name">${user ? `${user.first_name} ${user.last_name}` : 'User'}</div>
                    <div class="sidebar-user-role">${user ? (user.role === 'admin' ? 'Administrateur' : user.role) : ''}</div>
                </div>
                <button class="sidebar-logout" id="school-logout-btn" title="Se déconnecter">
                    ${icons.logout}
                </button>
            </div>
        </div>
    `;

    document.getElementById('school-sidebar-toggle')?.addEventListener('click', () => {
        appState.toggleSidebar();
        renderSchoolSidebar();
        updateMainContentMargin();
    });

    document.getElementById('school-logout-btn')?.addEventListener('click', () => {
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

export function toggleSchoolMobileSidebar(show) {
    const sidebar = document.getElementById('sidebar');
    if (show) {
        sidebar.classList.add('mobile-open');
    } else {
        sidebar.classList.remove('mobile-open');
    }
}
