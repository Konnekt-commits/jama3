import { renderNavbar } from '../../components/navbar/navbar.js';
import apiService from '../../services/api.service.js';
import i18n from '../../services/i18n.service.js';
import { renderStudentsTab } from './students.tab.js';
import { renderClassesTab } from './classes.tab.js';
import { renderAttendanceTab } from './attendance.tab.js';
import { renderFeesTab } from './fees.tab.js';
import { renderEvaluationsTab } from './evaluations.tab.js';

const icons = {
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    book: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    checkSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
    wallet: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
};

let currentTab = 'students';

export async function renderSchoolPage() {
    renderNavbar('École Arabe');

    const pageContent = document.getElementById('page-content');

    pageContent.innerHTML = `
        <style>
            .school-page {
                padding: var(--spacing-md);
                max-width: 1400px;
                margin: 0 auto;
            }

            @media (min-width: 768px) {
                .school-page {
                    padding: var(--spacing-lg);
                }
            }

            .school-header {
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                border-radius: var(--radius-xl);
                padding: var(--spacing-xl);
                margin-bottom: var(--spacing-lg);
                color: white;
                position: relative;
                overflow: hidden;
            }

            .school-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                opacity: 0.5;
            }

            .school-header-content {
                position: relative;
                z-index: 1;
            }

            .school-header h1 {
                font-size: var(--font-2xl);
                font-weight: var(--font-bold);
                margin-bottom: var(--spacing-xs);
                font-family: var(--font-arabic-decorative);
            }

            .school-header p {
                opacity: 0.9;
                font-size: var(--font-base);
            }

            .school-stats {
                display: flex;
                gap: var(--spacing-lg);
                margin-top: var(--spacing-lg);
                flex-wrap: wrap;
            }

            .school-stat {
                text-align: center;
            }

            .school-stat-value {
                font-size: var(--font-2xl);
                font-weight: var(--font-bold);
            }

            .school-stat-label {
                font-size: var(--font-sm);
                opacity: 0.8;
            }

            .school-tabs {
                display: flex;
                gap: var(--spacing-xs);
                background-color: var(--color-bg-secondary);
                padding: var(--spacing-xs);
                border-radius: var(--radius-lg);
                margin-bottom: var(--spacing-lg);
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }

            .school-tab {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                padding: var(--spacing-sm) var(--spacing-md);
                border-radius: var(--radius-md);
                font-size: var(--font-sm);
                font-weight: var(--font-medium);
                color: var(--color-text-secondary);
                white-space: nowrap;
                transition: all var(--transition-fast);
                cursor: pointer;
                border: none;
                background: none;
            }

            .school-tab:hover {
                color: var(--color-text-primary);
                background-color: var(--color-bg-hover);
            }

            .school-tab.active {
                background-color: white;
                color: #059669;
                box-shadow: var(--shadow-sm);
            }

            [data-theme="dark"] .school-tab.active {
                background-color: var(--color-bg-tertiary);
            }

            .school-tab svg {
                width: 18px;
                height: 18px;
            }

            .school-tab-content {
                min-height: 400px;
            }

            @media (max-width: 640px) {
                .school-header {
                    padding: var(--spacing-lg);
                }

                .school-header h1 {
                    font-size: var(--font-xl);
                }

                .school-tab span {
                    display: none;
                }

                .school-tab {
                    padding: var(--spacing-sm);
                }
            }
        </style>

        <div class="school-page">
            <div class="school-header">
                <div class="school-header-content">
                    <h1>مدرسة اللغة العربية</h1>
                    <p>Gestion de l'école arabe et coranique</p>
                    <div class="school-stats" id="school-stats">
                        <div class="school-stat">
                            <div class="school-stat-value" id="stat-students">-</div>
                            <div class="school-stat-label">Élèves</div>
                        </div>
                        <div class="school-stat">
                            <div class="school-stat-value" id="stat-classes">-</div>
                            <div class="school-stat-label">Classes</div>
                        </div>
                        <div class="school-stat">
                            <div class="school-stat-value" id="stat-collection">-</div>
                            <div class="school-stat-label">Recouvrement</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="school-tabs">
                <button class="school-tab active" data-tab="students">
                    ${icons.users}
                    <span>Élèves</span>
                </button>
                <button class="school-tab" data-tab="classes">
                    ${icons.book}
                    <span>Classes</span>
                </button>
                <button class="school-tab" data-tab="attendance">
                    ${icons.checkSquare}
                    <span>Présences</span>
                </button>
                <button class="school-tab" data-tab="fees">
                    ${icons.wallet}
                    <span>Paiements</span>
                </button>
                <button class="school-tab" data-tab="evaluations">
                    ${icons.star}
                    <span>Évaluations</span>
                </button>
            </div>

            <div class="school-tab-content" id="school-tab-content">
                <!-- Tab content loaded here -->
            </div>
        </div>
    `;

    // Attach tab click handlers
    document.querySelectorAll('.school-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.school-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;
            loadTabContent(currentTab);
        });
    });

    // Load stats and initial tab
    loadStats();
    loadTabContent(currentTab);
}

async function loadStats() {
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
            const total = parseFloat(feesRes.data.total_amount) || 0;
            const paid = parseFloat(feesRes.data.total_paid) || 0;
            const rate = total > 0 ? Math.round((paid / total) * 100) : 0;
            document.getElementById('stat-collection').textContent = `${rate}%`;
        }
    } catch (error) {
        console.error('Error loading school stats:', error);
    }
}

async function loadTabContent(tab) {
    const container = document.getElementById('school-tab-content');

    switch (tab) {
        case 'students':
            renderStudentsTab(container);
            break;
        case 'classes':
            renderClassesTab(container);
            break;
        case 'attendance':
            renderAttendanceTab(container);
            break;
        case 'fees':
            renderFeesTab(container);
            break;
        case 'evaluations':
            renderEvaluationsTab(container);
            break;
        default:
            container.innerHTML = '<p>Onglet non trouvé</p>';
    }
}

export function refreshSchoolStats() {
    loadStats();
}

export function refreshCurrentTab() {
    loadTabContent(currentTab);
}
