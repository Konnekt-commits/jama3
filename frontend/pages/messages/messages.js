import apiService from '../../services/api.service.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { openBottomSheet, closeBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';
import router from '../../router/router.js';

export async function renderMessagesPage() {
    renderNavbar('Messages');

    const pageContent = document.getElementById('page-content');

    pageContent.innerHTML = `
        <style>
            .messages-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--spacing-lg);
            }

            .messages-tabs {
                display: flex;
                gap: var(--spacing-xs);
                background-color: var(--color-bg-secondary);
                padding: var(--spacing-xs);
                border-radius: var(--radius-md);
                margin-bottom: var(--spacing-lg);
            }

            .tab-btn {
                flex: 1;
                padding: var(--spacing-sm) var(--spacing-md);
                font-size: var(--font-sm);
                border-radius: var(--radius-sm);
                transition: all var(--transition-fast);
                text-align: center;
            }

            .tab-btn.active {
                background-color: var(--color-card-bg);
                box-shadow: var(--shadow-sm);
            }

            .message-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }

            .message-card {
                display: flex;
                gap: var(--spacing-md);
                padding: var(--spacing-md);
                background-color: var(--color-card-bg);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-lg);
                cursor: pointer;
                transition: all var(--transition-fast);
            }

            .message-card:hover {
                box-shadow: var(--shadow-md);
            }

            .message-card.unread {
                border-left: 3px solid var(--color-primary);
                background-color: var(--color-primary-light);
            }

            .message-avatar {
                width: 44px;
                height: 44px;
                border-radius: var(--radius-full);
                background-color: var(--color-primary-light);
                color: var(--color-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: var(--font-semibold);
                flex-shrink: 0;
            }

            .message-content {
                flex: 1;
                min-width: 0;
            }

            .message-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: var(--spacing-xs);
            }

            .message-sender {
                font-weight: var(--font-medium);
            }

            .message-time {
                font-size: var(--font-xs);
                color: var(--color-text-muted);
                white-space: nowrap;
            }

            .message-subject {
                font-size: var(--font-sm);
                margin-bottom: var(--spacing-xs);
            }

            .message-preview {
                font-size: var(--font-sm);
                color: var(--color-text-muted);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .message-type-badge {
                font-size: var(--font-xs);
                padding: 2px var(--spacing-xs);
                border-radius: var(--radius-sm);
                margin-left: var(--spacing-sm);
            }

            .message-type-badge.alert {
                background-color: var(--color-error-light);
                color: var(--color-error);
            }

            .message-type-badge.reminder {
                background-color: var(--color-warning-light);
                color: var(--color-warning);
            }

            .message-type-badge.info {
                background-color: var(--color-info-light);
                color: var(--color-info);
            }

            .compose-btn {
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

            .compose-btn:hover {
                background-color: var(--color-primary-hover);
                transform: scale(1.05);
            }

            @media (min-width: 1024px) {
                .compose-btn {
                    bottom: var(--spacing-xl);
                }
            }
        </style>

        <div class="messages-header">
            <h2 class="heading-3">Messagerie</h2>
        </div>

        <div class="messages-tabs">
            <button class="tab-btn active" data-tab="inbox">Boîte de réception</button>
            <button class="tab-btn" data-tab="sent">Envoyés</button>
        </div>

        <div class="message-list" id="messages-list">
            ${Array(5).fill().map(() => `
                <div class="message-card">
                    <div class="skeleton" style="width: 44px; height: 44px; border-radius: 50%;"></div>
                    <div class="message-content">
                        <div class="skeleton" style="width: 60%; height: 18px; margin-bottom: 8px;"></div>
                        <div class="skeleton" style="width: 80%; height: 16px; margin-bottom: 4px;"></div>
                        <div class="skeleton" style="width: 100%; height: 14px;"></div>
                    </div>
                </div>
            `).join('')}
        </div>

        <button class="compose-btn" id="compose-btn" title="Nouveau message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
    `;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadMessages(btn.dataset.tab);
        });
    });

    document.getElementById('compose-btn').addEventListener('click', () => {
        openComposeForm();
    });

    loadMessages('inbox');

    const params = router.getQueryParams();
    if (params.action === 'new') {
        openComposeForm();
    }
}

async function loadMessages(tab = 'inbox') {
    const listContainer = document.getElementById('messages-list');

    try {
        const response = await apiService.getMessages();

        if (response.success) {
            const messages = response.data.messages;

            if (messages.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state">
                        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        <h3 class="empty-state-title">Aucun message</h3>
                        <p class="empty-state-description">Votre boîte de réception est vide</p>
                    </div>
                `;
                return;
            }

            const typeLabels = {
                info: 'Info',
                alert: 'Alerte',
                reminder: 'Rappel',
                newsletter: 'Newsletter'
            };

            listContainer.innerHTML = messages.map(m => {
                const initials = (m.sender_first_name[0] + m.sender_last_name[0]).toUpperCase();
                const date = new Date(m.sent_at);
                const timeStr = formatMessageTime(date);

                return `
                    <div class="message-card ${!m.is_read ? 'unread' : ''}" data-id="${m.id}">
                        <div class="message-avatar">${initials}</div>
                        <div class="message-content">
                            <div class="message-header">
                                <span class="message-sender">
                                    ${m.sender_first_name} ${m.sender_last_name}
                                    ${m.message_type !== 'info' ? `<span class="message-type-badge ${m.message_type}">${typeLabels[m.message_type]}</span>` : ''}
                                </span>
                                <span class="message-time">${timeStr}</span>
                            </div>
                            ${m.subject ? `<div class="message-subject">${m.subject}</div>` : ''}
                            <div class="message-preview">${m.content}</div>
                        </div>
                    </div>
                `;
            }).join('');

            document.querySelectorAll('.message-card').forEach(card => {
                card.addEventListener('click', async () => {
                    const id = card.dataset.id;
                    const message = messages.find(m => m.id == id);
                    if (message) {
                        if (!message.is_read) {
                            await apiService.markMessageAsRead(id);
                            card.classList.remove('unread');
                        }
                        openMessageDetail(message);
                    }
                });
            });
        }
    } catch (error) {
        console.error('Load messages error:', error);
        toastError('Erreur lors du chargement des messages');
    }
}

function formatMessageTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
}

function openComposeForm() {
    openBottomSheet({
        title: 'Nouveau message',
        content: `
            <form id="message-form">
                <div class="form-group">
                    <label class="form-label" for="recipient_type">Destinataire</label>
                    <select class="form-select" id="recipient_type" name="recipient_type" required>
                        <option value="">Sélectionner...</option>
                        <option value="all">Tous les membres</option>
                        <option value="adherent">Un adhérent</option>
                        <option value="group">Groupe</option>
                    </select>
                </div>

                <div class="form-group" id="recipient-select-group" style="display: none;">
                    <label class="form-label" for="recipient_id">Sélectionner le destinataire</label>
                    <select class="form-select" id="recipient_id" name="recipient_id">
                        <option value="">Chargement...</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="message_type">Type</label>
                    <select class="form-select" id="message_type" name="message_type">
                        <option value="info">Information</option>
                        <option value="reminder">Rappel</option>
                        <option value="alert">Alerte</option>
                        <option value="newsletter">Newsletter</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="subject">Sujet</label>
                    <input type="text" class="form-input" id="subject" name="subject">
                </div>

                <div class="form-group">
                    <label class="form-label" for="content">Message *</label>
                    <textarea class="form-textarea" id="content" name="content" rows="5" required placeholder="Rédigez votre message..."></textarea>
                </div>
            </form>
        `,
        footer: `
            <button type="button" class="btn btn-secondary" id="cancel-btn">Annuler</button>
            <button type="submit" form="message-form" class="btn btn-primary" id="send-btn">Envoyer</button>
        `
    });

    document.getElementById('cancel-btn').addEventListener('click', closeBottomSheet);

    document.getElementById('recipient_type').addEventListener('change', async (e) => {
        const selectGroup = document.getElementById('recipient-select-group');
        const recipientSelect = document.getElementById('recipient_id');

        if (e.target.value === 'adherent') {
            selectGroup.style.display = 'block';
            try {
                const response = await apiService.getAdherents({ status: 'actif' });
                if (response.success) {
                    recipientSelect.innerHTML = response.data.adherents.map(a =>
                        `<option value="${a.id}">${a.first_name} ${a.last_name}</option>`
                    ).join('');
                }
            } catch (error) {
                recipientSelect.innerHTML = '<option value="">Erreur de chargement</option>';
            }
        } else {
            selectGroup.style.display = 'none';
        }
    });

    document.getElementById('message-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const sendBtn = document.getElementById('send-btn');
        sendBtn.disabled = true;
        sendBtn.textContent = 'Envoi...';

        try {
            const response = await apiService.sendMessage(data);

            if (response.success) {
                toastSuccess('Message envoyé');
                closeBottomSheet();
                loadMessages('inbox');
            }
        } catch (error) {
            toastError(error.message || 'Erreur lors de l\'envoi');
            sendBtn.disabled = false;
            sendBtn.textContent = 'Envoyer';
        }
    });
}

function openMessageDetail(message) {
    const date = new Date(message.sent_at);

    const typeLabels = {
        info: 'Information',
        alert: 'Alerte',
        reminder: 'Rappel',
        newsletter: 'Newsletter'
    };

    openBottomSheet({
        title: message.subject || 'Message',
        content: `
            <div style="margin-bottom: var(--spacing-lg);">
                <div class="flex items-center gap-md" style="margin-bottom: var(--spacing-md);">
                    <div class="avatar">
                        ${(message.sender_first_name[0] + message.sender_last_name[0]).toUpperCase()}
                    </div>
                    <div>
                        <div class="font-medium">${message.sender_first_name} ${message.sender_last_name}</div>
                        <div class="text-sm text-muted">${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <span class="badge badge-${message.message_type === 'alert' ? 'inactif' : message.message_type === 'reminder' ? 'pending' : 'primary'}" style="margin-left: auto;">
                        ${typeLabels[message.message_type]}
                    </span>
                </div>
            </div>

            <div style="white-space: pre-wrap; line-height: var(--leading-relaxed);">
                ${message.content}
            </div>
        `,
        footer: `
            <button class="btn btn-primary" id="close-btn">Fermer</button>
        `
    });

    document.getElementById('close-btn').addEventListener('click', closeBottomSheet);
}
