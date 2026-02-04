import router from '../../router/router.js';
import { toastError, toastSuccess } from '../../components/toast/toast.js';

export async function renderLoginAdherentPage() {
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
                padding: 20px;
                background: linear-gradient(135deg, #F5F0E6 0%, #EDE5D8 100%);
            }

            [data-theme="dark"] .login-container {
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            }

            .login-card {
                width: 100%;
                max-width: 400px;
                background: white;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }

            [data-theme="dark"] .login-card {
                background: #252525;
            }

            .login-header {
                background: linear-gradient(135deg, #8B6914, #5C3D0D);
                padding: 32px 24px;
                text-align: center;
                color: white;
            }

            .login-logo {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .login-subtitle {
                opacity: 0.9;
                font-size: 14px;
            }

            .login-body {
                padding: 32px 24px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-label {
                display: block;
                font-size: 13px;
                font-weight: 500;
                color: #666;
                margin-bottom: 8px;
            }

            [data-theme="dark"] .form-label {
                color: #999;
            }

            .form-input {
                width: 100%;
                padding: 14px 16px;
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                font-size: 16px;
                background: #FAFAFA;
                transition: all 0.2s;
            }

            [data-theme="dark"] .form-input {
                background: #1a1a1a;
                border-color: #333;
                color: white;
            }

            .form-input:focus {
                outline: none;
                border-color: #8B6914;
                background: white;
            }

            [data-theme="dark"] .form-input:focus {
                background: #2a2a2a;
                border-color: #C9A227;
            }

            .btn-login {
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, #8B6914, #5C3D0D);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s;
            }

            .btn-login:hover {
                opacity: 0.9;
            }

            .btn-login:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .login-footer {
                text-align: center;
                padding: 20px 24px;
                border-top: 1px solid #f0f0f0;
                font-size: 14px;
                color: #666;
            }

            [data-theme="dark"] .login-footer {
                border-color: #333;
                color: #999;
            }

            .login-footer a {
                color: #8B6914;
                font-weight: 500;
            }

            .error-message {
                background: #fef2f2;
                color: #dc2626;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                margin-bottom: 20px;
                display: none;
            }

            [data-theme="dark"] .error-message {
                background: rgba(220, 38, 38, 0.1);
            }

            .error-message.visible {
                display: block;
            }

            .theme-toggle {
                position: fixed;
                top: 16px;
                right: 16px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: white;
                border: 1px solid #e0e0e0;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            [data-theme="dark"] .theme-toggle {
                background: #333;
                border-color: #444;
                color: white;
            }
        </style>

        <div class="login-container">
            <button class="theme-toggle" id="theme-toggle">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
            </button>

            <div class="login-card">
                <div class="login-header">
                    <div class="login-logo">jama3</div>
                    <div class="login-subtitle">Espace Adhérent</div>
                </div>

                <div class="login-body">
                    <div class="error-message" id="error-msg"></div>

                    <form id="login-form">
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" id="email" name="email" required placeholder="votre@email.com" autocomplete="email">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Mot de passe</label>
                            <input type="password" class="form-input" id="password" name="password" required placeholder="••••••••" autocomplete="current-password">
                        </div>

                        <button type="submit" class="btn-login" id="login-btn">Se connecter</button>
                    </form>
                </div>

                <div class="login-footer">
                    Vous êtes administrateur ? <a href="/login" data-link>Connexion admin</a>
                </div>
            </div>
        </div>
    `;

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // Form submit
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('error-msg');
        const loginBtn = document.getElementById('login-btn');

        errorMsg.classList.remove('visible');
        loginBtn.disabled = true;
        loginBtn.textContent = 'Connexion...';

        try {
            const response = await fetch('/api/adherent-auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                // Stocker le token adhérent
                localStorage.setItem('adherent_token', result.data.token);
                localStorage.setItem('adherent_data', JSON.stringify(result.data.adherent));
                localStorage.setItem('adherent_association', JSON.stringify(result.data.association));

                toastSuccess('Connexion réussie');
                router.navigate('/membre');
            } else {
                errorMsg.textContent = result.message || 'Email ou mot de passe incorrect';
                errorMsg.classList.add('visible');
            }
        } catch (error) {
            errorMsg.textContent = 'Erreur de connexion';
            errorMsg.classList.add('visible');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Se connecter';
        }
    });
}
