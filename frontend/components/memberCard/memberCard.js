const icons = {
    phone: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
    mail: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    moreVertical: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>`
};

export function initMemberCardStyles() {
    if (document.getElementById('member-card-styles')) return;

    const style = document.createElement('style');
    style.id = 'member-card-styles';
    style.textContent = `
        .member-card {
            background-color: var(--color-card-bg);
            border: 1px solid var(--color-card-border);
            border-radius: var(--radius-lg);
            padding: var(--spacing-lg);
            cursor: pointer;
            transition: all var(--transition-fast);
            overflow: hidden;
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
        }

        .member-card:hover {
            box-shadow: var(--shadow-md);
            border-color: var(--color-primary);
        }

        .member-card-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-md);
        }

        .member-card-avatar {
            width: 56px;
            height: 56px;
            border-radius: var(--radius-full);
            background-color: var(--color-primary-light);
            color: var(--color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: var(--font-bold);
            font-size: var(--font-lg);
            flex-shrink: 0;
        }

        .member-card-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: var(--radius-full);
        }

        .member-card-info {
            flex: 1;
            min-width: 0;
        }

        .member-card-info h3 {
            font-weight: var(--font-semibold);
            margin-bottom: var(--spacing-xs);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .member-card-number {
            font-size: var(--font-sm);
            color: var(--color-text-muted);
        }

        .member-card-meta {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-sm);
            padding-top: var(--spacing-md);
            border-top: 1px solid var(--color-border);
        }

        .member-card-meta-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-size: var(--font-sm);
            color: var(--color-text-secondary);
            max-width: 100%;
            overflow: hidden;
        }

        .member-card-meta-item svg {
            width: 16px;
            height: 16px;
            color: var(--color-text-muted);
            flex-shrink: 0;
        }

        .member-card-meta-item span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .status-badge {
            padding: var(--spacing-xs) var(--spacing-sm);
            font-size: var(--font-xs);
            border-radius: var(--radius-full);
            font-weight: var(--font-medium);
        }

        .status-badge.actif {
            background-color: var(--color-success-light);
            color: var(--color-success);
        }

        .status-badge.inactif {
            background-color: var(--color-error-light);
            color: var(--color-error);
        }

        .status-badge.suspendu {
            background-color: var(--color-warning-light);
            color: var(--color-warning);
        }

        .status-badge.archive {
            background-color: var(--color-bg-tertiary);
            color: var(--color-text-muted);
        }

        /* Compact version */
        .member-card-compact {
            padding: var(--spacing-md);
        }

        .member-card-compact .member-card-avatar {
            width: 44px;
            height: 44px;
            font-size: var(--font-base);
        }

        .member-card-compact .member-card-header {
            margin-bottom: var(--spacing-sm);
        }

        .member-card-compact .member-card-meta {
            padding-top: var(--spacing-sm);
        }
    `;
    document.head.appendChild(style);
}

export function createMemberCard(member, options = {}) {
    const {
        compact = false,
        onClick = null,
        onMenuClick = null,
        showStatus = true
    } = options;

    initMemberCardStyles();

    const initials = (member.first_name[0] + member.last_name[0]).toUpperCase();

    const statusLabels = {
        actif: 'Actif',
        inactif: 'Inactif',
        suspendu: 'Suspendu',
        archive: 'Archivé'
    };

    const card = document.createElement('div');
    card.className = `member-card ${compact ? 'member-card-compact' : ''}`;
    card.dataset.memberId = member.id;

    const hasContact = member.phone || member.email;

    card.innerHTML = `
        <div class="member-card-header">
            <div class="member-card-avatar">
                ${member.photo_url ? `<img src="${member.photo_url}" alt="${member.first_name}">` : initials}
            </div>
            <div class="member-card-info">
                <h3>${member.first_name} ${member.last_name}</h3>
                <p class="member-card-number">${member.member_number || 'N° en attente'}</p>
            </div>
            ${showStatus ? `<span class="status-badge ${member.status}">${statusLabels[member.status] || member.status}</span>` : ''}
        </div>
        ${hasContact ? `
            <div class="member-card-meta">
                ${member.email ? `
                    <span class="member-card-meta-item">
                        ${icons.mail}
                        <span>${member.email}</span>
                    </span>
                ` : ''}
                ${member.phone ? `
                    <span class="member-card-meta-item">
                        ${icons.phone}
                        <span>${member.phone}</span>
                    </span>
                ` : ''}
            </div>
        ` : ''}
    `;

    if (onClick) {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.member-card-menu')) {
                onClick(member);
            }
        });
    }

    if (onMenuClick) {
        card.querySelector('.member-card-menu')?.addEventListener('click', (e) => {
            e.stopPropagation();
            onMenuClick(member, e.currentTarget);
        });
    }

    return card;
}

export function createMemberList(members, options = {}) {
    const container = document.createElement('div');
    container.className = 'grid gap-md';

    members.forEach(member => {
        container.appendChild(createMemberCard(member, options));
    });

    return container;
}
