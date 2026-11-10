document.addEventListener('DOMContentLoaded', () => {

    const API_URL = `${window.location.origin}/api/borrowers`;
    const STUDENTS_API_URL = `${window.location.origin}/api/students`;


    const tableBody = document.getElementById('borrowerTableBody');
    const registerForm = document.getElementById('registerForm');
    const registerCard = document.getElementById('registerCard');
    const messageBox = document.getElementById('messageBox');
    const searchInput = document.getElementById('searchInput');
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudentDetails = document.getElementById('selectedStudentDetails');

    const selectedStudentId = document.getElementById('selectedStudentId');
    const selectedStudentNumber = document.getElementById('selectedStudentNumber');
    const selectedStudentName = document.getElementById('selectedStudentName');
    const selectedStudentCourse = document.getElementById('selectedStudentCourse');
    const selectedStudentYear = document.getElementById('selectedStudentYear');

    const registerSubmitBtn = document.getElementById('registerSubmitBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const refreshBtn = document.getElementById('refreshBtn');

    let borrowers = [];
    let students = [];


    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[character]);
    }


    async function fetchJSON(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Accept': 'application/json',
                ...(options.headers || {})
            }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || `Request failed (${response.status})`
            );
        }

        return result;
    }


    function applyTheme() {
        const isDark = localStorage.getItem('theme') === 'dark';

        document.body.classList.toggle('dark-mode', isDark);

        if (themeToggleBtn) {
            themeToggleBtn.textContent = isDark ? 'On' : 'Off';
        }
    }

    applyTheme();

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');

            localStorage.setItem(
                'theme',
                isDark ? 'light' : 'dark'
            );

            applyTheme();
        });
    }


    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = '../login/login.html';
        });
    }


    function showMessage(message, type = 'success') {
        if (!messageBox) return;

        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
    }

    function clearMessage() {
        if (!messageBox) return;

        messageBox.textContent = '';
        messageBox.className = 'message-box';
    }


    async function loadStudents() {
        studentSelect.innerHTML = `
            <option value="">Loading students...</option>
        `;

        studentSelect.disabled = true;

        try {
            const result = await fetchJSON(STUDENTS_API_URL);

            students = Array.isArray(result.data)
                ? result.data
                : [];

            populateStudentSelect();

        } catch (error) {
            console.error('Failed to load students:', error);

            students = [];

            studentSelect.innerHTML = `
                <option value="">Unable to load students</option>
            `;

            showMessage(
                `Unable to load students: ${error.message}`,
                'error'
            );

        } finally {
            studentSelect.disabled = false;
        }
    }


    function populateStudentSelect() {
        const availableStudents = students.filter(student =>
            Number(student.is_borrower) === 0
        );

        if (availableStudents.length === 0) {
            studentSelect.innerHTML = `
                <option value="">No unregistered students available</option>
            `;

            studentSelect.disabled = true;
            selectedStudentDetails.hidden = true;

            return;
        }

        studentSelect.innerHTML = `
            <option value="">Choose a student</option>

            ${availableStudents.map(student => `
                <option value="${escapeHTML(student.student_id)}">
                    ID: ${escapeHTML(student.student_id)}
                    | ${escapeHTML(student.student_number)}
                    | ${escapeHTML(student.student_name)}
                </option>
            `).join('')}
        `;

        studentSelect.disabled = false;
    }


    function displaySelectedStudent() {
        const studentId = studentSelect.value;

        const student = students.find(
            item => String(item.student_id) === String(studentId)
        );

        if (!student) {
            selectedStudentDetails.hidden = true;
            return;
        }

        selectedStudentId.textContent = student.student_id;
        selectedStudentNumber.textContent = student.student_number || '—';
        selectedStudentName.textContent = student.student_name || '—';
        selectedStudentCourse.textContent = student.course || '—';
        selectedStudentYear.textContent = student.year_level || '—';

        selectedStudentDetails.hidden = false;
    }

    studentSelect.addEventListener('change', displaySelectedStudent);


    async function loadBorrowers() {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">Loading borrowers...</td>
            </tr>
        `;

        if (refreshBtn) {
            refreshBtn.disabled = true;
        }

        try {
            const result = await fetchJSON(API_URL);

            borrowers = Array.isArray(result.data)
                ? result.data
                : [];

            displayBorrowers(borrowers);

        } catch (error) {
            console.error('Failed to load borrowers:', error);

            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">Unable to load borrowers.</td>
                </tr>
            `;

            showMessage(error.message, 'error');

        } finally {
            if (refreshBtn) {
                refreshBtn.disabled = false;
            }
        }
    }


    function displayBorrowers(list) {
        if (!list.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">No borrowers found.</td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML = list.map(borrower => `
            <tr>
                <td>${escapeHTML(borrower.borrower_id)}</td>
                <td>${escapeHTML(borrower.student_id)}</td>
                <td>${escapeHTML(borrower.student_number || '—')}</td>
                <td>${escapeHTML(borrower.student_name)}</td>
            </tr>
        `).join('');
    }


    document.getElementById('showRegisterBtn').addEventListener('click', async () => {
        clearMessage();

        registerCard.hidden = false;

        await loadStudents();

        studentSelect.focus();
    });


    document.getElementById('cancelRegisterBtn').addEventListener('click', () => {
        registerCard.hidden = true;
        registerForm.reset();
        selectedStudentDetails.hidden = true;
        clearMessage();
    });


    registerForm.addEventListener('submit', async event => {
        event.preventDefault();

        const studentId = studentSelect.value;

        if (!studentId) {
            showMessage('Please select a student first.', 'error');
            return;
        }

        const selectedStudent = students.find(
            student => String(student.student_id) === String(studentId)
        );

        if (!selectedStudent) {
            showMessage('Selected student could not be found.', 'error');
            return;
        }

        registerSubmitBtn.disabled = true;
        registerSubmitBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Registering...
        `;

        try {
            await fetchJSON(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    student_id: Number(studentId)
                })
            });

            showMessage(
                `${selectedStudent.student_name} was successfully registered as a borrower.`,
                'success'
            );

            registerForm.reset();
            registerCard.hidden = true;
            selectedStudentDetails.hidden = true;

            await Promise.all([
                loadBorrowers(),
                loadStudents()
            ]);

        } catch (error) {
            console.error('Borrower registration failed:', error);

            showMessage(error.message, 'error');

        } finally {
            registerSubmitBtn.disabled = false;

            registerSubmitBtn.innerHTML = `
                <i class="fa-solid fa-user-plus"></i>
                Register Borrower
            `;
        }
    });


    searchInput.addEventListener('input', () => {
        const search = searchInput.value.trim().toLowerCase();

        const filtered = borrowers.filter(borrower => {
            const values = [
                borrower.borrower_id,
                borrower.student_id,
                borrower.student_number,
                borrower.student_name
            ];

            return values.some(value =>
                String(value ?? '').toLowerCase().includes(search)
            );
        });

        displayBorrowers(filtered);
    });


    refreshBtn.addEventListener('click', async () => {
        clearMessage();

        await Promise.all([
            loadBorrowers(),
            loadStudents()
        ]);
    });


    loadBorrowers();
});