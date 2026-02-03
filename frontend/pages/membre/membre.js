import i18n from '../../services/i18n.service.js';
import appState from '../../store/appState.store.js';
import authService from '../../services/auth.service.js';
import router from '../../router/router.js';
import { openBottomSheet } from '../../components/bottomSheet/bottomSheet.js';

const mockActus = [
    { id: 1, type: 'event', title: 'Cours de Coran', subtitle: 'Dimanche 10h', desc: 'Reprise des cours pour tous niveaux', date: '2026-02-05' },
    { id: 2, type: 'info', title: 'Ramadan 2026', subtitle: '18 Fév - 19 Mars', desc: 'Calendrier UOIF - Programme Tarawih disponible prochainement', date: '2026-02-01' },
    { id: 3, type: 'alert', title: 'Cotisation', subtitle: 'Rappel', desc: 'Pensez à régulariser votre cotisation', date: '2026-01-28' },
];

const mockPaiements = [
    { month: 'Janvier', year: 2026, amount: 25, status: 'paid', date: '2026-01-05' },
    { month: 'Décembre', year: 2025, amount: 25, status: 'paid', date: '2025-12-03' },
    { month: 'Novembre', year: 2025, amount: 25, status: 'paid', date: '2025-11-02' },
    { month: 'Octobre', year: 2025, amount: 25, status: 'paid', date: '2025-10-01' },
    { month: 'Septembre', year: 2025, amount: 25, status: 'paid', date: '2025-09-04' },
    { month: 'Août', year: 2025, amount: 25, status: 'paid', date: '2025-08-02' },
];

export async function renderMembrePage() {
    const pageContent = document.getElementById('page-content');
    const user = appState.get('user');
    const initials = user ? (user.first_name[0] + user.last_name[0]).toUpperCase() : 'U';

    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
    document.getElementById('mobile-nav').style.display = 'none';

    pageContent.innerHTML = `
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }

            #page-content {
                padding: 0 !important;
                margin: 0 !important;
            }

            html, body {
                overflow-x: hidden;
                overscroll-behavior: none;
            }

            .m-app {
                min-height: 100vh;
                background: #FAFAFA;
                font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
                width: 100%;
                overflow: hidden;
            }

            .m-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px;
                padding-top: calc(16px + env(safe-area-inset-top, 0));
                background: #FAFAFA;
            }

            .m-logo {
                font-size: 22px;
                font-weight: 700;
                color: #1a1a1a;
                letter-spacing: -0.5px;
            }

            .m-logo span {
                color: #8B6914;
            }

            .m-header-right {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .m-theme-toggle {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgba(139, 105, 20, 0.1);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #8B6914;
                transition: all 0.2s;
            }

            .m-theme-toggle:active {
                transform: scale(0.95);
            }

            .m-avatar-wrapper {
                position: relative;
            }

            .m-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: linear-gradient(145deg, #8B6914, #6B5210);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                border: none;
                transition: transform 0.15s;
            }

            .m-avatar:active {
                transform: scale(0.95);
            }

            .m-dropdown {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 24px rgba(0,0,0,0.12);
                min-width: 220px;
                padding: 8px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-8px);
                transition: all 0.2s;
                z-index: 1000;
            }

            .m-dropdown.open {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .m-dropdown-header {
                padding: 12px 16px;
                border-bottom: 1px solid #f0f0f0;
                margin-bottom: 8px;
            }

            .m-dropdown-name {
                font-weight: 600;
                font-size: 15px;
                color: #1a1a1a;
            }

            .m-dropdown-email {
                font-size: 12px;
                color: #999;
                margin-top: 2px;
            }

            .m-dropdown-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border-radius: 10px;
                cursor: pointer;
                transition: background 0.15s;
                font-size: 14px;
                color: #1a1a1a;
                width: 100%;
                border: none;
                background: none;
                text-align: left;
            }

            .m-dropdown-item:hover,
            .m-dropdown-item:active {
                background: #f5f5f5;
            }

            .m-dropdown-item svg {
                width: 18px;
                height: 18px;
                color: #8B6914;
            }

            .m-dropdown-item.danger {
                color: #dc2626;
            }

            .m-dropdown-item.danger svg {
                color: #dc2626;
            }

            .m-dropdown-divider {
                height: 1px;
                background: #f0f0f0;
                margin: 8px 0;
            }

            [data-theme="dark"] .m-dropdown {
                background: #252525;
                box-shadow: 0 4px 24px rgba(0,0,0,0.4);
            }

            [data-theme="dark"] .m-dropdown-header {
                border-color: #333;
            }

            [data-theme="dark"] .m-dropdown-name {
                color: #fff;
            }

            [data-theme="dark"] .m-dropdown-item {
                color: #fff;
            }

            [data-theme="dark"] .m-dropdown-item:hover,
            [data-theme="dark"] .m-dropdown-item:active {
                background: #333;
            }

            [data-theme="dark"] .m-dropdown-item svg {
                color: #C9A227;
            }

            [data-theme="dark"] .m-dropdown-divider {
                background: #333;
            }

            /* Stripe Card Form */
            .m-card-form {
                padding: 16px;
            }

            .m-card-preview {
                background: linear-gradient(135deg, #8B6914, #5C3D0D);
                border-radius: 16px;
                padding: 24px;
                color: white;
                margin-bottom: 24px;
                aspect-ratio: 1.6;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }

            .m-card-chip {
                width: 40px;
                height: 30px;
                background: linear-gradient(135deg, #C9A227, #8B6914);
                border-radius: 6px;
            }

            .m-card-number {
                font-size: 18px;
                letter-spacing: 2px;
                font-family: monospace;
            }

            .m-card-bottom {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
            }

            .m-card-label {
                font-size: 10px;
                opacity: 0.7;
                text-transform: uppercase;
                margin-bottom: 4px;
            }

            .m-card-value {
                font-size: 14px;
            }

            .m-form-group {
                margin-bottom: 16px;
            }

            .m-form-label {
                display: block;
                font-size: 13px;
                font-weight: 500;
                color: #666;
                margin-bottom: 8px;
            }

            .m-form-input {
                width: 100%;
                padding: 14px 16px;
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                font-size: 16px;
                background: #FAFAFA;
                transition: all 0.2s;
            }

            .m-form-input:focus {
                outline: none;
                border-color: #8B6914;
                background: white;
            }

            .m-form-row {
                display: flex;
                gap: 12px;
            }

            .m-form-row .m-form-group {
                flex: 1;
            }

            .m-btn-stripe {
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, #8B6914, #6B5210);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin-top: 8px;
            }

            .m-btn-stripe:active {
                transform: scale(0.98);
            }

            .m-stripe-secure {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                margin-top: 16px;
                font-size: 12px;
                color: #999;
            }

            [data-theme="dark"] .m-form-input {
                background: #1a1a1a;
                border-color: #333;
                color: #fff;
            }

            [data-theme="dark"] .m-form-input:focus {
                background: #252525;
                border-color: #C9A227;
            }

            [data-theme="dark"] .m-form-label {
                color: #999;
            }

            /* DARK THEME */
            [data-theme="dark"] .m-app {
                background: #1a1a1a;
            }

            [data-theme="dark"] .m-header {
                background: #1a1a1a;
            }

            [data-theme="dark"] .m-logo {
                color: #fff;
            }

            [data-theme="dark"] .m-tab {
                color: #C9A227;
                background: rgba(201, 162, 39, 0.1);
            }

            [data-theme="dark"] .m-tab.active {
                background: linear-gradient(135deg, #C9A227, #8B6914);
                color: #1a1a1a;
            }

            [data-theme="dark"] .m-reel-card {
                background: linear-gradient(180deg, #2a2520 0%, #1f1b17 100%);
            }

            [data-theme="dark"] .m-reel:nth-child(2) .m-reel-card {
                background: linear-gradient(180deg, #252220 0%, #1a1815 100%);
            }

            [data-theme="dark"] .m-reel:nth-child(3) .m-reel-card {
                background: linear-gradient(180deg, #282420 0%, #1d1915 100%);
            }

            [data-theme="dark"] .m-reel-title {
                color: #fff;
            }

            [data-theme="dark"] .m-reel-subtitle {
                color: #C9A227;
            }

            [data-theme="dark"] .m-reel-desc {
                color: #999;
            }

            [data-theme="dark"] .m-pay-header {
                background: linear-gradient(180deg, #2a2520 0%, #1f1b17 100%);
            }

            [data-theme="dark"] .m-pay-amount {
                color: #fff;
            }

            [data-theme="dark"] .m-pay-label {
                color: #C9A227;
            }

            [data-theme="dark"] .m-pay-list {
                background: linear-gradient(180deg, #252220 0%, #1a1815 100%);
            }

            [data-theme="dark"] .m-pay-item + .m-pay-item {
                border-color: rgba(201, 162, 39, 0.15);
            }

            [data-theme="dark"] .m-pay-item:active {
                background: rgba(201, 162, 39, 0.1);
            }

            [data-theme="dark"] .m-pay-month {
                color: #fff;
            }

            [data-theme="dark"] .m-pay-date {
                color: #C9A227;
            }

            [data-theme="dark"] .m-pay-price {
                color: #C9A227;
            }

            [data-theme="dark"] .m-pay-dot {
                background: #C9A227;
            }

            [data-theme="dark"] .m-pay-arrow {
                color: #C9A227;
            }

            [data-theme="dark"] .m-profile-name {
                color: #fff;
            }

            [data-theme="dark"] .m-stat-value {
                color: #fff;
            }

            [data-theme="dark"] .m-theme-toggle {
                background: rgba(201, 162, 39, 0.15);
                color: #C9A227;
            }

            [data-theme="dark"] .m-reel-dot {
                background: #444;
            }

            [data-theme="dark"] .m-reel-dot.active {
                background: #C9A227;
            }

            .m-content {
                padding-bottom: 20px;
            }

            /* TAB BAR */
            .m-tabs {
                display: flex;
                padding: 0 16px;
                gap: 6px;
                margin-bottom: 20px;
            }

            .m-tab {
                padding: 10px 18px;
                border-radius: 100px;
                font-size: 14px;
                font-weight: 500;
                color: #8B6914;
                background: rgba(139, 105, 20, 0.08);
                border: none;
                cursor: pointer;
                transition: all 0.2s;
            }

            .m-tab.active {
                background: linear-gradient(135deg, #8B6914, #6B5210);
                color: white;
            }

            /* SECTIONS */
            .m-section {
                display: none;
                padding: 0;
            }

            .m-section.active {
                display: block;
            }

            .m-section-reels {
                display: none;
                padding: 0;
                height: calc(100vh - 120px);
                overflow: hidden;
            }

            .m-section-reels.active {
                display: block;
            }

            /* REELS / ACTUS */
            .m-reels {
                height: 100%;
                overflow-y: scroll;
                scroll-snap-type: y mandatory;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: none;
            }

            .m-reels::-webkit-scrollbar {
                display: none;
            }

            .m-reel {
                height: calc(100vh - 120px);
                scroll-snap-align: start;
                scroll-snap-stop: always;
                padding: 8px;
                position: relative;
            }

            .m-reel-card {
                background: linear-gradient(180deg, #F5F0E6 0%, #EDE6D6 100%);
                border-radius: 20px;
                height: 100%;
                width: 100%;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                padding: 32px 24px;
                position: relative;
            }

            .m-reel:nth-child(2) .m-reel-card {
                background: linear-gradient(180deg, #F0EDE6 0%, #E6E3D6 100%);
            }

            .m-reel:nth-child(3) .m-reel-card {
                background: linear-gradient(180deg, #EDE9E0 0%, #E3DFD3 100%);
            }

            .m-reel-title {
                font-size: 32px;
                font-weight: 700;
                color: #1a1a1a;
                margin-bottom: 8px;
                letter-spacing: -0.5px;
            }

            .m-reel-subtitle {
                font-size: 15px;
                color: #8B6914;
                font-weight: 600;
                margin-bottom: 12px;
            }

            .m-reel-desc {
                font-size: 16px;
                color: #666;
                line-height: 1.5;
            }

            .m-reel-dots {
                position: absolute;
                right: 16px;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .m-reel-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #ddd;
                transition: all 0.2s;
            }

            .m-reel-dot.active {
                height: 20px;
                background: #8B6914;
            }

            .m-swipe-hint {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #ccc;
                font-size: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                animation: bounce 2s infinite;
            }

            @keyframes bounce {
                0%, 100% { transform: translate(-50%, -50%); }
                50% { transform: translate(-50%, calc(-50% - 8px)); }
            }

            /* PAIEMENTS */
            .m-pay-header {
                text-align: center;
                padding: 24px 16px 32px;
                background: linear-gradient(180deg, #F5F0E6 0%, #EDE6D6 100%);
                border-radius: 20px;
                margin: 0 16px 16px;
            }

            .m-pay-amount {
                font-size: 48px;
                font-weight: 700;
                color: #1a1a1a;
                letter-spacing: -2px;
            }

            .m-pay-label {
                font-size: 13px;
                color: #8B6914;
                margin-top: 4px;
                font-weight: 500;
            }

            .m-pay-list {
                background: linear-gradient(180deg, #F0EDE6 0%, #E6E3D6 100%);
                border-radius: 20px;
                overflow: hidden;
                margin: 0 16px;
            }

            .m-pay-item {
                display: flex;
                align-items: center;
                padding: 18px 20px;
                cursor: pointer;
                transition: background 0.15s;
            }

            .m-pay-item:active {
                background: rgba(139, 105, 20, 0.1);
            }

            .m-pay-item + .m-pay-item {
                border-top: 1px solid rgba(139, 105, 20, 0.1);
            }

            .m-pay-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #8B6914;
                margin-right: 16px;
            }

            .m-pay-info {
                flex: 1;
            }

            .m-pay-month {
                font-size: 16px;
                font-weight: 600;
                color: #1a1a1a;
            }

            .m-pay-date {
                font-size: 12px;
                color: #6B5210;
                margin-top: 2px;
            }

            .m-pay-price {
                font-size: 16px;
                font-weight: 700;
                color: #8B6914;
            }

            .m-pay-arrow {
                margin-left: 12px;
                color: #8B6914;
                opacity: 0.5;
            }

            /* PROFIL */
            .m-profile {
                text-align: center;
                padding-top: 20px;
            }

            .m-profile-avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: linear-gradient(145deg, #8B6914, #6B5210);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                font-weight: 600;
                margin: 0 auto 16px;
            }

            .m-profile-name {
                font-size: 22px;
                font-weight: 600;
                color: #1a1a1a;
            }

            .m-profile-id {
                font-size: 13px;
                color: #999;
                margin-top: 4px;
            }

            .m-profile-stats {
                display: flex;
                justify-content: center;
                gap: 40px;
                margin-top: 32px;
            }

            .m-stat-value {
                font-size: 28px;
                font-weight: 700;
                color: #1a1a1a;
            }

            .m-stat-label {
                font-size: 12px;
                color: #999;
                margin-top: 4px;
            }

            /* BOTTOM NAV */
            .m-nav {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: white;
                padding: 12px 0;
                padding-bottom: calc(12px + env(safe-area-inset-bottom, 0));
                display: flex;
                justify-content: center;
                gap: 48px;
            }

            .m-nav-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                color: #999;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
            }

            .m-nav-item.active {
                color: #8B6914;
            }

            .m-nav-item svg {
                width: 24px;
                height: 24px;
            }

            .m-nav-label {
                font-size: 10px;
                font-weight: 500;
            }

            /* RECEIPT */
            .m-receipt {
                background: #FAFAFA;
                border-radius: 12px;
                padding: 24px;
                margin: 16px;
                font-family: 'SF Mono', monospace;
            }

            .m-receipt-header {
                text-align: center;
                padding-bottom: 16px;
                border-bottom: 1px dashed #ddd;
                margin-bottom: 16px;
            }

            .m-receipt-logo {
                font-size: 20px;
                font-weight: 700;
                color: #8B6914;
            }

            .m-receipt-row {
                display: flex;
                justify-content: space-between;
                font-size: 13px;
                padding: 6px 0;
                color: #666;
            }

            .m-receipt-total {
                display: flex;
                justify-content: space-between;
                font-size: 18px;
                font-weight: 700;
                padding-top: 16px;
                margin-top: 16px;
                border-top: 1px dashed #ddd;
                color: #1a1a1a;
            }

            .m-receipt-footer {
                text-align: center;
                margin-top: 20px;
                font-size: 14px;
                color: #8B6914;
            }
        </style>

        <div class="m-app">
            <header class="m-header">
                <div class="m-logo">jama3<span>.</span></div>
                <div class="m-header-right">
                    <button class="m-theme-toggle" id="theme-toggle">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    </button>
                    <div class="m-avatar-wrapper">
                        <button class="m-avatar" id="avatar-btn">${initials}</button>
                        <div class="m-dropdown" id="user-dropdown">
                            <div class="m-dropdown-header">
                                <div class="m-dropdown-name">${user ? `${user.first_name} ${user.last_name}` : 'Membre'}</div>
                                <div class="m-dropdown-email">${user?.email || ''}</div>
                            </div>
                            <button class="m-dropdown-item" id="btn-add-card">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                                Ajouter une carte
                            </button>
                            <button class="m-dropdown-item" id="btn-manage-cards">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4m-6-10H2m20 0h-4m-2.5-5.5L13 9m-2 6l-2.5 2.5m9-9L15 11m-6 2l-2.5 2.5"/></svg>
                                Gérer mes paiements
                            </button>
                            <div class="m-dropdown-divider"></div>
                            <button class="m-dropdown-item danger" id="btn-logout">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div class="m-tabs">
                <button class="m-tab active" data-tab="actus">Actus</button>
                <button class="m-tab" data-tab="paiements">Paiements</button>
            </div>

            <div class="m-content">
                <section class="m-section-reels active" id="sec-actus">
                    <div class="m-reels" id="reels">
                        ${mockActus.map((a, i) => `
                            <div class="m-reel">
                                <div class="m-reel-card">
                                    ${i === 0 ? `<div class="m-swipe-hint"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>Swipe</div>` : ''}
                                    <div class="m-reel-content">
                                        <div class="m-reel-title">${a.title}</div>
                                        <div class="m-reel-subtitle">${a.subtitle}</div>
                                        <div class="m-reel-desc">${a.desc}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="m-reel-dots" id="reel-dots">
                        ${mockActus.map((_, i) => `<div class="m-reel-dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
                    </div>
                </section>

                <section class="m-section" id="sec-paiements">
                    <div class="m-pay-header">
                        <div class="m-pay-amount">${mockPaiements.reduce((s, p) => s + p.amount, 0)}€</div>
                        <div class="m-pay-label">Total cotisations</div>
                    </div>
                    <div class="m-pay-list">
                        ${mockPaiements.map(p => `
                            <div class="m-pay-item" data-paiement='${JSON.stringify(p)}'>
                                <div class="m-pay-dot"></div>
                                <div class="m-pay-info">
                                    <div class="m-pay-month">${p.month} ${p.year}</div>
                                    <div class="m-pay-date">${new Date(p.date).toLocaleDateString('fr-FR')}</div>
                                </div>
                                <div class="m-pay-price">${p.amount}€</div>
                                <svg class="m-pay-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section class="m-section" id="sec-profil">
                    <div class="m-profile">
                        <div class="m-profile-avatar">${initials}</div>
                        <div class="m-profile-name">${user ? `${user.first_name} ${user.last_name}` : 'Membre'}</div>
                        <div class="m-profile-id">ADH-2024-001</div>
                        <div class="m-profile-stats">
                            <div>
                                <div class="m-stat-value">2</div>
                                <div class="m-stat-label">Années</div>
                            </div>
                            <div>
                                <div class="m-stat-value">12</div>
                                <div class="m-stat-label">Paiements</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `;

    // Tabs
    const tabs = document.querySelectorAll('.m-tab');
    const sections = {
        actus: document.getElementById('sec-actus'),
        paiements: document.getElementById('sec-paiements'),
        profil: document.getElementById('sec-profil')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            Object.values(sections).forEach(s => s.classList.remove('active'));
            sections[tab.dataset.tab].classList.add('active');
        });
    });

    // Reels scroll indicator
    const reels = document.getElementById('reels');
    const dots = document.querySelectorAll('.m-reel-dot');

    if (reels) {
        reels.addEventListener('scroll', () => {
            const idx = Math.round(reels.scrollTop / reels.clientHeight);
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        });
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        appState.set('theme', next);
    });

    // User dropdown
    const avatarBtn = document.getElementById('avatar-btn');
    const dropdown = document.getElementById('user-dropdown');

    avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('open');
    });

    dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        authService.logout();
        router.navigate('/login');
    });

    // Add card
    document.getElementById('btn-add-card').addEventListener('click', () => {
        dropdown.classList.remove('open');
        openBottomSheet({
            title: 'Ajouter une carte',
            content: `
                <div class="m-card-form">
                    <div class="m-card-preview">
                        <div class="m-card-chip"></div>
                        <div class="m-card-number">•••• •••• •••• ••••</div>
                        <div class="m-card-bottom">
                            <div>
                                <div class="m-card-label">Titulaire</div>
                                <div class="m-card-value" id="preview-name">VOTRE NOM</div>
                            </div>
                            <div>
                                <div class="m-card-label">Expire</div>
                                <div class="m-card-value" id="preview-exp">MM/AA</div>
                            </div>
                        </div>
                    </div>

                    <div class="m-form-group">
                        <label class="m-form-label">Numéro de carte</label>
                        <input type="text" class="m-form-input" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
                    </div>

                    <div class="m-form-group">
                        <label class="m-form-label">Titulaire de la carte</label>
                        <input type="text" class="m-form-input" id="card-name" placeholder="Nom sur la carte">
                    </div>

                    <div class="m-form-row">
                        <div class="m-form-group">
                            <label class="m-form-label">Date d'expiration</label>
                            <input type="text" class="m-form-input" id="card-exp" placeholder="MM/AA" maxlength="5">
                        </div>
                        <div class="m-form-group">
                            <label class="m-form-label">CVC</label>
                            <input type="text" class="m-form-input" id="card-cvc" placeholder="123" maxlength="3">
                        </div>
                    </div>

                    <button class="m-btn-stripe" id="btn-save-card">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        Enregistrer la carte
                    </button>

                    <div class="m-stripe-secure">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Paiement sécurisé par Stripe
                    </div>
                </div>
            `
        });

        // Card form interactions
        setTimeout(() => {
            const cardNumber = document.getElementById('card-number');
            const cardName = document.getElementById('card-name');
            const cardExp = document.getElementById('card-exp');
            const previewName = document.getElementById('preview-name');
            const previewExp = document.getElementById('preview-exp');

            if (cardNumber) {
                cardNumber.addEventListener('input', (e) => {
                    let v = e.target.value.replace(/\\s/g, '').replace(/\\D/g, '');
                    v = v.match(/.{1,4}/g)?.join(' ') || '';
                    e.target.value = v;
                });
            }

            if (cardName) {
                cardName.addEventListener('input', (e) => {
                    previewName.textContent = e.target.value.toUpperCase() || 'VOTRE NOM';
                });
            }

            if (cardExp) {
                cardExp.addEventListener('input', (e) => {
                    let v = e.target.value.replace(/\\D/g, '');
                    if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2);
                    e.target.value = v;
                    previewExp.textContent = v || 'MM/AA';
                });
            }

            const saveBtn = document.getElementById('btn-save-card');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    // TODO: Integrate with Stripe API
                    alert('Intégration Stripe à configurer');
                });
            }
        }, 100);
    });

    // Manage cards
    document.getElementById('btn-manage-cards').addEventListener('click', () => {
        dropdown.classList.remove('open');
        openBottomSheet({
            title: 'Mes moyens de paiement',
            content: `
                <div style="padding: 16px; text-align: center; color: #999;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; opacity: 0.5;"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <p>Aucune carte enregistrée</p>
                    <p style="font-size: 13px; margin-top: 8px;">Ajoutez une carte pour payer vos cotisations en ligne</p>
                </div>
            `
        });
    });

    // Paiement click
    document.querySelectorAll('.m-pay-item').forEach(item => {
        item.addEventListener('click', () => {
            const p = JSON.parse(item.dataset.paiement);
            openBottomSheet({
                title: 'Reçu',
                content: `
                    <div class="m-receipt">
                        <div class="m-receipt-header">
                            <div class="m-receipt-logo">jama3</div>
                        </div>
                        <div class="m-receipt-row"><span>Date</span><span>${new Date(p.date).toLocaleDateString('fr-FR')}</span></div>
                        <div class="m-receipt-row"><span>Période</span><span>${p.month} ${p.year}</span></div>
                        <div class="m-receipt-row"><span>Adhérent</span><span>${user ? user.first_name : 'Membre'}</span></div>
                        <div class="m-receipt-row"><span>Mode</span><span>Espèces</span></div>
                        <div class="m-receipt-total"><span>Total</span><span>${p.amount}€</span></div>
                        <div class="m-receipt-footer">جزاكم الله خيرا</div>
                    </div>
                `
            });
        });
    });
}
