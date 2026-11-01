document.addEventListener('DOMContentLoaded', () => {
    const studentSelect = document.getElementById('studentSelect');
    const bookSelect = document.getElementById('bookSelect');
    const issueForm = document.getElementById('issueForm');
    const issueBtn = document.getElementById('issueBtn');
    const messageBox = document.getElementById('messageBox');

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    document.getElementById('themeToggleBtn').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        localStorage.setItem(
            'theme',
            document.body.classList.contains('dark-mode') ? 'dark' : 'light'
        );
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '../login/login.html';
    });

    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
        messageBox.hidden = false;
    }

    async function loadStudents() {
        try {
            const response = await fetch('/api/borrowers');
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error('Failed to load registered students.');
            }

            studentSelect.innerHTML =
                '<option value="">Choose a student</option>';

            result.data.forEach(student => {
                const option = document.createElement('option');

                option.value = student.student_id;
                option.textContent =
                    `${student.student_name} (ID: ${student.student_id})`;

                studentSelect.appendChild(option);
            });

        } catch (error) {
            studentSelect.innerHTML =
                '<option value="">Unable to load students</option>';

            showMessage(error.message, 'error');
        }
    }

    async function loadBooks() {
        try {
            const response = await fetch('/api/books');
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error('Failed to load books.');
            }

            bookSelect.innerHTML =
                '<option value="">Choose a book</option>';

            result.data.forEach(book => {
                const option = document.createElement('option');

                option.value = book.book_id;

                option.textContent =
                    `${book.book_title} (${book.available_copies} available)`;

                if (Number(book.available_copies) <= 0) {
                    option.disabled = true;
                }

                bookSelect.appendChild(option);
            });

        } catch (error) {
            bookSelect.innerHTML =
                '<option value="">Unable to load books</option>';

            showMessage(error.message, 'error');
        }
    }

    issueForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const studentId = studentSelect.value;
        const bookId = bookSelect.value;
        const dueDate = document.getElementById('dueDate').value;

        if (!studentId || !bookId || !dueDate) {
            showMessage('Please complete all fields.', 'error');
            return;
        }

        issueBtn.disabled = true;
        issueBtn.textContent = 'Processing...';

        try {
            const response = await fetch('/api/borrows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    student_id: Number(studentId),
                    book_id: Number(bookId),
                    due_date: dueDate
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to issue book.');
            }

            showMessage(
                `Book issued successfully! Borrow ID: ${result.borrow_id}`,
                'success'
            );

            issueForm.reset();
            await loadBooks();

        } catch (error) {
            showMessage(error.message, 'error');

        } finally {
            issueBtn.disabled = false;
            issueBtn.innerHTML =
                '<i class="fas fa-check-circle"></i> Issue Book';
        }
    });

    loadStudents();
    loadBooks();
});
