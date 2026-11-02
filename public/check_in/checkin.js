document.addEventListener('DOMContentLoaded', () => {
    const API_URL = `${window.location.origin}/api/returns`;

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const checkinForm = document.getElementById('checkinForm');
    const activeSelect = document.getElementById('checkinActiveSelect');

    const quantityInput = checkinForm?.querySelector('input[type="number"]');
    const conditionSelect = checkinForm?.querySelectorAll('select')[1];
    const remarksInput = checkinForm?.querySelector('textarea');
    const submitBtn = checkinForm?.querySelector('button[type="submit"]');

    let confirmationCallback = null;

    const dialogStyles = document.createElement('style');

    dialogStyles.textContent = `
        .custom-dialog-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(15, 23, 42, 0.55);
            backdrop-filter: blur(4px);
        }

        .custom-dialog-overlay[hidden] {
            display: none;
        }

        .custom-dialog {
            width: 100%;
            max-width: 420px;
            padding: 28px;
            border-radius: 18px;
            background: var(--bg-card, #ffffff);
            color: var(--text-primary, #1e293b);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            animation: dialogAppear 0.2s ease;
        }

        @keyframes dialogAppear {
            from {
                opacity: 0;
                transform: translateY(10px) scale(0.98);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .custom-dialog-icon {
            width: 52px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 18px;
            border-radius: 14px;
            background: #eff6ff;
            color: #2563eb;
            font-size: 22px;
        }

        .custom-dialog-icon.success {
            background: #dcfce7;
            color: #16a34a;
        }

        .custom-dialog-icon.error {
            background: #fee2e2;
            color: #dc2626;
        }

        .custom-dialog h3 {
            margin: 0 0 10px;
            font-size: 20px;
            font-weight: 700;
        }

        .custom-dialog p {
            margin: 0;
            color: var(--text-muted, #64748b);
            line-height: 1.6;
            font-size: 14px;
        }

        .custom-dialog-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 25px;
        }

        .custom-dialog-actions button {
            padding: 11px 18px;
            border: none;
            border-radius: 9px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
        }

        .dialog-cancel {
            background: #e2e8f0;
            color: #334155;
        }

        .dialog-confirm {
            background: #2563eb;
            color: #ffffff;
        }

        .dialog-confirm:hover {
            background: #1d4ed8;
        }

        .dialog-cancel:hover {
            background: #cbd5e1;
        }

        body.dark-mode .custom-dialog-icon {
            background: #1e3a5f;
            color: #93c5fd;
        }

        body.dark-mode .custom-dialog-icon.success {
            background: #14532d;
            color: #86efac;
        }

        body.dark-mode .custom-dialog-icon.error {
            background: #7f1d1d;
            color: #fecaca;
        }

        body.dark-mode .dialog-cancel {
            background: #334155;
            color: #f8fafc;
        }
    `;

    document.head.appendChild(dialogStyles);

    const dialogOverlay = document.createElement('div');

    dialogOverlay.className = 'custom-dialog-overlay';
    dialogOverlay.hidden = true;

    dialogOverlay.innerHTML = `
        <div class="custom-dialog" role="dialog"
             aria-modal="true" aria-labelledby="dialogTitle">

            <div class="custom-dialog-icon" id="dialogIcon">
                <i class="fa-solid fa-circle-info"></i>
            </div>

            <h3 id="dialogTitle">Confirmation</h3>

            <p id="dialogMessage"></p>

            <div class="custom-dialog-actions">
                <button type="button" class="dialog-cancel" id="dialogCancel">
                    Cancel
                </button>

                <button type="button" class="dialog-confirm" id="dialogConfirm">
                    Confirm
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(dialogOverlay);

    const dialogTitle = dialogOverlay.querySelector('#dialogTitle');
    const dialogMessage = dialogOverlay.querySelector('#dialogMessage');
    const dialogIcon = dialogOverlay.querySelector('#dialogIcon');
    const dialogCancel = dialogOverlay.querySelector('#dialogCancel');
    const dialogConfirm = dialogOverlay.querySelector('#dialogConfirm');

    function closeDialog(value = false) {
        dialogOverlay.hidden = true;

        const callback = confirmationCallback;
        confirmationCallback = null;

        if (callback) callback(value);
    }

    function showConfirmation(message) {
        return new Promise(resolve => {
            confirmationCallback = resolve;

            dialogTitle.textContent = 'Confirm Book Return';
            dialogMessage.textContent = message;

            dialogIcon.className = 'custom-dialog-icon';
            dialogIcon.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';

            dialogCancel.hidden = false;
            dialogConfirm.textContent = 'Confirm Return';

            dialogOverlay.hidden = false;
        });
    }

    function showDialog(message, type = 'success') {
        confirmationCallback = null;

        dialogTitle.textContent =
            type === 'success' ? 'Success' : 'Notice';

        dialogMessage.textContent = message;

        dialogIcon.className = `custom-dialog-icon ${type}`;

        dialogIcon.innerHTML = type === 'success'
            ? '<i class="fa-solid fa-check"></i>'
            : '<i class="fa-solid fa-circle-exclamation"></i>';

        dialogCancel.hidden = true;
        dialogConfirm.textContent = 'OK';

        dialogOverlay.hidden = false;
    }

    dialogConfirm.addEventListener('click', () => {
        if (confirmationCallback) {
            closeDialog(true);
        } else {
            dialogOverlay.hidden = true;
        }
    });

    dialogCancel.addEventListener('click', () => {
        closeDialog(false);
    });

    dialogOverlay.addEventListener('click', event => {
        if (event.target === dialogOverlay) {
            closeDialog(false);
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !dialogOverlay.hidden) {
            closeDialog(false);
        }
    });

    function applyTheme() {
        const isDarkMode = localStorage.getItem('theme') === 'dark';

        document.body.classList.toggle('dark-mode', isDarkMode);

        if (themeToggleBtn) {
            themeToggleBtn.textContent = isDarkMode ? 'On' : 'Off';
        }
    }

    applyTheme();

    themeToggleBtn?.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');

        localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');

        applyTheme();
    });

    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '../login/login.html';
    });

    async function loadActiveBorrowings() {
        if (!activeSelect) return;

        activeSelect.innerHTML =
            '<option value="">Loading active borrowings...</option>';

        activeSelect.disabled = true;

        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/active`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Unable to load borrowing records.'
                );
            }

            activeSelect.innerHTML = '';

            if (!result.data || result.data.length === 0) {
                activeSelect.innerHTML =
                    '<option value="">No active books to return</option>';

                return;
            }

            result.data.forEach(record => {
                const option = document.createElement('option');

                option.value = record.borrow_id;

                option.textContent =
                    `${record.book_title} — ${record.student_name} ` +
                    `(${record.student_number}) — ` +
                    `${record.remaining_quantity} remaining`;

                option.dataset.remaining = record.remaining_quantity;

                activeSelect.appendChild(option);
            });

            activeSelect.disabled = false;

            updateQuantityLimit();

        } catch (error) {
            console.error('Load borrowing records error:', error);

            activeSelect.innerHTML =
                '<option value="">Failed to load borrowing records</option>';

            showDialog(error.message, 'error');

        } finally {
            if (submitBtn) {
                submitBtn.disabled = activeSelect.disabled ||
                    !activeSelect.value;
            }
        }
    }

    function updateQuantityLimit() {
        const selectedOption = activeSelect?.selectedOptions[0];

        if (!selectedOption || !quantityInput) return;

        const remaining = Number(selectedOption.dataset.remaining || 1);

        quantityInput.max = remaining;
        quantityInput.value = 1;
        quantityInput.min = 1;
    }

    activeSelect?.addEventListener('change', updateQuantityLimit);

    checkinForm?.addEventListener('submit', async event => {
        event.preventDefault();

        const borrowId = Number(activeSelect?.value);
        const quantityReturned = Number(quantityInput?.value);
        const itemCondition = conditionSelect?.value;
        const remarks = remarksInput?.value.trim() || '';

        const selectedOption = activeSelect?.selectedOptions[0];
        const remaining = Number(selectedOption?.dataset.remaining || 0);

        if (!borrowId) {
            showDialog('Please select an active borrowing record.', 'error');
            return;
        }

        if (
            !Number.isInteger(quantityReturned) ||
            quantityReturned < 1 ||
            quantityReturned > remaining
        ) {
            showDialog(
                `Please enter a valid quantity. Remaining copies: ${remaining}.`,
                'error'
            );
            return;
        }

        if (!['Good', 'Damaged', 'Lost'].includes(itemCondition)) {
            showDialog('Please select a valid item condition.', 'error');
            return;
        }

        const confirmed = await showConfirmation(
            `Are you sure you want to return ${quantityReturned} copy/copies?`
        );

        if (!confirmed) return;

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Processing...';
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    borrowId,
                    quantityReturned,
                    itemCondition,
                    remarks
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Return processing failed.'
                );
            }

            checkinForm.reset();

            if (remarksInput) {
                remarksInput.value = '';
            }

            await loadActiveBorrowings();

            showDialog(
                result.message || 'Book return completed successfully.',
                'success'
            );

        } catch (error) {
            console.error('Return processing error:', error);
            showDialog(error.message, 'error');

        } finally {
            if (submitBtn) {
                submitBtn.textContent = 'Complete Return';
                submitBtn.disabled = activeSelect?.disabled ||
                    !activeSelect?.value;
            }
        }
    });

    loadActiveBorrowings();
});