import apiService from '../../services/api.service.js';
import router from '../../router/router.js';
import { toastError, toastSuccess } from '../../components/toast/toast.js';
import i18n from '../../services/i18n.service.js';

export async function renderOnboardingPage() {
    const pageContent = document.getElementById('page-content');

    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
    document.getElementById('mobile-nav').style.display = 'none';

    pageContent.innerHTML = `
        <style>
            .onboarding-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--spacing-md);
                background-color: var(--color-bg-secondary);
                background-image: var(--pattern-islamic-star);
            }

            .onboarding-card {
                width: 100%;
                max-width: 560px;
                background-color: var(--color-card-bg);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-xl);
                overflow: hidden;
                border: 1px solid var(--color-border);
            }

            .onboarding-header {
                padding: var(--spacing-xl);
                text-align: center;
                background: linear-gradient(135deg, #8B6914, #5C3D0D, #8B6914);
                color: white;
                position: relative;
                overflow: hidden;
            }

            .onboarding-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.8' opacity='0.15'%3E%3Cpath d='M40 0L45 15L60 15L48 24L53 40L40 30L27 40L32 24L20 15L35 15Z'/%3E%3Cpath d='M40 80L45 65L60 65L48 56L53 40L40 50L27 40L32 56L20 65L35 65Z'/%3E%3Cpath d='M0 40L15 45L15 60L24 48L40 53L30 40L40 27L24 32L15 20L15 35Z'/%3E%3Cpath d='M80 40L65 45L65 60L56 48L40 53L50 40L40 27L56 32L65 20L65 35Z'/%3E%3Ccircle cx='40' cy='40' r='8'/%3E%3Ccircle cx='40' cy='40' r='15'/%3E%3Ccircle cx='40' cy='40' r='22'/%3E%3C/g%3E%3C/svg%3E");
            }

            .onboarding-header > * {
                position: relative;
                z-index: 1;
            }

            .onboarding-logo {
                width: 80px;
                height: 80px;
                margin: 0 auto var(--spacing-md);
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: var(--radius-full);
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
            }

            .onboarding-title {
                font-size: var(--font-2xl);
                font-weight: var(--font-bold);
                margin-bottom: var(--spacing-xs);
                font-family: var(--font-arabic-decorative);
            }

            .onboarding-subtitle {
                opacity: 0.9;
                font-size: var(--font-base);
            }

            .onboarding-body {
                padding: var(--spacing-xl);
            }

            .onboarding-form {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-lg);
            }

            .onboarding-section {
                padding-bottom: var(--spacing-lg);
                border-bottom: 1px solid var(--color-border);
            }

            .onboarding-section:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }

            .section-title {
                font-size: var(--font-lg);
                font-weight: var(--font-semibold);
                margin-bottom: var(--spacing-md);
                color: var(--color-primary);
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--spacing-md);
            }

            @media (max-width: 480px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
            }

            .onboarding-footer {
                padding: var(--spacing-lg);
                text-align: center;
                border-top: 1px solid var(--color-border);
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }

            .onboarding-footer a {
                color: var(--color-primary);
                font-weight: var(--font-medium);
            }

            .onboarding-error {
                padding: var(--spacing-md);
                background-color: var(--color-error-light);
                color: var(--color-error);
                border-radius: var(--radius-md);
                font-size: var(--font-sm);
                display: none;
            }

            .onboarding-error.visible {
                display: block;
            }

            .bismillah {
                font-family: var(--font-arabic-decorative);
                font-size: var(--font-lg);
                margin-bottom: var(--spacing-md);
                opacity: 0.9;
            }

            .steps-indicator {
                display: flex;
                justify-content: center;
                gap: var(--spacing-sm);
                margin-bottom: var(--spacing-md);
            }

            .step {
                width: 32px;
                height: 32px;
                border-radius: var(--radius-full);
                background-color: rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: var(--font-semibold);
                font-size: var(--font-sm);
            }

            .step.active {
                background-color: white;
                color: #8B6914;
            }
        </style>

        <div class="onboarding-container">
            <div class="onboarding-card">
                <div class="onboarding-header">
                    <div class="onboarding-logo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" opacity="0.3"/>
                            <circle cx="12" cy="12" r="6"/>
                            <circle cx="12" cy="12" r="2" fill="currentColor"/>
                        </svg>
                    </div>
                    <p class="bismillah">${i18n.t('login.bismillah')}</p>
                    <h1 class="onboarding-title">${i18n.t('onboarding.title')}</h1>
                    <p class="onboarding-subtitle">${i18n.t('onboarding.subtitle')}</p>
                </div>

                <div class="onboarding-body">
                    <div class="onboarding-error" id="onboarding-error"></div>

                    <form class="onboarding-form" id="onboarding-form">
                        <div class="onboarding-section">
                            <h3 class="section-title">${i18n.t('onboarding.associationInfo')}</h3>

                            <div class="form-group">
                                <label class="form-label" for="association_name">${i18n.t('onboarding.associationName')} *</label>
                                <input type="text" class="form-input" id="association_name" name="association_name" required placeholder="${i18n.t('onboarding.associationNamePlaceholder')}">
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label" for="association_email">${i18n.t('onboarding.associationEmail')}</label>
                                    <input type="email" class="form-input" id="association_email" name="email" placeholder="contact@association.fr">
                                </div>

                                <div class="form-group">
                                    <label class="form-label" for="phone">${i18n.t('onboarding.phone')}</label>
                                    <input type="tel" class="form-input" id="phone" name="phone" placeholder="01 23 45 67 89">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="city">${i18n.t('onboarding.city')}</label>
                                <input type="text" class="form-input" id="city" name="city" placeholder="Paris">
                            </div>
                        </div>

                        <div class="onboarding-section">
                            <h3 class="section-title">${i18n.t('onboarding.adminAccount')}</h3>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label" for="owner_first_name">${i18n.t('onboarding.firstName')} *</label>
                                    <input type="text" class="form-input" id="owner_first_name" name="owner_first_name" required placeholder="${i18n.t('onboarding.firstNamePlaceholder')}">
                                </div>

                                <div class="form-group">
                                    <label class="form-label" for="owner_last_name">${i18n.t('onboarding.lastName')} *</label>
                                    <input type="text" class="form-input" id="owner_last_name" name="owner_last_name" required placeholder="${i18n.t('onboarding.lastNamePlaceholder')}">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="owner_email">${i18n.t('onboarding.email')} *</label>
                                <input type="email" class="form-input" id="owner_email" name="owner_email" required placeholder="admin@association.fr" autocomplete="email">
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="owner_password">${i18n.t('onboarding.password')} *</label>
                                <input type="password" class="form-input" id="owner_password" name="owner_password" required placeholder="••••••••" minlength="6" autocomplete="new-password">
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary btn-lg w-full" id="onboarding-btn">
                            ${i18n.t('onboarding.createAssociation')}
                        </button>
                    </form>
                </div>

                <div class="onboarding-footer">
                    ${i18n.t('onboarding.alreadyHaveAccount')} <a href="/login" data-link>${i18n.t('onboarding.login')}</a>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById('onboarding-form');
    const errorDiv = document.getElementById('onboarding-error');
    const submitBtn = document.getElementById('onboarding-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            association_name: formData.get('association_name'),
            email: formData.get('email') || null,
            phone: formData.get('phone') || null,
            city: formData.get('city') || null,
            owner_first_name: formData.get('owner_first_name'),
            owner_last_name: formData.get('owner_last_name'),
            owner_email: formData.get('owner_email'),
            owner_password: formData.get('owner_password')
        };

        errorDiv.classList.remove('visible');
        submitBtn.disabled = true;
        submitBtn.textContent = i18n.t('onboarding.creating');

        try {
            const response = await apiService.createAssociation(data);

            if (response.success) {
                toastSuccess(i18n.t('onboarding.success'));
                // Rediriger vers les paramètres pour compléter les infos de l'association
                router.navigate('/settings');
            } else {
                throw new Error(response.message || i18n.t('onboarding.error'));
            }
        } catch (error) {
            errorDiv.textContent = error.message || i18n.t('onboarding.error');
            errorDiv.classList.add('visible');
            toastError(error.message || i18n.t('onboarding.error'));
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = i18n.t('onboarding.createAssociation');
        }
    });
}
