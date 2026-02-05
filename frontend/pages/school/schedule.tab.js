import apiService from '../../services/api.service.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';

let currentView = 'week';
let currentDate = new Date();
let selectedDate = new Date();
let classesCache = [];
let intervenants = [];
let students = [];
let sidebarOpen = true;
let filterMode = 'classes'; // 'classes' or 'teachers'
let selectedClasses = new Set(); // IDs of selected classes (empty = all)
let selectedTeachers = new Set(); // IDs of selected teachers (empty = all)

const SUBJECT_COLORS = {
    coran: '#6B8E23',
    arabe: '#8B6914',
    fiqh: '#20B2AA',
    sira: '#8B4557',
    doua: '#CD5C5C',
    autre: '#5A4735'
};

const SUBJECT_ICONS = {
    coran: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    arabe: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path d="M12 4v16"></path></svg>',
    fiqh: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>',
    sira: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>',
    doua: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>',
    autre: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>'
};

const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const MONTH_NAMES_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAY_NAMES_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export async function renderScheduleTab(container) {
    // Fullscreen mode is handled by router in app.js

    container.innerHTML = `
        <style>
            .gcal {
                display: flex;
                height: 100vh;
                width: 100%;
                background: var(--color-bg-primary);
                font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif;
                overflow: hidden;
            }

            /* Top Header */
            .gcal-header {
                position: fixed;
                top: 0;
                left: var(--sidebar-width);
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

            @media (max-width: 1023px) {
                .gcal-header {
                    left: 0;
                }
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
                min-width: 200px;
            }

            .gcal-logo-icon {
                width: 40px;
                height: 40px;
                background: var(--school-primary);
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
                background: var(--school-primary-light);
                color: var(--school-primary);
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
                background: var(--school-primary);
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
                color: var(--school-primary);
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
                background: var(--school-primary);
                color: white;
                font-weight: 500;
            }

            .gcal-mini-day.selected {
                background: var(--school-primary-light);
                color: var(--school-primary);
                font-weight: 500;
            }

            /* Filter section */
            .gcal-filter-section {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid var(--color-border);
            }

            .gcal-filter-tabs {
                display: flex;
                background: var(--color-bg-secondary);
                border-radius: 8px;
                padding: 4px;
                margin-bottom: 12px;
            }

            .gcal-filter-tab {
                flex: 1;
                padding: 8px 12px;
                border: none;
                background: transparent;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                color: var(--color-text-muted);
                cursor: pointer;
                transition: all 0.15s;
            }

            .gcal-filter-tab:hover {
                color: var(--color-text-primary);
            }

            .gcal-filter-tab.active {
                background: var(--color-card-bg);
                color: var(--school-primary);
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .gcal-filter-list {
                max-height: 280px;
                overflow-y: auto;
            }

            .gcal-filter-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 10px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                color: var(--color-text-primary);
                transition: background 0.15s;
            }

            .gcal-filter-item:hover {
                background: var(--color-bg-hover);
            }

            .gcal-filter-checkbox {
                width: 18px;
                height: 18px;
                border: 2px solid var(--color-border);
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: all 0.15s;
            }

            .gcal-filter-checkbox svg {
                width: 12px;
                height: 12px;
                opacity: 0;
                color: white;
            }

            .gcal-filter-item.checked .gcal-filter-checkbox {
                background: var(--school-primary);
                border-color: var(--school-primary);
            }

            .gcal-filter-item.checked .gcal-filter-checkbox svg {
                opacity: 1;
            }

            .gcal-filter-dot {
                width: 10px;
                height: 10px;
                border-radius: 3px;
                flex-shrink: 0;
            }

            .gcal-filter-label {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .gcal-filter-count {
                font-size: 11px;
                color: var(--color-text-muted);
                background: var(--color-bg-secondary);
                padding: 2px 6px;
                border-radius: 10px;
            }

            .gcal-filter-empty {
                text-align: center;
                padding: 20px;
                color: var(--color-text-muted);
                font-size: 13px;
            }

            .gcal-filter-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid var(--color-border);
            }

            .gcal-filter-action-btn {
                flex: 1;
                padding: 6px 10px;
                border: none;
                background: transparent;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                color: var(--color-text-muted);
                cursor: pointer;
                transition: all 0.15s;
            }

            .gcal-filter-action-btn:hover {
                background: var(--color-bg-hover);
                color: var(--school-primary);
            }

            /* Main Calendar */
            .gcal-main {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: var(--color-card-bg);
            }

            /* Week View */
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
                color: var(--school-primary);
            }

            .gcal-week-header-day.today .gcal-week-day-num {
                background: var(--school-primary);
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
                height: 60px;
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
                height: 60px;
                border-bottom: 1px solid var(--color-border-light);
            }

            .gcal-week-event {
                position: absolute;
                left: 2px;
                right: 2px;
                padding: 6px 8px;
                border-radius: 6px;
                font-size: 11px;
                color: white;
                overflow: hidden;
                cursor: pointer;
                z-index: 1;
                transition: all 0.15s;
            }

            .gcal-week-event:hover {
                z-index: 2;
                box-shadow: 0 4px 16px rgba(0,0,0,0.25);
                transform: scale(1.02);
            }

            .gcal-week-event-title {
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .gcal-week-event-time {
                font-size: 10px;
                opacity: 0.9;
            }

            .gcal-week-event-icon {
                margin-right: 4px;
                display: inline-flex;
                vertical-align: middle;
            }

            .gcal-week-event-icon svg {
                width: 14px;
                height: 14px;
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

            /* Day View */
            .gcal-day-header-days {
                grid-template-columns: 1fr !important;
            }

            .gcal-day-days-container {
                grid-template-columns: 1fr !important;
            }

            /* List View */
            .gcal-list-container {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
            }

            .gcal-list-day {
                margin-bottom: 24px;
            }

            .gcal-list-day-header {
                font-size: 14px;
                font-weight: 600;
                color: var(--color-text-primary);
                padding-bottom: 8px;
                margin-bottom: 8px;
                border-bottom: 1px solid var(--color-border);
            }

            .gcal-list-event {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                margin-bottom: 4px;
                transition: all 0.15s;
            }

            .gcal-list-event:hover {
                background: var(--color-bg-hover);
            }

            .gcal-list-event-color {
                width: 4px;
                border-radius: 2px;
                align-self: stretch;
                min-height: 40px;
            }

            .gcal-list-event-time {
                width: 60px;
                font-size: 12px;
                color: var(--color-text-muted);
                flex-shrink: 0;
            }

            .gcal-list-event-content {
                flex: 1;
            }

            .gcal-list-event-title {
                font-weight: 500;
                margin-bottom: 2px;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .gcal-list-event-title svg {
                width: 16px;
                height: 16px;
                flex-shrink: 0;
            }

            .gcal-list-event-info {
                font-size: 12px;
                color: var(--color-text-muted);
            }

            /* Detail Panel */
            .class-detail-header {
                display: flex;
                align-items: center;
                gap: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid var(--color-border);
                margin-bottom: 16px;
            }

            .class-detail-icon {
                width: 64px;
                height: 64px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .class-detail-icon svg {
                width: 32px;
                height: 32px;
            }

            .class-detail-title {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 4px;
            }

            .class-detail-subtitle {
                color: var(--color-text-muted);
                font-size: 14px;
            }

            .class-detail-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                margin-bottom: 16px;
            }

            .class-stat-card {
                background: var(--color-bg-secondary);
                border-radius: 8px;
                padding: 12px;
                text-align: center;
            }

            .class-stat-value {
                font-size: 20px;
                font-weight: 700;
                color: var(--school-primary);
            }

            .class-stat-label {
                font-size: 11px;
                color: var(--color-text-muted);
            }

            .class-schedule-info {
                background: var(--color-bg-secondary);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 16px;
            }

            .class-schedule-row {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
                font-size: 13px;
            }

            .class-schedule-row:last-child {
                margin-bottom: 0;
            }

            .students-section {
                margin-top: 16px;
            }

            .students-section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }

            .students-section-title {
                font-weight: 600;
                font-size: 14px;
            }

            .students-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-height: none;
                overflow-y: visible;
            }

            .student-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 12px;
                background: var(--color-bg-secondary);
                border-radius: 8px;
            }

            .student-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--school-primary) 0%, var(--school-primary-dark) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                font-size: 14px;
            }

            .student-info {
                flex: 1;
            }

            .student-name {
                font-weight: 500;
                font-size: 13px;
            }

            .student-number {
                font-size: 11px;
                color: var(--color-text-muted);
            }

            .empty-students {
                text-align: center;
                padding: 20px;
                color: var(--color-text-muted);
                background: var(--color-bg-secondary);
                border-radius: 8px;
                font-size: 13px;
            }

            /* Responsive */
            @media (max-width: 1023px) {
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

                .class-detail-stats {
                    grid-template-columns: 1fr;
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                </div>
                Emploi du temps
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
                        <span id="view-label">Semaine</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"></path></svg>
                    </button>
                    <div class="gcal-view-menu" id="view-menu">
                        <div class="gcal-view-option" data-view="day">Jour</div>
                        <div class="gcal-view-option active" data-view="week">Semaine</div>
                        <div class="gcal-view-option" data-view="list">Planning</div>
                    </div>
                </div>
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
                    Nouvelle classe
                </button>

                <!-- Mini Calendar -->
                <div class="gcal-mini-cal" id="mini-cal"></div>

                <!-- Filters -->
                <div class="gcal-filter-section">
                    <div class="gcal-filter-tabs">
                        <button class="gcal-filter-tab active" data-filter="classes">Cours</button>
                        <button class="gcal-filter-tab" data-filter="teachers">Enseignants</button>
                    </div>
                    <div class="gcal-filter-list" id="filter-list"></div>
                    <div class="gcal-filter-actions">
                        <button class="gcal-filter-action-btn" id="filter-select-all">Tout sélectionner</button>
                        <button class="gcal-filter-action-btn" id="filter-clear-all">Tout effacer</button>
                    </div>
                </div>
            </div>

            <!-- Main Calendar -->
            <div class="gcal-main" id="calendar-main"></div>
        </div>
    `;

    // Initialize
    await loadData();
    initEventListeners();
    renderMiniCalendar();
    renderFilterList();
    renderCalendar();
    updateCurrentDate();
}

async function loadData() {
    try {
        const [classesRes, intervenantsRes, studentsRes] = await Promise.all([
            apiService.getSchoolClasses({ status: 'active' }),
            apiService.getSchoolTeachers(),
            apiService.getStudents({ status: 'actif', limit: 200 })
        ]);

        classesCache = classesRes.success ? (Array.isArray(classesRes.data) ? classesRes.data : []) : [];
        intervenants = intervenantsRes.success ? (Array.isArray(intervenantsRes.data) ? intervenantsRes.data : []) : [];

        if (studentsRes.success) {
            const data = studentsRes.data;
            students = Array.isArray(data) ? data : (Array.isArray(data?.students) ? data.students : []);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        classesCache = [];
    }
}

function renderFilterList() {
    const container = document.getElementById('filter-list');
    if (!container) return;

    const checkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';

    if (filterMode === 'classes') {
        // Group classes by subject
        if (classesCache.length === 0) {
            container.innerHTML = '<div class="gcal-filter-empty">Aucun cours</div>';
            return;
        }

        // Initialize: if no selection, select all
        if (selectedClasses.size === 0) {
            selectedClasses = new Set(classesCache.map(c => c.id));
        }

        let html = '';
        classesCache.forEach(cls => {
            const color = SUBJECT_COLORS[cls.subject] || SUBJECT_COLORS.autre;
            const isChecked = selectedClasses.has(cls.id);
            const schedules = parseSchedule(cls.schedule);
            const scheduleCount = schedules.length;

            html += `
                <div class="gcal-filter-item ${isChecked ? 'checked' : ''}" data-id="${cls.id}" data-type="class">
                    <div class="gcal-filter-checkbox">${checkIcon}</div>
                    <div class="gcal-filter-dot" style="background: ${color};"></div>
                    <span class="gcal-filter-label">${cls.name}</span>
                    ${scheduleCount > 0 ? `<span class="gcal-filter-count">${scheduleCount}</span>` : ''}
                </div>
            `;
        });
        container.innerHTML = html;
    } else {
        // Teachers mode
        const teachersWithClasses = intervenants.filter(t =>
            classesCache.some(c => c.teacher_id === t.id)
        );

        if (teachersWithClasses.length === 0) {
            container.innerHTML = '<div class="gcal-filter-empty">Aucun enseignant</div>';
            return;
        }

        // Initialize: if no selection, select all
        if (selectedTeachers.size === 0) {
            selectedTeachers = new Set(teachersWithClasses.map(t => t.id));
        }

        let html = '';
        teachersWithClasses.forEach(teacher => {
            const isChecked = selectedTeachers.has(teacher.id);
            const classCount = classesCache.filter(c => c.teacher_id === teacher.id).length;

            html += `
                <div class="gcal-filter-item ${isChecked ? 'checked' : ''}" data-id="${teacher.id}" data-type="teacher">
                    <div class="gcal-filter-checkbox">${checkIcon}</div>
                    <span class="gcal-filter-label">${teacher.first_name} ${teacher.last_name}</span>
                    <span class="gcal-filter-count">${classCount}</span>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    // Attach click listeners
    container.querySelectorAll('.gcal-filter-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            const type = item.dataset.type;

            if (type === 'class') {
                if (selectedClasses.has(id)) {
                    selectedClasses.delete(id);
                } else {
                    selectedClasses.add(id);
                }
            } else {
                if (selectedTeachers.has(id)) {
                    selectedTeachers.delete(id);
                } else {
                    selectedTeachers.add(id);
                }
            }

            item.classList.toggle('checked');
            renderCalendar();
        });
    });
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
                currentView === 'day' ? 'Jour' : currentView === 'week' ? 'Semaine' : 'Planning';
            viewMenu.querySelectorAll('.gcal-view-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            viewMenu.classList.remove('open');
            renderCalendar();
            updateCurrentDate();
        });
    });

    // Create button
    document.getElementById('create-btn').addEventListener('click', () => openClassForm());

    // Filter tabs
    document.querySelectorAll('.gcal-filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            filterMode = tab.dataset.filter;
            document.querySelectorAll('.gcal-filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderFilterList();
        });
    });

    // Filter actions
    document.getElementById('filter-select-all')?.addEventListener('click', () => {
        if (filterMode === 'classes') {
            selectedClasses = new Set(classesCache.map(c => c.id));
        } else {
            selectedTeachers = new Set(intervenants.map(t => t.id));
        }
        renderFilterList();
        renderCalendar();
    });

    document.getElementById('filter-clear-all')?.addEventListener('click', () => {
        if (filterMode === 'classes') {
            selectedClasses.clear();
        } else {
            selectedTeachers.clear();
        }
        renderFilterList();
        renderCalendar();
    });
}

function navigate(direction) {
    if (currentView === 'week' || currentView === 'list') {
        currentDate.setDate(currentDate.getDate() + (direction * 7));
    } else {
        currentDate.setDate(currentDate.getDate() + direction);
    }
    renderMiniCalendar();
    renderCalendar();
    updateCurrentDate();
}

function updateCurrentDate() {
    const el = document.getElementById('current-date');
    if (currentView === 'week' || currentView === 'list') {
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
        html += `<div class="gcal-mini-day other-month">${day}</div>`;
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

    if (currentView === 'week') {
        renderWeekView(main, false);
    } else if (currentView === 'day') {
        renderWeekView(main, true);
    } else {
        renderListView(main);
    }
}

function renderWeekView(container, isDayView) {
    const weekStart = isDayView ? new Date(currentDate) : getWeekStart(currentDate);
    const daysCount = isDayView ? 1 : 7;
    const today = new Date();
    const hours = Array.from({length: 14}, (_, i) => i + 7); // 7h to 20h

    let daysHtml = '';
    for (let i = 0; i < daysCount; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const isToday = isSameDay(date, today);
        const dayName = isDayView ? DAY_NAMES_FULL[(date.getDay() + 6) % 7] : DAY_NAMES[i % 7];

        daysHtml += `
            <div class="gcal-week-header-day ${isToday ? 'today' : ''}">
                <div class="gcal-week-day-name">${dayName}</div>
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
        const dayIndex = (date.getDay() + 6) % 7; // 0=Lundi, 6=Dimanche
        const dayClasses = getClassesForDay(dayIndex);
        const isToday = isSameDay(date, today);

        let slots = hours.map(() => '<div class="gcal-week-time-slot"></div>').join('');
        let events = dayClasses.map(item => renderWeekClass(item.class, item.schedule)).join('');

        let currentTimeLine = '';
        if (isToday) {
            const now = new Date();
            const nowHour = now.getHours();
            if (nowHour >= 7 && nowHour <= 20) {
                const top = ((nowHour - 7) + now.getMinutes() / 60) * 60;
                currentTimeLine = `<div class="gcal-current-time-line" style="top: ${top}px;"></div>`;
            }
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
            const classId = evt.dataset.classId;
            openClassDetail(classId);
        });
    });
}

function getClassesForDay(dayIndex) {
    // Returns array of {class, schedule} for classes that have a schedule on this day
    const results = [];
    classesCache.forEach(cls => {
        // Apply class filter
        if (filterMode === 'classes' && selectedClasses.size > 0 && !selectedClasses.has(cls.id)) {
            return;
        }

        const schedules = parseSchedule(cls.schedule);
        schedules.forEach(sched => {
            if (sched && sched.jour) {
                const jourIndex = DAY_NAMES_FULL.findIndex(d => d.toLowerCase() === sched.jour.toLowerCase());
                if (jourIndex === dayIndex) {
                    // Apply teacher filter at schedule slot level
                    if (filterMode === 'teachers' && selectedTeachers.size > 0) {
                        const slotTeacherId = sched.teacher_id || cls.teacher_id;
                        if (!slotTeacherId || !selectedTeachers.has(slotTeacherId)) {
                            return;
                        }
                    }
                    results.push({ class: cls, schedule: sched });
                }
            }
        });
    });
    return results;
}

function parseSchedule(schedule) {
    if (!schedule) return [];
    let parsed = schedule;
    if (typeof schedule === 'string') {
        try {
            parsed = JSON.parse(schedule);
        } catch {
            return [];
        }
    }
    // Support ancien format (objet unique) et nouveau (tableau)
    if (Array.isArray(parsed)) {
        return parsed;
    }
    // Ancien format: convertir en tableau
    if (parsed && parsed.jour) {
        return [parsed];
    }
    return [];
}

function renderWeekClass(cls, schedule) {
    if (!schedule || !schedule.heure_debut || !schedule.heure_fin) return '';

    const [startH, startM] = schedule.heure_debut.split(':').map(Number);
    const [endH, endM] = schedule.heure_fin.split(':').map(Number);

    const startHour = startH + startM / 60;
    const endHour = endH + endM / 60;
    const duration = Math.max(endHour - startHour, 0.5);

    const top = (startHour - 7) * 60; // 7h is the start
    const height = duration * 60;
    const color = SUBJECT_COLORS[cls.subject] || SUBJECT_COLORS.autre;
    const icon = SUBJECT_ICONS[cls.subject] || '';

    // Use schedule-level room if available, fallback to class-level
    const room = schedule.room || cls.room;

    return `
        <div class="gcal-week-event" style="top: ${top}px; height: ${height}px; background: ${color};" data-class-id="${cls.id}">
            <div class="gcal-week-event-title"><span class="gcal-week-event-icon">${icon}</span>${cls.name}</div>
            <div class="gcal-week-event-time">${schedule.heure_debut} - ${schedule.heure_fin}</div>
            ${room ? `<div class="gcal-week-event-time">${room}</div>` : ''}
        </div>
    `;
}

function renderListView(container) {
    const weekStart = getWeekStart(currentDate);

    let html = '<div class="gcal-list-container">';

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dayIndex = i;
        const dayItems = getClassesForDay(dayIndex);

        if (dayItems.length === 0) continue;

        // Sort by start time
        dayItems.sort((a, b) => {
            return (a.schedule?.heure_debut || '').localeCompare(b.schedule?.heure_debut || '');
        });

        html += `
            <div class="gcal-list-day">
                <div class="gcal-list-day-header">${DAY_NAMES_FULL[i]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}</div>
        `;

        dayItems.forEach(item => {
            const cls = item.class;
            const schedule = item.schedule;
            const color = SUBJECT_COLORS[cls.subject] || SUBJECT_COLORS.autre;
            const icon = SUBJECT_ICONS[cls.subject] || '';

            // Use schedule-level room/teacher if available, fallback to class-level
            const room = schedule.room || cls.room;
            const teacherId = schedule.teacher_id || cls.teacher_id;
            let teacherName = cls.teacher_name || '';
            if (schedule.teacher_id && intervenants) {
                const teacher = intervenants.find(i => i.id === schedule.teacher_id);
                if (teacher) {
                    teacherName = `${teacher.first_name} ${teacher.last_name}`;
                }
            }

            html += `
                <div class="gcal-list-event" data-class-id="${cls.id}">
                    <div class="gcal-list-event-color" style="background: ${color};"></div>
                    <div class="gcal-list-event-time">
                        ${schedule?.heure_debut || '?'}<br>
                        ${schedule?.heure_fin || '?'}
                    </div>
                    <div class="gcal-list-event-content">
                        <div class="gcal-list-event-title">${icon}<span>${cls.name}</span></div>
                        <div class="gcal-list-event-info">
                            ${teacherName ? teacherName : ''}
                            ${room ? ` • ${room}` : ''}
                            ${cls.enrolled_count ? ` • ${cls.enrolled_count} élèves` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
    }

    if (classesCache.length === 0) {
        html += `
            <div style="text-align: center; padding: 60px 20px; color: var(--color-text-muted);">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 16px; opacity: 0.5;">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <h3>Aucune classe</h3>
                <p>Commencez par créer votre première classe</p>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;

    // Event listeners
    container.querySelectorAll('.gcal-list-event').forEach(evt => {
        evt.addEventListener('click', () => {
            const classId = evt.dataset.classId;
            openClassDetail(classId);
        });
    });
}

// Helper functions
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(d1, d2) {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

async function openClassDetail(classId) {
    try {
        const response = await apiService.getSchoolClass(classId);
        if (!response.success) {
            toastError('Erreur chargement classe');
            return;
        }

        const cls = response.data;
        const color = SUBJECT_COLORS[cls.subject] || SUBJECT_COLORS.autre;
        const icon = SUBJECT_ICONS[cls.subject] || SUBJECT_ICONS.autre;
        const schedule = parseSchedule(cls.schedule);
        const classStudents = cls.students || [];

        openBottomSheet({
            title: '',
            size: 'large',
            content: `
                <div class="class-detail-header">
                    <div class="class-detail-icon" style="background: ${color}20; color: ${color};">
                        ${icon}
                    </div>
                    <div>
                        <div class="class-detail-title">${cls.name}</div>
                        <div class="class-detail-subtitle">${cls.subject} • Niveau ${cls.level || 'débutant'}</div>
                    </div>
                </div>

                <div class="class-detail-stats">
                    <div class="class-stat-card">
                        <div class="class-stat-value">${classStudents.length}</div>
                        <div class="class-stat-label">Élèves inscrits</div>
                    </div>
                    <div class="class-stat-card">
                        <div class="class-stat-value">${cls.max_capacity || 20}</div>
                        <div class="class-stat-label">Capacité max</div>
                    </div>
                    <div class="class-stat-card">
                        <div class="class-stat-value">${cls.max_capacity ? Math.round((classStudents.length / cls.max_capacity) * 100) : 0}%</div>
                        <div class="class-stat-label">Remplissage</div>
                    </div>
                </div>

                <div class="class-schedule-info">
                    ${schedule.length > 0 ? schedule.map((s, idx) => `
                        <div class="class-schedule-row" ${idx > 0 ? 'style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--color-border);"' : ''}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <strong>${s.jour || 'Non défini'}</strong> : ${s.heure_debut || '?'} - ${s.heure_fin || '?'}
                        </div>
                    `).join('') : '<div class="class-schedule-row" style="color: var(--color-text-muted);">Aucun horaire défini</div>'}
                    ${cls.room ? `
                        <div class="class-schedule-row" style="margin-top: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            ${cls.room}
                        </div>
                    ` : ''}
                    ${cls.teacher_name ? `
                        <div class="class-schedule-row">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            ${cls.teacher_name}
                        </div>
                    ` : ''}
                </div>

                <div class="students-section">
                    <div class="students-section-header">
                        <span class="students-section-title">Élèves inscrits (${classStudents.length})</span>
                        <button class="btn btn-sm btn-secondary" id="add-student-btn">+ Inscrire</button>
                    </div>
                    ${classStudents.length > 0 ? `
                        <div class="students-list">
                            ${classStudents.map(s => `
                                <div class="student-item">
                                    <div class="student-avatar">${(s.first_name?.[0] || '')+(s.last_name?.[0] || '')}</div>
                                    <div class="student-info">
                                        <div class="student-name">${s.first_name} ${s.last_name}</div>
                                        <div class="student-number">${s.student_number || ''}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-students">
                            Aucun élève inscrit à cette classe
                        </div>
                    `}
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" id="edit-class-btn">Modifier</button>
                <button class="btn btn-primary" id="close-detail-btn">Fermer</button>
            `
        });

        document.getElementById('close-detail-btn')?.addEventListener('click', closeBottomSheet);
        document.getElementById('edit-class-btn')?.addEventListener('click', () => {
            closeBottomSheet();
            setTimeout(() => openClassForm(cls), 300);
        });
        document.getElementById('add-student-btn')?.addEventListener('click', () => {
            openEnrollStudentModal(cls);
        });

    } catch (error) {
        console.error('Error loading class detail:', error);
        toastError('Erreur chargement détails');
    }
}

function openEnrollStudentModal(cls) {
    const enrolledIds = (cls.students || []).map(s => s.id);
    const availableStudents = students.filter(s => !enrolledIds.includes(s.id));

    openBottomSheet({
        title: 'Inscrire un élève',
        content: `
            <div class="form-group">
                <label class="form-label">Sélectionner un élève</label>
                <select class="form-select" id="student-select">
                    <option value="">-- Choisir --</option>
                    ${availableStudents.map(s => `
                        <option value="${s.id}">${s.first_name} ${s.last_name} (${s.student_number || ''})</option>
                    `).join('')}
                </select>
            </div>
        `,
        footer: `
            <button class="btn btn-secondary" id="cancel-enroll">Annuler</button>
            <button class="btn btn-primary" id="confirm-enroll">Inscrire</button>
        `
    });

    document.getElementById('cancel-enroll')?.addEventListener('click', () => {
        closeBottomSheet();
        setTimeout(() => openClassDetail(cls.id), 300);
    });

    document.getElementById('confirm-enroll')?.addEventListener('click', async () => {
        const studentId = document.getElementById('student-select').value;
        if (!studentId) {
            toastError('Sélectionnez un élève');
            return;
        }

        try {
            await apiService.enrollStudentInClass(cls.id, studentId);
            toastSuccess('Élève inscrit');
            closeBottomSheet();
            await loadData();
            renderCalendar();
        } catch (error) {
            toastError('Erreur inscription');
        }
    });
}

function openClassForm(cls = null) {
    const isEdit = !!cls;
    const schedules = cls ? parseSchedule(cls.schedule) : [];

    const DAY_SHORTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const renderScheduleCard = (s = null, index = 0) => `
        <div class="schedule-card" data-index="${index}">
            <button type="button" class="schedule-card-remove" title="Supprimer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div class="schedule-card-days">
                ${DAY_NAMES_FULL.map((d, i) => `
                    <button type="button" class="schedule-day-chip ${s?.jour === d ? 'active' : ''}" data-day="${d}">${DAY_SHORTS[i]}</button>
                `).join('')}
            </div>
            <div class="schedule-card-time">
                <div class="schedule-time-group">
                    <input type="time" class="schedule-time-input schedule-debut" value="${s?.heure_debut || ''}">
                </div>
                <span class="schedule-time-sep">→</span>
                <div class="schedule-time-group">
                    <input type="time" class="schedule-time-input schedule-fin" value="${s?.heure_fin || ''}">
                </div>
            </div>
            <div class="schedule-card-details">
                <div class="schedule-detail-group">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <input type="text" class="schedule-detail-input schedule-room" placeholder="Salle" value="${s?.room || ''}">
                </div>
                <div class="schedule-detail-group">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <select class="schedule-detail-select schedule-teacher">
                        <option value="">Enseignant</option>
                        ${intervenants.map(i => `
                            <option value="${i.id}" ${s?.teacher_id == i.id ? 'selected' : ''}>${i.first_name} ${i.last_name}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
        </div>
    `;

    openBottomSheet({
        title: isEdit ? 'Modifier la classe' : 'Nouvelle classe',
        size: 'large',
        content: `
            <style>
                .schedule-section {
                    background: var(--color-bg-secondary);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-md);
                    margin-bottom: var(--spacing-md);
                }
                .schedule-section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-md);
                }
                .schedule-section-title {
                    font-weight: 600;
                    font-size: var(--font-sm);
                    color: var(--color-text-secondary);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .schedule-section-title svg {
                    color: var(--school-primary);
                }
                .schedule-card {
                    background: var(--color-card-bg);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    padding: var(--spacing-md);
                    margin-bottom: var(--spacing-sm);
                    position: relative;
                }
                .schedule-card:last-of-type {
                    margin-bottom: 0;
                }
                .schedule-card-remove {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: transparent;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    color: var(--color-text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                }
                .schedule-card-remove:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--color-error);
                }
                .schedule-card-days {
                    display: flex;
                    gap: 6px;
                    margin-bottom: var(--spacing-md);
                    flex-wrap: wrap;
                }
                .schedule-day-chip {
                    padding: 6px 12px;
                    border: 1px solid var(--color-border);
                    border-radius: 100px;
                    background: var(--color-bg-primary);
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .schedule-day-chip:hover {
                    border-color: var(--school-primary);
                    color: var(--school-primary);
                }
                .schedule-day-chip.active {
                    background: var(--school-primary);
                    border-color: var(--school-primary);
                    color: white;
                }
                .schedule-card-time {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                }
                .schedule-time-group {
                    flex: 1;
                }
                .schedule-time-input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    background: var(--color-bg-primary);
                    font-size: 15px;
                    font-weight: 500;
                    text-align: center;
                    color: var(--color-text-primary);
                }
                .schedule-time-input:focus {
                    outline: none;
                    border-color: var(--school-primary);
                    box-shadow: 0 0 0 3px var(--school-focus-ring);
                }
                .schedule-time-sep {
                    color: var(--color-text-muted);
                    font-size: 18px;
                    flex-shrink: 0;
                }
                .schedule-card-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    padding-top: var(--spacing-sm);
                    margin-top: var(--spacing-sm);
                    border-top: 1px dashed var(--color-border);
                }
                .schedule-detail-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .schedule-detail-group svg {
                    color: var(--color-text-muted);
                    flex-shrink: 0;
                }
                .schedule-detail-input,
                .schedule-detail-select {
                    flex: 1;
                    padding: 8px 10px;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    background: var(--color-bg-primary);
                    font-size: 13px;
                    color: var(--color-text-primary);
                    min-width: 0;
                }
                .schedule-detail-input:focus,
                .schedule-detail-select:focus {
                    outline: none;
                    border-color: var(--school-primary);
                }
                .schedule-detail-input::placeholder {
                    color: var(--color-text-muted);
                }
                .add-schedule-btn {
                    width: 100%;
                    padding: 12px;
                    border: 2px dashed var(--color-border);
                    border-radius: var(--radius-md);
                    background: transparent;
                    color: var(--color-text-muted);
                    font-size: var(--font-sm);
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.15s;
                    margin-top: var(--spacing-sm);
                }
                .add-schedule-btn:hover {
                    border-color: var(--school-primary);
                    color: var(--school-primary);
                    background: var(--school-primary-lighter);
                }
            </style>
            <form id="class-form">
                <div class="form-group">
                    <label class="form-label">Nom de la classe *</label>
                    <input type="text" class="form-input" name="name" required value="${cls?.name || ''}" placeholder="Ex: Coran Niveau 1">
                </div>
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Matière *</label>
                        <select class="form-select" name="subject" required>
                            <option value="coran" ${cls?.subject === 'coran' ? 'selected' : ''}>Coran</option>
                            <option value="arabe" ${cls?.subject === 'arabe' ? 'selected' : ''}>Arabe</option>
                            <option value="fiqh" ${cls?.subject === 'fiqh' ? 'selected' : ''}>Fiqh</option>
                            <option value="sira" ${cls?.subject === 'sira' ? 'selected' : ''}>Sira</option>
                            <option value="doua" ${cls?.subject === 'doua' ? 'selected' : ''}>Doua</option>
                            <option value="autre" ${cls?.subject === 'autre' ? 'selected' : ''}>Autre</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Niveau</label>
                        <select class="form-select" name="level">
                            <option value="debutant" ${cls?.level === 'debutant' ? 'selected' : ''}>Débutant</option>
                            <option value="intermediaire" ${cls?.level === 'intermediaire' ? 'selected' : ''}>Intermédiaire</option>
                            <option value="avance" ${cls?.level === 'avance' ? 'selected' : ''}>Avancé</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Capacité max</label>
                    <input type="number" class="form-input" name="max_capacity" value="${cls?.max_capacity || 20}" min="1" style="max-width: 150px;">
                </div>
                <div class="schedule-section">
                    <div class="schedule-section-header">
                        <span class="schedule-section-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            Créneaux horaires
                        </span>
                    </div>
                    <div id="schedules-container">
                        ${schedules.length > 0
                            ? schedules.map((s, i) => renderScheduleCard(s, i)).join('')
                            : renderScheduleCard(null, 0)
                        }
                    </div>
                    <button type="button" class="add-schedule-btn" id="add-schedule-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Ajouter un créneau
                    </button>
                </div>
            </form>
        `,
        footer: `
            ${isEdit ? '<button class="btn btn-danger" id="delete-class-btn">Supprimer</button>' : ''}
            <button class="btn btn-secondary" id="cancel-class-btn">Annuler</button>
            <button class="btn btn-primary" id="save-class-btn">${isEdit ? 'Enregistrer' : 'Créer'}</button>
        `
    });

    document.getElementById('cancel-class-btn')?.addEventListener('click', closeBottomSheet);

    // Schedule card management
    let scheduleIndex = schedules.length || 1;

    function attachScheduleListeners() {
        // Day chip selection (only one day per card)
        document.querySelectorAll('.schedule-day-chip').forEach(chip => {
            chip.onclick = (e) => {
                e.preventDefault();
                const card = chip.closest('.schedule-card');
                card.querySelectorAll('.schedule-day-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            };
        });

        // Remove card
        document.querySelectorAll('.schedule-card-remove').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const card = btn.closest('.schedule-card');
                const container = document.getElementById('schedules-container');
                if (container.querySelectorAll('.schedule-card').length > 1) {
                    card.remove();
                } else {
                    // Reset first card instead of removing
                    card.querySelectorAll('.schedule-day-chip').forEach(c => c.classList.remove('active'));
                    card.querySelector('.schedule-debut').value = '';
                    card.querySelector('.schedule-fin').value = '';
                }
            };
        });
    }
    attachScheduleListeners();

    document.getElementById('add-schedule-btn')?.addEventListener('click', () => {
        const container = document.getElementById('schedules-container');
        const wrapper = document.createElement('div');
        wrapper.innerHTML = renderScheduleCard(null, scheduleIndex);
        container.appendChild(wrapper.firstElementChild);
        scheduleIndex++;
        attachScheduleListeners();
    });

    if (isEdit) {
        document.getElementById('delete-class-btn')?.addEventListener('click', async () => {
            if (confirm('Supprimer cette classe ?')) {
                try {
                    await apiService.deleteSchoolClass(cls.id);
                    toastSuccess('Classe supprimée');
                    closeBottomSheet();
                    await loadData();
                    renderCalendar();
                } catch (error) {
                    toastError('Erreur suppression');
                }
            }
        });
    }

    document.getElementById('save-class-btn')?.addEventListener('click', async () => {
        const form = document.getElementById('class-form');
        const formData = new FormData(form);

        // Collect all schedules from cards
        const scheduleCards = document.querySelectorAll('.schedule-card');
        const scheduleList = [];
        scheduleCards.forEach(card => {
            const activeDay = card.querySelector('.schedule-day-chip.active');
            const jour = activeDay ? activeDay.dataset.day : null;
            const debut = card.querySelector('.schedule-debut').value;
            const fin = card.querySelector('.schedule-fin').value;
            const room = card.querySelector('.schedule-room')?.value || '';
            const teacherId = card.querySelector('.schedule-teacher')?.value || null;
            if (jour && debut && fin) {
                scheduleList.push({
                    jour,
                    heure_debut: debut,
                    heure_fin: fin,
                    room: room || null,
                    teacher_id: teacherId ? parseInt(teacherId) : null
                });
            }
        });

        const data = {
            name: formData.get('name'),
            subject: formData.get('subject'),
            level: formData.get('level'),
            max_capacity: parseInt(formData.get('max_capacity')) || 20,
            schedule: scheduleList.length > 0 ? scheduleList : null
        };

        if (!data.name || !data.subject) {
            toastError('Nom et matière requis');
            return;
        }

        try {
            if (isEdit) {
                await apiService.updateSchoolClass(cls.id, data);
                toastSuccess('Classe modifiée');
            } else {
                await apiService.createSchoolClass(data);
                toastSuccess('Classe créée');
            }
            closeBottomSheet();
            await loadData();
            renderCalendar();
        } catch (error) {
            toastError('Erreur enregistrement');
        }
    });
}
