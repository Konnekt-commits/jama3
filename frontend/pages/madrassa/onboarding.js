import apiService from '../../services/api.service.js';
import router from '../../router/router.js';
import { toastError, toastSuccess } from '../../components/toast/toast.js';
import { madrassaLogo } from './landing.js';

export async function renderMadrassaOnboarding() {
    const pageContent = document.getElementById('page-content');

    // Hide navigation elements
    const sidebar = document.getElementById('sidebar');
    const navbar = document.getElementById('navbar');
    const mobileNav = document.getElementById('mobile-nav');
    if (sidebar) sidebar.style.display = 'none';
    if (navbar) navbar.style.display = 'none';
    if (mobileNav) mobileNav.style.display = 'none';

    pageContent.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');

            :root {
                /* Colors - Ocean/Teal Theme for Madrassa */
                --color-bg-primary: #F0F7F7;
                --color-bg-secondary: #E3EEEE;
                --color-bg-tertiary: #D4E4E4;
                --color-bg-dark: #1A2F2F;

                --color-primary: #0D7377;
                --color-primary-hover: #095B5E;
                --color-primary-light: #D4EDED;
                --color-primary-dark: #064547;

                --color-text-primary: #1A2F2F;
                --color-text-secondary: #3D5555;
                --color-text-muted: #6B8585;
                --color-text-inverse: #F0F7F7;

                --color-success: #2E8B57;
                --color-error: #C94B4B;
                --color-error-light: #F8E8E8;

                --color-border: #B8D4D4;
                --color-card-bg: #F7FBFB;

                --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                --font-arabic: 'Amiri', serif;

                --spacing-xs: 4px;
                --spacing-sm: 8px;
                --spacing-md: 16px;
                --spacing-lg: 24px;
                --spacing-xl: 32px;

                --radius-sm: 4px;
                --radius-md: 8px;
                --radius-lg: 12px;
                --radius-xl: 16px;
                --radius-full: 9999px;

                --shadow-sm: 0 1px 2px 0 rgba(26, 47, 47, 0.05);
                --shadow-md: 0 4px 6px -1px rgba(26, 47, 47, 0.1), 0 2px 4px -1px rgba(26, 47, 47, 0.06);
                --shadow-lg: 0 10px 15px -3px rgba(26, 47, 47, 0.1), 0 4px 6px -2px rgba(26, 47, 47, 0.05);
                --shadow-xl: 0 20px 25px -5px rgba(26, 47, 47, 0.1), 0 10px 10px -5px rgba(26, 47, 47, 0.04);
            }

            .madrassa-onboarding {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--spacing-md);
                background-color: var(--color-bg-primary);
                font-family: var(--font-primary);
                position: relative;
            }

            .madrassa-onboarding::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(ellipse at top right, var(--color-primary-light) 0%, transparent 50%);
                opacity: 0.5;
                pointer-events: none;
            }

            .madrassa-onboarding * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            .madrassa-onboarding-card {
                width: 100%;
                max-width: 560px;
                background-color: var(--color-card-bg);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-xl);
                overflow: hidden;
                border: 1px solid var(--color-border);
                position: relative;
                z-index: 1;
            }

            .madrassa-onboarding-header {
                padding: var(--spacing-xl);
                text-align: center;
                background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
                color: white;
                position: relative;
            }

            .madrassa-onboarding-header > * {
                position: relative;
                z-index: 1;
            }

            .madrassa-onboarding-logo {
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

            .madrassa-onboarding-logo svg {
                width: 44px;
                height: 44px;
            }

            .madrassa-onboarding-bismillah {
                font-family: var(--font-arabic);
                font-size: 1.25rem;
                margin-bottom: var(--spacing-sm);
                opacity: 0.9;
            }

            .madrassa-onboarding-title {
                font-size: 1.75rem;
                font-weight: 700;
                margin-bottom: var(--spacing-xs);
            }

            .madrassa-onboarding-subtitle {
                opacity: 0.9;
                font-size: 1rem;
            }

            /* Steps indicator */
            .madrassa-steps {
                display: flex;
                justify-content: center;
                gap: var(--spacing-lg);
                margin-top: var(--spacing-md);
            }

            .madrassa-step {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                font-size: 0.875rem;
                opacity: 0.6;
            }

            .madrassa-step.active {
                opacity: 1;
            }

            .madrassa-step.completed {
                opacity: 0.8;
            }

            .madrassa-step-number {
                width: 28px;
                height: 28px;
                border-radius: var(--radius-full);
                background: rgba(255, 255, 255, 0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
            }

            .madrassa-step.active .madrassa-step-number {
                background: white;
                color: var(--color-primary);
            }

            .madrassa-step.completed .madrassa-step-number {
                background: rgba(255, 255, 255, 0.9);
                color: var(--color-primary);
            }

            /* Body */
            .madrassa-onboarding-body {
                padding: var(--spacing-xl);
            }

            .madrassa-onboarding-form {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-lg);
            }

            .madrassa-section {
                padding-bottom: var(--spacing-lg);
                border-bottom: 1px solid var(--color-border);
            }

            .madrassa-section:last-of-type {
                border-bottom: none;
                padding-bottom: 0;
            }

            .madrassa-section-title {
                font-size: 1.125rem;
                font-weight: 600;
                margin-bottom: var(--spacing-md);
                color: var(--color-primary);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }

            .madrassa-section-title svg {
                width: 20px;
                height: 20px;
            }

            .madrassa-form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--spacing-md);
            }

            @media (max-width: 480px) {
                .madrassa-form-row {
                    grid-template-columns: 1fr;
                }
            }

            .form-group {
                margin-bottom: var(--spacing-md);
            }

            .form-label {
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                margin-bottom: var(--spacing-xs);
                color: var(--color-text-secondary);
            }

            .form-input {
                width: 100%;
                padding: var(--spacing-md);
                font-size: 1rem;
                border: 2px solid var(--color-border);
                border-radius: var(--radius-md);
                background: var(--color-bg-primary);
                color: var(--color-text-primary);
                transition: all 0.2s;
                font-family: var(--font-primary);
            }

            .form-input::placeholder {
                color: var(--color-text-muted);
            }

            .form-input:focus {
                outline: none;
                border-color: var(--color-primary);
                box-shadow: 0 0 0 4px var(--color-primary-light);
            }

            /* Submit button */
            .madrassa-submit-btn {
                width: 100%;
                padding: var(--spacing-md);
                background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
                color: white;
                border: none;
                border-radius: var(--radius-full);
                font-size: 1.125rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-sm);
                font-family: var(--font-primary);
            }

            .madrassa-submit-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }

            .madrassa-submit-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }

            .madrassa-submit-btn svg {
                width: 20px;
                height: 20px;
            }

            /* Error message */
            .madrassa-error {
                padding: var(--spacing-md);
                background-color: var(--color-error-light);
                color: var(--color-error);
                border-radius: var(--radius-md);
                font-size: 0.875rem;
                display: none;
            }

            .madrassa-error.visible {
                display: block;
            }

            /* Footer */
            .madrassa-onboarding-footer {
                padding: var(--spacing-lg);
                text-align: center;
                border-top: 1px solid var(--color-border);
                font-size: 0.875rem;
                color: var(--color-text-muted);
            }

            .madrassa-onboarding-footer a {
                color: var(--color-primary);
                font-weight: 500;
                text-decoration: none;
            }

            .madrassa-onboarding-footer a:hover {
                text-decoration: underline;
            }

            /* Subjects grid */
            .madrassa-subjects-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: var(--spacing-sm);
            }

            @media (max-width: 480px) {
                .madrassa-subjects-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            .madrassa-subject-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                padding: var(--spacing-sm) var(--spacing-md);
                border: 2px solid var(--color-border);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all 0.2s;
                font-size: 0.875rem;
                color: var(--color-text-secondary);
            }

            .madrassa-subject-item:hover {
                border-color: var(--color-primary);
            }

            .madrassa-subject-item.selected {
                background: var(--color-primary-light);
                border-color: var(--color-primary);
                color: var(--color-primary);
            }

            .madrassa-subject-item svg {
                width: 16px;
                height: 16px;
                opacity: 0.7;
            }

            .madrassa-subject-item.selected svg {
                opacity: 1;
            }

            /* Back link */
            .madrassa-back-link {
                position: absolute;
                top: var(--spacing-md);
                left: var(--spacing-md);
                color: white;
                opacity: 0.8;
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                text-decoration: none;
                font-size: 0.875rem;
                transition: opacity 0.2s;
            }

            .madrassa-back-link:hover {
                opacity: 1;
            }

            .madrassa-back-link svg {
                width: 18px;
                height: 18px;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>

        <div class="madrassa-onboarding">
            <div class="madrassa-onboarding-card">
                <div class="madrassa-onboarding-header">
                    <a href="/madrassa" class="madrassa-back-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Retour
                    </a>

                    <div class="madrassa-onboarding-logo">
                        ${madrassaLogo}
                    </div>
                    <p class="madrassa-onboarding-bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                    <h1 class="madrassa-onboarding-title">Creer votre ecole</h1>
                    <p class="madrassa-onboarding-subtitle">En quelques clics, commencez a gerer vos eleves</p>

                    <div class="madrassa-steps">
                        <div class="madrassa-step active" data-step="1">
                            <span class="madrassa-step-number">1</span>
                            <span>Ecole</span>
                        </div>
                        <div class="madrassa-step" data-step="2">
                            <span class="madrassa-step-number">2</span>
                            <span>Admin</span>
                        </div>
                        <div class="madrassa-step" data-step="3">
                            <span class="madrassa-step-number">3</span>
                            <span>Pret !</span>
                        </div>
                    </div>
                </div>

                <div class="madrassa-onboarding-body">
                    <div class="madrassa-error" id="madrassa-error"></div>

                    <form class="madrassa-onboarding-form" id="madrassa-form">
                        <!-- Step 1: School Info -->
                        <div class="madrassa-section">
                            <h3 class="madrassa-section-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                </svg>
                                Votre ecole
                            </h3>

                            <div class="form-group">
                                <label class="form-label" for="school_name">Nom de l'ecole *</label>
                                <input type="text" class="form-input" id="school_name" name="school_name" required
                                       placeholder="Ex: Ecole Al-Nour, Madrassa Ibn Badis...">
                            </div>

                            <div class="madrassa-form-row">
                                <div class="form-group">
                                    <label class="form-label" for="school_email">Email de contact</label>
                                    <input type="email" class="form-input" id="school_email" name="email"
                                           placeholder="contact@ecole.fr">
                                </div>

                                <div class="form-group">
                                    <label class="form-label" for="school_phone">Telephone</label>
                                    <input type="tel" class="form-input" id="school_phone" name="phone"
                                           placeholder="06 12 34 56 78">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="city">Ville</label>
                                <input type="text" class="form-input" id="city" name="city"
                                       placeholder="Paris, Lyon, Marseille...">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Matieres enseignees</label>
                                <div class="madrassa-subjects-grid">
                                    <div class="madrassa-subject-item selected" data-subject="coran">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                        </svg>
                                        Coran
                                    </div>
                                    <div class="madrassa-subject-item selected" data-subject="arabe">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="4 7 4 4 20 4 20 7"/>
                                            <line x1="9" y1="20" x2="15" y2="20"/>
                                            <line x1="12" y1="4" x2="12" y2="20"/>
                                        </svg>
                                        Arabe
                                    </div>
                                    <div class="madrassa-subject-item" data-subject="fiqh">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="2" y1="12" x2="22" y2="12"/>
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                        </svg>
                                        Fiqh
                                    </div>
                                    <div class="madrassa-subject-item" data-subject="sira">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            <polyline points="14 2 14 8 20 8"/>
                                            <line x1="16" y1="13" x2="8" y2="13"/>
                                            <line x1="16" y1="17" x2="8" y2="17"/>
                                        </svg>
                                        Sira
                                    </div>
                                    <div class="madrassa-subject-item" data-subject="doua">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                                            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                                            <line x1="6" y1="1" x2="6" y2="4"/>
                                            <line x1="10" y1="1" x2="10" y2="4"/>
                                            <line x1="14" y1="1" x2="14" y2="4"/>
                                        </svg>
                                        Doua
                                    </div>
                                    <div class="madrassa-subject-item" data-subject="autre">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="8" x2="12" y2="12"/>
                                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                        Autre
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Admin Account -->
                        <div class="madrassa-section">
                            <h3 class="madrassa-section-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                Votre compte administrateur
                            </h3>

                            <div class="madrassa-form-row">
                                <div class="form-group">
                                    <label class="form-label" for="owner_first_name">Prenom *</label>
                                    <input type="text" class="form-input" id="owner_first_name" name="owner_first_name"
                                           required placeholder="Votre prenom">
                                </div>

                                <div class="form-group">
                                    <label class="form-label" for="owner_last_name">Nom *</label>
                                    <input type="text" class="form-input" id="owner_last_name" name="owner_last_name"
                                           required placeholder="Votre nom">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="owner_email">Email *</label>
                                <input type="email" class="form-input" id="owner_email" name="owner_email"
                                       required placeholder="admin@ecole.fr" autocomplete="email">
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="owner_password">Mot de passe *</label>
                                <input type="password" class="form-input" id="owner_password" name="owner_password"
                                       required placeholder="Minimum 6 caracteres" minlength="6" autocomplete="new-password">
                            </div>
                        </div>

                        <button type="submit" class="madrassa-submit-btn" id="madrassa-submit-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                            Creer mon ecole
                        </button>
                    </form>
                </div>

                <div class="madrassa-onboarding-footer">
                    Vous avez deja un compte ? <a href="/app/login">Se connecter</a>
                </div>
            </div>
        </div>
    `;

    // Subject selection
    document.querySelectorAll('.madrassa-subject-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('selected');
        });
    });

    // Form submission
    const form = document.getElementById('madrassa-form');
    const errorDiv = document.getElementById('madrassa-error');
    const submitBtn = document.getElementById('madrassa-submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get selected subjects
        const selectedSubjects = Array.from(document.querySelectorAll('.madrassa-subject-item.selected'))
            .map(item => item.dataset.subject);

        const formData = new FormData(form);
        const data = {
            association_name: formData.get('school_name'),
            email: formData.get('email') || null,
            phone: formData.get('phone') || null,
            city: formData.get('city') || null,
            owner_first_name: formData.get('owner_first_name'),
            owner_last_name: formData.get('owner_last_name'),
            owner_email: formData.get('owner_email'),
            owner_password: formData.get('owner_password'),
            // Additional Madrassa-specific data
            type: 'madrassa',
            subjects: selectedSubjects
        };

        errorDiv.classList.remove('visible');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"/>
            </svg>
            Creation en cours...
        `;

        try {
            const response = await apiService.createAssociation(data);

            if (response.success) {
                // Update steps UI
                document.querySelectorAll('.madrassa-step').forEach(step => {
                    step.classList.remove('active');
                    step.classList.add('completed');
                });
                document.querySelector('.madrassa-step[data-step="3"]').classList.add('active');

                toastSuccess('Votre ecole a ete creee avec succes !');

                // Redirect to school dashboard
                setTimeout(() => {
                    window.location.href = '/app/school';
                }, 1500);
            } else {
                throw new Error(response.message || 'Erreur lors de la creation');
            }
        } catch (error) {
            errorDiv.textContent = error.message || 'Une erreur est survenue. Veuillez reessayer.';
            errorDiv.classList.add('visible');
            toastError(error.message || 'Erreur lors de la creation');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Creer mon ecole
            `;
        }
    });

    // Input focus effect for step indicator
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const section = input.closest('.madrassa-section');
            const sectionIndex = Array.from(document.querySelectorAll('.madrassa-section')).indexOf(section);

            document.querySelectorAll('.madrassa-step').forEach((step, index) => {
                step.classList.remove('active', 'completed');
                if (index < sectionIndex) {
                    step.classList.add('completed');
                } else if (index === sectionIndex) {
                    step.classList.add('active');
                }
            });
        });
    });
}
