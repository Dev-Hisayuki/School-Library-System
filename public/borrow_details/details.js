document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const borrowIdInput = document.getElementById('borrowId');
    const searchBtn = document.getElementById('searchBtn');
    const detailsCard = document.getElementById('detailsCard');
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

    function showMessage(message) {
        messageBox.textContent = message;
        messageBox.className = 'message-box error';
        messageBox.hidden = false;
    }

    function formatDate(dateValue) {
        if (!dateValue) {
            return 'Not yet returned';
        }

        const date = new Date(dateValue);

        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Manila'
        });
    }

    function displayDetails(borrow) {
        document.getElementById('borrowNumber').textContent =
            `Borrow ID: ${borrow.borrow_id}`;

        document.getElementById('studentName').textContent =
            borrow.student_name;

        document.getElementById('studentId').textContent =
            borrow.student_id;

        document.getElementById('bookTitle').textContent =
            borrow.book_title;

        document.getElementById('bookId').textContent =
            borrow.book_id;

        document.getElementById('borrowDate').textContent =
            formatDate(borrow.borrow_date);

        document.getElementById('dueDate').textContent =
            formatDate(borrow.due_date);

        document.getElementById('returnDate').textContent =
            formatDate(borrow.return_date);

        const statusBadge = document.getElementById('statusBadge');

        statusBadge.textContent = borrow.status;
        statusBadge.className = 'status-badge';

        if (borrow.status === 'Borrowed') {
            statusBadge.classList.add('borrowed');
        } else if (borrow.status === 'Returned') {
            statusBadge.classList.add('returned');
        }

        detailsCard.hidden = false;
    }

    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const borrowId = borrowIdInput.value.trim();

        if (!borrowId || !Number.isInteger(Number(borrowId)) ||
            Number(borrowId) < 1) {
            showMessage('Please enter a valid Borrow ID.');
            return;
        }

        searchBtn.disabled = true;
        searchBtn.textContent = 'Searching...';

        detailsCard.hidden = true;
        messageBox.hidden = true;

        try {
            const response = await fetch(
                `/api/borrows/${encodeURIComponent(borrowId)}`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Borrow record not found.'
                );
            }

            displayDetails(result.data);

        } catch (error) {
            showMessage(error.message);

        } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML =
                '<i class="fas fa-search"></i> Search Borrow';
        }
    });
});
