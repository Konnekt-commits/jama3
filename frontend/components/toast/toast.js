const icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
};

let toastId = 0;

function initToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            #toast-container {
                position: fixed;
                top: var(--spacing-lg);
                right: var(--spacing-lg);
                z-index: var(--z-toast);
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
                pointer-events: none;
            }

            @media (max-width: 639px) {
                #toast-container {
                    top: var(--spacing-md);
                    right: var(--spacing-md);
                    left: var(--spacing-md);
                }
            }

            .toast {
                display: flex;
                align-items: flex-start;
                gap: var(--spacing-md);
                padding: var(--spacing-md) var(--spacing-lg);
                background-color: var(--color-card-bg);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                pointer-events: auto;
                max-width: 400px;
                animation: toastEnter var(--transition-normal) ease forwards;
            }

            @media (max-width: 639px) {
                .toast {
                    max-width: 100%;
                }
            }

            .toast.removing {
                animation: toastExit var(--transition-fast) ease forwards;
            }

            .toast-icon {
                flex-shrink: 0;
                margin-top: 2px;
            }

            .toast.success .toast-icon {
                color: var(--color-success);
            }

            .toast.error .toast-icon {
                color: var(--color-error);
            }

            .toast.warning .toast-icon {
                color: var(--color-warning);
            }

            .toast.info .toast-icon {
                color: var(--color-info);
            }

            .toast-content {
                flex: 1;
                min-width: 0;
            }

            .toast-title {
                font-weight: var(--font-medium);
                font-size: var(--font-sm);
                margin-bottom: var(--spacing-xs);
            }

            .toast-message {
                font-size: var(--font-sm);
                color: var(--color-text-secondary);
            }

            .toast-close {
                flex-shrink: 0;
                padding: var(--spacing-xs);
                margin: calc(-1 * var(--spacing-xs));
                border-radius: var(--radius-sm);
                color: var(--color-text-muted);
                transition: all var(--transition-fast);
            }

            .toast-close:hover {
                background-color: var(--color-bg-hover);
                color: var(--color-text-primary);
            }

            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background-color: var(--color-primary);
                border-radius: 0 0 var(--radius-lg) var(--radius-lg);
                animation: toastProgress linear forwards;
            }

            @keyframes toastProgress {
                from {
                    width: 100%;
                }
                to {
                    width: 0%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    return container;
}

export function showToast(options) {
    const {
        type = 'info',
        title,
        message,
        duration = 4000,
        closable = true
    } = typeof options === 'string' ? { message: options } : options;

    const container = initToastContainer();
    const id = ++toastId;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = `toast-${id}`;
    toast.style.position = 'relative';

    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-content">
            ${title ? `<div class="toast-title">${title}</div>` : ''}
            <div class="toast-message">${message}</div>
        </div>
        ${closable ? `<button class="toast-close" data-toast-close="${id}">${icons.close}</button>` : ''}
        ${duration > 0 ? `<div class="toast-progress" style="animation-duration: ${duration}ms"></div>` : ''}
    `;

    container.appendChild(toast);

    if (closable) {
        toast.querySelector(`[data-toast-close="${id}"]`).addEventListener('click', () => {
            removeToast(id);
        });
    }

    if (duration > 0) {
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }

    return id;
}

function removeToast(id) {
    const toast = document.getElementById(`toast-${id}`);
    if (toast) {
        toast.classList.add('removing');
        setTimeout(() => {
            toast.remove();
        }, 150);
    }
}

export function toast(message, type = 'info') {
    return showToast({ message, type });
}

export const toastSuccess = (message, title) => showToast({ type: 'success', message, title });
export const toastError = (message, title) => showToast({ type: 'error', message, title });
export const toastWarning = (message, title) => showToast({ type: 'warning', message, title });
export const toastInfo = (message, title) => showToast({ type: 'info', message, title });
