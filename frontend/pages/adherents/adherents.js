import apiService from '../../services/api.service.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { createMemberCard, initMemberCardStyles } from '../../components/memberCard/memberCard.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';
import router from '../../router/router.js';
import i18n from '../../services/i18n.service.js';

let currentAdherents = [];

export async function renderAdherentsPage() {
    renderNavbar(i18n.t('nav.adherents'));
    initMemberCardStyles();

    const pageContent = document.getElementById('page-content');

    pageContent.innerHTML = `
        <style>
            .adherents-header {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
                overflow: hidden;
            }

            @media (min-width: 640px) {
                .adherents-header {
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                }
            }

            .adherents-filters-wrapper {
                width: 100%;
                overflow: hidden;
            }

            .adherents-filters {
                display: flex;
                gap: var(--spacing-xs);
                flex-wrap: nowrap;
                overflow-x: auto;
                padding-bottom: var(--spacing-xs);
                -webkit-overflow-scrolling: touch;
                scrollbar-width: none;
                -ms-overflow-style: none;
                margin: 0 calc(-1 * var(--spacing-md));
                padding-left: var(--spacing-md);
                padding-right: var(--spacing-md);
            }

            .adherents-filters::-webkit-scrollbar {
                display: none;
            }

            @media (min-width: 480px) {
                .adherents-filters {
                    gap: var(--spacing-sm);
                }
            }

            .filter-btn {
                padding: var(--spacing-xs) var(--spacing-sm);
                font-size: var(--font-xs);
                border-radius: var(--radius-full);
                border: 1px solid var(--color-border);
                background-color: var(--color-bg-primary);
                transition: all var(--transition-fast);
                white-space: nowrap;
                flex-shrink: 0;
            }

            @media (min-width: 480px) {
                .filter-btn {
                    padding: var(--spacing-sm) var(--spacing-md);
                    font-size: var(--font-sm);
                }
            }

            .filter-btn:hover {
                background-color: var(--color-bg-hover);
            }

            .filter-btn.active {
                background-color: var(--color-primary);
                color: white;
                border-color: var(--color-primary);
            }

            .adherents-search {
                position: relative;
                width: 100%;
                max-width: 100%;
            }

            @media (min-width: 640px) {
                .adherents-search {
                    max-width: 300px;
                }
            }

            .adherents-search input {
                width: 100%;
                padding: var(--spacing-sm) var(--spacing-md);
                padding-left: 40px;
                border: 1px solid var(--color-border);
                border-radius: var(--radius-full);
                background-color: var(--color-bg-secondary);
                font-size: 16px;
                box-sizing: border-box;
            }

            .adherents-search-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--color-text-muted);
            }

            .adherents-list {
                display: grid;
                gap: var(--spacing-sm);
                grid-template-columns: 1fr;
            }

            @media (min-width: 480px) {
                .adherents-list {
                    gap: var(--spacing-md);
                }
            }

            @media (min-width: 768px) {
                .adherents-list {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            @media (min-width: 1280px) {
                .adherents-list {
                    grid-template-columns: repeat(3, 1fr);
                }
            }

            .adherents-count {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
                margin-bottom: var(--spacing-md);
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

        <div class="adherents-header">
            <div class="adherents-filters-wrapper">
                <div class="adherents-filters">
                    <button class="filter-btn active" data-filter="all">${i18n.t('adherents.all')}</button>
                    <button class="filter-btn" data-filter="actif">${i18n.t('adherents.active')}</button>
                    <button class="filter-btn" data-filter="inactif">${i18n.t('adherents.inactive')}</button>
                    <button class="filter-btn" data-filter="archive">${i18n.t('adherents.archived')}</button>
                </div>
            </div>
            <div class="adherents-search">
                <svg class="adherents-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder="${i18n.t('adherents.search')}" id="search-input">
            </div>
        </div>

        <p class="adherents-count" id="adherents-count">${i18n.t('loading')}</p>

        <div class="adherents-list" id="adherents-list">
            ${Array(6).fill().map(() => `
                <div class="card" style="padding: var(--spacing-md);">
                    <div class="flex gap-md items-center">
                        <div class="skeleton" style="width: 48px; height: 48px; border-radius: 50%;"></div>
                        <div style="flex: 1;">
                            <div class="skeleton" style="width: 60%; height: 20px; margin-bottom: 8px;"></div>
                            <div class="skeleton" style="width: 40%; height: 16px;"></div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <button class="add-btn" id="add-adherent-btn" title="${i18n.t('adherents.new')}">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
    `;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadAdherents({ status: btn.dataset.filter === 'all' ? null : btn.dataset.filter });
        });
    });

    let searchTimeout;
    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadAdherents({ search: e.target.value });
        }, 300);
    });

    document.getElementById('add-adherent-btn').addEventListener('click', () => {
        openAdherentForm();
    });

    loadAdherents();

    const params = router.getQueryParams();
    if (params.action === 'new') {
        openAdherentForm();
    }
}

async function loadAdherents(filters = {}) {
    const listContainer = document.getElementById('adherents-list');
    const countEl = document.getElementById('adherents-count');

    try {
        const response = await apiService.getAdherents(filters);

        if (response.success) {
            currentAdherents = response.data.adherents;
            countEl.textContent = i18n.t('adherents.count', { count: currentAdherents.length });

            if (currentAdherents.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <h3 class="empty-state-title">${i18n.t('adherents.noMembers')}</h3>
                        <p class="empty-state-description">${i18n.t('adherents.startAdding')}</p>
                        <button class="btn btn-primary" id="empty-add-btn">${i18n.t('adherents.addFirst')}</button>
                    </div>
                `;
                document.getElementById('empty-add-btn')?.addEventListener('click', openAdherentForm);
            } else {
                listContainer.innerHTML = '';
                currentAdherents.forEach(adherent => {
                    const card = createMemberCard(adherent, {
                        onClick: (member) => openAdherentDetail(member),
                        onMenuClick: (member, btn) => showMemberMenu(member, btn)
                    });
                    listContainer.appendChild(card);
                });
            }
        }
    } catch (error) {
        console.error('Load adherents error:', error);
        toastError('Erreur lors du chargement des adhérents');
    }
}

function openAdherentForm(adherent = null) {
    const isEdit = !!adherent;

    openBottomSheet({
        title: isEdit ? i18n.t('adherents.edit') : i18n.t('adherents.new'),
        content: `
            <form id="adherent-form">
                <div class="grid grid-cols-2 gap-md">
                    <div class="form-group">
                        <label class="form-label" for="first_name">${i18n.t('adherents.firstName')} *</label>
                        <input type="text" class="form-input" id="first_name" name="first_name" required value="${adherent?.first_name || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="last_name">${i18n.t('adherents.lastName')} *</label>
                        <input type="text" class="form-input" id="last_name" name="last_name" required value="${adherent?.last_name || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="email">${i18n.t('adherents.email')}</label>
                    <input type="email" class="form-input" id="email" name="email" value="${adherent?.email || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="phone">${i18n.t('adherents.phone')}</label>
                    <input type="tel" class="form-input" id="phone" name="phone" value="${adherent?.phone || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="birth_date">${i18n.t('adherents.birthDate')}</label>
                    <input type="date" class="form-input" id="birth_date" name="birth_date" value="${adherent?.birth_date ? adherent.birth_date.split('T')[0] : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="address">${i18n.t('adherents.address')}</label>
                    <input type="text" class="form-input" id="address" name="address" value="${adherent?.address || ''}">
                </div>
                <div class="grid grid-cols-2 gap-md">
                    <div class="form-group">
                        <label class="form-label" for="postal_code">${i18n.t('adherents.postalCode')}</label>
                        <input type="text" class="form-input" id="postal_code" name="postal_code" value="${adherent?.postal_code || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="city">${i18n.t('adherents.city')}</label>
                        <input type="text" class="form-input" id="city" name="city" value="${adherent?.city || ''}">
                    </div>
                </div>
                ${isEdit ? `
                    <div class="form-group">
                        <label class="form-label" for="status">${i18n.t('adherents.status')}</label>
                        <select class="form-select" id="status" name="status">
                            <option value="actif" ${adherent?.status === 'actif' ? 'selected' : ''}>${i18n.t('status.actif')}</option>
                            <option value="inactif" ${adherent?.status === 'inactif' ? 'selected' : ''}>${i18n.t('status.inactif')}</option>
                            <option value="suspendu" ${adherent?.status === 'suspendu' ? 'selected' : ''}>${i18n.t('status.suspendu')}</option>
                        </select>
                    </div>
                ` : ''}
            </form>
        `,
        footer: `
            <button type="button" class="btn btn-secondary" id="cancel-btn">${i18n.t('cancel')}</button>
            <button type="submit" form="adherent-form" class="btn btn-primary" id="save-btn">${isEdit ? i18n.t('save') : i18n.t('add')}</button>
        `
    });

    document.getElementById('cancel-btn').addEventListener('click', closeBottomSheet);

    document.getElementById('adherent-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const saveBtn = document.getElementById('save-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = i18n.t('loading');

        try {
            let response;
            if (isEdit) {
                response = await apiService.updateAdherent(adherent.id, data);
            } else {
                response = await apiService.createAdherent(data);
            }

            if (response.success) {
                toastSuccess(isEdit ? i18n.t('messages.updated') : i18n.t('messages.created'));
                closeBottomSheet();
                loadAdherents();
            }
        } catch (error) {
            toastError(error.message || i18n.t('messages.error'));
            saveBtn.disabled = false;
            saveBtn.textContent = isEdit ? i18n.t('save') : i18n.t('add');
        }
    });
}

function openAdherentDetail(adherent) {
    openBottomSheet({
        title: `${adherent.first_name} ${adherent.last_name}`,
        content: `
            <div style="text-align: center; margin-bottom: var(--spacing-lg);">
                <div class="avatar avatar-lg" style="margin: 0 auto var(--spacing-md);">
                    ${(adherent.first_name[0] + adherent.last_name[0]).toUpperCase()}
                </div>
                <p class="text-sm text-muted">${adherent.member_number || 'N° en attente'}</p>
                <span class="badge badge-${adherent.status}">${adherent.status}</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                ${adherent.email ? `
                    <div class="flex items-center gap-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <span>${adherent.email}</span>
                    </div>
                ` : ''}
                ${adherent.phone ? `
                    <div class="flex items-center gap-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <span>${adherent.phone}</span>
                    </div>
                ` : ''}
                ${adherent.address ? `
                    <div class="flex items-center gap-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span>${adherent.address}${adherent.postal_code ? `, ${adherent.postal_code}` : ''} ${adherent.city || ''}</span>
                    </div>
                ` : ''}
                ${adherent.birth_date ? `
                    <div class="flex items-center gap-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span>${new Date(adherent.birth_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                ` : ''}
            </div>
        `,
        footer: `
            <button class="btn btn-outline" id="magic-link-btn" style="display: flex; align-items: center; gap: 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                Lien espace
            </button>
            <button class="btn btn-secondary" id="edit-btn">${i18n.t('edit')}</button>
            <button class="btn btn-primary" id="close-detail-btn">${i18n.t('close')}</button>
        `
    });

    document.getElementById('magic-link-btn').addEventListener('click', async () => {
        const btn = document.getElementById('magic-link-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Génération...';

        try {
            const response = await apiService.post('/adherent-space/generate-token', {
                adherent_id: adherent.id,
                validity_hours: 48
            });

            if (response.success) {
                const link = response.data.magic_link;
                await navigator.clipboard.writeText(link);
                toastSuccess('Lien copié ! Valide 48h');
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Copié !';
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            toastError('Erreur génération lien');
            btn.innerHTML = 'Lien espace';
        }
        btn.disabled = false;
    });

    document.getElementById('edit-btn').addEventListener('click', () => {
        closeBottomSheet();
        setTimeout(() => openAdherentForm(adherent), 300);
    });

    document.getElementById('close-detail-btn').addEventListener('click', closeBottomSheet);
}

function showMemberMenu(member, btn) {
    console.log('Menu for:', member.id);
}
