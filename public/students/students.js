document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/students';

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

    let students = [];
    let editingStudentId = null;
    let messageTimeout;
    let pendingDeleteStudentId = null;

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

    function openDeleteModal(student) {
        if (!deleteModal) {
            showMessage('Delete confirmation modal is missing from the page.', 'error');
            return;
        }

        pendingDeleteStudentId = Number(student.student_id);
        deleteModalTitle.textContent = 'Delete Student?';
        deleteModalMessage.textContent = `Are you sure you want to delete ${student.student_name} (${student.student_number})?`;

        confirmDeleteBtn.hidden = false;
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Delete Student';

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
    }

    function showLinkedRecordsMessage() {
        deleteModalTitle.textContent = 'Student Has Library Records';
        deleteModalMessage.textContent = 'This student cannot be permanently deleted because the account is connected to library records, such as borrower registration, borrowing transactions, or fines. Keeping this record protects the library history.';
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
        if (event.key === 'Escape' && deleteModal?.classList.contains('show')) {
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
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Register Student';
    }

    showRegisterBtn.addEventListener('click', () => {
        editingStudentId = null;
        registerForm.reset();
        formTitle.textContent = 'Register New Student';
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Register Student';
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
                throw new Error(result.message || 'Failed to load students.');
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
        studentCount.textContent = `${list.length} student${list.length === 1 ? '' : 's'}`;

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
        submitBtn.textContent = isEditing ? 'Saving Changes...' : 'Registering...';

        try {
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(student)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Unable to save student.');
            }

            closeForm();
            showMessage(
                result.message || (isEditing ? 'Student information updated successfully.' : 'Student registered successfully.'),
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
        const student = students.find(item => Number(item.student_id) === Number(studentId));
        if (!student) {
            showMessage('Student record not found.', 'error');
            return;
        }

        editingStudentId = Number(studentId);
        document.getElementById('studentNumber').value = student.student_number || '';
        document.getElementById('studentName').value = student.student_name || '';
        document.getElementById('email').value = student.email || '';
        document.getElementById('course').value = student.course || '';
        document.getElementById('yearLevel').value = student.year_level || '';
        document.getElementById('contactNumber').value = student.contact_number || '';

        formTitle.textContent = 'Edit Student Information';
        submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
        openForm();
    }

    async function deleteStudent(studentId) {
        const student = students.find(item => Number(item.student_id) === Number(studentId));
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
                const message = result.message || 'Unable to delete student.';
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
            showMessage(result.message || 'Student deleted successfully.', 'success');
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

    confirmDeleteBtn?.addEventListener('click', confirmDeleteStudent);

    tableBody.addEventListener('click', event => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const studentId = Number(button.dataset.id);
        if (button.dataset.action === 'edit') {
            editStudent(studentId);
        }
        if (button.dataset.action === 'delete') {
            deleteStudent(studentId);
        }
    });

    refreshBtn.addEventListener('click', loadStudents);

    loadStudents();
});