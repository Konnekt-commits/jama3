import router from './router/router.js';
import appState from './store/appState.store.js';
import authService from './services/auth.service.js';
import { renderSidebar } from './components/sidebar/sidebar.js';
import { renderNavbar } from './components/navbar/navbar.js';
import { renderMobileNav } from './components/navbar/mobileNav.js';

import { renderLoginPage, hideLoginUI } from './pages/login/login.js';
import { renderOnboardingPage } from './pages/onboarding/onboarding.js';
import { renderMembrePage } from './pages/membre/membre.js';
import { renderDashboardPage } from './pages/dashboard/dashboard.js';
import { renderAdherentsPage } from './pages/adherents/adherents.js';
import { renderCotisationsPage } from './pages/cotisations/cotisations.js';
import { renderAgendaPage } from './pages/agenda/agenda.js';
import { renderIntervenantsPage } from './pages/intervenants/intervenants.js';
import { renderMessagesPage } from './pages/messages/messages.js';

const publicRoutes = ['/login', '/register', '/onboarding'];
const membreRoutes = ['/membre'];

// Routes publiques
router.addRoute('/login', renderLoginPage);
router.addRoute('/onboarding', renderOnboardingPage);
router.addRoute('/register', renderOnboardingPage); // Rediriger register vers onboarding

// Route membre (vue simplifiée mobile)
router.addRoute('/membre', renderMembrePage, { requiresAuth: true });

// Routes protégées (admin/gestionnaire)
router.addRoute('/', renderDashboardPage, { requiresAuth: true });
router.addRoute('/adherents', renderAdherentsPage, { requiresAuth: true });
router.addRoute('/adherents/:id', renderAdherentsPage, { requiresAuth: true });
router.addRoute('/cotisations', renderCotisationsPage, { requiresAuth: true });
router.addRoute('/agenda', renderAgendaPage, { requiresAuth: true });
router.addRoute('/intervenants', renderIntervenantsPage, { requiresAuth: true });
router.addRoute('/messages', renderMessagesPage, { requiresAuth: true });

router.addRoute('/404', () => {
    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `
        <div class="empty-state" style="min-height: 60vh;">
            <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            <h1 class="empty-state-title">Page non trouvée</h1>
            <p class="empty-state-description">La page que vous recherchez n'existe pas.</p>
            <a href="/" data-link class="btn btn-primary">Retour à l'accueil</a>
        </div>
    `;
});

router.setBeforeEach(async (to, from) => {
    const path = window.location.pathname;
    const isPublicRoute = publicRoutes.includes(path);
    const isAuthenticated = authService.isAuthenticated();

    if (!isPublicRoute && !isAuthenticated) {
        router.navigate('/login', true);
        return false;
    }

    if ((path === '/login' || path === '/onboarding') && isAuthenticated) {
        router.navigate('/', true);
        return false;
    }

    return true;
});

router.setAfterEach((to, from) => {
    const path = window.location.pathname;
    const isPublicRoute = publicRoutes.includes(path);
    const isMembreRoute = membreRoutes.includes(path);

    if (!isPublicRoute && !isMembreRoute && authService.isAuthenticated()) {
        hideLoginUI();
        renderSidebar();
        renderMobileNav();
    }

    window.scrollTo(0, 0);
});

async function initApp() {
    console.log('jama3 - Application de gestion d\'association');

    const theme = appState.get('theme');
    document.documentElement.setAttribute('data-theme', theme);

    router.start();
}

document.addEventListener('DOMContentLoaded', initApp);

export { router, appState };
