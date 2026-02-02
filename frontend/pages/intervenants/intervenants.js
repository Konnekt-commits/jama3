import apiService from '../../services/api.service.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';

export async function renderIntervenantsPage() {
    renderNavbar('Intervenants');

    const pageContent = document.getElementById('page-content');

    pageContent.innerHTML = `
        <style>
            .intervenants-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--spacing-lg);
            }

            .intervenant-grid {
                display: grid;
                gap: var(--spacing-md);
            }

            @media (min-width: 768px) {
                .intervenant-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            @media (min-width: 1280px) {
                .intervenant-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
            }

            .intervenant-card {
                background-color: var(--color-card-bg);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-lg);
                padding: var(--spacing-lg);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .intervenant-card:hover {
                box-shadow: var(--shadow-md);
                border-color: var(--color-primary);
            }

            .intervenant-header {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-md);
            }

            .intervenant-avatar {
                width: 56px;
                height: 56px;
                border-radius: var(--radius-full);
                background-color: var(--color-accent-light);
                color: var(--color-accent);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: var(--font-bold);
                font-size: var(--font-lg);
            }

            .intervenant-info h3 {
                font-weight: var(--font-semibold);
                margin-bottom: var(--spacing-xs);
            }

            .intervenant-speciality {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
            }

            .intervenant-meta {
                display: flex;
                flex-wrap: wrap;
                gap: var(--spacing-sm);
                margin-top: var(--spacing-md);
                padding-top: var(--spacing-md);
                border-top: 1px solid var(--color-border);
            }

            .intervenant-meta-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                font-size: var(--font-sm);
                color: var(--color-text-secondary);
            }

            .intervenant-meta-item svg {
                width: 16px;
                height: 16px;
                color: var(--color-text-muted);
            }

            .contract-badge {
                padding: var(--spacing-xs) var(--spacing-sm);
                font-size: var(--font-xs);
                border-radius: var(--radius-full);
                background-color: var(--color-bg-tertiary);
            }

            .contract-badge.salarie {
                background-color: var(--color-success-light);
                color: var(--color-success);
            }

            .contract-badge.benevole {
                background-color: var(--color-info-light);
                color: var(--color-info);
            }

            .contract-badge.freelance {
                background-color: var(--color-accent-light);
                color: var(--color-accent);
            }

            .add-btn {
                position: fixed;
                bottom: calc(var(--mobile-nav-height) + var(--spacing-lg));
                right: var(--spacing-lg);
                width: 56px;
                height: 56px;
                border-radius: var(--radius-full);
                background-color: var(--color-primary);
                color: white;
                box-shadow: var(--shadow-lg);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all var(--transition-fast);
                z-index: var(--z-fixed);
            }

            .add-btn:hover {
                background-color: var(--color-primary-hover);
                transform: scale(1.05);
            }

            @media (min-width: 1024px) {
                .add-btn {
                    bottom: var(--spacing-xl);
                }
            }
        </style>

        <div class="intervenants-header">
            <h2 class="heading-3">Équipe d'intervenants</h2>
        </div>

        <div class="intervenant-grid" id="intervenants-list">
            ${Array(4).fill().map(() => `
                <div class="intervenant-card">
                    <div class="intervenant-header">
                        <div class="skeleton" style="width: 56px; height: 56px; border-radius: 50%;"></div>
                        <div style="flex: 1;">
                            <div class="skeleton" style="width: 70%; height: 20px; margin-bottom: 8px;"></div>
                            <div class="skeleton" style="width: 50%; height: 16px;"></div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <button class="add-btn" id="add-intervenant-btn" title="Ajouter un intervenant">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
    `;

    document.getElementById('add-intervenant-btn').addEventListener('click', () => {
        openIntervenantForm();
    });

    loadIntervenants();
}

async function loadIntervenants() {
    const listContainer = document.getElementById('intervenants-list');

    try {
        const response = await apiService.getIntervenants();

        if (response.success) {
            const intervenants = response.data.intervenants;

            if (intervenants.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                        <h3 class="empty-state-title">Aucun intervenant</h3>
                        <p class="empty-state-description">Commencez par ajouter votre premier intervenant</p>
                    </div>
                `;
                return;
            }

            const contractLabels = {
                salarie: 'Salarié',
                benevole: 'Bénévole',
                freelance: 'Freelance',
                stagiaire: 'Stagiaire'
            };

            listContainer.innerHTML = intervenants.map(i => {
                const initials = (i.first_name[0] + i.last_name[0]).toUpperCase();

                return `
                    <div class="intervenant-card" data-id="${i.id}">
                        <div class="intervenant-header">
                            <div class="intervenant-avatar">
                                ${i.photo_url ? `<img src="${i.photo_url}" alt="${i.first_name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : initials}
                            </div>
                            <div class="intervenant-info">
                                <h3>${i.first_name} ${i.last_name}</h3>
                                <p class="intervenant-speciality">${i.speciality || 'Non spécifié'}</p>
                            </div>
                            <span class="contract-badge ${i.contract_type}">${contractLabels[i.contract_type] || i.contract_type}</span>
                        </div>
                        <div class="intervenant-meta">
                            ${i.email ? `
                                <span class="intervenant-meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    ${i.email}
                                </span>
                            ` : ''}
                            ${i.phone ? `
                                <span class="intervenant-meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    ${i.phone}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');

            document.querySelectorAll('.intervenant-card').forEach(card => {
                card.addEventListener('click', () => {
                    const id = card.dataset.id;
                    const intervenant = intervenants.find(i => i.id == id);
                    if (intervenant) {
                        openIntervenantDetail(intervenant);
                    }
                });
            });
        }
    } catch (error) {
        console.error('Load intervenants error:', error);
        toastError('Erreur lors du chargement des intervenants');
    }
}

function openIntervenantForm(intervenant = null) {
    const isEdit = !!intervenant;

    openBottomSheet({
        title: isEdit ? 'Modifier l\'intervenant' : 'Nouvel intervenant',
        content: `
            <form id="intervenant-form">
                <div class="grid grid-cols-2 gap-md">
                    <div class="form-group">
                        <label class="form-label" for="first_name">Prénom *</label>
                        <input type="text" class="form-input" id="first_name" name="first_name" required value="${intervenant?.first_name || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="last_name">Nom *</label>
                        <input type="text" class="form-input" id="last_name" name="last_name" required value="${intervenant?.last_name || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="email">Email</label>
                    <input type="email" class="form-input" id="email" name="email" value="${intervenant?.email || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="phone">Téléphone</label>
                    <input type="tel" class="form-input" id="phone" name="phone" value="${intervenant?.phone || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="speciality">Spécialité</label>
                    <input type="text" class="form-input" id="speciality" name="speciality" value="${intervenant?.speciality || ''}" placeholder="Ex: Yoga, Peinture, Musique...">
                </div>
                <div class="form-group">
                    <label class="form-label" for="contract_type">Type de contrat</label>
                    <select class="form-select" id="contract_type" name="contract_type">
                        <option value="benevole" ${intervenant?.contract_type === 'benevole' ? 'selected' : ''}>Bénévole</option>
                        <option value="salarie" ${intervenant?.contract_type === 'salarie' ? 'selected' : ''}>Salarié</option>
                        <option value="freelance" ${intervenant?.contract_type === 'freelance' ? 'selected' : ''}>Freelance</option>
                        <option value="stagiaire" ${intervenant?.contract_type === 'stagiaire' ? 'selected' : ''}>Stagiaire</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="hourly_rate">Taux horaire (€)</label>
                    <input type="number" class="form-input" id="hourly_rate" name="hourly_rate" step="0.01" min="0" value="${intervenant?.hourly_rate || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="bio">Biographie</label>
                    <textarea class="form-textarea" id="bio" name="bio" rows="3">${intervenant?.bio || ''}</textarea>
                </div>
            </form>
        `,
        footer: `
            <button type="button" class="btn btn-secondary" id="cancel-btn">Annuler</button>
            <button type="submit" form="intervenant-form" class="btn btn-primary" id="save-btn">${isEdit ? 'Enregistrer' : 'Créer'}</button>
        `
    });

    document.getElementById('cancel-btn').addEventListener('click', closeBottomSheet);

    document.getElementById('intervenant-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const saveBtn = document.getElementById('save-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Enregistrement...';

        try {
            let response;
            if (isEdit) {
                response = await apiService.updateIntervenant(intervenant.id, data);
            } else {
                response = await apiService.createIntervenant(data);
            }

            if (response.success) {
                toastSuccess(isEdit ? 'Intervenant modifié' : 'Intervenant créé');
                closeBottomSheet();
                loadIntervenants();
            }
        } catch (error) {
            toastError(error.message || 'Erreur lors de l\'enregistrement');
            saveBtn.disabled = false;
            saveBtn.textContent = isEdit ? 'Enregistrer' : 'Créer';
        }
    });
}

function openIntervenantDetail(intervenant) {
    const contractLabels = {
        salarie: 'Salarié',
        benevole: 'Bénévole',
        freelance: 'Freelance',
        stagiaire: 'Stagiaire'
    };

    openBottomSheet({
        title: `${intervenant.first_name} ${intervenant.last_name}`,
        content: `
            <div style="text-align: center; margin-bottom: var(--spacing-lg);">
                <div class="intervenant-avatar" style="width: 80px; height: 80px; font-size: var(--font-2xl); margin: 0 auto var(--spacing-md);">
                    ${(intervenant.first_name[0] + intervenant.last_name[0]).toUpperCase()}
                </div>
                <p class="text-muted">${intervenant.speciality || 'Spécialité non définie'}</p>
                <span class="contract-badge ${intervenant.contract_type}" style="margin-top: var(--spacing-sm);">
                    ${contractLabels[intervenant.contract_type] || intervenant.contract_type}
                </span>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                ${intervenant.email ? `
                    <div class="flex items-center gap-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <span>${intervenant.email}</span>
                    </div>
                ` : ''}
                ${intervenant.phone ? `
                    <div class="flex items-center gap-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <span>${intervenant.phone}</span>
                    </div>
                ` : ''}
                ${intervenant.hourly_rate ? `
                    <div class="flex items-center gap-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        <span>${intervenant.hourly_rate} €/h</span>
                    </div>
                ` : ''}
            </div>

            ${intervenant.bio ? `
                <div style="margin-top: var(--spacing-lg); padding-top: var(--spacing-lg); border-top: 1px solid var(--color-border);">
                    <p class="text-sm text-muted" style="margin-bottom: var(--spacing-xs);">Biographie</p>
                    <p>${intervenant.bio}</p>
                </div>
            ` : ''}
        `,
        footer: `
            <button class="btn btn-secondary" id="edit-btn">Modifier</button>
            <button class="btn btn-primary" id="close-detail-btn">Fermer</button>
        `
    });

    document.getElementById('edit-btn').addEventListener('click', () => {
        closeBottomSheet();
        setTimeout(() => openIntervenantForm(intervenant), 300);
    });

    document.getElementById('close-detail-btn').addEventListener('click', closeBottomSheet);
}
