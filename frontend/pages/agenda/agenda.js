import apiService from '../../services/api.service.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';

let currentView = 'month';
let currentDate = new Date();
let selectedDate = new Date();
let eventsCache = [];
let sidebarOpen = true;

const EVENT_COLORS = {
    cours: '#8B6914',
    atelier: '#6B8E23',
    reunion: '#20B2AA',
    sortie: '#CD5C5C',
    competition: '#8B4557',
    autre: '#5A4735'
};

const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const MONTH_NAMES_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAY_NAMES_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export async function renderAgendaPage() {
    // Hide default navbar and sidebar for full screen
    const navbar = document.querySelector('.navbar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');

    if (navbar) navbar.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';
    if (mainContent) {
        mainContent.style.marginLeft = '0';
        mainContent.style.paddingTop = '0';
    }

    const pageContent = document.getElementById('page-content');
    pageContent.style.padding = '0';
    pageContent.style.maxWidth = 'none';

    pageContent.innerHTML = `
        <style>
            .gcal {
                display: flex;
                height: 100vh;
                width: 100vw;
                background: var(--color-bg-primary);
                font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif;
                overflow: hidden;
            }

            /* Top Header */
            .gcal-header {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 64px;
                background: var(--color-card-bg);
                border-bottom: 1px solid var(--color-border);
                display: flex;
                align-items: center;
                padding: 0 16px;
                z-index: 100;
                gap: 16px;
            }

            .gcal-menu-btn {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                border: none;
                background: transparent;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--color-text-secondary);
            }

            .gcal-menu-btn:hover {
                background: var(--color-bg-hover);
            }

            .gcal-logo {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 22px;
                color: var(--color-text-muted);
                font-weight: 400;
                min-width: 180px;
            }

            .gcal-logo-icon {
                width: 40px;
                height: 40px;
                background: var(--color-primary);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }

            .gcal-header-nav {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .gcal-today-btn {
                padding: 0 24px;
                height: 36px;
                border: 1px solid var(--color-border);
                border-radius: 4px;
                background: var(--color-card-bg);
                color: var(--color-text-primary);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.1s;
            }

            .gcal-today-btn:hover {
                background: var(--color-bg-hover);
            }

            .gcal-nav-arrows {
                display: flex;
                gap: 0;
            }

            .gcal-nav-btn {
                width: 36px;
                height: 36px;
                border: none;
                background: transparent;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--color-text-secondary);
            }

            .gcal-nav-btn:hover {
                background: var(--color-bg-hover);
            }

            .gcal-current-date {
                font-size: 22px;
                font-weight: 400;
                color: var(--color-text-primary);
                min-width: 200px;
            }

            .gcal-header-right {
                margin-left: auto;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .gcal-view-dropdown {
                position: relative;
            }

            .gcal-view-btn {
                padding: 0 16px;
                height: 36px;
                border: 1px solid var(--color-border);
                border-radius: 4px;
                background: var(--color-card-bg);
                color: var(--color-text-primary);
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .gcal-view-btn:hover {
                background: var(--color-bg-hover);
            }

            .gcal-view-menu {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 4px;
                background: var(--color-card-bg);
                border: 1px solid var(--color-border);
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                min-width: 120px;
                display: none;
                z-index: 200;
            }

            .gcal-view-menu.open {
                display: block;
            }

            .gcal-view-option {
                padding: 12px 16px;
                cursor: pointer;
                font-size: 14px;
                color: var(--color-text-primary);
            }

            .gcal-view-option:hover {
                background: var(--color-bg-hover);
            }

            .gcal-view-option.active {
                background: rgba(139, 105, 20, 0.1);
                color: var(--color-primary);
            }

            .gcal-back-btn {
                padding: 8px 16px;
                border: 1px solid var(--color-border);
                border-radius: 4px;
                background: var(--color-card-bg);
                color: var(--color-text-secondary);
                font-size: 13px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .gcal-back-btn:hover {
                background: var(--color-bg-hover);
            }

            /* Main Container */
            .gcal-container {
                display: flex;
                flex: 1;
                margin-top: 64px;
                height: calc(100vh - 64px);
            }

            /* Sidebar */
            .gcal-sidebar {
                width: 256px;
                background: var(--color-card-bg);
                border-right: 1px solid var(--color-border);
                padding: 16px;
                overflow-y: auto;
                flex-shrink: 0;
                transition: margin-left 0.2s, width 0.2s;
            }

            .gcal-sidebar.closed {
                margin-left: -256px;
                width: 0;
                padding: 0;
                overflow: hidden;
            }

            .gcal-create-btn {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 0 24px;
                height: 56px;
                background: var(--color-card-bg);
                border: 1px solid var(--color-border);
                border-radius: 28px;
                font-size: 14px;
                font-weight: 500;
                color: var(--color-text-primary);
                cursor: pointer;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                transition: all 0.2s;
                margin-bottom: 20px;
                width: 100%;
            }

            .gcal-create-btn:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                background: var(--color-bg-hover);
            }

            .gcal-create-icon {
                width: 36px;
                height: 36px;
                background: var(--color-primary);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }

            /* Mini Calendar */
            .gcal-mini-cal {
                margin-bottom: 20px;
            }

            .gcal-mini-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 0;
            }

            .gcal-mini-title {
                font-size: 14px;
                font-weight: 500;
                color: var(--color-text-primary);
                cursor: pointer;
            }

            .gcal-mini-title:hover {
                color: var(--color-primary);
            }

            .gcal-mini-nav {
                display: flex;
                gap: 0;
            }

            .gcal-mini-nav-btn {
                width: 28px;
                height: 28px;
                border: none;
                background: transparent;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--color-text-secondary);
            }

            .gcal-mini-nav-btn:hover {
                background: var(--color-bg-hover);
            }

            .gcal-mini-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 0;
            }

            .gcal-mini-day-header {
                text-align: center;
                font-size: 10px;
                font-weight: 500;
                color: var(--color-text-muted);
                padding: 4px 0;
            }

            .gcal-mini-day {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                cursor: pointer;
                border-radius: 50%;
                color: var(--color-text-primary);
            }

            .gcal-mini-day:hover {
                background: var(--color-bg-hover);
            }

            .gcal-mini-day.other-month {
                color: var(--color-text-muted);
            }

            .gcal-mini-day.today {
                background: var(--color-primary);
                color: white;
                font-weight: 500;
            }

            .gcal-mini-day.selected {
                background: rgba(139, 105, 20, 0.2);
                color: var(--color-primary);
                font-weight: 500;
            }

            .gcal-mini-day.has-events::after {
                content: '';
                position: absolute;
                bottom: 2px;
                width: 4px;
                height: 4px;
                background: var(--color-primary);
                border-radius: 50%;
            }

            /* Main Calendar */
            .gcal-main {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: var(--color-card-bg);
            }

            /* Month View */
            .gcal-month-header {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                border-bottom: 1px solid var(--color-border);
            }

            .gcal-month-header-cell {
                padding: 8px 12px;
                text-align: center;
                font-size: 11px;
                font-weight: 500;
                text-transform: uppercase;
                color: var(--color-text-muted);
            }

            .gcal-month-grid {
                flex: 1;
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                grid-template-rows: repeat(6, 1fr);
            }

            .gcal-month-cell {
                border-right: 1px solid var(--color-border);
                border-bottom: 1px solid var(--color-border);
                padding: 4px;
                min-height: 100px;
                cursor: pointer;
                overflow: hidden;
            }

            .gcal-month-cell:nth-child(7n) {
                border-right: none;
            }

            .gcal-month-cell:hover {
                background: var(--color-bg-hover);
            }

            .gcal-month-cell.other-month {
                background: var(--color-bg-secondary);
            }

            .gcal-month-cell.other-month .gcal-month-day-num {
                color: var(--color-text-muted);
            }

            .gcal-month-day-num {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 500;
                margin-bottom: 2px;
                border-radius: 50%;
                color: var(--color-text-primary);
            }

            .gcal-month-cell.today .gcal-month-day-num {
                background: var(--color-primary);
                color: white;
            }

            .gcal-month-cell.selected .gcal-month-day-num {
                background: rgba(139, 105, 20, 0.2);
                color: var(--color-primary);
            }

            .gcal-month-events {
                display: flex;
                flex-direction: column;
                gap: 1px;
                overflow: hidden;
            }

            .gcal-month-event {
                padding: 1px 4px;
                font-size: 11px;
                border-radius: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                cursor: pointer;
                color: white;
            }

            .gcal-month-event:hover {
                opacity: 0.85;
            }

            .gcal-month-more {
                font-size: 11px;
                color: var(--color-text-muted);
                padding: 2px 4px;
                cursor: pointer;
            }

            .gcal-month-more:hover {
                color: var(--color-primary);
            }

            /* Week/Day View */
            .gcal-week-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .gcal-week-header {
                display: flex;
                border-bottom: 1px solid var(--color-border);
                flex-shrink: 0;
            }

            .gcal-week-header-gutter {
                width: 60px;
                flex-shrink: 0;
            }

            .gcal-week-header-days {
                flex: 1;
                display: grid;
                grid-template-columns: repeat(7, 1fr);
            }

            .gcal-week-header-day {
                padding: 8px;
                text-align: center;
                border-left: 1px solid var(--color-border);
            }

            .gcal-week-header-day:first-child {
                border-left: none;
            }

            .gcal-week-day-name {
                font-size: 11px;
                font-weight: 500;
                text-transform: uppercase;
                color: var(--color-text-muted);
                margin-bottom: 4px;
            }

            .gcal-week-day-num {
                width: 46px;
                height: 46px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: 400;
                margin: 0 auto;
                border-radius: 50%;
                cursor: pointer;
                color: var(--color-text-primary);
            }

            .gcal-week-day-num:hover {
                background: var(--color-bg-hover);
            }

            .gcal-week-header-day.today .gcal-week-day-name {
                color: var(--color-primary);
            }

            .gcal-week-header-day.today .gcal-week-day-num {
                background: var(--color-primary);
                color: white;
            }

            .gcal-week-body {
                flex: 1;
                display: flex;
                overflow-y: auto;
            }

            .gcal-week-time-gutter {
                width: 60px;
                flex-shrink: 0;
            }

            .gcal-week-time-slot-label {
                height: 48px;
                padding-right: 8px;
                text-align: right;
                font-size: 10px;
                color: var(--color-text-muted);
            }

            .gcal-week-days-container {
                flex: 1;
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                position: relative;
            }

            .gcal-week-day-column {
                border-left: 1px solid var(--color-border);
                position: relative;
            }

            .gcal-week-day-column:first-child {
                border-left: none;
            }

            .gcal-week-time-slot {
                height: 48px;
                border-bottom: 1px solid var(--color-border-light);
            }

            .gcal-week-event {
                position: absolute;
                left: 2px;
                right: 2px;
                padding: 4px 6px;
                border-radius: 4px;
                font-size: 11px;
                color: white;
                overflow: hidden;
                cursor: pointer;
                z-index: 1;
            }

            .gcal-week-event:hover {
                z-index: 2;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }

            .gcal-week-event-title {
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .gcal-week-event-time {
                font-size: 10px;
                opacity: 0.9;
            }

            .gcal-current-time-line {
                position: absolute;
                left: 0;
                right: 0;
                height: 2px;
                background: #EA4335;
                z-index: 10;
                pointer-events: none;
            }

            .gcal-current-time-line::before {
                content: '';
                position: absolute;
                left: -6px;
                top: -5px;
                width: 12px;
                height: 12px;
                background: #EA4335;
                border-radius: 50%;
            }

            /* Day View - single column */
            .gcal-day-header-days {
                grid-template-columns: 1fr !important;
            }

            .gcal-day-days-container {
                grid-template-columns: 1fr !important;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .gcal-sidebar {
                    position: fixed;
                    left: 0;
                    top: 64px;
                    bottom: 0;
                    z-index: 50;
                    box-shadow: 4px 0 16px rgba(0,0,0,0.1);
                }

                .gcal-sidebar.closed {
                    margin-left: -256px;
                }

                .gcal-logo {
                    display: none;
                }

                .gcal-current-date {
                    font-size: 16px;
                    min-width: auto;
                }

                .gcal-month-cell {
                    min-height: 60px;
                }

                .gcal-month-event {
                    display: none;
                }

                .gcal-month-cell.has-events .gcal-month-day-num::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    background: var(--color-primary);
                    border-radius: 50%;
                }

                .gcal-month-day-num {
                    position: relative;
                }
            }
        </style>

        <!-- Header -->
        <div class="gcal-header">
            <button class="gcal-menu-btn" id="menu-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>
            </button>
            <div class="gcal-logo">
                <div class="gcal-logo-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                Agenda
            </div>
            <div class="gcal-header-nav">
                <button class="gcal-today-btn" id="today-btn">Aujourd'hui</button>
                <div class="gcal-nav-arrows">
                    <button class="gcal-nav-btn" id="prev-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>
                    </button>
                    <button class="gcal-nav-btn" id="next-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>
                    </button>
                </div>
                <span class="gcal-current-date" id="current-date"></span>
            </div>
            <div class="gcal-header-right">
                <div class="gcal-view-dropdown">
                    <button class="gcal-view-btn" id="view-btn">
                        <span id="view-label">Mois</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"></path></svg>
                    </button>
                    <div class="gcal-view-menu" id="view-menu">
                        <div class="gcal-view-option active" data-view="day">Jour</div>
                        <div class="gcal-view-option" data-view="week">Semaine</div>
                        <div class="gcal-view-option active" data-view="month">Mois</div>
                    </div>
                </div>
                <button class="gcal-back-btn" id="back-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
                    Retour
                </button>
            </div>
        </div>

        <!-- Main Container -->
        <div class="gcal-container">
            <!-- Sidebar -->
            <div class="gcal-sidebar" id="sidebar-panel">
                <button class="gcal-create-btn" id="create-btn">
                    <span class="gcal-create-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </span>
                    Créer
                </button>

                <!-- Mini Calendar -->
                <div class="gcal-mini-cal" id="mini-cal"></div>
            </div>

            <!-- Main Calendar -->
            <div class="gcal-main" id="calendar-main"></div>
        </div>
    `;

    // Initialize
    await loadEvents();
    initEventListeners();
    renderMiniCalendar();
    renderCalendar();
    updateCurrentDate();
}

function initEventListeners() {
    // Menu toggle
    document.getElementById('menu-btn').addEventListener('click', () => {
        sidebarOpen = !sidebarOpen;
        document.getElementById('sidebar-panel').classList.toggle('closed', !sidebarOpen);
    });

    // Navigation
    document.getElementById('today-btn').addEventListener('click', () => {
        currentDate = new Date();
        selectedDate = new Date();
        renderMiniCalendar();
        renderCalendar();
        updateCurrentDate();
    });

    document.getElementById('prev-btn').addEventListener('click', () => navigate(-1));
    document.getElementById('next-btn').addEventListener('click', () => navigate(1));

    // View dropdown
    const viewBtn = document.getElementById('view-btn');
    const viewMenu = document.getElementById('view-menu');

    viewBtn.addEventListener('click', () => {
        viewMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!viewBtn.contains(e.target) && !viewMenu.contains(e.target)) {
            viewMenu.classList.remove('open');
        }
    });

    viewMenu.querySelectorAll('.gcal-view-option').forEach(opt => {
        opt.addEventListener('click', () => {
            currentView = opt.dataset.view;
            document.getElementById('view-label').textContent =
                currentView === 'day' ? 'Jour' : currentView === 'week' ? 'Semaine' : 'Mois';
            viewMenu.querySelectorAll('.gcal-view-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            viewMenu.classList.remove('open');
            renderCalendar();
            updateCurrentDate();
        });
    });

    // Create button
    document.getElementById('create-btn').addEventListener('click', () => openEventForm());

    // Back button
    document.getElementById('back-btn').addEventListener('click', () => {
        // Restore navbar and sidebar
        const navbar = document.querySelector('.navbar');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');

        if (navbar) navbar.style.display = '';
        if (sidebar) sidebar.style.display = '';
        if (mainContent) {
            mainContent.style.marginLeft = '';
            mainContent.style.paddingTop = '';
        }

        const pageContent = document.getElementById('page-content');
        pageContent.style.padding = '';
        pageContent.style.maxWidth = '';

        window.history.back();
    });
}

function navigate(direction) {
    if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() + direction);
    } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() + (direction * 7));
    } else {
        currentDate.setDate(currentDate.getDate() + direction);
    }
    loadEvents().then(() => {
        renderMiniCalendar();
        renderCalendar();
        updateCurrentDate();
    });
}

function updateCurrentDate() {
    const el = document.getElementById('current-date');
    if (currentView === 'month') {
        el.textContent = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (currentView === 'week') {
        const weekStart = getWeekStart(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        if (weekStart.getMonth() === weekEnd.getMonth()) {
            el.textContent = `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
        } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
            el.textContent = `${MONTH_NAMES_SHORT[weekStart.getMonth()]} - ${MONTH_NAMES_SHORT[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
        } else {
            el.textContent = `${MONTH_NAMES_SHORT[weekStart.getMonth()]} ${weekStart.getFullYear()} - ${MONTH_NAMES_SHORT[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
        }
    } else {
        el.textContent = currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
}

async function loadEvents() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month + 2, 0);

    try {
        const response = await apiService.getEvents({
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
        });
        eventsCache = response.success ? (response.data.events || []) : [];
    } catch (error) {
        eventsCache = [];
    }
}

function renderMiniCalendar() {
    const container = document.getElementById('mini-cal');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const today = new Date();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    let html = `
        <div class="gcal-mini-header">
            <span class="gcal-mini-title" id="mini-title">${MONTH_NAMES[month]} ${year}</span>
            <div class="gcal-mini-nav">
                <button class="gcal-mini-nav-btn" id="mini-prev">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>
                </button>
                <button class="gcal-mini-nav-btn" id="mini-next">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>
                </button>
            </div>
        </div>
        <div class="gcal-mini-grid">
            ${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => `<div class="gcal-mini-day-header">${d}</div>`).join('')}
    `;

    // Previous month
    for (let i = 0; i < startOffset; i++) {
        const day = prevMonthLastDay - startOffset + 1 + i;
        html += `<div class="gcal-mini-day other-month" data-date="${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}">${day}</div>`;
    }

    // Current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const isToday = isSameDay(date, today);
        const isSelected = isSameDay(date, selectedDate);
        let classes = 'gcal-mini-day';
        if (isToday) classes += ' today';
        else if (isSelected) classes += ' selected';

        html += `<div class="${classes}" data-date="${formatDate(date)}">${day}</div>`;
    }

    // Next month
    const totalCells = startOffset + lastDay.getDate();
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
        html += `<div class="gcal-mini-day other-month">${i}</div>`;
    }

    html += '</div>';
    container.innerHTML = html;

    // Mini calendar nav
    document.getElementById('mini-prev')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderMiniCalendar();
        renderCalendar();
        updateCurrentDate();
    });

    document.getElementById('mini-next')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderMiniCalendar();
        renderCalendar();
        updateCurrentDate();
    });

    // Day click
    container.querySelectorAll('.gcal-mini-day:not(.other-month)').forEach(el => {
        el.addEventListener('click', () => {
            const dateStr = el.dataset.date;
            if (dateStr) {
                selectedDate = new Date(dateStr);
                currentDate = new Date(dateStr);
                renderMiniCalendar();
                renderCalendar();
                updateCurrentDate();
            }
        });
    });
}

function renderCalendar() {
    const main = document.getElementById('calendar-main');

    if (currentView === 'month') {
        renderMonthView(main);
    } else if (currentView === 'week') {
        renderWeekView(main, false);
    } else {
        renderWeekView(main, true);
    }
}

function renderMonthView(container) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const today = new Date();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    let html = `
        <div class="gcal-month-header">
            ${DAY_NAMES.map(d => `<div class="gcal-month-header-cell">${d}</div>`).join('')}
        </div>
        <div class="gcal-month-grid">
    `;

    // Previous month days
    for (let i = 0; i < startOffset; i++) {
        const day = prevMonthLastDay - startOffset + 1 + i;
        const date = new Date(year, month - 1, day);
        html += renderMonthCell(date, true, today);
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        html += renderMonthCell(date, false, today);
    }

    // Next month days
    const totalCells = startOffset + lastDay.getDate();
    const rows = Math.ceil(totalCells / 7);
    const remaining = (rows * 7) - totalCells;
    for (let i = 1; i <= remaining; i++) {
        const date = new Date(year, month + 1, i);
        html += renderMonthCell(date, true, today);
    }

    html += '</div>';
    container.innerHTML = html;

    // Event listeners
    container.querySelectorAll('.gcal-month-cell').forEach(cell => {
        cell.addEventListener('click', (e) => {
            if (!e.target.closest('.gcal-month-event')) {
                const dateStr = cell.dataset.date;
                if (dateStr) openEventForm(null, dateStr);
            }
        });
    });

    container.querySelectorAll('.gcal-month-event').forEach(evt => {
        evt.addEventListener('click', (e) => {
            e.stopPropagation();
            const eventId = evt.dataset.eventId;
            const event = eventsCache.find(ev => ev.id == eventId);
            if (event) openEventDetail(event);
        });
    });
}

function renderMonthCell(date, isOtherMonth, today) {
    const dateStr = formatDate(date);
    const isToday = isSameDay(date, today);
    const isSelected = isSameDay(date, selectedDate);
    const dayEvents = getEventsForDate(date);
    const hasEvents = dayEvents.length > 0;

    let classes = 'gcal-month-cell';
    if (isOtherMonth) classes += ' other-month';
    if (isToday) classes += ' today';
    if (isSelected) classes += ' selected';
    if (hasEvents) classes += ' has-events';

    return `
        <div class="${classes}" data-date="${dateStr}">
            <div class="gcal-month-day-num">${date.getDate()}</div>
            <div class="gcal-month-events">
                ${dayEvents.slice(0, 3).map(evt => `
                    <div class="gcal-month-event" style="background: ${evt.color || EVENT_COLORS[evt.event_type] || '#8B6914'}" data-event-id="${evt.id}">
                        ${evt.title}
                    </div>
                `).join('')}
                ${dayEvents.length > 3 ? `<div class="gcal-month-more">+${dayEvents.length - 3} autres</div>` : ''}
            </div>
        </div>
    `;
}

function renderWeekView(container, isDayView) {
    const weekStart = isDayView ? new Date(currentDate) : getWeekStart(currentDate);
    const daysCount = isDayView ? 1 : 7;
    const today = new Date();
    const hours = Array.from({length: 24}, (_, i) => i);

    let daysHtml = '';
    for (let i = 0; i < daysCount; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const isToday = isSameDay(date, today);

        daysHtml += `
            <div class="gcal-week-header-day ${isToday ? 'today' : ''}">
                <div class="gcal-week-day-name">${DAY_NAMES[i % 7]}</div>
                <div class="gcal-week-day-num">${date.getDate()}</div>
            </div>
        `;
    }

    let timeSlots = '';
    hours.forEach(h => {
        timeSlots += `<div class="gcal-week-time-slot-label">${String(h).padStart(2, '0')}:00</div>`;
    });

    let dayColumns = '';
    for (let i = 0; i < daysCount; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dayEvents = getEventsForDate(date);
        const isToday = isSameDay(date, today);

        let slots = hours.map(() => '<div class="gcal-week-time-slot"></div>').join('');
        let events = dayEvents.map(evt => renderWeekEvent(evt)).join('');

        let currentTimeLine = '';
        if (isToday) {
            const now = new Date();
            const top = (now.getHours() + now.getMinutes() / 60) * 48;
            currentTimeLine = `<div class="gcal-current-time-line" style="top: ${top}px;"></div>`;
        }

        dayColumns += `
            <div class="gcal-week-day-column">
                ${slots}
                ${events}
                ${currentTimeLine}
            </div>
        `;
    }

    container.innerHTML = `
        <div class="gcal-week-container">
            <div class="gcal-week-header">
                <div class="gcal-week-header-gutter"></div>
                <div class="gcal-week-header-days ${isDayView ? 'gcal-day-header-days' : ''}">${daysHtml}</div>
            </div>
            <div class="gcal-week-body">
                <div class="gcal-week-time-gutter">${timeSlots}</div>
                <div class="gcal-week-days-container ${isDayView ? 'gcal-day-days-container' : ''}">${dayColumns}</div>
            </div>
        </div>
    `;

    // Event listeners
    container.querySelectorAll('.gcal-week-event').forEach(evt => {
        evt.addEventListener('click', () => {
            const eventId = evt.dataset.eventId;
            const event = eventsCache.find(ev => ev.id == eventId);
            if (event) openEventDetail(event);
        });
    });
}

function renderWeekEvent(event) {
    const start = new Date(event.start_datetime);
    const end = new Date(event.end_datetime);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const duration = Math.max(endHour - startHour, 0.5);
    const top = startHour * 48;
    const height = duration * 48;
    const color = event.color || EVENT_COLORS[event.event_type] || '#8B6914';

    return `
        <div class="gcal-week-event" style="top: ${top}px; height: ${height}px; background: ${color};" data-event-id="${event.id}">
            <div class="gcal-week-event-title">${event.title}</div>
            <div class="gcal-week-event-time">${formatTime(start)} - ${formatTime(end)}</div>
        </div>
    `;
}

// Helper functions
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function getEventsForDate(date) {
    const dateStr = formatDate(date);
    return eventsCache.filter(evt => evt.start_datetime?.split('T')[0] === dateStr);
}

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatTime(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function isSameDay(d1, d2) {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

function openEventForm(event = null, defaultDate = null) {
    const isEdit = !!event;
    let defaultStart = '', defaultEnd = '';

    if (defaultDate) {
        defaultStart = `${defaultDate}T09:00`;
        defaultEnd = `${defaultDate}T10:00`;
    } else if (!isEdit) {
        const now = new Date();
        now.setHours(now.getHours() + 1, 0, 0, 0);
        defaultStart = now.toISOString().slice(0, 16);
        const end = new Date(now);
        end.setHours(end.getHours() + 1);
        defaultEnd = end.toISOString().slice(0, 16);
    }

    openBottomSheet({
        title: isEdit ? 'Modifier l\'événement' : 'Nouvel événement',
        size: 'large',
        content: `
            <form id="event-form">
                <div class="form-group">
                    <label class="form-label">Titre *</label>
                    <input type="text" class="form-input" name="title" required value="${event?.title || ''}" placeholder="Ajouter un titre">
                </div>
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Début *</label>
                        <input type="datetime-local" class="form-input" name="start_datetime" required value="${event?.start_datetime?.slice(0, 16) || defaultStart}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fin *</label>
                        <input type="datetime-local" class="form-input" name="end_datetime" required value="${event?.end_datetime?.slice(0, 16) || defaultEnd}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Type</label>
                    <select class="form-select" name="event_type">
                        <option value="cours" ${event?.event_type === 'cours' ? 'selected' : ''}>Cours</option>
                        <option value="atelier" ${event?.event_type === 'atelier' ? 'selected' : ''}>Atelier</option>
                        <option value="reunion" ${event?.event_type === 'reunion' ? 'selected' : ''}>Réunion</option>
                        <option value="sortie" ${event?.event_type === 'sortie' ? 'selected' : ''}>Sortie</option>
                        <option value="competition" ${event?.event_type === 'competition' ? 'selected' : ''}>Compétition</option>
                        <option value="autre" ${event?.event_type === 'autre' ? 'selected' : ''}>Autre</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Lieu</label>
                    <input type="text" class="form-input" name="location" value="${event?.location || ''}" placeholder="Ajouter un lieu">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Ajouter une description">${event?.description || ''}</textarea>
                </div>
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Places max</label>
                        <input type="number" class="form-input" name="max_participants" min="1" value="${event?.max_participants || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Couleur</label>
                        <input type="color" class="form-input" name="color" value="${event?.color || '#8B6914'}" style="height: 44px; padding: 4px;">
                    </div>
                </div>
            </form>
        `,
        footer: `
            ${isEdit ? '<button class="btn btn-danger" id="delete-btn">Supprimer</button>' : ''}
            <button class="btn btn-secondary" id="cancel-btn">Annuler</button>
            <button class="btn btn-primary" id="save-btn">${isEdit ? 'Enregistrer' : 'Créer'}</button>
        `
    });

    document.getElementById('cancel-btn')?.addEventListener('click', closeBottomSheet);

    if (isEdit) {
        document.getElementById('delete-btn')?.addEventListener('click', async () => {
            if (confirm('Supprimer cet événement ?')) {
                try {
                    await apiService.deleteEvent(event.id);
                    toastSuccess('Événement supprimé');
                    closeBottomSheet();
                    await loadEvents();
                    renderCalendar();
                } catch (e) {
                    toastError('Erreur suppression');
                }
            }
        });
    }

    document.getElementById('save-btn')?.addEventListener('click', async () => {
        const form = document.getElementById('event-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        if (!data.title || !data.start_datetime || !data.end_datetime) {
            toastError('Champs requis manquants');
            return;
        }

        try {
            if (isEdit) {
                await apiService.updateEvent(event.id, data);
                toastSuccess('Événement modifié');
            } else {
                await apiService.createEvent(data);
                toastSuccess('Événement créé');
            }
            closeBottomSheet();
            await loadEvents();
            renderMiniCalendar();
            renderCalendar();
        } catch (e) {
            toastError('Erreur enregistrement');
        }
    });
}

function openEventDetail(event) {
    const startDate = new Date(event.start_datetime);
    const endDate = new Date(event.end_datetime);
    const color = event.color || EVENT_COLORS[event.event_type] || '#8B6914';

    openBottomSheet({
        title: '',
        content: `
            <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                <div style="width: 16px; height: 16px; border-radius: 4px; background: ${color}; margin-top: 6px;"></div>
                <div>
                    <h2 style="font-size: 22px; font-weight: 500; margin-bottom: 8px;">${event.title}</h2>
                    <div style="color: var(--color-text-muted);">${startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    <div style="color: var(--color-text-muted);">${formatTime(startDate)} - ${formatTime(endDate)}</div>
                </div>
            </div>
            ${event.location ? `<div style="display: flex; gap: 12px; margin-bottom: 12px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span>${event.location}</span></div>` : ''}
            ${event.description ? `<div style="padding-top: 16px; border-top: 1px solid var(--color-border); color: var(--color-text-secondary);">${event.description}</div>` : ''}
        `,
        footer: `
            <button class="btn btn-secondary" id="edit-btn">Modifier</button>
            <button class="btn btn-primary" id="close-btn">Fermer</button>
        `
    });

    document.getElementById('edit-btn')?.addEventListener('click', () => {
        closeBottomSheet();
        setTimeout(() => openEventForm(event), 300);
    });
    document.getElementById('close-btn')?.addEventListener('click', closeBottomSheet);
}
