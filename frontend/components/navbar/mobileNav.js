import i18n from '../../services/i18n.service.js';

const getMenuItems = () => [
    { path: '/', icon: 'dashboard', label: i18n.t('nav.dashboard') },
    { path: '/adherents', icon: 'users', label: i18n.t('nav.adherents') },
    { path: '/cotisations', icon: 'wallet', label: i18n.t('nav.cotisations') },
    { path: '/agenda', icon: 'calendar', label: i18n.t('nav.agenda') },
    { path: '/messages', icon: 'message', label: i18n.t('nav.messages') }
];

const icons = {
    dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    wallet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    message: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
};

export function renderMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    const currentPath = window.location.pathname;

    mobileNav.innerHTML = `
        <style>
            .mobile-nav {
                display: flex;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: var(--mobile-nav-height);
                background-color: var(--color-navbar-bg);
                background-image: var(--pattern-geometric);
                border-top: 1px solid var(--color-navbar-border);
                z-index: var(--z-fixed);
                padding-bottom: env(safe-area-inset-bottom);
            }

            .mobile-nav::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg,
                    transparent 0%,
                    var(--color-primary) 30%,
                    var(--color-warning) 50%,
                    var(--color-primary) 70%,
                    transparent 100%
                );
                opacity: 0.5;
            }

            @media (min-width: 1024px) {
                .mobile-nav {
                    display: none;
                }
            }

            .mobile-nav-item {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-xs);
                color: var(--color-text-muted);
                transition: all var(--transition-fast);
                padding: var(--spacing-xs);
            }

            .mobile-nav-item:hover {
                color: var(--color-text-secondary);
            }

            .mobile-nav-item.active {
                color: var(--color-primary);
            }

            .mobile-nav-item svg {
                width: 24px;
                height: 24px;
            }

            .mobile-nav-item span {
                font-size: 10px;
                font-weight: var(--font-medium);
            }
        </style>

        ${getMenuItems().map(item => `
            <a href="${item.path}" data-link class="mobile-nav-item ${currentPath === item.path ? 'active' : ''}">
                ${icons[item.icon]}
                <span>${item.label}</span>
            </a>
        `).join('')}
    `;
}
