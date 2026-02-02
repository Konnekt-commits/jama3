const icons = {
    close: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
};

let sheetInstance = null;

function initBottomSheetStyles() {
    if (document.getElementById('bottom-sheet-styles')) return;

    const style = document.createElement('style');
    style.id = 'bottom-sheet-styles';
    style.textContent = `
        .bottom-sheet-backdrop {
            position: fixed;
            inset: 0;
            background-color: var(--color-modal-backdrop);
            z-index: var(--z-modal-backdrop);
            opacity: 0;
            transition: opacity var(--transition-normal);
        }

        .bottom-sheet-backdrop.visible {
            opacity: 1;
        }

        .bottom-sheet {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            max-height: 90vh;
            background-color: var(--color-modal-bg);
            border-radius: var(--radius-xl) var(--radius-xl) 0 0;
            z-index: var(--z-modal);
            transform: translateY(100%);
            transition: transform var(--transition-normal);
            display: flex;
            flex-direction: column;
        }

        .bottom-sheet.visible {
            transform: translateY(0);
        }

        .bottom-sheet-handle {
            display: flex;
            justify-content: center;
            padding: var(--spacing-sm) 0;
        }

        .bottom-sheet-handle-bar {
            width: 40px;
            height: 4px;
            background-color: var(--color-border);
            border-radius: var(--radius-full);
        }

        /* ========== PC: Right Panel ========== */
        @media (min-width: 1024px) {
            .bottom-sheet {
                top: 0;
                bottom: 0;
                right: 0;
                left: auto;
                width: 480px;
                max-width: 90vw;
                max-height: 100vh;
                height: 100vh;
                border-radius: 0;
                transform: translateX(100%);
                box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
            }

            .bottom-sheet.visible {
                transform: translateX(0);
            }

            .bottom-sheet-handle {
                display: none;
            }
        }

        /* Large screens: wider panel */
        @media (min-width: 1440px) {
            .bottom-sheet {
                width: 560px;
            }
        }

        .bottom-sheet-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--spacing-md) var(--spacing-lg);
            border-bottom: 1px solid var(--color-border);
            background-image: var(--pattern-geometric);
            position: relative;
            flex-shrink: 0;
        }

        .bottom-sheet-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 10%;
            right: 10%;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--color-primary), var(--color-warning), var(--color-primary), transparent);
            opacity: 0.6;
        }

        .bottom-sheet-title {
            font-size: var(--font-lg);
            font-weight: var(--font-semibold);
        }

        .bottom-sheet-close {
            padding: var(--spacing-xs);
            border-radius: var(--radius-md);
            color: var(--color-text-muted);
            transition: all var(--transition-fast);
        }

        .bottom-sheet-close:hover {
            background-color: var(--color-bg-hover);
            color: var(--color-text-primary);
        }

        .bottom-sheet-body {
            flex: 1;
            padding: var(--spacing-md);
            overflow-y: auto;
            overflow-x: hidden;
        }

        @media (min-width: 480px) {
            .bottom-sheet-body {
                padding: var(--spacing-lg);
            }
        }

        /* PC: More padding in body */
        @media (min-width: 1024px) {
            .bottom-sheet-header {
                padding: var(--spacing-lg) var(--spacing-xl);
            }

            .bottom-sheet-body {
                padding: var(--spacing-xl);
            }
        }

        .bottom-sheet-footer {
            display: flex;
            gap: var(--spacing-md);
            padding: var(--spacing-md) var(--spacing-lg);
            border-top: 1px solid var(--color-border);
            flex-shrink: 0;
        }

        .bottom-sheet-footer .btn {
            flex: 1;
        }

        /* PC: Footer styling */
        @media (min-width: 1024px) {
            .bottom-sheet-footer {
                padding: var(--spacing-lg) var(--spacing-xl);
            }
        }
    `;
    document.head.appendChild(style);
}

export function openBottomSheet(options) {
    const {
        title = '',
        content = '',
        footer = '',
        onClose = null,
        closeOnBackdrop = true
    } = options;

    initBottomSheetStyles();

    if (sheetInstance) {
        closeBottomSheet();
    }

    const container = document.getElementById('bottom-sheet-container');

    const backdrop = document.createElement('div');
    backdrop.className = 'bottom-sheet-backdrop';
    backdrop.id = 'bottom-sheet-backdrop';

    const sheet = document.createElement('div');
    sheet.className = 'bottom-sheet';
    sheet.id = 'bottom-sheet';

    sheet.innerHTML = `
        <div class="bottom-sheet-handle">
            <div class="bottom-sheet-handle-bar"></div>
        </div>
        <div class="bottom-sheet-header">
            <h2 class="bottom-sheet-title">${title}</h2>
            <button class="bottom-sheet-close" id="bottom-sheet-close">
                ${icons.close}
            </button>
        </div>
        <div class="bottom-sheet-body" id="bottom-sheet-body">
            ${content}
        </div>
        ${footer ? `<div class="bottom-sheet-footer">${footer}</div>` : ''}
    `;

    container.appendChild(backdrop);
    container.appendChild(sheet);

    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
        backdrop.classList.add('visible');
        sheet.classList.add('visible');
    });

    sheetInstance = {
        backdrop,
        sheet,
        onClose
    };

    document.getElementById('bottom-sheet-close').addEventListener('click', closeBottomSheet);

    if (closeOnBackdrop) {
        backdrop.addEventListener('click', closeBottomSheet);
    }

    document.addEventListener('keydown', handleEscKey);

    return {
        close: closeBottomSheet,
        getBody: () => document.getElementById('bottom-sheet-body')
    };
}

function handleEscKey(e) {
    if (e.key === 'Escape' && sheetInstance) {
        closeBottomSheet();
    }
}

export function closeBottomSheet() {
    if (!sheetInstance) return;

    const { backdrop, sheet, onClose } = sheetInstance;

    backdrop.classList.remove('visible');
    sheet.classList.remove('visible');

    setTimeout(() => {
        backdrop.remove();
        sheet.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscKey);

        if (onClose) {
            onClose();
        }
    }, 250);

    sheetInstance = null;
}

export function updateBottomSheetContent(content) {
    const body = document.getElementById('bottom-sheet-body');
    if (body) {
        body.innerHTML = content;
    }
}
