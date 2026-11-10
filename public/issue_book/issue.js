
document.addEventListener('DOMContentLoaded', () => {
    const studentSelect = document.getElementById('studentSelect');
    const bookSelect = document.getElementById('bookSelect');
    const issueForm = document.getElementById('issueForm');
    const issueBtn = document.getElementById('issueBtn');
    const messageBox = document.getElementById('messageBox');


    const themeToggleBtn = document.getElementById('themeToggleBtn');

    function applyTheme() {
        const isDarkMode = localStorage.getItem('theme') === 'dark';

        document.body.classList.toggle('dark-mode', isDarkMode);

        if (themeToggleBtn) {
            themeToggleBtn.textContent = isDarkMode ? 'On' : 'Off';
        }
    }

    applyTheme();

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDarkMode = document.body.classList.contains('dark-mode');

            localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
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


    function showMessage(message, type) {
        if (!messageBox) return;

        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
        messageBox.hidden = false;
    }


    function formatDate(dateValue) {
        if (!dateValue) return 'Not available';

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return 'Not available';
        }

        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Manila'
        });
    }


    async function loadStudents() {
        try {
            studentSelect.innerHTML =
                '<option value="">Loading students...</option>';

            const response = await fetch('/api/borrowers');
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Failed to load registered students.'
                );
            }

            const students = Array.isArray(result.data) ? result.data : [];

            studentSelect.innerHTML =
                '<option value="">Choose a student</option>';

            students.forEach(student => {
                const option = document.createElement('option');

                option.value = student.student_id;
                option.textContent =
                    `${student.student_name} (ID: ${student.student_id})`;

                studentSelect.appendChild(option);
            });

            if (students.length === 0) {
                studentSelect.innerHTML =
                    '<option value="">No registered borrowers found</option>';
            }

        } catch (error) {
            console.error('Student loading error:', error);

            studentSelect.innerHTML =
                '<option value="">Unable to load students</option>';

            showMessage(error.message, 'error');
        }
    }


    async function loadBooks() {
        try {
            bookSelect.innerHTML =
                '<option value="">Loading books...</option>';

            const response = await fetch('/api/books');
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Failed to load books.'
                );
            }

            const books = Array.isArray(result.data) ? result.data : [];

            bookSelect.innerHTML =
                '<option value="">Choose a book</option>';

            books.forEach(book => {
                const option = document.createElement('option');

                option.value = book.book_id;

                option.textContent =
                    `${book.title} (${book.available_copies} available)`;

                if (Number(book.available_copies) <= 0) {
                    option.disabled = true;
                    option.textContent =
                        `${book.title} (Unavailable)`;
                }

                bookSelect.appendChild(option);
            });

            if (books.length === 0) {
                bookSelect.innerHTML =
                    '<option value="">No books found</option>';
            }

        } catch (error) {
            console.error('Book loading error:', error);

            bookSelect.innerHTML =
                '<option value="">Unable to load books</option>';

            showMessage(error.message, 'error');
        }
    }


    if (issueForm) {
        issueForm.addEventListener('submit', async event => {
            event.preventDefault();

            messageBox.hidden = true;

            const studentId = studentSelect.value;
            const bookId = bookSelect.value;

            if (!studentId || !bookId) {
                showMessage(
                    'Please select a student and a book.',
                    'error'
                );
                return;
            }

            issueBtn.disabled = true;
            issueBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i> Processing...';

            try {
                const response = await fetch('/api/borrows', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        student_id: Number(studentId),
                        book_id: Number(bookId)
                    })
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || 'Failed to issue book.'
                    );
                }

                showMessage(
                    `Book issued successfully! Borrow ID: ${result.borrow_id}. Due date: ${formatDate(result.due_date)}.`,
                    'success'
                );

                issueForm.reset();

                await loadBooks();

            } catch (error) {
                console.error('Issue book error:', error);
                showMessage(error.message, 'error');

            } finally {
                issueBtn.disabled = false;
                issueBtn.innerHTML =
                    '<i class="fas fa-check-circle"></i> Issue Book';
            }
        });
    }


    loadStudents();
    loadBooks();
});
