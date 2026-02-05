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

        /* ========== Detail Panel Styles ========== */
        .detail-section {
            margin-bottom: var(--spacing-lg);
            padding-bottom: var(--spacing-lg);
            border-bottom: 1px solid var(--color-border);
        }

        .detail-section:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }

        .detail-section h4 {
            font-size: var(--font-base);
            font-weight: var(--font-semibold);
            color: var(--color-text-primary);
            margin-bottom: var(--spacing-md);
            padding-bottom: var(--spacing-xs);
            border-bottom: 2px solid var(--color-success);
            display: inline-block;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-md);
        }

        @media (max-width: 480px) {
            .detail-grid {
                grid-template-columns: 1fr;
            }
        }

        .detail-item {
            background-color: var(--color-bg-secondary);
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--radius-md);
            border-left: 3px solid var(--color-primary);
        }

        .detail-label {
            display: block;
            font-size: var(--font-xs);
            color: var(--color-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: var(--spacing-xs);
        }

        .detail-value {
            display: block;
            font-size: var(--font-base);
            font-weight: var(--font-medium);
            color: var(--color-text-primary);
        }

        .detail-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
        }

        .detail-list-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--spacing-sm) var(--spacing-md);
            background-color: var(--color-bg-secondary);
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border);
        }

        .detail-list-item:hover {
            background-color: var(--color-bg-hover);
        }

        .text-muted {
            color: var(--color-text-muted);
            font-size: var(--font-sm);
        }

        /* Form styles for bottomsheet */
        .form-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-md);
        }

        @media (max-width: 480px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }

        .form-group {
            margin-bottom: var(--spacing-md);
        }

        .form-label {
            display: block;
            font-size: var(--font-sm);
            font-weight: var(--font-medium);
            color: var(--color-text-secondary);
            margin-bottom: var(--spacing-xs);
        }

        .form-input,
        .form-select,
        .form-textarea {
            width: 100%;
            padding: var(--spacing-sm) var(--spacing-md);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            background-color: var(--color-input-bg);
            font-size: var(--font-base);
            color: var(--color-text-primary);
            transition: border-color var(--transition-fast);
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px var(--color-primary-light);
        }

        .form-textarea {
            resize: vertical;
            min-height: 80px;
        }

        .form-divider {
            display: flex;
            align-items: center;
            margin: var(--spacing-lg) 0;
            color: var(--color-text-muted);
            font-size: var(--font-sm);
        }

        .form-divider::before,
        .form-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background-color: var(--color-border);
        }

        .form-divider span {
            padding: 0 var(--spacing-md);
        }

        /* Checkbox list */
        .checkbox-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs);
        }

        .checkbox-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--radius-sm);
            cursor: pointer;
        }

        .checkbox-item:hover {
            background-color: var(--color-bg-hover);
        }

        .checkbox-item input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: var(--color-success);
        }

        /* Button styles */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs);
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--radius-md);
            font-size: var(--font-sm);
            font-weight: var(--font-medium);
            cursor: pointer;
            transition: all var(--transition-fast);
            border: none;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%);
            color: var(--color-white);
        }

        .btn-primary:hover {
            box-shadow: var(--shadow-md);
            transform: translateY(-1px);
        }

        .btn-secondary {
            background-color: var(--color-bg-secondary);
            color: var(--color-text-primary);
            border: 1px solid var(--color-border);
        }

        .btn-secondary:hover {
            background-color: var(--color-bg-hover);
        }

        .btn-danger {
            background-color: var(--color-error);
            color: var(--color-white);
        }

        .btn-danger:hover {
            background-color: var(--color-error-hover);
        }

        .btn-sm {
            padding: var(--spacing-xs) var(--spacing-sm);
            font-size: var(--font-xs);
        }

        .loading {
            text-align: center;
            padding: var(--spacing-xl);
            color: var(--color-text-muted);
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
