import appState from '../../store/appState.store.js';
import { toggleMobileSidebar } from '../sidebar/sidebar.js';
import i18n from '../../services/i18n.service.js';

const icons = {
    menu: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
    sun: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    bell: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    language: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`
};

export function renderNavbar(title = '') {
    const navbar = document.getElementById('navbar');
    const theme = appState.get('theme');
    const unreadMessages = appState.get('unreadMessages');

    navbar.innerHTML = `
        <style>
            .navbar {
                position: sticky;
                top: 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: var(--navbar-height);
                padding: 0 var(--spacing-md);
                background-color: var(--color-navbar-bg);
                background-image: var(--pattern-geometric);
                border-bottom: 1px solid var(--color-navbar-border);
                z-index: var(--z-sticky);
            }

            .navbar::after {
                content: '';
                position: absolute;
                bottom: 0;
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
                .navbar {
                    padding: 0 var(--spacing-xl);
                }
            }

            .navbar-left {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
            }

            .navbar-menu-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--spacing-sm);
                border-radius: var(--radius-md);
                color: var(--color-text-secondary);
                transition: all var(--transition-fast);
            }

            .navbar-menu-btn:hover {
                background-color: var(--color-bg-hover);
                color: var(--color-text-primary);
            }

            @media (min-width: 1024px) {
                .navbar-menu-btn {
                    display: none;
                }
            }

            .navbar-title {
                font-size: var(--font-lg);
                font-weight: var(--font-semibold);
            }

            @media (max-width: 639px) {
                .navbar-title {
                    display: none;
                }
            }

            .navbar-right {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }

            .navbar-search {
                display: none;
                align-items: center;
                position: relative;
            }

            @media (min-width: 768px) {
                .navbar-search {
                    display: flex;
                }
            }

            .navbar-search-input {
                width: 240px;
                padding: var(--spacing-sm) var(--spacing-md);
                padding-left: calc(var(--spacing-md) + 24px);
                background-color: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-full);
                font-size: var(--font-sm);
                transition: all var(--transition-fast);
            }

            .navbar-search-input:focus {
                outline: none;
                border-color: var(--color-primary);
                width: 300px;
            }

            .navbar-search-icon {
                position: absolute;
                left: var(--spacing-md);
                color: var(--color-text-muted);
            }

            .navbar-icon-btn {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                border-radius: var(--radius-full);
                color: var(--color-text-secondary);
                transition: all var(--transition-fast);
            }

            .navbar-icon-btn:hover {
                background-color: var(--color-bg-hover);
                color: var(--color-text-primary);
            }

            .navbar-lang-btn .lang-label {
                font-weight: var(--font-bold);
                font-size: var(--font-sm);
            }

            .navbar-notification-badge {
                position: absolute;
                top: 4px;
                right: 4px;
                width: 18px;
                height: 18px;
                background-color: var(--color-error);
                color: var(--color-white);
                font-size: 10px;
                font-weight: var(--font-bold);
                border-radius: var(--radius-full);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .sidebar-overlay {
                display: none;
                position: fixed;
                inset: 0;
                background-color: var(--color-modal-backdrop);
                z-index: calc(var(--z-fixed) - 1);
            }

            .sidebar-overlay.visible {
                display: block;
            }
        </style>

        <div class="navbar-left">
            <button class="navbar-menu-btn" id="mobile-menu-btn">
                ${icons.menu}
            </button>
            <h1 class="navbar-title">${title}</h1>
        </div>

        <div class="navbar-right">
            <div class="navbar-search">
                <span class="navbar-search-icon">${icons.search}</span>
                <input type="text" class="navbar-search-input" placeholder="${i18n.t('navbar.search')}" id="global-search">
            </div>

            <button class="navbar-icon-btn navbar-lang-btn" id="lang-toggle" title="${i18n.t('navbar.language')}">
                <span class="lang-label">${i18n.lang === 'fr' ? 'ع' : 'FR'}</span>
            </button>

            <button class="navbar-icon-btn" id="theme-toggle" title="${i18n.t('navbar.theme')}">
                ${theme === 'light' ? icons.moon : icons.sun}
            </button>

            <button class="navbar-icon-btn" id="notifications-btn" title="${i18n.t('navbar.notifications')}">
                ${icons.bell}
                ${unreadMessages > 0 ? `<span class="navbar-notification-badge">${unreadMessages > 9 ? '9+' : unreadMessages}</span>` : ''}
            </button>
        </div>

        <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;

    document.getElementById('lang-toggle')?.addEventListener('click', () => {
        i18n.toggleLang();
        // Reload the current page to apply translations
        window.location.reload();
    });

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        appState.toggleTheme();
        renderNavbar(title);
    });

    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        toggleMobileSidebar(true);
        document.getElementById('sidebar-overlay').classList.add('visible');
    });

    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
        toggleMobileSidebar(false);
        document.getElementById('sidebar-overlay').classList.remove('visible');
    });

    document.getElementById('notifications-btn')?.addEventListener('click', () => {
        import('../../router/router.js').then(module => {
            module.default.navigate('/messages');
        });
    });

    document.getElementById('global-search')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                import('../../router/router.js').then(module => {
                    module.default.navigate(`/adherents?search=${encodeURIComponent(query)}`);
                });
            }
        }
    });
}

export function setNavbarTitle(title) {
    const titleEl = document.querySelector('.navbar-title');
    if (titleEl) {
        titleEl.textContent = title;
    }
}
