
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/students';
    const FINES_API_URL = '/api/fines';

    const tableBody = document.getElementById('studentTableBody');
    const registerForm = document.getElementById('registerForm');
    const registerCard = document.getElementById('registerCard');
    const messageBox = document.getElementById('messageBox');
    const searchInput = document.getElementById('searchInput');
    const studentCount = document.getElementById('studentCount');

    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const cancelRegisterBtn = document.getElementById('cancelRegisterBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const submitBtn = document.getElementById('submitBtn');

    const formTitle = document.getElementById('formTitle');
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    const totalStudents = document.getElementById('totalStudents');
    const totalBorrowers = document.getElementById('totalBorrowers');
    const studentsOnly = document.getElementById('studentsOnly');

    const deleteModal = document.getElementById('deleteModal');
    const deleteModalTitle = document.getElementById('deleteModalTitle');
    const deleteModalMessage = document.getElementById('deleteModalMessage');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');

    // FINES ELEMENTS
    const finesModal = document.getElementById('finesModal');
    const closeFinesModalBtn = document.getElementById('closeFinesModalBtn');
    const closeFinesFooterBtn = document.getElementById('closeFinesFooterBtn');

    const finesStudentInfo = document.getElementById('finesStudentInfo');
    const finesTotalAmount = document.getElementById('finesTotalAmount');
    const finesTotalPaid = document.getElementById('finesTotalPaid');
    const finesTotalBalance = document.getElementById('finesTotalBalance');

    const finesTableBody = document.getElementById('finesTableBody');
    const paymentHistoryBody = document.getElementById('paymentHistoryBody');

    const finePaymentSection = document.getElementById('finePaymentSection');
    const selectedFineInfo = document.getElementById('selectedFineInfo');

    const paymentForm = document.getElementById('paymentForm');
    const paymentAmount = document.getElementById('paymentAmount');
    const paymentMethod = document.getElementById('paymentMethod');
    const paymentMessage = document.getElementById('paymentMessage');
    const submitPaymentBtn = document.getElementById('submitPaymentBtn');
    const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');

    let students = [];
    let editingStudentId = null;
    let messageTimeout;
    let pendingDeleteStudentId = null;

    let currentFinesStudent = null;
    let currentFines = [];
    let selectedFine = null;
    let paymentMessageTimeout;



    function updateThemeStatus() {
        const isDark = document.body.classList.contains('dark-mode');

        if (themeToggleBtn) {
            themeToggleBtn.textContent = isDark ? 'On' : 'Off';
            themeToggleBtn.setAttribute('aria-pressed', String(isDark));
        }
    }

    function applyTheme() {
        const isDark = localStorage.getItem('theme') === 'dark';

        document.body.classList.toggle('dark-mode', isDark);
        updateThemeStatus();
    }

    applyTheme();

    themeToggleBtn?.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark-mode');

        document.body.classList.toggle('dark-mode', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        updateThemeStatus();
    });



    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '../login/login.html';
    });



    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
    }



    function showMessage(message, type = 'success') {
        if (!messageBox) return;

        clearTimeout(messageTimeout);

        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;

        messageTimeout = window.setTimeout(() => {
            messageBox.className = 'message-box';
            messageBox.textContent = '';
        }, 4000);
    }

    function showPaymentMessage(message, type = 'success') {
        if (!paymentMessage) return;

        clearTimeout(paymentMessageTimeout);

        paymentMessage.textContent = message;
        paymentMessage.className = `message-box ${type}`;

        paymentMessageTimeout = window.setTimeout(() => {
            paymentMessage.className = 'message-box';
            paymentMessage.textContent = '';
        }, 4000);
    }



    function formatCurrency(value) {
        const amount = Number(value) || 0;

        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    }

    function formatDate(value) {
        if (!value) return '—';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return escapeHTML(value);
        }

        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }



    function openFinesModal() {
        finesModal.classList.add('show');
        finesModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeFinesModal() {
        if (!finesModal) return;

        finesModal.classList.remove('show');
        finesModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        currentFinesStudent = null;
        currentFines = [];
        selectedFine = null;

        paymentForm?.reset();

        if (finePaymentSection) {
            finePaymentSection.hidden = true;
        }

        if (paymentMessage) {
            paymentMessage.textContent = '';
            paymentMessage.className = 'message-box';
        }
    }

    closeFinesModalBtn?.addEventListener('click', closeFinesModal);
    closeFinesFooterBtn?.addEventListener('click', closeFinesModal);

    finesModal?.addEventListener('click', event => {
        if (event.target === finesModal) {
            closeFinesModal();
        }
    });



    async function openStudentFines(studentId) {
        const student = students.find(item =>
            Number(item.student_id) === Number(studentId)
        );

        if (!student) {
            showMessage('Student record not found.', 'error');
            return;
        }

        currentFinesStudent = student;
        currentFines = [];
        selectedFine = null;

        finesStudentInfo.textContent =
            `${student.student_name} | Student No. ${student.student_number}`;

        finesTotalAmount.textContent = formatCurrency(0);
        finesTotalPaid.textContent = formatCurrency(0);
        finesTotalBalance.textContent = formatCurrency(0);

        finesTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="fines-empty">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Loading fine records...
                </td>
            </tr>
        `;

        paymentHistoryBody.innerHTML = `
            <tr>
                <td colspan="5" class="fines-empty">
                    Select a fine to view its payment history.
                </td>
            </tr>
        `;

        finePaymentSection.hidden = true;

        openFinesModal();

        try {
            const response = await fetch(
                `${FINES_API_URL}/student/${studentId}`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Unable to load student fines.'
                );
            }

            currentFines = Array.isArray(result.data) ? result.data : [];

            displayFines(currentFines);

        } catch (error) {
            console.error('Load student fines error:', error);

            finesTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="fines-empty">
                        ${escapeHTML(error.message)}
                    </td>
                </tr>
            `;
        }
    }



    function updateFinesSummary(fines) {
        const totalAmount = fines.reduce(
            (total, fine) => total + Number(fine.amount || 0),
            0
        );

        const totalPaid = fines.reduce(
            (total, fine) => total + Number(fine.amount_paid || 0),
            0
        );

        const totalBalance = fines.reduce(
            (total, fine) => total + Number(fine.balance || 0),
            0
        );

        finesTotalAmount.textContent = formatCurrency(totalAmount);
        finesTotalPaid.textContent = formatCurrency(totalPaid);
        finesTotalBalance.textContent = formatCurrency(totalBalance);
    }



    function displayFines(fines) {
        updateFinesSummary(fines);

        if (!fines.length) {
            finesTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="fines-empty">
                        <i class="fa-solid fa-circle-check"></i>
                        No fine records found for this student.
                    </td>
                </tr>
            `;
            return;
        }

        finesTableBody.innerHTML = fines.map(fine => {
            const status = String(fine.status || 'Unpaid').toLowerCase();

            const statusClass = status === 'paid'
                ? 'paid'
                : status === 'partially paid'
                    ? 'partial'
                    : 'unpaid';

            const balance = Number(fine.balance || 0);

            return `
                <tr>
                    <td>${Number(fine.fine_id)}</td>
                    <td>${Number(fine.borrow_id)}</td>
                    <td>${escapeHTML(fine.reason || '—')}</td>
                    <td>${formatCurrency(fine.amount)}</td>
                    <td>${formatCurrency(fine.amount_paid)}</td>
                    <td>${formatCurrency(fine.balance)}</td>
                    <td>
                        <span class="fine-status ${statusClass}">
                            ${escapeHTML(fine.status || 'Unpaid')}
                        </span>
                    </td>
                    <td>
                        ${
                            balance > 0
                                ? `
                                    <button
                                        type="button"
                                        class="btn-primary"
                                        data-fine-action="payment"
                                        data-fine-id="${Number(fine.fine_id)}">
                                        <i class="fa-solid fa-credit-card"></i>
                                        Pay
                                    </button>
                                `
                                : '<span class="fine-status paid">Completed</span>'
                        }
                    </td>
                </tr>
            `;
        }).join('');
    }



    function selectFine(fineId) {
        const fine = currentFines.find(item =>
            Number(item.fine_id) === Number(fineId)
        );

        if (!fine) {
            showPaymentMessage('Fine record not found.', 'error');
            return;
        }

        const balance = Number(fine.balance || 0);

        if (balance <= 0) {
            showPaymentMessage('This fine has already been paid.', 'info');
            return;
        }

        selectedFine = fine;

        finePaymentSection.hidden = false;

        selectedFineInfo.textContent =
            `Fine #${fine.fine_id} | Remaining balance: ${formatCurrency(balance)}`;

        paymentAmount.value = '';
        paymentAmount.min = '0.01';
        paymentAmount.max = balance.toFixed(2);
        paymentAmount.placeholder = `Maximum: ${formatCurrency(balance)}`;

        paymentMethod.value = '';

        paymentMessage.textContent = '';
        paymentMessage.className = 'message-box';

        loadPaymentHistory(fine.fine_id);

        finePaymentSection.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }



    finesTableBody?.addEventListener('click', event => {
        const button = event.target.closest(
            'button[data-fine-action="payment"]'
        );

        if (!button) return;

        selectFine(Number(button.dataset.fineId));
    });



    async function loadPaymentHistory(fineId) {
        paymentHistoryBody.innerHTML = `
            <tr>
                <td colspan="5" class="fines-empty">
                    Loading payment history...
                </td>
            </tr>
        `;

        try {
            const response = await fetch(
                `${FINES_API_URL}/${fineId}/payments`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Unable to load payment history.'
                );
            }

            const payments = Array.isArray(result.data)
                ? result.data
                : [];

            displayPaymentHistory(payments, fineId);

        } catch (error) {
            console.error('Payment history error:', error);

            paymentHistoryBody.innerHTML = `
                <tr>
                    <td colspan="5" class="fines-empty">
                        ${escapeHTML(error.message)}
                    </td>
                </tr>
            `;
        }
    }



    function displayPaymentHistory(payments, fineId) {
        if (!payments.length) {
            paymentHistoryBody.innerHTML = `
                <tr>
                    <td colspan="5" class="fines-empty">
                        No payments have been recorded for this fine.
                    </td>
                </tr>
            `;
            return;
        }

        paymentHistoryBody.innerHTML = payments.map(payment => `
            <tr>
                <td>${Number(payment.payment_id)}</td>
                <td>${Number(payment.fine_id || fineId)}</td>
                <td>${formatCurrency(payment.amount_paid)}</td>
                <td>${escapeHTML(payment.payment_method || '—')}</td>
                <td>${formatDate(payment.payment_date)}</td>
            </tr>
        `).join('');
    }


    paymentForm?.addEventListener('submit', async event => {
        event.preventDefault();

        if (!selectedFine) {
            showPaymentMessage('Please select a fine first.', 'error');
            return;
        }

        const amount = Number(paymentAmount.value);
        const balance = Number(selectedFine.balance || 0);
        const method = paymentMethod.value;

        if (!Number.isFinite(amount) || amount <= 0) {
            showPaymentMessage(
                'Enter a valid payment amount.',
                'error'
            );
            return;
        }

        if (amount > balance + 0.000001) {
            showPaymentMessage(
                `Payment cannot exceed the remaining balance of ${formatCurrency(balance)}.`,
                'error'
            );
            return;
        }

        if (!Number.isInteger(amount * 100)) {
            showPaymentMessage(
                'Payment amount can only have up to two decimal places.',
                'error'
            );
            return;
        }

        submitPaymentBtn.disabled = true;
        submitPaymentBtn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

        try {
            const response = await fetch(
                `${FINES_API_URL}/${selectedFine.fine_id}/payments`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount_paid: amount,
                        payment_method: method || 'Cash'
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Unable to record payment.'
                );
            }

            const studentId = currentFinesStudent.student_id;
            const fineId = selectedFine.fine_id;

            showPaymentMessage(
                result.message || 'Payment recorded successfully.',
                'success'
            );

            paymentForm.reset();

            const finesResponse = await fetch(
                `${FINES_API_URL}/student/${studentId}`
            );

            const finesResult = await finesResponse.json();

            if (!finesResponse.ok || !finesResult.success) {
                throw new Error(
                    finesResult.message || 'Payment saved, but fines could not be refreshed.'
                );
            }

            currentFines = Array.isArray(finesResult.data)
                ? finesResult.data
                : [];

            displayFines(currentFines);

            selectedFine = currentFines.find(item =>
                Number(item.fine_id) === Number(fineId)
            ) || null;

            if (selectedFine && Number(selectedFine.balance) > 0) {
                selectedFineInfo.textContent =
                    `Fine #${selectedFine.fine_id} | Remaining balance: ${formatCurrency(selectedFine.balance)}`;

                paymentAmount.max = Number(selectedFine.balance).toFixed(2);
                paymentAmount.placeholder =
                    `Maximum: ${formatCurrency(selectedFine.balance)}`;
            } else {
                finePaymentSection.hidden = true;
                selectedFine = null;
            }

            await loadPaymentHistory(fineId);

        } catch (error) {
            console.error('Record payment error:', error);
            showPaymentMessage(error.message, 'error');

        } finally {
            submitPaymentBtn.disabled = false;
            submitPaymentBtn.innerHTML =
                '<i class="fa-solid fa-check"></i> Record Payment';
        }
    });

    cancelPaymentBtn?.addEventListener('click', () => {
        finePaymentSection.hidden = true;
        paymentForm.reset();
        selectedFine = null;
    });



    function openDeleteModal(student) {
        if (!deleteModal) {
            showMessage(
                'Delete confirmation modal is missing from the page.',
                'error'
            );
            return;
        }

        pendingDeleteStudentId = Number(student.student_id);

        deleteModalTitle.textContent = 'Delete Student?';

        deleteModalMessage.textContent =
            `Are you sure you want to delete ${student.student_name} (${student.student_number})?`;

        confirmDeleteBtn.hidden = false;
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Delete Student';

        cancelDeleteBtn.textContent = 'Cancel';

        deleteModal.classList.add('show');
        deleteModal.setAttribute('aria-hidden', 'false');

        document.body.classList.add('modal-open');

        cancelDeleteBtn?.focus();
    }

    function closeDeleteModal() {
        if (!deleteModal) return;

        deleteModal.classList.remove('show');
        deleteModal.setAttribute('aria-hidden', 'true');

        document.body.classList.remove('modal-open');

        pendingDeleteStudentId = null;

        confirmDeleteBtn.hidden = false;
        cancelDeleteBtn.textContent = 'Cancel';
    }

    function showLinkedRecordsMessage() {
        deleteModalTitle.textContent = 'Student Has Library Records';

        deleteModalMessage.textContent =
            'This student cannot be permanently deleted because the account is connected to library records, such as borrower registration, borrowing transactions, or fines. Keeping this record protects the library history.';

        confirmDeleteBtn.hidden = true;
        cancelDeleteBtn.textContent = 'Close';
    }

    cancelDeleteBtn?.addEventListener('click', closeDeleteModal);
    closeDeleteModalBtn?.addEventListener('click', closeDeleteModal);

    deleteModal?.addEventListener('click', event => {
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;

        if (finesModal?.classList.contains('show')) {
            closeFinesModal();
        } else if (deleteModal?.classList.contains('show')) {
            closeDeleteModal();
        }
    });



    function openForm() {
        registerCard.hidden = false;

        document.getElementById('studentNumber').focus();

        registerCard.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    function closeForm() {
        registerCard.hidden = true;
        registerForm.reset();
        editingStudentId = null;

        formTitle.textContent = 'Register New Student';

        submitBtn.innerHTML =
            '<i class="fa-solid fa-user-plus"></i> Register Student';
    }

    showRegisterBtn.addEventListener('click', () => {
        editingStudentId = null;
        registerForm.reset();

        formTitle.textContent = 'Register New Student';

        submitBtn.innerHTML =
            '<i class="fa-solid fa-user-plus"></i> Register Student';

        openForm();
    });

    cancelRegisterBtn.addEventListener('click', closeForm);
    closeFormBtn.addEventListener('click', closeForm);



    function updateStatistics() {
        const borrowerCount = students.filter(student =>
            Number(student.is_borrower) === 1
        ).length;

        const studentOnlyCount = students.length - borrowerCount;

        if (totalStudents) totalStudents.textContent = students.length;
        if (totalBorrowers) totalBorrowers.textContent = borrowerCount;
        if (studentsOnly) studentsOnly.textContent = studentOnlyCount;
    }



    async function loadStudents() {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">Loading students...</td>
            </tr>
        `;

        try {
            const response = await fetch(API_URL);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Failed to load students.'
                );
            }

            students = Array.isArray(result.data) ? result.data : [];

            updateStatistics();
            filterStudents();

        } catch (error) {
            console.error('Load students error:', error);

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">Unable to load students.</td>
                </tr>
            `;

            studentCount.textContent = '0 students';
            showMessage(error.message, 'error');
        }
    }



    function displayStudents(list) {
        studentCount.textContent =
            `${list.length} student${list.length === 1 ? '' : 's'}`;

        if (list.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">No students found.</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = list.map(student => {
            const isBorrower = Number(student.is_borrower) === 1;

            return `
                <tr>
                    <td>${escapeHTML(student.student_number)}</td>
                    <td>${escapeHTML(student.student_name)}</td>
                    <td>${escapeHTML(student.email || '—')}</td>
                    <td>${escapeHTML(student.course || '—')}</td>
                    <td>${escapeHTML(student.year_level || '—')}</td>
                    <td>${escapeHTML(student.contact_number || '—')}</td>
                    <td>
                        ${
                            isBorrower
                                ? '<span class="status-badge status-borrower">Registered Borrower</span>'
                                : '<span class="status-badge status-student">Student Only</span>'
                        }
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button
                                type="button"
                                class="action-btn edit"
                                data-action="edit"
                                data-id="${Number(student.student_id)}"
                                title="Edit student">
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button
                                type="button"
                                class="action-btn fines"
                                data-action="fines"
                                data-id="${Number(student.student_id)}"
                                title="View student fines">
                                <i class="fa-solid fa-money-bill-wave"></i>
                            </button>

                            <button
                                type="button"
                                class="action-btn delete"
                                data-action="delete"
                                data-id="${Number(student.student_id)}"
                                title="Delete student">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }



    function filterStudents() {
        const search = searchInput.value.toLowerCase().trim();

        const filtered = students.filter(student => {
            return [
                student.student_number,
                student.student_name,
                student.email,
                student.course,
                student.year_level,
                student.contact_number
            ].some(value =>
                String(value || '').toLowerCase().includes(search)
            );
        });

        displayStudents(filtered);
    }

    searchInput.addEventListener('input', filterStudents);



    function getFormData() {
        return {
            student_number: document.getElementById('studentNumber').value.trim(),
            student_name: document.getElementById('studentName').value.trim(),
            email: document.getElementById('email').value.trim(),
            course: document.getElementById('course').value.trim(),
            year_level: document.getElementById('yearLevel').value,
            contact_number: document.getElementById('contactNumber').value.trim()
        };
    }



    registerForm.addEventListener('submit', async event => {
        event.preventDefault();

        const student = getFormData();
        const isEditing = editingStudentId !== null;
        const currentStudentId = editingStudentId;

        const url = isEditing
            ? `${API_URL}/${currentStudentId}`
            : API_URL;

        submitBtn.disabled = true;

        submitBtn.textContent = isEditing
            ? 'Saving Changes...'
            : 'Registering...';

        try {
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(student)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Unable to save student.'
                );
            }

            closeForm();

            showMessage(
                result.message || (
                    isEditing
                        ? 'Student information updated successfully.'
                        : 'Student registered successfully.'
                ),
                'success'
            );

            await loadStudents();

        } catch (error) {
            console.error('Save student error:', error);
            showMessage(error.message, 'error');

        } finally {
            submitBtn.disabled = false;

            submitBtn.innerHTML = editingStudentId !== null
                ? '<i class="fa-solid fa-floppy-disk"></i> Save Changes'
                : '<i class="fa-solid fa-user-plus"></i> Register Student';
        }
    });



    function editStudent(studentId) {
        const student = students.find(item =>
            Number(item.student_id) === Number(studentId)
        );

        if (!student) {
            showMessage('Student record not found.', 'error');
            return;
        }

        editingStudentId = Number(studentId);

        document.getElementById('studentNumber').value =
            student.student_number || '';

        document.getElementById('studentName').value =
            student.student_name || '';

        document.getElementById('email').value =
            student.email || '';

        document.getElementById('course').value =
            student.course || '';

        document.getElementById('yearLevel').value =
            student.year_level || '';

        document.getElementById('contactNumber').value =
            student.contact_number || '';

        formTitle.textContent = 'Edit Student Information';

        submitBtn.innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> Save Changes';

        openForm();
    }



    async function deleteStudent(studentId) {
        const student = students.find(item =>
            Number(item.student_id) === Number(studentId)
        );

        if (!student) {
            showMessage('Student record not found.', 'error');
            return;
        }

        openDeleteModal(student);
    }

    async function confirmDeleteStudent() {
        if (!pendingDeleteStudentId) return;

        const studentId = pendingDeleteStudentId;

        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.textContent = 'Deleting...';

        try {
            const response = await fetch(`${API_URL}/${studentId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                const message = result.message ||
                    'Unable to delete student.';

                if (
                    response.status === 409 ||
                    /linked|foreign key|constraint|library records/i.test(message)
                ) {
                    showLinkedRecordsMessage();
                    return;
                }

                throw new Error(message);
            }

            closeDeleteModal();

            showMessage(
                result.message || 'Student deleted successfully.',
                'success'
            );

            await loadStudents();

        } catch (error) {
            console.error('Delete student error:', error);
            closeDeleteModal();
            showMessage(error.message, 'error');

        } finally {
            if (confirmDeleteBtn) {
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.textContent = 'Delete Student';
            }
        }
    }

    confirmDeleteBtn?.addEventListener(
        'click',
        confirmDeleteStudent
    );



    tableBody.addEventListener('click', event => {
        const button = event.target.closest('button[data-action]');

        if (!button) return;

        const studentId = Number(button.dataset.id);

        if (button.dataset.action === 'edit') {
            editStudent(studentId);
        }

        if (button.dataset.action === 'fines') {
            openStudentFines(studentId);
        }

        if (button.dataset.action === 'delete') {
            deleteStudent(studentId);
        }
    });



    refreshBtn.addEventListener('click', loadStudents);



    loadStudents();
});
