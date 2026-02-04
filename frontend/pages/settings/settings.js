import apiService from '../../services/api.service.js';
import appState from '../../store/appState.store.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';

export async function renderSettingsPage() {
    const pageContent = document.getElementById('page-content');

    pageContent.innerHTML = `
        <style>
            .settings-container {
                max-width: 800px;
                margin: 0 auto;
                padding: var(--spacing-lg);
            }

            .settings-header {
                margin-bottom: var(--spacing-xl);
            }

            .settings-title {
                font-size: var(--font-2xl);
                font-weight: var(--font-bold);
                color: var(--color-text);
                margin-bottom: var(--spacing-xs);
            }

            .settings-subtitle {
                color: var(--color-text-muted);
                font-size: var(--font-base);
            }

            .settings-card {
                background: var(--color-card-bg);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-xl);
                overflow: hidden;
                margin-bottom: var(--spacing-lg);
            }

            .settings-section {
                padding: var(--spacing-lg);
                border-bottom: 1px solid var(--color-border);
            }

            .settings-section:last-child {
                border-bottom: none;
            }

            .settings-section-title {
                font-size: var(--font-sm);
                font-weight: var(--font-semibold);
                color: var(--color-primary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: var(--spacing-md);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }

            .settings-section-title svg {
                width: 18px;
                height: 18px;
            }

            .settings-form-group {
                margin-bottom: var(--spacing-md);
            }

            .settings-form-group:last-child {
                margin-bottom: 0;
            }

            .settings-label {
                display: block;
                font-size: var(--font-sm);
                font-weight: var(--font-medium);
                color: var(--color-text-secondary);
                margin-bottom: var(--spacing-xs);
            }

            .settings-input, .settings-textarea, .settings-select {
                width: 100%;
                padding: var(--spacing-sm) var(--spacing-md);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                font-size: var(--font-base);
                background: var(--color-bg-secondary);
                color: var(--color-text);
                transition: all 0.2s;
            }

            .settings-input:focus, .settings-textarea:focus, .settings-select:focus {
                outline: none;
                border-color: var(--color-primary);
                box-shadow: 0 0 0 3px var(--color-primary-light);
            }

            .settings-textarea {
                min-height: 100px;
                resize: vertical;
            }

            .settings-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--spacing-md);
            }

            @media (max-width: 600px) {
                .settings-row {
                    grid-template-columns: 1fr;
                }
            }

            .settings-logo-preview {
                width: 80px;
                height: 80px;
                border-radius: var(--radius-lg);
                background: var(--color-bg-tertiary);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: var(--spacing-sm);
                overflow: hidden;
                border: 2px dashed var(--color-border);
            }

            .settings-logo-preview img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .settings-logo-preview svg {
                width: 32px;
                height: 32px;
                color: var(--color-text-muted);
            }

            .settings-actions {
                display: flex;
                justify-content: flex-end;
                gap: var(--spacing-md);
                padding: var(--spacing-lg);
                background: var(--color-bg-secondary);
                border-top: 1px solid var(--color-border);
            }

            .settings-btn {
                padding: var(--spacing-sm) var(--spacing-xl);
                border-radius: var(--radius-md);
                font-size: var(--font-base);
                font-weight: var(--font-medium);
                cursor: pointer;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: var(--spacing-sm);
            }

            .settings-btn-secondary {
                background: var(--color-bg-tertiary);
                border: 1px solid var(--color-border);
                color: var(--color-text);
            }

            .settings-btn-secondary:hover {
                background: var(--color-border);
            }

            .settings-btn-primary {
                background: var(--color-primary);
                border: none;
                color: white;
            }

            .settings-btn-primary:hover {
                opacity: 0.9;
            }

            .settings-btn-primary:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .settings-info-box {
                background: var(--color-primary-light);
                border: 1px solid var(--color-primary);
                border-radius: var(--radius-md);
                padding: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
                display: flex;
                gap: var(--spacing-sm);
            }

            .settings-info-box svg {
                width: 20px;
                height: 20px;
                color: var(--color-primary);
                flex-shrink: 0;
            }

            .settings-info-box p {
                font-size: var(--font-sm);
                color: var(--color-text);
                margin: 0;
            }

            .settings-readonly {
                background: var(--color-bg-tertiary) !important;
                color: var(--color-text-muted) !important;
                cursor: not-allowed;
            }
        </style>

        <div class="settings-container">
            <div class="settings-header">
                <h1 class="settings-title">Paramètres de l'association</h1>
                <p class="settings-subtitle">Gérez les informations de votre association</p>
            </div>

            <div class="settings-info-box" id="info-box" style="display: none;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <p>Complétez les informations de votre association pour une meilleure visibilité auprès de vos adhérents.</p>
            </div>

            <form id="settings-form">
                <div class="settings-card">
                    <div class="settings-section">
                        <div class="settings-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                            Informations générales
                        </div>

                        <div class="settings-form-group">
                            <label class="settings-label">Nom de l'association *</label>
                            <input type="text" class="settings-input" id="name" required>
                        </div>

                        <div class="settings-form-group">
                            <label class="settings-label">Identifiant unique (slug)</label>
                            <input type="text" class="settings-input settings-readonly" id="slug" readonly>
                        </div>

                        <div class="settings-form-group">
                            <label class="settings-label">Description</label>
                            <textarea class="settings-textarea" id="description" placeholder="Décrivez votre association en quelques mots..."></textarea>
                        </div>

                        <div class="settings-form-group">
                            <label class="settings-label">Logo</label>
                            <div class="settings-logo-preview" id="logo-preview">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                            </div>
                            <input type="url" class="settings-input" id="logo_url" placeholder="https://exemple.com/logo.png">
                        </div>
                    </div>

                    <div class="settings-section">
                        <div class="settings-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                            Contact
                        </div>

                        <div class="settings-row">
                            <div class="settings-form-group">
                                <label class="settings-label">Email</label>
                                <input type="email" class="settings-input" id="email" placeholder="contact@association.fr">
                            </div>
                            <div class="settings-form-group">
                                <label class="settings-label">Téléphone</label>
                                <input type="tel" class="settings-input" id="phone" placeholder="01 23 45 67 89">
                            </div>
                        </div>

                        <div class="settings-form-group">
                            <label class="settings-label">Site web</label>
                            <input type="url" class="settings-input" id="website" placeholder="https://www.association.fr">
                        </div>
                    </div>

                    <div class="settings-section">
                        <div class="settings-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            Adresse
                        </div>

                        <div class="settings-form-group">
                            <label class="settings-label">Adresse</label>
                            <input type="text" class="settings-input" id="address" placeholder="123 rue de la Mosquée">
                        </div>

                        <div class="settings-row">
                            <div class="settings-form-group">
                                <label class="settings-label">Code postal</label>
                                <input type="text" class="settings-input" id="postal_code" placeholder="75001">
                            </div>
                            <div class="settings-form-group">
                                <label class="settings-label">Ville</label>
                                <input type="text" class="settings-input" id="city" placeholder="Paris">
                            </div>
                        </div>

                        <div class="settings-form-group">
                            <label class="settings-label">Pays</label>
                            <input type="text" class="settings-input" id="country" value="France">
                        </div>
                    </div>

                    <div class="settings-section">
                        <div class="settings-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            Informations légales
                        </div>

                        <div class="settings-row">
                            <div class="settings-form-group">
                                <label class="settings-label">Numéro SIRET</label>
                                <input type="text" class="settings-input" id="siret" placeholder="123 456 789 00012">
                            </div>
                            <div class="settings-form-group">
                                <label class="settings-label">Numéro RNA</label>
                                <input type="text" class="settings-input" id="rna_number" placeholder="W123456789">
                            </div>
                        </div>
                    </div>

                    <div class="settings-actions">
                        <button type="button" class="settings-btn settings-btn-secondary" id="btn-reset">Annuler</button>
                        <button type="submit" class="settings-btn settings-btn-primary" id="btn-save">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                <polyline points="17 21 17 13 7 13 7 21"/>
                                <polyline points="7 3 7 8 15 8"/>
                            </svg>
                            Enregistrer
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;

    // Load current association data
    await loadAssociationData();

    // Logo preview
    document.getElementById('logo_url').addEventListener('input', (e) => {
        const preview = document.getElementById('logo-preview');
        if (e.target.value) {
            preview.innerHTML = `<img src="${e.target.value}" onerror="this.style.display='none'">`;
        } else {
            preview.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
        }
    });

    // Reset button
    document.getElementById('btn-reset').addEventListener('click', loadAssociationData);

    // Form submit
    document.getElementById('settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveAssociationData();
    });
}

async function loadAssociationData() {
    try {
        const response = await apiService.get('/associations/current');

        if (response.success && response.data) {
            const asso = response.data;

            document.getElementById('name').value = asso.name || '';
            document.getElementById('slug').value = asso.slug || '';
            document.getElementById('description').value = asso.description || '';
            document.getElementById('logo_url').value = asso.logo_url || '';
            document.getElementById('email').value = asso.email || '';
            document.getElementById('phone').value = asso.phone || '';
            document.getElementById('website').value = asso.website || '';
            document.getElementById('address').value = asso.address || '';
            document.getElementById('postal_code').value = asso.postal_code || '';
            document.getElementById('city').value = asso.city || '';
            document.getElementById('country').value = asso.country || 'France';
            document.getElementById('siret').value = asso.siret || '';
            document.getElementById('rna_number').value = asso.rna_number || '';

            // Update logo preview
            const preview = document.getElementById('logo-preview');
            if (asso.logo_url) {
                preview.innerHTML = `<img src="${asso.logo_url}" onerror="this.style.display='none'">`;
            }

            // Show info box if incomplete
            if (!asso.address || !asso.phone || !asso.email) {
                document.getElementById('info-box').style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('Error loading association data:', error);
        toastError('Erreur lors du chargement des données');
    }
}

async function saveAssociationData() {
    const btn = document.getElementById('btn-save');
    btn.disabled = true;
    btn.innerHTML = '<svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Enregistrement...';

    const data = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        logo_url: document.getElementById('logo_url').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        website: document.getElementById('website').value,
        address: document.getElementById('address').value,
        postal_code: document.getElementById('postal_code').value,
        city: document.getElementById('city').value,
        country: document.getElementById('country').value,
        siret: document.getElementById('siret').value,
        rna_number: document.getElementById('rna_number').value
    };

    try {
        const response = await apiService.put('/associations/current', data);

        if (response.success) {
            toastSuccess('Informations enregistrées');

            // Update stored association
            const association = appState.get('association');
            if (association) {
                appState.set('association', { ...association, ...data });
            }

            // Hide info box
            document.getElementById('info-box').style.display = 'none';
        } else {
            toastError(response.message || 'Erreur lors de la sauvegarde');
        }
    } catch (error) {
        console.error('Error saving association data:', error);
        toastError('Erreur lors de la sauvegarde');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Enregistrer';
    }
}
