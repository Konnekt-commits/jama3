import authService from '../../services/auth.service.js';
import router from '../../router/router.js';
import { toastError } from '../../components/toast/toast.js';
import i18n from '../../services/i18n.service.js';

export async function renderLoginPage() {
    const pageContent = document.getElementById('page-content');

    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
    document.getElementById('mobile-nav').style.display = 'none';

    pageContent.innerHTML = `
        <style>
            .login-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--spacing-md);
                background-color: var(--color-bg-secondary);
                background-image: var(--pattern-islamic-star);
            }

            .login-card {
                width: 100%;
                max-width: 420px;
                background-color: var(--color-card-bg);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-xl);
                overflow: hidden;
                border: 1px solid var(--color-border);
            }

            .login-header {
                padding: var(--spacing-xl);
                text-align: center;
                background: linear-gradient(135deg, #8B6914, #5C3D0D, #8B6914);
                color: white;
                position: relative;
                overflow: hidden;
            }

            .login-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.8' opacity='0.15'%3E%3Cpath d='M40 0L45 15L60 15L48 24L53 40L40 30L27 40L32 24L20 15L35 15Z'/%3E%3Cpath d='M40 80L45 65L60 65L48 56L53 40L40 50L27 40L32 56L20 65L35 65Z'/%3E%3Cpath d='M0 40L15 45L15 60L24 48L40 53L30 40L40 27L24 32L15 20L15 35Z'/%3E%3Cpath d='M80 40L65 45L65 60L56 48L40 53L50 40L40 27L56 32L65 20L65 35Z'/%3E%3Ccircle cx='40' cy='40' r='8'/%3E%3Ccircle cx='40' cy='40' r='15'/%3E%3Ccircle cx='40' cy='40' r='22'/%3E%3C/g%3E%3C/svg%3E");
            }

            .login-header::after {
                content: '';
                position: absolute;
                bottom: -20px;
                left: 50%;
                transform: translateX(-50%);
                width: 150px;
                height: 40px;
                background: var(--color-card-bg);
                border-radius: 100px 100px 0 0;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
            }

            .login-header > * {
                position: relative;
                z-index: 1;
            }

            .login-logo {
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

            .login-title {
                font-size: var(--font-3xl);
                font-weight: var(--font-bold);
                margin-bottom: var(--spacing-xs);
                font-family: var(--font-arabic-decorative);
            }

            .login-subtitle {
                opacity: 0.9;
                font-size: var(--font-base);
            }

            .login-body {
                padding: var(--spacing-xl);
            }

            .login-form {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
            }

            .login-footer {
                padding: var(--spacing-lg);
                text-align: center;
                border-top: 1px solid var(--color-border);
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }

            .login-footer a {
                color: var(--color-primary);
                font-weight: var(--font-medium);
            }

            .login-footer a:hover {
                text-decoration: underline;
            }

            .login-error {
                padding: var(--spacing-md);
                background-color: var(--color-error-light);
                color: var(--color-error);
                border-radius: var(--radius-md);
                font-size: var(--font-sm);
                display: none;
            }

            .login-error.visible {
                display: block;
            }

            .login-demo {
                margin-top: var(--spacing-md);
                padding: var(--spacing-md);
                background-color: var(--color-bg-secondary);
                border-radius: var(--radius-md);
                font-size: var(--font-sm);
                border: 1px solid var(--color-border);
            }

            .login-demo-title {
                font-weight: var(--font-medium);
                margin-bottom: var(--spacing-xs);
            }

            .login-demo code {
                background-color: var(--color-bg-tertiary);
                padding: 2px 6px;
                border-radius: var(--radius-sm);
                font-family: monospace;
            }

            .bismillah {
                font-family: var(--font-arabic-decorative);
                font-size: var(--font-lg);
                margin-bottom: var(--spacing-md);
                opacity: 0.9;
            }
        </style>

        <div class="login-container">
            <div class="login-card">
                <div class="login-header">
                    <div class="login-logo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 3c-1.5 2-3 3.5-3 6 0 1.5.5 2.5 1.5 3.5L12 14l1.5-1.5c1-1 1.5-2 1.5-3.5 0-2.5-1.5-4-3-6z"/>
                            <path d="M12 14v7"/>
                            <path d="M5 21h14"/>
                            <path d="M5 21v-4c0-1 .5-2 1.5-2.5"/>
                            <path d="M19 21v-4c0-1-.5-2-1.5-2.5"/>
                            <circle cx="12" cy="6" r="1"/>
                        </svg>
                    </div>
                    <p class="bismillah">${i18n.t('login.bismillah')}</p>
                    <h1 class="login-title">${i18n.t('login.title')}</h1>
                    <p class="login-subtitle">${i18n.t('login.subtitle')}</p>
                </div>

                <div class="login-body">
                    <div class="login-error" id="login-error"></div>

                    <form class="login-form" id="login-form">
                        <div class="form-group">
                            <label class="form-label" for="email">${i18n.t('login.email')}</label>
                            <input type="email" class="form-input" id="email" name="email" required placeholder="email@example.com" autocomplete="email">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="password">${i18n.t('login.password')}</label>
                            <input type="password" class="form-input" id="password" name="password" required placeholder="••••••••" autocomplete="current-password">
                        </div>

                        <button type="submit" class="btn btn-primary btn-lg w-full" id="login-btn">
                            ${i18n.t('login.submit')}
                        </button>
                    </form>

                    <div class="login-demo">
                        <p class="login-demo-title">${i18n.t('login.demo')}</p>
                        <p>Email: <code>admin@association.fr</code></p>
                        <p>Password: <code>admin123</code></p>
                    </div>
                </div>

                <div class="login-footer">
                    ${i18n.t('login.noAccount')} <a href="/onboarding" data-link>${i18n.t('login.register')}</a>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById('login-form');
    const errorDiv = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        errorDiv.classList.remove('visible');
        loginBtn.disabled = true;
        loginBtn.textContent = i18n.t('login.loading');

        try {
            const response = await authService.login(email, password);

            if (response.success) {
                // Rediriger superadmin vers sa page dédiée
                const user = authService.getUser();
                if (user && user.role === 'super_admin') {
                    router.navigate('/superadmin');
                } else {
                    router.navigate('/');
                }
            } else {
                throw new Error(response.message || 'خطأ في تسجيل الدخول');
            }
        } catch (error) {
            errorDiv.textContent = error.message || i18n.t('login.error');
            errorDiv.classList.add('visible');
            toastError(error.message || i18n.t('login.error'));
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = i18n.t('login.submit');
        }
    });
}

export function showLoginUI() {
    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
    document.getElementById('mobile-nav').style.display = 'none';
}

export function hideLoginUI() {
    document.getElementById('sidebar').style.display = '';
    document.getElementById('navbar').style.display = '';
    document.getElementById('mobile-nav').style.display = '';
}
