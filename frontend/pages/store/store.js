import { renderNavbar } from '../../components/navbar/navbar.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess } from '../../components/toast/toast.js';

const modules = [
    {
        id: 'gestion-adherents',
        name: 'Gestion Adhérents',
        description: 'Gérez vos membres, fiches adhérents, statuts et historique complet.',
        longDescription: 'Solution complète pour la gestion de vos adhérents : fiches détaillées, suivi des statuts, historique des activités, import/export, recherche avancée et bien plus.',
        icon: 'users',
        color: '#3B82F6',
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        price: 'Inclus',
        priceDetail: 'Dans votre abonnement',
        features: ['Fiches adhérents illimitées', 'Import/Export Excel', 'Recherche avancée', 'Historique complet', 'Statuts personnalisés'],
        status: 'active',
        popular: false
    },
    {
        id: 'cotisations',
        name: 'Cotisations & Paiements',
        description: 'Suivez les cotisations, paiements et relances automatiques.',
        longDescription: 'Automatisez la gestion de vos cotisations : suivi des paiements, relances automatiques, tableau de bord financier, reçus et attestations.',
        icon: 'wallet',
        color: '#10B981',
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        price: 'Inclus',
        priceDetail: 'Dans votre abonnement',
        features: ['Suivi des paiements', 'Relances automatiques', 'Reçus PDF', 'Tableau de bord', 'Multi-saisons'],
        status: 'active',
        popular: false
    },
    {
        id: 'agenda',
        name: 'Agenda & Événements',
        description: 'Planifiez cours, réunions et événements avec inscriptions.',
        longDescription: 'Calendrier complet pour votre association : planification des cours, événements, gestion des inscriptions, notifications et rappels automatiques.',
        icon: 'calendar',
        color: '#F59E0B',
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        price: 'Inclus',
        priceDetail: 'Dans votre abonnement',
        features: ['Calendrier interactif', 'Inscriptions en ligne', 'Rappels automatiques', 'Gestion présences', 'Récurrence'],
        status: 'active',
        popular: false
    },
    {
        id: 'espace-membre',
        name: 'Espace Membre Mobile',
        description: 'Application mobile pour vos adhérents avec paiement en ligne.',
        longDescription: 'Offrez à vos membres leur espace personnel : consultation des cotisations, paiement en ligne sécurisé, actualités et notifications push.',
        icon: 'smartphone',
        color: '#8B5CF6',
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        price: '9€',
        priceDetail: '/mois',
        features: ['App mobile dédiée', 'Paiement Stripe', 'Notifications push', 'Actualités', 'QR Code membre'],
        status: 'available',
        popular: true
    },
    {
        id: 'comptabilite',
        name: 'Comptabilité Simplifiée',
        description: 'Gestion comptable adaptée aux associations loi 1901.',
        longDescription: 'Comptabilité simplifiée pour associations : journal des opérations, bilan, compte de résultat, export comptable et conformité légale.',
        icon: 'calculator',
        color: '#EC4899',
        gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
        price: '19€',
        priceDetail: '/mois',
        features: ['Journal des opérations', 'Bilan automatique', 'Export comptable', 'Catégories personnalisées', 'Rapports annuels'],
        status: 'coming',
        popular: false
    },
    {
        id: 'dons-zekat',
        name: 'Dons & Zakat',
        description: 'Collecte de dons, Zakat et Sadaqa avec reçus fiscaux.',
        longDescription: 'Plateforme de collecte de dons adaptée aux mosquées : dons en ligne, Zakat, Sadaqa, reçus fiscaux automatiques et suivi des donateurs.',
        icon: 'heart',
        color: '#EF4444',
        gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        price: '15€',
        priceDetail: '/mois',
        features: ['Collecte en ligne', 'Reçus fiscaux', 'Campagnes de dons', 'Suivi donateurs', 'Rapports Zakat'],
        status: 'coming',
        popular: true
    },
    {
        id: 'ecole-arabe',
        name: 'École Arabe & Coran',
        description: 'Gestion complète de votre école coranique et cours d\'arabe.',
        longDescription: 'Solution dédiée aux écoles coraniques : gestion des élèves, classes, présences, frais de scolarité et évaluations. Lien parent/adhérent pour le suivi familial.',
        icon: 'book',
        color: '#059669',
        gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        price: 'Inclus',
        priceDetail: 'Dans votre abonnement',
        features: ['Gestion des élèves', 'Classes & inscriptions', 'Suivi présences', 'Frais de scolarité', 'Évaluations & notes', 'Lien parent/adhérent'],
        status: 'active',
        popular: true
    },
    {
        id: 'communication',
        name: 'Communication & SMS',
        description: 'Envoyez emails et SMS à vos membres en masse.',
        longDescription: 'Communiquez efficacement : campagnes email, SMS en masse, notifications push, newsletters et annonces ciblées.',
        icon: 'message',
        color: '#6366F1',
        gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
        price: '12€',
        priceDetail: '/mois + SMS',
        features: ['Emails illimités', 'SMS en masse', 'Templates', 'Segmentation', 'Statistiques'],
        status: 'coming',
        popular: false
    },
    {
        id: 'site-web',
        name: 'Site Web Mosquée',
        description: 'Créez le site web de votre mosquée en quelques clics.',
        longDescription: 'Site web professionnel pour votre mosquée : horaires de prière automatiques, actualités, événements, dons en ligne et formulaire de contact.',
        icon: 'globe',
        color: '#0EA5E9',
        gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
        price: '29€',
        priceDetail: '/mois',
        features: ['Site clé en main', 'Horaires de prière', 'Actualités', 'Dons intégrés', 'Domaine personnalisé'],
        status: 'coming',
        popular: false
    }
];

const icons = {
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    wallet: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    smartphone: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`,
    calculator: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="8" y2="10.01"></line><line x1="12" y1="10" x2="12" y2="10.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="8" y1="14" x2="8" y2="14.01"></line><line x1="12" y1="14" x2="12" y2="14.01"></line><line x1="16" y1="14" x2="16" y2="14.01"></line><line x1="8" y1="18" x2="8" y2="18.01"></line><line x1="12" y1="18" x2="12" y2="18.01"></line><line x1="16" y1="18" x2="16" y2="18.01"></line></svg>`,
    heart: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    book: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    message: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    globe: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
};

export async function renderStorePage() {
    renderNavbar('Store');
    const pageContent = document.getElementById('page-content');

    pageContent.innerHTML = `
        <style>
            .store-container {
                min-height: 100vh;
                background: var(--color-bg-secondary);
            }

            /* Hero Section */
            .store-hero {
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2518 50%, #1a1a1a 100%);
                padding: 60px 20px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            .store-hero::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C9A227' stroke-width='0.5' opacity='0.1'%3E%3Cpath d='M50 0L55 20L75 20L59 32L65 52L50 40L35 52L41 32L25 20L45 20Z'/%3E%3Ccircle cx='50' cy='50' r='20'/%3E%3Ccircle cx='50' cy='50' r='35'/%3E%3C/g%3E%3C/svg%3E");
                pointer-events: none;
            }

            .store-hero-content {
                position: relative;
                z-index: 1;
                max-width: 700px;
                margin: 0 auto;
            }

            .store-hero-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(201, 162, 39, 0.2);
                color: #C9A227;
                padding: 8px 16px;
                border-radius: 100px;
                font-size: 13px;
                font-weight: 500;
                margin-bottom: 20px;
            }

            .store-hero h1 {
                color: white;
                font-size: 36px;
                font-weight: 700;
                margin-bottom: 16px;
                letter-spacing: -0.5px;
            }

            .store-hero h1 span {
                background: linear-gradient(135deg, #C9A227, #8B6914);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .store-hero p {
                color: rgba(255,255,255,0.7);
                font-size: 18px;
                line-height: 1.6;
                margin-bottom: 32px;
            }

            .store-hero-stats {
                display: flex;
                justify-content: center;
                gap: 48px;
            }

            .store-stat {
                text-align: center;
            }

            .store-stat-value {
                color: #C9A227;
                font-size: 32px;
                font-weight: 700;
            }

            .store-stat-label {
                color: rgba(255,255,255,0.5);
                font-size: 13px;
                margin-top: 4px;
            }

            /* Categories */
            .store-categories {
                display: flex;
                gap: 12px;
                padding: 20px;
                overflow-x: auto;
                background: var(--color-card-bg);
                border-bottom: 1px solid var(--color-border);
                -webkit-overflow-scrolling: touch;
            }

            .store-categories::-webkit-scrollbar {
                display: none;
            }

            .store-category {
                padding: 10px 20px;
                border-radius: 100px;
                font-size: 14px;
                font-weight: 500;
                white-space: nowrap;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid var(--color-border);
                background: var(--color-bg-secondary);
                color: var(--color-text-secondary);
            }

            .store-category:hover {
                border-color: var(--color-primary);
                color: var(--color-primary);
            }

            .store-category.active {
                background: var(--color-primary);
                color: white;
                border-color: var(--color-primary);
            }

            /* Modules Grid */
            .store-content {
                padding: 24px;
                max-width: 1400px;
                margin: 0 auto;
            }

            .store-section-title {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .store-section-title .count {
                background: var(--color-bg-secondary);
                padding: 4px 12px;
                border-radius: 100px;
                font-size: 13px;
                color: var(--color-text-muted);
            }

            .modules-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            }

            @media (max-width: 768px) {
                .modules-grid {
                    grid-template-columns: 1fr;
                }
            }

            /* Module Card */
            .module-card {
                background: var(--color-card-bg);
                border-radius: 20px;
                overflow: hidden;
                border: 1px solid var(--color-border);
                transition: all 0.3s;
                cursor: pointer;
                position: relative;
            }

            .module-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 40px rgba(0,0,0,0.12);
                border-color: transparent;
            }

            [data-theme="dark"] .module-card:hover {
                box-shadow: 0 12px 40px rgba(0,0,0,0.4);
            }

            .module-card-header {
                padding: 24px;
                position: relative;
            }

            .module-card-visual {
                width: 64px;
                height: 64px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                margin-bottom: 16px;
                position: relative;
            }

            .module-card-visual::after {
                content: '';
                position: absolute;
                inset: -4px;
                border-radius: 20px;
                background: inherit;
                opacity: 0.2;
                z-index: -1;
            }

            .module-badge {
                position: absolute;
                top: 16px;
                right: 16px;
                padding: 6px 12px;
                border-radius: 100px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .module-badge.popular {
                background: linear-gradient(135deg, #F59E0B, #D97706);
                color: white;
            }

            .module-badge.active {
                background: rgba(16, 185, 129, 0.1);
                color: #10B981;
            }

            .module-badge.coming {
                background: rgba(99, 102, 241, 0.1);
                color: #6366F1;
            }

            .module-card-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 8px;
                color: var(--color-text-primary);
            }

            .module-card-desc {
                font-size: 14px;
                color: var(--color-text-muted);
                line-height: 1.5;
            }

            .module-card-footer {
                padding: 16px 24px;
                background: var(--color-bg-secondary);
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-top: 1px solid var(--color-border);
            }

            .module-price {
                display: flex;
                align-items: baseline;
                gap: 4px;
            }

            .module-price-value {
                font-size: 24px;
                font-weight: 700;
                color: var(--color-text-primary);
            }

            .module-price-period {
                font-size: 13px;
                color: var(--color-text-muted);
            }

            .module-action {
                padding: 10px 20px;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 500;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
            }

            .module-action.active {
                background: rgba(16, 185, 129, 0.1);
                color: #10B981;
            }

            .module-action.available {
                background: var(--color-primary);
                color: white;
            }

            .module-action.available:hover {
                opacity: 0.9;
            }

            .module-action.coming {
                background: var(--color-bg-primary);
                color: var(--color-text-muted);
                border: 1px solid var(--color-border);
            }

            /* Bottom CTA */
            .store-cta {
                background: linear-gradient(135deg, #8B6914 0%, #5C3D0D 100%);
                padding: 48px 24px;
                text-align: center;
                margin: 0 24px 24px;
                border-radius: 24px;
                position: relative;
                overflow: hidden;
            }

            .store-cta::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5' opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3Ccircle cx='30' cy='30' r='10'/%3E%3C/g%3E%3C/svg%3E");
                pointer-events: none;
            }

            .store-cta h2 {
                color: white;
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 12px;
                position: relative;
            }

            .store-cta p {
                color: rgba(255,255,255,0.8);
                font-size: 16px;
                margin-bottom: 24px;
                position: relative;
            }

            .store-cta-btn {
                background: white;
                color: #8B6914;
                padding: 14px 32px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
            }

            .store-cta-btn:hover {
                transform: scale(1.02);
            }

            /* Detail Bottom Sheet Styles */
            .module-detail-header {
                text-align: center;
                padding-bottom: 24px;
                border-bottom: 1px solid var(--color-border);
                margin-bottom: 24px;
            }

            .module-detail-icon {
                width: 80px;
                height: 80px;
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                margin: 0 auto 16px;
            }

            .module-detail-title {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .module-detail-desc {
                color: var(--color-text-muted);
                font-size: 15px;
                line-height: 1.6;
            }

            .module-features {
                margin-bottom: 24px;
            }

            .module-features-title {
                font-size: 14px;
                font-weight: 600;
                color: var(--color-text-muted);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 16px;
            }

            .module-feature-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 0;
                border-bottom: 1px solid var(--color-border);
            }

            .module-feature-item:last-child {
                border-bottom: none;
            }

            .module-feature-check {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: rgba(16, 185, 129, 0.1);
                color: #10B981;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .module-pricing-card {
                background: var(--color-bg-secondary);
                border-radius: 16px;
                padding: 24px;
                text-align: center;
            }

            .module-pricing-value {
                font-size: 36px;
                font-weight: 700;
            }

            .module-pricing-period {
                color: var(--color-text-muted);
                font-size: 14px;
            }
        </style>

        <div class="store-container">
            <!-- Hero -->
            <div class="store-hero">
                <div class="store-hero-content">
                    <div class="store-hero-badge">
                        ${icons.star} Nouveau
                    </div>
                    <h1>Le <span>Store</span> de votre Association</h1>
                    <p>Découvrez tous les modules pour digitaliser et simplifier la gestion de votre mosquée ou association.</p>
                    <div class="store-hero-stats">
                        <div class="store-stat">
                            <div class="store-stat-value">9</div>
                            <div class="store-stat-label">Modules</div>
                        </div>
                        <div class="store-stat">
                            <div class="store-stat-value">500+</div>
                            <div class="store-stat-label">Associations</div>
                        </div>
                        <div class="store-stat">
                            <div class="store-stat-value">98%</div>
                            <div class="store-stat-label">Satisfaction</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Categories -->
            <div class="store-categories">
                <button class="store-category active" data-filter="all">Tous</button>
                <button class="store-category" data-filter="active">Actifs</button>
                <button class="store-category" data-filter="available">Disponibles</button>
                <button class="store-category" data-filter="coming">Bientôt</button>
            </div>

            <!-- Content -->
            <div class="store-content">
                <h2 class="store-section-title">
                    Modules disponibles
                    <span class="count">${modules.length}</span>
                </h2>

                <div class="modules-grid" id="modules-grid">
                    ${modules.map(m => renderModuleCard(m)).join('')}
                </div>

                <!-- CTA -->
                <div class="store-cta">
                    <h2>Besoin d'un module personnalisé ?</h2>
                    <p>Contactez-nous pour discuter de vos besoins spécifiques</p>
                    <button class="store-cta-btn">Nous contacter</button>
                </div>
            </div>
        </div>
    `;

    // Category filter
    document.querySelectorAll('.store-category').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.store-category').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            const cards = document.querySelectorAll('.module-card');

            cards.forEach(card => {
                if (filter === 'all' || card.dataset.status === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Module click
    document.querySelectorAll('.module-card').forEach(card => {
        card.addEventListener('click', () => {
            const moduleId = card.dataset.id;
            const module = modules.find(m => m.id === moduleId);
            if (module) {
                openModuleDetail(module);
            }
        });
    });
}

function renderModuleCard(module) {
    const statusLabels = {
        active: 'Actif',
        available: 'Disponible',
        coming: 'Bientôt'
    };

    const actionLabels = {
        active: 'Activé',
        available: 'Souscrire',
        coming: 'Bientôt'
    };

    return `
        <div class="module-card" data-id="${module.id}" data-status="${module.status}">
            <div class="module-card-header">
                <div class="module-card-visual" style="background: ${module.gradient}">
                    ${icons[module.icon]}
                </div>
                ${module.popular ? '<span class="module-badge popular">${icons.star} Populaire</span>' : ''}
                ${module.status === 'active' ? '<span class="module-badge active">Actif</span>' : ''}
                ${module.status === 'coming' ? '<span class="module-badge coming">Bientôt</span>' : ''}
                <h3 class="module-card-title">${module.name}</h3>
                <p class="module-card-desc">${module.description}</p>
            </div>
            <div class="module-card-footer">
                <div class="module-price">
                    <span class="module-price-value">${module.price}</span>
                    <span class="module-price-period">${module.priceDetail}</span>
                </div>
                <button class="module-action ${module.status}">${actionLabels[module.status]}</button>
            </div>
        </div>
    `;
}

function openModuleDetail(module) {
    openBottomSheet({
        title: module.name,
        size: 'large',
        content: `
            <div class="module-detail-header">
                <div class="module-detail-icon" style="background: ${module.gradient}">
                    ${icons[module.icon]}
                </div>
                <h2 class="module-detail-title">${module.name}</h2>
                <p class="module-detail-desc">${module.longDescription}</p>
            </div>

            <div class="module-features">
                <h4 class="module-features-title">Fonctionnalités incluses</h4>
                ${module.features.map(f => `
                    <div class="module-feature-item">
                        <div class="module-feature-check">${icons.check}</div>
                        <span>${f}</span>
                    </div>
                `).join('')}
            </div>

            <div class="module-pricing-card">
                <div class="module-pricing-value">${module.price}</div>
                <div class="module-pricing-period">${module.priceDetail}</div>
            </div>
        `,
        footer: `
            ${module.status === 'active' ? `
                <button class="btn btn-secondary" style="flex: 1;">Déjà actif</button>
            ` : module.status === 'available' ? `
                <button class="btn btn-primary" style="flex: 1;" id="subscribe-btn">Souscrire maintenant</button>
            ` : `
                <button class="btn btn-secondary" style="flex: 1;" id="notify-btn">Me notifier à la sortie</button>
            `}
        `
    });

    const subscribeBtn = document.getElementById('subscribe-btn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => {
            toastSuccess('Fonctionnalité bientôt disponible');
        });
    }

    const notifyBtn = document.getElementById('notify-btn');
    if (notifyBtn) {
        notifyBtn.addEventListener('click', () => {
            toastSuccess('Vous serez notifié à la sortie !');
            closeBottomSheet();
        });
    }
}
