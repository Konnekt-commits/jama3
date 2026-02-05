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
import { renderSettingsPage } from './pages/settings/settings.js';
import { renderSuperadminPage } from './pages/superadmin/superadmin.js';
import { renderLoginAdherentPage } from './pages/login-adherent/login-adherent.js';
import { renderSetupPasswordPage } from './pages/setup-password/setup-password.js';
import { renderStorePage } from './pages/store/store.js';
import { renderLoginParentPage } from './pages/parent/loginParent.js';
import { renderParentPage } from './pages/parent/parent.js';
import { renderMadrassaLanding } from './pages/madrassa/landing.js';
import { renderMadrassaOnboarding } from './pages/madrassa/onboarding.js';
import {
    renderSchoolDashboard,
    renderSchoolStudentsPage,
    renderSchoolClassesPage,
    renderSchoolSchedulePage,
    renderSchoolAttendancePage,
    renderSchoolFeesPage,
    renderSchoolEvaluationsPage,
    renderSchoolProgramsPage,
    renderSchoolEntPage,
    renderSchoolTeachersPage,
    renderSchoolParentsPage
} from './pages/school/school.js';

const publicRoutes = ['/login', '/register', '/onboarding', '/login-adherent', '/login-parent', '/parent', '/madrassa', '/madrassa/onboarding'];
const superadminRoutes = ['/superadmin'];
const membreRoutes = ['/membre'];
const schoolRoutes = ['/school', '/school/dashboard', '/school/students', '/school/classes', '/school/schedule', '/school/attendance', '/school/fees', '/school/evaluations', '/school/programs', '/school/ent', '/school/teachers', '/school/parents'];
const storeRoutes = ['/store'];

// Routes publiques
router.addRoute('/login', renderLoginPage);
router.addRoute('/onboarding', renderOnboardingPage);
router.addRoute('/register', renderOnboardingPage);
router.addRoute('/login-adherent', renderLoginAdherentPage);
router.addRoute('/login-parent', renderLoginParentPage);
router.addRoute('/parent', renderParentPage);
router.addRoute('/setup-password/:token', (params) => renderSetupPasswordPage(params.token));

// Landing page Madrassa (module école)
router.addRoute('/madrassa', renderMadrassaLanding);
router.addRoute('/madrassa/onboarding', renderMadrassaOnboarding);

// Route membre (vue simplifiée mobile)
router.addRoute('/membre', renderMembrePage, { requiresAuth: true });

// Routes protégées (admin/gestionnaire) - Module Jama3
router.addRoute('/', renderDashboardPage, { requiresAuth: true });
router.addRoute('/adherents', renderAdherentsPage, { requiresAuth: true });
router.addRoute('/adherents/:id', renderAdherentsPage, { requiresAuth: true });
router.addRoute('/cotisations', renderCotisationsPage, { requiresAuth: true });
router.addRoute('/agenda', renderAgendaPage, { requiresAuth: true });
router.addRoute('/intervenants', renderIntervenantsPage, { requiresAuth: true });
router.addRoute('/messages', renderMessagesPage, { requiresAuth: true });
router.addRoute('/settings', renderSettingsPage, { requiresAuth: true });

// Store (hub pour choisir le module)
router.addRoute('/store', renderStorePage, { requiresAuth: true });

// Module École - Routes séparées
router.addRoute('/school', renderSchoolDashboard, { requiresAuth: true });
router.addRoute('/school/dashboard', renderSchoolDashboard, { requiresAuth: true });
router.addRoute('/school/students', renderSchoolStudentsPage, { requiresAuth: true });
router.addRoute('/school/classes', renderSchoolClassesPage, { requiresAuth: true });
router.addRoute('/school/schedule', renderSchoolSchedulePage, { requiresAuth: true });
router.addRoute('/school/attendance', renderSchoolAttendancePage, { requiresAuth: true });
router.addRoute('/school/fees', renderSchoolFeesPage, { requiresAuth: true });
router.addRoute('/school/evaluations', renderSchoolEvaluationsPage, { requiresAuth: true });
router.addRoute('/school/programs', renderSchoolProgramsPage, { requiresAuth: true });
router.addRoute('/school/ent', renderSchoolEntPage, { requiresAuth: true });
router.addRoute('/school/teachers', renderSchoolTeachersPage, { requiresAuth: true });
router.addRoute('/school/parents', renderSchoolParentsPage, { requiresAuth: true });

// Route superadmin (accès super_admin uniquement)
router.addRoute('/superadmin', renderSuperadminPage, { requiresAuth: true, requiresSuperAdmin: true });

// Route membre avec token (publique, accès par magic link)
router.addRoute('/membre/:token', (params) => renderMembrePage(params.token));

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
    const path = router.getPath();
    const isPublicRoute = publicRoutes.includes(path);
    const isMadrassaRoute = path.startsWith('/madrassa');
    const isMembreWithToken = path.match(/^\/membre\/[a-f0-9]+$/);
    const isSetupPassword = path.startsWith('/setup-password/');
    const isSuperadminRoute = superadminRoutes.includes(path);
    const isAuthenticated = authService.isAuthenticated();
    const hasAdherentToken = !!localStorage.getItem('adherent_token');

    // Routes Madrassa (landing + onboarding) sont toujours publiques
    if (isMadrassaRoute) {
        return true;
    }

    // Routes publiques avec token
    if (isMembreWithToken || isSetupPassword) {
        return true;
    }

    // Route /membre accessible si adherent connecté
    if (path === '/membre' && hasAdherentToken) {
        return true;
    }

    // Route /parent accessible avec parent_token
    if (path === '/parent' && localStorage.getItem('parent_token')) {
        return true;
    }

    if (!isPublicRoute && !isAuthenticated) {
        // Save the intended destination for redirect after login
        localStorage.setItem('redirectAfterLogin', path);
        router.navigate('/login', true);
        return false;
    }

    if ((path === '/login' || path === '/onboarding') && isAuthenticated) {
        const user = authService.getUser();
        // Rediriger superadmin vers sa page dédiée
        if (user && user.role === 'super_admin') {
            router.navigate('/superadmin', true);
        } else {
            router.navigate('/', true);
        }
        return false;
    }

    // Vérifier accès superadmin
    if (isSuperadminRoute) {
        const user = authService.getUser();
        if (!user || user.role !== 'super_admin') {
            router.navigate('/', true);
            return false;
        }
    }

    return true;
});

router.setAfterEach((to, from) => {
    const path = router.getPath();
    const isPublicRoute = publicRoutes.includes(path);
    const isMembreRoute = membreRoutes.includes(path);
    const isSuperadminRoute = superadminRoutes.includes(path);
    const isMembreWithToken = path.match(/^\/membre\/[a-f0-9]+$/);
    const isSetupPassword = path.startsWith('/setup-password/');
    const isSchoolRoute = path.startsWith('/school');
    const isStoreRoute = storeRoutes.includes(path);
    const isSchoolScheduleRoute = path === '/school/schedule';
    const isMadrassaRoute = path.startsWith('/madrassa');

    // Handle fullscreen calendar mode for school schedule
    if (isSchoolScheduleRoute) {
        document.body.classList.add('fullscreen-calendar');
    } else {
        document.body.classList.remove('fullscreen-calendar');
    }

    if (!isPublicRoute && !isMembreRoute && !isSuperadminRoute && !isMembreWithToken && !isSetupPassword && !isSchoolRoute && !isStoreRoute && !isMadrassaRoute && authService.isAuthenticated()) {
        hideLoginUI();
        // Render Jama3 sidebar (this resets the sidebar class and content)
        renderSidebar();
        renderMobileNav();
    }

    // For school routes, sidebar is handled by initSchoolModule
    // For store route, sidebar is hidden in renderStorePage

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
