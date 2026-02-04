import router from '../../router/router.js';
import { toastError, toastSuccess } from '../../components/toast/toast.js';

export async function renderSetupPasswordPage(token) {
    const pageContent = document.getElementById('page-content');

    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
    document.getElementById('mobile-nav').style.display = 'none';

    // Vérifier le token d'abord
    let tokenData = null;
    try {
        const response = await fetch(`/api/adherent-auth/verify-token/${token}`);
        const result = await response.json();

        if (!result.success) {
            pageContent.innerHTML = `
                <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 20px; text-align: center; background: linear-gradient(135deg, #F5F0E6 0%, #EDE5D8 100%);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.5" style="margin-bottom: 16px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h2 style="margin-bottom: 8px; color: #1a1a1a;">Lien invalide ou expiré</h2>
                    <p style="color: #666; margin-bottom: 20px;">Ce lien n'est plus valide.</p>
                    <a href="/login-adherent" data-link style="color: #8B6914; font-weight: 500;">Retour à la connexion</a>
                </div>
            `;
            return;
        }

        tokenData = result.data;
    } catch (error) {
        console.error('Error verifying token:', error);
        toastError('Erreur de vérification');
        return;
    }

    pageContent.innerHTML = `
        <style>
            .setup-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: linear-gradient(135deg, #F5F0E6 0%, #EDE5D8 100%);
            }

            [data-theme="dark"] .setup-container {
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            }

            .setup-card {
                width: 100%;
                max-width: 400px;
                background: white;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }

            [data-theme="dark"] .setup-card {
                background: #252525;
            }

            .setup-header {
                background: linear-gradient(135deg, #8B6914, #5C3D0D);
                padding: 32px 24px;
                text-align: center;
                color: white;
            }

            .setup-logo {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .setup-subtitle {
                opacity: 0.9;
                font-size: 14px;
            }

            .setup-body {
                padding: 32px 24px;
            }

            .welcome-text {
                text-align: center;
                margin-bottom: 24px;
            }

            .welcome-text h2 {
                font-size: 20px;
                color: #1a1a1a;
                margin-bottom: 8px;
            }

            [data-theme="dark"] .welcome-text h2 {
                color: white;
            }

            .welcome-text p {
                color: #666;
                font-size: 14px;
            }

            [data-theme="dark"] .welcome-text p {
                color: #999;
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

            .btn-setup {
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

            .btn-setup:hover {
                opacity: 0.9;
            }

            .btn-setup:disabled {
                opacity: 0.6;
                cursor: not-allowed;
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

            .error-message.visible {
                display: block;
            }

            .password-strength {
                margin-top: 8px;
                font-size: 12px;
                color: #666;
            }
        </style>

        <div class="setup-container">
            <div class="setup-card">
                <div class="setup-header">
                    <div class="setup-logo">jama3</div>
                    <div class="setup-subtitle">${tokenData.association}</div>
                </div>

                <div class="setup-body">
                    <div class="welcome-text">
                        <h2>Bienvenue ${tokenData.adherent.first_name} !</h2>
                        <p>Créez votre mot de passe pour accéder à votre espace adhérent.</p>
                    </div>

                    <div class="error-message" id="error-msg"></div>

                    <form id="setup-form">
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" value="${tokenData.adherent.email}" disabled>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Nouveau mot de passe</label>
                            <input type="password" class="form-input" id="password" name="password" required placeholder="Minimum 6 caractères" minlength="6" autocomplete="new-password">
                            <div class="password-strength" id="password-strength"></div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Confirmer le mot de passe</label>
                            <input type="password" class="form-input" id="password-confirm" name="password-confirm" required placeholder="Répétez le mot de passe" autocomplete="new-password">
                        </div>

                        <button type="submit" class="btn-setup" id="setup-btn">Créer mon compte</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Password strength indicator
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('password-strength');

    passwordInput.addEventListener('input', () => {
        const value = passwordInput.value;
        if (value.length === 0) {
            strengthIndicator.textContent = '';
        } else if (value.length < 6) {
            strengthIndicator.textContent = 'Trop court';
            strengthIndicator.style.color = '#dc2626';
        } else if (value.length < 8) {
            strengthIndicator.textContent = 'Acceptable';
            strengthIndicator.style.color = '#f59e0b';
        } else {
            strengthIndicator.textContent = 'Bon mot de passe';
            strengthIndicator.style.color = '#22c55e';
        }
    });

    // Form submit
    document.getElementById('setup-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        const errorMsg = document.getElementById('error-msg');
        const setupBtn = document.getElementById('setup-btn');

        errorMsg.classList.remove('visible');

        if (password !== passwordConfirm) {
            errorMsg.textContent = 'Les mots de passe ne correspondent pas';
            errorMsg.classList.add('visible');
            return;
        }

        if (password.length < 6) {
            errorMsg.textContent = 'Le mot de passe doit contenir au moins 6 caractères';
            errorMsg.classList.add('visible');
            return;
        }

        setupBtn.disabled = true;
        setupBtn.textContent = 'Création...';

        try {
            const response = await fetch('/api/adherent-auth/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const result = await response.json();

            if (result.success) {
                toastSuccess('Compte créé ! Vous pouvez vous connecter.');
                router.navigate('/login-adherent');
            } else {
                errorMsg.textContent = result.message || 'Erreur lors de la création';
                errorMsg.classList.add('visible');
            }
        } catch (error) {
            errorMsg.textContent = 'Erreur de connexion';
            errorMsg.classList.add('visible');
        } finally {
            setupBtn.disabled = false;
            setupBtn.textContent = 'Créer mon compte';
        }
    });
}
