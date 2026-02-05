import { toastError, toastSuccess } from '../../components/toast/toast.js';
import router from '../../router/router.js';
import { madrassaLogo } from '../madrassa/landing.js';

export async function renderLoginParentPage() {
    // Hide navigation elements
    const sidebar = document.getElementById('sidebar');
    const navbar = document.getElementById('navbar');
    const mobileNav = document.getElementById('mobile-nav');
    if (sidebar) sidebar.style.display = 'none';
    if (navbar) navbar.style.display = 'none';
    if (mobileNav) mobileNav.style.display = 'none';

    const pageContent = document.getElementById('page-content');

    pageContent.innerHTML = `
        <style>
            #page-content{padding:0 !important;}
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

            .parent-login {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                background: var(--color-bg-primary);
                font-family: var(--font-primary);
                position: relative;
            }

            .parent-login::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(ellipse at top, var(--color-primary-light) 0%, transparent 50%);
                opacity: 0.5;
                pointer-events: none;
            }

            .parent-login * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            .parent-login-header {
                background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
                padding: var(--spacing-xl);
                padding-top: calc(env(safe-area-inset-top) + var(--spacing-xl));
                text-align: center;
                color: white;
                position: relative;
                z-index: 1;
            }

            .parent-login-logo {
                width: 72px;
                height: 72px;
                background: rgba(255,255,255,0.2);
                border-radius: var(--radius-full);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto var(--spacing-md);
                backdrop-filter: blur(4px);
            }

            .parent-login-logo svg {
                width: 40px;
                height: 40px;
            }

            .parent-login-header h1 {
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: var(--spacing-xs);
            }

            .parent-login-header p {
                font-size: 0.875rem;
                opacity: 0.9;
            }

            .parent-login-arabic {
                font-family: var(--font-arabic);
                font-size: 1.125rem;
                opacity: 0.8;
                margin-top: var(--spacing-sm);
            }

            .parent-login-body {
                flex: 1;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding: var(--spacing-xl) var(--spacing-md);
                position: relative;
                z-index: 1;
            }

            .parent-login-card {
                background: var(--color-card-bg);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-xl);
                border: 1px solid var(--color-border);
                width: 100%;
                max-width: 400px;
                padding: var(--spacing-xl);
                margin-top: -40px;
            }

            .parent-login-title {
                text-align: center;
                margin-bottom: var(--spacing-xl);
            }

            .parent-login-title h2 {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--color-text-primary);
                margin-bottom: var(--spacing-xs);
            }

            .parent-login-title p {
                font-size: 0.875rem;
                color: var(--color-text-muted);
            }

            .parent-login-form {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-xs);
            }

            .form-label {
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--color-text-secondary);
            }

            .form-input {
                width: 100%;
                padding: var(--spacing-md);
                border: 2px solid var(--color-border);
                border-radius: var(--radius-md);
                font-size: 1rem;
                background: var(--color-bg-primary);
                color: var(--color-text-primary);
                transition: all 0.2s;
                font-family: var(--font-primary);
            }

            .form-input:focus {
                outline: none;
                border-color: var(--color-primary);
                box-shadow: 0 0 0 4px var(--color-primary-light);
            }

            .form-input::placeholder {
                color: var(--color-text-muted);
            }

            .parent-login-btn {
                width: 100%;
                padding: var(--spacing-md);
                background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
                color: white;
                border: none;
                border-radius: var(--radius-full);
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: var(--spacing-sm);
                font-family: var(--font-primary);
            }

            .parent-login-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }

            .parent-login-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }

            .parent-login-error {
                background: var(--color-error-light);
                color: var(--color-error);
                padding: var(--spacing-md);
                border-radius: var(--radius-md);
                font-size: 0.875rem;
                display: none;
            }

            .parent-login-error.visible {
                display: block;
            }

            .parent-login-help {
                text-align: center;
                margin-top: var(--spacing-lg);
                padding-top: var(--spacing-lg);
                border-top: 1px solid var(--color-border);
            }

            .parent-login-help p {
                font-size: 0.875rem;
                color: var(--color-text-muted);
                line-height: 1.6;
            }

            .parent-login-help a {
                color: var(--color-primary);
                text-decoration: none;
                font-weight: 500;
            }

            .parent-login-help a:hover {
                text-decoration: underline;
            }

            .parent-login-footer {
                text-align: center;
                padding: var(--spacing-lg);
                color: var(--color-text-muted);
                font-size: 0.75rem;
                position: relative;
                z-index: 1;
            }

            .parent-login-back {
                display: inline-flex;
                align-items: center;
                gap: var(--spacing-xs);
                color: rgba(255, 255, 255, 0.8);
                text-decoration: none;
                font-size: 0.875rem;
                position: absolute;
                top: var(--spacing-md);
                left: var(--spacing-md);
                padding-top: env(safe-area-inset-top);
            }

            .parent-login-back:hover {
                color: white;
            }

            .parent-login-back svg {
                width: 18px;
                height: 18px;
            }
        </style>

        <div class="parent-login">
            <div class="parent-login-header">
                <a href="/madrassa" class="parent-login-back">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Retour
                </a>

                <div class="parent-login-logo">
                    ${madrassaLogo}
                </div>
                <h1>Espace Parents</h1>
                <p>Suivez la progression de vos enfants</p>
                <p class="parent-login-arabic">مساحة الأولياء</p>
            </div>

            <div class="parent-login-body">
                <div class="parent-login-card">
                    <div class="parent-login-title">
                        <h2>Connexion</h2>
                        <p>Entrez vos identifiants pour acceder au suivi</p>
                    </div>

                    <form class="parent-login-form" id="parent-login-form">
                        <div class="parent-login-error" id="login-error"></div>

                        <div class="form-group">
                            <label class="form-label">Email ou Telephone</label>
                            <input type="text" class="form-input" id="login-identifier"
                                   placeholder="email@exemple.com ou 0612345678" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Mot de passe</label>
                            <input type="password" class="form-input" id="login-password"
                                   placeholder="Votre mot de passe" required>
                        </div>

                        <button type="submit" class="parent-login-btn" id="login-btn">
                            Se connecter
                        </button>
                    </form>

                    <div class="parent-login-help">
                        <p>Vous n'avez pas encore de compte ?<br>
                        Contactez l'ecole pour obtenir vos identifiants.</p>
                    </div>
                </div>
            </div>

            <div class="parent-login-footer">
                Madrassa - Espace Parents
            </div>
        </div>
    `;

    // Form submission
    document.getElementById('parent-login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const identifier = document.getElementById('login-identifier').value.trim();
        const password = document.getElementById('login-password').value;
        const loginBtn = document.getElementById('login-btn');
        const errorDiv = document.getElementById('login-error');

        errorDiv.classList.remove('visible');
        loginBtn.disabled = true;
        loginBtn.textContent = 'Connexion...';

        try {
            const response = await fetch('/api/school/parent-auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });

            const result = await response.json();

            if (result.success) {
                // Save token
                localStorage.setItem('parent_token', result.data.token);
                localStorage.setItem('parent_data', JSON.stringify(result.data.parent));

                toastSuccess('Connexion reussie');
                router.navigate('/parent');
            } else {
                throw new Error(result.message || 'Identifiants incorrects');
            }
        } catch (error) {
            errorDiv.textContent = error.message || 'Erreur de connexion';
            errorDiv.classList.add('visible');
            toastError(error.message || 'Erreur de connexion');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Se connecter';
        }
    });
}
