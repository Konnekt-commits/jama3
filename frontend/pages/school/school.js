import { renderNavbar } from '../../components/navbar/navbar.js';
import { renderSchoolSidebar } from '../../components/sidebar/schoolSidebar.js';
import { renderMobileNav } from '../../components/navbar/mobileNav.js';
import apiService from '../../services/api.service.js';
import { renderStudentsTab } from './students.tab.js';
import { renderClassesTab } from './classes.tab.js';
import { renderScheduleTab } from './schedule.tab.js';
import { renderAttendanceTab } from './attendance.tab.js';
import { renderFeesTab } from './fees.tab.js';
import { renderEvaluationsTab } from './evaluations.tab.js';
import { renderProgramsTab } from './programs.tab.js';
import { renderEntTab } from './ent.tab.js';
import { renderTeachersTab } from './teachers.tab.js';
import { renderParentsTab } from './parents.tab.js';

const icons = {
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    book: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    checkSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
    wallet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    clipboard: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
    trendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    percent: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>`
};

// Initialize school module
export function initSchoolModule() {
    // Show sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.style.display = '';
    }

    // Render school sidebar
    renderSchoolSidebar();
    renderMobileNav();

    // Adjust main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.marginLeft = '';
    }
}

// Dashboard page
export async function renderSchoolDashboard() {
    initSchoolModule();
    renderNavbar('Tableau de bord');

    const pageContent = document.getElementById('page-content');

    pageContent.innerHTML = `
        <style>
            .school-dashboard {
                padding: var(--spacing-md);
                max-width: 1400px;
                margin: 0 auto;
            }

            @media (min-width: 768px) {
                .school-dashboard {
                    padding: var(--spacing-lg);
                }
            }

            .school-welcome {
                background: linear-gradient(135deg, var(--school-primary) 0%, var(--school-primary-dark) 100%);
                border-radius: var(--radius-xl);
                padding: var(--spacing-xl);
                margin-bottom: var(--spacing-lg);
                color: white;
                position: relative;
                overflow: hidden;
            }

            .school-welcome::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                opacity: 0.5;
            }

            .school-welcome-content {
                position: relative;
                z-index: 1;
            }

            .school-welcome h1 {
                font-size: var(--font-2xl);
                font-weight: var(--font-bold);
                margin-bottom: var(--spacing-xs);
                font-family: var(--font-arabic-decorative);
            }

            .school-welcome p {
                opacity: 0.9;
                font-size: var(--font-base);
            }

            .school-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
            }

            .school-stat-card {
                background: var(--color-card-bg);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: var(--spacing-lg);
                display: flex;
                align-items: flex-start;
                gap: var(--spacing-md);
            }

            .school-stat-icon {
                width: 48px;
                height: 48px;
                border-radius: var(--radius-md);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .school-stat-icon.green {
                background: var(--school-primary-light);
                color: var(--school-primary);
            }

            .school-stat-icon.blue {
                background: rgba(59, 130, 246, 0.1);
                color: #3b82f6;
            }

            .school-stat-icon.amber {
                background: rgba(245, 158, 11, 0.1);
                color: #f59e0b;
            }

            .school-stat-icon.purple {
                background: rgba(139, 92, 246, 0.1);
                color: #8b5cf6;
            }

            .school-stat-info {
                flex: 1;
            }

            .school-stat-value {
                font-size: var(--font-2xl);
                font-weight: var(--font-bold);
                color: var(--color-text-primary);
            }

            .school-stat-label {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }

            .school-quick-actions {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: var(--spacing-md);
            }

            .quick-action-card {
                background: var(--color-card-bg);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: var(--spacing-lg);
                cursor: pointer;
                transition: all 0.2s;
            }

            .quick-action-card:hover {
                border-color: var(--school-primary);
                transform: translateY(-2px);
                box-shadow: 0 4px 20px var(--school-primary-light);
            }

            .quick-action-card h3 {
                font-size: var(--font-base);
                font-weight: var(--font-semibold);
                margin-bottom: var(--spacing-xs);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }

            .quick-action-card h3 svg {
                color: var(--school-primary);
            }

            .quick-action-card p {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }
        </style>

        <div class="school-dashboard">
            <div class="school-welcome">
                <div class="school-welcome-content">
                    <h1>مدرسة اللغة العربية</h1>
                    <p>Bienvenue dans le module de gestion de l'école arabe et coranique</p>
                </div>
            </div>

            <div class="school-stats-grid">
                <div class="school-stat-card">
                    <div class="school-stat-icon green">
                        ${icons.users}
                    </div>
                    <div class="school-stat-info">
                        <div class="school-stat-value" id="stat-students">-</div>
                        <div class="school-stat-label">Élèves actifs</div>
                    </div>
                </div>
                <div class="school-stat-card">
                    <div class="school-stat-icon blue">
                        ${icons.book}
                    </div>
                    <div class="school-stat-info">
                        <div class="school-stat-value" id="stat-classes">-</div>
                        <div class="school-stat-label">Classes actives</div>
                    </div>
                </div>
                <div class="school-stat-card">
                    <div class="school-stat-icon amber">
                        ${icons.wallet}
                    </div>
                    <div class="school-stat-info">
                        <div class="school-stat-value" id="stat-fees">-</div>
                        <div class="school-stat-label">Paiements en attente</div>
                    </div>
                </div>
                <div class="school-stat-card">
                    <div class="school-stat-icon purple">
                        ${icons.percent}
                    </div>
                    <div class="school-stat-info">
                        <div class="school-stat-value" id="stat-collection">-</div>
                        <div class="school-stat-label">Taux de recouvrement</div>
                    </div>
                </div>
            </div>

            <h2 style="font-size: var(--font-lg); margin-bottom: var(--spacing-md);">Accès rapide</h2>
            <div class="school-quick-actions">
                <div class="quick-action-card" onclick="window.location.href='/school/students'">
                    <h3>${icons.users} Gérer les élèves</h3>
                    <p>Ajouter, modifier ou consulter les fiches élèves</p>
                </div>
                <div class="quick-action-card" onclick="window.location.href='/school/attendance'">
                    <h3>${icons.checkSquare} Faire l'appel</h3>
                    <p>Enregistrer les présences d'une classe</p>
                </div>
                <div class="quick-action-card" onclick="window.location.href='/school/fees'">
                    <h3>${icons.wallet} Paiements</h3>
                    <p>Gérer les frais de scolarité</p>
                </div>
                <div class="quick-action-card" onclick="window.location.href='/school/evaluations'">
                    <h3>${icons.star} Évaluations</h3>
                    <p>Saisir les notes et appréciations</p>
                </div>
            </div>
        </div>
    `;

    loadDashboardStats();
}

async function loadDashboardStats() {
    try {
        const [studentsRes, classesRes, feesRes] = await Promise.all([
            apiService.getStudentStats(),
            apiService.getSchoolClassStats(),
            apiService.getSchoolFeeStats()
        ]);

        if (studentsRes.success) {
            document.getElementById('stat-students').textContent = studentsRes.data.actifs || 0;
        }

        if (classesRes.success) {
            document.getElementById('stat-classes').textContent = classesRes.data.active_classes || 0;
        }

        if (feesRes.success) {
            const pendingCount = (parseInt(feesRes.data.pending_count) || 0) + (parseInt(feesRes.data.partial_count) || 0);
            document.getElementById('stat-fees').textContent = pendingCount;

            const total = parseFloat(feesRes.data.total_amount) || 0;
            const paid = parseFloat(feesRes.data.total_paid) || 0;
            const rate = total > 0 ? Math.round((paid / total) * 100) : 0;
            document.getElementById('stat-collection').textContent = `${rate}%`;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Students page
export async function renderSchoolStudentsPage() {
    initSchoolModule();
    renderNavbar('Élèves');

    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `
        <div style="padding: var(--spacing-md); max-width: 1400px; margin: 0 auto;">
            <div id="school-content"></div>
        </div>
    `;

    renderStudentsTab(document.getElementById('school-content'));
}

// Classes page
export async function renderSchoolClassesPage() {
    initSchoolModule();
    renderNavbar('Classes');

    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `
        <div style="padding: var(--spacing-md); max-width: 1400px; margin: 0 auto;">
            <div id="school-content"></div>
        </div>
    `;

    renderClassesTab(document.getElementById('school-content'));
}

// Attendance page
export async function renderSchoolAttendancePage() {
    initSchoolModule();
    renderNavbar('Présences');

    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `
        <div style="padding: var(--spacing-md); max-width: 1400px; margin: 0 auto;">
            <div id="school-content"></div>
        </div>
    `;

    renderAttendanceTab(document.getElementById('school-content'));
}

// Fees page
export async function renderSchoolFeesPage() {
    initSchoolModule();
    renderNavbar('Paiements');

    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `
        <div style="padding: var(--spacing-md); max-width: 1400px; margin: 0 auto;">
            <div id="school-content"></div>
        </div>
    `;

    renderFeesTab(document.getElementById('school-content'));
}

// Evaluations page
export async function renderSchoolEvaluationsPage() {
    initSchoolModule();
    renderNavbar('Évaluations');

    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `
        <div style="padding: var(--spacing-md); max-width: 1400px; margin: 0 auto;">
            <div id="school-content"></div>
        </div>
    `;

    renderEvaluationsTab(document.getElementById('school-content'));
}

// Programs page
export async function renderSchoolProgramsPage() {
    initSchoolModule();
    renderNavbar('Programmes');

    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `
        <div style="padding: var(--spacing-md); max-width: 1400px; margin: 0 auto;">
            <div id="school-content"></div>
        </div>
    `;

    renderProgramsTab(document.getElementById('school-content'));
}

// ENT page
export async function renderSchoolEntPage() {
    initSchoolModule();
    renderNavbar('Espace Parents');

    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `
        <div style="padding: var(--spacing-md); max-width: 1400px; margin: 0 auto;">
            <div id="school-content"></div>
        </div>
    `;

    renderEntTab(document.getElementById('school-content'));
}

// Schedule page (fullscreen calendar)
export async function renderSchoolSchedulePage() {
    initSchoolModule();
    // Don't render navbar for schedule - it has its own full-screen header

    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `<div id="school-content" class="fullscreen-content"></div>`;

    renderScheduleTab(document.getElementById('school-content'));
}

// Teachers page
export async function renderSchoolTeachersPage() {
    initSchoolModule();
    renderNavbar('Enseignants');

    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `
        <div style="padding: var(--spacing-md); max-width: 1400px; margin: 0 auto;">
            <div id="school-content"></div>
        </div>
    `;

    renderTeachersTab(document.getElementById('school-content'));
}

// Parents page
export async function renderSchoolParentsPage() {
    initSchoolModule();
    renderNavbar('Parents d\'eleves');

    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = `<div id="school-content" class="fullscreen-content"></div>`;

    renderParentsTab(document.getElementById('school-content'));
}

// Legacy function for backward compatibility
export async function renderSchoolPage() {
    // Redirect to dashboard
    window.location.href = '/school/dashboard';
}

export function refreshSchoolStats() {
    loadDashboardStats();
}
